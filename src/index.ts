import * as png from "@cf-wasm/png";
import { PDFiumLibrary } from "@hyzyla/pdfium";
// import pdfiumWasm from "@hyzyla/pdfium/dist/pdfium.wasm";
import { shimEmscriptenEnv } from "./shim-emscripten-env";

export interface Env {
  R2: R2Bucket;
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/pdfium.wasm") {
      const asset = await env.ASSETS.fetch(request);
      if (asset) return asset;
      return new Response("Not found", { status: 404 });
    }

    const fixedPdfKey = "example.pdf";

    shimEmscriptenEnv();

    // 1. Retrieve PDF from R2
    const obj = await env.R2.get(fixedPdfKey);
    if (!obj) {
      return new Response("PDF not found", { status: 404 });
    }
    const pdfBytes = new Uint8Array(await obj.arrayBuffer());
    console.log("got pdf", pdfBytes.length);

    // 2. Initialize PDFium
    const wasmUrl = new URL("/pdfium.wasm", request.url).toString();

    const library = await PDFiumLibrary.init({
      // wasmBinary: pdfiumWasm // fails
      wasmUrl // fails
    });
    const document = await library.loadDocument(pdfBytes);

    // const results: { page: number; key: string }[] = [];
    // let idx = 0;

    // // 3. Render each page to raw RGBA bitmap
    // for (const page of document.pages()) {
    //   const image = await page.render({
    //     scale: 1,            // 72 DPI; adjust for higher resolution
    //     render: "bitmap"
    //   });

    //   // 4. Encode to PNG
    //   const pngBytes = png.encode(
    //     image.data,          // Uint8Array of RGBA pixels
    //     image.width,
    //     image.height
    //   );

    //   // 5. Write back to R2
    //   const outKey = `${fixedPdfKey}-${idx + 1}.png`;
    //   await env.R2.put(outKey, pngBytes, {
    //     httpMetadata: { contentType: "image/png" }
    //   });

    //   results.push({ page: idx + 1, key: outKey });
    //   idx++;
    // }

    // // 6. Clean up
    // document.destroy();
    // library.destroy();

    // Return list of generated keys
    // return new Response(JSON.stringify(results), {
    return new Response(JSON.stringify({}), {
      headers: { "Content-Type": "application/json" }
    });
  }
} satisfies ExportedHandler<Env>;
