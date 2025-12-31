import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Plus, List, Car, History, BarChart3 } from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();

  const secretaireLinks = [
    { to: '/secretaire/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/secretaire/missions/creer', icon: Plus, label: 'Créer Mission' },
    { to: '/secretaire/missions', icon: List, label: 'Liste Missions' },
    { to: '/secretaire/statistiques', icon: BarChart3, label: 'Statistiques' },
  ];

  const chauffeurLinks = [
    { to: '/chauffeur/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/chauffeur/missions', icon: Car, label: 'Mes Missions' },
    { to: '/chauffeur/historique', icon: History, label: 'Historique' },
  ];

  const links = user?.role === 'secretaire' ? secretaireLinks : chauffeurLinks;

  return (
    <aside className="w-64 bg-white shadow-md min-h-screen">
      <nav className="p-4">
        <ul className="space-y-2">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <link.icon className="w-5 h-5" />
                <span className="font-medium">{link.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
