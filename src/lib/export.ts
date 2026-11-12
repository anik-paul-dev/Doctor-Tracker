/**
 * Helper to download structured tabular data as a clean CSV file
 */
export function exportToCsv<T extends Record<string, unknown>>(
  filename: string,
  data: T[],
  headers?: { key: keyof T; label: string }[]
) {
  if (!data || data.length === 0) return;

  const resolvedHeaders =
    headers ||
    (Object.keys(data[0]) as (keyof T)[]).map((key) => ({
      key,
      label: String(key),
    }));

  const escapeCsv = (val: unknown): string => {
    if (val === null || val === undefined) return "";
    const str = String(val).replace(/"/g, '""');
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str}"`;
    }
    return str;
  };

  const headerRow = resolvedHeaders.map((h) => escapeCsv(h.label)).join(",");
  const dataRows = data.map((row) =>
    resolvedHeaders.map((h) => escapeCsv(row[h.key])).join(",")
  );

  const csvContent = "\uFEFF" + [headerRow, ...dataRows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

