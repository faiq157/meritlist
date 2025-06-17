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
  const [seats, setSeats] = useState(0); // <-- Add state for seats

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
        const mappedData = filteredData.map(student => {
          const appliedPreference = Array.from({ length: 10 }, (_, i) => ({
            pref: `preference_${i + 1}`,
            value: student[`preference_${i + 1}`],
          })).find(pref => pref.value?.trim().toLowerCase() === displayedShortName.trim().toLowerCase());
          return {
            ...student,
            applied_preference: appliedPreference?.pref || null,
            matched_preference: appliedPreference?.value || null,
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
  }, [displayedShortName, program?.id]);

  const generateMeritList = async () => {
    if (!program?.id || !weights) return;
    if (!seats || seats <= 0) {
      alert("Please enter a valid number of seats.");
      return;
    }
    setGenerating(true);
    try {
      const selectedResponse = await fetch(`/api/meritlist?programId=${program.id}`);
      if (!selectedResponse.ok) throw new Error("Failed to fetch selected students");
      const selectedStudents = await selectedResponse.json();
      const selectedCnicSet = new Set(selectedStudents.map(student => student.cnic));
      const meritList = stddata
        .filter(student => !selectedCnicSet.has(student.cnic))
        .map(student => {
          const merit = calculateMerit(student, weights, program.programType);
          return {
            name: student.name,
            cnic: student.cnic,
            merit,
            form_no: student.form_no,
            matchedPreference : student?.matchedPreference
          };
        });
      const sortedMeritList = meritList
        .sort((a, b) => b.merit - a.merit)
        .map((student, index) => ({
          ...student,
          rank: index + 1,
        }));
      // Only take the number of seats specified by the user
      const finalMeritList = sortedMeritList.slice(0, seats).map(student => ({
        ...student,
        category: suffix === "O" ? "open_merit" : suffix === "R" ? "rational" : "self_finance",
      }));
      const response = await fetch(`/api/meritlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          programId: program.id,
          programName: program.name,
          programShortName: displayedShortName,
          meritList: finalMeritList,
        }),
      });
      if (!response.ok) throw new Error("Failed to store merit list in the database");
      alert("Merit list and program details stored successfully!");
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
          {/* <span className="ml-2 font-semibold">{displayedShortName}</span> */}
          {/* Input for number of seats */}
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
          <Button variant="default" onClick={generateMeritList} disabled={generating || !weights}>
            {generating ? "Generating..." : "Generate Merit List"}
          </Button>
          <Button variant="outline" onClick={navigateToMeritList}>
            Show Merit List
          </Button>
        </div>
      </div>
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