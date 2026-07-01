import React, { useEffect } from 'react';

interface ReceiptPreviewProps {
  invoice?: any;
  student?: any;
  schoolInfo?: any;
  studentReste?: number;
}

export const ReceiptPreview: React.FC<ReceiptPreviewProps> = ({ 
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
      maxWidth: '600px', // Wider to fit everything like in the image
      margin: '0 auto',
      padding: '10px',
      backgroundColor: 'white',
      color: 'black',
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
      fontWeight: 'bold',
      fontSize: '14px',
    }}>
      <div style={{
        border: '4px solid black',
        padding: '15px 10px',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '15px' }}>
          <div style={{ fontSize: '18px', textTransform: 'uppercase' }}>{schoolName}</div>
          <div style={{ fontSize: '16px', textTransform: 'uppercase', textDecoration: 'underline', marginTop: '4px', marginBottom: '4px' }}>
            Reçu de Versement de Scolarité
          </div>
          <div style={{ fontSize: '14px', marginTop: '4px' }}>CEL:{schoolPhone}</div>
        </div>

        {/* Row 1: Année Scolaire etc. */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <span>Année Scolaire</span>
            <span>{academicYear}</span>
          </div>
          <div>{classNameFr}</div>
        </div>

        {/* Rows wrapper for table layout for exact alignment */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <tbody>
            {/* Row 2 */}
            <tr>
              <td style={{ textAlign: 'right', paddingRight: '5px' }}>Recus N°:</td>
              <td style={{ textAlign: 'left' }}>{receiptNo}</td>
              <td style={{ textAlign: 'center' }}></td>
              <td style={{ textAlign: 'right', paddingRight: '5px' }}>Matricule:</td>
              <td style={{ textAlign: 'left' }}>{matricule}</td>
            </tr>
            {/* Row 3 */}
            <tr>
              <td style={{ textAlign: 'right', paddingRight: '5px' }}>Scolarite:</td>
              <td style={{ textAlign: 'left' }}>{formatCurrency(scolarite)}</td>
              <td style={{ textAlign: 'center' }}></td>
              <td style={{ textAlign: 'right', paddingRight: '5px' }}>Eleve:</td>
              <td style={{ textAlign: 'left', fontSize: '16px' }} dir="rtl">{studentName}</td>
            </tr>
            {/* Row 4 */}
            <tr>
              <td style={{ textAlign: 'right', paddingRight: '5px' }}>Versement:</td>
              <td style={{ textAlign: 'left' }}>{formatCurrency(versement)}</td>
              <td style={{ textAlign: 'center' }}>{paymentDate}</td>
              <td style={{ textAlign: 'right', paddingRight: '5px' }}>Parent:</td>
              <td style={{ textAlign: 'left', fontSize: '16px' }} dir="rtl">{parentName}</td>
            </tr>
            {/* Row 5 */}
            <tr>
              <td style={{ textAlign: 'right', paddingRight: '5px' }}>Total versé:</td>
              <td style={{ textAlign: 'left' }}>{formatCurrency(totalPaid)}</td>
              <td style={{ textAlign: 'center' }}></td>
              <td colSpan={2} style={{ textAlign: 'center', paddingTop: '10px' }}>
                {isSoldé && <span>Soldé</span>}
              </td>
            </tr>
            {/* Row 6 */}
            <tr>
              <td style={{ textAlign: 'right', paddingRight: '5px' }}>Reste:</td>
              <td style={{ textAlign: 'left' }}>{formatCurrency(reste)}</td>
              <td style={{ textAlign: 'center' }}></td>
              <td colSpan={2} style={{ textAlign: 'center', paddingTop: '5px' }}>
                Signature
              </td>
            </tr>
          </tbody>
        </table>

        {/* Footer */}
        <div style={{ marginTop: '15px', fontSize: '12px' }}>
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
