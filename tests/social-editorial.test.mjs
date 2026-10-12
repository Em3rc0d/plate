import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {validateSocialPackage,policy,packageSchema} from "../docs/social/preflight.mjs";
const fixture=JSON.parse(readFileSync(new URL("../docs/social/fixtures/DRAFT.example.json",import.meta.url),"utf8"));
const clone=(v)=>structuredClone(v);
const now="2026-10-12T19:25:00Z";
function ready(){
 const x=clone(fixture);
 x.release.status="READY_FOR_HUMAN_REVIEW";
 x.gates=Object.fromEntries(Object.keys(x.gates).map(k=>[k,k==="owner"?"PENDING":"PASS"]));
 x.novelty={status:"PASS",checked_dimensions:[...policy.novelty.dimensions],published_ref:"review-published",scheduled_ref:"review-scheduled",planned_ref:"review-planned",approved_ref:"review-approved",review_ref:"review-novelty"};
 x.creative={...x.creative,visual_scope:"REVIEWED",asset_ref:"test-artifact-not-a-real-post.png",sha256:"a".repeat(64),safe_zone_review_ref:"safe-proof",phone_review_ref:"phone-proof",design_approval_ref:"design-proof",rights_review_ref:"rights-proof"};
 return x;
}
function check(x){return validateSocialPackage(x,policy,packageSchema,now);}
test("synthetic default remains blocked",()=>assert.equal(check(fixture).status,"BLOCKED"));
test("well-formed declared review candidate passes structure only",()=>assert.equal(check(ready()).status,"STRUCTURALLY_READY_FOR_HUMAN_REVIEW"));
test("unknown extra field fails",()=>assert.equal(check({...ready(),unapproved:true}).status,"BLOCKED"));
test("wrong CTA job fails",()=>{const x=ready();x.editorial.primary_action="COMMENT_BAIT";assert.equal(check(x).status,"BLOCKED");});
test("wrong target metric fails",()=>{const x=ready();x.measurement.primary_metric="payment_approved";assert.equal(check(x).status,"BLOCKED");});
test("novelty cannot be skipped",()=>{const x=ready();x.novelty.status="REVIEW_REQUIRED";assert.equal(check(x).status,"BLOCKED");});
test("unauthorized brand mark fails",()=>{const x=ready();x.creative.mark_ref="fake-logo.png";assert.equal(check(x).status,"BLOCKED");});
test("publishing state does not confer provider authority",()=>{const x=ready();x.release.status="PUBLISHED";x.release.owner_receipt="owner-proof";x.gates.owner="PASS";assert.equal(check(x).status,"BLOCKED");});
test("unverified price mentioned in copy fails",()=>{const x=ready();x.copy.hook="Precio S/8.90";assert.equal(check(x).status,"BLOCKED");});
test("capability without enabled evidence fails",()=>{const x=ready();x.claims[0].category="COVERAGE";x.claims[0].capability_code="CITV";assert.equal(check(x).status,"BLOCKED");});
test("commercially unready purchase CTA fails",()=>{const x=ready();x.objective="PURCHASE_INTENT";x.editorial.primary_action="CHECK_COVERAGE";x.measurement.primary_metric="checkout_started";assert.equal(check(x).status,"BLOCKED");});
test("missing claim evidence fails",()=>{const x=ready();x.claims[0].evidence_refs=[];assert.equal(check(x).status,"BLOCKED");});
test("unsupported future media format fails",()=>{const x=ready();x.platform="instagram";x.creative.format="vertical_9_16";assert.equal(check(x).status,"BLOCKED");});
test("visual design approval separate from layout pass",()=>{const x=ready();x.creative.design_approval_ref=null;assert.equal(check(x).status,"BLOCKED");});
test("price mismatch to live verified snapshot fails",()=>{const x=ready();x.copy.hook="Precio S/8.90";x.claims.push({...x.claims[0],claim_id:"P1",text:"Precio",category:"PRICE"});x.product_snapshot={captured_at:now,evidence_ref:"real-runtime-snapshot-ref",price_pen:9.9,enabled_capabilities:["IDENTITY"],commercial_ready:true,launch_profile:"REGISTRY_LEAN",live_deployment_verified:true};assert.equal(check(x).status,"BLOCKED");});
