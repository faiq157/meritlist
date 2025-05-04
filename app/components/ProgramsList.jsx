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
import { FileEdit, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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

      if (!response.ok) throw new Error("Failed to delete program");

      setPrograms((prev) => prev.filter((program) => program.id !== id));
    } catch (error) {
      console.error("Error deleting program:", error);
    }
  };

  return (
    <div>
      <Button onClick={() => setCreatingProgram(true)} className="mb-4">
        <Plus/> Program
      </Button>

      {loading ? (
        <p>Loading...</p>
      ) : programs.length === 0 ? (
        <p>No programs found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {programs.map((program) => (
            <Card key={program.id}>
              <CardHeader className="flex justify-between items-center">
                <CardTitle>{program.name}</CardTitle>
                <div className="flex space-x-2">
                  <FileEdit
                    className="cursor-pointer text-blue-500"
                    onClick={() => setEditingProgram(program)}
                  />
                  <Trash2
                    className="cursor-pointer text-red-500"
                    onClick={() => deleteProgram(program.id)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{program.description}</p>
                <p className="text-sm">
                  <strong>Seats (Open):</strong> {program.seats_open}
                </p>
                <p className="text-sm">
                  <strong>Seats (Self Finance):</strong> {program.seats_self_finance}
                </p>
                <p className="text-sm">
                  <strong>Program Type:</strong> {program.programType}
                </p>
                <p className="text-sm">
                  <strong>Short Name:</strong> {program.short_name}
                </p>
                <Link href={`/programs/${program.id}`}>
                  <Button variant="outline" className="mt-2">
                    View Details
                  </Button>
                </Link>
              </CardContent>
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