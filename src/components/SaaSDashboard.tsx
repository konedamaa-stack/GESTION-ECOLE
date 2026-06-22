import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface SaaSDashboardProps {
  session: any;
  onSwitchToSchool: (schoolId: string) => void;
}

export function SaaSDashboard({ session, onSwitchToSchool }: SaaSDashboardProps) {
  const [schools, setSchools] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalRevenue: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeSubModal, setActiveSubModal] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState('Pro');
  const [selectedEndDate, setSelectedEndDate] = useState('');

  useEffect(() => {
    fetchSaaSData();
  }, []);

  const fetchSaaSData = async () => {
    setIsLoading(true);
    try {
      const isSuperAdmin = session.user.email === 'konedamaa@gmail.com';
      let userSchools = [];

      if (isSuperAdmin) {
        const { data: allSchools } = await supabase.from('schools').select('*');
        userSchools = allSchools || [];
      } else {
        const { data: adminLinks } = await supabase
          .from('school_admins')
          .select('school_id, schools(*)')
          .eq('user_id', session.user.id);
          
        userSchools = adminLinks ? adminLinks.map((l: any) => l.schools) : [];
      }
      
      let totalSt = 0;
      let totalTe = 0;
      
      // Récupération des stats par école
      const enrichedSchools = await Promise.all(userSchools.map(async (school: any) => {
        // Étudiants
        const { count: studentCount } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true })
          .eq('school_id', school.id);
          
        // Profs
        const { count: teacherCount } = await supabase
          .from('teachers')
          .select('*', { count: 'exact', head: true })
          .eq('school_id', school.id);
          
        totalSt += studentCount || 0;
        totalTe += teacherCount || 0;
        
        return {
          ...school,
          studentCount: studentCount || 0,
          teacherCount: teacherCount || 0
        };
      }));

      setSchools(enrichedSchools);
      setStats({
        totalStudents: totalSt,
        totalTeachers: totalTe,
        totalRevenue: 0 // Simplifié pour le moment
      });
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  const formatNum = (n: number) => new Intl.NumberFormat('fr-FR').format(n);

  const handleUpdateSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubModal) return;
    try {
      const { error } = await supabase.from('schools').update({
        subscription_plan: selectedPlan,
        subscription_end_date: selectedEndDate ? new Date(selectedEndDate).toISOString() : null
      }).eq('id', activeSubModal.id);
      
      if (error) throw error;
      alert('Abonnement mis à jour avec succès !');
      setActiveSubModal(null);
      fetchSaaSData();
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la mise à jour.');
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      {/* Header removed for portal */}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ color: '#6B7280', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase' }}>Établissements</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#111827' }}>{schools.length}</div>
        </div>
        <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ color: '#6B7280', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase' }}>Élèves Globaux</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#3B82F6' }}>{formatNum(stats.totalStudents)}</div>
        </div>
        <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ color: '#6B7280', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase' }}>Professeurs Globaux</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#10B981' }}>{formatNum(stats.totalTeachers)}</div>
        </div>
      </div>

      <h2 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Liste des Établissements</h2>
      
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>Chargement des données globales...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
          {schools.map(school => (
            <div key={school.id} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '20px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '16px' }}>
                {school.logo_url ? (
                  <img src={school.logo_url} alt="Logo" style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold', color: '#9CA3AF' }}>
                    {(school.name || 'E').charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', color: '#111827' }}>{school.name}</h3>
                  <div style={{ fontSize: '0.85rem', color: '#6B7280' }}>ID: {school.id.split('-')[0]}</div>
                </div>
              </div>
              <div style={{ padding: '20px', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: '#6B7280' }}>Plan actuel :</span>
                  <span style={{ fontWeight: 600, color: school.subscription_plan === 'Pro' ? '#8B5CF6' : '#3B82F6' }}>{school.subscription_plan || 'Standard'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: '#6B7280' }}>Élèves inscrits :</span>
                  <span style={{ fontWeight: 600 }}>{formatNum(school.studentCount)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: '#6B7280' }}>Expiration Pro :</span>
                  <span style={{ fontWeight: 600, color: (school.subscription_plan === 'Pro' && school.subscription_end_date && new Date(school.subscription_end_date) < new Date()) ? 'red' : '#111827' }}>
                    {school.subscription_end_date ? new Date(school.subscription_end_date).toLocaleDateString('fr-FR') : 'Illimité'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6B7280' }}>Professeurs :</span>
                  <span style={{ fontWeight: 600 }}>{formatNum(school.teacherCount)}</span>
                </div>
              </div>
              <div style={{ padding: '16px 20px', background: '#F9FAFB', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between' }}>
                <button 
                  onClick={() => {
                    setActiveSubModal(school);
                    setSelectedPlan(school.subscription_plan || 'Standard');
                    setSelectedEndDate(school.subscription_end_date ? new Date(school.subscription_end_date).toISOString().split('T')[0] : '');
                  }}
                  style={{ padding: '8px 12px', background: '#10B981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}
                >
                  Gérer Abo.
                </button>
                <button 
                  onClick={() => onSwitchToSchool(school.id)}
                  style={{ padding: '8px 12px', background: '#3B82F6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}
                >
                  Ouvrir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Sub Modal */}
      {activeSubModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', width: '400px', maxWidth: '90%' }}>
            <h3 style={{ marginTop: 0 }}>Gérer l'Abonnement</h3>
            <p style={{ color: '#6B7280', marginBottom: '20px' }}>École: <strong>{activeSubModal.name}</strong></p>
            <form onSubmit={handleUpdateSubscription}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Plan</label>
                <select value={selectedPlan} onChange={(e) => setSelectedPlan(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}>
                  <option value="Standard">Standard (Limité à 20 élèves)</option>
                  <option value="Pro">Pro (Illimité)</option>
                </select>
              </div>
              {selectedPlan === 'Pro' && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Date d'expiration</label>
                  <input type="date" value={selectedEndDate} onChange={(e) => setSelectedEndDate(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }} />
                  <small style={{ color: '#6B7280', display: 'block', marginTop: '4px' }}>Laissez vide pour un accès à vie.</small>
                  
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button type="button" onClick={() => { const d = new Date(); d.setMonth(d.getMonth() + 1); setSelectedEndDate(d.toISOString().split('T')[0]); }} style={{ padding: '4px 8px', fontSize: '0.8rem', background: '#F3F4F6', border: '1px solid #D1D5DB', borderRadius: '4px', cursor: 'pointer' }}>+1 Mois</button>
                    <button type="button" onClick={() => { const d = new Date(); d.setFullYear(d.getFullYear() + 1); setSelectedEndDate(d.toISOString().split('T')[0]); }} style={{ padding: '4px 8px', fontSize: '0.8rem', background: '#F3F4F6', border: '1px solid #D1D5DB', borderRadius: '4px', cursor: 'pointer' }}>+1 An</button>
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setActiveSubModal(null)} style={{ padding: '10px 16px', background: 'transparent', border: '1px solid #D1D5DB', borderRadius: '6px', cursor: 'pointer' }}>Annuler</button>
                <button type="submit" style={{ padding: '10px 16px', background: '#3B82F6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Sauvegarder</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
