'use client';
import StudentStatusChecker from "../components/StudentStatusChecker";

export default function StudentStatusPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Student Status Checker</h1>
          <p className="text-gray-600 mt-2">
            Check student status across all merit lists and verify eligibility for new placements.
          </p>
        </div>
        <StudentStatusChecker />
      </div>
    </div>
  );
} 