"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CreateProgramsForm = ({
  initialValues = {},
  onSubmit,
  isUpdate = false,
}) => {
  const [name, setName] = useState(initialValues.name || "");
  const [description, setDescription] = useState(initialValues.description || "");
  const [programType, setProgramType] = useState(
    initialValues.programType || "Engineering"
  );
  const [shortName, setShortName] = useState(initialValues.short_name || ""); // Added short_name
  const [message, setMessage] = useState("");
  // Add seat fields
  const [seatsOpen, setSeatsOpen] = useState(initialValues.seats_open || 0);
  const [seatsSelfFinance, setSeatsSelfFinance] = useState(initialValues.seats_self_finance || 0);
  const [seatsRational, setSeatsRational] = useState(initialValues.seats_rational || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await onSubmit({
      name,
      description,
      programType,
      short_name: shortName, // Include short_name in submission
      seats_open: Number(seatsOpen),
      seats_self_finance: Number(seatsSelfFinance),
      seats_rational: Number(seatsRational),
    });

    if (success) {
      setMessage(
        isUpdate
          ? "✅ Program updated successfully!"
          : "✅ Program created successfully!"
      );
    } else {
      setMessage("❌ Error occurred while processing the request.");
    }
  };

  return (
    <CardContent>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            placeholder="Enter program name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="shortName">Short Name</Label>
          <Input
            id="shortName"
            placeholder="Enter short name"
            value={shortName}
            onChange={(e) => setShortName(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Enter description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        {/* Seat fields */}
        <div>
          <Label htmlFor="seatsOpen">Open Merit Seats</Label>
          <Input
            id="seatsOpen"
            type="number"
            min="0"
            value={seatsOpen}
            onChange={(e) => setSeatsOpen(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="seatsSelfFinance">Self Finance Seats</Label>
          <Input
            id="seatsSelfFinance"
            type="number"
            min="0"
            value={seatsSelfFinance}
            onChange={(e) => setSeatsSelfFinance(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="seatsRational">Rational Seats</Label>
          <Input
            id="seatsRational"
            type="number"
            min="0"
            value={seatsRational}
            onChange={(e) => setSeatsRational(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="programType">Program Type</Label>
          <Select
            value={programType}
            onValueChange={(value) => setProgramType(value)}
          >
            <SelectTrigger id="programType">
              <SelectValue placeholder="Select a program type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Engineering">Engineering</SelectItem>
              <SelectItem value="Non-Engineering">Non-Engineering</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" className="w-full">
          {isUpdate ? "Update Program" : "Create Program"}
        </Button>
      </form>

      {message && <p className="mt-4 text-sm">{message}</p>}
    </CardContent>
  );
};

export default CreateProgramsForm;