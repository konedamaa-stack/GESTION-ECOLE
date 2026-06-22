import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function SupportTicketsList() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      // The policy "SuperAdmins can view all tickets" allows konedamaa@gmail.com to select all
      const { data, error } = await supabase
        .from('support_tickets')
        .select(`
          *,
          schools(name)
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setTickets(data || []);
    } catch (e: any) {
      console.error("Erreur lors de la récupération des tickets :", e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;

    setIsSending(true);
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ 
          reply: replyText, 
          status: 'resolved', 
          updated_at: new Date().toISOString() 
        })
        .eq('id', selectedTicket.id);

      if (error) throw error;

      // Update local state
      setTickets(tickets.map(t => 
        t.id === selectedTicket.id 
          ? { ...t, reply: replyText, status: 'resolved' } 
          : t
      ));
      setSelectedTicket(null);
      setReplyText('');
      
    } catch (e: any) {
      console.error("Erreur lors de la réponse :", e.message);
      alert("Erreur lors de l'envoi de la réponse.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Support & Assistance</h2>
      <p style={{ color: '#6B7280', marginBottom: '24px' }}>Gérez les demandes d'aide et les questions des utilisateurs.</p>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>Chargement des tickets...</div>
      ) : (
        <div style={{ display: 'flex', gap: '24px' }}>
          {/* Liste des tickets */}
          <div style={{ flex: 1, background: '#fff', borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
            {tickets.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>Aucun ticket pour le moment.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {tickets.map(ticket => (
                  <div 
                    key={ticket.id} 
                    onClick={() => setSelectedTicket(ticket)}
                    style={{ 
                      padding: '16px', 
                      borderBottom: '1px solid #E5E7EB', 
                      cursor: 'pointer',
                      background: selectedTicket?.id === ticket.id ? '#F3F4F6' : '#fff',
                      transition: 'background 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 600 }}>{ticket.subject}</span>
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
                    <div style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '4px' }}>
                      École : {ticket.schools?.name || 'Non spécifiée'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>
                      Le {new Date(ticket.created_at).toLocaleDateString('fr-FR')} à {new Date(ticket.created_at).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Détail du ticket sélectionné */}
          <div style={{ flex: 1 }}>
            {selectedTicket ? (
              <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '24px' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>{selectedTicket.subject}</h3>
                
                <div style={{ background: '#F9FAFB', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
                  <div style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '8px' }}>Message de l'utilisateur :</div>
                  <div style={{ color: '#111827', whiteSpace: 'pre-wrap' }}>{selectedTicket.message}</div>
                </div>

                {selectedTicket.status === 'resolved' && selectedTicket.reply ? (
                  <div style={{ background: '#F0FDF4', padding: '16px', borderRadius: '8px', border: '1px solid #BBF7D0' }}>
                    <div style={{ fontSize: '0.85rem', color: '#166534', marginBottom: '8px', fontWeight: 600 }}>Votre réponse :</div>
                    <div style={{ color: '#14532D', whiteSpace: 'pre-wrap' }}>{selectedTicket.reply}</div>
                  </div>
                ) : (
                  <form onSubmit={handleSendReply}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.9rem' }}>Votre réponse</label>
                    <textarea 
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Tapez votre réponse ici..."
                      rows={5}
                      required
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '8px',
                        marginBottom: '16px',
                        fontFamily: 'inherit',
                        resize: 'vertical',
                        boxSizing: 'border-box'
                      }}
                    />
                    <button 
                      type="submit" 
                      disabled={isSending}
                      style={{ 
                        background: '#8B5CF6', 
                        color: 'white', 
                        padding: '10px 20px', 
                        border: 'none', 
                        borderRadius: '8px',
                        fontWeight: 600,
                        cursor: isSending ? 'not-allowed' : 'pointer',
                        opacity: isSending ? 0.7 : 1
                      }}
                    >
                      {isSending ? 'Envoi...' : 'Envoyer la réponse et résoudre'}
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <div style={{ background: '#fff', borderRadius: '16px', border: '1px dashed #D1D5DB', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '300px', color: '#9CA3AF' }}>
                Sélectionnez un ticket pour afficher les détails
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
