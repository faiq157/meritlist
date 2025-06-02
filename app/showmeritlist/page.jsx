'use client';

import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '../programs/[id]/data-table';
import Loading from '../components/Loader';
import { columns } from './columns';
import { handleDownloadAllVersionsCSV, handleDownloadAllVersionsPDF, handleDownloadCSV, handleDownloadPDF, ordinal } from '../utils/utils';
import { confirmSeat, deleteVersion, fetchVersions, markAsNotAppeared, toggleLockSeat } from '../components/actions';
import { useMeritList } from '../hooks/useMeritList';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';

export default function ShowMeritList() {
  const searchParams = useSearchParams();
  const programId = searchParams.get('programId');
  const programShortName = searchParams.get('programShortName');

  const [searchTerm, setSearchTerm] = useState('');

  const {
    versions,
    selectedVersion,
    setSelectedVersion,
    meritList,
    setMeritList,
    loading,
  } = useMeritList(programId, programShortName); 

  const handleConfirm = (cnic) => {
    confirmSeat(cnic, programId, programShortName, setMeritList);
  };

  const handleNotAppeared = (cnic) => {
    markAsNotAppeared(cnic, programId, programShortName, setMeritList);
  };

  const handleLockSeat = (cnic, lock) => {
    toggleLockSeat(cnic, programId, lock, setMeritList);
  };

  const handleDelete = async () => {
    await deleteVersion(programId, selectedVersion);
    setSelectedVersion(null);
    const updatedVersions = await fetchVersions(programId);
    setMeritList([]);
    setSelectedVersion(updatedVersions.at(-1) ?? null);
  };
const handleDeleteConfirmedSeats = async () => {
  if (!programId) return;
  if (!window.confirm("Are you sure you want to delete all confirmed seats for this program?")) return;
  const res = await fetch(`/api/meritlist/confirmed_seats?programId=${programId}`, {
    method: "DELETE",
  });
  const data = await res.json();
  alert(data.message || "Confirmed seats deleted.");
  // Optionally, refresh the merit list or page here
};
  const totalConfirmed = meritList.filter((item) => item.confirmed).length;
const totalNotAppeared = meritList.filter((item) => item.not_appeared).length;
const totalLocked = meritList.filter((item) => item.lockseat ).length;
const totalUnlocked = meritList.filter((item) => !item.lockseat).length;
const filteredMeritList = useMemo(() => {
  if (!searchTerm.trim()) return meritList;

  const lower = searchTerm.toLowerCase();

  return meritList.filter((item) => {
    return (
      item.name?.toLowerCase().includes(lower) ||
      item.cnic?.toLowerCase().includes(lower) ||
      item.form_no?.toLowerCase().includes(lower)
    );
  });
}, [meritList, searchTerm]);


 useEffect(() => {
  if (!meritList.length) return;
  const checkConfirmed = async () => {
    const cnics = meritList.map(item => item.cnic);
    const res = await fetch("/api/meritlist/confirmed_seats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cnics }),
    });
    const confirmedSeats = await res.json(); // [{cnic, program_id, program_short_name}, ...]
    // Map CNIC to program info for quick lookup
    const confirmedMap = new Map();
    confirmedSeats.forEach(cs => {
      confirmedMap.set(cs.cnic, {
        program_id: cs.program_id,
        program_short_name: cs.program_short_name,
      });
    });
    setMeritList(meritList =>
      meritList.map(item => {
        const admitted = confirmedMap.get(item.cnic);
        return {
          ...item,
          alreadyAdmitted: !!admitted,
          alreadyAdmittedShortName: admitted ? admitted.program_short_name : null,
          alreadyAdmittedProgramId: admitted ? admitted.program_id : null,
        };
      })
    );
  };
  checkConfirmed();
  // eslint-disable-next-line
}, [meritList.length]);

  return (
    <Suspense fallback={<Loading />}>
    <div className="p-6 space-y-4">
      <div className='text-3xl'>Meritlist </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  <div className="p-4 bg-green-100 rounded-lg">
    <p className="text-sm font-medium">Confirmed</p>
    <p className="text-xl font-bold">{totalConfirmed}</p>
  </div>
  <div className="p-4 bg-red-100 rounded-lg">
    <p className="text-sm font-medium">Not Appeared</p>
    <p className="text-xl font-bold">{totalNotAppeared}</p>
  </div>
  <div className="p-4 bg-blue-100 rounded-lg">
    <p className="text-sm font-medium">Locked</p>
    <p className="text-xl font-bold">{totalLocked}</p>
  </div>
  <div className="p-4 bg-yellow-100 rounded-lg">
    <p className="text-sm font-medium">Unlocked</p>
    <p className="text-xl font-bold">{totalUnlocked}</p>
  </div>
</div>

      <div className="flex items-center justify-between">
        <Select
          value={selectedVersion?.toString()}
          onValueChange={(val) => setSelectedVersion(Number(val))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Version" />
          </SelectTrigger>
          <SelectContent>
            {versions.map((version) => (
              <SelectItem key={version} value={version.toString()}>
                {ordinal(version)} Version
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-2">
        <Input
            type="text"
            placeholder="Search by Name, CNIC, or Form No"
            className="border px-4 py-2 rounded-md w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline" className="flex items-center gap-2">
        <MoreVertical className="w-4 h-4" />
        Actions
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem   onClick={() => handleDownloadAllVersionsPDF(programId)}>
        Download All PDF 
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => handleDownloadPDF(meritList, selectedVersion)}>
        Download PDF
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => handleDownloadCSV(meritList, selectedVersion)}>
        Download CSV
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={() => {
         
            handleDownloadAllVersionsCSV(programId);
        }}
      >
        Download All CSV
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={handleDelete}
        className="text-red-600 focus:text-red-600"
      >
        Delete Version
      </DropdownMenuItem>
      <DropdownMenuItem
  onClick={handleDeleteConfirmedSeats}
  className="text-red-600 focus:text-red-600"
>
  Delete Confirmed Seats
</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
        </div>
      </div>
      {loading ? (
        <Loading />
      ) : (
        <DataTable
          columns={columns({ handleConfirm, handleNotAppeared, handleLockSeat, programId, programShortName })}
          data={filteredMeritList}
        />
      )}
    </div>
    </Suspense>
  );
}
