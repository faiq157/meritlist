import { Button } from '@/components/ui/button';
import { getSeatTypeFromShortName } from '../utils/utils';
import React, { useState } from 'react';

function ShiftActionsCell({ row, programs, handleConfirm, handleLockSeat, handleCancelAdmission, handleUnconfirm, handleShiftDepartment }) {
  const [selectedDept, setSelectedDept] = useState("");
  const availablePrograms = programs.filter(p => p.id !== row.original.program_id);
  return (
    <div className="flex gap-2 items-center">
      <Button
        onClick={() =>
          row.original.confirmed
            ? handleUnconfirm(row.original.cnic)
            : handleConfirm(row.original.cnic)
        }
      >
        {row.original.confirmed ? 'Admitted' : 'Admit'}
      </Button>
      <Button
        onClick={() => handleLockSeat(row.original.cnic, row.original.lockseat)}
      >
        {row.original.lockseat ? 'Lock' : 'Unlock'}
      </Button>
      <Button
        variant="destructive"
        onClick={() =>
          handleCancelAdmission(
            row.original.cnic,
            row.original.program_id,
            row.original.program_short_name
          )
        }
      >
        Cancel
      </Button>
      {/* Department shift dropdown */}
      <select
        className="border rounded px-2 py-1"
        value={selectedDept}
        onChange={e => setSelectedDept(e.target.value)}
      >
        <option value="">Shift to...</option>
        {availablePrograms.map(p => (
          <option key={p.id} value={p.id}>{p.name} ({p.short_name})</option>
        ))}
      </select>
      <Button
        variant="secondary"
        disabled={!selectedDept}
        onClick={() => {
          const targetProgram = programs.find(p => p.id === Number(selectedDept));
          if (targetProgram) {
            handleShiftDepartment(
              row.original.cnic,
              targetProgram // pass the full program object
            );
          }
        }}
      >
        Shift
      </Button>
    </div>
  );
}

export const columns = ({ handleConfirm, handleLockSeat, programId, programShortName, handleCancelAdmission, handleUnconfirm, handleShiftDepartment, programs }) => [
  { accessorKey: 'rank', header: 'Rank' },
  { accessorKey: 'form_no', header: 'Form No' },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'cnic', header: 'CNIC' },
  { accessorKey: 'merit', header: 'Merit' },
  {accessorKey:'matched_preference',header:'preference'},
  {
    accessorFn: row => getSeatTypeFromShortName(row.program_short_name),
    id: 'seat_type',
    header: 'Seat Type',
  },
  { accessorKey: 'program_name', header: 'Program Name' },

  {
    accessorKey: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <ShiftActionsCell
        row={row}
        programs={programs}
        handleConfirm={handleConfirm}
        handleLockSeat={handleLockSeat}
        handleCancelAdmission={handleCancelAdmission}
        handleUnconfirm={handleUnconfirm}
        handleShiftDepartment={handleShiftDepartment}
      />
    ),
  },
];