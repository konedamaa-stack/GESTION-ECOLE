import React, { useEffect } from 'react';

interface TeacherReceiptPreviewProps {
  payment: any;
  teacher: any;
  schoolInfo: any;
}

export const TeacherReceiptPreview: React.FC<TeacherReceiptPreviewProps> = ({ payment, teacher, schoolInfo }) => {
  useEffect(() => {
    // Déclenche l'impression automatiquement après un court délai pour laisser le CSS se charger
    const timer = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const formatNum = (num: number | string) => {
    return Number(num).toLocaleString('fr-FR');
  };

  const numberToWordsFr = (num: number): string => {
    if (num === 0) return 'ZÉRO';
    const units = ['', 'UN', 'DEUX', 'TROIS', 'QUATRE', 'CINQ', 'SIX', 'SEPT', 'HUIT', 'NEUF', 'DIX', 'ONZE', 'DOUZE', 'TREIZE', 'QUATORZE', 'QUINZE', 'SEIZE', 'DIX-SEPT', 'DIX-HUIT', 'DIX-NEUF'];
    const tens = ['', '', 'VINGT', 'TRENTE', 'QUARANTE', 'CINQUANTE', 'SOIXANTE', 'SOIXANTE-DIX', 'QUATRE-VINGT', 'QUATRE-VINGT-DIX'];

    function convert(n: number): string {
      if (n < 20) return units[n];
      if (n < 70) return tens[Math.floor(n / 10)] + (n % 10 === 1 ? ' ET UN' : (n % 10 !== 0 ? '-' + units[n % 10] : ''));
      if (n < 80) return tens[6] + '-' + (n % 10 === 1 ? 'ET-ONZE' : convert(10 + n % 10));
      if (n < 90) return 'QUATRE-VINGT' + (n % 10 !== 0 ? '-' + units[n % 10] : 'S');
      if (n < 100) return 'QUATRE-VINGT-' + convert(10 + n % 10);
      if (n < 1000) return (n >= 200 ? units[Math.floor(n / 100)] + ' ' : '') + 'CENT' + (n % 100 !== 0 ? ' ' + convert(n % 100) : (n >= 200 ? 'S' : ''));
      if (n < 1000000) return (n >= 2000 ? convert(Math.floor(n / 1000)) + ' ' : (n >= 1000 ? '' : '')) + 'MILLE' + (n % 1000 !== 0 ? ' ' + convert(n % 1000) : '');
      if (n < 1000000000) return convert(Math.floor(n / 1000000)) + ' MILLION' + (Math.floor(n / 1000000) > 1 ? 'S' : '') + (n % 1000000 !== 0 ? ' ' + convert(n % 1000000) : '');
      return n.toString();
    }
    
    return convert(num).trim();
  };

  const paymentDate = new Date(payment.payment_date || new Date());
  const formattedDate = paymentDate.toLocaleDateString('fr-FR');
  const formattedTime = paymentDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const paymentMethod = (payment.payment_method || '').toLowerCase();

  return (
    <div className="receipt-preview-container" style={{
      width: '100%',
      maxWidth: '320px',
      margin: '0 auto',
      background: 'white',
      color: '#000',
      padding: '20px',
      boxSizing: 'border-box',
      fontFamily: '"Courier New", Courier, monospace',
      fontWeight: 'bold',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      WebkitPrintColorAdjust: 'exact',
      printColorAdjust: 'exact'
    }}>
      {/* HEADER */}
      <div style={{ textAlign: 'center', marginBottom: '15px' }}>
        <h1 style={{ 
          margin: '0 0 10px 0', 
          fontSize: '18px', 
          fontWeight: '900', 
          fontFamily: 'Arial, sans-serif',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z" />
            <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
            <path d="M12 17V7" />
          </svg>
          REÇU DE SALAIRE
        </h1>
        <div style={{ fontWeight: 'bold', fontSize: '11px', letterSpacing: '0.5px' }}>{schoolInfo?.name?.toUpperCase() || 'INSTITUTION ACADÉMIQUE'}</div>
        <div style={{ fontSize: '10px', marginTop: '4px' }}>{schoolInfo?.address || 'Adresse de l\'école'}</div>
      </div>

      <hr style={{ borderTop: '2px solid black', margin: '12px 0' }} />

      {/* METADATA */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
        <div style={{ color: '#000' }}>DATE</div>
        <div style={{ color: '#000' }}>HEURE</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold' }}>
        <div>{formattedDate}</div>
        <div>{formattedTime}</div>
      </div>

      <hr style={{ borderTop: '2px solid black', margin: '12px 0' }} />

      {/* RECIPIENT */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', marginBottom: '15px' }}>
        <span>Versé à :</span>
        <span style={{ fontWeight: 'bold', fontSize: '13px' }}>{(teacher.first_name + ' ' + teacher.last_name).toUpperCase()}</span>
        <span style={{ fontSize: '11px' }}>Mati\u00E8re : {teacher.subject || 'N/A'}</span>
      </div>

      {/* AMOUNT BOX */}
      <div style={{ 
        background: 'var(--accent-color)', 
        color: 'white', 
        padding: '12px 15px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '15px'
      }}>
        <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '12px', letterSpacing: '1px' }}>MONTANT</div>
        <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '20px', fontWeight: 'bold' }}>{formatNum(payment.amount)} FCFA</div>
      </div>

      {/* AMOUNT IN WORDS */}
      <div style={{ fontSize: '11px', marginBottom: '15px' }}>
        <div style={{ fontStyle: 'italic', color: '#000', marginBottom: '4px' }}>SOIT LA SOMME DE :</div>
        <div style={{ fontWeight: 'bold', letterSpacing: '0.5px', lineHeight: '1.4' }}>
          {numberToWordsFr(Number(payment.amount))} FRANCS CFA
        </div>
      </div>

      <hr style={{ borderTop: '1px solid black', margin: '12px 0' }} />

      {/* MOTIF & MONTH */}
      <div style={{ fontSize: '11px', marginBottom: '15px' }}>
        <div style={{ marginBottom: '6px' }}>Mois Payé : <span style={{ fontWeight: 'bold', fontSize: '12px' }}>{payment.month}</span></div>
        <div style={{ marginBottom: '6px' }}>Motif :</div>
        <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{payment.motif || `Salaire ${payment.month}`}</div>
      </div>

      <hr style={{ borderTop: '1px solid black', margin: '12px 0' }} />

      {/* PAYMENT METHOD */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {['virement', 'mobile'].some(v => paymentMethod.includes(v)) ? '☑' : '☐'} Virement
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {['espèce', 'espece', 'cash'].some(v => paymentMethod.includes(v)) ? '☑' : '☐'} Espèces
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {paymentMethod.includes('chèque') || paymentMethod.includes('cheque') ? '☑' : '☐'} Chèque
        </div>
      </div>

      {/* SIGNATURE SPACE */}
      <div style={{ marginTop: '35px', display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontStyle: 'italic', color: '#000', fontSize: '11px' }}>Signature Enseignanté</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontStyle: 'italic', color: '#000', fontSize: '11px' }}>Cachet / Dir.</div>
        </div>
      </div>
    </div>
  );
};
