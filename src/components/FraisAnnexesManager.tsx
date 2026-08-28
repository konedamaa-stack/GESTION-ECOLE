import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export interface FraisAnnexe {
  id: string;
  school_id: string;
  name: string;
  amount: number;
  display_order: number;
  is_mandatory: boolean;
  description?: string;
  created_at?: string;
}

export interface ClassFraisAnnexe {
  id: string;
  school_id: string;
  class_id: string;
  frais_annexe_id: string;
  amount: number;
  is_active: boolean;
  created_at?: string;
}

interface FraisAnnexesManagerProps {
  schoolId: string;
  fraisList: FraisAnnexe[];
  classes: any[];
  classFraisList: ClassFraisAnnexe[];
  onRefresh: () => void;
}

export const FraisAnnexesManager: React.FC<FraisAnnexesManagerProps> = ({
  schoolId,
  fraisList,
  classes = [],
  classFraisList = [],
  onRefresh,
}) => {
  const [activeView, setActiveView] = useState<'global' | 'by_class' | 'matrix'>('global');
  const [selectedClassId, setSelectedClassId] = useState<string>(classes.length > 0 ? classes[0].id : '');

  // Modal State for Global Fees
  const [showModal, setShowModal] = useState(false);
  const [editingFrais, setEditingFrais] = useState<FraisAnnexe | null>(null);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [isMandatory, setIsMandatory] = useState(false);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Class-specific inputs state (frais_id -> { amount, is_active })
  const [classAmounts, setClassAmounts] = useState<Record<string, number>>({});
  const [classActives, setClassActives] = useState<Record<string, boolean>>({});

  // Sorted list by display_order
  const sortedFrais = [...fraisList].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

  // Initialize class amounts whenever selectedClassId changes
  React.useEffect(() => {
    if (!selectedClassId) return;
    const initialAmounts: Record<string, number> = {};
    const initialActives: Record<string, boolean> = {};

    sortedFrais.forEach((f) => {
      const override = classFraisList.find(
        (cf) => cf.class_id === selectedClassId && cf.frais_annexe_id === f.id
      );
      if (override) {
        initialAmounts[f.id] = override.amount;
        initialActives[f.id] = override.is_active;
      } else {
        initialAmounts[f.id] = f.amount;
        initialActives[f.id] = true;
      }
    });

    setClassAmounts(initialAmounts);
    setClassActives(initialActives);
  }, [selectedClassId, fraisList, classFraisList]);

  const openCreateModal = () => {
    setEditingFrais(null);
    setName('');
    setAmount('');
    setIsMandatory(false);
    setDescription('');
    setErrorMsg(null);
    setShowModal(true);
  };

  const openEditModal = (frais: FraisAnnexe) => {
    setEditingFrais(frais);
    setName(frais.name);
    setAmount(frais.amount);
    setIsMandatory(!!frais.is_mandatory);
    setDescription(frais.description || '');
    setErrorMsg(null);
    setShowModal(true);
  };

  const handleSaveGlobal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Le libellé du frais est obligatoire.");
      return;
    }
    if (!schoolId) {
      setErrorMsg("Établissement introuvable.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      if (editingFrais) {
        const { error } = await supabase
          .from('frais_annexes')
          .update({
            name: name.trim(),
            amount: Number(amount) || 0,
            is_mandatory: isMandatory,
            description: description.trim() || null,
          })
          .eq('id', editingFrais.id);

        if (error) throw error;
        setSuccessMsg("Frais annexe modifié avec succès !");
      } else {
        const nextOrder = sortedFrais.length > 0 ? Math.max(...sortedFrais.map(f => f.display_order || 0)) + 1 : 1;
        const { error } = await supabase
          .from('frais_annexes')
          .insert([
            {
              school_id: schoolId,
              name: name.trim(),
              amount: Number(amount) || 0,
              display_order: nextOrder,
              is_mandatory: isMandatory,
              description: description.trim() || null,
            },
          ]);

        if (error) throw error;
        setSuccessMsg("Frais annexe ajouté avec succès !");
      }

      setShowModal(false);
      onRefresh();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Erreur lors de l'enregistrement.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, fraisName: string) => {
    if (!window.confirm(`Supprimer définitivement le frais "${fraisName}" et tous ses tarifs associés ?`)) return;
    try {
      const { error } = await supabase.from('frais_annexes').delete().eq('id', id);
      if (error) throw error;
      onRefresh();
    } catch (err: any) {
      alert("Erreur: " + err.message);
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index <= 0) return;
    const current = sortedFrais[index];
    const prev = sortedFrais[index - 1];

    const tempOrder = current.display_order;
    current.display_order = prev.display_order;
    prev.display_order = tempOrder;

    try {
      await Promise.all([
        supabase.from('frais_annexes').update({ display_order: current.display_order }).eq('id', current.id),
        supabase.from('frais_annexes').update({ display_order: prev.display_order }).eq('id', prev.id),
      ]);
      onRefresh();
    } catch (err: any) {
      console.error("Erreur réordonnancement:", err);
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index >= sortedFrais.length - 1) return;
    const current = sortedFrais[index];
    const next = sortedFrais[index + 1];

    const tempOrder = current.display_order;
    current.display_order = next.display_order;
    next.display_order = tempOrder;

    try {
      await Promise.all([
        supabase.from('frais_annexes').update({ display_order: current.display_order }).eq('id', current.id),
        supabase.from('frais_annexes').update({ display_order: next.display_order }).eq('id', next.id),
      ]);
      onRefresh();
    } catch (err: any) {
      console.error("Erreur réordonnancement:", err);
    }
  };

  const handleInitDefaultPacks = async () => {
    if (!schoolId) return;
    setLoading(true);
    try {
      const defaultPacks = [
        { school_id: schoolId, name: "Frais de Bulletin", amount: 2000, display_order: 1, is_mandatory: true, description: "Impression et gestion des bulletins scolaires" },
        { school_id: schoolId, name: "Tricot / Polo d'école", amount: 5000, display_order: 2, is_mandatory: true, description: "Tenue et tricot officiel de l'établissement" },
        { school_id: schoolId, name: "Macaron & Badge scolaire", amount: 1500, display_order: 3, is_mandatory: false, description: "Badge d'accès et macaron de tenue" },
        { school_id: schoolId, name: "Assurance Scolaire", amount: 2500, display_order: 4, is_mandatory: true, description: "Assurance individuelle accident de l'élève" },
      ];

      const { error } = await supabase.from('frais_annexes').insert(defaultPacks);
      if (error) throw error;
      onRefresh();
    } catch (err: any) {
      alert("Erreur initialisation: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Save class specific prices
  const handleSaveClassPrices = async () => {
    if (!selectedClassId || !schoolId) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const upsertRows = sortedFrais.map((f) => ({
        school_id: schoolId,
        class_id: selectedClassId,
        frais_annexe_id: f.id,
        amount: Number(classAmounts[f.id] !== undefined ? classAmounts[f.id] : f.amount) || 0,
        is_active: classActives[f.id] !== undefined ? classActives[f.id] : true,
      }));

      const { error } = await supabase
        .from('class_frais_annexes')
        .upsert(upsertRows, { onConflict: 'class_id,frais_annexe_id' });

      if (error) throw error;
      setSuccessMsg("Tarifs de la classe enregistrés avec succès !");
      onRefresh();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Erreur lors de l'enregistrement des tarifs de la classe.");
    } finally {
      setLoading(false);
    }
  };

  // Copy class prices to all classes of same level
  const handleApplyToSameLevel = async () => {
    const targetClass = classes.find((c) => c.id === selectedClassId);
    if (!targetClass) return;

    const sameLevelClasses = classes.filter((c) => c.level === targetClass.level && c.id !== targetClass.id);
    if (sameLevelClasses.length === 0) {
      alert(`Aucune autre classe trouvée dans le niveau "${targetClass.level}".`);
      return;
    }

    if (!window.confirm(`Copier les tarifs de "${targetClass.name}" à toutes les ${sameLevelClasses.length} autres classes de niveau "${targetClass.level}" ?`)) {
      return;
    }

    setLoading(true);
    try {
      const allRows: any[] = [];
      sameLevelClasses.forEach((cls) => {
        sortedFrais.forEach((f) => {
          allRows.push({
            school_id: schoolId,
            class_id: cls.id,
            frais_annexe_id: f.id,
            amount: Number(classAmounts[f.id] !== undefined ? classAmounts[f.id] : f.amount) || 0,
            is_active: classActives[f.id] !== undefined ? classActives[f.id] : true,
          });
        });
      });

      const { error } = await supabase
        .from('class_frais_annexes')
        .upsert(allRows, { onConflict: 'class_id,frais_annexe_id' });

      if (error) throw error;
      setSuccessMsg(`Tarifs dupliqués avec succès sur ${sameLevelClasses.length} classes de ${targetClass.level} !`);
      onRefresh();
    } catch (err: any) {
      alert("Erreur: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatNum = (val: number) => new Intl.NumberFormat('fr-FR').format(val || 0);

  const selectedClassObj = classes.find((c) => c.id === selectedClassId);

  return (
    <div style={{ width: '100%' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '16px',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--border-color, #e2e8f0)',
        }}
      >
        <div>
          <h3
            style={{
              margin: '0 0 6px 0',
              fontSize: '1.3rem',
              fontWeight: 700,
              color: 'var(--text-color, #1e293b)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>💳</span> Frais Annexes de l'Établissement (Bulletins, Tricots...)
          </h3>
          <p
            style={{
              margin: 0,
              color: 'var(--text-secondary, #64748b)',
              fontSize: '0.88rem',
            }}
          >
            Définissez les frais généraux et personnalisez les tarifs pour chaque classe (ex: prix du bulletin ou tricot selon la classe).
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {sortedFrais.length === 0 && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleInitDefaultPacks}
              disabled={loading}
              style={{
                borderColor: '#10b981',
                color: '#059669',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              ⚡ Charger les modèles (Bulletin, Tricot...)
            </button>
          )}

          <button
            type="button"
            className="btn btn-primary"
            onClick={openCreateModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 600,
              padding: '8px 16px',
              borderRadius: '8px',
            }}
          >
            <span>➕</span> Nouveau Frais Annexe
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '20px',
          borderBottom: '1px solid var(--border-color, #e2e8f0)',
          paddingBottom: '2px',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveView('global')}
          style={{
            padding: '8px 16px',
            border: 'none',
            background: 'transparent',
            borderBottom: activeView === 'global' ? '3px solid #2563eb' : '3px solid transparent',
            color: activeView === 'global' ? '#2563eb' : '#64748b',
            fontWeight: activeView === 'global' ? 700 : 500,
            cursor: 'pointer',
            fontSize: '0.92rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>📋</span> Frais Globaux & Priorité
        </button>

        <button
          type="button"
          onClick={() => setActiveView('by_class')}
          style={{
            padding: '8px 16px',
            border: 'none',
            background: 'transparent',
            borderBottom: activeView === 'by_class' ? '3px solid #2563eb' : '3px solid transparent',
            color: activeView === 'by_class' ? '#2563eb' : '#64748b',
            fontWeight: activeView === 'by_class' ? 700 : 500,
            cursor: 'pointer',
            fontSize: '0.92rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>🏫</span> Tarifs Personnalisés par Classe
        </button>

        <button
          type="button"
          onClick={() => setActiveView('matrix')}
          style={{
            padding: '8px 16px',
            border: 'none',
            background: 'transparent',
            borderBottom: activeView === 'matrix' ? '3px solid #2563eb' : '3px solid transparent',
            color: activeView === 'matrix' ? '#2563eb' : '#64748b',
            fontWeight: activeView === 'matrix' ? 700 : 500,
            cursor: 'pointer',
            fontSize: '0.92rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>📊</span> Tableau Récapitulatif Global
        </button>
      </div>

      {successMsg && (
        <div
          style={{
            padding: '10px 14px',
            background: '#ecfdf5',
            color: '#065f46',
            borderRadius: '8px',
            marginBottom: '16px',
            border: '1px solid #a7f3d0',
            fontSize: '0.88rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>✅ {successMsg}</span>
          <button
            type="button"
            onClick={() => setSuccessMsg(null)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#065f46' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* VIEW 1: GLOBAL FEES LIST */}
      {activeView === 'global' && (
        <>
          {sortedFrais.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '36px 20px',
                background: 'var(--surface-color-hover, #f8fafc)',
                borderRadius: '12px',
                border: '2px dashed var(--border-color, #cbd5e1)',
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📋</div>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', color: '#1e293b' }}>
                Aucun frais annexe configuré
              </h4>
              <p style={{ color: '#64748b', fontSize: '0.88rem', maxWidth: '480px', margin: '0 auto 16px auto' }}>
                Configurez les frais annexes facturés à part (frais de bulletin, tricots, tenues, macarons, assurance...) pour les ordonner et les encaisser facilement.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleInitDefaultPacks}
                disabled={loading}
                style={{ padding: '8px 18px', borderRadius: '8px', fontWeight: 600 }}
              >
                ⚡ Charger le pack standard (Bulletin 2 000 F, Tricot 5 000 F...)
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto', background: 'var(--surface-color, #ffffff)', borderRadius: '10px', border: '1px solid var(--border-color, #e2e8f0)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--surface-color-hover, #f8fafc)', borderBottom: '1px solid var(--border-color, #e2e8f0)', color: 'var(--text-secondary, #64748b)', fontSize: '0.82rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px 14px', width: '80px', textAlign: 'center' }}>Ordre</th>
                    <th style={{ padding: '12px 14px' }}>Libellé du frais</th>
                    <th style={{ padding: '12px 14px' }}>Tarif standard par défaut</th>
                    <th style={{ padding: '12px 14px' }}>Obligation</th>
                    <th style={{ padding: '12px 14px' }}>Description</th>
                    <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedFrais.map((item, index) => (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom: '1px solid var(--border-color, #e2e8f0)',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <button
                            type="button"
                            onClick={() => handleMoveUp(index)}
                            disabled={index === 0}
                            title="Monter la priorité"
                            style={{
                              background: index === 0 ? 'transparent' : 'rgba(37, 99, 235, 0.08)',
                              border: '1px solid #cbd5e1',
                              borderRadius: '4px',
                              cursor: index === 0 ? 'default' : 'pointer',
                              padding: '2px 6px',
                              fontSize: '0.75rem',
                              color: index === 0 ? '#cbd5e1' : '#2563eb',
                            }}
                          >
                            ▲
                          </button>
                          <span style={{ fontWeight: 700, minWidth: '18px', fontSize: '0.85rem', color: '#1e293b' }}>
                            {index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleMoveDown(index)}
                            disabled={index === sortedFrais.length - 1}
                            title="Descendre la priorité"
                            style={{
                              background: index === sortedFrais.length - 1 ? 'transparent' : 'rgba(37, 99, 235, 0.08)',
                              border: '1px solid #cbd5e1',
                              borderRadius: '4px',
                              cursor: index === sortedFrais.length - 1 ? 'default' : 'pointer',
                              padding: '2px 6px',
                              fontSize: '0.75rem',
                              color: index === sortedFrais.length - 1 ? '#cbd5e1' : '#2563eb',
                            }}
                          >
                            ▼
                          </button>
                        </div>
                      </td>

                      <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--text-color, #1e293b)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>🏷️</span>
                          <span>{item.name}</span>
                        </div>
                      </td>

                      <td style={{ padding: '12px 14px', fontWeight: 700, color: '#2563eb' }}>
                        {formatNum(item.amount)} F CFA
                      </td>

                      <td style={{ padding: '12px 14px' }}>
                        {item.is_mandatory ? (
                          <span
                            style={{
                              background: '#fef2f2',
                              color: '#b91c1c',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              border: '1px solid #fecaca',
                            }}
                          >
                            Obligatoire
                          </span>
                        ) : (
                          <span
                            style={{
                              background: '#f1f5f9',
                              color: '#475569',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: 500,
                            }}
                          >
                            Optionnel
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '12px 14px', color: 'var(--text-secondary, #64748b)', fontSize: '0.85rem' }}>
                        {item.description || '—'}
                      </td>

                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            title="Modifier ce frais"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '1rem',
                              padding: '4px',
                            }}
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id, item.name)}
                            title="Supprimer ce frais"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '1rem',
                              padding: '4px',
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* VIEW 2: CLASS SPECIFIC PRICING */}
      {activeView === 'by_class' && (
        <div>
          {classes.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
              Veuillez d'abord créer des classes dans l'onglet "Classes & Pédagogie".
            </div>
          ) : (
            <div>
              {/* Class Selector Bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  background: 'var(--surface-color-hover, #f8fafc)',
                  padding: '16px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color, #e2e8f0)',
                  marginBottom: '20px',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1e293b' }}>
                    Sélectionner la classe à configurer :
                  </span>
                  <select
                    className="form-select"
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    style={{ padding: '8px 12px', minWidth: '180px', fontWeight: 600 }}
                  >
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} ({cls.level})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedClassObj && (
                  <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={handleApplyToSameLevel}
                      disabled={loading}
                      title={`Copier ces tarifs à toutes les classes de niveau ${selectedClassObj.level}`}
                      style={{ fontSize: '0.82rem', padding: '6px 12px' }}
                    >
                      📋 Appliquer à tout le {selectedClassObj.level}
                    </button>

                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleSaveClassPrices}
                      disabled={loading}
                      style={{ fontSize: '0.85rem', padding: '6px 16px', fontWeight: 600 }}
                    >
                      {loading ? 'Enregistrement...' : `💾 Enregistrer pour ${selectedClassObj.name}`}
                    </button>
                  </div>
                )}
              </div>

              {/* Table of fees for this class */}
              <div style={{ overflowX: 'auto', background: 'var(--surface-color, #ffffff)', borderRadius: '10px', border: '1px solid var(--border-color, #e2e8f0)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'var(--surface-color-hover, #f8fafc)', borderBottom: '1px solid var(--border-color, #e2e8f0)', color: 'var(--text-secondary, #64748b)', fontSize: '0.82rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '12px 14px' }}>Frais Annexe</th>
                      <th style={{ padding: '12px 14px' }}>Prix Standard École</th>
                      <th style={{ padding: '12px 14px', width: '220px' }}>Prix Spécifique {selectedClassObj?.name} (FCFA)</th>
                      <th style={{ padding: '12px 14px', width: '160px', textAlign: 'center' }}>Applicable à cette classe</th>
                      <th style={{ padding: '12px 14px' }}>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedFrais.map((frais) => {
                      const curVal = classAmounts[frais.id] !== undefined ? classAmounts[frais.id] : frais.amount;
                      const isActive = classActives[frais.id] !== undefined ? classActives[frais.id] : true;
                      const isCustom = curVal !== frais.amount;

                      return (
                        <tr key={frais.id} style={{ borderBottom: '1px solid var(--border-color, #e2e8f0)' }}>
                          <td style={{ padding: '12px 14px', fontWeight: 600 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>🏷️</span>
                              <span>{frais.name}</span>
                            </div>
                            {frais.description && (
                              <small style={{ color: '#64748b', display: 'block', marginTop: '2px' }}>
                                {frais.description}
                              </small>
                            )}
                          </td>

                          <td style={{ padding: '12px 14px', color: '#64748b' }}>
                            {formatNum(frais.amount)} F
                          </td>

                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <input
                                type="number"
                                className="form-input"
                                value={curVal}
                                disabled={!isActive}
                                onChange={(e) => {
                                  const val = e.target.value === '' ? 0 : Number(e.target.value);
                                  setClassAmounts((prev) => ({ ...prev, [frais.id]: val }));
                                }}
                                style={{
                                  width: '140px',
                                  padding: '6px 10px',
                                  fontWeight: 700,
                                  color: isCustom ? '#2563eb' : '#1e293b',
                                  borderColor: isCustom ? '#93c5fd' : undefined,
                                  background: isCustom ? '#eff6ff' : undefined,
                                }}
                              />
                              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>F</span>
                            </div>
                          </td>

                          <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={isActive}
                              onChange={(e) => {
                                setClassActives((prev) => ({ ...prev, [frais.id]: e.target.checked }));
                              }}
                              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                          </td>

                          <td style={{ padding: '12px 14px' }}>
                            {!isActive ? (
                              <span style={{ fontSize: '0.75rem', background: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: '6px' }}>
                                Non facturé
                              </span>
                            ) : isCustom ? (
                              <span style={{ fontSize: '0.75rem', background: '#dbeafe', color: '#1d4ed8', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
                                Tarif personnalisé ({formatNum(curVal)} F)
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.75rem', background: '#f8fafc', color: '#475569', padding: '2px 8px', borderRadius: '6px' }}>
                                Tarif standard ({formatNum(frais.amount)} F)
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {selectedClassObj && (
                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSaveClassPrices}
                    disabled={loading}
                    style={{ padding: '10px 24px', fontWeight: 700 }}
                  >
                    {loading ? 'Enregistrement...' : `💾 Enregistrer les tarifs pour ${selectedClassObj.name}`}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: GLOBAL MATRIX VIEW */}
      {activeView === 'matrix' && (
        <div style={{ overflowX: 'auto', background: 'var(--surface-color, #ffffff)', borderRadius: '10px', border: '1px solid var(--border-color, #e2e8f0)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: 'var(--surface-color-hover, #f8fafc)', borderBottom: '1px solid var(--border-color, #e2e8f0)' }}>
                <th style={{ padding: '12px 14px', position: 'sticky', left: 0, background: 'var(--surface-color-hover, #f8fafc)' }}>
                  Classe / Niveau
                </th>
                {sortedFrais.map((f) => (
                  <th key={f.id} style={{ padding: '12px 14px', textAlign: 'center' }}>
                    {f.name}
                    <br />
                    <small style={{ color: '#64748b', fontWeight: 'normal' }}>
                      Défaut: {formatNum(f.amount)} F
                    </small>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {classes.map((cls) => (
                <tr key={cls.id} style={{ borderBottom: '1px solid var(--border-color, #e2e8f0)' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 600, position: 'sticky', left: 0, background: '#fff' }}>
                    {cls.name} <span style={{ fontSize: '0.75rem', color: '#64748b' }}>({cls.level})</span>
                  </td>
                  {sortedFrais.map((f) => {
                    const override = classFraisList.find((cf) => cf.class_id === cls.id && cf.frais_annexe_id === f.id);
                    const finalAmount = override ? override.amount : f.amount;
                    const isActive = override ? override.is_active : true;
                    const isCustom = override && override.amount !== f.amount;

                    return (
                      <td key={f.id} style={{ padding: '12px 14px', textAlign: 'center' }}>
                        {!isActive ? (
                          <span style={{ color: '#cbd5e1', fontStyle: 'italic' }}>Exempté</span>
                        ) : (
                          <span
                            style={{
                              fontWeight: isCustom ? 700 : 500,
                              color: isCustom ? '#2563eb' : '#1e293b',
                              background: isCustom ? '#eff6ff' : 'transparent',
                              padding: isCustom ? '2px 6px' : undefined,
                              borderRadius: isCustom ? '4px' : undefined,
                            }}
                          >
                            {formatNum(finalAmount)} F
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Add / Edit Global Fee */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: 'var(--surface-color, #ffffff)',
              borderRadius: '14px',
              padding: '24px',
              maxWidth: '480px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                paddingBottom: '12px',
                borderBottom: '1px solid var(--border-color, #e2e8f0)',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-color, #1e293b)' }}>
                {editingFrais ? 'Modifier le frais annexe' : 'Nouveau Frais Annexe'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div style={{ padding: '8px 12px', background: '#fef2f2', color: '#991b1b', borderRadius: '6px', marginBottom: '14px', fontSize: '0.85rem' }}>
                ⚠️ {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveGlobal}>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '0.88rem' }}>
                  Libellé du frais <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: Frais de Bulletin, Tricot / Polo, Rame de papier..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '0.88rem' }}>
                  Montant standard par défaut (FCFA)
                </label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Ex: 2000, 5000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px' }}
                />
                <small style={{ color: 'var(--text-secondary, #64748b)', marginTop: '4px', display: 'block' }}>
                  Ce tarif sera appliqué par défaut à toutes les classes sauf celles qui ont un prix personnalisé.
                </small>
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '0.88rem' }}>
                  Description / Note (optionnel)
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: Facturé une seule fois à l'inscription"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px' }}
                />
              </div>

              <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="mandatory_cb"
                  checked={isMandatory}
                  onChange={(e) => setIsMandatory(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="mandatory_cb" style={{ fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' }}>
                  Frais obligatoire
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px' }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  style={{ padding: '8px 18px', borderRadius: '8px', fontWeight: 600 }}
                >
                  {loading ? 'Enregistrement...' : editingFrais ? 'Modifier' : 'Ajouter le frais'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
