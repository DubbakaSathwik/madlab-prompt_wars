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
  Clock
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
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  currentUser,
  onLogout,
  onOpenJSONExport,
  verificationCount = 0,
  conflictCount = 0
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
    <aside className="w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between shrink-0 select-none z-30">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#218DAE] flex items-center justify-center text-white font-bold text-sm shadow-sm shadow-[#218DAE]/20">
              ML
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900 block leading-tight">
                MEDLENS
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                Clinical Intelligence
              </span>
            </div>
          </div>
        </div>

        {/* Primary Navigation */}
        <div className="px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Clinical Navigation
          </div>
          {mainNavItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#e8f4f8] text-[#186d88] font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#218DAE]' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${item.badgeColor || 'bg-amber-100 text-amber-900'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* MedLens AI Dedicated Section */}
          <div className="pt-5 px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Intelligence Layer
          </div>

          <button
            onClick={() => onTabChange('ask-medlens')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              currentTab === 'ask-medlens'
                ? 'bg-gradient-to-r from-[#eaf9fc] to-[#e8f4f8] text-[#186d88] font-semibold border border-[#2BBBD7]/30 shadow-sm'
                : 'text-slate-700 hover:bg-[#eaf9fc]/60 hover:text-[#186d88]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-md bg-[#2BBBD7]/20 flex items-center justify-center text-[#2BBBD7]">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold text-slate-800">Ask MedLens</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#2BBBD7]/20 text-[#1fa2bb] font-semibold">
              AI
            </span>
          </button>
        </div>
      </div>

      {/* Footer / User Profile & Actions */}
      <div className="p-3 border-t border-slate-100 space-y-2">
        <button
          onClick={onOpenJSONExport}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[11px] font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Inspect normalized Medical JSON"
        >
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#218DAE]" />
            <span>Medical JSON Export</span>
          </span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </button>

        <button
          onClick={() => onTabChange('settings')}
          className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            currentTab === 'settings'
              ? 'bg-slate-100 text-slate-900 font-semibold'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Settings className="w-3.5 h-3.5 text-slate-400" />
          <span>Settings</span>
        </button>

        {/* User Card */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between px-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-[#218DAE]/15 text-[#218DAE] flex items-center justify-center font-bold text-xs shrink-0">
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-800 truncate">
                {currentUser?.name || 'Clinician'}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {currentUser?.role === 'PATIENT' ? 'Patient Portal' : 'Clinical Reviewer'}
              </p>
            </div>
          </div>

          <button
            onClick={onLogout}
            title="Log out"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
