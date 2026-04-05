import React, { useState } from 'react';
import { Network, FileImage } from 'lucide-react';
import MultimodalVisualizer from './MultimodalVisualizer';
import ResponsibleAIBanner from '../ResponsibleAIBanner';

const BreastCancerMultimodalForm = ({ onComplete, history, onClearHistory }) => {
  const [mammoFile, setMammoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleAnalyze = async () => {
    if (!mammoFile) return;
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('mammogram_file', mammoFile);
      
      const response = await fetch('http://localhost:8000/predict/breast-cancer', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        setResults(data.data);
        if (onComplete) onComplete(data.data.combined_prediction, data.data.confidence, data.data.responsible_ai?.safety?.safety_flag);
      } else {
        console.error("Backend Error:", data.message);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
       <h2 style={{ marginBottom: '1rem', fontSize: '2rem' }}>Breast Oncology Scanner</h2>
       <ResponsibleAIBanner safetyWarning={results?.responsible_ai?.safety?.safety_message} />
       
       {!results && (
       <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr)', gap: '2rem', marginBottom: '2rem' }}>
          {/* Mammogram Input */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
             <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <FileImage size={20} className="text-accent" /> Mammogram Scan
             </h3>
             <label htmlFor="mammo-upload" className="upload-zone" style={{ display: 'block', padding: '2rem', cursor: 'pointer' }}>
                <input 
                  type="file" 
                  id="mammo-upload" 
                  style={{ display: 'none' }} 
                  accept="image/*"
                  onChange={(e) => setMammoFile(e.target.files[0])}
                />
                <h4 style={{ color: 'var(--text-secondary)' }}>{mammoFile ? mammoFile.name : "Upload Mammogram"}</h4>
             </label>
          </div>
       </div>
       )}

       {!results && (
         <button className="stellar-btn" onClick={handleAnalyze} disabled={loading || !mammoFile}>
            <Network />
            {loading ? 'Analyzing Neural Images...' : 'Initialize Diagnostic'}
         </button>
       )}

       {results && (
         <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
           <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
              <button 
                className="stellar-btn" 
                style={{ width: 'auto', padding: '0.5rem 1.5rem', fontSize: '0.875rem' }} 
                onClick={() => { setResults(null); setMammoFile(null); }}
              >
                Perform New Scan
              </button>
           </div>
           <MultimodalVisualizer 
             results={results} 
             history={history} 
             onClearHistory={onClearHistory} 
           />
         </div>
       )}
    </div>
  );
};

export default BreastCancerMultimodalForm;
