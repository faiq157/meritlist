export const fetchVersions = async (programId) => {
    const res = await fetch(`/api/meritlist/versions?programId=${programId}`);
    const data = await res.json();
    return data.map((item) => item.version).sort((a, b) => a - b);
  };
  
  export const fetchMeritList = async (
    programId,
    programShortName,
    selectedVersion,
    setMeritList,
    setLoading
  ) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (programId) queryParams.append('programId', programId);
      if (programShortName) queryParams.append('programShortName', programShortName);
      if (selectedVersion) queryParams.append('version', selectedVersion.toString());
  
      const res = await fetch(`/api/meritlist?${queryParams}`);
      const data = await res.json();
  
      const filtered = data
        .filter((item) => item.version === selectedVersion)
        .map((item) => ({
          ...item,
          category: item.category === 'open_merit' ? 'Open Merit' : 'Self Finance',
        }))
        .sort((a, b) => a.rank - b.rank);
  
      setMeritList(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
export const confirmSeat = async (cnic, programId, programShortName, setMeritList) => {
  try {
    const res = await fetch(`/api/meritlist/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cnic, programId, programShortName }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || 'Error confirming seat');

    alert(data.message || 'Seat confirmed!');
    setMeritList((prev) =>
      prev.map((s) => (s.cnic === cnic ? { ...s, confirmed: true } : s))
    );
  } catch (err) {
    alert(err.message || 'Error confirming seat');
  }
};
  
  export const markAsNotAppeared = async (cnic, programId, programShortName, setMeritList) => {
    const res = await fetch('/api/meritlist/notappeared', {
      method: 'POST',
      body: JSON.stringify({ cnic, programId, programShortName }),
    });
  
    if (res.ok) {
      setMeritList((prev) =>
        prev.map((item) => (item.cnic === cnic ? { ...item, not_appeared: true } : item))
      );
    }
  };
  
  export const toggleLockSeat = async (cnic, programId, currentLock, setMeritList) => {
    const res = await fetch('/api/meritlist/lockseat', {
      method: 'POST',
      body: JSON.stringify({ cnic, programId, lock: !currentLock }),
    });
  
    if (res.ok) {
      setMeritList((prev) =>
        prev.map((item) =>
          item.cnic === cnic ? { ...item, lockseat: !currentLock } : item
        )
      );
    }
  };
  
  export const deleteVersion = async (programId, version) => {
    await fetch(`/api/meritlist/versions?programId=${programId}&version=${version}`, {
      method: 'DELETE',
    });
  };
  