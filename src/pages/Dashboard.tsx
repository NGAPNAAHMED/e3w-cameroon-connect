import { Routes, Route } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import GestionnaireDashboard from './dashboard/GestionnaireDashboard';
import CockpitTraitement from './dashboard/CockpitTraitement';
import AdminDashboard from './dashboard/AdminDashboard';
import ClientDashboard from './dashboard/ClientDashboard';

export default function Dashboard() {
  const { user } = useAuth();

  const getDefaultDashboard = () => {
    switch (user?.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'gestionnaire':
        return <GestionnaireDashboard />;
      case 'client':
        return <ClientDashboard />;
      default:
        return <GestionnaireDashboard />;
    }
  };

  return (
    <DashboardLayout>
      <Routes>
        <Route index element={getDefaultDashboard()} />
        <Route path="portefeuille" element={<GestionnaireDashboard />} />
        <Route path="cockpit/:clientId" element={<CockpitTraitement />} />
        <Route path="panier" element={<PanierPage />} />
        <Route path="dossiers" element={<DossiersPage />} />
        <Route path="nouveaux" element={<NouveauxInscritsPage />} />
        <Route path="gestionnaires" element={<GestionnairesPage />} />
        <Route path="reassignations" element={<ReassignationsPage />} />
        <Route path="comite" element={<ComitePage />} />
        <Route path="kyc" element={<KYCPage />} />
        <Route path="demandes" element={<DemandesPage />} />
      </Routes>
    </DashboardLayout>
  );
}

// Placeholder pages
function PanierPage() {
  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold font-display mb-4">Panier</h1>
      <p className="text-muted-foreground">Dossiers prêts à transmettre au comité</p>
    </div>
  );
}

function DossiersPage() {
  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold font-display mb-4">Mes Dossiers</h1>
      <p className="text-muted-foreground">Historique de vos dossiers traités</p>
    </div>
  );
}

function NouveauxInscritsPage() {
  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold font-display mb-4">Nouveaux Inscrits</h1>
      <p className="text-muted-foreground">Clients en attente d'assignation</p>
    </div>
  );
}

function GestionnairesPage() {
  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold font-display mb-4">Gestionnaires</h1>
      <p className="text-muted-foreground">Équipe de gestionnaires</p>
    </div>
  );
}

function ReassignationsPage() {
  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold font-display mb-4">Réassignations</h1>
      <p className="text-muted-foreground">Transferts de dossiers</p>
    </div>
  );
}

function ComitePage() {
  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold font-display mb-4">Dossiers Comité</h1>
      <p className="text-muted-foreground">Dossiers en attente de validation</p>
    </div>
  );
}

function KYCPage() {
  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold font-display mb-4">Ma Fiche KYC</h1>
      <p className="text-muted-foreground">Complétez vos informations personnelles</p>
    </div>
  );
}

function DemandesPage() {
  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold font-display mb-4">Mes Demandes</h1>
      <p className="text-muted-foreground">Suivi de vos demandes de crédit</p>
    </div>
  );
}
