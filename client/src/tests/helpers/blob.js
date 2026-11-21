// Reads a Blob's text whatever realm made it. Depending on the Node version, fetch() in these
// jsdom tests returns either Node's Blob (has .text()) or jsdom's Blob (no .text(), but FileReader
// works), so neither `instanceof Blob` nor `blob.text()` holds on every Node version.
export function readBlobText(blob) {
  if (typeof blob.text === 'function') return blob.text();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });
}
