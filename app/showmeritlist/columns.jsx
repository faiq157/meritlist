import { Button } from '@/components/ui/button';
import { getSeatTypeFromShortName, getSeatTypeColor } from '../utils/utils';
import React, { useState } from 'react';
import DepartmentShiftModal from '../components/DepartmentShiftModal';
import { Badge } from '@/components/ui/badge';

function ShiftActionsCell({ row, programs, handleConfirm, handleLockSeat, handleCancelAdmission, handleUnconfirm, handleShiftDepartment, currentProgramId }) {
  const [showShiftModal, setShowShiftModal] = useState(false);

  return (
    <>
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
        <Button
          variant="outline"
          onClick={() => setShowShiftModal(true)}
          className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
        >
          Shift Department
        </Button>
      </div>

      <DepartmentShiftModal
        isOpen={showShiftModal}
        onClose={() => setShowShiftModal(false)}
        student={row.original}
        programs={programs}
        onShift={handleShiftDepartment}
        currentProgramId={currentProgramId}
      />
    </>
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
    cell: ({ row }) => {
      const seatType = getSeatTypeFromShortName(row.original.program_short_name);
      const colorClass = getSeatTypeColor(row.original.program_short_name);
      return (
        <Badge className={colorClass}>
          {seatType}
        </Badge>
      );
    },
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
        currentProgramId={programId}
      />
    ),
  },
];