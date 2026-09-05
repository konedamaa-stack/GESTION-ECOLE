import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { FraisAnnexesPrintPreview } from './FraisAnnexesPrintPreview';

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
  schoolInfo?: any;
  fraisList: FraisAnnexe[];
  classes: any[];
  classFraisList: ClassFraisAnnexe[];
  students?: any[];
  invoices?: any[];
  userRole?: string;
  onRefresh: () => void;
}

export const FraisAnnexesManager: React.FC<FraisAnnexesManagerProps> = ({
  schoolId,
  schoolInfo,
  fraisList,
  classes = [],
  classFraisList = [],
  students = [],
  invoices = [],
  userRole,
  onRefresh,
}) => {
  const isSupervisor = (() => {
    const role = (userRole || '').toLowerCase();
    if (role.includes('supervis')) return true;
    const loginRole = (localStorage.getItem('sges_login_role') || '').toLowerCase();
    if (loginRole.includes('supervis')) return true;
    try {
      const empRaw = localStorage.getItem('sges_employee');
      if (empRaw) {
        const emp = JSON.parse(empRaw);
        if ((emp?.role || '').toLowerCase().includes('supervis')) return true;
      }
    } catch (e) {}
    return false;
  })();
  const [activeView, setActiveView] = useState<'bilan_global' | 'by_class' | 'global' | 'matrix'>('bilan_global');
  const [selectedClassId, setSelectedClassId] = useState<string>(classes.length > 0 ? classes[0].id : '');

  // Print State
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printMode, setPrintMode] = useState<'global' | 'by_category' | 'by_class'>('global');
  const [printCategoryId, setPrintCategoryId] = useState<string>(fraisList.length > 0 ? fraisList[0].id : '');
  const [printClassId, setPrintClassId] = useState<string>(classes.length > 0 ? classes[0].id : '');

  // Mass Validation State
  const [showValidateModal, setShowValidateModal] = useState(false);
  const [validateTargetClassId, setValidateTargetClassId] = useState<'all' | string>('all');
  const [isValidating, setIsValidating] = useState(false);

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
    if (isSupervisor) {
      alert("Action non autorisée : Le rôle Superviseur est limité à la lecture et à l'impression.");
      return;
    }
    setEditingFrais(null);
    setName('');
    setAmount('');
    setIsMandatory(false);
    setDescription('');
    setErrorMsg(null);
    setShowModal(true);
  };

  const openEditModal = (frais: FraisAnnexe) => {
    if (isSupervisor) {
      alert("Action non autorisée : Le rôle Superviseur est limité à la lecture et à l'impression.");
      return;
    }
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
    if (isSupervisor) {
      alert("Action non autorisée : Le rôle Superviseur est limité à la lecture et à l'impression.");
      return;
    }
    if (!window.confirm(`Supprimer définitivement le frais "${fraisName}" et tous ses tarifs associés ?`)) return;
    try {
      // Supprimer d'abord les liaisons par classe pour éviter les blocages de clé étrangère
      await supabase.from('class_frais_annexes').delete().eq('frais_annexe_id', id);

      const { error } = await supabase.from('frais_annexes').delete().eq('id', id);
      if (error) throw error;
      onRefresh();
    } catch (err: any) {
      alert("Erreur lors de la suppression : " + err.message);
    }
  };

  const handleMoveUp = async (index: number) => {
    if (isSupervisor || index <= 0) return;
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
    if (isSupervisor || index >= sortedFrais.length - 1) return;
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
    if (isSupervisor || !schoolId) return;
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

  const handleSaveClassPrices = async () => {
    if (isSupervisor || !selectedClassId || !schoolId) return;
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

  // Helper to get fee for a class
  const getFeeForClass = (classId: string, fraisId: string, defaultAmount: number) => {
    const override = classFraisList.find((cf) => cf.class_id === classId && cf.frais_annexe_id === fraisId);
    if (override) {
      return override.is_active ? override.amount : 0;
    }
    return defaultAmount;
  };

  // Helper to match invoice motif with frais name bidirectionally
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

  // Helper to get collected amount for a class & motif
  const getCollectedForClass = (classId: string, motifName?: string) => {
    const classStudentIds = students.filter((s) => s.class_id === classId).map((s) => s.id);
    if (classStudentIds.length === 0) return 0;

    return invoices
      .filter((inv) => {
        if (!classStudentIds.includes(inv.student_id)) return false;
        if (motifName) {
          return matchesFraisMotif(inv.motif, motifName);
        }
        // Match only active frais annexe for this class
        return sortedFrais
          .filter((f) => getFeeForClass(classId, f.id, f.amount) > 0)
          .some((f) => matchesFraisMotif(inv.motif, f.name));
      })
      .reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
  };

  // Calculate Global Totals for Bilan
  const classBreakdowns = classes.map((cls) => {
    const classStudentsCount = students.filter((s) => s.class_id === cls.id).length;

    // Per category breakdown for this class
    const categories = sortedFrais.map((frais) => {
      const unitAmount = getFeeForClass(cls.id, frais.id, frais.amount);
      const totalAttendu = unitAmount * classStudentsCount;
      const totalEncaisse = unitAmount > 0 ? getCollectedForClass(cls.id, frais.name) : 0;
      const reste = Math.max(0, totalAttendu - totalEncaisse);
      return {
        fraisId: frais.id,
        fraisName: frais.name,
        unitAmount,
        totalAttendu,
        totalEncaisse,
        reste,
      };
    });

    const totalForfaitParEleve = categories.reduce((sum, c) => sum + c.unitAmount, 0);
    const totalClasseAttendu = totalForfaitParEleve * classStudentsCount;
    const totalClasseEncaisse = categories
      .filter((c) => c.unitAmount > 0)
      .reduce((sum, c) => sum + c.totalEncaisse, 0);
    const totalClasseReste = Math.max(0, totalClasseAttendu - totalClasseEncaisse);
    const taux = totalClasseAttendu > 0 ? Math.min(100, Math.round((totalClasseEncaisse / totalClasseAttendu) * 100)) : 0;

    return {
      classObj: cls,
      studentCount: classStudentsCount,
      categories,
      totalForfaitParEleve,
      totalClasseAttendu,
      totalClasseEncaisse,
      totalClasseReste,
      taux,
    };
  });

  // Grand Totals
  const grandTotalAttendu = classBreakdowns.reduce((sum, cb) => sum + cb.totalClasseAttendu, 0);
  const grandTotalEncaisse = classBreakdowns.reduce((sum, cb) => sum + cb.totalClasseEncaisse, 0);
  const grandTotalReste = Math.max(0, grandTotalAttendu - grandTotalEncaisse);
  const grandTaux = grandTotalAttendu > 0 ? Math.min(100, Math.round((grandTotalEncaisse / grandTotalAttendu) * 100)) : 0;

  // Print functions
  const handleOpenPrintModal = () => {
    setPrintMode('global');
    if (!printCategoryId && sortedFrais.length > 0) setPrintCategoryId(sortedFrais[0].id);
    if (!printClassId && classes.length > 0) setPrintClassId(classes[0].id);
    setShowPrintModal(true);
  };

  const handleQuickPrintCategory = (fraisId: string) => {
    setPrintMode('by_category');
    setPrintCategoryId(fraisId);
    setIsPrinting(true);
  };

  const handleQuickPrintClass = (classId: string) => {
    setPrintMode('by_class');
    setPrintClassId(classId);
    setIsPrinting(true);
  };

  const executeValidateFraisAnnexes = async (target: 'all' | string) => {
    if (isSupervisor || !schoolId) return;
    setIsValidating(true);
    try {
      const targetStudents = target === 'all'
        ? students
        : students.filter((s: any) => s.class_id === target);

      if (targetStudents.length === 0) {
        alert("Aucun élève trouvé pour cette sélection.");
        setIsValidating(false);
        return;
      }

      const invoicePayloads: any[] = [];

      for (const student of targetStudents) {
        const studentClassId = student.class_id;
        const studentInvoices = invoices.filter((inv: any) => inv.student_id === student.id);

        for (const frais of sortedFrais) {
          const expectedAmount = getFeeForClass(studentClassId, frais.id, frais.amount);
          if (expectedAmount <= 0) continue;

          const alreadyPaid = studentInvoices
            .filter((inv: any) => matchesFraisMotif(inv.motif, frais.name))
            .reduce((sum: number, inv: any) => sum + (Number(inv.amount) || 0), 0);

          const stillDue = Math.max(0, expectedAmount - alreadyPaid);
          if (stillDue > 0) {
            invoicePayloads.push({
              school_id: schoolId,
              student_id: student.id,
              amount: stillDue,
              motif: frais.name,
              payment_method: 'Espèces',
              status: 'Payée',
              invoice_number: 'FAC-ANNEXE-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 100000),
            });
          }
        }
      }

      if (invoicePayloads.length === 0) {
        alert("Tous les frais annexes de cette sélection sont déjà soldés à 100% !");
        setShowValidateModal(false);
        setIsValidating(false);
        return;
      }

      const { error: insertErr } = await supabase.from('invoices').insert(invoicePayloads);
      if (insertErr) throw insertErr;

      alert(`✅ Validation réussie ! ${invoicePayloads.length} écriture(s) de frais annexes enregistrée(s) et soldée(s) avec succès.`);
      setShowValidateModal(false);
      onRefresh();
    } catch (err: any) {
      console.error("Error validating annexes:", err);
      alert("Erreur lors de la validation : " + (err.message || 'Erreur inconnue'));
    } finally {
      setIsValidating(false);
    }
  };

  const handleQuickValidateClass = (classId: string, className: string) => {
    if (confirm(`Voulez-vous solder et valider directement TOUS les frais annexes restants pour la classe "${className}" ?`)) {
      executeValidateFraisAnnexes(classId);
    }
  };

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
            <span>💳</span> Montant Global des Frais Annexes par Classe & Catégorie
          </h3>
          <p
            style={{
              margin: 0,
              color: 'var(--text-secondary, #64748b)',
              fontSize: '0.88rem',
            }}
          >
            Suivi financier complet : montants unitaires, montants attendus par classe, total encaissé et reste à percevoir.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {!isSupervisor && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setShowValidateModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, borderColor: '#10b981', color: '#047857', background: '#ecfdf5' }}
            >
              <span>⚡</span> Tout Valider (Soldé)
            </button>
          )}

          <button
            type="button"
            className="btn btn-outline"
            onClick={handleOpenPrintModal}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, borderColor: '#2563eb', color: '#2563eb', background: '#eff6ff' }}
          >
            <span>🖨️</span> Imprimer les Frais Annexes
          </button>

          {!isSupervisor && (
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
          )}
        </div>
      </div>

      {/* KPI Cards (Montant Global Overview) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px',
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            background: '#ffffff',
            padding: '16px 20px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            borderLeft: '4px solid #3b82f6',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            Montant Global Attendu
          </span>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#1e293b', marginTop: '4px' }}>
            {formatNum(grandTotalAttendu)} <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>F CFA</span>
          </div>
          <small style={{ color: '#64748b', fontSize: '0.75rem' }}>
            Sur l'ensemble des {classes.length} classes
          </small>
        </div>

        <div
          style={{
            background: '#ffffff',
            padding: '16px 20px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            borderLeft: '4px solid #10b981',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <span style={{ fontSize: '0.8rem', color: '#047857', fontWeight: 600, textTransform: 'uppercase' }}>
            Montant Déjà Encaissé
          </span>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
            {formatNum(grandTotalEncaisse)} <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>F CFA</span>
          </div>
          <small style={{ color: '#059669', fontSize: '0.75rem', fontWeight: 600 }}>
            Taux de recouvrement : {grandTaux}%
          </small>
        </div>

        <div
          style={{
            background: '#ffffff',
            padding: '16px 20px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            borderLeft: '4px solid #ef4444',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <span style={{ fontSize: '0.8rem', color: '#b91c1c', fontWeight: 600, textTransform: 'uppercase' }}>
            Reste Global à Recouvrer
          </span>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#dc2626', marginTop: '4px' }}>
            {formatNum(grandTotalReste)} <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>F CFA</span>
          </div>
          <small style={{ color: '#dc2626', fontSize: '0.75rem' }}>
            Somme restante à percevoir
          </small>
        </div>

        <div
          style={{
            background: '#ffffff',
            padding: '16px 20px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            borderLeft: '4px solid #8b5cf6',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <span style={{ fontSize: '0.8rem', color: '#6d28d9', fontWeight: 600, textTransform: 'uppercase' }}>
            Catégories Configurées
          </span>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#7c3aed', marginTop: '4px' }}>
            {sortedFrais.length} <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>rubriques</span>
          </div>
          <small style={{ color: '#6d28d9', fontSize: '0.75rem' }}>
            Bulletins, Tricots, Tenues, etc.
          </small>
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
          overflowX: 'auto',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveView('bilan_global')}
          style={{
            padding: '8px 16px',
            border: 'none',
            background: 'transparent',
            borderBottom: activeView === 'bilan_global' ? '3px solid #1d4ed8' : '3px solid transparent',
            color: activeView === 'bilan_global' ? '#1d4ed8' : '#0f172a',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.92rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap',
          }}
        >
          <span>💰</span> Montant Global par Classe & Catégorie
        </button>

        <button
          type="button"
          onClick={() => setActiveView('by_class')}
          style={{
            padding: '8px 16px',
            border: 'none',
            background: 'transparent',
            borderBottom: activeView === 'by_class' ? '3px solid #1d4ed8' : '3px solid transparent',
            color: activeView === 'by_class' ? '#1d4ed8' : '#0f172a',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.92rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap',
          }}
        >
          <span>🏫</span> Tarifs Personnalisés par Classe
        </button>

        <button
          type="button"
          onClick={() => setActiveView('global')}
          style={{
            padding: '8px 16px',
            border: 'none',
            background: 'transparent',
            borderBottom: activeView === 'global' ? '3px solid #1d4ed8' : '3px solid transparent',
            color: activeView === 'global' ? '#1d4ed8' : '#0f172a',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.92rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap',
          }}
        >
          <span>📋</span> Frais Globaux & Priorité
        </button>

        <button
          type="button"
          onClick={() => setActiveView('matrix')}
          style={{
            padding: '8px 16px',
            border: 'none',
            background: 'transparent',
            borderBottom: activeView === 'matrix' ? '3px solid #1d4ed8' : '3px solid transparent',
            color: activeView === 'matrix' ? '#1d4ed8' : '#0f172a',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.92rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap',
          }}
        >
          <span>📊</span> Grille Tarifaire Complète
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

      {/* VIEW 1: BILAN GLOBAL PAR CLASSE ET PAR CATÉGORIE */}
      {activeView === 'bilan_global' && (
        <div>
          {classes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
              Aucune classe trouvée.
            </div>
          ) : (
            <div style={{ overflowX: 'auto', background: 'var(--surface-color, #ffffff)', borderRadius: '10px', border: '1px solid var(--border-color, #e2e8f0)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '14px 16px', fontWeight: 700 }}>Classe</th>
                    <th style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 700 }}>Effectif</th>
                    
                    {/* Colonnes par catégorie / rubrique */}
                    {sortedFrais.map((f) => (
                      <th key={f.id} style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                          <span>{f.name}</span>
                          <button
                            type="button"
                            title={`Imprimer l'état de recouvrement : "${f.name}"`}
                            onClick={() => handleQuickPrintCategory(f.id)}
                            style={{
                              background: '#eff6ff',
                              border: '1px solid #bfdbfe',
                              color: '#1d4ed8',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.72rem',
                              padding: '2px 4px',
                              lineHeight: 1,
                            }}
                          >
                            🖨️
                          </button>
                        </div>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 'normal', textTransform: 'none' }}>
                          (Tarif / Attendu)
                        </span>
                      </th>
                    ))}

                    <th style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 700, background: '#f1f5f9' }}>
                      Forfait / Élève
                    </th>
                    <th style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 700, background: '#eff6ff', color: '#1d4ed8' }}>
                      Total Annexe
                    </th>
                    <th style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 700, background: '#ecfdf5', color: '#065f46' }}>
                      Total Encaissé
                    </th>
                    <th style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 700, background: '#fef2f2', color: '#991b1b' }}>
                      Reste à Recouvrer
                    </th>
                    <th style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 700 }}>
                      Recouvrement
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {classBreakdowns.map((cb) => (
                    <tr
                      key={cb.classObj.id}
                      style={{
                        borderBottom: '1px solid #e2e8f0',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#1e293b' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '1.1rem' }}>🏫</span>
                            <span>{cb.classObj.name}</span>
                            <span style={{ fontSize: '0.72rem', background: '#f1f5f9', color: '#64748b', padding: '2px 6px', borderRadius: '4px' }}>
                              {cb.classObj.level}
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <button
                              type="button"
                              title={`Valider et solder tous les frais annexes pour la classe ${cb.classObj.name}`}
                              onClick={() => handleQuickValidateClass(cb.classObj.id, cb.classObj.name)}
                              style={{
                                background: '#ecfdf5',
                                border: '1px solid #a7f3d0',
                                color: '#047857',
                                borderRadius: '5px',
                                padding: '3px 7px',
                                fontSize: '0.74rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              <span>⚡</span> Solder
                            </button>

                            <button
                              type="button"
                              title={`Imprimer la liste nominative pour la classe ${cb.classObj.name}`}
                              onClick={() => handleQuickPrintClass(cb.classObj.id)}
                              style={{
                                background: '#eff6ff',
                                border: '1px solid #bfdbfe',
                                color: '#2563eb',
                                borderRadius: '5px',
                                padding: '3px 7px',
                                fontSize: '0.74rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              <span>🖨️</span> Fiche
                            </button>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600 }}>
                        <span style={{ background: '#f8fafc', padding: '3px 8px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                          {cb.studentCount} élèves
                        </span>
                      </td>

                      {/* Catégories individuelles */}
                      {cb.categories.map((cat) => (
                        <td key={cat.fraisId} style={{ padding: '12px 14px', textAlign: 'right' }}>
                          {cat.unitAmount === 0 ? (
                            <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>Exempté</span>
                          ) : (
                            <div>
                              <div style={{ fontWeight: 600, color: '#1e293b' }}>
                                {formatNum(cat.unitAmount)} F
                              </div>
                              <small style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>
                                {formatNum(cat.totalAttendu)} F
                              </small>
                            </div>
                          )}
                        </td>
                      ))}

                      {/* Total Forfait par élève */}
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, background: '#f1f5f9' }}>
                        {formatNum(cb.totalForfaitParEleve)} F
                      </td>

                      {/* Total Classe Attendu */}
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8' }}>
                        {formatNum(cb.totalClasseAttendu)} F
                      </td>

                      {/* Total Classe Encaissé */}
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, background: '#ecfdf5', color: '#059669' }}>
                        {formatNum(cb.totalClasseEncaisse)} F
                      </td>

                      {/* Reste à recouvrer */}
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, background: '#fef2f2', color: '#dc2626' }}>
                        {formatNum(cb.totalClasseReste)} F
                      </td>

                      {/* Taux & Barre */}
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: cb.taux >= 80 ? '#059669' : cb.taux >= 50 ? '#d97706' : '#dc2626' }}>
                            {cb.taux}%
                          </span>
                          <div style={{ width: '60px', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${cb.taux}%`,
                                height: '100%',
                                background: cb.taux >= 80 ? '#10b981' : cb.taux >= 50 ? '#f59e0b' : '#ef4444',
                              }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {/* TOTAL GENERAL FOOTER */}
                  <tr style={{ background: '#f8fafc', borderTop: '3px solid #cbd5e1', fontWeight: 800 }}>
                    <td style={{ padding: '16px', fontSize: '1rem', color: '#0f172a' }}>
                      TOTAL GÉNÉRAL ÉCOLE
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center', fontSize: '0.95rem' }}>
                      {students.length} élèves
                    </td>

                    {sortedFrais.map((f) => {
                      const totalAttenduFrais = classBreakdowns.reduce((sum, cb) => {
                        const cat = cb.categories.find((c) => c.fraisId === f.id);
                        return sum + (cat ? cat.totalAttendu : 0);
                      }, 0);
                      return (
                        <td key={f.id} style={{ padding: '16px 14px', textAlign: 'right', color: '#1e293b' }}>
                          {formatNum(totalAttenduFrais)} F
                        </td>
                      );
                    })}

                    <td style={{ padding: '16px', textAlign: 'right', background: '#e2e8f0' }}>
                      —
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right', background: '#dbeafe', color: '#1d4ed8', fontSize: '1.05rem' }}>
                      {formatNum(grandTotalAttendu)} F
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right', background: '#d1fae5', color: '#065f46', fontSize: '1.05rem' }}>
                      {formatNum(grandTotalEncaisse)} F
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right', background: '#fee2e2', color: '#991b1b', fontSize: '1.05rem' }}>
                      {formatNum(grandTotalReste)} F
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center', color: '#059669', fontSize: '1.05rem' }}>
                      {grandTaux}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: TARIFS PAR CLASSE */}
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

                {selectedClassObj && !isSupervisor && (
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

              {/* Class Summary Banner */}
              {selectedClassObj && (
                <div
                  style={{
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    padding: '12px 18px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.3rem' }}>🏫</span>
                    <div>
                      <strong style={{ color: '#1e3a8a', fontSize: '1rem' }}>
                        Classe de {selectedClassObj.name} ({selectedClassObj.level})
                      </strong>
                      <div style={{ fontSize: '0.82rem', color: '#3b82f6' }}>
                        Effectif actuel : {students.filter((s) => s.class_id === selectedClassObj.id).length} élèves
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <small style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Forfait par élève</small>
                      <strong style={{ color: '#1d4ed8', fontSize: '1.1rem' }}>
                        {formatNum(
                          sortedFrais.reduce((sum, f) => {
                            const cur = classAmounts[f.id] !== undefined ? classAmounts[f.id] : f.amount;
                            const active = classActives[f.id] !== undefined ? classActives[f.id] : true;
                            return sum + (active ? cur : 0);
                          }, 0)
                        )}{' '}
                        F CFA
                      </strong>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <small style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Montant total de la classe</small>
                      <strong style={{ color: '#059669', fontSize: '1.1rem' }}>
                        {formatNum(
                          sortedFrais.reduce((sum, f) => {
                            const cur = classAmounts[f.id] !== undefined ? classAmounts[f.id] : f.amount;
                            const active = classActives[f.id] !== undefined ? classActives[f.id] : true;
                            return sum + (active ? cur : 0);
                          }, 0) * students.filter((s) => s.class_id === selectedClassObj.id).length
                        )}{' '}
                        F CFA
                      </strong>
                    </div>
                  </div>
                </div>
              )}

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
                                disabled={!isActive || isSupervisor}
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
                              disabled={isSupervisor}
                              onChange={(e) => {
                                setClassActives((prev) => ({ ...prev, [frais.id]: e.target.checked }));
                              }}
                              style={{ width: '18px', height: '18px', cursor: isSupervisor ? 'default' : 'pointer' }}
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

              {selectedClassObj && !isSupervisor && (
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

      {/* VIEW 3: GLOBAL FEES LIST */}
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
                        {isSupervisor ? (
                          <span style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>
                            Lecture seule
                          </span>
                        ) : (
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={() => openEditModal(item)}
                              title="Modifier ce frais"
                              style={{
                                background: '#eff6ff',
                                border: '1px solid #bfdbfe',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                padding: '5px 10px',
                                color: '#2563eb',
                                fontSize: '0.82rem',
                                fontWeight: 600,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <span>✏️</span> Modifier
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(item.id, item.name)}
                              title="Supprimer ce frais"
                              style={{
                                background: '#fef2f2',
                                border: '1px solid #fecaca',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                padding: '5px 10px',
                                color: '#dc2626',
                                fontSize: '0.82rem',
                                fontWeight: 600,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <span>🗑️</span> Supprimer
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* VIEW 4: GLOBAL MATRIX VIEW */}
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

      {/* MODAL: CHOIX D'IMPRESSION (GLOBAL / CATÉGORIE / CLASSE) */}
      {showPrintModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              maxWidth: '540px',
              width: '100%',
              padding: '26px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🖨️</span> Impression des Frais Annexes
              </h3>
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <p style={{ margin: '0 0 18px 0', fontSize: '0.88rem', color: '#64748b' }}>
              Sélectionnez le rapport officiel à imprimer ou exporter en PDF avec en-tête et signatures :
            </p>

            {/* Radio Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '22px' }}>
              {/* Option 1: Bilan Global */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '14px',
                  borderRadius: '10px',
                  border: printMode === 'global' ? '2px solid #2563eb' : '1px solid #e2e8f0',
                  background: printMode === 'global' ? '#eff6ff' : '#f8fafc',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="print_mode_radio"
                  checked={printMode === 'global'}
                  onChange={() => setPrintMode('global')}
                  style={{ marginTop: '3px' }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b' }}>
                    📊 Bilan Global de l'Établissement
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
                    Synthèse de toutes les classes avec effectifs, montants attendus, total encaissé et soldes.
                  </div>
                </div>
              </label>

              {/* Option 2: Par Catégorie */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '14px',
                  borderRadius: '10px',
                  border: printMode === 'by_category' ? '2px solid #2563eb' : '1px solid #e2e8f0',
                  background: printMode === 'by_category' ? '#eff6ff' : '#f8fafc',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="print_mode_radio"
                  checked={printMode === 'by_category'}
                  onChange={() => setPrintMode('by_category')}
                  style={{ marginTop: '3px' }}
                />
                <div style={{ width: '100%' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b' }}>
                    🏷️ État par Catégorie de Frais
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px', marginBottom: printMode === 'by_category' ? '8px' : '0' }}>
                    Suivi classe par classe pour un frais particulier (ex: Bulletins, Tricots, Assurance...).
                  </div>

                  {printMode === 'by_category' && (
                    <select
                      className="form-select"
                      value={printCategoryId}
                      onChange={(e) => setPrintCategoryId(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', fontSize: '0.88rem', borderRadius: '6px', marginTop: '4px' }}
                    >
                      {sortedFrais.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name} (défaut : {f.amount} F)
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </label>

              {/* Option 3: Par Classe */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '14px',
                  borderRadius: '10px',
                  border: printMode === 'by_class' ? '2px solid #2563eb' : '1px solid #e2e8f0',
                  background: printMode === 'by_class' ? '#eff6ff' : '#f8fafc',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="print_mode_radio"
                  checked={printMode === 'by_class'}
                  onChange={() => setPrintMode('by_class')}
                  style={{ marginTop: '3px' }}
                />
                <div style={{ width: '100%' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b' }}>
                    🏫 Fiche Nominative par Classe
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px', marginBottom: printMode === 'by_class' ? '8px' : '0' }}>
                    Liste nominative complète des élèves d'une classe avec état pour chaque rubrique.
                  </div>

                  {printMode === 'by_class' && (
                    <select
                      className="form-select"
                      value={printClassId}
                      onChange={(e) => setPrintClassId(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', fontSize: '0.88rem', borderRadius: '6px', marginTop: '4px' }}
                    >
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name} ({cls.level})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowPrintModal(false)}
                style={{ padding: '9px 16px', borderRadius: '8px' }}
              >
                Annuler
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setShowPrintModal(false);
                  setIsPrinting(true);
                }}
                style={{ padding: '9px 20px', borderRadius: '8px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <span>🖨️</span> Lancer l'impression / PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE VALIDATION MASSIVE DES FRAIS ANNEXES */}
      {showValidateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '520px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.4rem' }}>⚡</span>
                <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                  Valider les Frais Annexes
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowValidateModal(false)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '20px', lineHeight: 1.5 }}>
              Cette opération enregistre automatiquement le règlement complet de tous les frais annexes non encore soldés (Bulletins, Tricots, Assurance, Badges...) avec le statut <strong>« Payée »</strong>.
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', color: '#1e293b', marginBottom: '8px' }}>
                Portée de la validation :
              </label>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px',
                    borderRadius: '8px',
                    border: validateTargetClassId === 'all' ? '2px solid #10b981' : '1px solid #e2e8f0',
                    background: validateTargetClassId === 'all' ? '#f0fdf4' : '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="validate_target_radio"
                    checked={validateTargetClassId === 'all'}
                    onChange={() => setValidateTargetClassId('all')}
                  />
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>🏫 Tout l'établissement</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Solder tous les frais annexes de l'ensemble des {students.length} élèves
                    </div>
                  </div>
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px',
                    borderRadius: '8px',
                    border: validateTargetClassId !== 'all' ? '2px solid #10b981' : '1px solid #e2e8f0',
                    background: validateTargetClassId !== 'all' ? '#f0fdf4' : '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="validate_target_radio"
                    checked={validateTargetClassId !== 'all'}
                    onChange={() => setValidateTargetClassId(classes.length > 0 ? classes[0].id : '')}
                  />
                  <div style={{ width: '100%' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>🏫 Une classe spécifique</div>
                    {validateTargetClassId !== 'all' && (
                      <select
                        className="form-select"
                        value={validateTargetClassId}
                        onChange={(e) => setValidateTargetClassId(e.target.value)}
                        style={{ marginTop: '8px', width: '100%', padding: '6px 10px', fontSize: '0.86rem' }}
                      >
                        {classes.map((cls) => (
                          <option key={cls.id} value={cls.id}>
                            {cls.name} ({students.filter((s: any) => s.class_id === cls.id).length} élèves)
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowValidateModal(false)}
                disabled={isValidating}
                style={{ padding: '9px 16px', borderRadius: '8px' }}
              >
                Annuler
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={isValidating}
                onClick={() => executeValidateFraisAnnexes(validateTargetClassId)}
                style={{
                  padding: '9px 20px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  background: '#059669',
                  borderColor: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>{isValidating ? '⏳' : '⚡'}</span>
                {isValidating ? 'Validation en cours...' : 'Confirmer & Tout Solder'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* APERÇU AVANT IMPRESSION OFFICIEL */}
      {isPrinting && (
        <FraisAnnexesPrintPreview
          schoolInfo={schoolInfo}
          fraisList={sortedFrais}
          classes={classes}
          classFraisList={classFraisList}
          students={students}
          invoices={invoices}
          printMode={printMode}
          selectedCategoryId={printCategoryId}
          selectedClassId={printClassId}
          onClose={() => setIsPrinting(false)}
        />
      )}
    </div>
  );
};
