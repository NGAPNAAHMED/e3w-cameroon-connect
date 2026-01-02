import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { Loader2, LogIn, UserPlus, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { z } from 'zod';

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères')
});

const signupSchema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  prenom: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword']
});

export default function Auth() {
  const navigate = useNavigate();
  const { login, signup, loginAs } = useAuth();
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Login form
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  
  // Signup form
  const [signupForm, setSignupForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    try {
      loginSchema.parse(loginForm);
    } catch (err: any) {
      const fieldErrors: Record<string, string> = {};
      err.errors?.forEach((e: any) => {
        fieldErrors[e.path[0]] = e.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    const { error } = await login(loginForm.email, loginForm.password);
    setLoading(false);

    if (error) {
      toast({
        title: 'Erreur de connexion',
        description: error,
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Connexion réussie',
      description: 'Bienvenue sur E³W'
    });
    navigate('/dashboard');
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      signupSchema.parse(signupForm);
    } catch (err: any) {
      const fieldErrors: Record<string, string> = {};
      err.errors?.forEach((e: any) => {
        fieldErrors[e.path[0]] = e.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    const { error } = await signup(signupForm.email, signupForm.password, {
      nom: signupForm.nom,
      prenom: signupForm.prenom
    });
    setLoading(false);

    if (error) {
      if (error.includes('already registered')) {
        toast({
          title: 'Compte existant',
          description: 'Un compte existe déjà avec cet email. Veuillez vous connecter.',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Erreur d\'inscription',
          description: error,
          variant: 'destructive'
        });
      }
      return;
    }

    toast({
      title: 'Inscription réussie',
      description: 'Votre compte a été créé. Vous pouvez maintenant vous connecter.'
    });
    setActiveTab('login');
    setLoginForm({ email: signupForm.email, password: '' });
  };

  const handleDemoLogin = (role: 'admin' | 'gestionnaire' | 'client') => {
    loginAs(role);
    toast({
      title: 'Connexion démo',
      description: `Connecté en tant que ${role}`
    });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
      
      <div className="relative w-full max-w-md space-y-6 animate-fade-in">
        {/* Logo */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary mb-4">
            <span className="text-2xl font-bold text-primary-foreground font-display">E³</span>
          </div>
          <h1 className="text-2xl font-bold font-display">E³W</h1>
          <p className="text-sm text-muted-foreground">Epsilon Early Warning Engine</p>
        </div>

        {/* Auth Card */}
        <Card className="glass-card">
          <CardHeader className="text-center pb-2">
            <CardTitle className="font-display">Bienvenue</CardTitle>
            <CardDescription>
              Connectez-vous ou créez un compte pour continuer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <LogIn className="w-4 h-4 mr-2" />
                  Connexion
                </TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Inscription
                </TabsTrigger>
              </TabsList>

              {/* Login Form */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="votre@email.cm"
                      value={loginForm.email}
                      onChange={e => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                      className="input-dark"
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Mot de passe</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={loginForm.password}
                        onChange={e => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                        className="input-dark pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.password}
                      </p>
                    )}
                  </div>

                  <Button type="submit" variant="gold" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Connexion...
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4 mr-2" />
                        Se connecter
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Signup Form */}
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-nom">Nom</Label>
                      <Input
                        id="signup-nom"
                        placeholder="Nom"
                        value={signupForm.nom}
                        onChange={e => setSignupForm(prev => ({ ...prev, nom: e.target.value }))}
                        className="input-dark"
                      />
                      {errors.nom && (
                        <p className="text-xs text-destructive">{errors.nom}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-prenom">Prénom</Label>
                      <Input
                        id="signup-prenom"
                        placeholder="Prénom"
                        value={signupForm.prenom}
                        onChange={e => setSignupForm(prev => ({ ...prev, prenom: e.target.value }))}
                        className="input-dark"
                      />
                      {errors.prenom && (
                        <p className="text-xs text-destructive">{errors.prenom}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="votre@email.cm"
                      value={signupForm.email}
                      onChange={e => setSignupForm(prev => ({ ...prev, email: e.target.value }))}
                      className="input-dark"
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Mot de passe</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signupForm.password}
                      onChange={e => setSignupForm(prev => ({ ...prev, password: e.target.value }))}
                      className="input-dark"
                    />
                    {errors.password && (
                      <p className="text-xs text-destructive">{errors.password}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm">Confirmer le mot de passe</Label>
                    <Input
                      id="signup-confirm"
                      type="password"
                      placeholder="••••••••"
                      value={signupForm.confirmPassword}
                      onChange={e => setSignupForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="input-dark"
                    />
                    {errors.confirmPassword && (
                      <p className="text-xs text-destructive">{errors.confirmPassword}</p>
                    )}
                  </div>

                  <Button type="submit" variant="gold" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Inscription...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Créer mon compte
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Demo Access */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-center">Accès Démo Rapide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin('admin')}
                className="flex-col h-auto py-3"
              >
                <span className="text-xs font-semibold text-destructive">Admin</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin('gestionnaire')}
                className="flex-col h-auto py-3"
              >
                <span className="text-xs font-semibold text-info">Gestionnaire</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin('client')}
                className="flex-col h-auto py-3"
              >
                <span className="text-xs font-semibold text-success">Client</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-xs text-center text-muted-foreground">
          © 2024 E³W - Epsilon Early Warning Engine
        </p>
      </div>
    </div>
  );
}
