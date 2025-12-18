import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronRight, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Register() {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setIsLoading(true);
    
    // Simulate registration
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Inscription réussie !",
      description: "Votre compte a été créé. Un gestionnaire vous sera assigné prochainement.",
    });
    
    setIsLoading(false);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
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
          <div className="flex items-center gap-2 mb-6">
            <Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h2 className="text-2xl font-bold text-foreground font-display">Inscription</h2>
              <p className="text-sm text-muted-foreground">Créez votre compte emprunteur</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom</Label>
                <Input
                  id="nom"
                  name="nom"
                  placeholder="EKEDI"
                  value={formData.nom}
                  onChange={handleChange}
                  className="input-dark"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prenom">Prénom</Label>
                <Input
                  id="prenom"
                  name="prenom"
                  placeholder="Jean-Paul"
                  value={formData.prenom}
                  onChange={handleChange}
                  className="input-dark"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="votre@email.cm"
                value={formData.email}
                onChange={handleChange}
                className="input-dark"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telephone">Téléphone</Label>
              <Input
                id="telephone"
                name="telephone"
                type="tel"
                placeholder="+237 6 XX XX XX XX"
                value={formData.telephone}
                onChange={handleChange}
                className="input-dark"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="input-dark"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="input-dark"
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <Button type="submit" variant="gold" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? 'Création en cours...' : 'Créer mon compte'}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Après inscription :</p>
                <ul className="space-y-1">
                  <li>• Un gestionnaire vous sera assigné</li>
                  <li>• Complétez votre dossier client</li>
                  <li>• Accédez aux simulations de crédit</li>
                </ul>
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Déjà inscrit ?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
