import React, { useState, useEffect, useRef } from 'react';
import { toPng, toJpeg, toBlob, toPixelData, toSvg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import './App.css';

function App() {
  const [numTeeth, setNumTeeth] = useState('');
  const [pitchDiameter, setPitchDiameter] = useState('');
  const [pressureAngle, setPressureAngle] = useState(20);
  const [gearData, setGearData] = useState({
    module: null,
    baseDiameter: null,
    addendum: null,
    dedendum: null,
    pitchCircleRadius: null,
    circularPitch: null,
    toothThickness: null,
    clearance: null,
  });
  const [error, setError] = useState('');
  const [isCalculated, setIsCalculated] = useState(false);
  const [activeTab, setActiveTab] = useState('calculator');
  const [darkMode, setDarkMode] = useState(false); // Default to light mode
  const gearSvgRef = useRef(null);
  const [rotationAngle, setRotationAngle] = useState(0);

  // Rotate gears in header
  useEffect(() => {
    const interval = setInterval(() => {
      setRotationAngle(prev => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isCalculated) {
      const timer = setTimeout(() => {
        setIsCalculated(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isCalculated]);

  const calculateGear = () => {
    if (!numTeeth || !pitchDiameter || !pressureAngle) {
      setError('Please fill in all fields before calculating.');
      return;
    }

    if (numTeeth <= 0 || pitchDiameter <= 0 || pressureAngle <= 0) {
      setError('All values must be positive numbers.');
      return;
    }

    const module = pitchDiameter / numTeeth;
    const baseDiameter = pitchDiameter * Math.cos((pressureAngle * Math.PI) / 180);
    const addendum = module;
    const dedendum = module * 1.25;
    const circularPitch = Math.PI * module;
    const toothThickness = circularPitch / 2;
    const clearance = dedendum - addendum;

    setGearData({
      module,
      baseDiameter,
      addendum,
      dedendum,
      pitchCircleRadius: pitchDiameter / 2,
      circularPitch,
      toothThickness,
      clearance,
    });
    setError('');
    setIsCalculated(true);
  };

  const resetForm = () => {
    setNumTeeth('');
    setPitchDiameter('');
    setPressureAngle(20);
    setGearData({
      module: null,
      baseDiameter: null,
      addendum: null,
      dedendum: null,
      pitchCircleRadius: null,
      circularPitch: null,
      toothThickness: null,
      clearance: null,
    });
    setError('');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const downloadPdf = async () => {
    if (!gearSvgRef.current) return;

    try {
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Add title
      pdf.setFontSize(20);
      pdf.setTextColor(darkMode ? 255 : 0);
      pdf.text('Gear Design Report', 105, 20, { align: 'center' });
      
      // Add calculated parameters
      pdf.setFontSize(12);
      pdf.text('Calculated Parameters:', 20, 40);
      
      const params = [
        `Module: ${gearData.module.toFixed(4)} mm`,
        `Base Diameter: ${gearData.baseDiameter.toFixed(4)} mm`,
        `Addendum: ${gearData.addendum.toFixed(4)} mm`,
        `Dedendum: ${gearData.dedendum.toFixed(4)} mm`,
        `Pitch Circle Radius: ${gearData.pitchCircleRadius.toFixed(4)} mm`,
        `Circular Pitch: ${gearData.circularPitch.toFixed(4)} mm`,
        `Tooth Thickness: ${gearData.toothThickness.toFixed(4)} mm`,
        `Clearance: ${gearData.clearance.toFixed(4)} mm`
      ];
      
      params.forEach((param, i) => {
        pdf.text(param, 20, 50 + (i * 7));
      });
      
      // Add gear image
      const svgDataUrl = await toSvg(gearSvgRef.current);
      pdf.addImage(svgDataUrl, 'PNG', 30, 110, 150, 150);
      
      // Save PDF
      pdf.save('gear-design-report.pdf');
    } catch (err) {
      console.error('Error generating PDF:', err);
    }
  };

  // Function to generate gear tooth path
  const generateGearToothPath = (index, totalTeeth, outerRadius, innerRadius, addendumRadius, dedendumRadius) => {
    const angle = (index * 2 * Math.PI) / totalTeeth;
    const nextAngle = ((index + 1) * 2 * Math.PI) / totalTeeth;
    const halfAngle = angle + (nextAngle - angle) / 2;

    // Points for the tooth profile
    const p1 = { // Start at dedendum circle
      x: 300 + innerRadius * Math.cos(angle),
      y: 300 + innerRadius * Math.sin(angle)
    };
    const p2 = { // Base circle
      x: 300 + innerRadius * Math.cos(halfAngle),
      y: 300 + innerRadius * Math.sin(halfAngle)
    };
    const p3 = { // Pitch circle
      x: 300 + outerRadius * Math.cos(halfAngle),
      y: 300 + outerRadius * Math.sin(halfAngle)
    };
    const p4 = { // Addendum circle
      x: 300 + addendumRadius * Math.cos(angle),
      y: 300 + addendumRadius * Math.sin(angle)
    };
    const p5 = { // Next dedendum circle
      x: 300 + innerRadius * Math.cos(nextAngle),
      y: 300 + innerRadius * Math.sin(nextAngle)
    };

    // Create a smooth path for the tooth
    return `
      M ${p1.x} ${p1.y}
      L ${p2.x} ${p2.y}
      L ${p3.x} ${p3.y}
      L ${p4.x} ${p4.y}
      L ${p5.x} ${p5.y}
    `;
  };

  return (
    <div className={`App ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <header className="App-header">
        <div className="header-container">
          <div className="title-container">
            <svg width="60" height="60" viewBox="0 0 100 100" className="header-gear">
              <path 
                d="M50 20 L55 20 L57 25 L62 23 L60 28 L65 30 L62 35 L67 37 L62 40 L65 45 L60 47 L57 52 L55 50 L50 50 L45 50 L43 52 L40 47 L35 45 L38 40 L33 37 L38 35 L35 30 L40 28 L38 23 L43 25 L45 20 L50 20 Z"
                fill="#3498db"
                transform={`rotate(${rotationAngle}, 50, 50)`}
              />
            </svg>
            <h1 className="app-title">Gear Design Calculator</h1>
            <svg width="60" height="60" viewBox="0 0 100 100" className="header-gear">
              <path 
                d="M50 20 L55 20 L57 25 L62 23 L60 28 L65 30 L62 35 L67 37 L62 40 L65 45 L60 47 L57 52 L55 50 L50 50 L45 50 L43 52 L40 47 L35 45 L38 40 L33 37 L38 35 L35 30 L40 28 L38 23 L43 25 L45 20 L50 20 Z"
                fill="#e74c3c"
                transform={`rotate(${-rotationAngle}, 50, 50)`}
              />
            </svg>
          </div>
          <div className="theme-toggle" onClick={toggleDarkMode}>
            {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </div>
        </div>

        <div className="tabs">
          <button 
            className={`tab-button ${activeTab === 'calculator' ? 'active' : ''}`}
            onClick={() => setActiveTab('calculator')}
          >
            Calculator
          </button>
          <button 
            className={`tab-button ${activeTab === 'visualization' ? 'active' : ''}`}
            onClick={() => setActiveTab('visualization')}
            disabled={!gearData.module}
          >
            Visualization
          </button>
          <button 
            className={`tab-button ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            About
          </button>
        </div>

        {activeTab === 'calculator' && (
          <div className="calculator-container">
            <div className="inputs">
              <div className="input-group">
                <label>Number of Teeth (N):</label>
                <input
                  type="number"
                  value={numTeeth}
                  onChange={(e) => setNumTeeth(e.target.value)}
                  placeholder="e.g., 24"
                  min="1"
                />
              </div>
              <div className="input-group">
                <label>Pitch Diameter (D) in mm:</label>
                <input
                  type="number"
                  value={pitchDiameter}
                  onChange={(e) => setPitchDiameter(e.target.value)}
                  placeholder="e.g., 48"
                  step="0.01"
                  min="0.01"
                />
              </div>
              <div className="input-group">
                <label>Pressure Angle (α) in °:</label>
                <select
                  value={pressureAngle}
                  onChange={(e) => setPressureAngle(e.target.value)}
                >
                  <option value="14.5">14.5° (Common for older gears)</option>
                  <option value="20">20° (Most common)</option>
                  <option value="25">25° (High strength)</option>
                </select>
              </div>
              <div className="button-group">
                <button 
                  className="calculate-button" 
                  onClick={calculateGear}
                  disabled={!numTeeth || !pitchDiameter}
                >
                  Calculate
                </button>
                <button 
                  className="reset-button" 
                  onClick={resetForm}
                >
                  Reset
                </button>
              </div>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {isCalculated && (
              <div className="success-message">
                Calculations completed successfully!
              </div>
            )}

            <div className="gear-data-container">
              <h3>Calculated Gear Parameters:</h3>
              {gearData.module !== null ? (
                <div className="gear-data-grid">
                  <div className="data-card">
                    <h4>Module (m)</h4>
                    <p>{gearData.module.toFixed(4)} mm</p>
                    <p className="formula">m = D/N</p>
                  </div>
                  <div className="data-card">
                    <h4>Base Diameter</h4>
                    <p>{gearData.baseDiameter.toFixed(4)} mm</p>
                    <p className="formula">D<sub>b</sub> = D × cos(α)</p>
                  </div>
                  <div className="data-card">
                    <h4>Addendum</h4>
                    <p>{gearData.addendum.toFixed(4)} mm</p>
                    <p className="formula">a = m</p>
                  </div>
                  <div className="data-card">
                    <h4>Dedendum</h4>
                    <p>{gearData.dedendum.toFixed(4)} mm</p>
                    <p className="formula">b = 1.25m</p>
                  </div>
                  <div className="data-card">
                    <h4>Circular Pitch</h4>
                    <p>{gearData.circularPitch.toFixed(4)} mm</p>
                    <p className="formula">p = πm</p>
                  </div>
                  <div className="data-card">
                    <h4>Tooth Thickness</h4>
                    <p>{gearData.toothThickness.toFixed(4)} mm</p>
                    <p className="formula">t = p/2</p>
                  </div>
                  <div className="data-card">
                    <h4>Clearance</h4>
                    <p>{gearData.clearance.toFixed(4)} mm</p>
                    <p className="formula">c = b - a</p>
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <p>Enter gear parameters and click Calculate to see results</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'visualization' && gearData.module && (
          <div className="visualization-container">
            <div className="visualization-header">
              <h3>Gear Visual Representation</h3>
              <button className="download-button" onClick={downloadPdf}>
                Download PDF Report
              </button>
            </div>
            <div className="gear-svg-container" ref={gearSvgRef}>
              <svg width="500" height="500" viewBox="0 0 600 600" className="gear-svg">
                {/* Draw Dedendum Circle */}
                <circle
                  cx="300"
                  cy="300"
                  r={gearData.pitchCircleRadius * 5 - gearData.dedendum * 5}
                  className="dedendum-circle"
                  fill={darkMode ? "#2c3e50" : "#f5f7fa"}
                />
                
                {/* Draw Base Circle */}
                <circle
                  cx="300"
                  cy="300"
                  r={gearData.baseDiameter * 2.5}
                  className="base-circle"
                />
                
                {/* Draw Pitch Circle */}
                <circle
                  cx="300"
                  cy="300"
                  r={gearData.pitchCircleRadius * 5}
                  className="pitch-circle"
                />
                
                {/* Draw Addendum Circle */}
                <circle
                  cx="300"
                  cy="300"
                  r={gearData.pitchCircleRadius * 5 + gearData.addendum * 5}
                  className="addendum-circle"
                />
                
                {/* Draw Gear Teeth */}
                {Array.from({ length: numTeeth }).map((_, index) => {
                  const outerRadius = gearData.pitchCircleRadius * 5;
                  const innerRadius = gearData.baseDiameter * 2.5;
                  const addendumRadius = outerRadius + gearData.addendum * 5;
                  const dedendumRadius = outerRadius - gearData.dedendum * 5;
                  
                  const pathData = generateGearToothPath(
                    index, 
                    numTeeth, 
                    outerRadius, 
                    innerRadius, 
                    addendumRadius, 
                    dedendumRadius
                  );
                  
                  return (
                    <path
                      key={index}
                      d={pathData}
                      className="gear-tooth"
                      fill={darkMode ? "#3498db" : "#2980b9"}
                      stroke={darkMode ? "#ecf0f1" : "#2c3e50"}
                      strokeWidth="1"
                    />
                  );
                })}
                
                {/* Center point */}
                <circle cx="300" cy="300" r="5" fill="#e74c3c" />
              </svg>
            </div>
            
            <div className="legend">
              <div className="legend-item">
                <div className="color-box base-circle"></div>
                <span>Base Circle</span>
              </div>
              <div className="legend-item">
                <div className="color-box pitch-circle"></div>
                <span>Pitch Circle</span>
              </div>
              <div className="legend-item">
                <div className="color-box addendum-circle"></div>
                <span>Addendum Circle</span>
              </div>
              <div className="legend-item">
                <div className="color-box dedendum-circle"></div>
                <span>Dedendum Circle</span>
              </div>
              <div className="legend-item">
                <div className="color-box gear-tooth"></div>
                <span>Gear Teeth</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="about-container">
            <h3>About the Gear Design Calculator</h3>
            <div className="about-card">
              <p>This calculator helps engineers and designers with basic spur gear calculations.</p>
              <p><strong>Key Parameters:</strong></p>
              <ul>
                <li><strong>Module (m):</strong> Ratio of pitch diameter to number of teeth</li>
                <li><strong>Addendum:</strong> Radial distance from pitch circle to top of tooth</li>
                <li><strong>Dedendum:</strong> Radial distance from pitch circle to bottom of tooth space</li>
                <li><strong>Pressure Angle:</strong> Angle between tooth profile and gear wheel tangent</li>
              </ul>
              <p>For more accurate designs, consult engineering standards like AGMA or ISO.</p>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
