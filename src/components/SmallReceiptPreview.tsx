import React, { useEffect } from 'react';

interface SmallReceiptPreviewProps {
  invoice?: any;
  student?: any;
  schoolInfo?: any;
  studentReste?: number;
}

export const SmallReceiptPreview: React.FC<SmallReceiptPreviewProps> = ({ 
  invoice, 
  student, 
  schoolInfo, 
  studentReste = 0 
}) => {

  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' F';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  // Extracting data or falling back to mock data similar to the image
  const schoolName = (schoolInfo?.school_name || schoolInfo?.name) || "GROUPE SCOLAIRE RAYATIL ISLAM";
  const schoolPhone = schoolInfo?.phone || "07 07 42 64 82 / 05 05 91 82 29";
  const academicYear = "2025 / 2026"; // Or from context
  const classNameAr = "روضة الأطفال"; 
  const classNameFr = student?.class?.name || "Mat A";
  const receiptNo = invoice?.id ? invoice.id.split('-')[0].toUpperCase() : "6949";
  const matricule = student?.matricule || "2067";
  const tuition = invoice?.amount || 33000;
  const payment = invoice?.paid_amount || 11000;
  const totalPaid = invoice?.total_paid || 33000; // Or calculate
  const paymentDate = formatDate(invoice?.paid_at || new Date().toISOString());
  const studentName = student ? `${student.first_name} ${student.last_name}` : "سونغالو تراوري";
  const parentName = student?.parent_name || "جاكريجا تراوري";
  const reste = studentReste !== undefined ? studentReste : 0;
  const isSoldé = reste <= 0;
  const nextAppt = formatDate(invoice?.next_appointment || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString());

  return (
    <div className="small-receipt-container" style={{
      width: '100%',
      maxWidth: '300px', // 80mm thermal printer format
      margin: '0 auto',
      padding: '10px',
      backgroundColor: 'white',
      color: 'black',
      fontFamily: '"Courier New", Courier, monospace',
      fontSize: '12px',
      lineHeight: '1.4'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', textTransform: 'uppercase' }}>{schoolName}</h3>
        <div style={{ fontSize: '11px' }}>CEL: {schoolPhone}</div>
        <div style={{ fontSize: '11px' }}>Année Scolaire: {academicYear}</div>
      </div>

      <div style={{ borderBottom: '1px dashed black', margin: '8px 0' }}></div>

      {/* Meta info */}
      <div style={{ fontSize: '11px', marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Date:</span>
          <span>{paymentDate}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Reçu N°:</span>
          <span>{receiptNo}</span>
        </div>
      </div>

      <div style={{ borderBottom: '1px dashed black', margin: '8px 0' }}></div>

      {/* Student info */}
      <div style={{ fontSize: '12px', marginBottom: '8px' }}>
        <div style={{ marginBottom: '4px' }}>
          Matricule: <span style={{ fontWeight: 'bold' }}>{matricule}</span>
        </div>
        <div style={{ marginBottom: '4px' }}>
          Élève: <span style={{ fontWeight: 'bold' }}>{studentName}</span>
        </div>
        <div style={{ marginBottom: '4px' }}>
          Classe: <span style={{ fontWeight: 'bold' }}>{classNameFr}</span> {classNameAr && <span dir="rtl" style={{fontFamily: 'Arial'}}>{classNameAr}</span>}
        </div>
        <div>
          Parent: <span style={{ fontWeight: 'bold' }}>{parentName}</span>
        </div>
      </div>

      <div style={{ borderBottom: '1px dashed black', margin: '8px 0' }}></div>

      {/* Financial info */}
      <div style={{ fontSize: '12px', marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
          <span>Scolarité:</span>
          <span>{formatCurrency(tuition)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px', fontWeight: 'bold', fontSize: '13px' }}>
          <span>Versement:</span>
          <span>{formatCurrency(payment)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
          <span>Total versé:</span>
          <span>{formatCurrency(totalPaid)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', paddingTop: '6px', borderTop: '1px dotted #ccc' }}>
          <span>Reste:</span>
          <span style={{ fontWeight: 'bold' }}>{formatCurrency(reste)}</span>
        </div>
        {isSoldé && (
          <div style={{ textAlign: 'center', marginTop: '8px', fontWeight: 'bold', padding: '4px', border: '1px solid black' }}>
            SOLDÉ
          </div>
        )}
      </div>

      <div style={{ borderBottom: '1px dashed black', margin: '8px 0' }}></div>

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '11px' }}>
        <div style={{ marginBottom: '30px' }}>Signature</div>
        <div style={{ fontWeight: 'bold' }}>Merci de Votre confiance!</div>
        <div style={{ marginTop: '4px' }}>Rendez-vous le: {nextAppt}</div>
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
