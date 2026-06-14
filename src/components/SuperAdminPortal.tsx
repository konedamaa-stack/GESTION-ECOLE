import React, { useState } from 'react';
import { SaaSDashboard } from './SaaSDashboard';
import { AdminList } from './AdminList';

const Icons = {
  Home: () => <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline strokeLinecap="round" strokeLinejoin="round" d="M9 22V12h6v10" /></svg>,
  Users: () => <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 0 0-3-3.87" /><path strokeLinecap="round" strokeLinejoin="round" d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  Activity: () => <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  LogOut: () => <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline strokeLinecap="round" strokeLinejoin="round" points="16 17 21 12 16 7"/><line strokeLinecap="round" strokeLinejoin="round" x1="21" y1="12" x2="9" y2="12"/></svg>
};

interface SuperAdminPortalProps {
  session: any;
  onExit: () => void;
  onSwitchToSchool: (schoolId: string) => void;
}

export function SuperAdminPortal({ session, onExit, onSwitchToSchool }: SuperAdminPortalProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="app-container" style={{ background: '#F9FAFB' }}>
      <div className={`sidebar-overlay ${isMobileMenuOpen ? 'open' : ''}`} onClick={() => setIsMobileMenuOpen(false)}></div>
      
      <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`} style={{ background: '#111827', color: 'white' }}>
        <div className="sidebar-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="logo-icon" style={{ background: 'var(--accent-color)', color: 'white' }}>S</div>
          <span className="logo-text" style={{ color: 'white' }}>Super Admin</span>
        </div>
        
        <nav className="sidebar-nav">
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li 
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} 
              onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }}
              style={{ color: activeTab === 'dashboard' ? 'white' : '#9CA3AF', background: activeTab === 'dashboard' ? 'rgba(255,255,255,0.1)' : 'transparent', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
            >
              <Icons.Activity />
              <span>Vue Globale (SaaS)</span>
            </li>
            <li 
              className={`nav-item ${activeTab === 'admins' ? 'active' : ''}`} 
              onClick={() => { setActiveTab('admins'); setIsMobileMenuOpen(false); }}
              style={{ color: activeTab === 'admins' ? 'white' : '#9CA3AF', background: activeTab === 'admins' ? 'rgba(255,255,255,0.1)' : 'transparent', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
            >
              <Icons.Users />
              <span>Directeurs & Écoles</span>
            </li>
            
            <div style={{ flex: 1 }}></div>

            <li 
              className="nav-item" 
              onClick={onExit}
              style={{ color: '#F87171', background: 'rgba(248, 113, 113, 0.1)', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', marginTop: 'auto' }}
            >
              <Icons.LogOut />
              <span>Quitter le mode Super</span>
            </li>
          </ul>
        </nav>
      </aside>

      <main className="main-content" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <header className="top-header" style={{ background: '#fff', borderBottom: '1px solid #E5E7EB', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(true)} style={{ display: 'none' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <h1 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 600, color: '#111827' }}>
              {activeTab === 'dashboard' ? 'Tableau de bord Global' : 'Liste des Directeurs'}
            </h1>
          </div>
          
          <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#111827' }}>{session?.user?.email}</div>
              <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Super Administrateur</div>
            </div>
            <div style={{ width: '40px', height: '40px', background: '#111827', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              S
            </div>
          </div>
        </header>

        <div className="content-scrollable" style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {activeTab === 'dashboard' && <SaaSDashboard session={session} onSwitchToSchool={onSwitchToSchool} onClose={onExit} />}
          {activeTab === 'admins' && <AdminList />}
        </div>
      </main>
    </div>
  );
}
