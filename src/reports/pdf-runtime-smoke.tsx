import "server-only";
import {
  Document,
  Page,
  Text,
  renderToBuffer,
} from "@react-pdf/renderer";

export async function renderPdfRuntimeSmoke() {
  return renderToBuffer(
    <Document>
      <Page size="A4">
        <Text>PlacaClara PDF runtime OK</Text>
      </Page>
    </Document>,
  );
}
