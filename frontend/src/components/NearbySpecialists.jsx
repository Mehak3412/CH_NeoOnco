import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, Navigation, X, Search } from 'lucide-react';

const NearbySpecialists = ({ pathology }) => {
  const [locationState, setLocationState] = useState('idle'); // idle, loading, success, error
  const [coords, setCoords] = useState(null);
  const [manualLocation, setManualLocation] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleManualSearch = () => {
    if (!manualLocation.trim()) return;
    setSearchQuery(manualLocation);
    setShowMap(true);
  };

  const requestLocation = () => {
    setLocationState('loading');
    
    if (!navigator.geolocation) {
      setLocationState('error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLocationState('success');
        // Use coordinates to fuel the query
        setSearchQuery(`${position.coords.latitude},${position.coords.longitude}`);
        setShowMap(true);
      },
      (err) => {
        console.warn("Geolocation blocked or failed.", err);
        setLocationState('error');
      }
    );
  };

  const closeMapModal = () => {
    setShowMap(false);
  };

  const mapQuery = `${pathology === 'neuro' ? 'Neuro-oncologist' : 'Breast Cancer Specialist'} near ${searchQuery}`;

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <MapPin className="text-warning" size={20} /> 
        Find Treatment Centers
      </h3>

      <div style={{ textAlign: 'center', padding: '1rem 0' }}>
         <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
           Enter your location manually or enable GPS to find {pathology === 'neuro' ? 'Neuro-oncologists' : 'Breast Cancer centers'} near you.
         </p>
         
         <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
           <input 
             type="text" 
             className="stellar-input" 
             placeholder="Enter your city or address..." 
             value={manualLocation}
             onChange={(e) => setManualLocation(e.target.value)}
             style={{ flex: 1 }}
             onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
           />
           <button className="stellar-btn" style={{ width: 'auto', padding: '0.5rem 1rem' }} onClick={handleManualSearch}>
             <Search size={16} /> Search
           </button>
         </div>

         <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1rem 0' }}>
           <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
           <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>OR</span>
           <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
         </div>

         <button className="stellar-btn" style={{ width: '100%', padding: '0.5rem' }} onClick={requestLocation}>
           <Navigation size={16} /> {locationState === 'loading' ? 'Locating...' : 'Use GPS Location'}
         </button>
         
         {locationState === 'error' && (
           <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '1rem' }}>
             Location access denied or failed. Please enter manually.
           </p>
         )}
      </div>

      {/* Map Modal */}
      {showMap && typeof window !== 'undefined' && createPortal(
        <div className="modal-overlay" onClick={closeMapModal} style={{ zIndex: 9999 }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)' }}>
               <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <MapPin className="text-danger" /> Oncology Providers Near You
               </h3>
               <button className="modal-close-btn" style={{ position: 'relative', top: 0, right: 0 }} onClick={closeMapModal}>
                 <X size={24} />
               </button>
            </div>
            
            <div style={{ width: '100%', height: '500px', background: '#e5e7eb', position: 'relative' }}>
               <iframe 
                 width="100%" 
                 height="100%" 
                 style={{ border: 0 }}
                 loading="lazy" 
                 allowFullScreen 
                 referrerPolicy="no-referrer-when-downgrade" 
                 src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=12&ie=UTF8&iwloc=&output=embed`}
               ></iframe>
            </div>

            <div style={{ padding: '1rem', background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>Showing verified clinical specialists via Maps.</p>
               <button className="stellar-btn" style={{ padding: '0.5rem 1rem', width: 'auto' }} onClick={closeMapModal}>Close Map</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default NearbySpecialists;
