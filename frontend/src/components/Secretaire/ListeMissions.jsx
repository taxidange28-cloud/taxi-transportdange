import React, { useState, useEffect } from 'react';
import { getMissions, deleteMission, getChauffeurs } from '../../services/api';
import api from '../../services/api';
import Button from '../Common/Button';
import Card from '../Common/Card';
import { useToast, ToastContainer } from '../Common/NotificationToast';
import { Edit, Trash2, Send, Filter, Download } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';

const ListeMissions = () => {
  const [missions, setMissions] = useState([]);
  const [chauffeurs, setChauffeurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const { toasts, showToast, removeToast } = useToast();
  const [filters, setFilters] = useState({
    statut: '',
    date_debut: format(new Date(), 'yyyy-MM-dd'),
    date_fin: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      const [missionsRes, chauffeursRes] = await Promise.all([
        getMissions(filters),
        getChauffeurs(),
      ]);
      setMissions(missionsRes.data);
      setChauffeurs(chauffeursRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement données:', error);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette mission ?')) {
      return;
    }

    try {
      await deleteMission(id);
      setMissions(missions.filter(m => m.id !== id));
      showToast('Mission supprimée avec succès', 'success');
    } catch (error) {
      console.error('Erreur suppression mission:', error);
      showToast('Erreur lors de la suppression de la mission', 'error');
    }
  };

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const response = await api.get('/export/excel', {
        params: filters,
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `missions-${format(new Date(), 'yyyy-MM-dd-HHmm')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      showToast('Export Excel réussi !', 'success');
    } catch (error) {
      console.error('Erreur export:', error);
      showToast('Erreur lors de l\'export Excel. Vérifiez que le serveur supporte cette fonctionnalité.', 'error', 7000);
    } finally {
      setExporting(false);
    }
  };

  const getStatutBadge = (statut) => {
    const badges = {
      brouillon: { label: 'Brouillon', color: 'bg-gray-200 text-gray-800' },
      envoyee: { label: 'Envoyée', color: 'bg-blue-500 text-white' },
      confirmee: { label: 'Confirmée', color: 'bg-yellow-500 text-white' },
      pec: { label: 'En cours', color: 'bg-red-500 text-white' },
      terminee: { label: 'Terminée', color: 'bg-green-500 text-white' },
    };
    return badges[statut] || badges.brouillon;
  };

  const getChauffeurName = (chauffeurId) => {
    const chauffeur = chauffeurs.find(c => c.id === chauffeurId);
    return chauffeur ? chauffeur.nom : 'Non assigné';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Liste des missions</h2>
        <Button
          onClick={handleExportExcel}
          disabled={exporting || missions.length === 0}
          size="sm"
          className="flex items-center space-x-2 w-full sm:w-auto"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">{exporting ? 'Export...' : '📥 Exporter Excel'}</span>
          <span className="sm:hidden">{exporting ? 'Export...' : '📥 Excel'}</span>
        </Button>
      </div>

      {/* Filtres */}
      <Card className="mb-6">
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <select
                value={filters.statut}
                onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Tous les statuts</option>
                <option value="brouillon">Brouillon</option>
                <option value="envoyee">Envoyée</option>
                <option value="confirmee">Confirmée</option>
                <option value="pec">En cours</option>
                <option value="terminee">Terminée</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date début
              </label>
              <input
                type="date"
                value={filters.date_debut}
                onChange={(e) => setFilters({ ...filters, date_debut: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date fin
              </label>
              <input
                type="date"
                value={filters.date_fin}
                onChange={(e) => setFilters({ ...filters, date_fin: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Liste des missions */}
      {missions.length === 0 ? (
        <Card>
          <p className="text-center text-gray-500">Aucune mission trouvée</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {missions.map((mission) => {
            const statutBadge = getStatutBadge(mission.statut);
            return (
              <Card key={mission.id}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statutBadge.color}`}>
                        {statutBadge.label}
                      </span>
                      <span className="text-sm text-gray-500">
                        {format(new Date(mission.date_mission + 'T' + mission.heure_prevue), 'dd/MM/yyyy HH:mm', { locale: fr })}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                      {mission.client}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      De: <span className="font-medium">{mission.adresse_depart}</span>
                      <br />
                      À: <span className="font-medium">{mission.adresse_arrivee}</span>
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Chauffeur: {getChauffeurName(mission.chauffeur_id)}</span>
                      <span>Type: {mission.type}</span>
                      {mission.prix && <span>Prix: {mission.prix} €</span>}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(mission.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      
      {/* Toast notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default ListeMissions;
