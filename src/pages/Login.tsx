import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, User, Briefcase, ChevronRight, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loginAs } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (login(email, password)) {
      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur E³W",
      });
      navigate('/dashboard');
    } else {
      setError('Identifiants incorrects');
    }
  };

  const handleDemoLogin = (role: 'admin' | 'gestionnaire' | 'client') => {
    loginAs(role);
    toast({
      title: "Connexion Demo",
      description: `Connecté en tant que ${role === 'admin' ? 'Administrateur' : role === 'gestionnaire' ? 'Gestionnaire' : 'Client'}`,
    });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4af37' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="relative z-10 flex flex-col justify-center p-12">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-foreground font-display">E³</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground font-display">E³W</h1>
                <p className="text-sm text-muted-foreground">Epsilon Early Warning Engine</p>
              </div>
            </div>
          </div>
          
          <h2 className="text-4xl font-bold text-foreground mb-4 font-display leading-tight">
            Système de Gestion<br />
            <span className="text-primary">Crédit & Risque</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-md">
            Plateforme bancaire intelligente pour la zone CEMAC. 
            Gestion KYC, analyse de risque et workflow crédit.
          </p>
          
          <div className="mt-12 flex gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary font-display">500+</div>
              <div className="text-sm text-muted-foreground">Clients actifs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary font-display">15B</div>
              <div className="text-sm text-muted-foreground">XAF en encours</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary font-display">99%</div>
              <div className="text-sm text-muted-foreground">Taux recouvrement</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <div className="inline-flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-xl font-bold text-primary-foreground font-display">E³</span>
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold text-foreground font-display">E³W</h1>
                <p className="text-xs text-muted-foreground">Early Warning Engine</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-8">
            <h2 className="text-2xl font-bold text-foreground mb-2 font-display">Connexion</h2>
            <p className="text-muted-foreground mb-6">Accédez à votre espace sécurisé</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.cm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-dark"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-dark"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <Button type="submit" variant="gold" className="w-full" size="lg">
                Se connecter
                <ChevronRight className="w-4 h-4" />
              </Button>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Accès Demo Rapide</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  className="flex-col h-auto py-4 gap-2"
                  onClick={() => handleDemoLogin('admin')}
                >
                  <Shield className="w-5 h-5 text-primary" />
                  <span className="text-xs">Admin</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex-col h-auto py-4 gap-2"
                  onClick={() => handleDemoLogin('gestionnaire')}
                >
                  <Briefcase className="w-5 h-5 text-info" />
                  <span className="text-xs">Gestionnaire</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex-col h-auto py-4 gap-2"
                  onClick={() => handleDemoLogin('client')}
                >
                  <User className="w-5 h-5 text-success" />
                  <span className="text-xs">Client</span>
                </Button>
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            © 2024 E³W - Epsilon Early Warning Engine<br />
            Zone CEMAC - Cameroun
          </p>
        </div>
      </div>
    </div>
  );
}
