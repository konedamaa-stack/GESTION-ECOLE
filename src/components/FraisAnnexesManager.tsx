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

interface FraisAnnexesManagerProps {
  schoolId: string;
  fraisList: FraisAnnexe[];
  onRefresh: () => void;
}

export const FraisAnnexesManager: React.FC<FraisAnnexesManagerProps> = ({
  schoolId,
  fraisList,
  onRefresh,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingFrais, setEditingFrais] = useState<FraisAnnexe | null>(null);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [isMandatory, setIsMandatory] = useState(false);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sorted list by display_order
  const sortedFrais = [...fraisList].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

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

  const handleSave = async (e: React.FormEvent) => {
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
    if (!window.confirm(`Supprimer définitivement le frais "${fraisName}" ?`)) return;
    try {
      const { error } = await supabase.from('frais_annexes').delete().eq('id', id);
      if (error) throw error;
      onRefresh();
    } catch (err: any) {
      alert("Erreur: " + err.message);
    }
  };

  // Reorder up (lower display_order)
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

  // Reorder down (higher display_order)
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

  const formatNum = (val: number) => new Intl.NumberFormat('fr-FR').format(val || 0);

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
          marginBottom: '20px',
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
            <span>💳</span> Frais Annexes de l'Établissement (Bulletins, Tricots, Tenues...)
          </h3>
          <p
            style={{
              margin: 0,
              color: 'var(--text-secondary, #64748b)',
              fontSize: '0.88rem',
            }}
          >
            Définissez les frais internes et leur ordre de priorité pour l'encaissement et les reçus.
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
            <span>➕</span> Ajouter un Frais Annexe
          </button>
        </div>
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
          }}
        >
          ✅ {successMsg}
        </div>
      )}

      {/* Table of Frais Annexes with Reordering */}
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
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleInitDefaultPacks}
              disabled={loading}
              style={{ padding: '8px 18px', borderRadius: '8px', fontWeight: 600 }}
            >
              ⚡ Charger le pack standard (Bulletin 2 000 F, Tricot 5 000 F...)
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={openCreateModal}
              style={{ padding: '8px 18px', borderRadius: '8px' }}
            >
              ➕ Ajouter manuellement
            </button>
          </div>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', background: 'var(--surface-color, #ffffff)', borderRadius: '10px', border: '1px solid var(--border-color, #e2e8f0)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--surface-color-hover, #f8fafc)', borderBottom: '1px solid var(--border-color, #e2e8f0)', color: 'var(--text-secondary, #64748b)', fontSize: '0.82rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 14px', width: '80px', textAlign: 'center' }}>Ordre</th>
                <th style={{ padding: '12px 14px' }}>Libellé du frais</th>
                <th style={{ padding: '12px 14px' }}>Montant standard</th>
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
                  {/* Order column with Up/Down buttons */}
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

                  {/* Name */}
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--text-color, #1e293b)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>🏷️</span>
                      <span>{item.name}</span>
                    </div>
                  </td>

                  {/* Amount */}
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: '#2563eb' }}>
                    {formatNum(item.amount)} F CFA
                  </td>

                  {/* Obligation badge */}
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

                  {/* Description */}
                  <td style={{ padding: '12px 14px', color: 'var(--text-secondary, #64748b)', fontSize: '0.85rem' }}>
                    {item.description || '—'}
                  </td>

                  {/* Actions */}
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

      {/* Modal Add / Edit */}
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

            <form onSubmit={handleSave}>
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
                  Montant standard (FCFA)
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
                  Ce montant sera automatiquement pré-rempli lors de l'encaissement de ce frais.
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
                  Frais obligatoire pour tous les élèves
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
