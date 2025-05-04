'use client';
import ProgramsList from './components/ProgramsList';

import Aggregate from './components/Aggregate';
import ProtectedRoute from './components/ProtectedRoute';

export default function Home() {


  return (
    <ProtectedRoute>
    <div className="max-w-4xl mx-auto py-8 px-4">
    <Aggregate/>
      <h1 className="text-2xl font-bold mb-4">Program Management</h1>

{/* ProgramsList handles all CRUD operations */}


{/* Button to open the dialog */}


      <ProgramsList />
    </div>
    </ProtectedRoute>
  );
}