import React, { useEffect } from 'react';

interface ReceiptPreviewProps {
  invoice?: any;
  student?: any;
  schoolInfo?: any;
  studentReste?: number;
  invoicesData?: any[];
}

export const ReceiptPreview: React.FC<ReceiptPreviewProps> = ({ 
  invoice, 
  student, 
  schoolInfo, 
  studentReste = 0,
  invoicesData = []
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

  // Calcul du numéro de versement
  let installmentNum = 1;
  if (invoicesData.length > 0 && invoice && student) {
    const studentInvoices = invoicesData
      .filter((inv: any) => inv.student_id === student.id && (inv.status === 'Payée' || inv.id === invoice.id))
      .sort((a: any, b: any) => new Date(a.issue_date || a.paid_at || 0).getTime() - new Date(b.issue_date || b.paid_at || 0).getTime());
    
    const index = studentInvoices.findIndex((inv: any) => inv.id === invoice.id);
    if (index !== -1) {
      installmentNum = index + 1;
    } else {
      installmentNum = studentInvoices.length + 1;
    }
  }

  const getOrdinal = (n: number) => {
    if (n === 1) return '1er';
    return `${n}ème`;
  };
  
  const versementText = `${getOrdinal(installmentNum)} Versement`;
  const versementLabel = `${versementText}:`;

  // Extracting data or falling back to mock data similar to the image
  const schoolName = schoolInfo?.name || "ÉTABLISSEMENT SCOLAIRE";
  const schoolPhone = schoolInfo?.phone || "00 00 00 00 00";
  const academicYear = schoolInfo?.academic_year || new Date().getFullYear() + " / " + (new Date().getFullYear() + 1);
  const classNameFr = student?.class?.name || student?.classes?.name || "-";
  const receiptNo = invoice?.id ? invoice.id.split('-')[0].toUpperCase() : "-";
  const matricule = student?.matricule || "-";
  
  // Calculs financiers
  const scolarite = Number(student?.tuition_fee) || Number(student?.classes?.tuition_fee) || Number(invoice?.amount) || 0;
  const versement = invoice?.paid_amount !== undefined ? Number(invoice.paid_amount) : (Number(invoice?.amount) || 0);
  const reste = studentReste !== undefined ? Number(studentReste) : 0;
  const totalPaid = Math.max(0, scolarite - reste);
  
  const paymentDate = formatDate(invoice?.paid_at || new Date().toISOString());
  const studentName = student ? `${student.first_name} ${student.last_name}` : "Nom de l'élève";
  const parentName = student?.parent_name || "-";
  const isSoldé = reste <= 0;
  let defaultApptDate = new Date(invoice?.paid_at || new Date());
  defaultApptDate.setMonth(defaultApptDate.getMonth() + 2);
  const nextAppt = formatDate(invoice?.next_appointment || defaultApptDate.toISOString());

  return (
    <div className="receipt-container" style={{
      width: '100%',
      maxWidth: '100%',
      margin: '0 auto',
      padding: '10px',
      backgroundColor: 'white',
      color: 'black',
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
      fontWeight: 'bold',
      fontSize: '14px',
    }}>
      <div style={{
        border: '2px solid black',
        padding: '5px',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
          <div style={{ width: '60px', height: '60px' }}>
            <img src={schoolInfo?.logo_url || '/logo-coran.jpg'} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div style={{ textAlign: 'center', flex: 1, padding: '0 5px', lineHeight: '1.2' }}>
            <div style={{ fontSize: '16px', textTransform: 'uppercase', fontWeight: 'bold' }}>{schoolName}</div>
            <div style={{ fontSize: '14px', textTransform: 'uppercase', textDecoration: 'underline', margin: '2px 0' }}>
              Reçu de {versementText} de Scolarité
            </div>
            <div style={{ fontSize: '12px' }}>CEL: {schoolPhone}</div>
          </div>
          <div style={{ width: '60px' }}></div>
        </div>

        {/* Row 1: Année Scolaire etc. */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', fontSize: '12px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span>Année Scolaire:</span>
            <span>{academicYear}</span>
          </div>
          <div>Classe: {classNameFr}</div>
        </div>

        {/* Rows wrapper for table layout for exact alignment */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', lineHeight: '1.2' }}>
          <tbody>
            <tr>
              <td style={{ textAlign: 'right', paddingRight: '5px', paddingBottom: '2px' }}>Recus N°:</td>
              <td style={{ textAlign: 'left', paddingBottom: '2px' }}>{receiptNo}</td>
              <td style={{ textAlign: 'center', paddingBottom: '2px' }}></td>
              <td style={{ textAlign: 'right', paddingRight: '5px', paddingBottom: '2px' }}>Matricule:</td>
              <td style={{ textAlign: 'left', paddingBottom: '2px' }}>{matricule}</td>
            </tr>
            <tr>
              <td style={{ textAlign: 'right', paddingRight: '5px', paddingBottom: '2px' }}>Scolarite:</td>
              <td style={{ textAlign: 'left', paddingBottom: '2px' }}>{formatCurrency(scolarite)}</td>
              <td style={{ textAlign: 'center', paddingBottom: '2px' }}></td>
              <td style={{ textAlign: 'right', paddingRight: '5px', paddingBottom: '2px' }}>Eleve:</td>
              <td style={{ textAlign: 'left', fontSize: '13px', paddingBottom: '2px' }} dir="rtl">{studentName}</td>
            </tr>
            <tr>
              <td style={{ textAlign: 'right', paddingRight: '5px', paddingBottom: '2px' }}>{versementLabel}</td>
              <td style={{ textAlign: 'left', paddingBottom: '2px' }}>{formatCurrency(versement)}</td>
              <td style={{ textAlign: 'center', paddingBottom: '2px' }}>{paymentDate}</td>
              <td style={{ textAlign: 'right', paddingRight: '5px', paddingBottom: '2px' }}>Parent:</td>
              <td style={{ textAlign: 'left', fontSize: '13px', paddingBottom: '2px' }} dir="rtl">{parentName}</td>
            </tr>
            <tr>
              <td style={{ textAlign: 'right', paddingRight: '5px', paddingBottom: '2px' }}>Total versé:</td>
              <td style={{ textAlign: 'left', paddingBottom: '2px' }}>{formatCurrency(totalPaid)}</td>
              <td style={{ textAlign: 'center', paddingBottom: '2px' }}></td>
              <td colSpan={2} style={{ textAlign: 'center', paddingTop: '4px', paddingBottom: '2px' }}>
                {isSoldé && <span>Soldé</span>}
              </td>
            </tr>
            <tr>
              <td style={{ textAlign: 'right', paddingRight: '5px', paddingBottom: '2px' }}>Reste:</td>
              <td style={{ textAlign: 'left', paddingBottom: '2px' }}>{formatCurrency(reste)}</td>
              <td style={{ textAlign: 'center', paddingBottom: '2px' }}></td>
              <td colSpan={2} style={{ textAlign: 'center', paddingTop: '8px' }}>
                <div style={{ textDecoration: 'underline' }}>Le Directeur</div>
                <div style={{ marginTop: '20px', fontWeight: 'bold' }}>{schoolInfo?.director_name || "La Direction"}</div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Footer */}
        <div style={{ marginTop: '8px', fontSize: '10px', textAlign: 'center' }}>
          Merci de Votre confiance! Rendez Vous le: {nextAppt}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          .receipt-container, .receipt-container * { visibility: visible; }
          .receipt-container { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%;
            max-width: 100%;
            padding: 0 !important;
          }
          .hide-print { display: none !important; }
        }
      `}} />
    </div>
  );
};
