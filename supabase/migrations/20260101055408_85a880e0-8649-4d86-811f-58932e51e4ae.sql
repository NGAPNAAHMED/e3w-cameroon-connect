-- Types d'utilisateurs
CREATE TYPE public.user_role AS ENUM ('admin', 'gestionnaire', 'client');
CREATE TYPE public.client_type AS ENUM ('salarie', 'independant', 'entreprise');
CREATE TYPE public.dossier_status AS ENUM ('en_cours', 'panier', 'analyse', 'transmis', 'approuve', 'refuse', 'classe');
CREATE TYPE public.credit_type_status AS ENUM ('actif', 'suspendu');

-- Table des profils utilisateurs
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  email TEXT,
  role user_role NOT NULL DEFAULT 'client',
  client_type client_type,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table des rôles utilisateurs (pour la sécurité)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL,
  UNIQUE(user_id, role)
);

-- Types de crédit
CREATE TABLE public.credit_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  libelle TEXT NOT NULL,
  taux_interet DECIMAL(5,2) NOT NULL,
  status credit_type_status NOT NULL DEFAULT 'actif',
  client_categories client_type[] NOT NULL DEFAULT '{}',
  montant_min BIGINT DEFAULT 100000,
  montant_max BIGINT DEFAULT 50000000,
  duree_min INTEGER DEFAULT 3,
  duree_max INTEGER DEFAULT 60,
  differe_max INTEGER DEFAULT 6,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Règles d'éligibilité par type de crédit
CREATE TABLE public.eligibility_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credit_type_id UUID REFERENCES public.credit_types(id) ON DELETE CASCADE NOT NULL,
  age_min INTEGER DEFAULT 18,
  age_max INTEGER DEFAULT 65,
  anciennete_min INTEGER DEFAULT 6,
  revenus_min BIGINT DEFAULT 50000,
  score_beac_min INTEGER DEFAULT 0,
  taux_endettement_max DECIMAL(5,2) DEFAULT 40,
  localisation TEXT,
  autres_criteres JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Règles d'octroi par type de crédit
CREATE TABLE public.award_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credit_type_id UUID REFERENCES public.credit_types(id) ON DELETE CASCADE NOT NULL,
  quotite_cessible DECIMAL(5,2) DEFAULT 40,
  ratio_couverture_garantie DECIMAL(5,2) DEFAULT 100,
  epargne_prealable DECIMAL(5,2) DEFAULT 10,
  delai_grace_max INTEGER DEFAULT 3,
  cautions_requises INTEGER DEFAULT 1,
  garanties_acceptees TEXT[] DEFAULT '{}',
  autres_conditions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Historique des modifications de types de crédit
CREATE TABLE public.credit_type_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credit_type_id UUID REFERENCES public.credit_types(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  motif TEXT,
  details JSONB DEFAULT '{}',
  user_id UUID REFERENCES auth.users(id),
  user_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Dossiers clients
CREATE TABLE public.dossiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL,
  gestionnaire_id UUID REFERENCES auth.users(id),
  credit_type_id UUID REFERENCES public.credit_types(id),
  montant BIGINT NOT NULL,
  duree INTEGER NOT NULL,
  differe INTEGER DEFAULT 0,
  status dossier_status NOT NULL DEFAULT 'en_cours',
  garanties JSONB DEFAULT '[]',
  kyc_data JSONB DEFAULT '{}',
  analysis_data JSONB,
  ai_recommendation JSONB,
  gestionnaire_remarks TEXT,
  score_global INTEGER,
  classe_risque TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Historique des dossiers
CREATE TABLE public.dossier_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id UUID REFERENCES public.dossiers(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  user_id UUID REFERENCES auth.users(id),
  user_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eligibility_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.award_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_type_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dossiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dossier_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to get user role from profiles
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE user_id = _user_id LIMIT 1
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for credit_types (public read for active types)
CREATE POLICY "Anyone can view active credit types" ON public.credit_types
  FOR SELECT USING (status = 'actif' OR public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Admins can manage credit types" ON public.credit_types
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for eligibility_rules
CREATE POLICY "Anyone can view eligibility rules" ON public.eligibility_rules
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage eligibility rules" ON public.eligibility_rules
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for award_rules
CREATE POLICY "Anyone can view award rules" ON public.award_rules
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage award rules" ON public.award_rules
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for credit_type_history
CREATE POLICY "Admins can view credit type history" ON public.credit_type_history
  FOR SELECT USING (public.get_user_role(auth.uid()) IN ('admin', 'gestionnaire'));
CREATE POLICY "System can insert history" ON public.credit_type_history
  FOR INSERT WITH CHECK (true);

-- RLS Policies for dossiers
CREATE POLICY "Gestionnaires can view their dossiers" ON public.dossiers
  FOR SELECT USING (gestionnaire_id = auth.uid() OR public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Gestionnaires can manage their dossiers" ON public.dossiers
  FOR ALL USING (gestionnaire_id = auth.uid() OR public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for dossier_history
CREATE POLICY "Users can view dossier history" ON public.dossier_history
  FOR SELECT USING (public.get_user_role(auth.uid()) IN ('admin', 'gestionnaire'));
CREATE POLICY "System can insert dossier history" ON public.dossier_history
  FOR INSERT WITH CHECK (true);

-- RLS Policies for notifications
CREATE POLICY "Users can view their notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update their notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "System can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- Trigger for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_credit_types_updated_at
  BEFORE UPDATE ON public.credit_types
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dossiers_updated_at
  BEFORE UPDATE ON public.dossiers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for creating profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, nom, prenom, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nom', 'Utilisateur'),
    COALESCE(NEW.raw_user_meta_data->>'prenom', 'Nouveau'),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'client')
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'client'));
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();