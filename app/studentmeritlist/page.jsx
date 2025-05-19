'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User, Landmark, Hash, Star, BadgeCheck } from "lucide-react";
export default function StudentMeritList() {
  const [cnic, setCnic] = useState('');
  const [meritLists, setMeritLists] = useState([]);
  const [loading, setLoading] = useState(false);

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
      <div className=" flex justify-between gap-4">
        <div className='w-full'>
        <label className="block text-sm font-medium ">Enter CNIC Number</label>
        <Input
          type="text"
          value={cnic}
          onChange={(e) => setCnic(e.target.value)}
          placeholder="Enter your CNIC number"
          className="w-full"
        />
        </div>
          <Button className='mt-4' onClick={fetchMeritLists} disabled={loading}>
        {loading ? 'Loading...' : 'Get Merit Lists'}
      </Button>
      </div>
    

      <div className="mt-8">
      {meritLists.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meritLists.map((item, index) => (
            <Card
              key={index}
              className="rounded-2xl border shadow-sm transition-all hover:shadow-lg"
            >
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-blue-500" />
                  {item.program_name}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-foreground">Student Name:</span>
                  <span>{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-foreground">Short Name:</span>
                  <span>{item.program_short_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-foreground">Rank:</span>
                  <span>{item.rank}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="font-medium text-foreground">Merit:</span>
                  <span>{item.merit}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-green-500" />
                  <span className="font-medium text-foreground">Category:</span>
                  <span>{item.category}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No merit lists found for the provided CNIC.</p>
      )}
    </div>
    </div>
  );
}