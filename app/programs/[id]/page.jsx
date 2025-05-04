'use client';

import ProgramActions from "@/app/components/ProgramActions"; // Updated to ProgramActions
import { useParams } from "next/navigation"; // Use useParams instead of useRouter
import { useEffect, useState } from "react";

const ProgramPage = () => {
  const { id } = useParams(); // Get the dynamic route parameter
  const [program, setProgram] = useState(null);
console.log("program", program);
console.log("id", id);
  useEffect(() => {
    if (id) {
      const fetchProgram = async () => {
        try {
          const response = await fetch(`/api/programs/${id}`); // Updated API endpoint
          if (!response.ok) {
            throw new Error("Failed to fetch program data");
          }
          const data = await response.json();
          setProgram(data);
        } catch (error) {
          console.error("Error fetching program:", error);
        }
      };
      fetchProgram();
    }
  }, [id]);

  return <ProgramActions program={program} />; // Updated to pass program data
};

export default ProgramPage;