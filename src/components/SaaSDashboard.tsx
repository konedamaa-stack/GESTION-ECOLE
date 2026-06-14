import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';

interface SaaSDashboardProps {
  session: any;
  onSwitchToSchool: (schoolId: string) => void;
  onClose: () => void;
}

export function SaaSDashboard({ session, onSwitchToSchool, onClose }: SaaSDashboardProps) {
  const { t } = useTranslation();
  const [schools, setSchools] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalRevenue: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSaaSData();
  }, []);

  const fetchSaaSData = async () => {
    setIsLoading(true);
    try {
      // Pour l'instant on récupère les écoles liées à l'admin
      const { data: adminLinks } = await supabase
        .from('school_admins')
        .select('school_id, schools(*)')
        .eq('user_id', session.user.id);
        
      const userSchools = adminLinks ? adminLinks.map((l: any) => l.schools) : [];
      
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
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6B7280' }}>Professeurs :</span>
                  <span style={{ fontWeight: 600 }}>{formatNum(school.teacherCount)}</span>
                </div>
              </div>
              <div style={{ padding: '16px 20px', background: '#F9FAFB', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  onClick={() => onSwitchToSchool(school.id)}
                  style={{ padding: '8px 16px', background: '#3B82F6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Gérer cet établissement
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
