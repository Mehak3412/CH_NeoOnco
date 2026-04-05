import React, { useState } from 'react';
import { Shield, ArrowLeft, Clock } from 'lucide-react';
import LandingHero from './components/LandingHero';
import DiseaseSelector from './components/DiseaseSelector';
import BrainTumorDashboard from './components/brain_tumor/BrainTumorDashboard';
import BreastCancerMultimodalForm from './components/breast_cancer/BreastCancerMultimodalForm';
import { useScanHistory } from './hooks/useScanHistory';
import ScanHistoryPanel from './components/ScanHistoryPanel';
import Chatbot from './components/Chatbot';

function App() {
  const [activeView, setActiveView] = useState('landing'); // 'landing', 'neuro', 'breast'
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
  const [historyFilter, setHistoryFilter] = useState(null); // 'neuro' or 'breast'
  const { history, saveScan, clearHistory } = useScanHistory();

  const handleScanComplete = (type, prediction, confidence, hasWarning, report) => {
    saveScan(type, { prediction, confidence, has_warning: hasWarning, report });
  };

  const openHistory = (type) => {
    setHistoryFilter(type);
    setIsHistoryPanelOpen(true);
  };

  return (
    <div className="dashboard-container" style={{ position: 'relative' }}>
      {/* Top Universal Navigation */}
      <nav className="top-nav">
        <div className="nav-brand" style={{ cursor: 'pointer' }} onClick={() => setActiveView('landing')}>
          <Shield size={28} />
          NeoOnco AI
        </div>
      </nav>

      <ScanHistoryPanel 
        isOpen={isHistoryPanelOpen} 
        onClose={() => setIsHistoryPanelOpen(false)}
        history={history}
        filterType={historyFilter}
        onClear={clearHistory}
      />

      {/* Main View Router */}
      <main>
        {activeView === 'landing' && (
          <>
            <LandingHero />
            <DiseaseSelector onSelect={(type) => setActiveView(type)} />
          </>
        )}

        {activeView === 'neuro' && (
          <div className="glass-panel" style={{ padding: '2rem', animation: 'slideIn 0.4s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <button 
                className="history-btn" 
                style={{ display: 'inline-flex', padding: '0.5rem 1rem', border: 'none' }}
                onClick={() => setActiveView('landing')}
              >
                <ArrowLeft size={16} /> Home / Change Pathology
              </button>
              
              <button className="history-btn" onClick={() => openHistory('neuro')}>
                <Clock size={20} />
                Brain Tumor Scan History
              </button>
            </div>
            <BrainTumorDashboard 
               onComplete={(p, c, w, r) => handleScanComplete('neuro', p, c, w, r)} 
            />
          </div>
        )}

        {activeView === 'breast' && (
          <div className="glass-panel" style={{ padding: '2rem', animation: 'slideIn 0.4s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <button 
                className="history-btn" 
                style={{ display: 'inline-flex', padding: '0.5rem 1rem', border: 'none' }}
                onClick={() => setActiveView('landing')}
              >
                <ArrowLeft size={16} /> Home / Change Pathology
              </button>
              
              <button className="history-btn" onClick={() => openHistory('breast')}>
                <Clock size={20} />
                Breast Cancer History
              </button>
            </div>
            <BreastCancerMultimodalForm 
               onComplete={(p, c, w, r) => handleScanComplete('breast', p, c, w, r)} 
            />
          </div>
        )}
      </main>
      
      <Chatbot />
    </div>
  );
}

export default App;
