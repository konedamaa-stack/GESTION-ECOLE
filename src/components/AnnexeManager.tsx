import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface Annexe {
  id: string;
  school_id: string;
  name: string;
  code?: string;
  address?: string;
  phone?: string;
  manager_name?: string;
  is_main?: boolean;
  created_at?: string;
}

interface AnnexeManagerProps {
  schoolId: string;
  annexes: Annexe[];
  classes: any[];
  students: any[];
  onRefresh: () => void;
  selectedAnnexeId: string;
  onSelectAnnexe: (id: string) => void;
  onClose?: () => void;
  isModal?: boolean;
}

export const AnnexeManager: React.FC<AnnexeManagerProps> = ({
  schoolId,
  annexes,
  classes,
  students,
  onRefresh,
  selectedAnnexeId,
  onSelectAnnexe,
  onClose,
  isModal = false,
}) => {
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingAnnexe, setEditingAnnexe] = useState<Annexe | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [managerName, setManagerName] = useState('');
  const [isMain, setIsMain] = useState(false);

  const openCreateModal = () => {
    setEditingAnnexe(null);
    setName('');
    setCode('');
    setAddress('');
    setPhone('');
    setManagerName('');
    setIsMain(annexes.length === 0);
    setErrorMsg(null);
    setSuccessMsg(null);
    setShowFormModal(true);
  };

  const openEditModal = (annexe: Annexe) => {
    setEditingAnnexe(annexe);
    setName(annexe.name || '');
    setCode(annexe.code || '');
    setAddress(annexe.address || '');
    setPhone(annexe.phone || '');
    setManagerName(annexe.manager_name || '');
    setIsMain(!!annexe.is_main);
    setErrorMsg(null);
    setSuccessMsg(null);
    setShowFormModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Le nom de l'annexe est obligatoire.");
      return;
    }
    if (!schoolId) {
      setErrorMsg("Identifiant de l'établissement introuvable.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      if (isMain) {
        // If marking this as main, unset others
        await supabase
          .from('annexes')
          .update({ is_main: false })
          .eq('school_id', schoolId);
      }

      if (editingAnnexe) {
        const { error } = await supabase
          .from('annexes')
          .update({
            name: name.trim(),
            code: code.trim() || null,
            address: address.trim() || null,
            phone: phone.trim() || null,
            manager_name: managerName.trim() || null,
            is_main: isMain,
          })
          .eq('id', editingAnnexe.id);

        if (error) throw error;
        setSuccessMsg("Annexe mise à jour avec succès !");
      } else {
        const { error } = await supabase
          .from('annexes')
          .insert([
            {
              school_id: schoolId,
              name: name.trim(),
              code: code.trim() || null,
              address: address.trim() || null,
              phone: phone.trim() || null,
              manager_name: managerName.trim() || null,
              is_main: isMain,
            },
          ]);

        if (error) throw error;
        setSuccessMsg("Nouvelle annexe ajoutée avec succès !");
      }

      setShowFormModal(false);
      onRefresh();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Erreur lors de l'enregistrement de l'annexe.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (annexe: Annexe) => {
    const linkedClasses = classes.filter((c) => c.annexe_id === annexe.id);
    const linkedStudents = students.filter(
      (s) =>
        s.annexe_id === annexe.id ||
        (s.class_id && linkedClasses.some((c) => c.id === s.class_id))
    );

    let confirmMsg = `Êtes-vous sûr de vouloir supprimer l'annexe "${annexe.name}" ?`;
    if (linkedClasses.length > 0) {
      confirmMsg += `\n\nAttention : ${linkedClasses.length} classe(s) et ${linkedStudents.length} élève(s) sont rattachés à cette annexe. Leur lien sera dissocié.`;
    }

    if (!window.confirm(confirmMsg)) return;

    try {
      const { error } = await supabase.from('annexes').delete().eq('id', annexe.id);
      if (error) throw error;

      if (selectedAnnexeId === annexe.id) {
        onSelectAnnexe('all');
      }
      onRefresh();
    } catch (err: any) {
      alert("Erreur lors de la suppression : " + err.message);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--border-color, #e2e8f0)',
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: '1.4rem',
              fontWeight: 700,
              color: 'var(--text-color, #1e293b)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>🏫</span> Gestion des Annexes & Campus Scolaires
          </h2>
          <p
            style={{
              margin: '6px 0 0 0',
              color: 'var(--text-secondary, #64748b)',
              fontSize: '0.9rem',
            }}
          >
            Administrez les différents sites, succursales et campus de votre
            établissement.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={openCreateModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '8px',
              fontWeight: 600,
              boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)',
            }}
          >
            <span>➕</span> Ajouter une Annexe
          </button>

          {isModal && onClose && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              style={{ padding: '10px 16px', borderRadius: '8px' }}
            >
              Fermer
            </button>
          )}
        </div>
      </div>

      {successMsg && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#ecfdf5',
            color: '#065f46',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #a7f3d0',
            fontWeight: 500,
          }}
        >
          ✅ {successMsg}
        </div>
      )}

      {/* Quick Filter Pill for All Annexes */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '20px',
          padding: '12px 16px',
          background: 'var(--surface-color-hover, #f8fafc)',
          borderRadius: '10px',
          border: '1px solid var(--border-color, #e2e8f0)',
        }}
      >
        <span
          style={{
            fontSize: '0.9rem',
            fontWeight: 600,
            color: 'var(--text-secondary, #64748b)',
          }}
        >
          Filtre d'affichage actif :
        </span>
        <button
          type="button"
          onClick={() => onSelectAnnexe('all')}
          style={{
            padding: '6px 14px',
            borderRadius: '20px',
            border: selectedAnnexeId === 'all' ? '2px solid #2563eb' : '1px solid #cbd5e1',
            background: selectedAnnexeId === 'all' ? '#eff6ff' : '#ffffff',
            color: selectedAnnexeId === 'all' ? '#1d4ed8' : '#475569',
            fontWeight: selectedAnnexeId === 'all' ? 700 : 500,
            cursor: 'pointer',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>🌐</span> Toutes les annexes (Global)
        </button>
        {annexes.map((a) => {
          const isSelected = selectedAnnexeId === a.id;
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => onSelectAnnexe(a.id)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: isSelected ? '2px solid #2563eb' : '1px solid #cbd5e1',
                background: isSelected ? '#eff6ff' : '#ffffff',
                color: isSelected ? '#1d4ed8' : '#475569',
                fontWeight: isSelected ? 700 : 500,
                cursor: 'pointer',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>{a.is_main ? '⭐' : '🏢'}</span> {a.name}
            </button>
          );
        })}
      </div>

      {/* Annexes Cards Grid */}
      {annexes.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 24px',
            background: 'var(--surface-color-hover, #f8fafc)',
            borderRadius: '12px',
            border: '2px dashed var(--border-color, #cbd5e1)',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🏫</div>
          <h3
            style={{
              margin: '0 0 8px 0',
              fontSize: '1.2rem',
              color: 'var(--text-color, #1e293b)',
            }}
          >
            Aucune annexe configurée pour le moment
          </h3>
          <p
            style={{
              color: 'var(--text-secondary, #64748b)',
              maxWidth: '500px',
              margin: '0 auto 20px auto',
              fontSize: '0.92rem',
            }}
          >
            Si votre établissement possède plusieurs sites ou succursales,
            ajoutez-les ici pour pouvoir y affecter vos classes et filtrer vos
            élèves.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={openCreateModal}
            style={{ padding: '10px 20px', borderRadius: '8px' }}
          >
            ➕ Créer la première annexe (ex: Siège Principal)
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px',
          }}
        >
          {annexes.map((annexe) => {
            const linkedClasses = classes.filter((c) => c.annexe_id === annexe.id);
            const linkedStudents = students.filter(
              (s) =>
                s.annexe_id === annexe.id ||
                (s.class_id && linkedClasses.some((c) => c.id === s.class_id))
            );
            const isCurrentActive = selectedAnnexeId === annexe.id;

            return (
              <div
                key={annexe.id}
                style={{
                  background: 'var(--surface-color, #ffffff)',
                  border: isCurrentActive
                    ? '2px solid #2563eb'
                    : '1px solid var(--border-color, #e2e8f0)',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: isCurrentActive
                    ? '0 4px 12px rgba(37, 99, 235, 0.15)'
                    : '0 2px 6px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  transition: 'all 0.2s ease',
                }}
              >
                <div>
                  {/* Top line with badges */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {annexe.is_main ? (
                        <span
                          style={{
                            background: '#fef3c7',
                            color: '#92400e',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          ⭐ Siège Principal
                        </span>
                      ) : (
                        <span
                          style={{
                            background: '#f1f5f9',
                            color: '#475569',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                          }}
                        >
                          🏢 Annexe / Succursale
                        </span>
                      )}

                      {annexe.code && (
                        <span
                          style={{
                            background: '#e0e7ff',
                            color: '#3730a3',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                          }}
                        >
                          {annexe.code}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => openEditModal(annexe)}
                        title="Modifier cette annexe"
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
                        onClick={() => handleDelete(annexe)}
                        title="Supprimer cette annexe"
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
                  </div>

                  {/* Annexe Title */}
                  <h3
                    style={{
                      margin: '0 0 10px 0',
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      color: 'var(--text-color, #1e293b)',
                    }}
                  >
                    {annexe.name}
                  </h3>

                  {/* Details info */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      color: 'var(--text-secondary, #64748b)',
                      fontSize: '0.86rem',
                      marginBottom: '16px',
                    }}
                  >
                    {annexe.address && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>📍</span>
                        <span>{annexe.address}</span>
                      </div>
                    )}
                    {annexe.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>📞</span>
                        <span>{annexe.phone}</span>
                      </div>
                    )}
                    {annexe.manager_name && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>👤</span>
                        <span>Directeur / Responsable : <strong>{annexe.manager_name}</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Stats counters */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '10px',
                      background: 'var(--surface-color-hover, #f8fafc)',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      marginBottom: '16px',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                        Classes
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>
                        {linkedClasses.length}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                        Élèves inscrits
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#2563eb' }}>
                        {linkedStudents.length}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom action button */}
                <button
                  type="button"
                  onClick={() => onSelectAnnexe(annexe.id)}
                  style={{
                    width: '100%',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: isCurrentActive ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                    background: isCurrentActive ? '#2563eb' : '#ffffff',
                    color: isCurrentActive ? '#ffffff' : '#1e293b',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {isCurrentActive ? (
                    <>
                      <span>✓</span> Annexe activement sélectionnée
                    </>
                  ) : (
                    <>
                      <span>🔍</span> Filtrer sur cette annexe
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Annexe Modal */}
      {showFormModal && (
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
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
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
              <h3
                style={{
                  margin: 0,
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  color: 'var(--text-color, #1e293b)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>{editingAnnexe ? '✏️' : '➕'}</span>
                {editingAnnexe ? "Modifier l'Annexe" : 'Nouvelle Annexe / Campus'}
              </h3>
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  color: '#64748b',
                }}
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div
                style={{
                  padding: '10px 14px',
                  backgroundColor: '#fef2f2',
                  color: '#991b1b',
                  borderRadius: '6px',
                  marginBottom: '16px',
                  fontSize: '0.88rem',
                }}
              >
                ⚠️ {errorMsg}
              </div>
            )}

            <form onSubmit={handleSave}>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '0.88rem' }}>
                  Nom de l'Annexe / Site <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: Site Principal, Annexe Cocody, Campus B..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div className="form-group">
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '0.88rem' }}>
                    Code / Sigle (optionnel)
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: ANN-1, SITE-B"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px' }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '0.88rem' }}>
                    Téléphone du site
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: +225 07..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '0.88rem' }}>
                  Adresse géographique / Ville / Quartier
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: Quartier Commerce, en face de la mairie"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '0.88rem' }}>
                  Directeur d'annexe / Responsable de site
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: M. Kouassi, Mme Traoré..."
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px' }}
                />
              </div>

              <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="is_main_checkbox"
                  checked={isMain}
                  onChange={(e) => setIsMain(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label
                  htmlFor="is_main_checkbox"
                  style={{ fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', color: 'var(--text-color, #1e293b)' }}
                >
                  Définir comme Siège / Établissement Principal ⭐
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowFormModal(false)}
                  style={{ padding: '9px 16px', borderRadius: '8px' }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  style={{ padding: '9px 20px', borderRadius: '8px', fontWeight: 600 }}
                >
                  {loading ? 'Enregistrement...' : editingAnnexe ? 'Mettre à jour' : 'Créer l’annexe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
