import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface UserSupportModalProps {
  session: any;
  schoolId: string;
  onClose: () => void;
}

export function UserSupportModal({ session, schoolId, onClose }: UserSupportModalProps) {
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // const [isCreating, setIsCreating] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [view, setView] = useState<'list' | 'create'>('list');

  useEffect(() => {
    fetchTickets();
  }, [schoolId]);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      // The RLS policy ensures users can only see their own tickets
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (e: any) {
      console.error("Erreur lors du chargement de l'historique :", e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setIsSending(true);
    try {
      const { error } = await supabase
        .from('support_tickets')
        .insert([{
          user_id: session.user.id,
          school_id: schoolId,
          subject: subject,
          message: message,
          status: 'open'
        }]);

      if (error) throw error;

      setSubject('');
      setMessage('');
      setView('list');
      fetchTickets();
      alert("Votre message a bien été envoyé à l'équipe de support !");
    } catch (e: any) {
      console.error("Erreur lors de l'envoi :", e.message);
      alert("Erreur lors de l'envoi de votre demande.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="modal-content" style={{ maxWidth: '600px', width: '90%', padding: '24px', position: 'relative' }}>
        <button onClick={onClose} className="modal-close" style={{ position: 'absolute', right: '16px', top: '16px' }}>&times;</button>
        
        <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>❓</span> Aide & Support
        </h2>

        {view === 'list' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Vos demandes</h3>
              <button 
                onClick={() => setView('create')}
                className="btn btn-primary"
                style={{ padding: '8px 16px', fontSize: '0.9rem' }}
              >
                + Poser une question
              </button>
            </div>

            {isLoading ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#6B7280' }}>Chargement...</div>
            ) : tickets.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', background: '#F9FAFB', borderRadius: '8px', color: '#6B7280' }}>
                Vous n'avez pas encore envoyé de demande de support.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
                {tickets.map(ticket => (
                  <div key={ticket.id} style={{ border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden' }}>
                    <div style={{ padding: '12px 16px', background: '#F9FAFB', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 600, marginBottom: '4px' }}>{ticket.subject}</div>
                        <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>Le {new Date(ticket.created_at).toLocaleDateString('fr-FR')}</div>
                      </div>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        padding: '2px 8px', 
                        borderRadius: '999px',
                        background: ticket.status === 'open' ? '#FEF3C7' : '#D1FAE5',
                        color: ticket.status === 'open' ? '#D97706' : '#059669'
                      }}>
                        {ticket.status === 'open' ? 'En attente' : 'Résolu'}
                      </span>
                    </div>
                    <div style={{ padding: '16px' }}>
                      <div style={{ fontSize: '0.9rem', color: '#374151', marginBottom: ticket.reply ? '16px' : '0' }}>
                        {ticket.message}
                      </div>
                      
                      {ticket.reply && (
                        <div style={{ background: '#F0FDF4', padding: '12px', borderRadius: '6px', borderLeft: '4px solid #22C55E' }}>
                          <div style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 600, marginBottom: '4px' }}>Réponse du Support :</div>
                          <div style={{ fontSize: '0.9rem', color: '#14532D' }}>{ticket.reply}</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {view === 'create' && (
          <form onSubmit={handleCreateTicket}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Sujet de votre question</label>
              <input 
                type="text" 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="input-field"
                placeholder="Ex: Comment ajouter un nouvel élève ?"
                style={{ width: '100%', padding: '10px' }}
              />
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Description détaillée</label>
              <textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                className="input-field"
                placeholder="Décrivez votre problème ou posez votre question ici..."
                rows={6}
                style={{ width: '100%', padding: '10px', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                type="button" 
                onClick={() => setView('list')}
                className="btn btn-secondary"
              >
                Annuler
              </button>
              <button 
                type="submit" 
                disabled={isSending}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {isSending ? 'Envoi...' : 'Envoyer ma question'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
