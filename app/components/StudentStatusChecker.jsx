'use client';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Loading from "./Loader";

const StudentStatusChecker = () => {
  const [cnic, setCnic] = useState("");
  const [formNo, setFormNo] = useState("");
  const [studentStatus, setStudentStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const checkStudentStatus = async () => {
    if (!cnic && !formNo) {
      setError("Please enter either CNIC or Form Number");
      return;
    }

    setLoading(true);
    setError("");
    setStudentStatus(null);

    try {
      const params = new URLSearchParams();
      if (cnic) params.append('cnic', cnic);
      if (formNo) params.append('form_no', formNo);

      const response = await fetch(`/api/meritlist/student-status?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch student status");
      }

      setStudentStatus(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const checkEligibility = async (programId, preference) => {
    if (!cnic || !programId || !preference) {
      setError("Please enter CNIC, Program ID, and Preference");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch('/api/meritlist/student-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cnic, programId, preference })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to check eligibility");
      }

      // Show eligibility result
      const message = data.shouldInclude 
        ? `✅ Student can be added to this merit list`
        : `❌ Student should not be added: ${data.recommendation}`;
      
      alert(message);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Student Status Checker</h2>
      
      {/* Search Form */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="cnic">CNIC</Label>
            <Input
              id="cnic"
              type="text"
              placeholder="Enter CNIC (e.g., 12345-1234567-1)"
              value={cnic}
              onChange={(e) => setCnic(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="formNo">Form Number</Label>
            <Input
              id="formNo"
              type="text"
              placeholder="Enter Form Number"
              value={formNo}
              onChange={(e) => setFormNo(e.target.value)}
            />
          </div>
        </div>
        <Button onClick={checkStudentStatus} disabled={loading || (!cnic && !formNo)}>
          {loading ? "Checking..." : "Check Status"}
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && <Loading />}

      {/* Student Status Results */}
      {studentStatus && (
        <div className="bg-white border rounded-lg p-6">
          {studentStatus.studentExists ? (
            <>
              {/* Student Info */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4">Student Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Name:</span>
                    <div className="font-medium">{studentStatus.studentInfo.name}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">CNIC:</span>
                    <div className="font-medium">{studentStatus.studentInfo.cnic}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Form No:</span>
                    <div className="font-medium">{studentStatus.studentInfo.form_no}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Category:</span>
                    <div className="font-medium">{studentStatus.studentInfo.category}</div>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4">Merit List Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-3 rounded">
                    <span className="text-sm text-blue-600">Total Entries</span>
                    <div className="text-2xl font-bold text-blue-700">{studentStatus.totalEntries}</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <span className="text-sm text-green-600">High Preference</span>
                    <div className="text-2xl font-bold text-green-700">{studentStatus.highPreferenceEntries}</div>
                  </div>
                  {studentStatus.highestPreference && (
                    <div className="bg-purple-50 p-3 rounded">
                      <span className="text-sm text-purple-600">Best Preference</span>
                      <div className="text-2xl font-bold text-purple-700">{studentStatus.highestPreference.preference}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Highest Preference Details */}
              {studentStatus.highestPreference && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">Highest Preference Placement</h3>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <span className="text-sm text-green-600">Program:</span>
                        <div className="font-medium">{studentStatus.highestPreference.programShortName}</div>
                      </div>
                      <div>
                        <span className="text-sm text-green-600">Preference:</span>
                        <div className="font-medium">{studentStatus.highestPreference.preference}</div>
                      </div>
                      <div>
                        <span className="text-sm text-green-600">Rank:</span>
                        <div className="font-medium">{studentStatus.highestPreference.rank}</div>
                      </div>
                      <div>
                        <span className="text-sm text-green-600">Version:</span>
                        <div className="font-medium">{studentStatus.highestPreference.version}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* All Programs */}
              {studentStatus.programs && studentStatus.programs.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">All Merit List Entries</h3>
                  <div className="space-y-3">
                    {studentStatus.programs.map((program, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{program.programName}</h4>
                          <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                            {program.programShortName}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          {program.entries.map((entry, entryIndex) => (
                            <div key={entryIndex} className="bg-gray-50 p-2 rounded">
                              <div>Preference: {entry.matched_preference}</div>
                              <div>Rank: {entry.rank}</div>
                              <div>Version: {entry.version}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* High Preference Only */}
              {studentStatus.highPreferenceOnly && studentStatus.highPreferenceOnly.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">High Preference Entries (1-4)</h3>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {studentStatus.highPreferenceOnly.map((entry, index) => (
                        <div key={index} className="border-l-4 border-yellow-400 pl-4">
                          <div className="font-medium">{entry.program_short_name}</div>
                          <div className="text-sm text-gray-600">
                            Preference: {entry.matched_preference} | Rank: {entry.rank}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">Student Not Found</h3>
              <p className="text-gray-600">This student is not found in any merit list.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentStatusChecker; 