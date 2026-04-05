import React from 'react';
import { ChevronDown, ScanLine } from 'lucide-react';

const LandingHero = () => {
  const scrollToSelection = () => {
    document.getElementById('disease-selector').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="hero-section">
      <div className="hero-pulse"></div>
      
      <div style={{ animation: 'float 6s ease-in-out infinite', marginBottom: '2rem' }}>
        <ScanLine size={80} color="var(--accent)" strokeWidth={1} />
      </div>
      
      <h1 className="hero-title">NeoOnco AI</h1>
      
      <p className="hero-subtitle">
        Intelligent, responsible, and privacy-first multi-disease diagnostic support. 
        Advanced convolutional analysis engineered directly for clinicians.
      </p>

      <button className="stellar-btn" style={{ width: 'auto', padding: '1rem 3rem', fontSize: '1.1rem' }} onClick={scrollToSelection}>
        Start Diagnostics
      </button>

      <div style={{ position: 'absolute', bottom: '2rem', animation: 'float 2s ease-in-out infinite' }}>
        <ChevronDown size={32} color="var(--text-secondary)" />
      </div>
    </div>
  );
};

export default LandingHero;
