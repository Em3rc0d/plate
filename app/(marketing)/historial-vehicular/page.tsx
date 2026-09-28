import {
  AcquisitionPage,
  metadataForAcquisitionPage,
} from "@/components/marketing/acquisition-page";
import { acquisitionPages } from "@/src/seo/acquisition-pages";

const page = acquisitionPages["historial-vehicular"];

export const metadata = metadataForAcquisitionPage(page);

export default function Page() {
  return <AcquisitionPage page={page} />;
}
