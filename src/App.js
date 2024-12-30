import React, { useState } from 'react';
import './App.css';

function App() {

  const [numTeeth, setNumTeeth] = useState('');
  const [pitchDiameter, setPitchDiameter] = useState('');
  const [pressureAngle, setPressureAngle] = useState('');
  const [gearData, setGearData] = useState({
    module: null,
    baseDiameter: null,
    addendum: null,
    dedendum: null,
    pitchCircleRadius: null,
  });
  const [error, setError] = useState('');

  
  const calculateGear = () => {
    if (numTeeth && pitchDiameter && pressureAngle) {
      const module = pitchDiameter / numTeeth;
      const baseDiameter = pitchDiameter * Math.cos((pressureAngle * Math.PI) / 180);
      const addendum = module;
      const dedendum = module * 1.25; 

      setGearData({
        module,
        baseDiameter,
        addendum,
        dedendum,
        pitchCircleRadius: pitchDiameter / 2,
      });
      setError('');
    } else {
      setError('Please fill in all fields before calculating.');
    }
  };

  
  return (
    <div className="App">
      <header className="App-header">
        <h1>Gear Design Calculator</h1>
        <div className="inputs">
          <div className="input-group">
            <label>Number of Teeth:</label>
            <input
              type="number"
              value={numTeeth}
              onChange={(e) => setNumTeeth(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label>Pitch Diameter (mm):</label>
            <input
              type="number"
              value={pitchDiameter}
              onChange={(e) => setPitchDiameter(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label>Pressure Angle (°):</label>
            <input
              type="number"
              value={pressureAngle}
              onChange={(e) => setPressureAngle(e.target.value)}
            />
          </div>
          <button onClick={calculateGear}>Calculate</button>
        </div>

        {error && (
          <div className="error-message" style={{ animation: 'shake 0.5s ease' }}>
            {error}
          </div>
        )}

        <div className="gear-data-container">
          <h3>Calculated Gear Parameters:</h3>
          {gearData.module !== null && (
            <div className="gear-data-card">
              <ul>
                <li>Module: {gearData.module ? gearData.module.toFixed(2) : 'N/A'} mm</li>
                <li>Base Diameter: {gearData.baseDiameter ? gearData.baseDiameter.toFixed(2) : 'N/A'} mm</li>
                <li>Addendum: {gearData.addendum ? gearData.addendum : 'N/A'} mm</li>
                <li>Dedendum: {gearData.dedendum ? gearData.dedendum.toFixed(2) : 'N/A'} mm</li>
                <li>Pitch Circle Radius: {gearData.pitchCircleRadius ? gearData.pitchCircleRadius.toFixed(2) : 'N/A'} mm</li>
              </ul>
            </div>
          )}
        </div>

        <div className="gear-visualization-container">
          <h3>Gear Visual Representation:</h3>
          {gearData.pitchCircleRadius !== null && (
            <svg width="600" height="600" className="gear-svg">
              {/* Draw Pitch Circle */}
              <circle
                cx="300"
                cy="300"
                r={gearData.pitchCircleRadius * 5} 
                stroke="#f44336" 
                strokeWidth="4"
                fill="none"
              />
              {/* Draw Base Circle */}
              <circle
                cx="300"
                cy="300"
                r={gearData.baseDiameter * 2} 
                stroke="#2196F3" 
                strokeWidth="4"
                fill="none"
              />
              {/* Draw Teeth (simplified representation) */}
              {Array.from({ length: numTeeth }).map((_, index) => {
                const angle = (index * 2 * Math.PI) / numTeeth;
                const x1 = 300 + gearData.pitchCircleRadius * 5 * Math.cos(angle);
                const y1 = 300 + gearData.pitchCircleRadius * 5 * Math.sin(angle);
                const x2 = 300 + (gearData.pitchCircleRadius * 5 + gearData.addendum * 5) * Math.cos(angle);
                const y2 = 300 + (gearData.pitchCircleRadius * 5 + gearData.addendum * 5) * Math.sin(angle);
                return <line key={index} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#FFC107" strokeWidth="4" />;
              })}
            </svg>
          )}
        </div>
      </header>
    </div>
  );
}

export default App;
