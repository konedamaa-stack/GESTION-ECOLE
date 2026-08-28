import React, { useEffect } from 'react';

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
  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
    }, 400);
    return () => clearTimeout(timer);
  }, []);

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

  const getCollectedForClass = (classId: string, motifName?: string) => {
    const classStudentIds = students.filter((s) => s.class_id === classId).map((s) => s.id);
    if (classStudentIds.length === 0) return 0;

    return invoices
      .filter((inv) => {
        if (!classStudentIds.includes(inv.student_id)) return false;
        if (motifName) {
          return (inv.motif || '').toLowerCase().includes(motifName.toLowerCase());
        }
        return sortedFrais.some((f) => (inv.motif || '').toLowerCase().includes(f.name.toLowerCase()));
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
      .filter((inv) => inv.student_id === studentId && (inv.motif || '').toLowerCase().includes(motifName.toLowerCase()))
      .reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'white',
        zIndex: 99999,
        overflowY: 'auto',
        padding: '24px',
        color: '#0f172a',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Action Bar (hidden on print) */}
      <div
        className="no-print"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#f8fafc',
          padding: '12px 20px',
          borderRadius: '8px',
          marginBottom: '24px',
          border: '1px solid #e2e8f0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.2rem' }}>🖨️</span>
          <strong>Aperçu avant impression : Frais Annexes</strong>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => window.print()}
            style={{ padding: '8px 16px', fontWeight: 600 }}
          >
            Imprimer / Enregistrer en PDF
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={onClose}
            style={{ padding: '8px 16px' }}
          >
            Fermer
          </button>
        </div>
      </div>

      {/* Official Document Container */}
      <div style={{ maxWidth: '1050px', margin: '0 auto', background: 'white' }}>
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
                borderCollapse: 'collapse',
                fontSize: '0.84rem',
                border: '1px solid #cbd5e1',
              }}
            >
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #94a3b8' }}>
                  <th style={{ padding: '10px', border: '1px solid #cbd5e1', textAlign: 'left' }}>Classe</th>
                  <th style={{ padding: '10px', border: '1px solid #cbd5e1', textAlign: 'center' }}>Eff.</th>
                  {sortedFrais.map((f) => (
                    <th key={f.id} style={{ padding: '10px', border: '1px solid #cbd5e1', textAlign: 'right' }}>
                      {f.name}
                    </th>
                  ))}
                  <th style={{ padding: '10px', border: '1px solid #cbd5e1', textAlign: 'right', background: '#e2e8f0' }}>
                    Forfait/Él.
                  </th>
                  <th style={{ padding: '10px', border: '1px solid #cbd5e1', textAlign: 'right', background: '#dbeafe' }}>
                    Attendu
                  </th>
                  <th style={{ padding: '10px', border: '1px solid #cbd5e1', textAlign: 'right', background: '#d1fae5' }}>
                    Encaissé
                  </th>
                  <th style={{ padding: '10px', border: '1px solid #cbd5e1', textAlign: 'right', background: '#fee2e2' }}>
                    Reste
                  </th>
                  <th style={{ padding: '10px', border: '1px solid #cbd5e1', textAlign: 'center' }}>Taux</th>
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
                      <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', fontWeight: 700 }}>
                        {cls.name} <span style={{ fontSize: '0.72rem', color: '#64748b' }}>({cls.level})</span>
                      </td>
                      <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                        {classStudentsCount}
                      </td>
                      {categories.map((c) => (
                        <td key={c.fraisId} style={{ padding: '8px 10px', border: '1px solid #cbd5e1', textAlign: 'right' }}>
                          {c.unit === 0 ? '—' : `${formatNum(c.unit)} F`}
                        </td>
                      ))}
                      <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 700, background: '#f8fafc' }}>
                        {formatNum(forfaitEleve)} F
                      </td>
                      <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 700, background: '#eff6ff' }}>
                        {formatNum(totalAttendu)} F
                      </td>
                      <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 700, background: '#f0fdf4', color: '#047857' }}>
                        {formatNum(totalEncaisse)} F
                      </td>
                      <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 700, background: '#fef2f2', color: '#b91c1c' }}>
                        {formatNum(reste)} F
                      </td>
                      <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 700 }}>
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
                      <td style={{ padding: '10px', border: '1px solid #cbd5e1' }}>TOTAL ÉCOLE</td>
                      <td style={{ padding: '10px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                        {students.length}
                      </td>
                      {sortedFrais.map((f) => {
                        const sumFrais = classes.reduce((acc, cls) => {
                          const cnt = students.filter((s) => s.class_id === cls.id).length;
                          return acc + getFeeForClass(cls.id, f.id, f.amount) * cnt;
                        }, 0);
                        return (
                          <td key={f.id} style={{ padding: '10px', border: '1px solid #cbd5e1', textAlign: 'right' }}>
                            {formatNum(sumFrais)} F
                          </td>
                        );
                      })}
                      <td style={{ padding: '10px', border: '1px solid #cbd5e1', textAlign: 'right' }}>—</td>
                      <td style={{ padding: '10px', border: '1px solid #cbd5e1', textAlign: 'right', background: '#dbeafe' }}>
                        {formatNum(totalAttenduAll)} F
                      </td>
                      <td style={{ padding: '10px', border: '1px solid #cbd5e1', textAlign: 'right', background: '#d1fae5', color: '#065f46' }}>
                        {formatNum(totalEncaisseAll)} F
                      </td>
                      <td style={{ padding: '10px', border: '1px solid #cbd5e1', textAlign: 'right', background: '#fee2e2', color: '#991b1b' }}>
                        {formatNum(resteAll)} F
                      </td>
                      <td style={{ padding: '10px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
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
        {printMode === 'by_class' && selectedClassObj && (
          <div>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.84rem',
                border: '1px solid #cbd5e1',
              }}
            >
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #94a3b8' }}>
                  <th style={{ padding: '10px', border: '1px solid #cbd5e1', width: '40px', textAlign: 'center' }}>N°</th>
                  <th style={{ padding: '10px', border: '1px solid #cbd5e1', textAlign: 'left' }}>Matricule</th>
                  <th style={{ padding: '10px', border: '1px solid #cbd5e1', textAlign: 'left' }}>Nom & Prénoms</th>
                  {sortedFrais.map((f) => {
                    const price = getFeeForClass(selectedClassObj.id, f.id, f.amount);
                    return (
                      <th key={f.id} style={{ padding: '10px', border: '1px solid #cbd5e1', textAlign: 'right' }}>
                        {f.name}
                        <br />
                        <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 'normal' }}>
                          ({formatNum(price)} F)
                        </span>
                      </th>
                    );
                  })}
                  <th style={{ padding: '10px', border: '1px solid #cbd5e1', textAlign: 'right', background: '#eff6ff' }}>
                    Total Versé
                  </th>
                  <th style={{ padding: '10px', border: '1px solid #cbd5e1', textAlign: 'right', background: '#fef2f2' }}>
                    Reste Dû
                  </th>
                  <th style={{ padding: '10px', border: '1px solid #cbd5e1', textAlign: 'center' }}>Statut</th>
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
                    const totalPaid = feesState.reduce((sum, fs) => sum + fs.paid, 0);
                    const reste = Math.max(0, totalRequired - totalPaid);
                    const isSolde = reste <= 0;

                    return (
                      <tr key={st.id} style={{ borderBottom: '1px solid #cbd5e1' }}>
                        <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                          {idx + 1}
                        </td>
                        <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', fontFamily: 'monospace' }}>
                          {st.matricule}
                        </td>
                        <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', fontWeight: 600 }}>
                          {st.first_name} {st.last_name}
                        </td>

                        {/* Each Fee Status for this Student */}
                        {feesState.map((fs) => (
                          <td key={fs.fraisId} style={{ padding: '8px 10px', border: '1px solid #cbd5e1', textAlign: 'right' }}>
                            {fs.required === 0 ? (
                              <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Exempté</span>
                            ) : fs.paid >= fs.required ? (
                              <span style={{ color: '#047857', fontWeight: 700 }}>✅ Payé</span>
                            ) : fs.paid > 0 ? (
                              <span style={{ color: '#d97706', fontWeight: 600 }}>{formatNum(fs.paid)} F</span>
                            ) : (
                              <span style={{ color: '#dc2626', fontSize: '0.8rem' }}>Non payé</span>
                            )}
                          </td>
                        ))}

                        <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 700, background: '#eff6ff', color: '#1d4ed8' }}>
                          {formatNum(totalPaid)} F
                        </td>
                        <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 700, background: '#fef2f2', color: '#dc2626' }}>
                          {formatNum(reste)} F
                        </td>
                        <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                          {isSolde ? (
                            <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700 }}>
                              SOLDÉ
                            </span>
                          ) : (
                            <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700 }}>
                              EN COURS
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

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
};
