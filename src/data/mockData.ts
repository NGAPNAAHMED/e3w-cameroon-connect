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
  charge?: number;
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
  ancienneteEmploi: number;
  ancienneteBanque: number;
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
  personnesCharge?: number;
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
  impayes: number;
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

export interface Message {
  id: string;
  clientId: string;
  gestionnaireId: string;
  type: 'demande_pret' | 'probleme' | 'rdv' | 'autre';
  sujet: string;
  contenu: string;
  reponseAuto?: string;
  dateEnvoi: Date;
  lu: boolean;
}

// Extended Companies data - Real Cameroonian companies
export const companies: Company[] = [
  { id: 'c1', name: 'MTN Cameroon', sigle: 'MTN', rccm: 'RC/DLA/2000/B/4521', responsable: 'Stephen Blewett', siege: 'Douala, Akwa', secteur: 'Télécommunications', dateCreation: '2000-02-15', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/New-mtn-logo.svg/200px-New-mtn-logo.svg.png', nbEmployes: 1200 },
  { id: 'c2', name: 'Orange Cameroun', sigle: 'ORANGE', rccm: 'RC/DLA/1999/B/3892', responsable: 'Patrick Benon', siege: 'Douala, Bonapriso', secteur: 'Télécommunications', dateCreation: '1999-07-20', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Orange_logo.svg/200px-Orange_logo.svg.png', nbEmployes: 950 },
  { id: 'c3', name: 'Cameroon Telecommunications', sigle: 'CAMTEL', rccm: 'RC/YDE/1998/B/2145', responsable: 'Judith Yah Sunday', siege: 'Yaoundé, Centre Administratif', secteur: 'Télécommunications', dateCreation: '1998-09-01', nbEmployes: 3500 },
  { id: 'c4', name: 'Boissons du Cameroun', sigle: 'SABC', rccm: 'RC/DLA/1948/B/0234', responsable: 'Emmanuel de Tailly', siege: 'Douala, Zone Bassa', secteur: 'Agroalimentaire', dateCreation: '1948-05-12', nbEmployes: 2800 },
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
  // Additional companies
  { id: 'c16', name: 'Abbé Nestor Auto-École', sigle: 'ANA', rccm: 'RC/YDE/2010/B/1234', responsable: 'Abbé Nestor', siege: 'Yaoundé, Messa', secteur: 'Formation', dateCreation: '2010-03-15', nbEmployes: 45 },
  { id: 'c17', name: 'Acajou Palace Hôtel', sigle: 'ACAJOU', rccm: 'RC/DLA/2005/B/5678', responsable: 'Paul Tchouta', siege: 'Douala, Bonanjo', secteur: 'Hôtellerie', dateCreation: '2005-08-20', nbEmployes: 120 },
  { id: 'c18', name: 'Africa Global Logistics', sigle: 'AGL', rccm: 'RC/DLA/2018/B/9012', responsable: 'Michel Njoh', siege: 'Douala, Port', secteur: 'Logistique', dateCreation: '2018-01-01', nbEmployes: 890 },
  { id: 'c19', name: 'Agrocam', sigle: 'AGROCAM', rccm: 'RC/YDE/1995/B/3456', responsable: 'Jean Nkodo', siege: 'Yaoundé, Nsimeyong', secteur: 'Agriculture', dateCreation: '1995-06-12', nbEmployes: 350 },
  { id: 'c20', name: 'Air France Cameroun', sigle: 'AIR FRANCE', rccm: 'RC/DLA/1960/B/0789', responsable: 'François Blanc', siege: 'Douala, Akwa', secteur: 'Transport Aérien', dateCreation: '1960-04-05', nbEmployes: 180 },
  { id: 'c21', name: 'Allianz Cameroun', sigle: 'ALLIANZ', rccm: 'RC/DLA/2008/B/2345', responsable: 'Klaus Werner', siege: 'Douala, Bonapriso', secteur: 'Assurance', dateCreation: '2008-09-15', nbEmployes: 280 },
  { id: 'c22', name: 'Alpicam Industries', sigle: 'ALPICAM', rccm: 'RC/DLA/1992/B/6789', responsable: 'Pierre Alpi', siege: 'Douala, Bassa', secteur: 'Industrie Bois', dateCreation: '1992-11-20', nbEmployes: 1500 },
  { id: 'c23', name: 'Atlantic Bank Cameroun', sigle: 'ABC', rccm: 'RC/DLA/2007/B/0123', responsable: 'Moussa Diallo', siege: 'Douala, Bonanjo', secteur: 'Banque', dateCreation: '2007-03-01', nbEmployes: 450 },
  { id: 'c24', name: 'Banque Atlantique Cameroun', sigle: 'BACM', rccm: 'RC/DLA/2009/B/4567', responsable: 'Amadou Ba', siege: 'Douala, Akwa', secteur: 'Banque', dateCreation: '2009-06-15', nbEmployes: 380 },
  { id: 'c25', name: 'BEAC', sigle: 'BEAC', rccm: 'RC/YDE/1972/B/0001', responsable: 'Abbas Mahamat Tolli', siege: 'Yaoundé, Centre', secteur: 'Banque Centrale', dateCreation: '1972-11-22', nbEmployes: 850 },
  { id: 'c26', name: 'Boulangerie Saker', sigle: 'SAKER', rccm: 'RC/DLA/1985/B/8901', responsable: 'Daniel Saker', siege: 'Douala, Akwa Nord', secteur: 'Agroalimentaire', dateCreation: '1985-02-14', nbEmployes: 200 },
  { id: 'c27', name: 'Canal 2 International', sigle: 'CANAL2', rccm: 'RC/DLA/1995/B/2345', responsable: 'Samuel Minkeng', siege: 'Douala, Bonanjo', secteur: 'Média', dateCreation: '1995-12-01', nbEmployes: 250 },
  { id: 'c28', name: 'Congelcam', sigle: 'CONGELCAM', rccm: 'RC/DLA/1976/B/6789', responsable: 'Jean-Pierre Amougou', siege: 'Douala, Port', secteur: 'Agroalimentaire', dateCreation: '1976-08-10', nbEmployes: 1200 },
  { id: 'c29', name: 'Hôtel Sawa', sigle: 'SAWA', rccm: 'RC/DLA/1980/B/0123', responsable: 'Marie Ebongue', siege: 'Douala, Bonanjo', secteur: 'Hôtellerie', dateCreation: '1980-05-25', nbEmployes: 180 },
  { id: 'c30', name: 'UBA Cameroun', sigle: 'UBA', rccm: 'RC/DLA/2007/B/4567', responsable: 'Isong Uyo', siege: 'Douala, Akwa', secteur: 'Banque', dateCreation: '2007-08-01', nbEmployes: 520 },
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

// Avatar URLs
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
  const clientsList: Client[] = [];
  
  // Generate salaried clients
  for (let i = 0; i < 50; i++) {
    const sexe = Math.random() > 0.4 ? 'M' : 'F';
    const prenom = sexe === 'M' ? randomElement(prenomsHommes) : randomElement(prenomsFemmes);
    const avatar = sexe === 'M' ? randomElement(avatarsHommes) : randomElement(avatarsFemmes);
    
    clientsList.push({
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
      dateNaissance: `${1970 + Math.floor(Math.random() * 30)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      lieuNaissance: randomElement(['Yaoundé', 'Douala', 'Bafoussam', 'Bamenda', 'Garoua']),
      cni: `${Math.floor(Math.random() * 900000000 + 100000000)}`,
    });
  }
  
  // Generate independent clients - Some WITHOUT KYC complete
  for (let i = 0; i < 30; i++) {
    const sexe = Math.random() > 0.35 ? 'M' : 'F';
    const prenom = sexe === 'M' ? randomElement(prenomsHommes) : randomElement(prenomsFemmes);
    const avatar = sexe === 'M' ? randomElement(avatarsHommes) : randomElement(avatarsFemmes);
    
    // First 10 independants have NO KYC
    const hasKyc = i >= 10 ? Math.random() > 0.3 : false;
    
    clientsList.push({
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
      personnesCharge: Math.floor(Math.random() * 5),
      kycComplete: hasKyc,
      statut: randomElement(['nouveau', 'en_cours', 'panier'] as const),
      gestionnaireId: Math.random() > 0.25 ? randomElement(['s2', 's3', 's4']) : undefined,
      adresse: hasKyc ? `${randomElement(['Marché Central', 'Mokolo', 'Mboppi', 'Nkoldongo', 'Briqueterie'])}, ${randomElement(['Yaoundé', 'Douala'])}` : undefined,
      dateNaissance: hasKyc ? `${1975 + Math.floor(Math.random() * 25)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}` : undefined,
      lieuNaissance: hasKyc ? randomElement(['Yaoundé', 'Douala', 'Bafoussam']) : undefined,
      nationalite: 'Camerounaise',
      cni: hasKyc ? `${Math.floor(Math.random() * 900000000 + 100000000)}` : undefined,
      situationMatrimoniale: hasKyc ? randomElement(['Célibataire', 'Marié(e)']) : undefined,
    });
  }
  
  // Generate enterprise clients
  for (let i = 0; i < 15; i++) {
    const company = companies[i % companies.length];
    clientsList.push({
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
  
  return clientsList;
}

export const clients = generateClients();

// Generate credit history with impayes
export function generateCreditsInterne(clientId: string): CreditInterne[] {
  const count = Math.floor(Math.random() * 3);
  const credits: CreditInterne[] = [];
  
  for (let i = 0; i < count; i++) {
    const montant = Math.floor(Math.random() * 15000000 + 500000);
    const encours = Math.floor(montant * (Math.random() * 0.7 + 0.1));
    const impayes = Math.random() > 0.7 ? Math.floor(Math.random() * 500000) : 0;
    credits.push({
      id: `ci_${clientId}_${i}`,
      clientId,
      dateOctroi: `202${Math.floor(Math.random() * 4)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      montantInitial: montant,
      type: randomElement(['Crédit Scolaire', 'Crédit Conso', 'Crédit Auto', 'Crédit Immobilier']),
      mensualite: Math.floor(montant / (Math.random() * 36 + 12)),
      encours,
      impayes,
      statut: impayes > 0 ? 'douteux' : (encours < montant * 0.3 ? 'sain' : 'sensible'),
    });
  }
  
  return credits;
}

export function generateCreditsBEAC(clientId: string): CreditBEAC[] {
  const count = Math.floor(Math.random() * 3);
  const credits: CreditBEAC[] = [];
  const banques = ['UBA', 'SCB', 'SGBC', 'Ecobank', 'Standard Chartered', 'Afriland', 'BICEC', 'Banque Atlantique'];
  
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
  { id: 'scolaire', label: 'Crédit Scolaire', taux: 8.5, actif: true },
  { id: 'conso', label: 'Crédit Consommation', taux: 12.0, actif: true },
  { id: 'auto', label: 'Crédit Auto', taux: 10.5, actif: true },
  { id: 'immo', label: 'Crédit Immobilier', taux: 7.5, actif: true },
  { id: 'equipement', label: 'Crédit Équipement', taux: 9.0, actif: true },
  { id: 'tresorerie', label: 'Crédit Trésorerie', taux: 14.0, actif: false },
];

export const typesGarantie = [
  { id: 'personnelle', label: 'Garantie Personnelle (Caution)' },
  { id: 'immo', label: 'Garantie Réelle - Bien Immobilier' },
  { id: 'vehicule', label: 'Garantie Réelle - Véhicule' },
  { id: 'nantissement', label: 'Nantissement' },
];

// Pre-defined messages for client contact
export const messagesPredefinis = {
  demande_pret: [
    { sujet: 'Demande de crédit scolaire', contenu: 'Je souhaite obtenir un crédit pour financer la scolarité de mes enfants.', reponseAuto: 'Votre demande de crédit scolaire a bien été reçue. Un gestionnaire vous contactera dans les 24h.' },
    { sujet: 'Demande de crédit consommation', contenu: 'Je souhaite obtenir un crédit consommation pour un projet personnel.', reponseAuto: 'Votre demande de crédit consommation a bien été enregistrée. Merci de compléter votre dossier KYC si ce n\'est pas fait.' },
    { sujet: 'Demande de crédit immobilier', contenu: 'Je souhaite obtenir un financement pour l\'achat d\'un bien immobilier.', reponseAuto: 'Votre demande de crédit immobilier nécessite une étude approfondie. Un conseiller spécialisé vous contactera.' },
  ],
  probleme: [
    { sujet: 'Problème de remboursement', contenu: 'Je rencontre des difficultés pour honorer mes échéances ce mois-ci.', reponseAuto: 'Nous avons bien reçu votre signalement. Un gestionnaire vous contactera pour étudier les solutions possibles.' },
    { sujet: 'Erreur sur mon compte', contenu: 'J\'ai constaté une erreur sur le solde de mon compte.', reponseAuto: 'Votre réclamation a été enregistrée. Notre équipe vérifiera et vous tiendra informé sous 48h.' },
    { sujet: 'Demande de relevé', contenu: 'Je souhaite obtenir un relevé détaillé de mon compte.', reponseAuto: 'Votre demande de relevé sera traitée dans les meilleurs délais.' },
  ],
  rdv: [
    { sujet: 'Demande de rendez-vous', contenu: 'Je souhaite prendre rendez-vous pour discuter de mon dossier.', reponseAuto: 'Votre demande de RDV a été transmise. Vous recevrez une proposition de créneau par SMS.' },
    { sujet: 'Modification de rendez-vous', contenu: 'Je souhaite reporter mon rendez-vous prévu.', reponseAuto: 'Votre demande de modification a été prise en compte.' },
  ],
};

// Messages storage
export const messagesClients: Message[] = [];
