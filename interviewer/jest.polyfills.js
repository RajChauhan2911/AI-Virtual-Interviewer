// Minimal polyfills for jsdom environment
if (typeof globalThis.File === 'undefined') {
  // @ts-ignore
  globalThis.File = class File extends Blob {
    name; lastModified;
    constructor(parts, name, opts = {}) {
      super(parts, opts);
      this.name = name || 'unknown';
      this.lastModified = opts.lastModified || Date.now();
    }
  };
}


