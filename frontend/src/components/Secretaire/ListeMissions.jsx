import React, { useState, useEffect, useCallback } from 'react';
import { getMissions, deleteMission, getChauffeurs } from '../../services/api';
import api from '../../services/api';
import Button from '../Common/Button';
import Card from '../Common/Card';
import { useToast, ToastContainer } from '../Common/NotificationToast';
import { Edit, Trash2, Send, Filter, Download } from 'lucide-react';
import { format, subDays, addDays } from 'date-fns';
import { fr } from 'date-fns/locale/fr';

/**
 * Composant de liste des missions avec filtres et export Excel
 * CORRECTION: Boucle infinie résolue en retirant showToast des dépendances
 */
const ListeMissions = () => {
  const [missions, setMissions] = useState([]);
  const [chauffeurs, setChauffeurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const { toasts, showToast, removeToast } = useToast();
  
  // Filtres par défaut : période de 60 jours (-30j à +30j)
  const getDefaultFilters = () => ({
    statut: '',
    date_debut: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    date_fin: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
  });
  
  const [filters, setFilters] = useState(getDefaultFilters);

  // Chargement des données avec protection memory leak
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        setLoading(true);
        const [missionsRes, chauffeursRes] = await Promise.all([
          getMissions(filters),
          getChauffeurs(),
        ]);
        
        if (isMounted) {
          setMissions(missionsRes.data || []);
          setChauffeurs(chauffeursRes.data || []);
          setLoading(false);
        }
      } catch (error) {
        console.error('Erreur chargement données:', error);
        if (isMounted) {
          showToast('Erreur lors du chargement des données', 'error');
          setLoading(false);
          setMissions([]);
          setChauffeurs([]);
        }
      }
    };

    loadData();
    
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]); // ✅ CORRECTION: Retrait de showToast pour éviter la boucle infinie

  // Fonction de suppression avec confirmation
  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette mission ?')) {
      return;
    }

    try {
      await deleteMission(id);
      setMissions(prevMissions => prevMissions.filter(m => m.id !== id));
      showToast('Mission supprimée avec succès', 'success');
    } catch (error) {
      console.error('Erreur suppression mission:', error);
      const errorMessage = error.response?.data?.message || 'Erreur lors de la suppression de la mission';
      showToast(errorMessage, 'error');
    }
  };

  // Export Excel amélioré avec gestion d'erreurs détaillée
  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const response = await api.get('/export/excel', {
        params: filters,
        responseType: 'blob'
      });
      
      // Vérifier que la réponse contient des données
      if (!response.data || response.data.size === 0) {
        throw new Error('Le fichier exporté est vide');
      }
      
      // Créer le lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `missions-${format(new Date(), 'yyyy-MM-dd-HHmm')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      
      // Nettoyage
      setTimeout(() => {
        link.remove();
        window.URL.revokeObjectURL(url);
      }, 100);
      
      showToast('Export Excel réussi !', 'success');
    } catch (error) {
      console.error('Erreur export:', error);
      const errorMessage = error.message || 'Erreur lors de l\'export Excel. Vérifiez que le serveur supporte cette fonctionnalité.';
      showToast(errorMessage, 'error', 7000);
    } finally {
      setExporting(false);
    }
  };

  // Fonction pour formater la date de manière robuste
  const formatMissionDateTime = useCallback((dateMission, heurePrevue) => {
    try {
      if (!dateMission || !heurePrevue) {
        return 'Date non définie';
      }

      // Parser manuellement la date et l'heure
      const [year, month, day] = dateMission.split('-');
      const [hours, minutes] = heurePrevue.split(':');
      
      const date = new Date(
        parseInt(year, 10),
        parseInt(month, 10) - 1, // Les mois commencent à 0
        parseInt(day, 10),
        parseInt(hours, 10),
        parseInt(minutes, 10)
      );
      
      // Vérifier si la date est valide
      if (isNaN(date.getTime())) {
        return `${dateMission} ${heurePrevue}`;
      }
      
      return format(date, 'dd/MM/yyyy HH:mm', { locale: fr });
    } catch (error) {
      console.error('Erreur formatage date:', error);
      return dateMission && heurePrevue ? `${dateMission} ${heurePrevue}` : 'Date invalide';
    }
  }, []);

  // Badge de statut mémorisé
  const getStatutBadge = useCallback((statut) => {
    const badges = {
      brouillon: { label: 'Brouillon', color: 'bg-gray-200 text-gray-800' },
      envoyee: { label: 'Envoyée', color: 'bg-blue-500 text-white' },
      confirmee: { label: 'Confirmée', color: 'bg-yellow-500 text-white' },
      pec: { label: 'En cours', color: 'bg-red-500 text-white' },
      terminee: { label: 'Terminée', color: 'bg-green-500 text-white' },
    };
    return badges[statut] || badges.brouillon;
  }, []);

  // Récupération du nom du chauffeur avec protection
  const getChauffeurName = useCallback((chauffeurId) => {
    if (!chauffeurs || chauffeurs.length === 0) {
      return 'Chargement...';
    }
    
    if (!chauffeurId) {
      return 'Non assigné';
    }
    
    const chauffeur = chauffeurs.find(c => c.id === chauffeurId);
    return chauffeur?.nom || 'Non assigné';
  }, [chauffeurs]);

  // État de chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      {/* En-tête avec bouton export */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Liste des missions</h2>
        <Button
          onClick={handleExportExcel}
          disabled={exporting || missions.length === 0}
          size="sm"
          className="flex items-center space-x-2 w-full sm:w-auto"
          aria-label="Exporter la liste des missions en Excel"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">{exporting ? 'Export en cours...' : '📥 Exporter Excel'}</span>
          <span className="sm:hidden">{exporting ? 'Export...' : '📥 Excel'}</span>
        </Button>
      </div>

      {/* Filtres */}
      <Card className="mb-6">
        <div className="flex items-start space-x-4">
          <Filter className="w-5 h-5 text-gray-600 mt-7" aria-hidden="true" />
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label 
                htmlFor="filter-statut" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Statut
              </label>
              <select
                id="filter-statut"
                value={filters.statut}
                onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={exporting}
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
              <label 
                htmlFor="filter-date-debut" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Date début
              </label>
              <input
                id="filter-date-debut"
                type="date"
                value={filters.date_debut}
                onChange={(e) => setFilters({ ...filters, date_debut: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={exporting}
              />
            </div>
            <div>
              <label 
                htmlFor="filter-date-fin" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Date fin
              </label>
              <input
                id="filter-date-fin"
                type="date"
                value={filters.date_fin}
                onChange={(e) => setFilters({ ...filters, date_fin: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={exporting}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Liste des missions */}
      {missions.length === 0 ? (
        <Card>
          <p className="text-center text-gray-500 py-4">Aucune mission trouvée pour cette période</p>
          <p className="text-center text-gray-400 text-sm">
            Essayez de modifier les filtres de date
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {missions.map((mission) => {
            const statutBadge = getStatutBadge(mission.statut);
            return (
              <Card key={mission.id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* En-tête avec badge et date */}
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <span 
                        className={`px-3 py-1 rounded-full text-sm font-medium ${statutBadge.color}`}
                        aria-label={`Statut: ${statutBadge.label}`}
                      >
                        {statutBadge.label}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatMissionDateTime(mission.date_mission, mission.heure_prevue)}
                      </span>
                    </div>
                    
                    {/* Nom du client */}
                    <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate">
                      {mission.client || 'Client non spécifié'}
                    </h3>
                    
                    {/* Téléphone du client (nouveau champ) */}
                    {mission.client_telephone && (
                      <p className="text-sm text-gray-600 mb-1">
                        📞 {mission.client_telephone}
                      </p>
                    )}
                    
                    {/* Adresses */}
                    <div className="text-sm text-gray-600 mb-2 space-y-1">
                      <p className="truncate">
                        <span className="text-gray-500">De:</span>{' '}
                        <span className="font-medium">{mission.adresse_depart || 'Non spécifié'}</span>
                      </p>
                      <p className="truncate">
                        <span className="text-gray-500">À:</span>{' '}
                        <span className="font-medium">{mission.adresse_arrivee || 'Non spécifié'}</span>
                      </p>
                    </div>
                    
                    {/* Informations complémentaires avec nouveaux champs */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                      <span className="truncate">
                        <span className="font-medium">Chauffeur:</span> {getChauffeurName(mission.chauffeur_id)}
                      </span>
                      {mission.type && (
                        <span>
                          <span className="font-medium">Type:</span> {mission.type}
                        </span>
                      )}
                      {/* Nombre de passagers (nouveau champ) */}
                      {mission.nombre_passagers && (
                        <span>
                          👥 {mission.nombre_passagers}
                        </span>
                      )}
                      {/* Prix estimé (nouveau champ - prioritaire sur prix) */}
                      {(mission.prix_estime || mission.prix) && (
                        <span>
                          💰 {mission.prix_estime || mission.prix} €
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex space-x-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(mission.id)}
                      aria-label={`Supprimer la mission de ${mission.client || 'ce client'}`}
                      className="hover:bg-red-50 hover:text-red-600 transition-colors"
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
      
      {/* Notifications toast */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default ListeMissions;
