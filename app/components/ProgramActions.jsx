'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DataTable } from "../programs/[id]/data-table";
import { columns } from "../programs/[id]/columns";
import { calculateMerit } from "../utils/calculateMerit";
import Loading from "./Loader";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

async function fetchWeights() {
  try {
    const response = await fetch("/api/weights");
    if (!response.ok) throw new Error("Failed to fetch weightages");
    return await response.json();
  } catch (error) {
    console.error("Error fetching weightages:", error);
    return null;
  }
}

const ProgramActions = ({ program }) => {
  const [stddata, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [weights, setWeights] = useState(null);
  const router = useRouter();
  const [suffix, setSuffix] = useState("O");
  const [seats, setSeats] = useState(0);
  const [generationResult, setGenerationResult] = useState(null);
  const [useSmartGeneration, setUseSmartGeneration] = useState(true);

  const displayedShortName = program?.short_name
    ? `${program.short_name.split("-")[0]}-${suffix}`.trim()
    : "";

  useEffect(() => {
    const fetchData = async () => {
      if (!displayedShortName || !program?.id) return;
      setLoading(true);
      try {
        const response = await fetch(`/api/students?id=${program.id}`);
        if (!response.ok) throw new Error("Failed to fetch student data");
        const result = await response.json();
        const filteredData = result.filter(student => {
          return Array.from({ length: 10 }, (_, i) => student[`preference_${i + 1}`]?.trim().toLowerCase())
            .includes(displayedShortName.trim().toLowerCase());
        });
        // Dynamically find the matched reference number for the current filter
        const mappedData = filteredData.map(student => {
          let matchedReference = null;
          for (let i = 1; i <= 10; i++) {
            if (
              student[`preference_${i}`] &&
              student[`preference_${i}`].trim().toLowerCase() === displayedShortName.trim().toLowerCase()
            ) {
              matchedReference = i;
              break;
            }
          }
          return {
            ...student,
            matchedReference, // This will be 1, 2, 3, ... or null if not matched
          };
        });
        setData(mappedData);
        const fetchedWeights = await fetchWeights();
        if (fetchedWeights) {
          setWeights(fetchedWeights);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [displayedShortName, program?.id, suffix]);

  const generateMeritList = async () => {
    if (!program?.id || !weights) return;
    if (!seats || seats <= 0) {
      alert("Please enter a valid number of seats.");
      return;
    }
    setGenerating(true);
    setGenerationResult(null);
    
    try {
      const selectedResponse = await fetch(`/api/meritlist?programId=${program.id}`);
      if (!selectedResponse.ok) throw new Error("Failed to fetch selected students");
      const selectedStudents = await selectedResponse.json();
      const selectedCnicSet = new Set(selectedStudents.map(student => student.cnic));
      
      // Calculate merit for all students first
      const allMeritList = stddata
        .filter(student => !selectedCnicSet.has(student.cnic))
        .map(student => {
          const merit = calculateMerit(student, weights, program.programType);
          return {
            name: student.name,
            cnic: student.cnic,
            merit,
            form_no: student.form_no,
            matchedPreference: student?.matchedReference,
            category: suffix === "O" ? "open_merit" : suffix === "R" ? "rational" : "self_finance",
          };
        });
      
      // Sort by merit (highest first)
      const sortedMeritList = allMeritList
        .sort((a, b) => b.merit - a.merit)
        .map((student, index) => ({
          ...student,
          rank: index + 1,
        }));

      // Take enough students to fill the requested seats (including potential skips)
      // We take 3x the requested seats to account for potential conflicts
      const candidateStudents = sortedMeritList.slice(0, seats * 3);
      
      // Prepare the merit list for API call
      const finalMeritList = candidateStudents.map(student => ({
        ...student,
        category: suffix === "O" ? "open_merit" : suffix === "R" ? "rational" : "self_finance",
      }));

      // Use the fill-seats endpoint to ensure we get the requested number of seats
      const endpoint = useSmartGeneration ? '/api/meritlist/fill-seats' : '/api/meritlist/fill-seats';
      const requestBody = {
        programId: program.id,
        programName: program.name,
        programShortName: displayedShortName,
        meritList: finalMeritList,
        targetSeats: seats, // The number of seats we want to fill
        checkPreferences: useSmartGeneration
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) throw new Error("Failed to store merit list in the database");
      
      const result = await response.json();
      setGenerationResult(result);
      
      // Show success message with details
      let message = `Merit list generated successfully!\n\n`;
      message += `Target seats: ${result.targetSeats}\n`;
      message += `Seats filled: ${result.seatsFilled}\n`;
      message += `Total students processed: ${result.totalStudents}\n`;
      message += `Students added: ${result.addedStudents}\n`;
      
      if (result.skippedStudents > 0) {
        message += `Students skipped: ${result.skippedStudents}\n`;
      }
      
      if (result.preferenceConflicts > 0) {
        message += `Preference conflicts resolved: ${result.preferenceConflicts}\n`;
      }
      
      if (result.removedFromOtherLists > 0) {
        message += `Students removed from other lists: ${result.removedFromOtherLists}\n`;
      }

      // Check if we got the requested number of seats
      if (result.seatsFilled < result.targetSeats) {
        message += `\n⚠️ Note: Only ${result.seatsFilled} seats were filled out of ${result.targetSeats} requested.`;
        message += `\nThis may be due to insufficient eligible students or preference conflicts.`;
        message += `\nSeats remaining: ${result.seatsRemaining}`;
      } else {
        message += `\n✅ Successfully filled all ${result.targetSeats} requested seats!`;
      }
      
      alert(message);
      
    } catch (error) {
      console.error("Error generating merit list:", error);
      alert("Failed to generate merit list. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const navigateToMeritList = () => {
    router.push(`/showmeritlist?programId=${program.id}&programShortName=${displayedShortName}`);
  };

  return (
    <div className="mx-auto p-14">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Select value={suffix} onValueChange={setSuffix}>
            <SelectTrigger className="w-40 ml-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="w-64">
              <SelectItem value="O">Open Seats</SelectItem>
              <SelectItem value="R">Rational Seats</SelectItem>
              <SelectItem value="S">Self Seats</SelectItem>
            </SelectContent>
          </Select>
          <label>Select Number of Seats</label>
          <input
            type="number"
            min={1}
            className="ml-4 border rounded px-2 py-1 w-32"
            placeholder="Enter seats"
            value={seats}
            onChange={e => setSeats(Number(e.target.value))}
          />
        </div>
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="smartGeneration"
              checked={useSmartGeneration}
              onChange={(e) => setUseSmartGeneration(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="smartGeneration" className="text-sm">
              Smart Generation (Check duplicates & preferences)
            </label>
          </div>
          <Button variant="default" onClick={generateMeritList} disabled={generating || !weights}>
            {generating ? "Generating..." : "Generate Merit List"}
          </Button>
          <Button variant="outline" onClick={navigateToMeritList}>
            Show Merit List
          </Button>
        </div>
      </div>

      {/* Generation Results Display */}
      {generationResult && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <h3 className="text-lg font-semibold mb-3">Generation Results</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Target Seats:</span>
              <div className="text-lg font-bold text-blue-600">{generationResult.targetSeats}</div>
            </div>
            <div>
              <span className="font-medium">Seats Filled:</span>
              <div className="text-lg font-bold text-green-600">{generationResult.seatsFilled}</div>
            </div>
            <div>
              <span className="font-medium">Total Processed:</span>
              <div className="text-lg font-bold text-purple-600">{generationResult.totalStudents}</div>
            </div>
            <div>
              <span className="font-medium">Skipped:</span>
              <div className="text-lg font-bold text-orange-600">{generationResult.skippedStudents}</div>
            </div>
          </div>
          
          {/* Seat Status */}
          {generationResult.seatsRemaining > 0 && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded">
              <div className="flex items-center gap-2">
                <span className="text-orange-600 font-medium">⚠️</span>
                <span className="text-orange-700">
                  {generationResult.seatsRemaining} seats remaining unfilled
                </span>
              </div>
            </div>
          )}
          
          {generationResult.seatsFilled === generationResult.targetSeats && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
              <div className="flex items-center gap-2">
                <span className="text-green-600 font-medium">✅</span>
                <span className="text-green-700">
                  All {generationResult.targetSeats} seats successfully filled!
                </span>
              </div>
            </div>
          )}
          
          {/* Detailed Results */}
          {generationResult.details && (
            <div className="mt-4">
              {generationResult.details.skippedStudents && generationResult.details.skippedStudents.length > 0 && (
                <div className="mt-3">
                  <h4 className="font-medium text-orange-700 mb-2">Skipped Students:</h4>
                  <div className="max-h-32 overflow-y-auto">
                    {generationResult.details.skippedStudents.map((student, index) => (
                      <div key={index} className="text-xs text-gray-600 mb-1">
                        {student.name} ({student.cnic}) - {student.reason}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {generationResult.details.preferenceConflicts && generationResult.details.preferenceConflicts.length > 0 && (
                <div className="mt-3">
                  <h4 className="font-medium text-purple-700 mb-2">Preference Conflicts Resolved:</h4>
                  <div className="max-h-32 overflow-y-auto">
                    {generationResult.details.preferenceConflicts.map((conflict, index) => (
                      <div key={index} className="text-xs text-gray-600 mb-1">
                        {conflict.name} ({conflict.cnic}) - Preference {conflict.currentPreference} 
                        (was in: {conflict.existingPrograms.join(', ')})
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="mt-8">
        {loading ? (
          <div>
            <Loading />
          </div>
        ) : (
          <DataTable columns={columns} data={stddata} />
        )}
      </div>
    </div>
  );
};

export default ProgramActions;