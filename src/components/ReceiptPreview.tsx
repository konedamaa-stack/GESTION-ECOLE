import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface ReceiptPreviewProps {
  invoice: any;
  student: any;
  schoolInfo: any;
  studentReste?: number;
}

export const ReceiptPreview: React.FC<ReceiptPreviewProps> = ({ invoice, student, schoolInfo, studentReste }) => {
  const { t } = useTranslation();

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
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="receipt-container" style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '40px',
      backgroundColor: 'white',
      color: 'black',
      fontFamily: '"Inter", sans-serif',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #e5e7eb', paddingBottom: '20px', marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {schoolInfo?.logo_url ? (
            <img src={schoolInfo.logo_url} alt="Logo" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
          ) : (
            <div style={{ width: '80px', height: '80px', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', fontSize: '24px', fontWeight: 'bold', color: '#9ca3af' }}>
              LOGO
            </div>
          )}
          <div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '24px', color: '#111827' }}>{schoolInfo?.name || "Nom de l'établissement"}</h1>
            <p style={{ margin: '0 0 4px 0', color: '#4b5563', fontSize: '14px' }}>{schoolInfo?.address || 'Adresse'}</p>
            <p style={{ margin: '0', color: '#4b5563', fontSize: '14px' }}>
              Tél: {schoolInfo?.phone || 'Téléphone'} | Email: {schoolInfo?.email || 'Email'}
            </p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '28px', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('receipt.title', 'REÇU')}</h2>
          <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', fontSize: '16px' }}>N° {invoice?.id ? invoice.id.split('-')[0].toUpperCase() : '...'}</p>
          <p style={{ margin: '0', color: '#4b5563' }}>Date: {formatDate(invoice?.paid_at || new Date().toISOString())}</p>
        </div>
      </div>

      {/* Body */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '30px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#64748b', textTransform: 'uppercase' }}>Détails de l'Élève</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <p style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '14px' }}>Nom et Prénom</p>
              <p style={{ margin: '0', fontWeight: 'bold', fontSize: '16px', color: '#0f172a' }}>{student?.first_name} {student?.last_name}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '14px' }}>Classe</p>
              <p style={{ margin: '0', fontWeight: 'bold', fontSize: '16px', color: '#0f172a' }}>{student?.class?.name || '-'}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '14px' }}>Matricule</p>
              <p style={{ margin: '0', fontWeight: 'bold', fontSize: '16px', color: '#0f172a' }}>{student?.matricule || '-'}</p>
            </div>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f1f5f9' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '2px solid #cbd5e1', color: '#475569' }}>Description</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '2px solid #cbd5e1', color: '#475569' }}>Montant</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', color: '#334155' }}>
                {invoice?.title || 'Frais de scolarité'}
              </td>
              <td style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', textAlign: 'right', fontWeight: '500', color: '#0f172a' }}>
                {formatCurrency(invoice?.amount || 0)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '300px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
              {studentReste !== undefined && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid #e2e8f0' }}>
                <span style={{ color: '#ef4444', fontSize: '14px' }}>Reste à Payer:</span>
                <span style={{ fontWeight: '500', color: '#ef4444', fontSize: '14px' }}>{formatCurrency(studentReste)}</span>
              </div>
            )}
            <span style={{ color: '#475569' }}>Montant Dû:</span>
              <span style={{ fontWeight: '500' }}>{formatCurrency(invoice?.amount || 0)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '2px solid #cbd5e1', borderBottom: '2px solid #cbd5e1', marginTop: '10px' }}>
              <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#0f172a' }}>TOTAL PAYÉ</span>
              <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#3b82f6' }}>{formatCurrency(invoice?.paid_amount || invoice?.amount || 0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '14px' }}>
        <div>
          <p style={{ margin: '0 0 40px 0' }}>Signature Établissement</p>
          <div style={{ borderBottom: '1px solid #cbd5e1', width: '200px' }}></div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: '0 0 40px 0' }}>Signature Parent / Élève</p>
          <div style={{ borderBottom: '1px solid #cbd5e1', width: '200px', display: 'inline-block' }}></div>
        </div>
      </div>

      <div style={{ marginTop: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
        <p style={{ margin: '0' }}>Ce reçu certifie le paiement par le système de gestion {schoolInfo?.name || ''}.</p>
      </div>

      <style dangerouslySetInnerHTML={{__html: "@media print { body * { visibility: hidden; } .receipt-container, .receipt-container * { visibility: visible; } .receipt-container { position: absolute; left: 0; top: 0; width: 100%; padding: 20px !important; box-shadow: none !important; } .hide-print { display: none !important; } }"}} />
    </div>
  );
};
