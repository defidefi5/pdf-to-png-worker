import * as png from "@cf-wasm/png";
import { PDFiumLibrary } from "@hyzyla/pdfium";

export interface Env {
  R2: R2Bucket;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const bucket = env.R2;
    const fixedPdfKey = "example.pdf";

    // 1. Retrieve PDF from R2
    const obj = await bucket.get(fixedPdfKey);
    if (!obj) {
      return new Response("PDF not found", { status: 404 });
    }
    const pdfBytes = new Uint8Array(await obj.arrayBuffer());

    // 2. Initialize PDFium
    const library = await PDFiumLibrary.init();
    const document = await library.loadDocument(pdfBytes);

    const results: { page: number; key: string }[] = [];
    let idx = 0;

    // 3. Render each page to raw RGBA bitmap
    for (const page of document.pages()) {
      const image = await page.render({
        scale: 1,            // 72 DPI; adjust for higher resolution
        render: "bitmap"
      });

      // 4. Encode to PNG
      const pngBytes = png.encode(
        image.data,          // Uint8Array of RGBA pixels
        image.width,
        image.height
      );

      // 5. Write back to R2
      const outKey = `${fixedPdfKey}-${idx + 1}.png`;
      await bucket.put(outKey, pngBytes, {
        httpMetadata: { contentType: "image/png" }
      });

      results.push({ page: idx + 1, key: outKey });
      idx++;
    }

    // 6. Clean up
    document.destroy();
    library.destroy();

    // Return list of generated keys
    return new Response(JSON.stringify(results), {
      headers: { "Content-Type": "application/json" }
    });
  }
} satisfies ExportedHandler<Env>;
