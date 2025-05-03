export function shimEmscriptenEnv() {
  // Convince Emscripten it is in a Worker.
  if (typeof globalThis.importScripts === "undefined") {
    globalThis.importScripts = () => {}; // no-op stub
  }
  // A few builds touch self.location.href
  if (typeof globalThis.location === "undefined") {
    // minimal dummy object that satisfies `.href` reads
    globalThis.location = { href: "cf://worker" } as unknown as Location;
  }
}
