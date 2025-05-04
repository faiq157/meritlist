'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation'; // Import useSearchParams
import { Button } from '@/components/ui/button';
import { DataTable } from '../programs/[id]/data-table';
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable'; // Import autoTable

const columns = [
  { accessorKey: 'rank', header: 'Rank' },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'cnic', header: 'CNIC' },
  { accessorKey: 'merit', header: 'Merit' },
  { accessorKey: 'category', header: 'Category' },
  { accessorKey: 'program_name', header: 'Program Name' },
  { accessorKey: 'program_short_name', header: 'Program Short Name' },
];

export default function ShowMeritList() {
  const [meritList, setMeritList] = useState([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  const fetchMeritList = async () => {
    setLoading(true);
    try {
      const programId = searchParams.get('programId');
      const programShortName = searchParams.get('programShortName');

      console.log('Fetching merit list for:', { programId, programShortName });

      const queryParams = new URLSearchParams();
      if (programId) queryParams.append('programId', programId);
      if (programShortName) queryParams.append('programShortName', programShortName);

      const response = await fetch(`/api/meritlist?${queryParams.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch merit list');
      const data = await response.json();

      const mappedData = data.map((item) => ({
        ...item,
        category: item.category === 'open_merit' ? 'Open Merit' : 'Self Finance',
      }));

      setMeritList(mappedData);
    } catch (error) {
      console.error('Error fetching merit list:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    doc.text('Merit List', 14, 10);

    // Prepare table headers and rows
    const tableHeaders = columns.map((col) => col.header);
    const tableRows = meritList.map((item) => [
      item.rank,
      item.name,
      item.cnic,
      item.merit,
      item.category,
      item.program_name,
      item.program_short_name,
    ]);

    // Use autoTable to generate the table
    autoTable(doc, {
      head: [tableHeaders],
      body: tableRows,
      startY: 20, // Start the table below the title
    });

    doc.save('merit_list.pdf');
  };

  useEffect(() => {
    fetchMeritList();
  }, [searchParams]);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">Merit List</h1>

      {/* 🟢 Download PDF Button */}
      {meritList.length > 0 && (
        <Button className="mb-4" onClick={handleDownloadPDF}>
          Download as PDF
        </Button>
      )}

      {loading ? (
        <div>Loading...</div>
      ) : meritList.length > 0 ? (
        <DataTable columns={columns} data={meritList} />
      ) : (
        <div>No merit list found.</div>
      )}
    </div>
  );
}