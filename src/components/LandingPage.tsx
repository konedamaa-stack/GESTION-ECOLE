import React, { useEffect } from 'react';
import '../LandingPage.css';

interface LandingPageProps {
  onLoginClick: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick }) => {
  useEffect(() => {
    // Scroll to top on load
    window.scrollTo(0, 0);
  }, []);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Votre message a bien été envoyé ! Nous vous contacterons rapidement.");
  };

  return (
    <div style={{ backgroundColor: 'var(--lp-light)', minHeight: '100vh' }}>
      
      {/* HEADER */}
      <header className="lp-header">
        <a href="#" className="lp-logo">
          <span style={{background: 'var(--lp-primary)', color: 'white', padding: '4px 12px', borderRadius: '8px'}}>S</span>
          SGES
        </a>
        <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
          <nav className="lp-nav">
            <a href="#accueil" className="lp-nav-link">Accueil</a>
            <a href="#presentation" className="lp-nav-link">À propos</a>
            <a href="#programmes" className="lp-nav-link">Programmes</a>
            <a href="#contact" className="lp-nav-link">Contact</a>
          </nav>
          <button onClick={onLoginClick} className="lp-btn lp-btn-primary" style={{ padding: '0.5rem 1rem' }}>
            Espace Privé
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section id="accueil" className="lp-hero">
        <div className="lp-hero-content">
          <h1 className="lp-h1">L'Excellence Éducative pour le Futur de vos Enfants</h1>
          <p className="lp-p">Notre établissement offre un environnement d'apprentissage innovant, bienveillant et stimulant. Préparez vos enfants à devenir les leaders de demain.</p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <a href="#contact" className="lp-btn lp-btn-primary">Inscription Ouverte</a>
            <a href="#presentation" className="lp-btn lp-btn-secondary">Découvrir l'École</a>
          </div>
        </div>
        <div className="lp-hero-image">
          {/* Using a high-quality placeholder image for education */}
          <img src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Étudiants souriants" />
        </div>
      </section>

      {/* STATS SECTION */}
      <section style={{ padding: '0 5%' }}>
        <div className="lp-stats">
          <div className="lp-stat-item">
            <div className="lp-stat-number">1200+</div>
            <div className="lp-stat-label">Élèves Inscrits</div>
          </div>
          <div className="lp-stat-item">
            <div className="lp-stat-number">98%</div>
            <div className="lp-stat-label">Taux de Réussite</div>
          </div>
          <div className="lp-stat-item">
            <div className="lp-stat-number">50+</div>
            <div className="lp-stat-label">Professeurs Qualifiés</div>
          </div>
          <div className="lp-stat-item">
            <div className="lp-stat-number">15</div>
            <div className="lp-stat-label">Années d'Expérience</div>
          </div>
        </div>
      </section>

      {/* PRESENTATION SECTION */}
      <section id="presentation" className="lp-section">
        <h2 className="lp-section-title lp-h2">Notre Mission & Valeurs</h2>
        <div style={{ display: 'flex', gap: '4rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <img src="https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Salle de classe" style={{ width: '100%', borderRadius: '20px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} />
          </div>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <h3 className="lp-h3">Former les esprits, forger les caractères</h3>
            <p className="lp-p">Nous croyons fermement que chaque élève possède un potentiel unique. Notre mission est de fournir un cadre éducatif rigoureux tout en encourageant la créativité, l'esprit critique et l'empathie.</p>
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '2rem' }}>
              <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: 'var(--lp-primary)' }}>✓</span> <strong>Excellence Académique</strong> - Des programmes rigoureux et adaptés.
              </li>
              <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: 'var(--lp-primary)' }}>✓</span> <strong>Innovation Pédagogique</strong> - Intégration du numérique.
              </li>
              <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: 'var(--lp-primary)' }}>✓</span> <strong>Développement Personnel</strong> - Activités parascolaires variées.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* PROGRAMS SECTION */}
      <section id="programmes" className="lp-section" style={{ background: '#f1f5f9' }}>
        <h2 className="lp-section-title lp-h2">Nos Programmes d'Enseignement</h2>
        <div className="lp-grid">
          <div className="lp-card">
            <div className="lp-card-icon">📚</div>
            <h3 className="lp-h3">École Maternelle</h3>
            <p className="lp-p">Éveil, sociabilisation et apprentissages fondamentaux dans un cadre bienveillant et sécurisé pour vos tout-petits.</p>
          </div>
          <div className="lp-card">
            <div className="lp-card-icon">✏️</div>
            <h3 className="lp-h3">École Primaire</h3>
            <p className="lp-p">Acquisition solide des savoirs fondamentaux : lecture, écriture, mathématiques et découverte du monde.</p>
          </div>
          <div className="lp-card">
            <div className="lp-card-icon">🔬</div>
            <h3 className="lp-h3">Collège & Lycée</h3>
            <p className="lp-p">Préparation aux diplômes nationaux, approfondissement des connaissances et orientation professionnelle personnalisée.</p>
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="lp-section">
        <h2 className="lp-section-title lp-h2">Contactez-nous ou Postulez</h2>
        <div className="lp-contact-container">
          <div className="lp-contact-info">
            <h3 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Informations Pratiques</h3>
            <p style={{ opacity: 0.9, marginBottom: '2rem' }}>Notre équipe administrative est à votre disposition pour répondre à toutes vos questions concernant les inscriptions.</p>
            
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '1.5rem' }}>📍</span>
              <div>
                <strong>Adresse</strong><br />
                123 Avenue de l'Éducation, 75000 Paris
              </div>
            </div>
            
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '1.5rem' }}>📞</span>
              <div>
                <strong>Téléphone</strong><br />
                +33 1 23 45 67 89
              </div>
            </div>
            
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '1.5rem' }}>✉️</span>
              <div>
                <strong>Email</strong><br />
                contact@sges-ecole.fr
              </div>
            </div>
          </div>
          
          <div className="lp-contact-form">
            <h3 className="lp-h3" style={{ marginBottom: '1.5rem' }}>Envoyez-nous un message</h3>
            <form onSubmit={handleContactSubmit}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Prénom</label>
                  <input type="text" className="lp-input" required placeholder="Jean" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Nom</label>
                  <input type="text" className="lp-input" required placeholder="Dupont" />
                </div>
              </div>
              
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Email</label>
              <input type="email" className="lp-input" required placeholder="jean.dupont@email.com" />
              
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Sujet</label>
              <select className="lp-input" required>
                <option value="">Sélectionnez un sujet</option>
                <option value="inscription">Demande d'inscription</option>
                <option value="information">Demande d'information</option>
                <option value="autre">Autre</option>
              </select>

              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Message</label>
              <textarea className="lp-input" rows={4} required placeholder="Comment pouvons-nous vous aider ?"></textarea>
              
              <button type="submit" className="lp-btn lp-btn-primary" style={{ width: '100%' }}>Envoyer le message</button>
            </form>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="lp-footer-grid">
          <div>
            <div className="lp-logo" style={{ color: 'white', marginBottom: '1rem' }}>
              <span style={{background: 'var(--lp-primary)', color: 'white', padding: '4px 12px', borderRadius: '8px'}}>S</span>
              SGES
            </div>
            <p style={{ color: '#94a3b8' }}>Système de gestion scolaire innovant pour faciliter le quotidien de l'administration, des enseignants et des parents.</p>
          </div>
          <div>
            <h4 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Liens Rapides</h4>
            <a href="#accueil" className="lp-footer-link">Accueil</a>
            <a href="#presentation" className="lp-footer-link">À propos de nous</a>
            <a href="#programmes" className="lp-footer-link">Nos Programmes</a>
            <a href="#contact" className="lp-footer-link">Admissions</a>
          </div>
          <div>
            <h4 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Légal</h4>
            <a href="#" className="lp-footer-link">Mentions légales</a>
            <a href="#" className="lp-footer-link">Politique de confidentialité</a>
            <a href="#" className="lp-footer-link">CGU</a>
          </div>
        </div>
        <div className="lp-footer-bottom">
          <p>© {new Date().getFullYear()} SGES - Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
};
