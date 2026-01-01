import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getMissionsChauffeur } from '../../services/api';
import Card from '../Common/Card';
import { Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { fr } from 'date-fns/locale/fr';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    today: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const nextWeek = format(addDays(new Date(), 7), 'yyyy-MM-dd');
      
      const response = await getMissionsChauffeur(user.id, {
        date_debut: today,
        date_fin: nextWeek,
      });
      const missions = response.data;

      const todayMissions = missions.filter(m => m.date_mission === today);
      const pendingCount = missions.filter(m => m.statut === 'envoyee' || m.statut === 'confirmee').length;
      const inProgressCount = missions.filter(m => m.statut === 'pec').length;
      const completedCount = missions.filter(m => m.statut === 'terminee').length;

      setStats({
        today: todayMissions.length,
        pending: pendingCount,
        inProgress: inProgressCount,
        completed: completedCount,
      });
      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement stats:', error);
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Missions aujourd\'hui',
      value: stats.today,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'En attente',
      value: stats.pending,
      icon: AlertCircle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'En cours',
      value: stats.inProgress,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Terminées',
      value: stats.completed,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Dashboard Chauffeur</h2>
      <p className="text-gray-600 mb-6">Bienvenue, {user?.nom || user?.username}!</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-full`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Vue d'ensemble</h3>
        <p className="text-gray-600">
          Consultez vos missions dans le menu "Mes Missions". Vous pouvez confirmer la réception,
          prendre en charge et terminer vos missions directement depuis l'application.
        </p>
      </Card>
    </div>
  );
};

export default Dashboard;
