try {
  if (typeof window !== 'undefined' && window.fetch) {
    const nativeFetch = window.fetch;
    Object.defineProperty(window, 'fetch', {
      value: nativeFetch,
      writable: true,
      configurable: true,
      enumerable: true
    });
  }
} catch (e) {
  // ignore
}
