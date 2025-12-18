import { Routes, Route } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import GestionnaireDashboard from './dashboard/GestionnaireDashboard';
import CockpitTraitement from './dashboard/CockpitTraitement';
import AdminDashboard from './dashboard/AdminDashboard';
import ClientDashboard from './dashboard/ClientDashboard';
import ClientKYCForm from './client/ClientKYCForm';
import ClientSimulation from './client/ClientSimulation';
import ClientGestionnaire from './client/ClientGestionnaire';
import AdminNouveaux from './admin/AdminNouveaux';
import AdminGestionnaires from './admin/AdminGestionnaires';
import AdminComite from './admin/AdminComite';
import AdminParametres from './admin/AdminParametres';
import ManagerPanier from './manager/ManagerPanier';
import ManagerAgenda from './manager/ManagerAgenda';

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
        
        {/* Client Routes */}
        <Route path="dossier" element={<ClientKYCForm />} />
        <Route path="simulation" element={<ClientSimulation />} />
        <Route path="gestionnaire" element={<ClientGestionnaire />} />
        <Route path="demandes" element={<DemandesPage />} />
        
        {/* Manager Routes */}
        <Route path="portefeuille" element={<GestionnaireDashboard />} />
        <Route path="cockpit/:clientId" element={<CockpitTraitement />} />
        <Route path="panier" element={<ManagerPanier />} />
        <Route path="dossiers" element={<DossiersPage />} />
        <Route path="agenda" element={<ManagerAgenda />} />
        
        {/* Admin Routes */}
        <Route path="nouveaux" element={<AdminNouveaux />} />
        <Route path="gestionnaires" element={<AdminGestionnaires />} />
        <Route path="reassignations" element={<AdminGestionnaires />} />
        <Route path="comite" element={<AdminComite />} />
        <Route path="parametres" element={<AdminParametres />} />
        
        {/* Legacy routes */}
        <Route path="kyc" element={<ClientKYCForm />} />
      </Routes>
    </DashboardLayout>
  );
}

// Placeholder pages
function DossiersPage() {
  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold font-display mb-4">Mes Dossiers</h1>
      <p className="text-muted-foreground">Historique de vos dossiers traités</p>
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
