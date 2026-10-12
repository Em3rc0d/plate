// PlacaClara social editorial preflight: zero dependencies; read-only; NOT publish authority.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

export function shapeCheck(schema,doc,path="$") {
 const errors=[];
 if(schema.const!==undefined && doc!==schema.const)errors.push(`${path}: const mismatch`);
 if(Array.isArray(schema.enum)&&!schema.enum.some(v=>v===doc))errors.push(`${path}: invalid enum`);
 if(schema.type){
   const t=doc===null?"null":Array.isArray(doc)?"array":typeof doc;
   if(!(Array.isArray(schema.type)?schema.type:[schema.type]).includes(t)) return [`${path}: expected ${schema.type}, got ${t}`];
 }
 if(typeof doc==="string" && schema.minLength!=null && doc.length<schema.minLength)errors.push(`${path}: too short`);
 if(Array.isArray(doc)){
   if(schema.minItems!=null&&doc.length<schema.minItems)errors.push(`${path}: not enough items`);
   if(schema.uniqueItems&&new Set(doc.map(x=>JSON.stringify(x))).size!==doc.length)errors.push(`${path}: duplicate items`);
   if(schema.items)doc.forEach((v,i)=>errors.push(...shapeCheck(schema.items,v,`${path}[${i}]`)));
 }
 if(doc!==null && typeof doc==="object" && !Array.isArray(doc)){
   for(const k of schema.required||[]) if(!(k in doc))errors.push(`${path}.${k}: missing`);
   if(schema.additionalProperties===false)for(const k of Object.keys(doc))if(!(k in (schema.properties||{})))errors.push(`${path}.${k}: unsupported field`);
   for(const [k,s] of Object.entries(schema.properties||{}))if(k in doc)errors.push(...shapeCheck(s,doc[k],`${path}.${k}`));
 }
 return errors;
}

export function validateSocialPackage(doc,policy,schema,now=new Date()){
 const errors=shapeCheck(schema,doc);
 if(errors.length) return {status:"BLOCKED",errors,warnings:["Shape invalid: semantic checks skipped."]};
 const fail=(message)=>errors.push(message);
 const has=(v)=>typeof v==="string"&&v.trim().length>0;
 const utc=(v)=>has(v)&&!Number.isNaN(Date.parse(v))&&/(?:Z|[+-]\d{2}:\d{2})$/.test(v);
 const needs=(gate)=>{if(doc.gates[gate]!=="PASS")fail(`Gate ${gate} is not PASS`);};
 const role=policy.roles[doc.objective];
 if(!role)fail("Unrecognized objective");
 else{
  if(!role.primary_actions.includes(doc.editorial.primary_action))fail("Primary action does not match the objective");
  if(!role.primary_metrics.includes(doc.measurement.primary_metric))fail("Primary metric does not match objective");
 }
 const platform=policy.platforms[doc.platform];
 if(!platform?.allowed_formats.includes(doc.creative.format))fail("Media format unsupported for this platform");
 if(doc.creative.mark_ref!==null&&doc.creative.mark_ref!==policy.canonical_mark)fail("Unexpected brand mark reference");
 if(!Array.isArray(doc.claims)||!doc.claims.length)fail("Missing claim register");
 const allCopy=[doc.copy.hook,doc.copy.subhook,doc.copy.caption,doc.copy.cta,doc.copy.alt_text,...doc.copy.visual_text].join("\n");
 const priceMentions=[...allCopy.matchAll(/S\/\s*(\d+(?:[.,]\d{1,2})?)/gi)].map(x=>Number(x[1].replace(",",".")));
 const declaredCategories=new Set(doc.claims.map(c=>c.category));
 const requiresSnapshot=doc.objective==="COVERAGE_INTENT"||doc.objective==="PURCHASE_INTENT"||
  doc.claims.some(c=>policy.claims.require_current_snapshot_for.includes(c.category))||priceMentions.length>0;
 for(const claim of doc.claims){
   if(!has(claim.claim_id)||!has(claim.text)||!claim.evidence_refs.every(has)||!claim.evidence_refs.length)fail(`Claim ${claim.claim_id}: missing verifiable evidence refs`);
   if(claim.verified_at!==null&&!/^\d{4}-\d{2}-\d{2}$/.test(claim.verified_at))fail(`Claim ${claim.claim_id}: bad verification date`);
   if(policy.claims.restricted_categories.includes(claim.category)&&
     !["OFFICIAL","OBSERVED"].includes(claim.provenance))fail(`Claim ${claim.claim_id}: restricted claims require OFFICIAL or OBSERVED evidence`);
   if(claim.capability_code!==null){
     if(!policy.claims.capabilities.includes(claim.capability_code))fail(`Claim ${claim.claim_id}: unrecognized capability`);
     if(!doc.product_snapshot.enabled_capabilities.includes(claim.capability_code))fail(`Claim ${claim.claim_id}: capability not enabled in verified snapshot`);
   }
   if(claim.category==="COVERAGE"&&!has(claim.capability_code))fail(`Claim ${claim.claim_id}: explicit capability code required`);
   if(claim.category==="PRICE" && !(typeof doc.product_snapshot.price_pen==="number"))fail("Price claim without snapshot price");
 }
 if(priceMentions.length){
   if(!declaredCategories.has("PRICE"))fail("Copy mentions PEN price without a PRICE claim");
   if(doc.product_snapshot.price_pen===null||!priceMentions.every(p=>Math.abs(p-doc.product_snapshot.price_pen)<0.001))fail("Price in copy does not match active deployment snapshot");
 }
 if(requiresSnapshot){
   const snap=doc.product_snapshot;
   if(!snap.live_deployment_verified || !has(snap.evidence_ref) || !utc(snap.captured_at))fail("Current product snapshot missing, non-live or lacks source proof");
   else {
     const ageMs=new Date(now).getTime()-Date.parse(snap.captured_at);
     if(ageMs< -5*60000||ageMs>24*3600000)fail("Product snapshot is outside the 24-hour freshness window");
   }
 }
 if(doc.objective==="PURCHASE_INTENT" && doc.product_snapshot.commercial_ready!==true)fail("Purchase-intent campaign requires verified commercial readiness");
 if(doc.objective==="COVERAGE_INTENT" && doc.product_snapshot.enabled_capabilities.length===0)fail("Coverage-intent campaign requires verified enabled coverage");
 for(const gate of ["factual","product_claims","price","novelty","design","safe_zone","legal"])needs(gate);
 if(doc.novelty.status!=="PASS")fail("Novelty unresolved");
 if(doc.novelty.checked_dimensions.length!==policy.novelty.dimensions.length ||
   !policy.novelty.dimensions.every(d=>doc.novelty.checked_dimensions.includes(d)))fail("Novelty comparison dimensions incomplete");
 for(const k of ["published_ref","scheduled_ref","planned_ref","approved_ref","review_ref"])
   if(!has(doc.novelty[k]))fail(`Novelty ${k} evidence missing (empty inventories need signed receipts)`);
 const creative=doc.creative;
 if(creative.visual_scope!=="REVIEWED"||!has(creative.asset_ref)||!has(creative.sha256)||!/^[a-f0-9]{64}$/i.test(creative.sha256||""))fail("Exact rendered asset and SHA-256 required for human review");
 for(const k of ["safe_zone_review_ref","phone_review_ref","design_approval_ref","rights_review_ref"])
   if(!has(creative[k]))fail(`Creative ${k} review receipt missing`);
 if(doc.release.status==="DRAFT")fail("DRAFT is not a review-ready state");
 if(doc.release.status!=="DRAFT"&&doc.release.status!=="READY_FOR_HUMAN_REVIEW"){
   needs("owner");
   if(!has(doc.release.owner_receipt))fail("Owner signoff receipt missing");
 }
 if(["SCHEDULED","PUBLISHED"].includes(doc.release.status)){
   if(!has(doc.release.provider_receipt)||!utc(doc.release.scheduled_at))fail("External scheduled/published status has no provider receipt and time");
   if(doc.release.status==="PUBLISHED"&&!has(doc.release.published_url))fail("Published status needs a real URL");
   fail("External status requires provider reconciliation outside this editorial preflight");
 } else if(doc.release.provider_receipt||doc.release.scheduled_at||doc.release.published_url){
   fail("Draft or review package cannot claim provider side effects");
 }
 if(doc.measurement.attribution==="VERIFIED_JOIN"&&!has(doc.measurement.external_receipt))fail("Verified attribution requires reconciled provider/site evidence");
 const warnings=[
  "Structural/declared-gates checks only: no independent external provider, price, source, historic novelty or design verification.",
  "Never treat this preflight as permission to schedule, publish, charge or query a paid vehicle provider.",
  "Free-text claims, brand mark pixels, fake social proof and real mobile overlay require human examination."
 ];
 return {status:errors.length?"BLOCKED":"STRUCTURALLY_READY_FOR_HUMAN_REVIEW",errors,warnings};
}

const contractUrl = new URL("./EDITORIAL_CONTRACT.v1.json", import.meta.url);
const schemaUrl = new URL("./CONTENT_PACKAGE.v1.schema.json", import.meta.url);
export const policy = JSON.parse(readFileSync(contractUrl,"utf8"));
export const packageSchema = JSON.parse(readFileSync(schemaUrl,"utf8"));

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const pathname = process.argv[2];
  if (!pathname) {console.error("Usage: node docs/social/preflight.mjs <content-package.json>");process.exitCode=2;}
  else {
    try {
      const record=JSON.parse(readFileSync(resolve(pathname),"utf8"));
      const result=validateSocialPackage(record,policy,packageSchema,new Date());
      console.log(JSON.stringify(result,null,2));
      if(result.status==="BLOCKED")process.exitCode=1;
    } catch(e) {console.error("BLOCKED: "+String(e));process.exitCode=2;}
  }
}
