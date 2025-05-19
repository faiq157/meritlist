import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';

export const handleDownloadPDF = (meritList, version) => {
  const doc = new jsPDF();
  doc.text(`Merit List - ${version}`, 14, 10);

  const headers = ["Rank", "Name", "CNIC", "Merit", "Category", "Program Name", "Program Short Name", "Confirmed", "Lock Seat"];
  const rows = meritList.map((item) => [
    item.rank,
    item.name,
    item.cnic,
    item.merit,
    item.category,
    item.program_name,
    item.program_short_name,
    item.confirmed ? "Yes" : item.not_appeared ? "No" : "",
    item.lockseat ? "Locked" : "Unlocked",
  ]);

  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 20,
  });

  doc.save(`merit_list_v${version}.pdf`);
};

export const handleDownloadCSV = (meritList, version) => {
  const headers = ["Rank", "Name", "CNIC", "Merit", "Category", "Program Name", "Program Short Name", "Confirmed", "Lock Seat"];
  const rows = meritList.map(item => [
    item.rank,
    item.name,
    item.cnic,
    item.merit,
    item.category,
    item.program_name,
    item.program_short_name,
    item.confirmed ? "Yes" : item.not_appeared ? "No" : "",
    item.lockseat ? "Locked" : "Unlocked",
  ]);
  const csv = [headers.join(","), ...rows.map(r => r.map(v => `"${v}"`).join(","))].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `merit_list_v${version}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

export const ordinal = (n) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};
