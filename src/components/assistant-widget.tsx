'use client';

// ============================================================================
// AssistantWidget — Widget flottant (Phase 1 → 4)
// ============================================================================
// Bouton flottant + panneau de conversation. Ne casse pas la navigation.
// Affiché uniquement si l'assistant est activé (vérifié via /api/assistant/status).
// Phase 4 : conversationId conservé, suggestions, erreurs inline, welcome pro.
// ============================================================================

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X, Send, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useAssistantStore } from '@/stores/assistant-store';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';

interface Message { role: 'user' | 'assistant'; content: string; ts: number; }
interface Status {
  enabled: boolean;
  name: string;
  welcomeMessage: string;
  modes: { commercial: boolean; user: boolean; admin: boolean };
  aiProviderConfigured: boolean;
  version: string;
}

const SUGGESTIONS = [
  'Voir les formations disponibles',
  'Quel cours puis-je suivre gratuitement ?',
  'Comment créer mon CV ?',
  "J'ai besoin d'aide avec mon compte",
];

export function AssistantWidget() {
  const { isOpen, setOpen, pendingQuestion, setPendingQuestion } = useAssistantStore();
  const [status, setStatus] = useState<Status | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  // Phase 4 : conservation du conversationId pour la mémoire conversationnelle
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let mounted = true;
    async function checkStatus() {
      try {
        const res = await fetch('/api/assistant/status', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (mounted) {
            setStatus(data);
          }
        }
      } catch { /* silencieux */ }
    }
    checkStatus();
    const interval = setInterval(checkStatus, 60000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  // ============================================================================
  // Welcome message — set ONCE on initial mount, NEVER re-set during the session.
  // ============================================================================
  // Bug fix: previously this logic was inside the periodic checkStatus() above,
  // but the closure captured `messages` from the first render (always []).
  // Every 60s, `messages.length === 0` was true (stale closure), causing
  // setMessages([welcome]) to WIPE the user's conversation.
  //
  // Now: welcome is set on mount via a SEPARATE useEffect (deps [messages] is
  // NOT needed — we only set it once). The periodic status check no longer
  // touches messages. Conversation is preserved indefinitely until the user
  // closes the panel (X button preserves state via Zustand isOpen toggle).
  // ============================================================================
  useEffect(() => {
    // ATTENDRE que status soit chargé avant de mettre le welcome message.
    // Sinon, on met le fallback avant que l'API réponde, puis quand le vrai
    // welcomeMessage arrive, messages.length n'est plus 0 → le vrai message
    // n'est jamais mis (race condition).
    if (!status) return;
    const welcome = status.welcomeMessage || "Bonjour, je suis l'Assistant IA de HSE Academy. Comment puis-je vous aider ?";
    setMessages(prev => prev.length === 0 ? [{
      role: 'assistant',
      content: welcome,
      ts: Date.now(),
    }] : prev);
  }, [status?.welcomeMessage]);

  // === Auth state detection — reset conversation when user logs in/out ===
  // Quand l'utilisateur se connecte ou se déconnecte, on reset la conversation
  // pour ne pas afficher l'historique visiteur à un utilisateur connecté.
  useEffect(() => {
    let mounted = true;
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          const newUserId = data?.user?.id || null;
          if (newUserId !== authUserId) {
            // Auth state changed — reset conversation + re-set welcome message
            setAuthUserId(newUserId);
            setConversationId(null);
            // IMPORTANT : ne pas faire setMessages([]) car cela efface le welcome
            // message et le welcome useEffect ne re-déclenche pas (ses deps
            // [status?.welcomeMessage] n'ont pas changé). On remet directement
            // le welcome message.
            const welcome = status?.welcomeMessage || "Bonjour, je suis l'Assistant IA de HSE Academy. Comment puis-je vous aider ?";
            setMessages([{
              role: 'assistant',
              content: welcome,
              ts: Date.now(),
            }]);
          }
        } else if (authUserId !== null) {
          // Was logged in, now logged out — reset + re-set welcome
          setAuthUserId(null);
          setConversationId(null);
          const welcome = status?.welcomeMessage || "Bonjour, je suis l'Assistant IA de HSE Academy. Comment puis-je vous aider ?";
          setMessages([{
            role: 'assistant',
            content: welcome,
            ts: Date.now(),
          }]);
        }
      } catch {
        // Silent — don't disrupt the chat on auth check failure
      }
    }
    checkAuth();
    const interval = setInterval(checkAuth, 5000); // check every 5s
    return () => { mounted = false; clearInterval(interval); };
  }, [authUserId, status]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  // ============================================================================
  // Auto-send de la pendingQuestion quand le widget s'ouvre
  // ============================================================================
  // Permet aux boutons externes (ex : "Demander des informations" sur les pages
  // de formation) d'ouvrir le widget ET de déclencher automatiquement l'envoi
  // d'une question contextuelle.
  //
  // Mécanisme :
  //   - Le bouton externe appelle `useAssistantStore.getState().openWithQuestion(q)`
  //   - Le store met isOpen=true + pendingQuestion=q
  //   - Ce useEffect détecte le changement, attend 1 render complet du widget,
  //     puis appelle handleSendRef.current(q) pour envoyer le message
  //   - Après envoi, pendingQuestion est reset (usage unique)
  // ============================================================================
  const handleSendRef = useRef<(text?: string) => void>(() => {});

  useEffect(() => {
    if (isOpen && pendingQuestion) {
      // Petit délai pour laisser le welcome message + panneau se rendre
      const t = setTimeout(() => {
        if (pendingQuestion) {
          handleSendRef.current(pendingQuestion);
          setPendingQuestion(null);
        }
      }, 250);
      return () => clearTimeout(t);
    }
  }, [isOpen, pendingQuestion, setPendingQuestion]);

  if (!isOpen) return null;

  const handleSend = async (text?: string) => {
    const trimmed = (text || input).trim();
    if (!trimmed || sending) return;
    if (trimmed.length > 5000) { toast.error('Message trop long (max 5000 caractères)'); return; }

    setMessages(prev => [...prev, { role: 'user', content: trimmed, ts: Date.now() }]);
    setInput('');
    setSending(true);

    try {
      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          // Phase 4 : envoyer le conversationId pour la mémoire
          ...(conversationId ? { conversationId } : {}),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply, ts: Date.now() }]);
        // Stocker le conversationId pour les messages suivants
        if (data.conversationId) {
          setConversationId(data.conversationId);
        }
      } else {
        // Erreur : afficher inline dans le chat (pas de toast)
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "Désolé, l'assistant est momentanément indisponible. Veuillez réessayer dans quelques instants.",
          ts: Date.now(),
        }]);
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Connexion interrompue. Vérifiez votre connexion et réessayez.",
        ts: Date.now(),
      }]);
    } finally {
      setSending(false);
      // Refocus l'input après envoi
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  // Mise à jour de la ref pour permettre à l'useEffect "pendingQuestion" d'appeler handleSend
  // (handleSend est défini après les useEffect à cause du pattern `if (!isOpen) return null`)
  handleSendRef.current = handleSend;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleSuggestion = (suggestion: string) => {
    handleSend(suggestion);
  };

  // Afficher les suggestions uniquement quand il n'y a que le message de bienvenue
  const showSuggestions = messages.length === 1 && !sending;

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-5 right-5 z-50 w-[calc(100vw-2.5rem)] sm:w-96 max-h-[600px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-sm leading-tight">{status?.name || 'Assistant'}</p>
                <p className="text-[10px] text-emerald-100 leading-tight">HSE Academy · Lecture seule</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Fermer l'Assistant IA"
              className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 min-h-[300px] max-h-[440px]">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-md'
                    : 'bg-white border border-slate-200 text-slate-700 rounded-bl-md shadow-sm'
                }`}>
                  <div className="prose prose-sm max-w-none prose-p:my-0 prose-ul:my-1 prose-li:my-0 prose-headings:my-1 prose-strong:text-inherit prose-a:text-emerald-600">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
                      {m.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}

            {/* Suggestions rapides (uniquement au démarrage) */}
            {showSuggestions && (
              <div className="flex flex-col gap-2 pt-2">
                {SUGGESTIONS.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestion(s)}
                    className="text-left text-sm px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 transition-colors cursor-pointer"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Loading */}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 px-3.5 py-2.5 rounded-2xl rounded-bl-md shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-slate-200 p-3 bg-white shrink-0">
            <div className="flex gap-2 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Posez votre question…"
                rows={1}
                className="flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 max-h-32"
                disabled={sending}
              />
              <Button
                onClick={() => handleSend()}
                disabled={!input.trim() || sending}
                size="icon"
                className="bg-emerald-600 hover:bg-emerald-700 shrink-0 h-10 w-10 rounded-xl"
                aria-label="Envoyer le message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 text-center">
              Entrée pour envoyer · Maj+Entrée pour un saut de ligne
            </p>
          </div>
        </div>
      )}
    </>
  );
}
