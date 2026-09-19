/**
 * Utility to export tabular data to CSV with UTF-8 BOM (\uFEFF)
 * Ensures Kurdish Sorani characters (ڕ, ڵ, ێ, ۆ, هـ) render properly in Microsoft Excel
 */
export function exportToCsv(
  filename: string,
  headers: string[],
  rows: (string | number | null | undefined)[][]
): void {
  // Format each cell with quotes and escape internal quotes
  const formatCell = (val: string | number | null | undefined): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headerLine = headers.map(formatCell).join(",");
  const rowLines = rows.map((r) => r.map(formatCell).join(","));
  
  // Prepend UTF-8 BOM (\uFEFF)
  const csvContent = "\uFEFF" + [headerLine, ...rowLines].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

