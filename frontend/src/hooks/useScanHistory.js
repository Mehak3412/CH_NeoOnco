import { useState, useEffect } from 'react';

export const useScanHistory = () => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line
  }, []);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/history');
      if (response.ok) {
        const result = await response.json();
        if (result.status === 'success') {
          // Format backend history to match frontend expectations
          const formattedHistory = result.data.map(entry => ({
            id: entry.id,
            date: new Date(entry.timestamp).toLocaleString(),
            type: entry.type === 'brain_tumor' ? 'neuro' : 'breast',
            prediction: entry.prediction,
            confidence: entry.confidence,
            has_warning: !!entry.additional_data?.responsible_ai?.safety_flag,
            report: entry.report,
            files: entry.files || [],
            heatmap: entry.additional_data?.ml_results?.[0]?.heatmap_url || null,
            mammogram: entry.additional_data?.mammogram || null,
            mri_analysis: entry.additional_data?.mri || null
          }));
          setHistory(formattedHistory);
          // Sync backend data to local cache as well
          localStorage.setItem('scanAI_history', JSON.stringify(formattedHistory));
          setIsLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn("Failed to fetch history from backend, falling back to local storage.", e);
    }

    // Fallback to local storage
    try {
      const stored = localStorage.getItem('scanAI_history');
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load local history", e);
    }
    setIsLoading(false);
  };

  const saveScan = (diseaseType, resultData) => {
    try {
      // Local sync (Backend persists it directly during the API call)
      const newEntry = {
        id: resultData.history_id || Date.now(),
        date: new Date().toLocaleString(),
        type: diseaseType,
        ...resultData
      };
      
      const updatedHistory = [newEntry, ...history].slice(0, 50); // Keep last 50 scans
      
      localStorage.setItem('scanAI_history', JSON.stringify(updatedHistory));
      setHistory(updatedHistory);
    } catch (e) {
      console.error("Failed to save history securely.", e);
    }
  };

  const clearHistory = () => {
    localStorage.removeItem('scanAI_history');
    setHistory([]);
    console.log("Device history cleared. (Backend history remains intact).");
  };

  return { history, saveScan, clearHistory, isLoading };
};
