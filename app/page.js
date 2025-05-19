'use client';
import ProgramsList from './components/ProgramsList';

import Aggregate from './components/Aggregate';
import ProtectedRoute from './components/ProtectedRoute';

export default function Home() {


  return (
    <ProtectedRoute>
    <div className=" p-11">
      <ProgramsList />
    </div>
    </ProtectedRoute>
  );
}