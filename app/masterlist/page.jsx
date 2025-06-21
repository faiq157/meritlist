'use client';

import { useEffect, useState } from 'react';
import { DataTable } from '../programs/[id]/data-table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
export default function MasterList() {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [meritList, setMeritList] = useState([]);
  const [loadingMerit, setLoadingMerit] = useState(false);
  const [search, setSearch] = useState("");

useEffect(() => {
  fetch('/api/masterlist/studentlist')
    .then(res => res.json())
    .then(rows => {
      setData(rows);
      if (rows.length > 0) {
        const keys = Object.keys(rows[0]);
        const hiddenColumns = ["selected_for_meritlist", "selected_program_shortname"];
        const filteredKeys = keys.filter(key =>
          !hiddenColumns.includes(key) &&
          rows.some(
            row =>
              row[key] !== null &&
              row[key] !== undefined &&
              row[key] !== '' &&
              row[key] !== '-'
          )
        );
        setColumns([
          ...filteredKeys.map(key => ({
            accessorKey: key,
            header: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          })),
          {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
              <Button
                className=" rounded text-xs"
                onClick={e => {
                  e.stopPropagation();
                  handleRowClick(row.original);
                }}
              >
               View Student status
              </Button>
            ),
          },
        ]);
      }
    });
}, []);

  // Handle row click
  const handleRowClick = (row) => {
    setSelectedStudent(row);
    setDialogOpen(true);
    setLoadingMerit(true);
    fetch(`/api/meritlist?cnic=${encodeURIComponent(row.cnic)}`)
      .then(res => res.json())
      .then(list => setMeritList(list))
      .finally(() => setLoadingMerit(false));
  };

  const filteredData = data.filter(row => {
  const q = search.toLowerCase();
  return (
    row.name?.toLowerCase().includes(q) ||
    row.cnic?.toLowerCase().includes(q) ||
    row.form_no?.toLowerCase().includes(q)
  );
});
  if (!data.length) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Master Student List</h2>
      <input
        type="text"
        placeholder="Search by Name, CNIC, or Form No"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="mb-4 px-3 py-2 border rounded w-full max-w-md"
      />
      <DataTable
        columns={columns}
        data={filteredData}
      />
      <Dialog  open={dialogOpen} onOpenChange={setDialogOpen}>
  <DialogContent className="" >
    <DialogHeader>
      <DialogTitle>
        Merit List Data for {selectedStudent?.name} ({selectedStudent?.cnic})
      </DialogTitle>
    </DialogHeader>
   <div className='max-h-[89vh] overflow-y-auto'>
  {meritList.map((row, idx) => (
    <div key={idx} className="border rounded shadow p-4 bg-white">
      {Object.keys(row)
        .filter(
          key =>
            key !== "selected_for_meritlist" &&
            key !== "selected_program_shortname" &&
            key !== "id" &&
            key !== "program_id" &&
            key !== "unlockseat" &&
            key !== "availed"
        )
        .map((key) => {
          const booleanFields = [
            "availed",
            "confirmed",
            "not_appeared",
            "lockseat",
            "selected_for_meritlist"
          ];
          let value = row[key];
          if (booleanFields.includes(key)) {
            value = value === 1 ? "Yes" : "No";
          }
          return (
            <div key={key} className="mb-1">
              <span className="font-semibold capitalize">{key.replace(/_/g, " ")}:</span>{" "}
              <span>{value}</span>
            </div>
          );
        })}
    </div>
  ))}
</div>
  </DialogContent>
</Dialog>
    </div>
  );
}