import React from 'react';
import { AlertCircle, FileWarning, Info } from 'lucide-react';

const ResponsibleAIBanner = ({ safetyWarning = null }) => {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <div className="ai-banner banner-info">
        <Info size={24} />
        <div>
          <strong>Medical Disclaimer:</strong> This system is an Assistive Clinical Model (ACM). 
          It is NOT a replacement for professional medical diagnosis. All predictions must be verified by a qualified healthcare professional.
        </div>
      </div>
      
      {safetyWarning && (
        <div className="ai-banner banner-warning">
          <FileWarning size={24} />
          <div>
            <strong>Safety Mechanism Triggered:</strong> {safetyWarning}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResponsibleAIBanner;
