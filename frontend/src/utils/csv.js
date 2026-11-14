// Byte-order mark so spreadsheet apps (e.g. Excel) read Vietnamese text as UTF-8.
const UTF8_BOM = String.fromCharCode(0xfeff);

const cell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

/** Builds CSV text from a header row and data rows (arrays of values). */
export function toCsv(header, rows) {
  return UTF8_BOM + [header, ...rows].map((row) => row.map(cell).join(',')).join('\r\n');
}

/** Triggers a browser download of text content (used for CSV exports). */
export function downloadText(fileName, content, type = 'text/csv;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
