import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface FraisAnnexesPrintPreviewProps {
  schoolInfo: any;
  fraisList: any[];
  classes: any[];
  classFraisList: any[];
  students: any[];
  invoices: any[];
  printMode: 'global' | 'by_category' | 'by_class';
  selectedCategoryId?: string;
  selectedClassId?: string;
  onClose: () => void;
}

export const FraisAnnexesPrintPreview: React.FC<FraisAnnexesPrintPreviewProps> = ({
  schoolInfo,
  fraisList = [],
  classes = [],
  classFraisList = [],
  students = [],
  invoices = [],
  printMode = 'global',
  selectedCategoryId,
  selectedClassId,
  onClose,
}) => {
  const [pageOrientation, setPageOrientation] = React.useState<'landscape' | 'portrait'>(
    printMode === 'by_category' ? 'portrait' : 'landscape'
  );

  useEffect(() => {
    // Fermeture par la touche Échap
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    const timer = setTimeout(() => {
      window.print();
    }, 500);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const formatNum = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount || 0);
  };

  const sortedFrais = [...fraisList].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

  const getFeeForClass = (classId: string, fraisId: string, defaultAmount: number) => {
    const override = classFraisList.find((cf) => cf.class_id === classId && cf.frais_annexe_id === fraisId);
    if (override) {
      return override.is_active ? override.amount : 0;
    }
    return defaultAmount;
  };

  const matchesFraisMotif = (invoiceMotif: string, fraisName: string) => {
    const inv = (invoiceMotif || '').toLowerCase().trim();
    const tgt = (fraisName || '').toLowerCase().trim();
    if (!inv || !tgt) return false;
    if (inv.includes(tgt) || tgt.includes(inv)) return true;
    const roots = ['bulletin', 'tricot', 'polo', 'macaron', 'badge', 'assurance', 'inscription', 'entretien', 'relev', 'examen', 'compo', 'ceremonie'];
    for (const r of roots) {
      if (inv.includes(r) && tgt.includes(r)) return true;
    }
    return false;
  };

  const getCollectedForClass = (classId: string, motifName?: string) => {
    const classStudentIds = students.filter((s) => s.class_id === classId).map((s) => s.id);
    if (classStudentIds.length === 0) return 0;

    return invoices
      .filter((inv) => {
        if (!classStudentIds.includes(inv.student_id)) return false;
        if (motifName) {
          return matchesFraisMotif(inv.motif, motifName);
        }
        return sortedFrais
          .filter((f) => getFeeForClass(classId, f.id, f.amount) > 0)
          .some((f) => matchesFraisMotif(inv.motif, f.name));
      })
      .reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
  };

  const selectedCategoryObj = sortedFrais.find((f) => f.id === selectedCategoryId);
  const selectedClassObj = classes.find((c) => c.id === selectedClassId);

  // Student specific calculations for 'by_class' mode
  const classStudents = selectedClassObj
    ? students.filter((s) => s.class_id === selectedClassObj.id).sort((a, b) => (a.last_name || '').localeCompare(b.last_name || ''))
    : [];

  const getStudentFeePaid = (studentId: string, motifName: string) => {
    return invoices
      .filter((inv) => inv.student_id === studentId && matchesFraisMotif(inv.motif, motifName))
      .reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
  };

  const modalContent = (
    <div
      id="frais-annexes-print-modal"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        background: '#ffffff',
        zIndex: 9999999, // Supérieur à toute la barre supérieure et aux boutons flottants
        overflowY: 'auto',
        padding: '20px',
        color: '#0f172a',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <style>{`
        @page {
          size: ${pageOrientation};
          margin: 6mm 8mm;
        }

        @media print {
          html, body {
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          body * {
            visibility: hidden !important;
          }
          #frais-annexes-print-modal, #frais-annexes-print-modal * {
            visibility: visible !important;
          }
          #frais-annexes-print-modal {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            padding: 0 !important;
            margin: 0 !important;
            background: #ffffff !important;
            overflow: visible !important;
            box-shadow: none !important;
          }
          .print-document-container {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          table {
            width: 100% !important;
            max-width: 100% !important;
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          thead {
            display: table-header-group;
          }
          tfoot {
            display: table-footer-group;
          }
          th, td {
            padding: 5px 4px !important;
            font-size: 10px !important;
          }
        }
      `}</style>

      {/* Action Bar (Thème Clair Blanc & Bleu, aucun noir) */}
      <div
        className="no-print"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#ffffff',
          color: '#1e293b',
          padding: '14px 20px',
          borderRadius: '10px',
          marginBottom: '20px',
          border: '1px solid #bfdbfe',
          boxShadow: '0 4px 14px rgba(37, 99, 235, 0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.4rem' }}>🖨️</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1e3a8a' }}>
              Aperçu avant impression : Frais Annexes
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Format actif : <strong>{pageOrientation === 'landscape' ? '🖼️ Paysage A4 (Recommandé - Évite la superposition)' : '📄 Portrait A4'}</strong>
            </div>
          </div>
        </div>

        {/* Boutons de sélection du Format / Orientation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>Format :</span>
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
            <button
              type="button"
              onClick={() => setPageOrientation('landscape')}
              style={{
                padding: '6px 14px',
                fontSize: '0.82rem',
                fontWeight: 700,
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                background: pageOrientation === 'landscape' ? '#2563eb' : 'transparent',
                color: pageOrientation === 'landscape' ? '#ffffff' : '#475569',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s',
                boxShadow: pageOrientation === 'landscape' ? '0 2px 4px rgba(37, 99, 235, 0.25)' : 'none'
              }}
            >
              <span>🖼️</span> Paysage (Recommandé)
            </button>
            <button
              type="button"
              onClick={() => setPageOrientation('portrait')}
              style={{
                padding: '6px 14px',
                fontSize: '0.82rem',
                fontWeight: 700,
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                background: pageOrientation === 'portrait' ? '#2563eb' : 'transparent',
                color: pageOrientation === 'portrait' ? '#ffffff' : '#475569',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s',
                boxShadow: pageOrientation === 'portrait' ? '0 2px 4px rgba(37, 99, 235, 0.25)' : 'none'
              }}
            >
              <span>📄</span> Portrait
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => window.print()}
            style={{
              padding: '9px 18px',
              fontWeight: 700,
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.3)'
            }}
          >
            <span>🖨️</span> Imprimer en {pageOrientation === 'landscape' ? 'Paysage' : 'Portrait'}
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '9px 18px',
              fontWeight: 700,
              background: '#f1f5f9',
              color: '#334155',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>✕</span> Fermer
          </button>
        </div>
      </div>

      {/* Official Document Container */}
      <div 
        className="print-document-container"
        style={{ 
          maxWidth: pageOrientation === 'landscape' ? '1400px' : '960px', 
          width: '100%',
          margin: '0 auto', 
          background: '#ffffff',
          borderRadius: '8px',
          padding: '28px 36px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          boxSizing: 'border-box',
          overflowX: 'auto'
        }}
      >
        {/* Header with School Details */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '2px solid #0f172a',
            paddingBottom: '14px',
            marginBottom: '18px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {schoolInfo?.logo_url ? (
              <img
                src={schoolInfo.logo_url}
                alt="Logo"
                style={{ width: '68px', height: '68px', objectFit: 'contain' }}
              />
            ) : (
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '8px',
                  background: '#0f172a',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.6rem',
                  fontWeight: 'bold',
                }}
              >
                🏫
              </div>
            )}
            <div>
              <h2 style={{ margin: '0 0 4px 0', fontSize: '1.35rem', fontWeight: 800, textTransform: 'uppercase', color: '#0f172a' }}>
                {schoolInfo?.name || 'ÉTABLISSEMENT SCOLAIRE'}
              </h2>
              <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                {schoolInfo?.address && <span>{schoolInfo.address} • </span>}
                {schoolInfo?.phone && <span>Tél: {schoolInfo.phone} • </span>}
                {schoolInfo?.email && <span>Email: {schoolInfo.email}</span>}
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right', fontSize: '0.82rem', color: '#475569' }}>
            <div style={{ fontWeight: 700, textTransform: 'uppercase', color: '#0f172a' }}>
              RÉPUBLIQUE DE CÔTE D'IVOIRE
            </div>
            <div>Ministère de l'Éducation Nationale</div>
            <div style={{ marginTop: '4px', fontStyle: 'italic' }}>
              Date: {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Title according to printMode */}
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <h3
            style={{
              margin: '0 0 6px 0',
              fontSize: '1.25rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: '#0f172a',
            }}
          >
            {printMode === 'global' && "BILAN FINANCIER GLOBAL DES FRAIS ANNEXES"}
            {printMode === 'by_category' && `ÉTAT DE RECOUVREMENT : ${(selectedCategoryObj?.name || 'FRAIS ANNEXE').toUpperCase()}`}
            {printMode === 'by_class' && `FICHE NOMINATIVE DES FRAIS ANNEXES — CLASSE DE ${(selectedClassObj?.name || '').toUpperCase()}`}
          </h3>
          <div style={{ fontSize: '0.86rem', color: '#64748b' }}>
            {printMode === 'global' && "Récapitulatif par classe et par catégorie (attendu, encaissé et reste à percevoir)"}
            {printMode === 'by_category' && `Suivi spécifique pour toutes les classes de l'établissement`}
            {printMode === 'by_class' && `Effectif : ${classStudents.length} élèves • Année Scolaire en cours`}
          </div>
        </div>

        {/* 1. MODE: GLOBAL REPORT */}
        {printMode === 'global' && (
          <div>
            <table
              style={{
                width: '100%',
                minWidth: pageOrientation === 'landscape' ? '1200px' : '100%',
                borderCollapse: 'collapse',
                fontSize: '0.82rem',
                border: '1px solid #cbd5e1',
              }}
            >
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #94a3b8' }}>
                  <th style={{ padding: '8px 8px', border: '1px solid #cbd5e1', textAlign: 'left', minWidth: '160px', fontSize: '0.78rem' }}>Classe</th>
                  <th style={{ padding: '8px 4px', border: '1px solid #cbd5e1', textAlign: 'center', minWidth: '45px', fontSize: '0.78rem' }}>Eff.</th>
                  {sortedFrais.map((f) => (
                    <th key={f.id} style={{ padding: '8px 6px', border: '1px solid #cbd5e1', textAlign: 'right', minWidth: '70px', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                      {f.name}
                    </th>
                  ))}
                  <th style={{ padding: '8px 6px', border: '1px solid #cbd5e1', textAlign: 'right', background: '#e2e8f0', minWidth: '85px', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                    Forfait/Él.
                  </th>
                  <th style={{ padding: '8px 6px', border: '1px solid #cbd5e1', textAlign: 'right', background: '#dbeafe', minWidth: '92px', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                    Total Annexe
                  </th>
                  <th style={{ padding: '8px 6px', border: '1px solid #cbd5e1', textAlign: 'right', background: '#d1fae5', minWidth: '92px', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                    Encaissé
                  </th>
                  <th style={{ padding: '8px 6px', border: '1px solid #cbd5e1', textAlign: 'right', background: '#fee2e2', minWidth: '80px', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                    Reste
                  </th>
                  <th style={{ padding: '8px 4px', border: '1px solid #cbd5e1', textAlign: 'center', minWidth: '50px', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>Taux</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((cls) => {
                  const classStudentsCount = students.filter((s) => s.class_id === cls.id).length;
                  const categories = sortedFrais.map((frais) => {
                    const unit = getFeeForClass(cls.id, frais.id, frais.amount);
                    return { fraisId: frais.id, unit, total: unit * classStudentsCount };
                  });
                  const forfaitEleve = categories.reduce((sum, c) => sum + c.unit, 0);
                  const totalAttendu = forfaitEleve * classStudentsCount;
                  const totalEncaisse = getCollectedForClass(cls.id);
                  const reste = Math.max(0, totalAttendu - totalEncaisse);
                  const taux = totalAttendu > 0 ? Math.round((totalEncaisse / totalAttendu) * 100) : 0;

                  return (
                    <tr key={cls.id} style={{ borderBottom: '1px solid #cbd5e1' }}>
                      <td style={{ padding: '7px 8px', border: '1px solid #cbd5e1', fontWeight: 700, minWidth: '160px', lineHeight: 1.4 }}>
                        <div style={{ color: '#0f172a', fontSize: '0.86rem' }}>{cls.name}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>({cls.level})</div>
                      </td>
                      <td style={{ padding: '7px 4px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 600 }}>
                        {classStudentsCount}
                      </td>
                      {categories.map((c) => (
                        <td key={c.fraisId} style={{ padding: '7px 6px', border: '1px solid #cbd5e1', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          {c.unit === 0 ? '—' : `${formatNum(c.unit)} F`}
                        </td>
                      ))}
                      <td style={{ padding: '7px 6px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 700, background: '#f8fafc', whiteSpace: 'nowrap' }}>
                        {formatNum(forfaitEleve)} F
                      </td>
                      <td style={{ padding: '7px 6px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 700, background: '#eff6ff', whiteSpace: 'nowrap' }}>
                        {formatNum(totalAttendu)} F
                      </td>
                      <td style={{ padding: '7px 6px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 700, background: '#f0fdf4', color: '#047857', whiteSpace: 'nowrap' }}>
                        {formatNum(totalEncaisse)} F
                      </td>
                      <td style={{ padding: '7px 6px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 700, background: '#fef2f2', color: '#b91c1c', whiteSpace: 'nowrap' }}>
                        {formatNum(reste)} F
                      </td>
                      <td style={{ padding: '7px 4px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 700 }}>
                        {taux}%
                      </td>
                    </tr>
                  );
                })}

                {/* Grand Total Row */}
                {(() => {
                  let totalAttenduAll = 0;
                  let totalEncaisseAll = 0;
                  classes.forEach((cls) => {
                    const cnt = students.filter((s) => s.class_id === cls.id).length;
                    const forfait = sortedFrais.reduce((sum, f) => sum + getFeeForClass(cls.id, f.id, f.amount), 0);
                    totalAttenduAll += forfait * cnt;
                    totalEncaisseAll += getCollectedForClass(cls.id);
                  });
                  const resteAll = Math.max(0, totalAttenduAll - totalEncaisseAll);
                  const tauxAll = totalAttenduAll > 0 ? Math.round((totalEncaisseAll / totalAttenduAll) * 100) : 0;

                  return (
                    <tr style={{ background: '#f1f5f9', borderTop: '2px solid #0f172a', fontWeight: 800 }}>
                      <td style={{ padding: '8px 8px', border: '1px solid #cbd5e1' }}>TOTAL ÉCOLE</td>
                      <td style={{ padding: '8px 4px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                        {students.length}
                      </td>
                      {sortedFrais.map((f) => {
                        const sumFrais = classes.reduce((acc, cls) => {
                          const cnt = students.filter((s) => s.class_id === cls.id).length;
                          return acc + getFeeForClass(cls.id, f.id, f.amount) * cnt;
                        }, 0);
                        return (
                          <td key={f.id} style={{ padding: '8px 6px', border: '1px solid #cbd5e1', textAlign: 'right', whiteSpace: 'nowrap' }}>
                            {formatNum(sumFrais)} F
                          </td>
                        );
                      })}
                      <td style={{ padding: '8px 6px', border: '1px solid #cbd5e1', textAlign: 'right' }}>—</td>
                      <td style={{ padding: '8px 6px', border: '1px solid #cbd5e1', textAlign: 'right', background: '#dbeafe', whiteSpace: 'nowrap' }}>
                        {formatNum(totalAttenduAll)} F
                      </td>
                      <td style={{ padding: '8px 6px', border: '1px solid #cbd5e1', textAlign: 'right', background: '#d1fae5', color: '#065f46', whiteSpace: 'nowrap' }}>
                        {formatNum(totalEncaisseAll)} F
                      </td>
                      <td style={{ padding: '8px 6px', border: '1px solid #cbd5e1', textAlign: 'right', background: '#fee2e2', color: '#991b1b', whiteSpace: 'nowrap' }}>
                        {formatNum(resteAll)} F
                      </td>
                      <td style={{ padding: '8px 4px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                        {tauxAll}%
                      </td>
                    </tr>
                  );
                })()}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. MODE: BY CATEGORY REPORT */}
        {printMode === 'by_category' && selectedCategoryObj && (
          <div>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.88rem',
                border: '1px solid #cbd5e1',
              }}
            >
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #94a3b8' }}>
                  <th style={{ padding: '10px 12px', border: '1px solid #cbd5e1', textAlign: 'left' }}>Classe</th>
                  <th style={{ padding: '10px 12px', border: '1px solid #cbd5e1', textAlign: 'center' }}>Effectif</th>
                  <th style={{ padding: '10px 12px', border: '1px solid #cbd5e1', textAlign: 'right' }}>
                    Tarif Unitaire
                  </th>
                  <th style={{ padding: '10px 12px', border: '1px solid #cbd5e1', textAlign: 'right', background: '#eff6ff' }}>
                    Montant Attendu
                  </th>
                  <th style={{ padding: '10px 12px', border: '1px solid #cbd5e1', textAlign: 'right', background: '#ecfdf5' }}>
                    Montant Encaissé
                  </th>
                  <th style={{ padding: '10px 12px', border: '1px solid #cbd5e1', textAlign: 'right', background: '#fef2f2' }}>
                    Reste à Recouvrer
                  </th>
                  <th style={{ padding: '10px 12px', border: '1px solid #cbd5e1', textAlign: 'center' }}>Taux</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((cls) => {
                  const cnt = students.filter((s) => s.class_id === cls.id).length;
                  const unitPrice = getFeeForClass(cls.id, selectedCategoryObj.id, selectedCategoryObj.amount);
                  const totalAttendu = unitPrice * cnt;
                  const totalEncaisse = getCollectedForClass(cls.id, selectedCategoryObj.name);
                  const reste = Math.max(0, totalAttendu - totalEncaisse);
                  const taux = totalAttendu > 0 ? Math.round((totalEncaisse / totalAttendu) * 100) : 0;

                  return (
                    <tr key={cls.id} style={{ borderBottom: '1px solid #cbd5e1' }}>
                      <td style={{ padding: '10px 12px', border: '1px solid #cbd5e1', fontWeight: 700 }}>
                        {cls.name} <span style={{ fontSize: '0.75rem', color: '#64748b' }}>({cls.level})</span>
                      </td>
                      <td style={{ padding: '10px 12px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                        {cnt} élèves
                      </td>
                      <td style={{ padding: '10px 12px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 600 }}>
                        {unitPrice === 0 ? 'Exempté' : `${formatNum(unitPrice)} F CFA`}
                      </td>
                      <td style={{ padding: '10px 12px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 700, background: '#eff6ff' }}>
                        {formatNum(totalAttendu)} F CFA
                      </td>
                      <td style={{ padding: '10px 12px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 700, color: '#047857', background: '#ecfdf5' }}>
                        {formatNum(totalEncaisse)} F CFA
                      </td>
                      <td style={{ padding: '10px 12px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 700, color: '#b91c1c', background: '#fef2f2' }}>
                        {formatNum(reste)} F CFA
                      </td>
                      <td style={{ padding: '10px 12px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 700 }}>
                        {taux}%
                      </td>
                    </tr>
                  );
                })}

                {/* Total Row */}
                {(() => {
                  let grandAttendu = 0;
                  let grandEncaisse = 0;
                  classes.forEach((cls) => {
                    const cnt = students.filter((s) => s.class_id === cls.id).length;
                    const unit = getFeeForClass(cls.id, selectedCategoryObj.id, selectedCategoryObj.amount);
                    grandAttendu += unit * cnt;
                    grandEncaisse += getCollectedForClass(cls.id, selectedCategoryObj.name);
                  });
                  const grandReste = Math.max(0, grandAttendu - grandEncaisse);
                  const grandTaux = grandAttendu > 0 ? Math.round((grandEncaisse / grandAttendu) * 100) : 0;

                  return (
                    <tr style={{ background: '#f1f5f9', borderTop: '2px solid #0f172a', fontWeight: 800 }}>
                      <td style={{ padding: '12px', border: '1px solid #cbd5e1' }}>TOTAL GÉNÉRAL</td>
                      <td style={{ padding: '12px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                        {students.length} élèves
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #cbd5e1', textAlign: 'right' }}>—</td>
                      <td style={{ padding: '12px', border: '1px solid #cbd5e1', textAlign: 'right', background: '#dbeafe' }}>
                        {formatNum(grandAttendu)} F CFA
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #cbd5e1', textAlign: 'right', color: '#065f46', background: '#d1fae5' }}>
                        {formatNum(grandEncaisse)} F CFA
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #cbd5e1', textAlign: 'right', color: '#991b1b', background: '#fee2e2' }}>
                        {formatNum(grandReste)} F CFA
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                        {grandTaux}%
                      </td>
                    </tr>
                  );
                })()}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. MODE: BY CLASS NOMINATIVE REPORT */}
        {printMode === 'by_class' && selectedClassObj && (() => {
          const classForfaitPerStudent = sortedFrais.reduce((sum, f) => sum + getFeeForClass(selectedClassObj.id, f.id, f.amount), 0);
          const classTotalAttendu = classForfaitPerStudent * classStudents.length;
          const classTotalPaid = classStudents.reduce((sum, st) => {
            return sum + sortedFrais
              .filter((f) => getFeeForClass(selectedClassObj.id, f.id, f.amount) > 0)
              .reduce((fsum, f) => fsum + getStudentFeePaid(st.id, f.name), 0);
          }, 0);
          const classTotalReste = Math.max(0, classTotalAttendu - classTotalPaid);

          return (
            <div>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.78rem',
                  border: '1px solid #cbd5e1',
                }}
              >
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #94a3b8' }}>
                    <th style={{ padding: '6px 4px', border: '1px solid #cbd5e1', width: '35px', textAlign: 'center', fontSize: '0.74rem' }}>N°</th>
                    <th style={{ padding: '6px 6px', border: '1px solid #cbd5e1', textAlign: 'left', fontSize: '0.74rem' }}>Matricule</th>
                    <th style={{ padding: '6px 6px', border: '1px solid #cbd5e1', textAlign: 'left', fontSize: '0.74rem' }}>Nom & Prénoms</th>
                    {sortedFrais.map((f) => {
                      const price = getFeeForClass(selectedClassObj.id, f.id, f.amount);
                      return (
                        <th key={f.id} style={{ padding: '6px 4px', border: '1px solid #cbd5e1', textAlign: 'right', fontSize: '0.73rem' }}>
                          {f.name}
                          <br />
                          <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 'normal' }}>
                            ({formatNum(price)} F)
                          </span>
                        </th>
                      );
                    })}
                    <th style={{ padding: '6px 4px', border: '1px solid #cbd5e1', textAlign: 'right', background: '#eff6ff', fontSize: '0.74rem' }}>
                      Total Versé
                    </th>
                    <th style={{ padding: '6px 4px', border: '1px solid #cbd5e1', textAlign: 'right', background: '#fef2f2', fontSize: '0.74rem' }}>
                      Reste Dû
                    </th>
                    <th style={{ padding: '6px 4px', border: '1px solid #cbd5e1', textAlign: 'center', fontSize: '0.74rem', width: '55px' }}>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {classStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6 + sortedFrais.length} style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                        Aucun élève enregistré dans cette classe.
                      </td>
                    </tr>
                  ) : (
                    classStudents.map((st, idx) => {
                      const feesState = sortedFrais.map((f) => {
                        const required = getFeeForClass(selectedClassObj.id, f.id, f.amount);
                        const paid = getStudentFeePaid(st.id, f.name);
                        return { fraisId: f.id, required, paid };
                      });

                      const totalRequired = feesState.reduce((sum, fs) => sum + fs.required, 0);
                      const totalPaid = feesState
                        .filter((fs) => fs.required > 0)
                        .reduce((sum, fs) => sum + fs.paid, 0);
                      const reste = Math.max(0, totalRequired - totalPaid);
                      const isSolde = reste <= 0;

                      return (
                        <tr key={st.id} style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ padding: '5px 4px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                            {idx + 1}
                          </td>
                          <td style={{ padding: '5px 6px', border: '1px solid #cbd5e1', fontFamily: 'monospace', fontSize: '0.74rem' }}>
                            {st.matricule}
                          </td>
                          <td style={{ padding: '5px 6px', border: '1px solid #cbd5e1', fontWeight: 600 }}>
                            {st.first_name} {st.last_name}
                          </td>

                          {/* Résultat financier pour chaque frais de l'élève */}
                          {feesState.map((fs) => (
                            <td key={fs.fraisId} style={{ padding: '5px 4px', border: '1px solid #cbd5e1', textAlign: 'right', whiteSpace: 'nowrap' }}>
                              {fs.required === 0 ? (
                                <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>—</span>
                              ) : fs.paid >= fs.required ? (
                                <span style={{ color: '#047857', fontWeight: 700 }}>{formatNum(fs.paid)} F</span>
                              ) : fs.paid > 0 ? (
                                <span style={{ color: '#d97706', fontWeight: 700 }}>{formatNum(fs.paid)} F</span>
                              ) : (
                                <span style={{ color: '#dc2626', fontWeight: 600, fontSize: '0.75rem' }}>0 F</span>
                              )}
                            </td>
                          ))}

                          <td style={{ padding: '5px 4px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 700, background: '#eff6ff', color: '#1d4ed8', whiteSpace: 'nowrap' }}>
                            {formatNum(totalPaid)} F
                          </td>
                          <td style={{ padding: '5px 4px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 700, background: '#fef2f2', color: '#dc2626', whiteSpace: 'nowrap' }}>
                            {formatNum(reste)} F
                          </td>
                          <td style={{ padding: '5px 4px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                            {isSolde ? (
                              <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 6px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 700 }}>
                                SOLDÉ
                              </span>
                            ) : (
                              <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '2px 6px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 700 }}>
                                EN COURS
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                <tfoot>
                  <tr style={{ background: '#f8fafc', borderTop: '2px solid #94a3b8', fontWeight: 800 }}>
                    <td colSpan={3} style={{ padding: '6px 6px', border: '1px solid #cbd5e1', textAlign: 'right', textTransform: 'uppercase', color: '#0f172a' }}>
                      TOTAL CLASSE ({classStudents.length} élèves) :
                    </td>
                    {sortedFrais.map((f) => {
                      const colTotal = classStudents.reduce((sum, st) => sum + getStudentFeePaid(st.id, f.name), 0);
                      return (
                        <td key={f.id} style={{ padding: '6px 4px', border: '1px solid #cbd5e1', textAlign: 'right', color: '#047857', whiteSpace: 'nowrap' }}>
                          {formatNum(colTotal)} F
                        </td>
                      );
                    })}
                    <td style={{ padding: '6px 4px', border: '1px solid #cbd5e1', textAlign: 'right', background: '#dbeafe', color: '#1e40af', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                      {formatNum(classTotalPaid)} F
                    </td>
                    <td style={{ padding: '6px 4px', border: '1px solid #cbd5e1', textAlign: 'right', background: '#fee2e2', color: '#991b1b', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                      {formatNum(classTotalReste)} F
                    </td>
                    <td style={{ padding: '6px 4px', border: '1px solid #cbd5e1', textAlign: 'center', color: '#047857' }}>
                      {classTotalAttendu > 0 ? Math.min(100, Math.round((classTotalPaid / classTotalAttendu) * 100)) : 0}%
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          );
        })()}

        {/* Footer Signatures */}
        <div
          style={{
            marginTop: '36px',
            display: 'flex',
            justifyContent: 'space-between',
            paddingTop: '20px',
            borderTop: '1px solid #cbd5e1',
          }}
        >
          <div style={{ textAlign: 'center', width: '220px' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '55px' }}>
              Le Chef Comptable
            </div>
            <div style={{ borderTop: '1px dashed #64748b', paddingTop: '4px', fontSize: '0.75rem', color: '#64748b' }}>
              Signature & Visa
            </div>
          </div>

          <div style={{ textAlign: 'center', width: '220px' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '55px' }}>
              Le Chef d'Établissement
            </div>
            <div style={{ borderTop: '1px dashed #64748b', paddingTop: '4px', fontSize: '0.75rem', color: '#64748b' }}>
              Signature & Cachet Officiel
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
