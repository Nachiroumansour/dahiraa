import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Calendar, 
  CreditCard, 
  Receipt, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ isOpen, onToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      title: 'Tableau de bord',
      icon: Home,
      path: '/',
      exact: true
    },
    {
      title: 'Membres',
      icon: Users,
      path: '/members'
    },
    {
      title: 'Cotisations',
      icon: CreditCard,
      path: '/cotisations'
    },
    {
      title: 'Événements',
      icon: Calendar,
      path: '/events'
    },
    {
      title: 'Dépenses',
      icon: Receipt,
      path: '/expenses'
    }
  ];

  return (
    <>
      {/* Overlay pour mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-gradient-to-b from-white to-gray-50 border-r-2 border-blue-200 z-50 transform transition-transform duration-300 ease-in-out shadow-xl
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:fixed lg:z-auto
        w-80 flex-shrink-0 flex flex-col
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg border-2 border-white">
              <span className="text-white font-bold text-base">D</span>
            </div>
            <div>
              <span className="font-bold text-gray-900 text-base">Gestion Dahiraa</span>
              <p className="text-gray-600 text-xs">Administration</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="lg:hidden text-gray-600 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                className={({ isActive }) => `
                    flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 transform hover:scale-102
                  ${isActive 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg border-l-4 border-blue-400' 
                      : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-700'
                  }
                `}
                onClick={() => {
                  // Fermer la sidebar sur mobile après navigation
                  if (window.innerWidth < 1024) {
                    onToggle();
                  }
                }}
              >
                <Icon className="h-5 w-5" />
                <span>{item.title}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User info et logout */}
        <div className="p-4 border-t-2 border-blue-200 bg-gradient-to-r from-gray-50 to-blue-50">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-md border-2 border-white">
              <span className="text-white font-bold text-xs">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">
                {user?.email}
              </p>
              <p className="text-xs text-gray-600 font-medium">
                {user?.role === 'ADMIN' ? 'Administrateur' : 'Gestionnaire'}
              </p>
            </div>
          </div>
          
          <div className="space-y-1">
            <NavLink
              to="/settings"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-700 transition-all duration-200"
            >
              <Settings className="h-4 w-4" />
              <span>Paramètres</span>
            </NavLink>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-200"
            >
              <LogOut className="h-4 w-4 mr-3" />
              Déconnexion
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

