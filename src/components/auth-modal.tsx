'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { LogIn, UserPlus, Mail, Lock, User, Phone, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'login' | 'register';
  onAuthSuccess: () => void;
}

export default function AuthModal({ open, onOpenChange, mode, onAuthSuccess }: AuthModalProps) {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) { toast.error('Veuillez remplir tous les champs'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Bienvenue, ${data.user.name} !`);
        onAuthSuccess();
        onOpenChange(false);
      } else {
        toast.error(data.error);
      }
    } catch { toast.error('Erreur serveur'); }
    setLoading(false);
  };

  const handleRegister = async () => {
    if (!registerName || !registerEmail || !registerPassword) { toast.error('Veuillez remplir tous les champs obligatoires'); return; }
    if (registerPassword !== registerConfirmPassword) { toast.error('Les mots de passe ne correspondent pas'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: registerName,
          email: registerEmail,
          password: registerPassword,
          confirmPassword: registerConfirmPassword,
          phone: registerPhone || null,
          phoneCountry: 'MA',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Compte créé avec succès ! Bienvenue.');
        if (data.emailVerificationSent) {
          toast.info('Un email de vérification vous a été envoyé. Vérifiez votre dossier Spam si nécessaire.');
        }
        onAuthSuccess();
        onOpenChange(false);
      } else {
        toast.error(data.error);
      }
    } catch { toast.error('Erreur serveur'); }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            {mode === 'login' ? 'Connexion' : 'Créer un compte'}
          </DialogTitle>
          <DialogDescription className="text-center text-slate-500">
            {mode === 'login'
              ? 'Accédez à votre espace personnel HSE Academy'
              : 'Rejoignez la communauté HSE Academy'}
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue={mode} className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" className="gap-1.5"><LogIn className="h-3.5 w-3.5" />Connexion</TabsTrigger>
            <TabsTrigger value="register" className="gap-1.5"><UserPlus className="h-3.5 w-3.5" />Inscription</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input id="login-email" type="email" placeholder="votre@email.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="pl-10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input id="login-password" type="password" placeholder="••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="pl-10" onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
              </div>
            </div>
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleLogin} disabled={loading}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </TabsContent>

          <TabsContent value="register" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="reg-name">Nom complet *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input id="reg-name" placeholder="Votre nom complet" value={registerName} onChange={(e) => setRegisterName(e.target.value)} className="pl-10" />
              </div>
            </div>
            {/* Avertissement nom */}
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800">
                Vérifiez attentivement l&apos;orthographe de votre nom complet. Il sera utilisé sur vos attestations de formation.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-email">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input id="reg-email" type="email" placeholder="votre@email.com" value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} className="pl-10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-phone">Téléphone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input id="reg-phone" placeholder="+212 6XX XXX XXX" value={registerPhone} onChange={(e) => setRegisterPhone(e.target.value)} className="pl-10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-password">Mot de passe *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input id="reg-password" type="password" placeholder="Min. 8 caractères" value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} className="pl-10" />
              </div>
              <p className="text-xs text-slate-400">
                Min. 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-confirm-password">Confirmer le mot de passe *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input id="reg-confirm-password" type="password" placeholder="••••••••" value={registerConfirmPassword} onChange={(e) => setRegisterConfirmPassword(e.target.value)} className="pl-10" onKeyDown={(e) => e.key === 'Enter' && handleRegister()} />
              </div>
            </div>
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleRegister} disabled={loading}>
              {loading ? 'Création...' : "S'inscrire"}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
