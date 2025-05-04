import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const Aggregate = () => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [type, setType] = React.useState("engineering");
  const [sscWeight, setSscWeight] = React.useState(10);
  const [interWeight, setInterWeight] = React.useState(50);
  const [testWeight, setTestWeight] = React.useState(40);

  useEffect(() => {
    if (isDialogOpen) {
      fetchWeightages();
    }
  }, [isDialogOpen]);

  const fetchWeightages = async () => {
    try {
      const response = await fetch("/api/weights");
      if (!response.ok) throw new Error("Failed to fetch weightages");
      const data = await response.json();
      const weight = data.find((w) => w.program_type === type);
      if (weight) {
        setSscWeight(weight.ssc_weight);
        setInterWeight(weight.inter_weight);
        setTestWeight(weight.test_weight || 0.0); // Default to 0.0 if not provided
      }
    } catch (error) {
      console.error("Error fetching weightages:", error);
    }
  };

  const updateWeightages = async () => {
    try {
      const payload = {
        id: type === "engineering" ? 1 : 2, // Example IDs
        ssc_weight: sscWeight,
        inter_weight: interWeight,
        test_weight: type === "engineering" ? testWeight : 0.0, 
      };

      const response = await fetch("/api/weights", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to update weightages");

      alert("Weightages updated successfully!");
      setIsDialogOpen(false); // Close the dialog after successful update
    } catch (error) {
      console.error("Error updating weightages:", error);
    }
  };

  const handleTypeChange = (e) => {
    const selectedType = e.target.value;
    setType(selectedType);

    // Reset testWeight to 0.0 if Non-Engineering is selected
    if (selectedType === "non-engineering") {
      setTestWeight(0.0);
    }
  };

  return (
    <div>
      <div className="flex justify-end items-center">
        <Button onClick={() => setIsDialogOpen(true)} className="mt-4">
          Update Aggregate
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Aggregate</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Program Type</label>
              <select
                value={type}
                onChange={handleTypeChange}
                className="w-full border rounded px-2 py-1"
              >
                <option value="engineering">Engineering</option>
                <option value="non-engineering">Non-Engineering</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">SSC Weight (%)</label>
              <Input
                type="number"
                value={sscWeight}
                onChange={(e) => setSscWeight(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Intermediate Weight (%)</label>
              <Input
                type="number"
                value={interWeight}
                onChange={(e) => setInterWeight(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Test Weight (%)</label>
              <Input
                type="number"
                value={testWeight}
                onChange={(e) => setTestWeight(Number(e.target.value))}
                disabled={type === "non-engineering"} // Disable for Non-Engineering
              />
            </div>
            <Button onClick={updateWeightages} className="w-full mt-4">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Aggregate;