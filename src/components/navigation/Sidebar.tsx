import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  History, 
  ArrowLeftRight, 
  LayoutTemplate, 
  Sparkles, 
  Settings, 
  LogOut,
  Shield,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Pin,
  PinOff,
  X
} from 'lucide-react';
import { User } from '../../types/auth';

export type NavigationTab = 
  | 'overview' 
  | 'workspace' 
  | 'patients' 
  | 'reports' 
  | 'timeline' 
  | 'compare' 
  | 'verification-center'
  | 'conflict-center'
  | 'audit-trail'
  | 'report-studio' 
  | 'ask-medlens'
  | 'settings';

interface SidebarProps {
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  currentUser: User | null;
  onLogout: () => void;
  onOpenJSONExport: () => void;
  verificationCount?: number;
  conflictCount?: number;
  isPinned?: boolean;
  onTogglePin?: () => void;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  currentUser,
  onLogout,
  onOpenJSONExport,
  verificationCount = 0,
  conflictCount = 0,
  isPinned = false,
  onTogglePin,
  onClose
}) => {
  const mainNavItems: { 
    id: NavigationTab; 
    label: string; 
    icon: React.FC<{ className?: string }>;
    badge?: number;
    badgeColor?: string;
  }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'workspace', label: 'Workspace', icon: FileText },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'timeline', label: 'Timeline', icon: History },
    { id: 'compare', label: 'Compare', icon: ArrowLeftRight },
    { 
      id: 'verification-center', 
      label: 'Verification Center', 
      icon: ShieldCheck, 
      badge: verificationCount, 
      badgeColor: 'bg-amber-100 text-amber-900 border border-amber-300' 
    },
    { 
      id: 'conflict-center', 
      label: 'Conflict Center', 
      icon: ShieldAlert, 
      badge: conflictCount, 
      badgeColor: 'bg-rose-100 text-rose-800 border border-rose-300' 
    },
    { id: 'audit-trail', label: 'Audit History', icon: Clock },
    { id: 'report-studio', label: 'Report Studio', icon: LayoutTemplate },
  ];

  return (
    <aside className="w-72 md:w-80 h-full bg-white border-r border-slate-200/90 flex flex-col justify-between shrink-0 select-none shadow-2xl md:shadow-none">
      {/* Brand Header & Pin Controls */}
      <div>
        <div className="p-4 md:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#218DAE] flex items-center justify-center text-white font-extrabold text-base shadow-sm shadow-[#218DAE]/25">
              ML
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-slate-900 block leading-tight">
                MEDLENS
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Clinical Intelligence
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {onTogglePin && (
              <button
                onClick={onTogglePin}
                title={isPinned ? "Unpin sidebar (auto-hide on hover)" : "Pin sidebar open"}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer hidden md:flex items-center justify-center ${
                  isPinned 
                    ? 'bg-[#e8f4f8] text-[#186d88]' 
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                }`}
              >
                {isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
              </button>
            )}

            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                title="Close sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Primary Navigation */}
        <div className="px-3 py-3 md:py-4 space-y-1 overflow-y-auto max-h-[calc(100vh-210px)]">
          <div className="px-3 pb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            Clinical Navigation
          </div>
          {mainNavItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#e8f4f8] text-[#186d88] font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#218DAE]' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${item.badgeColor || 'bg-amber-100 text-amber-900'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* MedLens AI Dedicated Section */}
          <div className="pt-4 px-3 pb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            Intelligence Layer
          </div>

          <button
            onClick={() => onTabChange('ask-medlens')}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              currentTab === 'ask-medlens'
                ? 'bg-gradient-to-r from-[#eaf9fc] to-[#e8f4f8] text-[#186d88] border border-[#2BBBD7]/30 shadow-sm'
                : 'text-slate-700 hover:bg-[#eaf9fc]/60 hover:text-[#186d88]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-lg bg-[#2BBBD7]/20 flex items-center justify-center text-[#2BBBD7]">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-slate-900">Ask MedLens</span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-[#2BBBD7]/20 text-[#1fa2bb] font-extrabold">
              AI
            </span>
          </button>
        </div>
      </div>

      {/* Footer / User Profile & Actions */}
      <div className="p-3.5 border-t border-slate-100 space-y-2 bg-slate-50/40">
        <button
          onClick={onOpenJSONExport}
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-white hover:shadow-2xs transition-all cursor-pointer"
          title="Inspect normalized Medical JSON"
        >
          <span className="flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-[#218DAE]" />
            <span>Medical JSON Export</span>
          </span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </button>

        <button
          onClick={() => onTabChange('settings')}
          className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            currentTab === 'settings'
              ? 'bg-[#e8f4f8] text-[#186d88] font-bold'
              : 'text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-2xs'
          }`}
        >
          <Settings className="w-4 h-4 text-slate-400" />
          <span>Settings</span>
        </button>

        {/* User Card */}
        <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between px-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-[#218DAE]/15 text-[#218DAE] flex items-center justify-center font-black text-sm shrink-0">
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">
                {currentUser?.name || 'Clinician'}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {currentUser?.role === 'PATIENT' ? 'Patient Portal' : 'Clinical Reviewer'}
              </p>
            </div>
          </div>

          <button
            onClick={onLogout}
            title="Log out"
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
