import React from 'react';
import { Clock, AlertTriangle, Trash2 } from 'lucide-react';

const InlineHistory = ({ history, filterType, onClear }) => {
  const filteredHistory = history.filter(entry => entry.type === filterType);

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <Clock size={20} className="text-accent" /> Scan History
        </h3>
        {filteredHistory.length > 0 && (
          <button 
            onClick={onClear} 
            style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem' }}
          >
            <Trash2 size={16} /> Clear
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
        {filteredHistory.length === 0 ? (
          <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem 0' }}>
            No previous scans recorded for this pathology.
          </div>
        ) : (
          filteredHistory.map(entry => (
            <div key={entry.id} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px', background: 'rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{entry.date}</span>
              </div>
              
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ color: entry.prediction === 'Malignant' || entry.prediction === 'Glioma' ? 'var(--danger)' : 'var(--success)', fontWeight: 'bold' }}>
                  {entry.prediction}
                </span>
                <span style={{ color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>
                  ({(entry.confidence * 100).toFixed(1)}%)
                </span>
              </div>

              {entry.has_warning && (
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--warning)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                   <AlertTriangle size={12} /> Low Confidence Trigged
                 </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default InlineHistory;
