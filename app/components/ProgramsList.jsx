import { useEffect, useState } from "react";
import CreateProgramsForm from "./CreateProgramsForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Book, BookOpen, CirclePlus, FileEdit, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Aggregate from "./Aggregate";
import Loading from "./Loader";

const ProgramsList = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProgram, setEditingProgram] = useState(null);
  const [creatingProgram, setCreatingProgram] = useState(false);

  // Fetch all programs
  const fetchPrograms = async () => {
    try {
      const response = await fetch("/api/programs");
      if (!response.ok) throw new Error("Failed to fetch programs");
      const data = await response.json();
      setPrograms(data || []);
    } catch (error) {
      console.error("Error fetching programs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  // Create a new program
  const handleCreate = async (newProgramData) => {
    try {
      const response = await fetch(`/api/programs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProgramData),
      });

      if (!response.ok) throw new Error("Failed to create program");

      const createdProgram = await response.json();
      setPrograms((prev) => [...prev, createdProgram]); // Add the new program to the list
      setCreatingProgram(false); // Close the dialog
       await fetchPrograms();
      return true;
    } catch (error) {
      console.error("Error creating program:", error);
      return false;
    }
  };

  // Update an existing program
  const handleUpdate = async (updatedData) => {
    try {
      const response = await fetch(`/api/programs`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingProgram.id, ...updatedData }),
      });

      if (!response.ok) throw new Error("Failed to update program");

      setPrograms((prev) =>
        prev.map((program) =>
          program.id === editingProgram.id ? { ...program, ...updatedData } : program
        )
      );
      setEditingProgram(null); // Close the dialog
      return true;
    } catch (error) {
      console.error("Error updating program:", error);
      return false;
    }
  };

  // Delete a program
const deleteProgram = async (id) => {
  if (!confirm("Are you sure you want to delete this program?")) return;

  try {
    const response = await fetch(`/api/programs?id=${id}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok) {
      // Show the backend error message to the user
      alert(data.message || "Failed to delete program");
      return;
    }

    setPrograms((prev) => prev.filter((program) => program.id !== id));
  } catch (error) {
    console.error("Error deleting program:", error);
    alert("An unexpected error occurred while deleting the program.");
  }
};

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
      <h1 className=" font-bold text-3xl">Program Management</h1>
      <p className="text-gray-500">View and manage academic programs</p>
      </div>
      <div className="flex items-center gap-4">
      <Button onClick={() => setCreatingProgram(true)} >
        <CirclePlus/> Program
        </Button>
       <Aggregate/> 
     
        <Link className="flex justify-center items-center text-white bg-black p-2 rounded-md" href="/masterlist">
          <BookOpen className="mr-2" />
          Master List
        </Link>

      </div>
    </div>

      {loading ? (
        <><Loading/></>
      ) : programs.length === 0 ? (
        <p>No programs found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {programs.map((program) => (
       <Card key={program.id} className="border rounded-xl shadow-sm p-4 space-y-4">
       <div className="flex justify-between items-start">
         <div>
           <h2 className="text-lg font-semibold flex items-center gap-2">
             <span><BookOpen/></span> {program.name}
           </h2>
           <div className="flex gap-2 mt-2">
             <span className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded-full font-medium">
               {program.short_name}
             </span>
             <span className="bg-gray-200 text-gray-900 text-xs px-2 py-0.5 rounded-full font-medium">
               {program.programType}
             </span>
           </div>
         </div>
         <div className="flex gap-2">
           <FileEdit
             className="cursor-pointer text-blue-500"
             onClick={() => setEditingProgram(program)}
           />
           <Trash2
             className="cursor-pointer text-red-500"
             onClick={() => deleteProgram(program.id)}
           />
         </div>
       </div>
     
       <p className="text-sm text-muted-foreground">
         {program.description}
       </p>
       <Link href={`/programs/${program.id}`}>
         <Button
           variant="outline"
           className="mt-2 w-full hover:text-white cursor-pointer"
         >
           View Details
         </Button>
       </Link>
     </Card>
     
          ))}
        </div>
      )}

      {/* Dialog for creating a new program */}
      {creatingProgram && (
        <Dialog open={creatingProgram} onOpenChange={() => setCreatingProgram(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Program</DialogTitle>
              <DialogClose onClick={() => setCreatingProgram(false)} />
            </DialogHeader>
            <CreateProgramsForm onSubmit={handleCreate} />
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog for editing an existing program */}
      {editingProgram && (
        <Dialog open={!!editingProgram} onOpenChange={() => setEditingProgram(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Program</DialogTitle>
              <DialogClose onClick={() => setEditingProgram(null)} />
            </DialogHeader>
            <CreateProgramsForm
              initialValues={editingProgram}
              onSubmit={handleUpdate}
              isUpdate={true}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ProgramsList;