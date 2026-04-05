import React from 'react';
import { ShieldCheck, Target } from 'lucide-react';
import InlineHistory from '../InlineHistory';
import NearbySpecialists from '../NearbySpecialists';

const MultimodalVisualizer = ({ results, history, onClearHistory }) => {
  const isMalignant = results.combined_prediction === "Malignant";
  const confidenceColor = isMalignant ? 'var(--danger)' : 'var(--success)';

  return (
    <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1fr', gap: '2rem' }}>
      
      {/* LEFT COLUMN: Summary and History */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: `4px solid ${confidenceColor}` }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Target /> Ensemble Diagnosis
          </h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
            <div>
              <h3 style={{ color: confidenceColor, fontSize: '1.5rem' }}>{results.combined_prediction}</h3>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{(results.confidence * 100).toFixed(1)}%</div>
          </div>
          
          <div style={{ marginTop: '1rem', background: 'rgba(0,0,0,0.3)', height: '12px', borderRadius: '6px', overflow: 'hidden', marginBottom: '1rem' }}>
             <div style={{ 
               width: `${results.confidence * 100}%`, 
               height: '100%', 
               background: confidenceColor,
               transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)'
             }}></div>
          </div>

          {results.responsible_ai?.safety?.safety_flag === false && (
             <div style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck /> Safe to output
             </div>
          )}
          {results.report && (
            <div style={{ marginTop: '1rem' }}>
              <h4 style={{ marginBottom: '0.5rem' }}>Diagnostic Summary</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                {results.report.summary || results.report}
              </p>
            </div>
          )}
        </div>

        <NearbySpecialists pathology="breast" />
      </div>

      {/* RIGHT COLUMN: Scans and Heatmaps */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Grad-CAM Interpretability Focus</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {results.mammogram_analysis?.heatmap_url ? (
            <div style={{ border: '1px solid var(--border)', padding: '1rem', borderRadius: '8px' }}>
              <h4 style={{ marginBottom: '0.5rem' }}>Mammogram Feature Detection</h4>
              <img 
                src={`http://localhost:8000${results.mammogram_analysis.heatmap_url}`} 
                alt="Mammogram Grad-CAM" 
                className="result-image" 
                style={{ filter: 'hue-rotate(280deg)', maxHeight: '300px', objectFit: 'contain' }} 
              />
              <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Prediction: {results.mammogram_analysis.prediction} 
                ({(results.mammogram_analysis.confidence * 100).toFixed(1)}%)
              </p>
            </div>
          ) : (
            <div style={{ padding: '1rem', color: 'var(--text-secondary)', border: '1px dashed var(--border)', borderRadius: '8px', textAlign: 'center' }}>
              No Mammogram data available.
            </div>
          )}
          
        </div>
      </div>

    </div>
  );
};

export default MultimodalVisualizer;
