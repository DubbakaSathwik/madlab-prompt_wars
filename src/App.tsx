import React, { useState, useEffect } from 'react';
import { AuthService } from './services/authService';
import { MedicalService } from './services/medicalService';
import { AuthState, UserRole } from './types/auth';
import { FileStorageService } from './services/fileStorageService';
import { Patient, ClinicalReport, MedicalJSONRoot, InconsistencyConflict, LabResult, Allergy, Condition, Medication } from './types/medical';

// Components
import { IntroSplash } from './components/onboarding/IntroSplash';
import { AuthLanding } from './components/auth/AuthLanding';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { Sidebar, NavigationTab } from './components/navigation/Sidebar';
import { TopHeader } from './components/navigation/TopHeader';
import { WorkspaceLayout } from './components/workspace/WorkspaceLayout';
import { DashboardView } from './components/views/DashboardView';
import { PatientsView } from './components/views/PatientsView';
import { PatientProfileView } from './components/views/PatientProfileView';
import { TimelineView } from './components/views/TimelineView';
import { ComparisonView } from './components/views/ComparisonView';
import { ReportStudioView } from './components/views/ReportStudioView';
import { VerificationCenterView } from './components/views/VerificationCenterView';
import { ConflictCenterView } from './components/views/ConflictCenterView';
import { AuditTrailView } from './components/views/AuditTrailView';
import { SettingsView } from './components/views/SettingsView';
import { UploadModal } from './components/views/UploadModal';
import { MedicalJSONModal } from './components/views/MedicalJSONModal';
import { ConflictModal } from './components/views/ConflictModal';
import { NewPatientModal } from './components/views/NewPatientModal';
import { AddClinicalDataModal, ClinicalEntryType } from './components/views/AddClinicalDataModal';

export const App: React.FC = () => {
  // Onboarding Intro Splash State (Task 2: Triggers on every reload)
  const [showIntro, setShowIntro] = useState<boolean>(true);

  // Auth State
  const [authState, setAuthState] = useState<AuthState>(() => AuthService.init());
  const [authView, setAuthView] = useState<'landing' | 'login' | 'register'>('landing');

  // Navigation State
  const [currentTab, setCurrentTab] = useState<NavigationTab>('workspace');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [sidebarPinned, setSidebarPinned] = useState(false);

  // Clinical Data State
  const [patients, setPatients] = useState<Patient[]>(() => MedicalService.getPatients());
  const [activePatientId, setActivePatientId] = useState<string>(patients[0]?.id || '');
  const [activeReportId, setActiveReportId] = useState<string>(patients[0]?.reports[0]?.id || '');
  const [inspectedPatientProfileId, setInspectedPatientProfileId] = useState<string | null>(null);

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isNewPatientOpen, setIsNewPatientOpen] = useState(false);
  const [isJSONModalOpen, setIsJSONModalOpen] = useState(false);
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
  const [isAddClinicalModalOpen, setIsAddClinicalModalOpen] = useState(false);
  const [addClinicalInitialType, setAddClinicalInitialType] = useState<ClinicalEntryType>('TEST');
  const [jsonExportData, setJsonExportData] = useState<MedicalJSONRoot | null>(null);
  const [conflicts, setConflicts] = useState<InconsistencyConflict[]>([]);

  useEffect(() => {
    MedicalService.init();
    const loaded = MedicalService.getPatients();
    setPatients(loaded);
    if (loaded.length > 0 && !activePatientId) {
      setActivePatientId(loaded[0].id);
      if (loaded[0].reports.length > 0) {
        setActiveReportId(loaded[0].reports[0].id);
      }
    }
  }, []);

  const activePatient = patients.find(p => p.id === activePatientId) || patients[0];
  const activeReport = activePatient?.reports.find(r => r.id === activeReportId) || activePatient?.reports[0];

  useEffect(() => {
    if (activePatient) {
      const detected = MedicalService.detectInconsistencies(activePatient.id);
      setConflicts(detected);
    }
  }, [activePatientId, patients]);

  const handleFinishIntro = () => {
    setShowIntro(false);
  };

  // Report Deletion Handler (Task 1)
  const handleDeleteReport = (reportId: string) => {
    if (!activePatient) return;
    MedicalService.deleteReport(activePatient.id, reportId);
    FileStorageService.removeFile(reportId);
    const updated = MedicalService.getPatients();
    setPatients([...updated]);
    const currentPat = updated.find(p => p.id === activePatient.id);
    if (currentPat) {
      if (activeReportId === reportId) {
        setActiveReportId(currentPat.reports[0]?.id || '');
      }
    }
  };

  // Add Clinical Entry Handlers (Task 7)
  const handleAddTest = (test: LabResult) => {
    if (!activePatient || !activeReport) return;
    MedicalService.addOrUpdateTest(activePatient.id, activeReport.id, test);
    setPatients([...MedicalService.getPatients()]);
  };

  const handleAddAllergy = (allergy: Allergy) => {
    if (!activePatient) return;
    MedicalService.addAllergy(activePatient.id, allergy);
    setPatients([...MedicalService.getPatients()]);
  };

  const handleAddCondition = (condition: Condition) => {
    if (!activePatient) return;
    MedicalService.addCondition(activePatient.id, condition);
    setPatients([...MedicalService.getPatients()]);
  };

  const handleAddMedication = (medication: Medication) => {
    if (!activePatient) return;
    MedicalService.addMedication(activePatient.id, medication);
    setPatients([...MedicalService.getPatients()]);
  };

  // Auth Handlers
  const handleDemoLogin = () => {
    const res = AuthService.loginWithDemo();
    setAuthState({ ...res });
    MedicalService.loadDemoData();
    const updated = MedicalService.getPatients(res.user?.id);
    setPatients([...updated]);
    if (updated.length > 0) {
      setActivePatientId(updated[0].id);
      if (updated[0].reports.length > 0) {
        setActiveReportId(updated[0].reports[0].id);
      }
    }
    setCurrentTab('workspace');
  };

  const handleLogin = (email: string, pass: string) => {
    const res = AuthService.login(email, pass);
    setAuthState({ ...res });
    const updated = MedicalService.getPatients(res.user?.id);
    setPatients([...updated]);
    if (updated.length > 0) {
      setActivePatientId(updated[0].id);
      if (updated[0].reports.length > 0) {
        setActiveReportId(updated[0].reports[0].id);
      }
    }
    setCurrentTab('workspace');
  };

  const handleRegister = (name: string, email: string, pass: string, role: UserRole) => {
    const res = AuthService.register(name, email, pass, role);
    setAuthState({ ...res });
    const updated = MedicalService.getPatients(res.user?.id);
    setPatients([...updated]);
    setCurrentTab('workspace');
  };

  const handleLogout = () => {
    const res = AuthService.logout();
    setAuthState({ ...res });
    setAuthView('landing');
  };

  // Patient & Workspace Selection Handlers
  const handleSelectPatient = (patientId: string) => {
    setActivePatientId(patientId);
    const targetPat = patients.find(p => p.id === patientId);
    if (targetPat && targetPat.reports.length > 0) {
      setActiveReportId(targetPat.reports[0].id);
    }
  };

  const handleSelectReport = (reportId: string) => {
    setActiveReportId(reportId);
    setCurrentTab('workspace');
  };

  const handleOpenWorkspaceFromDashboard = (patientId?: string, reportId?: string) => {
    if (patientId) setActivePatientId(patientId);
    if (reportId) setActiveReportId(reportId);
    setCurrentTab('workspace');
  };

  const handleViewPatientProfile = (patientId: string) => {
    setInspectedPatientProfileId(patientId);
  };

  // Patient Creation Handler
  const handleCreatePatient = (patientData: Partial<Patient>) => {
    const created = MedicalService.createPatient(patientData, authState.user?.id);
    const updated = MedicalService.getPatients(authState.user?.id);
    setPatients([...updated]);
    setActivePatientId(created.id);
    setIsNewPatientOpen(false);
  };

  // Verification Update Handler
  const handleVerifyTest = (
    testId: string, 
    action: 'CONFIRM' | 'EDIT' | 'REJECT', 
    editData?: { value: string | number; unit?: string; notes?: string }
  ) => {
    if (!activePatient || !activeReport) return;
    MedicalService.updateVerification(
      activePatient.id,
      activeReport.id,
      testId,
      action,
      authState.user?.name || 'Dr. Kenneth Reed',
      editData
    );
    setPatients([...MedicalService.getPatients()]);
  };

  // Upload Complete Handler (Integrates newly parsed report into patient's Medical JSON)
  const handleUploadSuccess = (newReport: ClinicalReport, targetPatientId?: string, newPatientName?: string) => {
    setIsUploadOpen(false);
    let pId = targetPatientId;

    if (!pId && newPatientName && newPatientName.trim()) {
      const cleanTargetName = newPatientName.trim();
      const existingPat = patients.find(p => p.name.trim().toLowerCase() === cleanTargetName.toLowerCase());
      if (existingPat) {
        pId = existingPat.id;
      } else {
        const created = MedicalService.createPatient({ name: cleanTargetName }, authState.user?.id);
        pId = created.id;
      }
    } else if (!pId) {
      pId = activePatient?.id || (patients.length > 0 ? patients[0].id : undefined);
      if (!pId) {
        const created = MedicalService.createPatient({ name: 'New Patient' }, authState.user?.id);
        pId = created.id;
      }
    }

    if (pId) {
      newReport.patientId = pId;
      MedicalService.addExtractedReport(pId, newReport);
      const updated = MedicalService.getPatients(authState.user?.id);
      setPatients([...updated]);
      setActivePatientId(pId);
      setActiveReportId(newReport.id);
      setCurrentTab('workspace');
    }
  };

  // Conflict Resolution Handler
  const handleResolveConflict = (conflictId: string, resolvedValue: string) => {
    MedicalService.resolveConflict(conflictId, resolvedValue, authState.user?.name || 'Dr. Kenneth Reed');
    setConflicts(prev => prev.map(c => c.id === conflictId ? { ...c, isResolved: true, resolvedValue } : c));
    setIsConflictModalOpen(false);
  };

  // JSON Export Handler
  const handleOpenJSONModal = () => {
    if (!activePatient) return;
    const exported = MedicalService.exportMedicalJSON(activePatient.id);
    setJsonExportData(exported);
    setIsJSONModalOpen(true);
  };

  // Reset Demo Data Handler
  const handleResetDemoData = () => {
    MedicalService.clearAllData();
    const fresh = MedicalService.getPatients();
    setPatients(fresh);
    setActivePatientId(fresh[0]?.id || '');
    setActiveReportId(fresh[0]?.reports[0]?.id || '');
  };

  // 1. FIRST-LAUNCH EXPERIENCE (CINEMATIC INTRO & SAFETY NOTICE)
  if (showIntro) {
    return <IntroSplash onComplete={handleFinishIntro} />;
  }

  // 2. AUTHENTICATION SCREENS
  if (!authState.isAuthenticated) {
    if (authView === 'login') {
      return (
        <LoginForm
          onSuccess={handleLogin}
          onDemoLogin={handleDemoLogin}
          onBack={() => setAuthView('landing')}
          onSwitchToRegister={() => setAuthView('register')}
        />
      );
    }

    if (authView === 'register') {
      return (
        <RegisterForm
          onSuccess={handleRegister}
          onBack={() => setAuthView('landing')}
          onSwitchToLogin={() => setAuthView('login')}
        />
      );
    }

    return (
      <AuthLanding
        onLoginClick={() => setAuthView('login')}
        onRegisterClick={() => setAuthView('register')}
        onDemoClick={handleDemoLogin}
      />
    );
  }

  const pendingVerificationCount = activePatient?.reports?.reduce((acc, report) => {
    return acc + report.tests.filter(t => t.verification.status === 'NEEDS_REVIEW' || t.ambiguityDetected).length;
  }, 0) || 0;
  const unresolvedConflictCount = conflicts.filter(c => !c.isResolved).length;

  // 3. MAIN APPLICATION WORKSPACE & VIEWS
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8FAFB] relative">
      {/* Left Edge Hover Hotzone & Pull Tab (triggers sidebar when mouse moves near left edge) */}
      {!sidebarPinned && (
        <div
          onMouseEnter={() => setSidebarHovered(true)}
          className="fixed left-0 top-0 bottom-0 w-3.5 z-40 hover:w-6 transition-all cursor-pointer group"
          title="Move mouse here to open navigation"
        >
          <div className="absolute left-0.5 top-1/2 -translate-y-1/2 w-1.5 h-16 bg-slate-300 group-hover:bg-[#218DAE] rounded-r-full transition-all shadow-xs group-hover:h-24" />
        </div>
      )}

      {/* Dimmed backdrop when hover drawer is open and not pinned */}
      {!sidebarPinned && (sidebarHovered || mobileSidebarOpen) && (
        <div
          onClick={() => {
            setSidebarHovered(false);
            setMobileSidebarOpen(false);
          }}
          className="fixed inset-0 bg-slate-900/25 backdrop-blur-[1px] z-45 transition-opacity"
        />
      )}

      {/* Sidebar Navigation (Slides out on hover, or pinned statically) */}
      <div
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => {
          if (!sidebarPinned) setSidebarHovered(false);
        }}
        className={`${
          sidebarPinned
            ? 'relative shrink-0 block z-30 h-full'
            : `fixed top-0 bottom-0 left-0 z-50 transition-transform duration-300 ease-out transform ${
                mobileSidebarOpen || sidebarHovered
                  ? 'translate-x-0'
                  : '-translate-x-full pointer-events-none'
              }`
        }`}
      >
        <Sidebar
          currentTab={currentTab}
          onTabChange={tab => {
            setCurrentTab(tab);
            setInspectedPatientProfileId(null);
            setMobileSidebarOpen(false);
            if (!sidebarPinned) setSidebarHovered(false);
          }}
          currentUser={authState.user}
          onLogout={handleLogout}
          onOpenJSONExport={handleOpenJSONModal}
          verificationCount={pendingVerificationCount}
          conflictCount={unresolvedConflictCount}
          isPinned={sidebarPinned}
          onTogglePin={() => setSidebarPinned(prev => !prev)}
          onClose={() => {
            setSidebarHovered(false);
            setMobileSidebarOpen(false);
          }}
        />
      </div>

      {/* Main Content Pane — Occupies 100% full screen when sidebar is hidden */}
      <div className="flex-1 flex flex-col h-full overflow-hidden w-full min-w-0">
        {/* Top Header */}
        <TopHeader
          patients={patients}
          activePatient={activePatient}
          onSelectPatient={handleSelectPatient}
          activeReport={activeReport}
          onSelectReport={handleSelectReport}
          onOpenUpload={() => setIsUploadOpen(true)}
          onOpenNewPatient={() => setIsNewPatientOpen(true)}
          onToggleMobileSidebar={() => {
            if (sidebarPinned) {
              setSidebarPinned(false);
            } else {
              setSidebarHovered(prev => !prev);
              setMobileSidebarOpen(prev => !prev);
            }
          }}
          onHoverSidebar={() => setSidebarHovered(true)}
          conflicts={conflicts}
          onOpenConflictsModal={() => setIsConflictModalOpen(true)}
        />

        {/* Dynamic Route View */}
        <div className="flex-1 h-[calc(100%-56px)] overflow-hidden">
          {inspectedPatientProfileId ? (
            <PatientProfileView
              patient={patients.find(p => p.id === inspectedPatientProfileId) || activePatient}
              onBack={() => setInspectedPatientProfileId(null)}
              onOpenWorkspace={() => {
                setActivePatientId(inspectedPatientProfileId);
                setInspectedPatientProfileId(null);
                setCurrentTab('workspace');
              }}
            />
          ) : currentTab === 'overview' ? (
            <DashboardView
              patients={patients}
              activePatient={activePatient}
              onOpenWorkspace={handleOpenWorkspaceFromDashboard}
              onOpenUpload={() => setIsUploadOpen(true)}
              onOpenCompare={() => setCurrentTab('compare')}
              auditTrail={MedicalService.getAuditTrail()}
            />
          ) : currentTab === 'workspace' || currentTab === 'reports' || currentTab === 'ask-medlens' ? (
            <WorkspaceLayout
              patient={activePatient}
              activeReport={activeReport}
              onSelectReport={handleSelectReport}
              onVerifyTest={handleVerifyTest}
              onOpenNewPatient={() => setIsNewPatientOpen(true)}
              onOpenUpload={() => setIsUploadOpen(true)}
              onDeleteReport={handleDeleteReport}
              onOpenAddClinicalModal={(type) => {
                if (type) setAddClinicalInitialType(type);
                setIsAddClinicalModalOpen(true);
              }}
              conflicts={conflicts}
              onOpenConflictsModal={() => setIsConflictModalOpen(true)}
            />
          ) : currentTab === 'patients' ? (
            <PatientsView
              patients={patients}
              onSelectPatient={id => {
                handleSelectPatient(id);
                setCurrentTab('workspace');
              }}
              onViewProfile={handleViewPatientProfile}
              onOpenNewPatient={() => setIsNewPatientOpen(true)}
            />
          ) : currentTab === 'timeline' ? (
            <TimelineView
              events={activePatient ? MedicalService.getPatientTimeline(activePatient.id) : []}
              patientName={activePatient?.name || 'No Patient Active'}
              onOpenReport={handleSelectReport}
            />
          ) : currentTab === 'compare' ? (
            <ComparisonView
              patient={activePatient}
              onOpenReport={handleSelectReport}
            />
          ) : currentTab === 'verification-center' ? (
            <VerificationCenterView
              patient={activePatient}
              onVerifyTest={handleVerifyTest}
              onOpenWorkspace={(reportId) => {
                setActiveReportId(reportId);
                setCurrentTab('workspace');
              }}
            />
          ) : currentTab === 'conflict-center' ? (
            <ConflictCenterView
              patient={activePatient}
              conflicts={conflicts}
              onResolveConflict={handleResolveConflict}
            />
          ) : currentTab === 'audit-trail' ? (
            <AuditTrailView
              auditEvents={MedicalService.getAuditTrail()}
              patientName={activePatient?.name || 'All Patients'}
            />
          ) : currentTab === 'report-studio' ? (
            <ReportStudioView patient={activePatient} />
          ) : currentTab === 'settings' ? (
            <SettingsView onResetDemoData={handleResetDemoData} />
          ) : null}
        </div>
      </div>

      {/* Add Clinical Data & AI Confirmation Modal (Task 7) */}
      <AddClinicalDataModal
        isOpen={isAddClinicalModalOpen}
        onClose={() => setIsAddClinicalModalOpen(false)}
        patient={activePatient}
        activeReport={activeReport}
        initialType={addClinicalInitialType}
        onAddTest={handleAddTest}
        onAddAllergy={handleAddAllergy}
        onAddCondition={handleAddCondition}
        onAddMedication={handleAddMedication}
      />

      {/* Register New Patient Modal */}
      <NewPatientModal
        isOpen={isNewPatientOpen}
        onClose={() => setIsNewPatientOpen(false)}
        onCreatePatient={handleCreatePatient}
      />

      {/* Upload Document Modal with Section 3 Pipeline Stepper */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
        patients={patients}
        activePatient={activePatient}
      />

      {/* Medical JSON Inspection Modal */}
      <MedicalJSONModal
        isOpen={isJSONModalOpen}
        onClose={() => setIsJSONModalOpen(false)}
        data={jsonExportData}
      />

      {/* Conflict Review Modal (Section 13) */}
      <ConflictModal
        isOpen={isConflictModalOpen}
        onClose={() => setIsConflictModalOpen(false)}
        conflicts={conflicts.filter(c => !c.isResolved)}
        onResolveConflict={handleResolveConflict}
      />
    </div>
  );
};
