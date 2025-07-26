import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

const DepartmentShiftModal = ({ 
  isOpen, 
  onClose, 
  student, 
  programs, 
  onShift, 
  currentProgramId 
}) => {
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedSeatType, setSelectedSeatType] = useState('');
  const [availablePrograms, setAvailablePrograms] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && programs.length > 0) {
      // Filter out the current program and group by department
      const filtered = programs.filter(p => p.id !== currentProgramId);
      setAvailablePrograms(filtered);
      setSelectedDepartment('');
      setSelectedSeatType('');
    }
  }, [isOpen, programs, currentProgramId]);

  const getDepartmentName = (programName) => {
    // Extract department name from program name
    // Example: "Computer Science Engineering" -> "Computer Science"
    const parts = programName.split(' ');
    if (parts.length >= 2) {
      return parts.slice(0, -1).join(' ');
    }
    return programName;
  };

  const getSeatTypeOptions = () => [
    { value: 'O', label: 'Open Merit', description: '', color: 'bg-green-100 text-green-800' },
    { value: 'R', label: 'Rational Seats', description: '', color: 'bg-blue-100 text-blue-800' },
    { value: 'S', label: 'Self Finance', description: '', color: 'bg-yellow-100 text-yellow-800' }
  ];

  const getProgramsByDepartment = () => {
    const grouped = {};
    availablePrograms.forEach(program => {
      const deptName = getDepartmentName(program.name);
      if (!grouped[deptName]) {
        grouped[deptName] = [];
      }
      grouped[deptName].push(program);
    });
    return grouped;
  };

  const handleDepartmentSelect = (deptName) => {
    setSelectedDepartment(deptName);
    setSelectedSeatType('');
  };

  const handleShift = async () => {
    if (!selectedDepartment || !selectedSeatType) {
      alert('Please select both department and seat type');
      return;
    }

    setLoading(true);
    try {
      const deptPrograms = getProgramsByDepartment()[selectedDepartment];
      const targetProgram = deptPrograms.find(p => p.short_name.endsWith(`-${selectedSeatType}`));
      
      if (!targetProgram) {
        // Create a new program short name with the selected seat type
        const baseProgram = deptPrograms[0];
        const baseShortName = baseProgram.short_name.replace(/-[ORS]$/, '');
        const newShortName = `${baseShortName}-${selectedSeatType}`;
        
        // Create a modified program object
        const modifiedProgram = {
          ...baseProgram,
          short_name: newShortName,
          name: `${baseProgram.name} (${getSeatTypeOptions().find(opt => opt.value === selectedSeatType)?.label})`
        };
        
        await onShift(student.cnic, modifiedProgram);
      } else {
        await onShift(student.cnic, targetProgram);
      }
      
      onClose();
    } catch (error) {
      console.error('Error shifting student:', error);
      alert('Failed to shift student. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const seatTypeOptions = getSeatTypeOptions();
  const programsByDepartment = getProgramsByDepartment();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Shift Student to Another Department
          </DialogTitle>
          <DialogDescription>
            Select the target department and seat type for {student?.name} ({student?.cnic})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Student Info Card */}
          <Card className="bg-gray-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Current Student</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Name:</span>
                  <p className="text-gray-900">{student?.name}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">CNIC:</span>
                  <p className="text-gray-900">{student?.cnic}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Current Program:</span>
                  <p className="text-gray-900">{student?.program_name}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Current Seat Type:</span>
                  <Badge variant="outline" className="mt-1">
                    {student?.program_short_name?.endsWith('-O') ? 'Open Merit' : 
                     student?.program_short_name?.endsWith('-R') ? 'Rational' : 
                     student?.program_short_name?.endsWith('-S') ? 'Self Finance' : 'Unknown'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Department Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Select Target Department</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(programsByDepartment).map(([deptName, programs]) => (
                <Card 
                  key={deptName}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedDepartment === deptName 
                      ? 'ring-2 ring-blue-500 bg-blue-50' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleDepartmentSelect(deptName)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{deptName}</h4>
                        <p className="text-sm text-gray-600">
                          {programs.length} program{programs.length !== 1 ? 's' : ''} available
                        </p>
                      </div>
                      {selectedDepartment === deptName && (
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Seat Type Selection */}
          {selectedDepartment && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Select Seat Type</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {seatTypeOptions.map((option) => (
                  <Card 
                    key={option.value}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedSeatType === option.value 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedSeatType(option.value)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={option.color}>
                          {option.label}
                        </Badge>
                        {selectedSeatType === option.value && (
                          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{option.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleShift}
              disabled={!selectedDepartment || !selectedSeatType || loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Shifting...' : 'Shift Student'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DepartmentShiftModal; 