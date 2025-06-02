import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';

export const useMeritList = () => {
  const [meritList, setMeritList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);

  const searchParams = useSearchParams();
  const programId = searchParams.get('programId');
  const programShortName = searchParams.get('programShortName');

  useEffect(() => {
    const fetchVersions = async () => {
      if (!programId) return;
      try {
        const response = await fetch(`/api/meritlist/versions?programId=${programId}`);
        if (!response.ok) throw new Error('Failed to fetch versions');
        const data = await response.json();
        const versionNumbers = data.map((item) => item.version).sort((a, b) => a - b);
        setVersions(versionNumbers);
        setSelectedVersion(versionNumbers[0]);
      } catch (err) {
        console.error('Error fetching versions:', err);
      }
    };
    fetchVersions();
  }, [programId]);

  // Memoize fetchMeritList so it can be used outside useEffect
  const fetchMeritList = useCallback(async () => {
    if (!programId && !programShortName) return;
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (programId) queryParams.append('programId', programId);
      if (programShortName) queryParams.append('programShortName', programShortName);
      if (selectedVersion) queryParams.append('version', selectedVersion.toString());

      const response = await fetch(`/api/meritlist?${queryParams.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch merit list');
      const data = await response.json();

      const mappedData = data
        .filter((item) => item.version === selectedVersion)
        .map((item) => ({
          ...item,
          category: item.category === 'open_merit' ? 'Open Merit' : 'Self Finance',
        }))
        .sort((a, b) => a.rank - b.rank);

      setMeritList(mappedData);
    } catch (error) {
      console.error('Error fetching merit list:', error);
    } finally {
      setLoading(false);
    }
  }, [programId, programShortName, selectedVersion]);

  useEffect(() => {
    if (selectedVersion !== null) {
      fetchMeritList();
    }
  }, [selectedVersion, programId, programShortName, fetchMeritList]);

  return {
    meritList,
    loading,
    versions,
    selectedVersion,
    setSelectedVersion,
    setMeritList,
    programId,
    programShortName,
    fetchMeritList, // <-- Expose this for manual refresh
  };
};