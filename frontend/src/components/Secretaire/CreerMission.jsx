import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createMission, getChauffeurs } from '../../services/api';
import Button from '../Common/Button';
import Input from '../Common/Input';
import Card from '../Common/Card';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const CreerMission = () => {
  const navigate = useNavigate();
  const [chauffeurs, setChauffeurs] = useState([]);
  const [formData, setFormData] = useState({
    clientNom: '',
    clientTelephone: '',
    adresseDepart: '',
    adresseArrivee: '',
    dateHeure: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    nombrePassagers: 1,
    prixEstime: '',
    typeVehicule: 'Berline',
    notes: '',
    chauffeurId: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadChauffeurs();
  }, []);

  const loadChauffeurs = async () => {
    try {
      const response = await getChauffeurs();
      setChauffeurs(response.data);
    } catch (error) {
      console.error('Erreur chargement chauffeurs:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Effacer l'erreur pour ce champ
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.clientNom.trim()) {
      newErrors.clientNom = 'Le nom du client est requis';
    }
    if (!formData.clientTelephone.trim()) {
      newErrors.clientTelephone = 'Le téléphone du client est requis';
    }
    if (!formData.adresseDepart.trim()) {
      newErrors.adresseDepart = 'L\'adresse de départ est requise';
    }
    if (!formData.adresseArrivee.trim()) {
      newErrors.adresseArrivee = 'L\'adresse d\'arrivée est requise';
    }
    if (!formData.dateHeure) {
      newErrors.dateHeure = 'La date et l\'heure sont requises';
    }
    if (formData.nombrePassagers < 1) {
      newErrors.nombrePassagers = 'Le nombre de passagers doit être au moins 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {
      // Transformer les données pour correspondre à l'API backend
      const missionData = {
        date_mission: formData.dateHeure.split('T')[0],
        heure_prevue: formData.dateHeure.split('T')[1],
        client: formData.clientNom,
        adresse_depart: formData.adresseDepart,
        adresse_arrivee: formData.adresseArrivee,
        type: formData.typeVehicule,
        notes: formData.notes,
        chauffeur_id: formData.chauffeurId || null,
        vehicule_id: null,
        statut: 'brouillon'
      };

      await createMission(missionData);
      setSuccess(true);
      
      // Réinitialiser le formulaire après 2 secondes
      setTimeout(() => {
        setFormData({
          clientNom: '',
          clientTelephone: '',
          adresseDepart: '',
          adresseArrivee: '',
          dateHeure: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
          nombrePassagers: 1,
          prixEstime: '',
          typeVehicule: 'Berline',
          notes: '',
          chauffeurId: '',
        });
        setSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Erreur création mission:', error);
      setErrors({ submit: error.response?.data?.error || 'Erreur lors de la création' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Créer une nouvelle mission</h2>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          <span>Mission créée avec succès!</span>
        </div>
      )}

      {errors.submit && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{errors.submit}</span>
        </div>
      )}

      <Card>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nom du client"
              name="clientNom"
              value={formData.clientNom}
              onChange={handleChange}
              error={errors.clientNom}
              required
            />
            <Input
              label="Téléphone du client"
              name="clientTelephone"
              type="tel"
              value={formData.clientTelephone}
              onChange={handleChange}
              error={errors.clientTelephone}
              required
            />
          </div>

          <Input
            label="Adresse de départ"
            name="adresseDepart"
            value={formData.adresseDepart}
            onChange={handleChange}
            error={errors.adresseDepart}
            required
          />

          <Input
            label="Adresse d'arrivée"
            name="adresseArrivee"
            value={formData.adresseArrivee}
            onChange={handleChange}
            error={errors.adresseArrivee}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Date et heure"
              name="dateHeure"
              type="datetime-local"
              value={formData.dateHeure}
              onChange={handleChange}
              error={errors.dateHeure}
              required
            />
            <Input
              label="Nombre de passagers"
              name="nombrePassagers"
              type="number"
              min="1"
              value={formData.nombrePassagers}
              onChange={handleChange}
              error={errors.nombrePassagers}
              required
            />
            <Input
              label="Prix estimé (€)"
              name="prixEstime"
              type="number"
              step="0.01"
              value={formData.prixEstime}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de véhicule <span className="text-red-500">*</span>
              </label>
              <select
                name="typeVehicule"
                value={formData.typeVehicule}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              >
                <option value="Berline">Berline</option>
                <option value="Break">Break</option>
                <option value="Monospace">Monospace</option>
                <option value="Van">Van</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assigner à un chauffeur
              </label>
              <select
                name="chauffeurId"
                value={formData.chauffeurId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">-- Non assigné --</option>
                {chauffeurs.map((chauffeur) => (
                  <option key={chauffeur.id} value={chauffeur.id}>
                    {chauffeur.nom}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes / Commentaires
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Informations complémentaires..."
            />
          </div>

          <div className="flex space-x-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Création en cours...' : 'Créer la mission'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/secretaire/missions')}
            >
              Annuler
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreerMission;
