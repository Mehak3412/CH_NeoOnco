import React from 'react';
import { Brain, Activity } from 'lucide-react';

const DiseaseSelector = ({ onSelect }) => {
  return (
    <div id="disease-selector" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4rem 0' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Select Target Pathology</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Choose a diagnostic pipeline to initialize specific neural networks.</p>
      </div>

      <div className="selector-grid">
        <div className="disease-card glass-panel" onClick={() => onSelect('neuro')}>
          <div className="disease-card-icon">
            <Brain size={32} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Brain Tumor</h3>
            <p style={{ color: 'var(--text-secondary)' }}>MRI Grad-CAM Analysis</p>
          </div>
        </div>

        <div className="disease-card glass-panel" onClick={() => onSelect('breast')}>
          <div className="disease-card-icon">
            <Activity size={32} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Breast Cancer</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Mammogram & MRI Combined Ensemble</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiseaseSelector;
