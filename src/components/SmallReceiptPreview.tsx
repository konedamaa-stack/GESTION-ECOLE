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
          <div style={{ fontSize: '14px', marginTop: '4px' }}>CEL:{schoolPhone}</div>
        </div>

        {/* Row 1: Année Scolaire etc. */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <span>Année Scolaire</span>
            <span>{academicYear}</span>
          </div>
          <div style={{ fontSize: '16px', fontFamily: 'Arial, sans-serif' }} dir="rtl">
            {classNameAr}
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
              <td style={{ textAlign: 'left' }}>{formatCurrency(tuition)}</td>
              <td style={{ textAlign: 'center' }}></td>
              <td style={{ textAlign: 'right', paddingRight: '5px' }}>Eleve:</td>
              <td style={{ textAlign: 'left', fontSize: '16px' }} dir="rtl">{studentName}</td>
            </tr>
            {/* Row 4 */}
            <tr>
              <td style={{ textAlign: 'right', paddingRight: '5px' }}>Versement:</td>
              <td style={{ textAlign: 'left' }}>{formatCurrency(payment)}</td>
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
          .small-receipt-container, .small-receipt-container * { visibility: visible; }
          .small-receipt-container { 
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
