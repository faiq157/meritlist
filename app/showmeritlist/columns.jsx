import { Button } from '@/components/ui/button';
import { getSeatTypeFromShortName } from '../utils/utils';

export const columns = ({ handleConfirm, handleNotAppeared, handleLockSeat, programId, programShortName, handleCancelAdmission }) => [
  { accessorKey: 'rank', header: 'Rank' },
  { accessorKey: 'form_no', header: 'Form No' },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'cnic', header: 'CNIC' },
  { accessorKey: 'merit', header: 'Merit' },
  {
    accessorFn: row => getSeatTypeFromShortName(row.program_short_name),
    id: 'seat_type',
    header: 'Seat Type',
  },
  { accessorKey: 'program_name', header: 'Program Name' },
  { accessorKey: 'program_short_name', header: 'Program Short Name' },
  {
    accessorKey: 'alreadyAdmitted',
    header: 'Admission Status',
    cell: ({ row }) => {
      const admitted = row.original.alreadyAdmitted;
      const admittedShortName = row.original.alreadyAdmittedShortName;
      const currentShortName = row.original.program_short_name;
      if (admitted && admittedShortName && admittedShortName !== currentShortName) {
        return (
          <span className="text-green-600 font-semibold">
            Already Admitted in {admittedShortName}
          </span>
        );
      }
      return "";
    },
  },
  {
    accessorKey: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Button
          onClick={() => handleConfirm(row.original.cnic)}
          disabled={row.original.confirmed || row.original.not_appeared || row.original.alreadyAdmitted}
        >
          {row.original.confirmed ? 'Admited' : 'admit'}
        </Button>
        <Button
          onClick={() => handleNotAppeared(row.original.cnic)}
          disabled={row.original.confirmed || row.original.not_appeared || row.original.alreadyAdmitted}
        >
          {row.original.not_appeared ? 'Not Appeared' : 'Not Appeare'}
        </Button>
        <Button
          onClick={() => handleLockSeat(row.original.cnic, row.original.lockseat)}
          disabled={row.original.confirmed || row.original.not_appeared || row.original.alreadyAdmitted}
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
          disabled={row.original.not_appeared || row.original.alreadyAdmitted}
        >
          Cancel
        </Button>
      </div>
    ),
  },
];