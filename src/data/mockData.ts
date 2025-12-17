// Mock Data for E³W - Epsilon Early Warning Engine
// Realistic Cameroonian banking data

export interface Company {
  id: string;
  name: string;
  sigle: string;
  rccm: string;
  responsable: string;
  siege: string;
  secteur: string;
  dateCreation: string;
  logo?: string;
  nbEmployes: number;
}

export interface Staff {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: 'admin' | 'gestionnaire' | 'client';
  avatar: string;
  telephone?: string;
  charge?: number; // For gestionnaires - number of assigned clients
}

export interface ClientSalarie {
  id: string;
  type: 'salarie';
  nom: string;
  prenom: string;
  age: number;
  sexe: 'M' | 'F';
  telephone: string;
  email: string;
  avatar: string;
  employeurId: string;
  fonction: string;
  revenuNet: number;
  ancienneteEmploi: number; // months
  ancienneteBanque: number; // months
  personnesCharge: number;
  kycComplete: boolean;
  statut: 'nouveau' | 'en_cours' | 'panier' | 'comite' | 'approuve' | 'rejete';
  gestionnaireId?: string;
  adresse?: string;
  dateNaissance?: string;
  lieuNaissance?: string;
  nationalite?: string;
  cni?: string;
  situationMatrimoniale?: string;
}

export interface ClientIndependant {
  id: string;
  type: 'independant';
  nom: string;
  prenom: string;
  age: number;
  sexe: 'M' | 'F';
  telephone: string;
  email: string;
  avatar: string;
  activite: string;
  secteur: string;
  chiffreAffaires: number;
  margeNette: number;
  ancienneteBanque: number;
  kycComplete: boolean;
  statut: 'nouveau' | 'en_cours' | 'panier' | 'comite' | 'approuve' | 'rejete';
  gestionnaireId?: string;
  adresse?: string;
}

export interface ClientEntreprise {
  id: string;
  type: 'entreprise';
  companyId: string;
  telephone: string;
  email: string;
  kycComplete: boolean;
  statut: 'nouveau' | 'en_cours' | 'panier' | 'comite' | 'approuve' | 'rejete';
  gestionnaireId?: string;
}

export type Client = ClientSalarie | ClientIndependant | ClientEntreprise;

export interface CreditInterne {
  id: string;
  clientId: string;
  dateOctroi: string;
  montantInitial: number;
  type: string;
  mensualite: number;
  encours: number;
  statut: 'sain' | 'sensible' | 'douteux';
}

export interface CreditBEAC {
  id: string;
  clientId: string;
  banque: string;
  typeEngagement: string;
  montantInitial: number;
  soldeRestant: number;
  impayes: number;
  joursRetard: number;
  statut: 'sain' | 'douteux' | 'compromis';
}

// Companies data - Real Cameroonian companies
export const companies: Company[] = [
  { id: 'c1', name: 'MTN Cameroon', sigle: 'MTN', rccm: 'RC/DLA/2000/B/4521', responsable: 'Stephen Blewett', siege: 'Douala, Akwa', secteur: 'Télécommunications', dateCreation: '2000-02-15', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/New-mtn-logo.svg/200px-New-mtn-logo.svg.png', nbEmployes: 1200 },
  { id: 'c2', name: 'Orange Cameroun', sigle: 'ORANGE', rccm: 'RC/DLA/1999/B/3892', responsable: 'Patrick Benon', siege: 'Douala, Bonapriso', secteur: 'Télécommunications', dateCreation: '1999-07-20', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Orange_logo.svg/200px-Orange_logo.svg.png', nbEmployes: 950 },
  { id: 'c3', name: 'Cameroon Telecommunications', sigle: 'CAMTEL', rccm: 'RC/YDE/1998/B/2145', responsable: 'Judith Yah Sunday', siege: 'Yaoundé, Centre Administratif', secteur: 'Télécommunications', dateCreation: '1998-09-01', logo: 'https://www.camtel.cm/wp-content/uploads/2023/02/logo-camtel.png', nbEmployes: 3500 },
  { id: 'c4', name: 'Boissons du Cameroun', sigle: 'SABC', rccm: 'RC/DLA/1948/B/0234', responsable: 'Emmanuel de Tailly', siege: 'Douala, Zone Bassa', secteur: 'Agroalimentaire', dateCreation: '1948-05-12', logo: 'https://www.safricas-logistics.com/wp-content/uploads/2019/12/SABC.jpg', nbEmployes: 2800 },
  { id: 'c5', name: 'Afriland First Bank', sigle: 'AFRILAND', rccm: 'RC/YDE/1987/B/1567', responsable: 'Alphonse Nafack', siege: 'Yaoundé, Hippodrome', secteur: 'Banque', dateCreation: '1987-11-15', nbEmployes: 1800 },
  { id: 'c6', name: 'BICEC', sigle: 'BICEC', rccm: 'RC/DLA/1962/B/0892', responsable: 'Pierre Manet', siege: 'Douala, Bonanjo', secteur: 'Banque', dateCreation: '1962-03-22', nbEmployes: 2200 },
  { id: 'c7', name: 'Eneo Cameroun', sigle: 'ENEO', rccm: 'RC/DLA/2014/B/8934', responsable: 'Eric Mansuy', siege: 'Douala, Bonanjo', secteur: 'Énergie', dateCreation: '2014-07-01', nbEmployes: 4500 },
  { id: 'c8', name: 'TotalEnergies Cameroun', sigle: 'TOTAL', rccm: 'RC/DLA/1955/B/0456', responsable: 'Adrien Béchonnet', siege: 'Douala, Bonanjo', secteur: 'Pétrole & Gaz', dateCreation: '1955-08-10', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/TotalEnergies_logo.svg/200px-TotalEnergies_logo.svg.png', nbEmployes: 890 },
  { id: 'c9', name: 'Cimencam', sigle: 'CIMENCAM', rccm: 'RC/DLA/1963/B/0987', responsable: 'Benoît Galichon', siege: 'Douala, Bonabéri', secteur: 'Industrie', dateCreation: '1963-06-18', nbEmployes: 750 },
  { id: 'c10', name: 'Canal+ Cameroun', sigle: 'CANAL+', rccm: 'RC/DLA/2001/B/5678', responsable: 'Jacques du Puy', siege: 'Douala, Akwa', secteur: 'Média', dateCreation: '2001-04-05', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Canal%2B.svg/200px-Canal%2B.svg.png', nbEmployes: 320 },
  { id: 'c11', name: 'Aéroports du Cameroun', sigle: 'ADC', rccm: 'RC/DLA/2005/B/6234', responsable: 'Jean-Paul Nkengue', siege: 'Douala Aéroport', secteur: 'Transport', dateCreation: '2005-01-15', nbEmployes: 650 },
  { id: 'c12', name: 'Camair-Co', sigle: 'CAMAIR', rccm: 'RC/YDE/2011/B/7845', responsable: 'Louis Georges Njipendi', siege: 'Yaoundé Nsimalen', secteur: 'Transport Aérien', dateCreation: '2011-03-28', nbEmployes: 480 },
  { id: 'c13', name: 'CNPS', sigle: 'CNPS', rccm: 'RC/YDE/1969/B/0123', responsable: 'Alain Noël Olivier Mekulu', siege: 'Yaoundé, Centre', secteur: 'Assurance Sociale', dateCreation: '1969-10-01', nbEmployes: 2100 },
  { id: 'c14', name: 'Activa Assurances', sigle: 'ACTIVA', rccm: 'RC/DLA/1998/B/3456', responsable: 'Robert Sobze', siege: 'Douala, Bonanjo', secteur: 'Assurance', dateCreation: '1998-06-12', nbEmployes: 420 },
  { id: 'c15', name: 'Dangote Cement Cameroon', sigle: 'DANGOTE', rccm: 'RC/DLA/2015/B/9012', responsable: 'Babatunde Akinwumi', siege: 'Douala, Kribi', secteur: 'Industrie', dateCreation: '2015-02-28', logo: 'https://upload.wikimedia.org/wikipedia/commons/3/39/Dangote_Industries_logo.png', nbEmployes: 560 },
];

// Staff data
export const staff: Staff[] = [
  { id: 's1', nom: 'Onana', prenom: 'Ngoua', email: 'admin@e3w.cm', role: 'admin', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', telephone: '+237 6 99 88 77 66' },
  { id: 's2', nom: 'Ngapna', prenom: 'Ahmed', email: 'ahmed@e3w.cm', role: 'gestionnaire', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face', telephone: '+237 6 77 66 55 44', charge: 45 },
  { id: 's3', nom: 'Kemajou', prenom: 'Oswald', email: 'oswald@e3w.cm', role: 'gestionnaire', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', telephone: '+237 6 55 44 33 22', charge: 38 },
  { id: 's4', nom: 'Landre', prenom: 'Nana', email: 'nana@e3w.cm', role: 'gestionnaire', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face', telephone: '+237 6 44 33 22 11', charge: 42 },
];

// Cameroonian first names
const prenomsHommes = ['Jean', 'Pierre', 'Paul', 'Emmanuel', 'Samuel', 'David', 'Joseph', 'Martin', 'François', 'André', 'Michel', 'Éric', 'Patrick', 'Olivier', 'Thierry', 'Serge', 'Bruno', 'Alain', 'Christian', 'Hervé'];
const prenomsFemmes = ['Marie', 'Jeanne', 'Pauline', 'Esther', 'Ruth', 'Béatrice', 'Christine', 'Sylvie', 'Nadine', 'Cécile', 'Isabelle', 'Monique', 'Thérèse', 'Véronique', 'Pascale', 'Hortense', 'Clarisse', 'Angèle', 'Rose', 'Élisabeth'];
const noms = ['Ekedi', 'Abena', 'Tchinda', 'Fotso', 'Kamga', 'Ndjock', 'Mbarga', 'Eyinga', 'Ngono', 'Atangana', 'Essomba', 'Owona', 'Nkoulou', 'Mvondo', 'Bella', 'Etoa', 'Messi', 'Zogo', 'Mengue', 'Ondoa', 'Biloa', 'Nlend', 'Manga', 'Ndongo', 'Ongola'];

const activites = ['Commerce Général', 'Import-Export', 'Restauration', 'Transport', 'Agriculture', 'Conseil', 'Formation', 'BTP', 'Artisanat', 'Services Numériques'];
const fonctions = ['Comptable', 'Ingénieur', 'Technicien', 'Commercial', 'Manager', 'Directeur', 'Analyste', 'Chef de Projet', 'Assistant', 'Responsable RH'];

// Avatar URLs - realistic African faces
const avatarsHommes = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1463453091185-61582044d556?w=150&h=150&fit=crop&crop=face',
];

const avatarsFemmes = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1523824921871-d6f1a15151f1?w=150&h=150&fit=crop&crop=face',
];

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateClients(): Client[] {
  const clients: Client[] = [];
  
  // Generate 50 salaried clients
  for (let i = 0; i < 50; i++) {
    const sexe = Math.random() > 0.4 ? 'M' : 'F';
    const prenom = sexe === 'M' ? randomElement(prenomsHommes) : randomElement(prenomsFemmes);
    const avatar = sexe === 'M' ? randomElement(avatarsHommes) : randomElement(avatarsFemmes);
    
    clients.push({
      id: `sal_${i + 1}`,
      type: 'salarie',
      nom: randomElement(noms),
      prenom,
      age: 25 + Math.floor(Math.random() * 35),
      sexe,
      telephone: `+237 6 ${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 90 + 10)}`,
      email: `${prenom.toLowerCase()}.${randomElement(noms).toLowerCase()}@email.cm`,
      avatar,
      employeurId: randomElement(companies).id,
      fonction: randomElement(fonctions),
      revenuNet: Math.floor(Math.random() * 1500000 + 200000),
      ancienneteEmploi: Math.floor(Math.random() * 180 + 6),
      ancienneteBanque: Math.floor(Math.random() * 120 + 3),
      personnesCharge: Math.floor(Math.random() * 6),
      kycComplete: Math.random() > 0.3,
      statut: randomElement(['nouveau', 'en_cours', 'panier', 'approuve'] as const),
      gestionnaireId: Math.random() > 0.2 ? randomElement(['s2', 's3', 's4']) : undefined,
      adresse: `${randomElement(['Bastos', 'Essos', 'Mvan', 'Biyem-Assi', 'Akwa', 'Bonapriso', 'Deido', 'Bonamoussadi'])}, ${randomElement(['Yaoundé', 'Douala'])}`,
      nationalite: 'Camerounaise',
      situationMatrimoniale: randomElement(['Célibataire', 'Marié(e)', 'Divorcé(e)', 'Veuf(ve)']),
    });
  }
  
  // Generate 30 independent clients
  for (let i = 0; i < 30; i++) {
    const sexe = Math.random() > 0.35 ? 'M' : 'F';
    const prenom = sexe === 'M' ? randomElement(prenomsHommes) : randomElement(prenomsFemmes);
    const avatar = sexe === 'M' ? randomElement(avatarsHommes) : randomElement(avatarsFemmes);
    
    clients.push({
      id: `ind_${i + 1}`,
      type: 'independant',
      nom: randomElement(noms),
      prenom,
      age: 28 + Math.floor(Math.random() * 30),
      sexe,
      telephone: `+237 6 ${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 90 + 10)}`,
      email: `${prenom.toLowerCase()}.${randomElement(noms).toLowerCase()}@email.cm`,
      avatar,
      activite: randomElement(activites),
      secteur: randomElement(['Commerce', 'Services', 'Agriculture', 'Artisanat', 'BTP']),
      chiffreAffaires: Math.floor(Math.random() * 80000000 + 5000000),
      margeNette: Math.floor(Math.random() * 20 + 5),
      ancienneteBanque: Math.floor(Math.random() * 96 + 6),
      kycComplete: Math.random() > 0.4,
      statut: randomElement(['nouveau', 'en_cours', 'panier'] as const),
      gestionnaireId: Math.random() > 0.25 ? randomElement(['s2', 's3', 's4']) : undefined,
      adresse: `${randomElement(['Marché Central', 'Mokolo', 'Mboppi', 'Nkoldongo', 'Briqueterie'])}, ${randomElement(['Yaoundé', 'Douala'])}`,
    });
  }
  
  // Generate 15 enterprise clients
  for (let i = 0; i < 15; i++) {
    const company = companies[i % companies.length];
    clients.push({
      id: `ent_${i + 1}`,
      type: 'entreprise',
      companyId: company.id,
      telephone: `+237 2 ${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 90 + 10)}`,
      email: `contact@${company.sigle.toLowerCase()}.cm`,
      kycComplete: Math.random() > 0.25,
      statut: randomElement(['nouveau', 'en_cours', 'panier', 'approuve'] as const),
      gestionnaireId: Math.random() > 0.2 ? randomElement(['s2', 's3', 's4']) : undefined,
    });
  }
  
  return clients;
}

export const clients = generateClients();

// Generate credit history
export function generateCreditsInterne(clientId: string): CreditInterne[] {
  const count = Math.floor(Math.random() * 3);
  const credits: CreditInterne[] = [];
  
  for (let i = 0; i < count; i++) {
    const montant = Math.floor(Math.random() * 15000000 + 500000);
    const encours = Math.floor(montant * (Math.random() * 0.7 + 0.1));
    credits.push({
      id: `ci_${clientId}_${i}`,
      clientId,
      dateOctroi: `202${Math.floor(Math.random() * 4)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      montantInitial: montant,
      type: randomElement(['Crédit Scolaire', 'Crédit Conso', 'Crédit Auto', 'Crédit Immobilier']),
      mensualite: Math.floor(montant / (Math.random() * 36 + 12)),
      encours,
      statut: encours < montant * 0.3 ? 'sain' : (Math.random() > 0.7 ? 'douteux' : 'sensible'),
    });
  }
  
  return credits;
}

export function generateCreditsBEAC(clientId: string): CreditBEAC[] {
  const count = Math.floor(Math.random() * 2);
  const credits: CreditBEAC[] = [];
  const banques = ['UBA', 'SCB', 'SGBC', 'Ecobank', 'Standard Chartered'];
  
  for (let i = 0; i < count; i++) {
    const montant = Math.floor(Math.random() * 25000000 + 1000000);
    const solde = Math.floor(montant * (Math.random() * 0.6 + 0.2));
    const impayes = Math.random() > 0.7 ? Math.floor(Math.random() * 3000000) : 0;
    
    credits.push({
      id: `cb_${clientId}_${i}`,
      clientId,
      banque: randomElement(banques),
      typeEngagement: randomElement(['Découvert', 'Crédit MT', 'Crédit LT', 'Caution']),
      montantInitial: montant,
      soldeRestant: solde,
      impayes,
      joursRetard: impayes > 0 ? Math.floor(Math.random() * 90 + 1) : 0,
      statut: impayes === 0 ? 'sain' : (impayes > 1000000 ? 'compromis' : 'douteux'),
    });
  }
  
  return credits;
}

export const typesCredit = [
  { id: 'scolaire', label: 'Crédit Scolaire', taux: 8.5 },
  { id: 'conso', label: 'Crédit Consommation', taux: 12.0 },
  { id: 'auto', label: 'Crédit Auto', taux: 10.5 },
  { id: 'immo', label: 'Crédit Immobilier', taux: 7.5 },
  { id: 'equipement', label: 'Crédit Équipement', taux: 9.0 },
  { id: 'tresorerie', label: 'Crédit Trésorerie', taux: 14.0 },
];

export const typesGarantie = [
  { id: 'personnelle', label: 'Garantie Personnelle (Caution)' },
  { id: 'immo', label: 'Garantie Réelle - Bien Immobilier' },
  { id: 'vehicule', label: 'Garantie Réelle - Véhicule' },
  { id: 'nantissement', label: 'Nantissement' },
];
