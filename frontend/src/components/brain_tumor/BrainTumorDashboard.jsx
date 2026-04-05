import React, { useState } from 'react';
import { UploadCloud, CheckCircle, FileText } from 'lucide-react';
import ResponsibleAIBanner from '../ResponsibleAIBanner';
import InlineHistory from '../InlineHistory';
import NearbySpecialists from '../NearbySpecialists';

const BrainTumorDashboard = ({ onComplete, history, onClearHistory }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handlePredict = async () => {
    if (files.length === 0) return;
    setLoading(true);
    setError(null);
    
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));

    try {
      const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
      });
      
      const resData = await response.json();
      
      if (resData.status === 'success') {
        const { aggregated_prediction, aggregated_confidence, report, responsible_ai, ml_results } = resData.data;
        const uniquePredictions = Array.from(new Set(ml_results.map(r => r.prediction)));
        const displayPrediction = uniquePredictions.join(" & ");
        const hasMalignant = uniquePredictions.some(p => p !== 'No Tumor' && p !== 'No Tumor Detection' && p !== 'Benign' && p !== 'Normal');

        setResult({
          prediction: displayPrediction,
          hasMalignant: hasMalignant,
          confidence: aggregated_confidence,
          ml_results: ml_results,
          report: report,
          safety_message: responsible_ai?.safety_message
        });
        
        if(onComplete) onComplete(displayPrediction, aggregated_confidence, !!responsible_ai?.safety_flag, report);
      } else {
        setError(resData.message || "An error occurred during processing.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect to the backend server. Ensure it is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '1rem', fontSize: '2rem' }}>Neuro-Oncology Scan</h2>
      <ResponsibleAIBanner safetyWarning={result?.safety_message} />
      
      {!result && (
        <label htmlFor="neuro-mri-upload" className="upload-zone" style={{ display: 'block', padding: '3rem 2rem', cursor: 'pointer' }}>
          <input 
            type="file" 
            id="neuro-mri-upload" 
            style={{ display: 'none' }} 
            accept="image/*"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files))}
          />
          <UploadCloud className="upload-icon" style={{ margin: '0 auto 1rem auto' }} />
          <h3>{files.length > 0 ? `${files.length} file(s) selected` : "Click or drag Brain MRI scans to upload"}</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Supports PNG, JPG, DICOM</p>
        </label>
      )}

      {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</div>}

      {!result && (
        <button className="stellar-btn" onClick={handlePredict} disabled={files.length === 0 || loading}>
          {loading ? 'Analyzing Neural Scan...' : 'Execute Convolutional Scan'}
        </button>
      )}

      {/* 2-Column Results Layout */}
      {result && (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
             <button 
               className="stellar-btn" 
               style={{ width: 'auto', padding: '0.5rem 1.5rem', fontSize: '0.875rem' }} 
               onClick={() => { setResult(null); setFiles([]); }}
             >
               Perform New Scan
             </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1fr', gap: '2rem' }}>
            
            {/* LEFT COLUMN: Reports, Summerizations */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: `4px solid ${result.hasMalignant ? 'var(--danger)' : 'var(--success)'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: result.hasMalignant ? 'var(--danger)' : 'var(--success)', fontSize: '1.25rem', fontWeight: 'bold' }}>
                  <CheckCircle /> Prediction: {result.prediction}
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{(result.confidence * 100).toFixed(1)}%</div>
              </div>
              
              <div style={{ marginTop: '1rem', background: 'rgba(0,0,0,0.3)', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ 
                  width: `${result.confidence * 100}%`, 
                  height: '100%', 
                  background: result.hasMalignant ? 'var(--danger)' : 'var(--success)',
                  transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)'
                }}></div>
              </div>
              <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Algorithm Match Confidence Level</p>
            </div>

            {result?.report && (
              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <FileText size={20} className="text-accent"/> Diagnostic Report
                </h3>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                  {typeof result.report === 'object' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <div style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}><strong>Condition Summary:</strong> {result.report.summary}</div>
                      <div><strong>Clinical Diagnosis:</strong> {result.report.diagnosis}</div>
                      <div><strong>Spatial Localization:</strong> {result.report.localization}</div>
                      <div><strong>Medical Precautions:</strong> {result.report.precautions}</div>
                      <div><strong>Patient Next Steps:</strong> {result.report.future_steps}</div>
                    </div>
                  ) : (
                    <div style={{ whiteSpace: 'pre-wrap' }}>{result.report}</div>
                  )}
                </div>
              </div>
            )}

            <NearbySpecialists pathology="neuro" />
          </div>

        {/* RIGHT COLUMN: Grad-CAM Scanning Visuals */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {result?.ml_results?.length > 0 ? (
            result.ml_results.map((res, i) => (
              <div key={i} className="glass-panel" style={{ padding: '1.5rem', height: 'auto' }}>
                <h3 style={{ marginBottom: '1rem' }}>Grad-CAM Interpretability Focus {result.ml_results.length > 1 ? `(${i+1})` : ''} - {res.prediction}</h3>
                <img src={`http://localhost:8000${res.heatmap_url}`} alt={`Grad CAM Heatmap ${i+1}`} className="result-image" style={{ width: '100%', height: 'auto', maxHeight: '600px', objectFit: 'contain' }} /> 
              </div>
            ))
          ) : (
            <div className="glass-panel" style={{ padding: '1.5rem', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', border: '1px dashed var(--border)' }}>
              Awaiting Scan Image...
            </div>
          )}
        </div>
        
        </div>
        </div>
      )}
    </div>
  );
};

export default BrainTumorDashboard;
