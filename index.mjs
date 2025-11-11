/**
 * ESM entry point for lambda-api
 *
 * This file provides ESM compatibility by ensuring require() is available
 * for the CommonJS modules when bundled for ESM output.
 *
 * When bundlers like esbuild process this library for ESM output, this entry point
 * ensures that the CommonJS code can still use require() for built-in Node.js modules.
 */

// Ensure require is available in ESM context (for esbuild bundles)
import { createRequire } from 'module';
if (typeof globalThis.require === 'undefined') {
  globalThis.require = createRequire(import.meta.url);
}

// Import the CommonJS module
// Note: This dynamic import ensures require is set up before loading CommonJS code
const { default: api } = await import('./index.js');

export default api;
