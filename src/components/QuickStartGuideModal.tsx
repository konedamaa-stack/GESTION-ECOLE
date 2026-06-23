// import removed

interface QuickStartGuideModalProps {
  onClose: () => void;
}

export function QuickStartGuideModal({ onClose }: QuickStartGuideModalProps) {
  return (
    <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
      <div className="modal-content" style={{ maxWidth: '800px', width: '90%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        
        <div style={{ background: 'var(--accent-color, #8B5CF6)', color: 'white', padding: '24px', position: 'relative' }}>
          <button 
            onClick={onClose} 
            style={{ position: 'absolute', right: '16px', top: '16px', background: 'transparent', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer', opacity: 0.8 }}
          >&times;</button>
          <h2 style={{ margin: 0, fontSize: '1.75rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span>🚀</span> Guide de Démarrage Rapide
          </h2>
          <p style={{ margin: '8px 0 0 0', opacity: 0.9 }}>
            Suivez ces étapes dans l'ordre pour configurer parfaitement votre établissement.
          </p>
        </div>

        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          <div style={{ background: '#FFFBEB', border: '1px solid #FEF3C7', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#D97706', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              La Règle d'Or
            </h4>
            <p style={{ margin: 0, color: '#92400E', fontSize: '0.95rem' }}>
              Ne tentez pas d'inscrire un élève sans avoir au préalable créé sa classe et ses parents. Suivez toujours l'ordre chronologique présenté ci-dessous.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
            {/* Ligne verticale de connexion */}
            <div style={{ position: 'absolute', left: '23px', top: '24px', bottom: '24px', width: '2px', background: '#E5E7EB', zIndex: 0 }}></div>

            <Step 
              number={1} 
              icon="⚙️" 
              title="Paramètres de l'École" 
              description="Renseignez le nom, le logo et les coordonnées de l'établissement."
              location="Menu > Paramètres"
            />

            <Step 
              number={2} 
              icon="🏫" 
              title="Créer les Classes" 
              description="Créez tous les niveaux d'études (ex: CP1, 6ème A). C'est le cœur de l'école."
              location="Menu > Classes & Pédagogie"
              isHighlight
            />

            <Step 
              number={3} 
              icon="📚" 
              title="Matières et Coefficients" 
              description="Définissez les matières enseignées et leurs coefficients pour chaque classe."
              location="Menu > Pédagogie"
            />

            <Step 
              number={4} 
              icon="👨‍🏫" 
              title="Professeurs & Personnel" 
              description="Ajoutez votre équipe pédagogique et administrative."
              location="Menu > Professeurs / RH"
            />

            <Step 
              number={5} 
              icon="👨‍👩‍👧‍👦" 
              title="Inscrire les Parents" 
              description="Créez les fiches des parents (Nom, WhatsApp) AVANT d'inscrire les enfants."
              location="Menu > Parents"
            />

            <Step 
              number={6} 
              icon="🎓" 
              title="Inscrire les Élèves" 
              description="Saisissez les élèves, assignez-les à une classe et liez-les à leur parent."
              location="Menu > Élèves"
              isHighlight
            />

            <Step 
              number={7} 
              icon="💰" 
              title="Encaisser les Paiements" 
              description="Générez les premiers reçus pour les frais d'inscription et de scolarité."
              location="Dossier Élève > Finances"
            />
          </div>
        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid #E5E7EB', background: '#F9FAFB', textAlign: 'right' }}>
          <button 
            onClick={onClose}
            style={{ padding: '10px 24px', background: 'var(--accent-color, #8B5CF6)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
          >
            J'ai compris, c'est parti !
          </button>
        </div>
      </div>
    </div>
  );
}

function Step({ number, icon, title, description, location, isHighlight = false }: any) {
  return (
    <div style={{ display: 'flex', gap: '16px', position: 'relative', zIndex: 1 }}>
      <div style={{ 
        width: '48px', 
        height: '48px', 
        borderRadius: '50%', 
        background: isHighlight ? 'var(--accent-color, #8B5CF6)' : 'white', 
        border: isHighlight ? 'none' : '2px solid #E5E7EB',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontSize: '1.25rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        flexShrink: 0
      }}>
        {icon}
      </div>
      <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px', flex: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#111827' }}>
            <span style={{ color: 'var(--accent-color, #8B5CF6)', marginRight: '8px', fontSize: '0.9rem' }}>Étape {number}</span>
            {title}
          </h3>
          <span style={{ fontSize: '0.75rem', background: '#F3F4F6', padding: '2px 8px', borderRadius: '4px', color: '#6B7280' }}>
            {location}
          </span>
        </div>
        <p style={{ margin: 0, color: '#4B5563', fontSize: '0.95rem', lineHeight: 1.5 }}>
          {description}
        </p>
      </div>
    </div>
  );
}
