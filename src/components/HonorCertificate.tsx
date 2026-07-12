import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
// import removed

interface HonorCertificateProps {
  student: any;
  schoolInfo: any;
  period: string;
  average: number;
  mention: string;
  onClose: () => void;
}

// Gold Ornament component for certificate separators
const GoldOrnament = () => (
  <div style={{ display: 'flex', justifyContent: 'center', margin: '1px 0' }}>
    <svg width="200" height="16" viewBox="0 0 240 24" style={{ fill: 'none', stroke: '#d4af37', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
      {/* Left scroll wing */}
      <path d="M 120 12 C 100 2, 85 2, 60 12 C 35 22, 25 12, 10 12" />
      <path d="M 110 12 C 100 16, 85 16, 75 12" />
      <circle cx="35" cy="14" r="2.5" fill="#d4af37" />
      
      {/* Right scroll wing */}
      <path d="M 120 12 C 140 2, 155 2, 180 12 C 205 22, 215 12, 230 12" />
      <path d="M 130 12 C 140 16, 155 16, 165 12" />
      <circle cx="205" cy="14" r="2.5" fill="#d4af37" />
      
      {/* Center loops and circle */}
      <circle cx="120" cy="12" r="5" fill="#d4af37" />
      <path d="M 114 12 C 114 7, 126 7, 126 12 C 126 17, 114 17, 114 12 Z" />
    </svg>
  </div>
);

export function HonorCertificate({ student, schoolInfo, period, average, mention, onClose }: HonorCertificateProps) {
  const { i18n } = useTranslation();
  const isAr = i18n.language.startsWith('ar');
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
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            size: A4 landscape !important;
            margin: 0 !important;
          }
          body * {
            visibility: hidden !important;
          }
          .honor-certificate-page, .honor-certificate-page *,
          .honor-certificate-page div, .honor-certificate-page p, .honor-certificate-page h1, .honor-certificate-page img, .honor-certificate-page svg {
            visibility: visible !important;
          }
          .honor-certificate-page {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 297mm !important;
            height: 210mm !important;
            margin: 0 !important;
            padding: 12mm !important;
            box-shadow: none !important;
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .receipt-preview-container-wrapper {
            background: transparent !important;
            position: static !important;
            padding: 0 !important;
            overflow: visible !important;
            height: auto !important;
            width: auto !important;
          }
        }
      `}} />
      <div className="print-controls" style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button className="btn btn-outline" style={{ background: 'white', color: 'black' }} onClick={onClose}>Fermer</button>
        <button className="btn btn-primary" onClick={handlePrint}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg> Imprimer</button>
        <button className="btn btn-primary" onClick={handleDownload}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round"/><polyline points="7 10 12 15 17 10" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="15" x2="12" y2="3" strokeLinecap="round" strokeLinejoin="round"/></svg> Télécharger PDF</button>
      </div>

      <div ref={printRef} className="honor-certificate-page" style={{ 
        width: '297mm', 
        height: '210mm', 
        backgroundColor: '#fff', 
        color: '#000000',
        position: 'relative',
        boxSizing: 'border-box',
        padding: '10mm',
        overflow: 'hidden',
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
      }} dir={isAr ? 'rtl' : 'ltr'}>
        {/* Ivorian Borders: Thinner and optimized for space */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, border: '4mm solid #f77f00', pointerEvents: 'none' }}></div>
        <div style={{ position: 'absolute', top: '4mm', left: '4mm', right: '4mm', bottom: '4mm', border: '2mm solid #fff', pointerEvents: 'none' }}></div>
        <div style={{ position: 'absolute', top: '6mm', left: '6mm', right: '6mm', bottom: '6mm', border: '4mm solid #009e60', pointerEvents: 'none' }}></div>
        
        <div style={{ position: 'relative', width: '100%', height: '100%', boxSizing: 'border-box', padding: '4mm', fontFamily: isAr ? "'Traditional Arabic', 'Cairo', 'Tajawal', serif" : "Arial, sans-serif" }}>
          
          {/* HEADER */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: isAr ? '14px' : '9.5px', fontWeight: 'bold', color: '#000000', height: '65px', marginBottom: '12px', lineHeight: '1.3', flexDirection: isAr ? 'row-reverse' : 'row' }}>
            <div style={{ width: '32%', textAlign: 'center' }}>
              {isAr ? (
                <>وزارة التربية الوطنية والتعليم الفني<br/>ومحو الأمية</>
              ) : (
                <>MINISTERE DE L'EDUCATION NATIONALE, DE<br/>L'ALPHABETISATION ET DE L'ENSEIGNEMENT<br/>TECHNIQUE</>
              )}
            </div>
            <div style={{ width: '36%', textAlign: 'center' }}>
              {isAr ? 'جمهورية كوت ديفوار' : "REPUBLIQUE DE COTE D'IVOIRE"}<br/>
              <span style={{ fontWeight: 'normal', fontSize: '9px' }}>{isAr ? 'اتحاد - انضباط - عمل' : 'Union - Discipline - Travail'}</span><br/>
              <img src="/armoiries.svg" alt="Armoiries" style={{ width: '50px', marginTop: '2px', objectFit: 'contain' }}/>
            </div>
            <div style={{ width: '32%', textAlign: 'center' }}>
              {schoolInfo?.school_name?.toUpperCase() || "COLLEGE PRIVE ELISCHAMA DE DIVO"}<br/>
              {schoolInfo?.logo_url ? <img src={schoolInfo.logo_url} alt="Logo" style={{ width: '70px', height: '55px', marginTop: '2px', objectFit: 'contain' }}/> : null}
            </div>
          </div>

          {/* TITLE */}
          <div style={{ margin: '4px 0', textAlign: 'center' }}>
            <h1 style={{ 
              fontSize: isAr ? '48px' : '36px', 
              margin: '0 0 4px 0', 
              color: '#e5a93b', 
              textShadow: '1.2px 1.2px 0 #9a7d0a, -1px -1px 0 #9a7d0a, 1px -1px 0 #9a7d0a, -1px 1px 0 #9a7d0a, 1.2px -1.2px 0 #9a7d0a, 0px 3px 8px rgba(0,0,0,0.15)',
              fontFamily: isAr ? "'Cairo', 'Tajawal', sans-serif" : '"Times New Roman", Times, serif',
              letterSpacing: isAr ? '0px' : '2.5px',
              fontWeight: 'bold',
              display: 'inline-block'
            }}>{isAr ? 'لوحـة الشـرف' : "Tableau d'honneur"}</h1>
            <GoldOrnament />
          </div>

          {/* BODY */}
          <div style={{ margin: '8px auto', maxWidth: '82%', textAlign: 'center' }}>
            <p style={{ fontSize: isAr ? '22px' : '16.5px', lineHeight: '1.6', fontFamily: isAr ? "'Cairo', 'Tajawal', sans-serif" : 'Arial, sans-serif', margin: '0', color: '#111', display: 'inline-block' }}>
              {isAr ? (
                <>
                  إن التلميذ(ة) <strong>{student.first_name?.toUpperCase()} {student.last_name?.toUpperCase()}</strong> رقم التسجيل <strong>{student.matricule}</strong> في قسم <strong>{student.classes?.name || '...'}</strong> الحاصل(ة) على معدل <strong>{average.toFixed(2).replace('.', ',')}</strong> قد تم تسجيله(ا) في <strong>لوحة الشرف {mention && ('+ ' + mention)}</strong> تقديراً لحسن سلوكه(a) واجتهاده(a) خلال <strong>{period.includes('1er') ? 'الثلاثي الأول' : period.includes('2') ? 'الثلاثي الثاني' : 'الثلاثي الثالث'}</strong> من السنة الدراسية <strong>{academicYear}</strong>.
                </>
              ) : (
                <>
                  L'élève <strong>{student.first_name?.toUpperCase()} {student.last_name?.toUpperCase()}</strong> Matricule <strong>{student.matricule}</strong> en classe de <strong>{student.classes?.name || '...'}</strong> ayant obtenu une moyenne de <strong>{average.toFixed(2).replace('.', ',')}</strong> est inscrit(e) au <strong>Tableau d'Honneur {mention && ('+ ' + mention)}</strong> pour sa bonne conduite et son travail durant le {period} de l'année scolaire <strong>{academicYear}</strong>.
                </>
              )}
            </p>
          </div>

          {/* CLEAR SPACER */}
          <div style={{ clear: 'both', height: '10px' }}></div>

          {/* FOOTER (SIGNATURE BLOCK) */}
          <div style={{ position: 'absolute', bottom: '8mm', left: isAr ? '8mm' : 'auto', right: isAr ? 'auto' : '8mm', width: '280px', textAlign: 'center', color: '#000000', fontFamily: isAr ? "'Cairo', 'Tajawal', sans-serif" : 'Arial, sans-serif' }}>
            <p style={{ margin: '0 0 3px 0', fontSize: isAr ? '14px' : '12px', fontWeight: 'bold' }}>{isAr ? `حرر في ${city}، بتاريخ ${today}` : `Fait à ${city}, le ${today}`}</p>
            <p style={{ margin: '0 0 30px 0', fontSize: isAr ? '15px' : '13px', fontWeight: 'bold', textDecoration: 'underline' }}>{isAr ? 'مدير الدراسات' : 'LE DIRECTEUR DES ÉTUDES'}</p>
            <p style={{ margin: 0, fontSize: isAr ? '16px' : '14px', fontWeight: 'bold' }}>{signerName.toUpperCase()}</p>
          </div>

          {/* END CLEAR */}
          <div style={{ clear: 'both' }}></div>
        </div>
      </div>
    </div>
  );
}
