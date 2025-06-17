import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
export const getSeatTypeFromShortName = (shortName) => {
  if (!shortName || typeof shortName !== "string") return "";
  const lastChar = shortName.trim().slice(-1).toUpperCase();
  if (lastChar === "O") return "Open Merit";
  if (lastChar === "R") return "Rational";
  if (lastChar === "S") return "Self Finance";
  return "";
};
export const handleDownloadPDF = (meritList, version) => {
  const doc = new jsPDF({
        orientation: 'landscape', // wider page
    unit: 'mm',
    format:'a4'
  });
  doc.text(`Merit List - ${version}`, 14, 10);

  const headers = [
    "Rank", "Name", "CNIC", "Merit","Matched Preference", "Category", "Program Name", "Program Short Name",
    "Confirmed", "Lock Seat", "Already Admitted"
  ];
  const rows = meritList.map((item) => [
    item.rank,
    item.name,
    item.cnic,
    item.merit,
    item.matched_preference,
    getSeatTypeFromShortName(item.program_short_name),
    item.program_name,
    item.program_short_name,
    item.confirmed ? "Yes" : item.not_appeared ? "No" : "",
    item.lockseat ? "Locked" : "Unlocked",
    item.alreadyAdmitted && item.alreadyAdmittedShortName && item.alreadyAdmittedShortName !== item.program_short_name
      ? `Yes (${item.alreadyAdmittedShortName})`
      : "No"
  ]);

  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 20,
  });

  doc.save(`merit_list_v${version}.pdf`);
};

export const handleDownloadCSV = (meritList, version) => {
  const headers = [
    "Rank", "Name", "CNIC", "Merit","Matched Preference", "Category", "Program Name", "Program Short Name",
    "Confirmed", "Lock Seat", "Already Admitted"
  ];
  const rows = meritList.map(item => [
    item.rank,
    item.name,
    item.cnic,
    item.merit,
    item.matched_preference,
    getSeatTypeFromShortName(item.program_short_name),
    item.program_name,
    item.program_short_name,
    item.confirmed ? "Yes" : item.not_appeared ? "No" : "",
    item.lockseat ? "Locked" : "Unlocked",
    item.alreadyAdmitted && item.alreadyAdmittedShortName && item.alreadyAdmittedShortName !== item.program_short_name
      ? `Yes (${item.alreadyAdmittedShortName})`
      : "No"
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
export const handleDownloadAllVersionsPDF = async (programId) => {
  const res = await fetch(`/api/meritlist/all?programId=${programId}`);
  if (!res.ok) {
    alert('Failed to fetch all merit lists.');
    return;
  }
  const allVersions = await res.json();

  const doc = new jsPDF(
    {
        orientation: 'landscape', 
    unit: 'mm',
    format:'a4'
  }
  );
  let first = true;

  for (const { version, meritList } of allVersions) {
    if (!first) doc.addPage();
    first = false;
   doc.text(`Merit List`, 14, 10);

    const headers = ["Rank", "Name", "CNIC", "Merit", "Matched Preference", "Category", "Program Name", "Program Short Name", "Confirmed", "Lock Seat"];
    const rows = meritList.map((item) => [
      item.rank,
      item.name,
      item.cnic,
      item.merit,
      item.matched_preference,
     getSeatTypeFromShortName(item.program_short_name),
      item.program_name,
      item.program_short_name,
      item.confirmed ? "Yes" : item.not_appeared ? "No" : "",
      item.lockseat ? "Locked" : "Unlocked",
      item.alreadyAdmitted && item.alreadyAdmittedShortName && item.alreadyAdmittedShortName !== item.program_short_name
      ? `Yes (${item.alreadyAdmittedShortName})`
      : "No"
    ]);

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 20,
    });
  }

  doc.save(`all_versions_merit_list_${programId}.pdf`);
};


export const handleDownloadAllVersionsCSV = async (programId) => {
  const res = await fetch(`/api/meritlist/all?programId=${programId}`);
  if (!res.ok) {
    alert('Failed to fetch all merit lists.');
    return;
  }
  const allVersions = await res.json();

  const headers = ["Version", "Rank", "Name", "CNIC", "Merit","Matched Preference", "Category", "Program Name", "Program Short Name", "Confirmed", "Lock Seat"];
  const rows = [];

  allVersions.forEach(({ version, meritList }) => {
    meritList.forEach(item => {
      rows.push([
        version,
        item.rank,
        item.name,
        item.cnic,
        item.merit,
        item.matched_preference,
        getSeatTypeFromShortName(item.program_short_name),
        item.program_name,
        item.program_short_name,
        item.confirmed ? "Yes" : item.not_appeared ? "No" : "",
        item.lockseat ? "Locked" : "Unlocked",
         item.alreadyAdmitted && item.alreadyAdmittedShortName && item.alreadyAdmittedShortName !== item.program_short_name
      ? `Yes (${item.alreadyAdmittedShortName})`
      : "No"
      ]);
    });
  });

  const csv = [headers.join(","), ...rows.map(r => r.map(v => `"${v}"`).join(","))].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `all_versions_merit_list_${programId}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

export const handleDownloadCancelledMeritListCSV = async (programId) => {
  const res = await fetch(`/api/meritlist/cancel?programId=${programId}`);
  if (!res.ok) {
    alert('Failed to fetch cancelled merit list.');
    return;
  }
  const data = await res.json();
  const headers = ["CNIC", "Program ID", "Program Short Name", "Cancelled At"];
  const rows = data.map(item => [
    item.cnic,
    item.program_id,
    item.program_short_name,
    item.cancelled_at,
  ]);
  const csv = [headers.join(","), ...rows.map(r => r.map(v => `"${v}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `cancelled_merit_list_${programId}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};