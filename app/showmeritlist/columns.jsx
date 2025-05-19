import { Button } from '@/components/ui/button';

export const columns = ({ handleConfirm, handleNotAppeared, handleLockSeat, programId, programShortName }) => [
  { accessorKey: 'rank', header: 'Rank' },
  { accessorKey: 'form_no', header: 'Form No' },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'cnic', header: 'CNIC' },
  { accessorKey: 'merit', header: 'Merit' },
  { accessorKey: 'category', header: 'Category' },
  { accessorKey: 'program_name', header: 'Program Name' },
  { accessorKey: 'program_short_name', header: 'Program Short Name' },
  {
    accessorKey: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Button
          onClick={() => handleConfirm(row.original.cnic)}
          disabled={row.original.confirmed || row.original.not_appeared}
        >
          {row.original.confirmed ? 'Confirmed' : 'Confirm'}
        </Button>
        <Button
          onClick={() => handleNotAppeared(row.original.cnic)}
          disabled={row.original.confirmed || row.original.not_appeared}
        >
        {row.original.not_appeared ? 'Not Appeared' : 'Not Appeared'}
        </Button>
        <Button
          onClick={() => handleLockSeat(row.original.cnic, row.original.lockseat)}
            disabled={row.original.confirmed || row.original.not_appeared}
        >
          {row.original.lockseat ? 'Lock' : 'Unlock'}
        </Button>
      </div>
    ),
  },
];
