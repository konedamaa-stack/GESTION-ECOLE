import React, { useEffect } from 'react';

interface CategoryExpensesPrintPreviewProps {
  expenses: any[];
  categoryTitle: string;
  categoryIcon: string;
  schoolInfo: any;
  monthFilter?: string;
}

export const CategoryExpensesPrintPreview: React.FC<CategoryExpensesPrintPreviewProps> = ({
  expenses,
  categoryTitle,
  categoryIcon,
  schoolInfo,
  monthFilter
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' F CFA';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const totalAmount = expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  return (
    <div className="category-expenses-report-container" style={{
      maxWidth: '900px',
      margin: '0 auto',
      padding: '30px',
      backgroundColor: 'white',
      color: '#0f172a',
      fontFamily: '"Inter", "Segoe UI", sans-serif',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }}>
      {/* 1. Header with School Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {schoolInfo?.logo_url ? (
            <img 
              src={schoolInfo.logo_url} 
              alt="Logo" 
              style={{ width: '75px', height: '75px', objectFit: 'contain', borderRadius: '8px' }} 
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/logo-coran.jpg'; }}
            />
          ) : (
            <div style={{ width: '75px', height: '75px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', fontSize: '24px', fontWeight: 'bold', color: '#64748b' }}>
              🏫
            </div>
          )}
          <div>
            <h1 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase' }}>
              {(schoolInfo?.school_name || schoolInfo?.name) || "ÉTABLISSEMENT SCOLAIRE"}
            </h1>
            <p style={{ margin: '0 0 3px 0', color: '#475569', fontSize: '13px' }}>
              {schoolInfo?.address ? `Adresse: ${schoolInfo.address}` : ''} 
              {schoolInfo?.city ? ` • ${schoolInfo.city}` : ''}
            </p>
            <p style={{ margin: '0', color: '#475569', fontSize: '13px' }}>
              Tél: <strong>{schoolInfo?.phone || '-'}</strong> | Email: <strong>{schoolInfo?.email || '-'}</strong>
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>RÉPUBLIQUE DE CÔTE D'IVOIRE</div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>Union - Discipline - Travail</div>
          <div style={{ marginTop: '8px', fontSize: '13px', fontWeight: 600, color: '#2563eb' }}>
            Année : {schoolInfo?.academic_year || `${new Date().getFullYear()} - ${new Date().getFullYear() + 1}`}
          </div>
        </div>
      </div>

      {/* 2. Document Title Banner */}
      <div style={{ 
        backgroundColor: '#f8fafc', 
        border: '1.5px solid #cbd5e1', 
        borderRadius: '10px', 
        padding: '14px 20px', 
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <h2 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#1e293b', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{categoryIcon || '📁'}</span>
            <span>ÉTAT DES DÉPENSES : {categoryTitle?.toUpperCase()}</span>
          </h2>
          <div style={{ fontSize: '13px', color: '#64748b' }}>
            {monthFilter && monthFilter !== 'all' 
              ? `Période sélectionnée : ${monthFilter}` 
              : `Toutes dates confondues • Édité le ${formatDate(new Date().toISOString())}`}
          </div>
        </div>

        <div style={{ textAlign: 'right', backgroundColor: 'white', padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>TOTAL DÉPENSÉ</div>
          <div style={{ fontSize: '18px', fontWeight: 900, color: '#dc2626' }}>
            {formatCurrency(totalAmount)}
          </div>
        </div>
      </div>

      {/* 3. Expenses Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px', fontSize: '13px' }}>
        <thead>
          <tr style={{ backgroundColor: '#0f172a', color: 'white' }}>
            <th style={{ padding: '10px 12px', textAlign: 'center', width: '6%', border: '1px solid #0f172a' }}>N°</th>
            <th style={{ padding: '10px 12px', textAlign: 'center', width: '14%', border: '1px solid #0f172a' }}>Date</th>
            <th style={{ padding: '10px 12px', textAlign: 'left', width: '22%', border: '1px solid #0f172a' }}>Catégorie</th>
            <th style={{ padding: '10px 12px', textAlign: 'left', width: '40%', border: '1px solid #0f172a' }}>Motif / Description détaillée</th>
            <th style={{ padding: '10px 12px', textAlign: 'right', width: '18%', border: '1px solid #0f172a' }}>Montant (F)</th>
          </tr>
        </thead>
        <tbody>
          {expenses && expenses.length > 0 ? (
            expenses.map((exp: any, idx: number) => (
              <tr key={exp.id || idx} style={{ backgroundColor: idx % 2 === 0 ? 'white' : '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600, borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0' }}>
                  {idx + 1}
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'center', borderRight: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>
                  {formatDate(exp.payment_date)}
                </td>
                <td style={{ padding: '10px 12px', fontWeight: 600, color: '#334155', borderRight: '1px solid #e2e8f0' }}>
                  {exp.category || categoryTitle}
                </td>
                <td style={{ padding: '10px 12px', color: '#1e293b', borderRight: '1px solid #e2e8f0', lineHeight: 1.4 }}>
                  {exp.description || 'Dépense courante'}
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#b91c1c', borderRight: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>
                  {formatCurrency(Number(exp.amount) || 0)}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                Aucune dépense enregistrée dans cette catégorie.
              </td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr style={{ backgroundColor: '#f1f5f9', fontWeight: 'bold', borderTop: '2px solid #0f172a' }}>
            <td colSpan={3} style={{ padding: '12px 14px', fontSize: '14px', border: '1px solid #cbd5e1' }}>
              TOTAL GÉNÉRAL ({expenses.length} dépense{expenses.length > 1 ? 's' : ''})
            </td>
            <td colSpan={2} style={{ padding: '12px 14px', textAlign: 'right', fontSize: '16px', color: '#b91c1c', border: '1px solid #cbd5e1', fontWeight: 900 }}>
              {formatCurrency(totalAmount)}
            </td>
          </tr>
        </tfoot>
      </table>

      {/* 4. Signatures Box */}
      <div style={{ 
        marginTop: '36px', 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: '24px', 
        fontSize: '13px',
        pageBreakInside: 'avoid'
      }}>
        <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '14px', minHeight: '110px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 700, color: '#334155', textDecoration: 'underline' }}>
            Le Comptable / Gestionnaire de Caisse
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>
            Visa et approbation des écritures
          </div>
        </div>

        <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '14px', minHeight: '110px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
          <div style={{ fontWeight: 700, color: '#334155', textDecoration: 'underline' }}>
            La Direction de l'Établissement (Cachet & Signature)
          </div>
          {schoolInfo?.stamp_url && (
            <img 
              src={schoolInfo.stamp_url} 
              alt="Cachet" 
              style={{ maxHeight: '45px', maxWidth: '100px', objectFit: 'contain', position: 'absolute', right: '20px', bottom: '15px', opacity: 0.85 }} 
            />
          )}
          <div style={{ fontSize: '12px', fontWeight: 600 }}>
            {schoolInfo?.principal_name || 'La Direction'}
          </div>
        </div>
      </div>

      {/* 5. Footer watermark */}
      <div style={{ marginTop: '28px', textAlign: 'center', color: '#94a3b8', fontSize: '11px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
        Document officiel généré par le Système de Gestion Scolaire • {(schoolInfo?.school_name || schoolInfo?.name) || ''}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .category-expenses-report-container, .category-expenses-report-container * {
            visibility: visible;
          }
          .category-expenses-report-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 15px !important;
            box-shadow: none !important;
            border: none !important;
          }
          .hide-print {
            display: none !important;
          }
        }
      `}} />
    </div>
  );
};
