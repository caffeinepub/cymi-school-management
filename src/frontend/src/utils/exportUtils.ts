// ─── Export to Excel (CSV-based, no external deps) ───────────────────────────
// Uses a CSV approach that Excel can open natively.

function escapeCsvCell(val: unknown): string {
  const str = String(val ?? "");
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function rowsToCsv(headers: string[], rows: Record<string, unknown>[]): string {
  const lines: string[] = [headers.map(escapeCsvCell).join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => escapeCsvCell(row[h])).join(","));
  }
  return lines.join("\r\n");
}

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportToExcel(
  filename: string,
  sheets: { name: string; rows: Record<string, unknown>[] }[],
): void {
  // For multi-sheet, combine into one CSV with section headers
  const parts: string[] = [];
  for (const sheet of sheets) {
    if (sheets.length > 1) {
      parts.push(`=== ${sheet.name} ===`);
    }
    if (sheet.rows.length > 0) {
      const headers = Object.keys(sheet.rows[0]);
      parts.push(rowsToCsv(headers, sheet.rows));
    }
    parts.push("");
  }
  const csv = parts.join("\r\n");
  // BOM for Excel UTF-8 recognition
  const bom = "\uFEFF";
  downloadBlob(bom + csv, `${filename}.csv`, "text/csv;charset=utf-8;");
}

// ─── Export to PDF (browser print-based, no external deps) ───────────────────

export function exportToPDF(
  filename: string,
  title: string,
  columns: string[],
  rows: (string | number)[][],
  subtitle?: string,
): void {
  const headerCells = columns
    .map(
      (c) =>
        `<th style="background:#2563eb;color:#fff;padding:6px 8px;font-size:11px;font-weight:600;text-align:left;white-space:nowrap;">${c}</th>`,
    )
    .join("");

  const bodyRows = rows
    .map((row, i) => {
      const bg = i % 2 === 0 ? "#fff" : "#f8fafc";
      const cells = row
        .map(
          (cell) =>
            `<td style="padding:5px 8px;font-size:10px;color:#1e293b;border-bottom:1px solid #e2e8f0;background:${bg};">${cell}</td>`,
        )
        .join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>${title}</title>
  <style>
    @media print { @page { size: landscape; margin: 14mm; } }
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
    h1 { font-size: 18px; color: #1e293b; margin: 0 0 4px; }
    p { font-size: 11px; color: #64748b; margin: 0 0 16px; }
    table { border-collapse: collapse; width: 100%; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${subtitle ? `<p>${subtitle}</p>` : ""}
  <p>Generated: ${new Date().toLocaleString("en-IN", { dateStyle: "long", timeStyle: "short" })}</p>
  <table>
    <thead><tr>${headerCells}</tr></thead>
    <tbody>${bodyRows}</tbody>
  </table>
  <script>window.onload=function(){window.print();window.onafterprint=function(){window.close();};};<\/script>
</body>
</html>`;

  const win = window.open("", `_blank_${filename}`);
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}
