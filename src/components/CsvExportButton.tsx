"use client";

import { Download } from "lucide-react";

interface Props {
  filename: string;
  headers: string[];
  rows: (string | number | null | undefined)[][];
}

function escapeCell(v: string | number | null | undefined): string {
  if (v == null) return "";
  const s = String(v);
  if (s.includes(",") || s.includes("\"") || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function CsvExportButton({ filename, headers, rows }: Props) {
  function onClick() {
    const lines = [headers.map(escapeCell).join(",")];
    for (const r of rows) lines.push(r.map(escapeCell).join(","));
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  return (
    <button
      onClick={onClick}
      className="text-xs font-medium text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
    >
      <Download className="w-3.5 h-3.5" /> Export CSV
    </button>
  );
}
