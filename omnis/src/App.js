import { useState } from 'react';
import './App.css';
import { metrics, uploads } from './data/inspectionData';
import {
  Hero,
  MetricsStrip,
  LandingFeatures,
  LandingLiveDemo,
  LandingFooter,
  TopBar,
  ViewerSection,
  WorkspaceSection,
  HumanValidationSection,
  KnowledgeGraphSection,
  LearningHistorySection,
  DecisionSection,
  ReportSection
} from './components/Sections';

function App() {
  const [view, setView] = useState('landing');

  return (
    <div className="app-shell">
      <TopBar activeView={view} onViewChange={setView} />
      <main className={`page page-${view}`}>
        {view === 'landing' ? (
          <>
            <Hero onGetStarted={() => setView('dashboard')} />
            <MetricsStrip metrics={metrics} />
            <LandingFeatures />
            <LandingLiveDemo onViewWorkspace={() => setView('dashboard')} />
            <LandingFooter onViewChange={setView} />
          </>
        ) : view === 'dashboard' ? (
          <WorkspaceSection uploads={uploads} onViewChange={setView} />
        ) : view === 'validation' ? (
          <HumanValidationSection onViewChange={setView} />
        ) : view === 'graph' ? (
          <KnowledgeGraphSection onViewChange={setView} />
        ) : view === 'history' ? (
          <LearningHistorySection />
        ) : view === 'decision' ? (
          <DecisionSection
            onNextInspection={() => setView('dashboard')}
            onGenerateReport={() => setView('reports')}
            onViewChange={setView}
          />
        ) : view === 'reports' ? (
          <ReportSection />
        ) : (
          <ViewerSection onFinalizeDecision={() => setView('decision')} />
        )}
      </main>
    </div>
  );
}

export default App;
