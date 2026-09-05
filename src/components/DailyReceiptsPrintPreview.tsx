import React, { useEffect } from 'react';

interface DailyReceiptsPrintPreviewProps {
  invoices: any[];
  selectedDate?: string;
  startDate?: string;
  endDate?: string;
  schoolInfo: any;
  paymentMethodFilter?: string;
  categoryFilter?: 'all' | 'scolarite' | 'annexes';
}

export const DailyReceiptsPrintPreview: React.FC<DailyReceiptsPrintPreviewProps> = ({
  invoices,
  selectedDate,
  startDate,
  endDate,
  schoolInfo,
  paymentMethodFilter = 'all',
  categoryFilter = 'all'
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

  const formatDateDisplay = () => {
    const s = startDate || selectedDate;
    const e = endDate;
    if (!s && !e) return "Toutes les dates";

    const formatSingle = (dtStr: string) => {
      const d = new Date(dtStr);
      if (isNaN(d.getTime())) return dtStr;
      return d.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    };

    if (s && e) {
      if (s === e) {
        return `Le ${formatSingle(s)}`;
      }
      return `Du ${formatSingle(s)} au ${formatSingle(e)}`;
    }
    if (s) return `À partir du ${formatSingle(s)}`;
    if (e) return `Jusqu'au ${formatSingle(e)}`;
    return "Toutes les dates";
  };

  const totalAmount = invoices.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  // Helper to distinguish Frais Annexes vs Scolarité
  const isAnnexe = (inv: any) => {
    const m = (inv.motif || '').toLowerCase().trim();
    if (m.includes('scolarité') || m.includes('scolarite')) return false;
    if (inv.invoice_number && String(inv.invoice_number).includes('FAC-ANNEXE')) return true;
    return (
      m.includes('bulletin') ||
      m.includes('tricot') ||
      m.includes('polo') ||
      m.includes('macaron') ||
      m.includes('badge') ||
      m.includes('assurance') ||
      m.includes('entretien') ||
      m.includes('ceremonie') ||
      m.includes('compo') ||
      m.includes('carte scolaire') ||
      m.includes('relevè') ||
      m.includes('releve') ||
      m.includes('inscription') ||
      m.includes('annexe')
    );
  };

  const scolariteInvoices = invoices.filter(inv => !isAnnexe(inv));
  const annexesInvoices = invoices.filter(inv => isAnnexe(inv));
  const scolariteTotal = scolariteInvoices.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
  const annexesTotal = annexesInvoices.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);

  // Group by payment method
  const methodStats: Record<string, { count: number; total: number }> = {};
  invoices.forEach(inv => {
    const method = inv.payment_method || 'Espèces';
    if (!methodStats[method]) {
      methodStats[method] = { count: 0, total: 0 };
    }
    methodStats[method].count += 1;
    methodStats[method].total += Number(inv.amount) || 0;
  });

  return (
    <div className="daily-receipts-report-container" style={{
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
          <div style={{ marginTop: '8px', fontSize: '13px', fontWeight: 600, color: '#10b981' }}>
            Année : {schoolInfo?.academic_year || `${new Date().getFullYear()} - ${new Date().getFullYear() + 1}`}
          </div>
        </div>
      </div>

      {/* 2. Document Title Banner */}
      <div style={{ 
        backgroundColor: '#f0fdf4', 
        border: '1.5px solid #86efac', 
        borderRadius: '10px', 
        padding: '14px 20px', 
        marginBottom: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#166534', fontWeight: 700, letterSpacing: '0.5px' }}>
            {categoryFilter === 'scolarite' 
              ? 'JOURNAL DES ENCAISSEMENTS - FRAIS DE SCOLARITÉ'
              : categoryFilter === 'annexes'
              ? 'JOURNAL DES ENCAISSEMENTS - FRAIS ANNEXES'
              : 'JOURNAL DE CAISSE / RECETTE DES VERSEMENTS'}
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#14532d', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'capitalize' }}>
            <span>📅</span>
            <span>{formatDateDisplay()}</span>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '2px', fontSize: '12px', color: '#166534' }}>
            {categoryFilter !== 'all' && (
              <div>
                Type : <strong>{categoryFilter === 'scolarite' ? '🎓 Scolarité uniquement' : '💳 Frais Annexes uniquement'}</strong>
              </div>
            )}
            {paymentMethodFilter !== 'all' && (
              <div>
                Mode : <strong>{paymentMethodFilter}</strong>
              </div>
            )}
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '12px', color: '#166534' }}>Total Encaissé</div>
          <div style={{ fontSize: '22px', fontWeight: 900, color: '#15803d' }}>
            {formatCurrency(totalAmount)}
          </div>
          <div style={{ fontSize: '12px', color: '#475569' }}>
            {invoices.length} versement{invoices.length > 1 ? 's' : ''} enregistré{invoices.length > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* 2.bis Category Summary (Scolarité vs Frais Annexes) when in global view */}
      {categoryFilter === 'all' && (scolariteTotal > 0 || annexesTotal > 0) && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          marginBottom: '16px'
        }}>
          <div style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '8px',
            padding: '10px 14px'
          }}>
            <div style={{ fontSize: '11px', color: '#1d4ed8', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span>🎓</span> Frais de Scolarité
            </div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#1e40af', marginTop: '3px' }}>
              {formatCurrency(scolariteTotal)}
            </div>
            <div style={{ fontSize: '11px', color: '#3b82f6' }}>
              {scolariteInvoices.length} reçu{scolariteInvoices.length > 1 ? 's' : ''} de scolarité
            </div>
          </div>

          <div style={{
            backgroundColor: '#faf5ff',
            border: '1px solid #e9d5ff',
            borderRadius: '8px',
            padding: '10px 14px'
          }}>
            <div style={{ fontSize: '11px', color: '#7e22ce', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span>💳</span> Frais Annexes
            </div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#6b21a8', marginTop: '3px' }}>
              {formatCurrency(annexesTotal)}
            </div>
            <div style={{ fontSize: '11px', color: '#9333ea' }}>
              {annexesInvoices.length} reçu{annexesInvoices.length > 1 ? 's' : ''} de frais annexes
            </div>
          </div>
        </div>
      )}

      {/* 3. Payment Methods Breakdown Cards */}
      {Object.keys(methodStats).length > 0 && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
          gap: '12px', 
          marginBottom: '20px' 
        }}>
          {Object.entries(methodStats).map(([method, stats]) => (
            <div key={method} style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '8px 12px'
            }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                💳 {method}
              </div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                {formatCurrency(stats.total)}
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                {stats.count} versement{stats.count > 1 ? 's' : ''}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Table of Invoices / Payments */}
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        marginBottom: '24px',
        fontSize: '12px'
      }}>
        <thead>
          <tr style={{ backgroundColor: '#10b981', color: 'white', textAlign: 'left' }}>
            <th style={{ padding: '8px 10px', width: '5%', textAlign: 'center' }}>#</th>
            <th style={{ padding: '8px 10px', width: '15%' }}>N° Reçu</th>
            <th style={{ padding: '8px 10px', width: '26%' }}>Élève & Matricule</th>
            <th style={{ padding: '8px 10px', width: '13%' }}>Classe</th>
            <th style={{ padding: '8px 10px', width: '23%' }}>Type & Motif</th>
            <th style={{ padding: '8px 10px', width: '8%' }}>Mode</th>
            <th style={{ padding: '8px 10px', width: '10%', textAlign: 'right' }}>Montant</th>
          </tr>
        </thead>
        <tbody>
          {invoices && invoices.length > 0 ? (
            invoices.map((inv: any, index: number) => {
              const studentName = inv.students 
                ? `${inv.students.last_name || ''} ${inv.students.first_name || ''}`.trim() 
                : 'Élève';
              const matricule = inv.students?.matricule || '-';
              const className = inv.students?.classes?.name || 'N/A';
              const isAnn = isAnnexe(inv);

              return (
                <tr key={inv.id || index} style={{
                  borderBottom: '1px solid #e2e8f0',
                  backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc'
                }}>
                  <td style={{ padding: '8px 10px', textAlign: 'center', color: '#64748b' }}>{index + 1}</td>
                  <td style={{ padding: '8px 10px', fontWeight: 600, fontFamily: 'monospace', color: '#2563eb' }}>
                    {inv.invoice_number}
                  </td>
                  <td style={{ padding: '8px 10px' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{studentName}</div>
                    <div style={{ fontSize: '10.5px', color: '#64748b' }}>Mat: {matricule}</div>
                  </td>
                  <td style={{ padding: '8px 10px', fontWeight: 500 }}>
                    {className}
                  </td>
                  <td style={{ padding: '8px 10px', color: '#334155' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: '9.5px',
                        padding: '1px 5px',
                        borderRadius: '4px',
                        fontWeight: 700,
                        backgroundColor: isAnn ? '#ede9fe' : '#dbeafe',
                        color: isAnn ? '#6d28d9' : '#1d4ed8',
                        whiteSpace: 'nowrap'
                      }}>
                        {isAnn ? '💳 ANNEXE' : '🎓 SCOLARITÉ'}
                      </span>
                      <span style={{ fontSize: '11.5px', fontWeight: 500 }}>
                        {inv.motif || (isAnn ? 'Frais annexe' : 'Scolarité')}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '8px 10px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: '#f1f5f9',
                      fontSize: '10.5px',
                      fontWeight: 600,
                      color: '#475569'
                    }}>
                      {inv.payment_method || 'Espèces'}
                    </span>
                  </td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 800, color: '#15803d', whiteSpace: 'nowrap' }}>
                    {formatCurrency(Number(inv.amount) || 0)}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                Aucun versement enregistré pour cette date.
              </td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr style={{ backgroundColor: '#f0fdf4', borderTop: '2px solid #86efac', fontWeight: 800 }}>
            <td colSpan={6} style={{ padding: '10px', textAlign: 'right', fontSize: '13px', color: '#14532d' }}>
              TOTAL GÉNÉRAL ENCAISSÉ :
            </td>
            <td style={{ padding: '10px', textAlign: 'right', fontSize: '14px', color: '#15803d', whiteSpace: 'nowrap' }}>
              {formatCurrency(totalAmount)}
            </td>
          </tr>
        </tfoot>
      </table>

      {/* 5. Signatures and Stamp Box */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px',
        marginTop: '36px',
        pageBreakInside: 'avoid'
      }}>
        <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '14px', textAlign: 'center', minHeight: '110px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>
            La Caisse / Caissier(ère)
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>
            (Signature & Reçu)
          </div>
          <div style={{ marginTop: '24px', fontWeight: 600, fontSize: '12px' }}>
            {schoolInfo?.cashier_name || 'Le Responsable Caisse'}
          </div>
        </div>

        <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '14px', textAlign: 'center', minHeight: '110px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>
            Le Chef Comptable
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>
            (Contrôle & Visa)
          </div>
        </div>

        <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '14px', textAlign: 'center', minHeight: '110px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>
            Le Chef d'Établissement
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>
            (Cachet & Signature Officielle)
          </div>
          <div style={{ marginTop: '24px', fontWeight: 600, fontSize: '12px' }}>
            {schoolInfo?.principal_name || schoolInfo?.director_name || 'La Direction'}
          </div>
        </div>
      </div>

      {/* 6. Footer */}
      <div style={{ 
        marginTop: '28px', 
        textAlign: 'center', 
        fontSize: '11px', 
        color: '#94a3b8', 
        borderTop: '1px solid #f1f5f9', 
        paddingTop: '12px' 
      }}>
        Document officiel généré le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} • Logiciel de Gestion Scolaire
      </div>
    </div>
  );
};
