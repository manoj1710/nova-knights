import { useState, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, OrbitControls, PerspectiveCamera, Html } from '@react-three/drei';
import {
  ShieldAlert,
  FileText,
  Bell,
  Settings,
  Search,
  Cpu,
  RotateCcw,
  Maximize2,
  Printer,
  Share2,
  Download,
  Layers,
  AlertTriangle,
  Activity,
  CheckCircle2,
  RefreshCw,
  X,
  ExternalLink,
  Zap,
  ShieldCheck,
  Sparkles,
  Play,
  ArrowRight,
  ArrowLeft,
  Network,
  Save
} from 'lucide-react';

function TopBar({ activeView, onViewChange }) {
  const isLanding = activeView === 'landing';

  return (
    <header className={`topbar ${isLanding ? 'topbar-landing' : ''}`}>
      <div className="brand" onClick={() => onViewChange('landing')} style={{ cursor: 'pointer' }}>
        <div className="brand-mark">
          <Cpu size={22} />
        </div>
        <span>OmniInspect AI</span>
      </div>

      {isLanding ? (
        <nav className="topnav landing-topnav" aria-label="Public Navigation">
          <a href="#features" className="nav-link">Features</a>
          <a href="#technology" className="nav-link">Technology</a>
          <a href="#demo" className="nav-link">Live Demo</a>
          <a href="#stats" className="nav-link">Stats</a>
        </nav>
      ) : (
        <nav className="topnav" aria-label="Primary">
          <button
            type="button"
            className={activeView === 'dashboard' ? 'nav-link active' : 'nav-link'}
            onClick={() => onViewChange('dashboard')}
          >
            AI Inspection
          </button>
          <button
            type="button"
            className={activeView === 'validation' ? 'nav-link active' : 'nav-link'}
            onClick={() => onViewChange('validation')}
          >
            Human Validation
          </button>
          <button
            type="button"
            className={activeView === 'graph' ? 'nav-link active' : 'nav-link'}
            onClick={() => onViewChange('graph')}
          >
            Knowledge Graph
          </button>
          <button
            type="button"
            className={activeView === 'history' ? 'nav-link active' : 'nav-link'}
            onClick={() => onViewChange('history')}
          >
            Learning History
          </button>
          <button
            type="button"
            className={activeView === 'viewer' ? 'nav-link active' : 'nav-link'}
            onClick={() => onViewChange('viewer')}
          >
            3D Viewer
          </button>
          <button
            type="button"
            className={activeView === 'decision' ? 'nav-link active' : 'nav-link'}
            onClick={() => onViewChange('decision')}
          >
            Decision
          </button>
          <button
            type="button"
            className={activeView === 'reports' ? 'nav-link active' : 'nav-link'}
            onClick={() => onViewChange('reports')}
          >
            Reports
          </button>
        </nav>
      )}

      <div className="topbar-actions">
        {isLanding ? (
          <button
            className="primary-btn landing-topbar-cta"
            type="button"
            onClick={() => onViewChange('dashboard')}
          >
            <span>Launch Workspace</span>
            <ArrowRight size={16} />
          </button>
        ) : (
          <>
            <div className="search-pill">
              <Search size={16} className="search-icon" />
              <span>Search components...</span>
            </div>
            <button className="icon-btn" aria-label="Notifications" type="button">
              <Bell size={18} />
            </button>
            <button className="icon-btn" aria-label="Settings" type="button">
              <Settings size={18} />
            </button>
            <div className="avatar">JS</div>
            <div className="user-name">John Smith</div>
          </>
        )}
      </div>
    </header>
  );
}

function Hero3DModel({ isScanning, isWireframe, isHeatmap }) {
  const groupRef = useRef();
  const laserRef = useRef();

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.35;
    }
    if (laserRef.current && isScanning) {
      laserRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 2.8) * 1.05;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.1, 0]}>
      {/* Flat Countersunk Head Top */}
      <mesh position={[0, 0.95, 0]} castShadow>
        <cylinderGeometry args={[0.85, 0.85, 0.05, 32]} />
        <meshStandardMaterial
          color={isHeatmap ? '#ef4444' : isWireframe ? '#38bdf8' : '#e2e8f0'}
          wireframe={isWireframe}
          metalness={0.9}
          roughness={0.15}
          emissive={isHeatmap ? '#dc2626' : '#000000'}
          emissiveIntensity={isHeatmap ? 0.35 : 0}
        />
      </mesh>

      {/* Recessed Phillips Cross Drive (+) */}
      <group position={[0, 0.98, 0]}>
        <mesh rotation={[0, 0, 0]}>
          <boxGeometry args={[0.9, 0.04, 0.16]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.4} />
        </mesh>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[0.9, 0.04, 0.16]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.4} />
        </mesh>
      </group>

      {/* Countersunk Tapered Neck */}
      <mesh position={[0, 0.65, 0]} castShadow>
        <cylinderGeometry args={[0.85, 0.38, 0.55, 32]} />
        <meshStandardMaterial
          color={isWireframe ? '#38bdf8' : '#cbd5e1'}
          wireframe={isWireframe}
          metalness={0.92}
          roughness={0.18}
        />
      </mesh>

      {/* Main Cylindrical Threaded Shank */}
      <mesh position={[0, -0.25, 0]} castShadow>
        <cylinderGeometry args={[0.38, 0.38, 1.25, 32]} />
        <meshStandardMaterial
          color={isWireframe ? '#38bdf8' : '#94a3b8'}
          wireframe={isWireframe}
          metalness={0.95}
          roughness={0.15}
        />
      </mesh>

      {/* Helical Spiral Thread Rings */}
      {[0.25, 0.05, -0.15, -0.35, -0.55, -0.75].map((y, idx) => (
        <mesh key={idx} position={[0, y, 0]} rotation={[0.08, 0, 0]}>
          <torusGeometry args={[0.42, 0.05, 16, 32]} />
          <meshStandardMaterial
            color={y === -0.15 && isHeatmap ? '#ef4444' : isWireframe ? '#38bdf8' : '#64748b'}
            emissive={y === -0.15 && isHeatmap ? '#ef4444' : '#000000'}
            emissiveIntensity={y === -0.15 && isHeatmap ? 0.85 : 0}
            metalness={0.88}
          />
        </mesh>
      ))}

      {/* Pointed Tip (Gimlet Point) */}
      <mesh position={[0, -1.15, 0]} castShadow>
        <cylinderGeometry args={[0.38, 0.0, 0.55, 32]} />
        <meshStandardMaterial
          color={isWireframe ? '#38bdf8' : '#94a3b8'}
          wireframe={isWireframe}
          metalness={0.95}
          roughness={0.15}
        />
      </mesh>

      {/* Animated Laser Plane */}
      {isScanning && (
        <mesh ref={laserRef} position={[0, 0, 0]}>
          <cylinderGeometry args={[1.2, 1.2, 0.03, 32]} />
          <meshBasicMaterial color="#0284c7" transparent opacity={0.7} />
        </mesh>
      )}
    </group>
  );
}

function Hero({ onGetStarted }) {
  const [isScanning, setIsScanning] = useState(true);
  const [isWireframe, setIsWireframe] = useState(false);
  const [isHeatmap, setIsHeatmap] = useState(true);

  return (
    <section className="hero hero-landing">
      <div className="hero-copy">
        <div className="eyebrow-pill">
          <span className="live-dot" />
          <span>Industry 4.0 Autonomous Inspection</span>
          <Sparkles size={14} className="sparkle-icon" />
        </div>
        
        <h1 className="hero-title">
          Autonomous AI <br />
          <span className="gradient-text">Quality Inspection</span>
        </h1>
        
        <p className="hero-description">
          Inspect industrial components in real time using Explainable AI, sub-millimeter 3D visual analysis,
          and automated CAD alignment. Zero false positives. Zero downtime.
        </p>

        <div className="hero-actions">
          <button className="primary-btn hero-main-cta" type="button" onClick={onGetStarted}>
            <span>Launch Workspace</span>
            <ArrowRight size={18} />
          </button>
          <button className="secondary-btn hero-demo-cta" type="button" onClick={onGetStarted}>
            <Play size={16} />
            <span>View Live Demo</span>
          </button>
        </div>

        <div className="hero-specs-row">
          <div className="spec-badge">
            <Zap size={14} className="spec-icon cyan" />
            <span>&lt;12ms Edge Latency</span>
          </div>
          <div className="spec-badge">
            <ShieldCheck size={14} className="spec-icon blue" />
            <span>99.8% Sub-mm Accuracy</span>
          </div>
          <div className="spec-badge">
            <Activity size={14} className="spec-icon green" />
            <span>Zero False Positives</span>
          </div>
        </div>
      </div>

      <div className="hero-visual-3d">
        <div className="visual-top-bar">
          <div className="visual-status-tag">
            <span className="status-pulse-green" />
            <span>LIVE SCANNING • SCREW_M10_LINE_03</span>
          </div>
          <div className="visual-controls">
            <button
              type="button"
              className={`visual-pill-btn ${isScanning ? 'active' : ''}`}
              onClick={() => setIsScanning(!isScanning)}
            >
              <Zap size={13} />
              <span>Laser</span>
            </button>
            <button
              type="button"
              className={`visual-pill-btn ${isWireframe ? 'active' : ''}`}
              onClick={() => setIsWireframe(!isWireframe)}
            >
              <Layers size={13} />
              <span>CAD Wireframe</span>
            </button>
            <button
              type="button"
              className={`visual-pill-btn ${isHeatmap ? 'active' : ''}`}
              onClick={() => setIsHeatmap(!isHeatmap)}
            >
              <ShieldAlert size={13} />
              <span>AI Heatmap</span>
            </button>
          </div>
        </div>

        <div className="hero-canvas-container">
          <Canvas camera={{ position: [0, 1.2, 4.2], fov: 45 }}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[5, 8, 5]} intensity={1.4} castShadow />
            <pointLight position={[-5, -2, -3]} intensity={0.5} color="#38bdf8" />
            <Hero3DModel isScanning={isScanning} isWireframe={isWireframe} isHeatmap={isHeatmap} />
            <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.8} />
          </Canvas>

          {/* AI Detection Target Overlay */}
          <div className="ai-overlay-box">
            <div className="target-reticle" />
            <div className="ai-hud-card">
              <div className="ai-hud-header">
                <AlertTriangle size={15} className="hud-warning-icon" />
                <strong>DEFECT DETECTED</strong>
              </div>
              <div className="ai-hud-body">
                <span className="hud-meta-label">Type: Thread Pitch Deformation</span>
                <span className="hud-meta-label">Location: Shank Z = -0.20mm</span>
                <div className="confidence-meter-bg">
                  <div className="confidence-meter-fill" style={{ width: '98.4%' }} />
                </div>
                <div className="confidence-readout">
                  <span>AI Confidence Score</span>
                  <strong>98.4%</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MetricsStrip({ metrics }) {
  return (
    <section className="metrics-strip" id="stats">
      {metrics.map((metric) => (
        <article className="metric-card" key={metric.label}>
          <div className={`metric-value ${metric.accent || ''}`.trim()}>{metric.value}</div>
          <div className="metric-label">{metric.label}</div>
        </article>
      ))}
    </section>
  );
}

function LandingFeatures() {
  const featuresList = [
    {
      icon: <ShieldAlert size={24} />,
      title: 'Explainable AI Saliency',
      desc: 'Pinpoint precise defect coordinates with instant visual heatmaps, confidence metrics, and clear neural reasoning for line operators.'
    },
    {
      icon: <Layers size={24} />,
      title: 'Sub-Millimeter 3D Scanning',
      desc: 'Volumetric CAD comparison and surface roughness analysis designed to detect microscopic fractures and thread anomalies.'
    },
    {
      icon: <Cpu size={24} />,
      title: 'Ultra-Low Latency Inference',
      desc: '<12ms edge node processing built to keep up with high-speed automated production conveyors without slowing throughput.'
    },
    {
      icon: <Activity size={24} />,
      title: 'Autonomous QC Reports',
      desc: 'Instantly compile ISO-compliant quality compliance certificates, exportable PDFs, and direct ERP/MES database sync.'
    }
  ];

  return (
    <section className="landing-features-section" id="features">
      <div className="features-header">
        <div className="eyebrow-pill">Built for Industry 4.0</div>
        <h2>Enterprise-Grade Visual AI Engine</h2>
        <p>Engineered for high-volume manufacturing lines demanding zero false-positive tolerance.</p>
      </div>

      <div className="features-grid">
        {featuresList.map((feat, idx) => (
          <div className="feature-card" key={idx}>
            <div className="feature-icon-wrapper">{feat.icon}</div>
            <h3>{feat.title}</h3>
            <p>{feat.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function LandingLiveDemo({ onViewWorkspace }) {
  const [selectedSample, setSelectedSample] = useState(0);

  const samples = [
    {
      name: 'M10 Steel Hex Screw',
      batch: 'BATCH #2401-A',
      status: 'defective',
      type: 'Thread Deformation',
      confidence: 98.4,
      location: 'Shank Pitch #3',
      actionNeeded: 'Reject & Rework'
    },
    {
      name: 'Flange Washer Nut M8',
      batch: 'BATCH #2401-B',
      status: 'pass',
      type: 'No Defect Detected',
      confidence: 99.6,
      location: 'Surface Nominal',
      actionNeeded: 'Approved for Line'
    },
    {
      name: 'Precision Shaft Collar',
      batch: 'BATCH #2401-C',
      status: 'review',
      type: 'Micro-Scratch Surface',
      confidence: 89.2,
      location: 'Outer Diameter',
      actionNeeded: 'Manual Review'
    }
  ];

  const current = samples[selectedSample];

  return (
    <section className="landing-demo-section" id="demo">
      <div className="demo-header">
        <div className="eyebrow-pill">Interactive Sandbox</div>
        <h2>Experience AI Inspection Live</h2>
        <p>Select a sample component to preview real-time neural defect diagnostics.</p>
      </div>

      <div className="demo-sandbox-card">
        <div className="demo-selector-tabs">
          {samples.map((s, idx) => (
            <button
              key={idx}
              type="button"
              className={`demo-tab-btn ${selectedSample === idx ? 'active' : ''}`}
              onClick={() => setSelectedSample(idx)}
            >
              <span>{s.name}</span>
              <span className={`mini-status-chip ${s.status}`}>{s.status.toUpperCase()}</span>
            </button>
          ))}
        </div>

        <div className="demo-body-grid">
          <div className="demo-preview-stage">
            <div className="demo-mesh-visual">
              <div className={`demo-scanner-ring ${current.status}`} />
              <div className="demo-part-icon">
                <Cpu size={48} className="cpu-rotate" />
              </div>
              <div className="demo-scan-line" />
            </div>
          </div>

          <div className="demo-info-panel">
            <div className="demo-info-header">
              <span className="demo-batch-chip">{current.batch}</span>
              <h3>{current.name}</h3>
            </div>

            <div className={`demo-status-banner ${current.status}`}>
              {current.status === 'defective' ? (
                <AlertTriangle size={18} />
              ) : current.status === 'review' ? (
                <Activity size={18} />
              ) : (
                <CheckCircle2 size={18} />
              )}
              <span>
                {current.status.toUpperCase()} • {current.confidence}% AI Confidence
              </span>
            </div>

            <div className="demo-metrics-list">
              <div className="demo-metric-row">
                <span>Diagnostic Assessment:</span>
                <strong>{current.type}</strong>
              </div>
              <div className="demo-metric-row">
                <span>Location Coordinates:</span>
                <strong>{current.location}</strong>
              </div>
              <div className="demo-metric-row">
                <span>Recommended Disposition:</span>
                <strong>{current.actionNeeded}</strong>
              </div>
            </div>

            <button className="primary-btn demo-launch-btn" onClick={onViewWorkspace}>
              <span>Open Full Inspection Workspace</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function LandingFooter({ onViewChange }) {
  return (
    <footer className="landing-footer">
      <div className="footer-content">
        <div className="footer-brand">
          <div className="brand" onClick={() => onViewChange('landing')} style={{ cursor: 'pointer' }}>
            <div className="brand-mark">
              <Cpu size={22} />
            </div>
            <span>OmniInspect AI</span>
          </div>
          <p>Autonomous AI visual inspection & 3D defect diagnosis platform for smart factories.</p>
          <div className="footer-status">
            <span className="status-pulse-green" />
            <span>Edge Neural Engines: Operational (18/18 Factories)</span>
          </div>
        </div>

        <div className="footer-links-group">
          <div className="footer-col">
            <h4>Platform</h4>
            <a href="#features">AI Heatmaps</a>
            <a href="#demo">3D Viewer</a>
            <a href="#stats">Performance</a>
          </div>
          <div className="footer-col">
            <h4>Solutions</h4>
            <a href="#demo">Automotive</a>
            <a href="#demo">Aerospace</a>
            <a href="#demo">Electronics</a>
          </div>
          <div className="footer-col">
            <h4>Resources</h4>
            <a href="#features">Documentation</a>
            <a href="#features">API Reference</a>
            <a href="#features">ISO Certifications</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 OmniInspect AI Inc. All rights reserved.</span>
        <span>Privacy Policy • Terms of Service</span>
      </div>
    </footer>
  );
}

function WorkspaceSection({ uploads, onViewChange }) {
  const [selectedUpload, setSelectedUpload] = useState(0);
  const [cameraMode, setCameraMode] = useState('optical');
  const [isScanning, setIsScanning] = useState(true);

  const items = [
    {
      name: 'Bolt_Scratch_Sample_1.jpg',
      time: '2 mins ago',
      status: 'defective',
      part: 'Countersunk Steel Bolt M10',
      material: 'Stainless Steel 304 (ISO 3506)',
      line: 'LINE-03-A',
      batch: 'B2401-992',
      operator: 'John Smith',
      defect: 'Surface Scratch',
      confidence: 96,
      severity: 'Medium',
      reason: 'Linear texture inconsistent with normal sample.',
      location: 'Shank Pitch #3 (Z = -0.20mm)',
      roughness: 'Ra 0.4 µm',
      torque: '12.5 Nm'
    },
    {
      name: 'Bolt_Pass_Sample_2.jpg',
      time: '2 mins ago',
      status: 'pass',
      part: 'Countersunk Steel Bolt M10',
      material: 'Stainless Steel 304 (ISO 3506)',
      line: 'LINE-03-A',
      batch: 'B2401-992',
      operator: 'John Smith',
      defect: 'None (Nominal Spec)',
      confidence: 99.6,
      severity: 'Low',
      reason: 'Surface texture within 0.01mm CAD tolerance.',
      location: 'Surface Nominal',
      roughness: 'Ra 0.35 µm',
      torque: '12.8 Nm'
    },
    {
      name: 'Gear_Crack_Sample_3.jpg',
      time: '5 mins ago',
      status: 'defective',
      part: 'Precision Spur Gear M8',
      material: 'Chrome-Moly Alloy',
      line: 'CNC-MILL-02',
      batch: 'B2401-884',
      operator: 'Sarah Chen',
      defect: 'Micro Crack',
      confidence: 98.2,
      severity: 'High',
      reason: 'Radial stress fracture pattern along tooth pitch.',
      location: 'Tooth #4 Root',
      roughness: 'Ra 0.62 µm',
      torque: '18.2 Nm'
    }
  ];

  const current = items[selectedUpload] || items[0];

  return (
    <section className="workspace-shell">
      {/* Left Panel: Upload Image & Recent Queue */}
      <aside className="panel upload-panel">
        <div className="panel-title-row">
          <h3>Upload Image</h3>
          <span className="live-pill-tag">ZERO-SHOT AI</span>
        </div>

        <div className="dropzone-box">
          <div className="upload-icon-circle">
            <Download size={20} />
          </div>
          <strong>Upload Image</strong>
          <span>Drag & drop component scan or click to browse</span>
          <div className="panel-actions">
            <button className="primary-btn small" type="button">
              Upload Image
            </button>
            <button className="secondary-btn small" type="button">
              Inspect Live
            </button>
          </div>
        </div>

        <div className="recent-list-container">
          <div className="recent-list-header">
            <h4>Inspection Queue ({items.length})</h4>
            <span className="queue-status-chip">AUTO INFERENCE</span>
          </div>

          <div className="recent-file-items">
            {items.map((item, idx) => (
              <div
                key={item.name}
                className={`upload-item-card ${selectedUpload === idx ? 'active' : ''}`}
                onClick={() => setSelectedUpload(idx)}
              >
                <div className="file-chip-icon">
                  <FileText size={18} />
                </div>
                <div className="upload-meta-info">
                  <strong>{item.name}</strong>
                  <span>{item.time} • {item.part}</span>
                </div>
                <div className={`status-pill-mini ${item.status}`}>
                  {item.status.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Middle Stage: Live Camera Feed & 3D Sensor Visualizer */}
      <section className="panel viewer-panel" id="viewer">
        <div className="viewer-stage-header">
          <div className="stage-live-tag">
            <span className="status-pulse-green" />
            <span>AI ZERO-SHOT INSPECTION STAGE</span>
          </div>
          <div className="stage-mode-controls">
            <button
              type="button"
              className={`stage-pill ${cameraMode === 'optical' ? 'active' : ''}`}
              onClick={() => setCameraMode('optical')}
            >
              Optical 4K
            </button>
            <button
              type="button"
              className={`stage-pill ${cameraMode === 'uv' ? 'active' : ''}`}
              onClick={() => setCameraMode('uv')}
            >
              AI Saliency
            </button>
            <button
              type="button"
              className={`stage-pill ${cameraMode === 'xray' ? 'active' : ''}`}
              onClick={() => setCameraMode('xray')}
            >
              CAD Wireframe
            </button>
          </div>
        </div>

        <div className="workspace-stage-canvas">
          <Canvas camera={{ position: [0, 1.2, 4.0], fov: 42 }}>
            <color attach="background" args={['#f8fafc']} />
            <ambientLight intensity={1.4} />
            <directionalLight position={[6, 10, 6]} intensity={1.6} castShadow />
            <directionalLight position={[-6, -4, -4]} intensity={0.6} color="#e0f2fe" />
            <Hero3DModel
              isScanning={isScanning}
              isWireframe={cameraMode === 'xray'}
              isHeatmap={cameraMode === 'uv' || current.status === 'defective'}
            />
            <OrbitControls makeDefault enableZoom={true} autoRotate autoRotateSpeed={1.0} />
          </Canvas>

          {/* Interactive Inspection Reticle & HUD Overlay */}
          <div className="stage-hud-overlay">
            <div className="hud-corner-reticle reticle-tl" />
            <div className="hud-corner-reticle reticle-tr" />
            <div className="hud-corner-reticle reticle-bl" />
            <div className="hud-corner-reticle reticle-br" />

            <div className="hud-readout-strip top-left">
              <span>FPS: 60.0 • LATENCY: 9.4ms</span>
              <span>LIGHTING: 5500K LED • EXP: 1/500s</span>
            </div>

            <div className="hud-readout-strip top-right">
              <span>AI MODEL: ZERO-SHOT v2.1</span>
              <span>TOLERANCE: ±0.01mm (ISO 2768)</span>
            </div>

            {current.status === 'defective' && (
              <div className="hud-alert-banner">
                <div className="alert-header">
                  <AlertTriangle size={15} />
                  <strong>DEFECT DETECTED: {current.defect}</strong>
                </div>
                <div className="alert-meta">
                  <span>Reason: {current.reason}</span>
                  <span>Confidence: {current.confidence}%</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="stage-action-bar">
          <button
            className="primary-btn stage-action-btn"
            type="button"
            onClick={() => setIsScanning(!isScanning)}
          >
            <RefreshCw size={16} className={isScanning ? 'spin-icon' : ''} />
            <span>{isScanning ? 'Inference Active' : 'Run Zero-Shot Inspect'}</span>
          </button>
          {onViewChange && (
            <button
              className="primary-btn stage-action-btn validate-cta-btn"
              type="button"
              onClick={() => onViewChange('validation')}
            >
              <CheckCircle2 size={16} />
              <span>Validate AI Prediction</span>
            </button>
          )}
        </div>
      </section>

      {/* Right Panel: Screen 1 Detection Result */}
      <aside className="panel details-panel">
        <div className="panel-title-row">
          <h3>Detection Result</h3>
          <span className="part-serial-chip">SN-99824-A</span>
        </div>

        <div className="details-metrics-grid">
          <div className="detail-item full">
            <span>Defect Type</span>
            <strong className="text-red-lg">{current.defect}</strong>
          </div>
          <div className="detail-item">
            <span>Confidence Score</span>
            <strong className="text-blue-lg">{current.confidence}%</strong>
          </div>
          <div className="detail-item">
            <span>Severity Level</span>
            <strong className="text-amber-lg">{current.severity}</strong>
          </div>
        </div>

        <div className="reason-callout-box">
          <span className="reason-label">XAI Neural Reason:</span>
          <p className="reason-quote">"{current.reason}"</p>
        </div>

        <div className="details-action-stack">
          {onViewChange && (
            <button
              className="primary-btn full-btn feature-highlight-btn"
              type="button"
              onClick={() => onViewChange('validation')}
            >
              <CheckCircle2 size={18} />
              <span>Human Validation Screen</span>
            </button>
          )}
          {onViewChange && (
            <button
              className="secondary-btn full-btn"
              type="button"
              onClick={() => onViewChange('graph')}
            >
              <Network size={16} />
                  <span>Knowledge Graph</span>
            </button>
          )}
        </div>
      </aside>
    </section>
  );
}

function HumanValidationSection({ onViewChange }) {
  const [predictionCorrect, setPredictionCorrect] = useState('correct');
  const [selectedCorrectDefect, setSelectedCorrectDefect] = useState('Rust');
  const [selectedRootCause, setSelectedRootCause] = useState('Conveyor Roller #3');
  const [engineerNotes, setEngineerNotes] = useState('Linear texture inconsistency created by rubber roller friction on conveyor line 03-A.');
  const [feedbackSaved, setFeedbackSaved] = useState(false);

  const handleSaveFeedback = () => {
    setFeedbackSaved(true);
  };

  return (
    <section className="validation-page-shell">
      <div className="validation-header">
        <div className="eyebrow-pill">RLHF Neural Loop • Core Feature</div>
        <h2>Human Validation</h2>
        <p>Validate AI predictions to refine model accuracy and strengthen causal graph relationships.</p>
      </div>

      <div className="validation-grid">
        {/* Left Card: AI Prediction */}
        <div className="validation-card ai-pred-card">
          <div className="card-badge-row">
            <span className="pred-badge">AI PREDICTION</span>
            <span className="confidence-chip">96% CONFIDENCE</span>
          </div>

          <div className="pred-visual-box">
            <div className="pred-screw-visual">
              <div className="pred-reticle-ring" />
              <div className="pred-defect-dot" />
              <Cpu size={42} className="cpu-rotate" />
            </div>
            <div className="pred-visual-meta">
              <strong>Bolt Image Scan</strong>
              <span>Line 03-A • Batch #2401-992</span>
            </div>
          </div>

          <div className="pred-details-list">
            <div className="pred-detail-row">
              <span>Defect Type:</span>
              <strong className="text-red-lg">Scratch</strong>
            </div>
            <div className="pred-detail-row">
              <span>Confidence:</span>
              <strong className="text-blue-lg">96%</strong>
            </div>
            <div className="pred-detail-row full">
              <span>AI Reason:</span>
              <p className="reason-quote">"Linear texture inconsistent with normal sample."</p>
            </div>
          </div>

          <div className="confidence-meter-wrap">
            <div className="confidence-meter-bg">
              <div className="confidence-meter-fill" style={{ width: '96%' }} />
            </div>
            <div className="confidence-readout">
              <span>Model Certainty</span>
              <strong>96%</strong>
            </div>
          </div>
        </div>

        {/* Right Card: Engineer Validation Form */}
        <div className="validation-card engineer-form-card">
          <div className="form-card-header">
            <h3>Engineer Decision</h3>
            <span className="form-status-pill">PENDING REVIEW</span>
          </div>

          {feedbackSaved ? (
            <div className="feedback-success-box">
              <div className="success-icon-wrap">
                <CheckCircle2 size={40} className="success-icon" />
              </div>
              <h4>Feedback Saved & Trained</h4>
              <p>Neural edge established: <strong>Scratch ➔ {selectedRootCause}</strong></p>
              <div className="success-actions">
                <button className="primary-btn small" onClick={() => onViewChange('graph')}>
                  <span>Knowledge Graph</span>
                  <ArrowRight size={14} />
                </button>
                <button className="secondary-btn small" onClick={() => onViewChange('history')}>
                  <span>Learning History</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); handleSaveFeedback(); }}>
              <div className="form-group">
                <label className="form-label">Engineer Decision</label>
                <div className="radio-button-group">
                  <button
                    type="button"
                    className={`radio-btn ${predictionCorrect === 'correct' ? 'active-green' : ''}`}
                    onClick={() => setPredictionCorrect('correct')}
                  >
                    <CheckCircle2 size={18} />
                    <span>Correct</span>
                  </button>
                  <button
                    type="button"
                    className={`radio-btn ${predictionCorrect === 'wrong' ? 'active-red' : ''}`}
                    onClick={() => setPredictionCorrect('wrong')}
                  >
                    <X size={18} />
                    <span>Wrong</span>
                  </button>
                </div>
              </div>

              {predictionCorrect === 'wrong' && (
                <div className="form-group slide-down">
                  <label className="form-label">Correct Defect Type</label>
                  <select
                    className="form-select"
                    value={selectedCorrectDefect}
                    onChange={(e) => setSelectedCorrectDefect(e.target.value)}
                  >
                    <option value="Rust">Rust</option>
                    <option value="Crack">Crack</option>
                    <option value="Dent">Dent</option>
                    <option value="Deformation">Thread Deformation</option>
                  </select>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Physical Root Cause</label>
                <select
                  className="form-select"
                  value={selectedRootCause}
                  onChange={(e) => setSelectedRootCause(e.target.value)}
                >
                  <option value="Conveyor Roller #3">Conveyor Roller #3</option>
                  <option value="CNC Cutting Tool Wear">CNC Cutting Tool Wear</option>
                  <option value="Coolant Contamination">Coolant Contamination</option>
                  <option value="Hopper Chute Drop">Hopper Chute Drop</option>
                  <option value="High Storage Humidity">High Storage Humidity</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Engineer Notes</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={engineerNotes}
                  onChange={(e) => setEngineerNotes(e.target.value)}
                  placeholder="Notes on defect origin, machine line, or corrective action..."
                />
              </div>

              <button className="primary-btn save-feedback-btn" type="submit">
                <Save size={18} />
                <span>Save Feedback</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function KnowledgeGraphSection({ onViewChange }) {
  const [selectedNode, setSelectedNode] = useState('defect');

  const cases = [
    { id: 'Scratch #34', similarity: '98.2%', line: 'Line 03-A', root: 'Conveyor Roller #3', date: '2 hours ago', confidence: 98.2 },
    { id: 'Scratch #52', similarity: '96.7%', line: 'Line 03-A', root: 'Conveyor Roller #3', date: '5 hours ago', confidence: 96.7 },
    { id: 'Scratch #71', similarity: '95.4%', line: 'Line 01-B', root: 'Conveyor Roller #2', date: 'Yesterday', confidence: 95.4 }
  ];

  const nodeDetails = {
    defect: { title: 'Scratch', type: 'Defect Type', desc: 'Surface scratch detected on shank threads with 96% confidence.', severity: 'Medium' },
    root: { title: 'Conveyor Roller #3', type: 'Root Cause', desc: 'Rubber roller friction on conveyor line 03-A causing linear texture deformation.', severity: 'High' },
    bolt: { title: 'Steel Bolt M10', type: 'Affected Component', desc: 'Countersunk steel bolt M10 from batch B2401-992, line 03-A.', severity: 'Medium' },
    severity: { title: 'Medium', type: 'Severity Level', desc: 'Requires attention within 24 hours. Not critical but affects quality compliance.', severity: 'Medium' },
    action: { title: 'Replace Roller #3', type: 'Action Required', desc: 'Schedule maintenance for Conveyor Roller #3. Expected downtime: 2 hours.', severity: 'High' }
  };

  const currentDetail = nodeDetails[selectedNode] || nodeDetails.defect;

  return (
    <section className="graph-page-shell">
      <div className="graph-header">
        <div className="eyebrow-pill">Causal Graph Network • Core Feature</div>
        <h2>Knowledge Graph</h2>
        <p>Interactive graph mapping defect symptoms to machine root causes and historical matches.</p>
      </div>

      <div className="graph-main-layout">
        {/* Interactive Graph Canvas Stage */}
        <div className="graph-canvas-card">
          <div className="graph-toolbar">
            <span className="graph-status-chip">Causal Nodes: 5 Connected</span>
            <span className="graph-hint">Click nodes to inspect details</span>
          </div>

          <div className="interactive-graph-stage">
            <svg className="graph-svg-connections" width="100%" height="100%">
              <line x1="50%" y1="50%" x2="20%" y2="25%" stroke="#2563eb" strokeWidth="2.5" strokeDasharray="6,4" />
              <line x1="50%" y1="50%" x2="80%" y2="25%" stroke="#2563eb" strokeWidth="2.5" />
              <line x1="50%" y1="50%" x2="20%" y2="75%" stroke="#d97706" strokeWidth="2.5" />
              <line x1="50%" y1="50%" x2="80%" y2="75%" stroke="#059669" strokeWidth="2.5" />
            </svg>

            {/* Central Node: Scratch */}
            <div
              className={`graph-node central-node ${selectedNode === 'defect' ? 'selected' : ''}`}
              style={{ top: '50%', left: '50%' }}
              onClick={() => setSelectedNode('defect')}
            >
              <AlertTriangle size={22} className="node-icon red" />
              <div className="node-label">
                <strong>Scratch</strong>
                <span>Defect Type</span>
              </div>
            </div>

            {/* Linked Node: Conveyor Roller */}
            <div
              className={`graph-node linked-node ${selectedNode === 'root' ? 'selected' : ''}`}
              style={{ top: '25%', left: '20%' }}
              onClick={() => setSelectedNode('root')}
            >
              <Cpu size={18} className="node-icon blue" />
              <div className="node-label">
                <strong>Conveyor Roller #3</strong>
                <span>Root Cause</span>
              </div>
            </div>

            {/* Linked Node: Bolt */}
            <div
              className={`graph-node linked-node ${selectedNode === 'bolt' ? 'selected' : ''}`}
              style={{ top: '25%', left: '80%' }}
              onClick={() => setSelectedNode('bolt')}
            >
              <Layers size={18} className="node-icon blue" />
              <div className="node-label">
                <strong>Steel Bolt M10</strong>
                <span>Affected Component</span>
              </div>
            </div>

            {/* Linked Node: Medium Severity */}
            <div
              className={`graph-node linked-node ${selectedNode === 'severity' ? 'selected' : ''}`}
              style={{ top: '75%', left: '20%' }}
              onClick={() => setSelectedNode('severity')}
            >
              <Activity size={18} className="node-icon amber" />
              <div className="node-label">
                <strong>Medium</strong>
                <span>Severity Level</span>
              </div>
            </div>

            {/* Linked Node: Replace Roller */}
            <div
              className={`graph-node linked-node ${selectedNode === 'action' ? 'selected' : ''}`}
              style={{ top: '75%', left: '80%' }}
              onClick={() => setSelectedNode('action')}
            >
              <CheckCircle2 size={18} className="node-icon green" />
              <div className="node-label">
                <strong>Replace Roller #3</strong>
                <span>Action Required</span>
              </div>
            </div>
          </div>

          {/* Node Detail Panel */}
          <div className="node-detail-panel">
            <div className="node-detail-header">
              <span className={`node-detail-badge ${currentDetail.severity.toLowerCase()}`}>{currentDetail.severity}</span>
              <h4>{currentDetail.title}</h4>
            </div>
            <p className="node-detail-type">{currentDetail.type}</p>
            <p className="node-detail-desc">{currentDetail.desc}</p>
          </div>
        </div>

        {/* Side Panel: Previous Similar Cases */}
        <aside className="graph-side-panel">
          <div className="side-panel-header">
            <h4>Previous Similar Cases</h4>
            <span className="case-count-tag">{cases.length} Matches</span>
          </div>

          <div className="cases-list">
            {cases.map((c) => (
              <div className="case-card" key={c.id}>
                <div className="case-header">
                  <strong>{c.id}</strong>
                  <span className="similarity-chip">{c.similarity} Match</span>
                </div>
                <div className="case-meta">
                  <span>Root Cause: <strong>{c.root}</strong></span>
                  <span>{c.line} • {c.date}</span>
                </div>
                <div className="case-confidence-bg">
                  <div className="case-confidence-fill" style={{ width: c.confidence + '%' }} />
                </div>
              </div>
            ))}
          </div>

          <div className="side-panel-actions">
            <button className="secondary-btn full-width-btn" onClick={() => onViewChange('history')}>
              <span>Learning History & Timeline</span>
              <ArrowRight size={14} />
            </button>
            <button className="primary-btn full-width-btn" onClick={() => onViewChange('validation')}>
              <span>New Validation</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}

function LearningHistorySection() {
  return (
    <section className="history-page-shell">
      <div className="history-header">
        <div className="eyebrow-pill">Model Performance Tracker • Core Feature</div>
        <h2>Learning History</h2>
        <p>Tracking AI precision improvements through engineer feedback validation loops.</p>
      </div>

      {/* Total Feedback KPI Summary Grid */}
      <div className="history-kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrap blue">
            <Activity size={22} />
          </div>
          <div className="kpi-val blue">128</div>
          <div className="kpi-label">Validated Cases</div>
          <div className="kpi-sub">+12 feedback loops today</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon-wrap cyan">
            <Network size={22} />
          </div>
          <div className="kpi-val cyan">67</div>
          <div className="kpi-label">Knowledge Nodes</div>
          <div className="kpi-sub">+5 new causal links</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon-wrap amber">
            <AlertTriangle size={22} />
          </div>
          <div className="kpi-val amber">21</div>
          <div className="kpi-label">Root Causes</div>
          <div className="kpi-sub">Mapped to machine lines</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon-wrap green">
            <CheckCircle2 size={22} />
          </div>
          <div className="kpi-val green">98.4%</div>
          <div className="kpi-label">Inspection Accuracy</div>
          <div className="kpi-sub">Up from 89.0% baseline</div>
        </div>
      </div>

      {/* Learning Timeline */}
      <div className="history-timeline-card">
        <div className="timeline-card-header">
          <h3>Learning Timeline</h3>
          <span className="timeline-filter-pill">Last 7 Days</span>
        </div>

        <div className="timeline-group">
          <div className="timeline-date-chip">Today</div>
          <div className="timeline-items-list">
            <div className="timeline-item pass">
              <div className="timeline-icon-wrap green">
                <CheckCircle2 size={18} />
              </div>
              <div className="item-content">
                <strong>Bolt Scratch</strong>
                <span>Validated by Engineer John Smith • Root Cause: Conveyor Roller #3</span>
              </div>
              <span className="item-time">10:42 AM</span>
            </div>
            <div className="timeline-item pass">
              <div className="timeline-icon-wrap green">
                <CheckCircle2 size={18} />
              </div>
              <div className="item-content">
                <strong>Gear Crack</strong>
                <span>Validated by Engineer Sarah Chen • Root Cause: CNC Machine 2 Milling</span>
              </div>
              <span className="item-time">09:15 AM</span>
            </div>
            <div className="timeline-item pass">
              <div className="timeline-icon-wrap green">
                <CheckCircle2 size={18} />
              </div>
              <div className="item-content">
                <strong>Bearing Rust</strong>
                <span>Validated by Engineer Mark Vance • Root Cause: Storage Humidity</span>
              </div>
              <span className="item-time">08:30 AM</span>
            </div>
          </div>
        </div>

        <div className="timeline-group">
          <div className="timeline-date-chip">Yesterday</div>
          <div className="timeline-items-list">
            <div className="timeline-item pass">
              <div className="timeline-icon-wrap green">
                <CheckCircle2 size={18} />
              </div>
              <div className="item-content">
                <strong>Bolt Dent</strong>
                <span>Validated by Engineer John Smith • Root Cause: Hopper Chute Drop</span>
              </div>
              <span className="item-time">04:18 PM</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DecisionSection({ onNextInspection, onGenerateReport }) {
  return (
    <section className="decision-page-shell">
      <div className="decision-content">
        <div className="shield-icon-container">
          <div className="shield-icon-bg">
            <ShieldAlert size={42} className="shield-icon-svg" />
          </div>
        </div>

        <h1 className="decision-title">COMPONENT REJECTED</h1>
        <p className="decision-subtitle">
          Automatic decision executed based on 96.4% confidence.
        </p>

        <div className="decision-card">
          <div className="decision-row">
            <span className="row-label">Defect Reason</span>
            <strong className="row-value dark">Surface Crack (Head)</strong>
          </div>
          <div className="decision-row">
            <span className="row-label">Severity</span>
            <strong className="row-value severity-medium">Medium</strong>
          </div>
          <div className="decision-row">
            <span className="row-label">Recommended Action</span>
            <strong className="row-value dark">Inspect Machine 3</strong>
          </div>
        </div>

        <div className="decision-actions">
          <button
            className="primary-btn decision-btn generate-btn"
            type="button"
            onClick={onGenerateReport}
          >
            <FileText size={18} />
            <span>Generate Report</span>
          </button>
          <button
            className="secondary-btn decision-btn next-btn"
            type="button"
            onClick={onNextInspection}
          >
            <ArrowLeft size={18} />
            <span>Next Inspection</span>
          </button>
        </div>
      </div>
    </section>
  );
}

function ComponentHUDCard({ item, onClose, onViewDecision }) {
  if (!item) return null;

  const isDefective = item.status === 'defective';
  const isReview = item.status === 'review';

  return (
    <div className="component-hud-card">
      <div className="hud-card-header">
        <div className="hud-part-info">
          <span className="hud-batch-chip">B2401-992 • COMPONENT #0{item.id + 1}</span>
          <h3 className="hud-part-name">Steel Screw M10</h3>
        </div>
        <button className="hud-close-btn" onClick={onClose} aria-label="Close detail card">
          <X size={18} />
        </button>
      </div>

      <div className={`hud-status-banner ${item.status}`}>
        {isDefective ? (
          <>
            <AlertTriangle size={18} />
            <span>DEFECTIVE • {item.confidence}% AI Confidence</span>
          </>
        ) : isReview ? (
          <>
            <Activity size={18} />
            <span>NEEDS REVIEW • {item.confidence}% AI Confidence</span>
          </>
        ) : (
          <>
            <CheckCircle2 size={18} />
            <span>PASS • {item.confidence}% AI Confidence</span>
          </>
        )}
      </div>

      <div className="hud-metrics-grid">
        <div className="hud-metric">
          <span className="hud-label">Defect Reason</span>
          <strong className={`hud-val ${isDefective ? 'text-red' : isReview ? 'text-amber' : ''}`}>
            {item.defectType}
          </strong>
        </div>
        <div className="hud-metric">
          <span className="hud-label">Material Specs</span>
          <strong className="hud-val">{item.material}</strong>
        </div>
        <div className="hud-metric">
          <span className="hud-label">Torque Rating</span>
          <strong className="hud-val">{item.torque}</strong>
        </div>
        <div className="hud-metric">
          <span className="hud-label">Surface Finish</span>
          <strong className="hud-val">{item.roughness}</strong>
        </div>
        <div className="hud-metric">
          <span className="hud-label">Defect Location</span>
          <strong className="hud-val">{item.location}</strong>
        </div>
        <div className="hud-metric">
          <span className="hud-label">Dimensions</span>
          <strong className="hud-val">{item.dimensions}</strong>
        </div>
      </div>

      <div className="hud-card-actions">
        {isDefective && (
          <button className="primary-btn hud-action-btn" onClick={onViewDecision}>
            <ExternalLink size={16} />
            <span>Inspect Decision Report</span>
          </button>
        )}
        <button className="secondary-btn hud-action-btn" onClick={onClose}>
          <span>Close HUD</span>
        </button>
      </div>
    </div>
  );
}

export { TopBar, Hero, MetricsStrip, LandingFeatures, LandingLiveDemo, LandingFooter, WorkspaceSection, HumanValidationSection, KnowledgeGraphSection, LearningHistorySection, ViewerSection, DecisionSection, ReportSection };

function Screw({
  id,
  position,
  status = 'pass',
  isDimmed = false,
  isSelected = false,
  isHovered = false,
  confidence = 98.4,
  onSelect,
  onHover,
  onUnhover
}) {
  const ringColor =
    status === 'defective' ? '#ef4444' : status === 'review' ? '#f59e0b' : '#10b981';

  return (
    <group
      position={position}
      scale={isSelected ? 1.14 : isHovered ? 1.07 : isDimmed ? 0.88 : 1.0}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(id);
      }}
      onPointerOut={() => onUnhover()}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(id);
      }}
    >
      {/* Flat Countersunk Head Top */}
      <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.34, 0.34, 0.03, 32]} />
        <meshStandardMaterial
          color={isSelected ? '#60a5fa' : '#e2e8f0'}
          metalness={0.92}
          roughness={0.14}
          transparent={isDimmed}
          opacity={isDimmed ? 0.25 : 1.0}
        />
      </mesh>

      {/* Recessed Phillips Cross Drive (+) */}
      <group position={[0, 0.44, 0]}>
        <mesh rotation={[0, 0, 0]}>
          <boxGeometry args={[0.34, 0.02, 0.06]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} />
        </mesh>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[0.34, 0.02, 0.06]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} />
        </mesh>
      </group>

      {/* Countersunk Tapered Neck */}
      <mesh position={[0, 0.26, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.34, 0.16, 0.28, 32]} />
        <meshStandardMaterial
          color={isSelected ? '#3b82f6' : '#cbd5e1'}
          metalness={0.9}
          roughness={0.18}
          transparent={isDimmed}
          opacity={isDimmed ? 0.25 : 1.0}
        />
      </mesh>

      {/* Main Cylindrical Threaded Shank */}
      <mesh position={[0, -0.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.16, 0.16, 0.65, 28]} />
        <meshStandardMaterial
          color={isSelected ? '#2563eb' : '#94a3b8'}
          metalness={0.88}
          roughness={0.2}
          transparent={isDimmed}
          opacity={isDimmed ? 0.25 : 1.0}
        />
      </mesh>

      {/* Helical Spiral Thread Rings */}
      {[0.05, -0.08, -0.21, -0.34].map((y, idx) => (
        <mesh key={idx} position={[0, y, 0]} rotation={[0.08, 0, 0]}>
          <torusGeometry args={[0.18, 0.025, 12, 24]} />
          <meshStandardMaterial
            color={isSelected ? '#60a5fa' : '#64748b'}
            metalness={0.85}
            transparent={isDimmed}
            opacity={isDimmed ? 0.25 : 1.0}
          />
        </mesh>
      ))}

      {/* Pointed Tip (Gimlet Point) */}
      <mesh position={[0, -0.65, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.16, 0.0, 0.25, 28]} />
        <meshStandardMaterial
          color={isSelected ? '#2563eb' : '#94a3b8'}
          metalness={0.88}
          roughness={0.2}
          transparent={isDimmed}
          opacity={isDimmed ? 0.25 : 1.0}
        />
      </mesh>

      {/* Glowing Base Halo Ring (Selected or Defective or Review) */}
      {(isSelected || (!isDimmed && (status === 'defective' || status === 'review'))) && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.68, 0]}>
          <ringGeometry args={[0.36, 0.48, 32]} />
          <meshStandardMaterial
            color={isSelected ? '#3b82f6' : ringColor}
            emissive={isSelected ? '#3b82f6' : ringColor}
            emissiveIntensity={isSelected ? 2.0 : 1.4}
            transparent
            opacity={0.85}
          />
        </mesh>
      )}

      {/* Status Dot / Highlight */}
      {!isDimmed && status === 'defective' && (
        <group position={[0.2, 0.48, 0.12]}>
          <mesh>
            <sphereGeometry args={[0.048, 16, 16]} />
            <meshStandardMaterial
              color="#ef4444"
              emissive="#ef4444"
              emissiveIntensity={1.4}
            />
          </mesh>
        </group>
      )}

      {!isDimmed && status === 'review' && (
        <group position={[0.2, 0.48, 0.12]}>
          <mesh>
            <sphereGeometry args={[0.048, 16, 16]} />
            <meshStandardMaterial
              color="#f59e0b"
              emissive="#f59e0b"
              emissiveIntensity={1.4}
            />
          </mesh>
        </group>
      )}

      {/* Floating 3D Html Badge on Hover */}
      {(isHovered || isSelected) && (
        <Html position={[0, 0.85, 0]} center distanceFactor={14}>
          <div className={`scene-3d-tooltip ${status} ${isSelected ? 'selected' : ''}`}>
            <span>#0{id + 1}</span>
            <strong>{status.toUpperCase()} ({confidence}%)</strong>
          </div>
        </Html>
      )}
    </group>
  );
}

function ScrewField({
  activeFilter = 'all',
  selectedId = null,
  hoveredId = null,
  onSelectScrew,
  onHoverScrew,
  onUnhoverScrew,
  componentsData
}) {
  return (
    <group>
      {/* White Modular Platform Base */}
      <mesh position={[0, -0.88, 0]} receiveShadow>
        <boxGeometry args={[7.8, 0.35, 7.8]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} metalness={0.02} />
      </mesh>

      {/* Surface Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.69, 0]} receiveShadow>
        <planeGeometry args={[7.7, 7.7]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.98} />
      </mesh>

      {/* Modular Grid Lines */}
      <gridHelper args={[7.6, 5, '#cbd5e1', '#e2e8f0']} position={[0, -0.68, 0]} />

      {/* Render Screws */}
      {componentsData.map((item) => {
        const isDimmed =
          (activeFilter === 'defective' && item.status !== 'defective') ||
          (activeFilter === 'review' && item.status !== 'review') ||
          (activeFilter === 'pass' && item.status !== 'pass');

        return (
          <Screw
            key={item.id}
            id={item.id}
            position={item.position}
            status={item.status}
            confidence={item.confidence}
            isDimmed={isDimmed}
            isSelected={selectedId === item.id}
            isHovered={hoveredId === item.id}
            onSelect={onSelectScrew}
            onHover={onHoverScrew}
            onUnhover={onUnhoverScrew}
          />
        );
      })}
    </group>
  );
}

function ViewerSection({ onFinalizeDecision }) {
  const [filter, setFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [autoRotate, setAutoRotate] = useState(false);

  const componentsData = useMemo(() => {
    const cols = [-2.8, -1.4, 0, 1.4, 2.8];
    const rows = [-2.8, -1.4, 0, 1.4, 2.8];
    
    // Status distribution: 6 defective, 4 review, 15 pass = 25 components total
    const defectiveIndices = new Set([3, 8, 12, 17, 21, 23]);
    const reviewIndices = new Set([1, 7, 14, 19]);

    let index = 0;
    const list = [];
    for (let r = 0; r < rows.length; r++) {
      for (let c = 0; c < cols.length; c++) {
        let status = 'pass';
        let defectType = 'None (Clean)';
        let confidence = 99.2;
        let location = 'N/A';

        if (defectiveIndices.has(index)) {
          status = 'defective';
          defectType = 'Surface Crack';
          confidence = 96.4;
          location = 'Head Rim Area';
        } else if (reviewIndices.has(index)) {
          status = 'review';
          defectType = 'Micro Scratch';
          confidence = 88.2;
          location = 'Shank Threads';
        }

        list.push({
          id: index,
          position: [cols[c], 0, rows[r]],
          status,
          defectType,
          confidence,
          location,
          material: 'Stainless Steel 304',
          torque: '12.5 Nm',
          roughness: 'Ra 0.4 µm',
          dimensions: 'M10 x 40mm',
        });
        index++;
      }
    }
    return list;
  }, []);

  const selectedItem = useMemo(
    () => (selectedId !== null ? componentsData.find((c) => c.id === selectedId) : null),
    [selectedId, componentsData]
  );

  return (
    <section className="viewer-page-shell">
      <aside className="viewer-summary-panel">
        <div className="viewer-batch-label">BATCH ID</div>
        <div className="viewer-batch-id">B2401-992</div>

        <div className="viewer-stats-list">
          <div className="viewer-stat neutral">
            <div className="stat-left">
              <Layers size={18} className="stat-icon" />
              <span>Total Components</span>
            </div>
            <strong>25</strong>
          </div>
          <div className="viewer-stat danger">
            <div className="stat-left">
              <AlertTriangle size={18} className="stat-icon" />
              <span>Defective</span>
            </div>
            <strong>6</strong>
          </div>
          <div className="viewer-stat amber">
            <div className="stat-left">
              <Activity size={18} className="stat-icon" />
              <span>Needs Review</span>
            </div>
            <strong>4</strong>
          </div>
          <div className="viewer-stat success">
            <div className="stat-left">
              <CheckCircle2 size={18} className="stat-icon" />
              <span>Pass</span>
            </div>
            <strong>15</strong>
          </div>
        </div>

        <button
          className="primary-btn finalize-btn"
          type="button"
          onClick={onFinalizeDecision}
        >
          Finalize Decision
        </button>
      </aside>

      <section className="viewer-model-panel">
        <div className="viewer-model-toolbar">
          <div className="model-filters">
            <button
              className={filter === 'all' ? 'pill active' : 'pill'}
              type="button"
              onClick={() => { setFilter('all'); setSelectedId(null); }}
            >
              All (25)
            </button>
            <button
              className={filter === 'defective' ? 'pill active' : 'pill'}
              type="button"
              onClick={() => { setFilter('defective'); setSelectedId(null); }}
            >
              Defective (6)
            </button>
            <button
              className={filter === 'review' ? 'pill active' : 'pill'}
              type="button"
              onClick={() => { setFilter('review'); setSelectedId(null); }}
            >
              Review (4)
            </button>
            <button
              className={filter === 'pass' ? 'pill active' : 'pill'}
              type="button"
              onClick={() => { setFilter('pass'); setSelectedId(null); }}
            >
              Pass (15)
            </button>
          </div>

          <div className="model-actions">
            <button
              className={`pill-btn-360 ${autoRotate ? 'active' : ''}`}
              type="button"
              onClick={() => setAutoRotate(!autoRotate)}
              title="Toggle 360 Auto-Rotate"
            >
              <RefreshCw size={14} className={autoRotate ? 'spin-icon' : ''} />
              <span>360° View</span>
            </button>

            <button
              className="circle-btn"
              type="button"
              aria-label="Reset view"
              onClick={() => { setFilter('all'); setSelectedId(null); setAutoRotate(false); }}
            >
              <RotateCcw size={16} />
            </button>
            <button className="circle-btn" type="button" aria-label="Fullscreen">
              <Maximize2 size={16} />
            </button>
          </div>
        </div>

        <div className="model-canvas">
          <Canvas shadows dpr={[1, 2]}>
            <PerspectiveCamera makeDefault position={[0, 5.8, 8.8]} fov={36} />
            <color attach="background" args={['#f8fafc']} />
            <ambientLight intensity={1.6} />
            <directionalLight position={[8, 12, 8]} intensity={1.8} castShadow />
            <directionalLight position={[-8, 10, -6]} intensity={0.9} color="#e0f2fe" />
            <directionalLight position={[0, 6, -10]} intensity={0.5} />
            <group position={[0, -0.1, 0]}>
              <ScrewField
                activeFilter={filter}
                selectedId={selectedId}
                hoveredId={hoveredId}
                onSelectScrew={(id) => setSelectedId(id)}
                onHoverScrew={(id) => setHoveredId(id)}
                onUnhoverScrew={() => setHoveredId(null)}
                componentsData={componentsData}
              />
            </group>
            <Environment preset="warehouse" />
            <OrbitControls
              makeDefault
              autoRotate={autoRotate}
              autoRotateSpeed={2.2}
              enablePan={true}
              enableRotate={true}
              enableZoom={true}
              minDistance={4}
              maxDistance={18}
              maxPolarAngle={Math.PI / 2.05}
            />
          </Canvas>

          {/* Floating Glassmorphic HUD Inspector Drawer */}
          {selectedItem && (
            <ComponentHUDCard
              item={selectedItem}
              onClose={() => setSelectedId(null)}
              onViewDecision={onFinalizeDecision}
            />
          )}
        </div>
      </section>
    </section>
  );
}


function ReportSection() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <section className="report-page-shell">
      <div className="report-toolbar">
        <div className="report-title-group">
          <h1 className="report-main-title">Inspection Report</h1>
          <span className="report-id-sub">Report ID: REP-2024-0891</span>
        </div>
        <div className="report-toolbar-actions">
          <button
            className="icon-btn-outlined"
            type="button"
            onClick={handlePrint}
            aria-label="Print report"
          >
            <Printer size={18} />
          </button>
          <button
            className="icon-btn-outlined"
            type="button"
            aria-label="Share report"
          >
            <Share2 size={18} />
          </button>
          <button
            className="primary-btn download-pdf-btn"
            type="button"
            onClick={handlePrint}
          >
            <Download size={18} />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      <div className="report-sheet" id="inspection-report-document">
        <div className="report-dark-banner">
          <div className="report-brand">
            <div className="report-brand-icon">
              <Cpu size={18} />
            </div>
            <span>OmniInspect</span>
          </div>
          <div className="report-datetime">
            <div>DATE: 7/24/2026</div>
            <div>TIME: 4:47:22 PM</div>
          </div>
        </div>

        <div className="report-body">
          <div className="report-section-block">
            <h3 className="section-heading-line">EXECUTIVE SUMMARY</h3>
            <div className="executive-summary-row">
              <p className="summary-text">
                Component <code className="inline-code">Screw_M10</code> from batch{' '}
                <code className="inline-code">B2401</code> was inspected autonomously using
                Gemini Vision Model v2.1. A structural defect was detected with high
                confidence, leading to an automatic REJECT decision.
              </p>
              <div className="final-result-box">
                <span className="result-label">FINAL RESULT</span>
                <strong className="result-status-rejected">REJECTED</strong>
              </div>
            </div>
          </div>

          <div className="report-grid-2col">
            <div className="data-column">
              <h4 className="column-heading">COMPONENT DATA</h4>
              <div className="data-row-list">
                <div className="data-item">
                  <span className="data-key">Part Name</span>
                  <strong className="data-val">Steel Screw M10</strong>
                </div>
                <div className="data-item">
                  <span className="data-key">Material</span>
                  <strong className="data-val">Stainless Steel 304</strong>
                </div>
                <div className="data-item">
                  <span className="data-key">Line</span>
                  <strong className="data-val">03-A</strong>
                </div>
                <div className="data-item">
                  <span className="data-key">Batch</span>
                  <strong className="data-val">B2401-992</strong>
                </div>
                <div className="data-item">
                  <span className="data-key">Operator</span>
                  <strong className="data-val">John Smith</strong>
                </div>
              </div>
            </div>

            <div className="data-column">
              <h4 className="column-heading">AI DETECTION RESULT</h4>
              <div className="data-row-list">
                <div className="data-item">
                  <span className="data-key">Defect Type</span>
                  <strong className="data-val defect-type-red">Surface Crack</strong>
                </div>
                <div className="data-item">
                  <span className="data-key">Severity</span>
                  <strong className="data-val severity-orange">Medium</strong>
                </div>
                <div className="data-item">
                  <span className="data-key">Confidence</span>
                  <strong className="data-val">96.4%</strong>
                </div>
                <div className="data-item">
                  <span className="data-key">Location</span>
                  <strong className="data-val">Head area</strong>
                </div>
                <div className="data-item">
                  <span className="data-key">Est. Length</span>
                  <strong className="data-val">4.2mm</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="report-section-block">
            <h3 className="section-heading-line">VISUAL EVIDENCE</h3>
            <div className="visual-evidence-grid">
              <div className="evidence-card">
                <span className="evidence-tag">Original</span>
                <div className="evidence-visual-stage">
                  <div className="screw-head-circle">
                    <div className="screw-slot-cross" />
                  </div>
                </div>
              </div>

              <div className="evidence-card">
                <span className="evidence-tag">AI Detection Map</span>
                <div className="evidence-visual-stage">
                  <div className="screw-head-circle heatmap-target">
                    <div className="heatmap-glow" />
                    <div className="defect-bounding-box" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="recommendation-callout-box">
            <h4 className="recommendation-title">AUTOMATED RECOMMENDATION</h4>
            <p className="recommendation-desc">
              Inspect Cutting Tool on Machine 3. The defect signature correlates (88%) with tooling wear patterns recorded in historical data.
            </p>
          </div>

          <div className="report-footer-bar">
            <span className="footer-meta-left">Verified by OmniInspect AI v2.1</span>
            <span className="footer-meta-right">
              Digital Signature: <code>0x8F9B2...A14C</code>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

