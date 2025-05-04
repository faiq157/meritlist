'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function StudentMeritList() {
  const [cnic, setCnic] = useState('');
  const [meritLists, setMeritLists] = useState([]);
  const [loading, setLoading] = useState(false);
console.log("cnic", cnic);
  const fetchMeritLists = async () => {
    if (!cnic) {
      alert('Please enter a valid CNIC number.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/meritlist?cnic=${cnic}`);
      if (!response.ok) throw new Error('Failed to fetch merit lists');
      const data = await response.json();

      // Map category values to user-friendly labels
      const mappedData = data.map((item) => ({
        ...item,
        category: item.category === 'open_merit' ? 'Open Merit' : 'Self Finance',
      }));

      setMeritLists(mappedData);
    } catch (error) {
      console.error('Error fetching merit lists:', error);
      alert('Failed to fetch merit lists. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">Student Merit List</h1>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Enter CNIC Number</label>
        <Input
          type="text"
          value={cnic}
          onChange={(e) => setCnic(e.target.value)}
          placeholder="Enter your CNIC number"
          className="w-full"
        />
      </div>
      <Button onClick={fetchMeritLists} disabled={loading}>
        {loading ? 'Loading...' : 'Get Merit Lists'}
      </Button>

      <div className="mt-8">
        {meritLists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {meritLists.map((item, index) => (
              <div
                key={index}
                className="border rounded-lg shadow-md p-4 bg-white"
              >
                <h2 className="text-lg font-bold mb-2">{item.program_name}</h2>
                   
                <p className="text-sm text-gray-600">
                  <strong>Student Name:</strong> {item.name}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Short Name:</strong> {item.program_short_name}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Rank:</strong> {item.rank}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Merit:</strong> {item.merit}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Category:</strong> {item.category}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500">No merit lists found for the provided CNIC.</div>
        )}
      </div>
    </div>
  );
}