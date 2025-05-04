'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Import useRouter
import { Button } from "@/components/ui/button";
import { DataTable } from "../programs/[id]/data-table";
import { columns } from "../programs/[id]/columns";
import { calculateMerit } from "../utils/calculateMerit";

// Function to fetch weights
async function fetchWeights() {
  try {
    const response = await fetch("/api/weights"); // Use relative API path
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
  const router = useRouter(); // Initialize useRouter

  useEffect(() => {
    const fetchData = async () => {
      if (!program?.short_name || !program?.id) return;

      setLoading(true);

      try {
        // Fetch student applications
        const response = await fetch(`/api/students?id=${program.id}`);
        if (!response.ok) throw new Error("Failed to fetch student data");
        const result = await response.json();

        // Filter students applied to this program
        const filteredData = result.filter(student => {
          return Array.from({ length: 10 }, (_, i) => student[`preference_${i + 1}`])
            .includes(program.short_name);
        });

        // Map applied preference
        const mappedData = filteredData.map(student => {
          const appliedPreference = Array.from({ length: 10 }, (_, i) => ({
            pref: `preference_${i + 1}`,
            value: student[`preference_${i + 1}`],
          })).find(pref => pref.value === program.short_name);

          return {
            ...student,
            applied_preference: appliedPreference?.pref || null,
            matched_preference: appliedPreference?.value || null,
          };
        });

        setData(mappedData);

        // Fetch weights once
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
  }, [program?.short_name, program?.id]);

  const generateMeritList = async () => {
    if (!program?.id || !weights) return;

    setGenerating(true);

    try {
      // Fetch program seats
      const { seats_open, seats_self_finance } = program;
      // Calculate merit using pre-fetched weights
      const meritList = stddata.map((student) => {
        const merit = calculateMerit(student, weights, program.programType);
        return {
          name: student.name,
          cnic: student.cnic,
          merit,
        };
      });

      // Sort and rank
      const sortedMeritList = meritList
        .sort((a, b) => b.merit - a.merit)
        .map((student, index) => ({
          ...student,
          rank: index + 1,
        }));

      // Categorize students into open merit and financial
      const openMeritList = sortedMeritList.slice(0, seats_open).map(student => ({
        ...student,
        category: "open_merit",
      }));

      const financialList = sortedMeritList.slice(seats_open, seats_open + seats_self_finance).map(student => ({
        ...student,
        category: "rational",
      }));

      const finalMeritList = [...openMeritList, ...financialList];

      // Store in DB
      const response = await fetch(`/api/meritlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          programId: program.id,
          programName: program.name,
          programShortName: program.short_name,
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
    router.push(`/showmeritlist?programId=${program.id}&programShortName=${program.short_name}`);
  };

  return (
    <div className="mx-auto py-8 px-8">
      <h1 className="text-2xl font-bold mb-4">Program: {program?.name}</h1>
      <p className="mb-4">Short Name: {program?.short_name}</p>
      <div className="flex flex-wrap gap-4 mb-4">
        <Button variant="default" onClick={generateMeritList} disabled={generating || !weights}>
          {generating ? "Generating..." : "Generate Merit List"}
        </Button>
        <Button variant="secondary" onClick={navigateToMeritList}>
          Show Merit List
        </Button>
      </div>

      <div className="mt-8">
        {loading ? (
          <div>Loading data...</div>
        ) : (
          <DataTable columns={columns} data={stddata} />
        )}
      </div>
    </div>
  );
};

export default ProgramActions;