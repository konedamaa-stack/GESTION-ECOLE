import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface SmallReceiptPreviewProps {
  invoice?: any;
  student?: any;
  schoolInfo?: any;
  studentReste?: number;
  invoicesData?: any[];
  onClose?: () => void;
}

export const SmallReceiptPreview: React.FC<SmallReceiptPreviewProps> = ({ 
  invoice, 
  student, 
  schoolInfo, 
  studentReste = 0,
  invoicesData = [],
  onClose
}) => {
  const { i18n } = useTranslation();
  const isAr = i18n.language.startsWith('ar');

  const getArabicOrdinal = (n: number) => {
    if (n === 1) return 'الدفعة الأولى';
    if (n === 2) return 'الدفعة الثانية';
    if (n === 3) return 'الدفعة الثالثة';
    return `الدفعة ${n}`;
  };

  useEffect(() => {
    const handleAfterPrint = () => {
      if (onClose) {
        onClose();
      }
    };
    window.addEventListener('afterprint', handleAfterPrint);

    const timer = setTimeout(() => {
      window.print();
    }, 500);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, [onClose]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' F';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  // Helper pour identifier les factures de Frais Annexes
  const isFraisAnnexe = (inv: any) => {
    if (!inv) return false;
    if (inv.invoice_number && String(inv.invoice_number).includes('FAC-ANNEXE')) return true;
    const m = (inv.motif || '').toLowerCase().trim();
    if (m.includes('scolarité') || m.includes('scolarite')) return false;
    return (
      m.includes('bulletin') ||
      m.includes('tricot') ||
      m.includes('polo') ||
      m.includes('macaron') ||
      m.includes('badge') ||
      m.includes('assurance') ||
      m.includes('annexe')
    );
  };

  // Calcul du numéro de versement (scolarité uniquement)
  let installmentNum = 1;
  if (invoicesData.length > 0 && invoice && student) {
    const scolariteInvoices = invoicesData
      .filter((inv: any) => inv.student_id === student.id && (inv.status === 'Payée' || inv.id === invoice.id) && !isFraisAnnexe(inv))
      .sort((a: any, b: any) => new Date(a.issue_date || a.paid_at || 0).getTime() - new Date(b.issue_date || b.paid_at || 0).getTime());
    
    const index = scolariteInvoices.findIndex((inv: any) => inv.id === invoice.id);
    if (index !== -1) {
      installmentNum = index + 1;
    } else {
      installmentNum = Math.max(1, scolariteInvoices.length + 1);
    }
  }

  const isFirstInstallment = installmentNum === 1;

  // Calcul du montant global des frais annexes pour l'élève
  const fraisAnnexesTotal = invoice?.frais_annexes_amount !== undefined
    ? Number(invoice.frais_annexes_amount)
    : (invoicesData || [])
        .filter((inv: any) => inv.student_id === student?.id && inv.status === 'Payée' && isFraisAnnexe(inv))
        .reduce((sum: number, inv: any) => sum + (Number(inv.paid_amount !== undefined && inv.paid_amount !== null ? inv.paid_amount : inv.amount) || 0), 0);

  const getOrdinal = (n: number) => {
    if (n === 1) return '1er';
    return `${n}ème`;
  };
  
  const versementText = `${getOrdinal(installmentNum)} Versement`;
  const versementLabel = `${versementText}:`;

  const schoolName = schoolInfo?.school_name || schoolInfo?.name || "ÉTABLISSEMENT SCOLAIRE";
  let schoolPhone = schoolInfo?.phone || "00 00 00 00 00";
  schoolPhone = schoolPhone.replace(/^(cel|tel|tél|téléphone|phone)[:.\s]+/i, '');
  const academicYear = schoolInfo?.academic_year || new Date().getFullYear() + " / " + (new Date().getFullYear() + 1);
 
  const classNameFr = student?.class?.name || student?.classes?.name || "-";
  const receiptNo = invoice?.id ? invoice.id.split('-')[0].toUpperCase() : "-";
  const matricule = student?.matricule || "-";
  
  // Calculs financiers
  const scolarite = Number(student?.tuition_fee) || (student?.affecte === 'Affecté' ? Number(student?.classes?.tuition_fee_affecte) : Number(student?.classes?.tuition_fee)) || Number(invoice?.amount) || 0;
  const versementScolarite = invoice?.paid_amount !== undefined ? Number(invoice.paid_amount) : (Number(invoice?.amount) || 0);
  const totalDonneAuCaissier = isFirstInstallment && fraisAnnexesTotal > 0
    ? (invoice?.total_amount_given !== undefined ? Number(invoice.total_amount_given) : (versementScolarite + fraisAnnexesTotal))
    : versementScolarite;
  const reste = studentReste !== undefined ? Number(studentReste) : 0;
  const totalPaid = Math.max(0, scolarite - reste);

  const paymentDate = formatDate(invoice?.paid_at || new Date().toISOString());
  const studentName = student ? `${student.first_name} ${student.last_name}` : "Nom de l'élève";
  const parentObj = student?.student_parents && student.student_parents.length > 0 ? student.student_parents[0].parents : null;
  const parentName = parentObj ? `${parentObj.first_name} ${parentObj.last_name}` : (student?.parent_name || "-");
  const isSoldé = reste <= 0;
  let defaultApptDate = new Date(invoice?.paid_at || new Date());
  defaultApptDate.setMonth(defaultApptDate.getMonth() + 2);
  const nextAppt = formatDate(invoice?.next_appointment || defaultApptDate.toISOString());

  // Détermination intelligente du titre du caissier (Le Caissier / La Caissière / أمين الصندوق / أمينة الصندوق)
  const isMaleCashier = (() => {
    if (schoolInfo?.cashier_title) {
      return schoolInfo.cashier_title.toLowerCase().includes('caissier') && !schoolInfo.cashier_title.toLowerCase().includes('caissière');
    }
    const cashierName = (schoolInfo?.cashier_name || '').toLowerCase();
    if (cashierName.startsWith('mr') || cashierName.includes('monsieur') || cashierName.includes('m.') || cashierName.includes('alassane') || cashierName.includes('camara')) return true;
    const schoolNameStr = (schoolInfo?.school_name || schoolInfo?.name || '').toLowerCase();
    if (schoolNameStr.includes('راية') || schoolNameStr.includes('raya')) return true;
    return false;
  })();

  const cashierLabel = isAr 
    ? (isMaleCashier ? 'أمين الصندوق' : 'أمينة الصندوق') 
    : (isMaleCashier ? 'Le Caissier' : (schoolInfo?.cashier_title || 'La Caissière'));

  return (
    <div className="small-receipt-container" style={{
      width: '100%',
      maxWidth: '300px', // 80mm thermal printer format
      margin: '0 auto',
      padding: '10px',
      backgroundColor: 'white',
      color: 'black',
      fontFamily: isAr ? "'Traditional Arabic', 'Cairo', 'Tajawal', serif" : '"Courier New", Courier, monospace',
      fontSize: isAr ? '14px' : '12px',
      lineHeight: '1.4'
    }} dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <div style={{ width: '55px', height: '55px', margin: '0 auto 6px' }}>
          <img src={schoolInfo?.logo_url || '/logo-coran.jpg'} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <h3 style={{ margin: '0 0 5px 0', fontSize: '15px', textTransform: 'uppercase', fontWeight: 'bold' }}>{schoolName}</h3>
        <div style={{ fontSize: '12px', fontWeight: 'bold', textDecoration: 'underline', margin: '3px 0' }}>
          {isAr ? `وصل تسديد ${getArabicOrdinal(installmentNum)} للمصاريف` : `Reçu de ${versementText}`}
        </div>
        <div style={{ fontSize: '11px' }}>{isAr ? 'الهاتف:' : 'CEL:'} {schoolPhone}</div>
        <div style={{ fontSize: '11px' }}>{isAr ? 'السنة الدراسية:' : 'Année Scolaire:'} {academicYear}</div>
      </div>

      <div style={{ borderBottom: '1px dashed black', margin: '8px 0' }}></div>

      {/* Meta info */}
      <div style={{ fontSize: isAr ? '13px' : '11px', marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexDirection: isAr ? 'row-reverse' : 'row' }}>
          <span>{isAr ? 'التاريخ:' : 'Date:'}</span>
          <span>{paymentDate}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexDirection: isAr ? 'row-reverse' : 'row' }}>
          <span>{isAr ? 'رقم الوصل:' : 'Reçu N°:'}</span>
          <span>{receiptNo}</span>
        </div>
      </div>

      <div style={{ borderBottom: '1px dashed black', margin: '8px 0' }}></div>

      {/* Student info */}
      <div style={{ fontSize: '12px', marginBottom: '8px' }}>
        <div style={{ display: 'flex', flexDirection: isAr ? 'row-reverse' : 'row', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span>{isAr ? 'رقم التسجيل:' : 'Matricule:'}</span>
          <span style={{ fontWeight: 'bold' }}>{matricule}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: isAr ? 'row-reverse' : 'row', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span>{isAr ? 'التلميذ(ة):' : 'Élève:'}</span>
          <span style={{ fontWeight: 'bold' }}>{studentName}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: isAr ? 'row-reverse' : 'row', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span>{isAr ? 'القسم:' : 'Classe:'}</span>
          <span style={{ fontWeight: 'bold' }}>{classNameFr}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: isAr ? 'row-reverse' : 'row', justifyContent: 'space-between' }}>
          <span>{isAr ? 'ولي الأمر:' : 'Parent:'}</span>
          <span style={{ fontWeight: 'bold' }}>{parentName}</span>
        </div>
      </div>

      <div style={{ borderBottom: '1px dashed black', margin: '8px 0' }}></div>

      {/* Financial info */}
      <div style={{ fontSize: '12px', marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px', flexDirection: isAr ? 'row-reverse' : 'row' }}>
          <span>{isAr ? 'المصاريف:' : 'Scolarité:'}</span>
          <span>{formatCurrency(scolarite)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px', fontWeight: 'bold', fontSize: isAr ? '14px' : '12px', flexDirection: isAr ? 'row-reverse' : 'row' }}>
          <span>{isAr ? `${getArabicOrdinal(installmentNum)}:` : versementLabel}</span>
          <span>{formatCurrency(versementScolarite)}</span>
        </div>

        {/* LIGNE FRAIS ANNEXES & TOTAL REMIS AU CAISSIER : VISIBLE UNIQUEMENT SUR LE 1ER REÇU ! */}
        {isFirstInstallment && fraisAnnexesTotal > 0 && (
          <div style={{ borderTop: '1px dashed #cbd5e1', borderBottom: '1px dashed #cbd5e1', padding: '3px 0', margin: '4px 0', background: '#f8fafc' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px', color: '#047857', flexDirection: isAr ? 'row-reverse' : 'row' }}>
              <span>{isAr ? 'رسوم الملحقات:' : 'Frais Annexes (Tenues/Bull.):'}</span>
              <span style={{ fontWeight: 'bold' }}>{formatCurrency(fraisAnnexesTotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '13px', color: '#1e40af', flexDirection: isAr ? 'row-reverse' : 'row' }}>
              <span>{isAr ? 'المبلغ المسلم للصندوق:' : 'TOTAL VERSÉ CE JOUR:'}</span>
              <span>{formatCurrency(totalDonneAuCaissier)}</span>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px', flexDirection: isAr ? 'row-reverse' : 'row' }}>
          <span>{isAr ? 'إجمالي المدفوع:' : 'Total versé scolarité:'}</span>
          <span>{formatCurrency(totalPaid)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', paddingTop: '6px', borderTop: '1px dotted #ccc', flexDirection: isAr ? 'row-reverse' : 'row' }}>
          <span>{isAr ? 'المتبقي:' : 'Reste scolarité:'}</span>
          <span style={{ fontWeight: 'bold' }}>{formatCurrency(reste)}</span>
        </div>
        {isSoldé && (
          <div style={{ textAlign: 'center', marginTop: '8px', fontWeight: 'bold', padding: '4px', border: '1px solid black' }}>
            {isAr ? 'خالص' : 'SOLDÉ'}
          </div>
        )}
      </div>

      <div style={{ borderBottom: '1px dashed black', margin: '8px 0' }}></div>

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '11px' }}>
        <div style={{ marginBottom: '4px', textDecoration: 'underline', fontWeight: 'bold' }}>{cashierLabel}</div>
        <div style={{ marginBottom: '25px', fontSize: '10px' }}>{schoolInfo?.cashier_name || (isAr ? 'الإدارة / الصندوق' : 'La Caisse')}</div>
        <div style={{ fontWeight: 'bold' }}>{isAr ? 'شكراً لثقتكم!' : 'Merci de Votre confiance!'}</div>
        <div style={{ marginTop: '4px' }}>{isAr ? ('موعدنا القادم يوم: ' + nextAppt) : ('Rendez-vous le: ' + nextAppt)}</div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          /* 1. Hide the main app layout entirely */
          .sidebar, .main-content, .sidebar-overlay {
            display: none !important;
          }
          
          /* 2. Reset the app container and body to auto height */
          html, body, #root, .app-container {
            height: auto !important;
            min-height: 0 !important;
            width: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            background: white !important;
            display: block !important;
          }
          
          /* 3. Reset the modal overlay and content so they don't force full screen */
          .modal-overlay, .modal-content {
            position: static !important;
            height: auto !important;
            width: auto !important;
            max-width: none !important;
            max-height: none !important;
            margin: 0 !important;
            padding: 0 !important;
            background: none !important;
            box-shadow: none !important;
            border: none !important;
            display: block !important;
            transform: none !important;
          }
          
          /* 4. Hide headers and controls */
          .modal-header, .print-controls, .hide-print {
            display: none !important;
          }
          
          .receipt-preview-container-wrapper, .receipt-preview-printable {
            padding: 0 !important;
            margin: 0 !important;
            background: transparent !important;
            box-shadow: none !important;
            border: none !important;
            height: auto !important;
            overflow: visible !important;
          }
          
          /* 5. Finally, style the receipt itself */
          .small-receipt-container { 
            position: static !important;
            width: 80mm !important; 
            max-width: 80mm !important;
            margin: 0 !important;
            padding: 5mm !important; /* Some padding so it doesn't touch the exact edge */
            box-sizing: border-box !important;
            page-break-inside: avoid !important;
          }
          
          @page {
            margin: 0;
            size: 80mm auto; /* Thermal printer continuous roll */
          }
        }
      `}} />
    </div>
  );
};
