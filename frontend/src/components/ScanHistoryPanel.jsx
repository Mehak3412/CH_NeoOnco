import React, { useState } from 'react';
import { X, Clock, AlertTriangle, ShieldCheck, FileText, CheckCircle } from 'lucide-react';

const ScanHistoryPanel = ({ isOpen, onClose, history, filterType, onClear }) => {
  const [selectedEntry, setSelectedEntry] = useState(null);

  const handleEntryClick = (entry) => {
    setSelectedEntry(entry);
  };

  const closeReportModal = () => {
    setSelectedEntry(null);
  };

  return (
    <>
      <div className={`history-sidebar ${isOpen ? 'open' : ''}`}>
        <button className="history-close-btn" onClick={onClose}>
          <X size={24} />
        </button>

        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Clock size={24} /> Session History
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Data is strictly stored in browser cache. Click an entry to view the full diagnostic report.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {history.filter(h => filterType ? h.type === filterType : true).length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '2rem' }}>
              No history recorded for this pathology yet.
            </div>
          ) : (
            history.filter(h => filterType ? h.type === filterType : true).map(entry => (
              <div 
                key={entry.id} 
                className="history-item glass-panel" 
                style={{ cursor: 'pointer', transition: 'border-color 0.2s' }}
                onClick={() => handleEntryClick(entry)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <strong style={{ color: 'var(--accent)' }}>
                    {entry.type === 'neuro' ? "Brain MRI" : "Breast Oncology"}
                  </strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {entry.date}
                  </span>
                </div>
                
                <div style={{ marginBottom: '0.5rem' }}>
                  Prediction: <span style={{ color: entry.prediction === 'Malignant' || entry.prediction === 'Glioma' ? 'var(--danger)' : 'var(--success)' }}>
                    {entry.prediction}
                  </span>
                  <span style={{ color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>
                    ({(entry.confidence * 100).toFixed(1)}%)
                  </span>
                </div>

                {entry.has_warning && (
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--warning)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                     <AlertTriangle size={12} /> Low Confidence Triggers
                   </div>
                )}
              </div>
            ))
          )}
        </div>

        {history.length > 0 && (
          <button 
            onClick={onClear} 
            style={{ width: '100%', padding: '0.75rem', marginTop: '2rem', background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: '8px', cursor: 'pointer' }}
          >
            Clear Device History
          </button>
        )}
      </div>

      {selectedEntry && (
        <div className="modal-overlay" onClick={closeReportModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeReportModal}>
              <X size={24} />
            </button>
            
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
              <FileText /> Historical Diagnostic Report
            </h2>
            
            <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
              <div>
                <p style={{ color: 'var(--text-secondary)' }}>Scan Type</p>
                <p style={{ fontWeight: 'bold' }}>{selectedEntry.type === 'neuro' ? 'Brain Tumor Scan' : 'Breast Cancer Scan'}</p>
              </div>
              <div>
                <p style={{ color: 'var(--text-secondary)' }}>Timestamp</p>
                <p style={{ fontWeight: 'bold' }}>{selectedEntry.date}</p>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: `4px solid ${selectedEntry.prediction === 'Malignant' || selectedEntry.prediction === 'Glioma' ? 'var(--danger)' : 'var(--success)'}`, marginBottom: '2rem' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: selectedEntry.prediction === 'Malignant' || selectedEntry.prediction === 'Glioma' ? 'var(--danger)' : 'var(--success)', fontSize: '1.25rem', fontWeight: 'bold' }}>
                 <CheckCircle /> Prediction: {selectedEntry.prediction}
               </div>
               <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>Algorithm Confidence: {(selectedEntry.confidence * 100).toFixed(1)}%</p>
            </div>

            {/* Display Visual Images in History */}
            {(selectedEntry.heatmap || (selectedEntry.files && selectedEntry.files.length > 0)) && (
              <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', overflowX: 'auto' }}>
                {selectedEntry.heatmap && (
                  <div style={{ flex: 1 }}>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.875rem' }}>AI Heatmap Interpretation</p>
                    <img src={`http://localhost:8000${selectedEntry.heatmap}`} alt="Heatmap" style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', border: '1px solid var(--border)', borderRadius: '8px' }} />
                  </div>
                )}
                {selectedEntry.files && selectedEntry.files.length > 0 && selectedEntry.files.map((file, idx) => (
                  <div key={idx} style={{ flex: 1 }}>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Original Scan {idx + 1}</p>
                    <img src={`http://localhost:8000/${file}`} alt={`Scan ${idx}`} style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', border: '1px solid var(--border)', borderRadius: '8px' }} />
                  </div>
                ))}
              </div>
            )}

            {selectedEntry.report && typeof selectedEntry.report === 'object' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', lineHeight: '1.6' }}>
                  <div style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}><strong>Condition Summary:</strong> {selectedEntry.report.summary}</div>
                  <div><strong>Clinical Diagnosis:</strong> {selectedEntry.report.diagnosis}</div>
                  <div><strong>Spatial Localization:</strong> {selectedEntry.report.localization}</div>
                  <div><strong>Medical Precautions:</strong> {selectedEntry.report.precautions}</div>
                  <div><strong>Patient Next Steps:</strong> {selectedEntry.report.future_steps}</div>
                  <div style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                     <strong>Recommended Specialists:</strong> <br/><span style={{ whiteSpace: 'pre-wrap' }}>{selectedEntry.report.doctor_recommendations}</span>
                  </div>
                  <div>
                     <strong>Recommended Hospitals:</strong> <br/><span style={{ whiteSpace: 'pre-wrap' }}>{selectedEntry.report.hospital_recommendations}</span>
                  </div>
              </div>
            )}
            {selectedEntry.report && typeof selectedEntry.report === 'string' && (
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                 {selectedEntry.report}
              </div>
            )}
            {!selectedEntry.report && (
              <div style={{ color: 'var(--text-secondary)' }}>No advanced LLM report available for this entry.</div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ScanHistoryPanel;
