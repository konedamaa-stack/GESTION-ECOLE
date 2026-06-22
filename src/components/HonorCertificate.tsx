import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useTranslation } from 'react-i18next';

interface HonorCertificateProps {
  student: any;
  schoolInfo: any;
  period: string;
  average: number;
  mention: string;
  onClose: () => void;
}

export function HonorCertificate({ student, schoolInfo, period, average, mention, onClose }: HonorCertificateProps) {
  const { t } = useTranslation();
  const printRef = useRef<HTMLDivElement>(null);
  const isGenerating = React.useRef(false);

  const handleDownload = async () => {
    if (!printRef.current || isGenerating.current) return;
    isGenerating.current = true;
    try {
      const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      pdf.addImage(imgData, 'PNG', 0, 0, 297, 210);
      pdf.save(`Tableau_Honneur_${student.first_name}_${student.last_name}.pdf`);
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la génération du PDF");
    } finally {
      isGenerating.current = false;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const today = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
  const city = schoolInfo?.city || 'Divo';
  const academicYear = schoolInfo?.academic_year || '2025-2026';
  const signerName = schoolInfo?.honor_certificate_signer || schoolInfo?.studies_director_name || 'SANOGO OUMAR';
  
  return (
    <div className="receipt-preview-container-wrapper" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', zIndex: 10000, display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto', padding: '20px' }}>
      <div className="print-controls" style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button className="btn btn-outline" style={{ background: 'white', color: 'black' }} onClick={onClose}>Fermer</button>
        <button className="btn btn-primary" onClick={handlePrint}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg> Imprimer</button>
        <button className="btn btn-primary" onClick={handleDownload}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round"/><polyline points="7 10 12 15 17 10" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="15" x2="12" y2="3" strokeLinecap="round" strokeLinejoin="round"/></svg> Télécharger PDF</button>
      </div>

      <div ref={printRef} className="honor-certificate-page" style={{ 
        width: '297mm', 
        height: '210mm', 
        backgroundColor: '#fff', 
        position: 'relative',
        boxSizing: 'border-box',
        padding: '12mm',
        overflow: 'hidden',
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
      }}>
        {/* Ivorian Borders */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, border: '8mm solid #009e60', pointerEvents: 'none' }}></div>
        <div style={{ position: 'absolute', top: '8mm', left: '8mm', right: '8mm', bottom: '8mm', border: '4mm solid #fff', pointerEvents: 'none' }}></div>
        <div style={{ position: 'absolute', top: '12mm', left: '12mm', right: '12mm', bottom: '12mm', border: '8mm solid #f77f00', pointerEvents: 'none' }}></div>
        
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: '15mm', boxSizing: 'border-box', textAlign: 'center' }}>
          
          {/* HEADER */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: '11px', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ width: '30%', textAlign: 'center' }}>
              MINISTERE DE L'EDUCATION NATIONALE, DE<br/>L'ALPHABETISATION ET DE L'ENSEIGNEMENT<br/>TECHNIQUE
            </div>
            <div style={{ width: '40%', textAlign: 'center' }}>
              REPUBLIQUE DE COTE D'IVOIRE<br/>
              <span style={{ fontWeight: 'normal', fontSize: '10px' }}>Union - Discipline - Travail</span><br/>
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Coat_of_arms_of_Ivory_Coast.svg/200px-Coat_of_arms_of_Ivory_Coast.svg.png" alt="Armoiries" style={{ width: '60px', marginTop: '10px' }}/>
            </div>
            <div style={{ width: '30%', textAlign: 'center' }}>
              {schoolInfo?.school_name?.toUpperCase() || "COLLEGE PRIVE ELISCHAMA DE DIVO"}<br/>
              {schoolInfo?.logo_url ? <img src={schoolInfo.logo_url} alt="Logo" style={{ width: '60px', marginTop: '10px' }}/> : null}
            </div>
          </div>

          {/* TITLE */}
          <div style={{ margin: '40px 0' }}>
            <div style={{ fontSize: '24px', color: '#d4af37', letterSpacing: '5px' }}>〰️〰️〰️〰️〰️〰️</div>
            <h1 style={{ 
              fontSize: '56px', 
              margin: '15px 0', 
              color: '#fff', 
              textShadow: '2px 2px 0 #b8860b, -1px -1px 0 #b8860b, 1px -1px 0 #b8860b, -1px 1px 0 #b8860b, 1px 1px 0 #b8860b, 0px 4px 15px rgba(0,0,0,0.4)',
              fontFamily: '"Times New Roman", Times, serif',
              letterSpacing: '3px'
            }}>Tableau d'honneur</h1>
            <div style={{ fontSize: '24px', color: '#d4af37', letterSpacing: '5px' }}>〰️〰️〰️〰️〰️〰️</div>
          </div>

          {/* BODY */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 50px' }}>
            <p style={{ fontSize: '20px', lineHeight: '2.0', textAlign: 'justify', fontFamily: 'Arial, sans-serif' }}>
              L'élève <strong>{student.first_name?.toUpperCase()} {student.last_name?.toUpperCase()}</strong> Matricule <strong>{student.matricule}</strong> en classe de <strong>{student.classes?.name || '...'}</strong> ayant obtenu une moyenne de <strong>{average.toFixed(2).replace('.', ',')}</strong> est inscrit(e) au <strong>Tableau d'Honneur {mention && `+ ${mention}`}</strong> pour sa bonne conduite et son travail durant le {period} de l'année scolaire <strong>{academicYear}</strong>.
            </p>
          </div>

          {/* FOOTER */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '30px', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ textAlign: 'center', width: '300px' }}>
              <p style={{ margin: '0 0 15px 0', fontSize: '15px', fontWeight: 'bold' }}>Fait à {city}, le {today}</p>
              <p style={{ margin: '0 0 50px 0', fontSize: '16px', fontWeight: 'bold', textDecoration: 'underline' }}>LE DIRECTEUR DES ÉTUDES</p>
              <p style={{ margin: 0, fontSize: '17px', fontWeight: 'bold' }}>{signerName.toUpperCase()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
