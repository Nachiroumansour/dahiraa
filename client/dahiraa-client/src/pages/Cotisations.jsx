import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Calendar, Users, TrendingUp, FileText, RefreshCw, Eye, AlertCircle, CheckCircle, History } from 'lucide-react';

// Styles CSS pour les animations
const animationStyles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
  
  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
`;

// Injecter les styles dans le head
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = animationStyles;
  document.head.appendChild(styleElement);
}
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Layout from '../components/layout/Layout';
import CotisationForm from '../components/forms/CotisationForm';
import BulkCotisationForm from '../components/forms/BulkCotisationForm';
import CotisationReport from '../components/modals/CotisationReport';
import MemberDetails from '../components/modals/MemberDetails';
import WeeklyOverview from '../components/widgets/WeeklyOverview';
import { cotisationService, memberService } from '../services/api';
import { formatDate, formatFullName, formatCurrency } from '../utils/format';

const Cotisations = () => {
  const [cotisations, setCotisations] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [memberFilter, setMemberFilter] = useState('all');
  const [weekFilter, setWeekFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCotisations, setTotalCotisations] = useState(0);
  
  // États pour les modales
  const [showFormModal, setShowFormModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showRestesModal, setShowRestesModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCotisation, setSelectedCotisation] = useState(null);
  
  // États pour l'historique des cotisations
  const [showMemberHistory, setShowMemberHistory] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [defaultTab, setDefaultTab] = useState('info');
  const [reportWeek, setReportWeek] = useState('');
  const [reportMonth, setReportMonth] = useState('');
  const [showRestesPeriodeModal, setShowRestesPeriodeModal] = useState(false);

  const fetchCotisations = async (page = 1, search = '', status = '', member = '', week = '') => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        ...(search && { search }),
        ...(status && status !== 'all' && { statut: status }),
        ...(member && member !== 'all' && { memberId: member }),
        ...(week && { semaine: week })
      };
      
      const response = await cotisationService.getCotisations(params);
      console.log('Données des cotisations reçues:', response.cotisations);
      console.log('Première cotisation:', response.cotisations[0]);
      console.log('Membre de la première cotisation:', response.cotisations[0]?.member);
      setCotisations(response.cotisations);
      setTotalPages(response.pagination.pages);
      setTotalCotisations(response.pagination.total);
      setCurrentPage(page);
    } catch (err) {
      setError('Erreur lors du chargement des cotisations');
      console.error('Cotisations fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await memberService.getMembers({ limit: 100 });
      setMembers(response.members);
    } catch (err) {
      console.error('Members fetch error:', err);
    }
  };

  useEffect(() => {
    fetchCotisations();
    fetchMembers();
  }, []);

  // Effet pour la recherche en temps réel avec debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== undefined) {
        fetchCotisations(1, searchTerm, statusFilter, memberFilter, weekFilter);
      }
    }, 300); // Réduit le délai pour une réponse plus rapide

    return () => clearTimeout(timeoutId);
  }, [searchTerm, statusFilter, memberFilter, weekFilter]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCotisations(1, searchTerm, statusFilter, memberFilter, weekFilter);
  };

  const handleFilterChange = (type, value) => {
    switch (type) {
      case 'status':
        setStatusFilter(value);
        break;
      case 'member':
        setMemberFilter(value);
        break;
      case 'week':
        setWeekFilter(value);
        break;
    }
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    fetchCotisations(page, searchTerm, statusFilter, memberFilter, weekFilter);
  };

  // Handlers pour les actions
  const handleAddCotisation = () => {
    setSelectedCotisation(null);
    setShowFormModal(true);
  };

  const handleBulkAdd = () => {
    setShowBulkModal(true);
  };

  const handleViewReport = (week = '', month = '') => {
    setReportWeek(week);
    setReportMonth(month);
    setShowReportModal(true);
  };

  const handleViewRestes = () => {
    setShowRestesModal(true);
  };

  const handleEditCotisation = (cotisation) => {
    setSelectedCotisation(cotisation);
    setShowFormModal(true);
  };

  const handleDeleteCotisation = (cotisation) => {
    setSelectedCotisation(cotisation);
    setShowDeleteDialog(true);
  };

  const handleViewMemberHistory = async (member) => {
    try {
      // Vérifier si l'utilisateur est connecté
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Vous devez être connecté pour voir l\'historique des cotisations');
        return;
      }

      // Vérifier si le membre existe et a un ID
      if (!member || !member.id) {
        console.error('Membre invalide ou ID manquant:', member);
        alert('Impossible d\'afficher l\'historique : données du membre manquantes');
        return;
      }

      console.log('Tentative de récupération des détails du membre:', member.id);

      // Récupérer les détails complets du membre
      const response = await memberService.getMemberById(member.id);
      setSelectedMember(response.member);
      setDefaultTab('history');
      setShowMemberHistory(true);
    } catch (err) {
      console.error('Erreur lors du chargement des détails:', err);
      if (err.response?.status === 401) {
        alert('Session expirée. Veuillez vous reconnecter.');
      } else {
        alert('Erreur lors du chargement de l\'historique des cotisations');
      }
    }
  };

  const confirmDelete = async () => {
    if (!selectedCotisation) return;
    
    try {
      await cotisationService.deleteCotisation(selectedCotisation.id);
      setShowDeleteDialog(false);
      setSelectedCotisation(null);
      fetchCotisations(currentPage, searchTerm, statusFilter, memberFilter, weekFilter);
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
    }
  };

  const handleFormSuccess = () => {
    setShowFormModal(false);
    setShowBulkModal(false);
    setSelectedCotisation(null);
    fetchCotisations(currentPage, searchTerm, statusFilter, memberFilter, weekFilter);
  };

  const getStatusBadge = (status) => {
    const variants = {
      'PAYE': 'default',
      'EN_ATTENTE': 'secondary'
    };
    
    const labels = {
      'PAYE': 'Payé',
      'EN_ATTENTE': 'En attente'
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {labels[status] || status}
      </Badge>
    );
  };

  const getTypeBadge = (type, evenementType, description) => {
    const variants = {
      'HEBDOMADAIRE': 'default',
      'EVENEMENT': 'secondary'
    };
    
    const labels = {
      'HEBDOMADAIRE': 'Hebdomadaire',
      'EVENEMENT': 'Événement'
    };

    const colors = {
      'HEBDOMADAIRE': 'bg-green-100 text-green-800',
      'EVENEMENT': 'bg-purple-100 text-purple-800'
    };

    const eventIcons = {
      'MARIAGE': '💒',
      'BAPTEME': '👶',
      'FUNERAILLE': '⚰️',
      'NAISSANCE': '🎉',
      'RETRAITE': '🎊',
      'VOYAGE': '✈️',
      'PROJET': '🏗️',
      'AUTRE': '🎯'
    };

    if (type === 'EVENEMENT' && evenementType) {
      return (
        <div className="flex flex-col gap-1">
          <Badge className={`${colors[type]} border-2 border-purple-200`}>
            {eventIcons[evenementType] || '🎯'} {evenementType}
          </Badge>
          {description && (
            <p className="text-xs text-purple-600 max-w-32 truncate" title={description}>
              {description}
            </p>
          )}
        </div>
      );
    }

    return (
      <Badge className={colors[type] || 'bg-gray-100 text-gray-800'}>
        {labels[type] || type}
      </Badge>
    );
  };

  const getInitials = (prenom, nom) => {
    return `${prenom?.charAt(0) || ''}${nom?.charAt(0) || ''}`.toUpperCase();
  };

  if (loading && cotisations.length === 0) {
    return (
      <Layout title="Gestion des Cotisations">
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Gestion des Cotisations">
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Header moderne mobile-first - plus compact */}
        <div className="bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-xl sm:rounded-2xl p-3 sm:p-6 lg:p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-2 sm:gap-4 lg:gap-6">
            <div className="space-y-1 sm:space-y-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl shadow-lg">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold text-slate-900">Gestion des Cotisations</h2>
                  <p className="text-slate-600 text-sm sm:text-base lg:text-lg">
                    {totalCotisations} cotisations enregistrées • Système de cotisation hebdomadaire
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions principales - Boutons horizontaux compacts */}
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-semibold text-slate-900 flex items-center space-x-2">
              <div className="p-1 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span>Actions Rapides</span>
            </h3>
          </div>
          
          {/* Boutons horizontaux */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Button
              onClick={handleViewReport}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 min-h-[36px] sm:min-h-[40px]"
            >
              <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Rapport</span>
            </Button>

            <Button
              onClick={handleBulkAdd}
              className="flex items-center space-x-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 min-h-[36px] sm:min-h-[40px]"
            >
              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>En lot</span>
            </Button>

            <Button
              onClick={handleViewRestes}
              className="flex items-center space-x-2 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 min-h-[36px] sm:min-h-[40px]"
            >
              <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Restes</span>
            </Button>

            <Button
              onClick={() => setShowRestesPeriodeModal(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 min-h-[36px] sm:min-h-[40px]"
            >
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Période</span>
            </Button>

            <Button
              onClick={handleAddCotisation}
              className="flex items-center space-x-2 px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 min-h-[36px] sm:min-h-[40px]"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Nouvelle</span>
            </Button>
          </div>
        </div>

        {/* Aperçu de la semaine courante */}
        <WeeklyOverview onViewReport={handleViewReport} />

        {/* Filtres et recherche mobile-first - améliorée pour localisation rapide */}
        <Card className="bg-white border border-slate-200 shadow-lg rounded-xl sm:rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200 p-3 sm:p-6">
            <CardTitle className="flex items-center space-x-3 text-slate-900">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-sm">
                <Search className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-white" />
              </div>
              <span className="text-base sm:text-lg lg:text-xl font-bold">Recherche et Filtres</span>
            </CardTitle>
            <CardDescription className="text-slate-600 text-xs sm:text-sm lg:text-base">
              Trouvez rapidement les cotisations que vous recherchez
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <form onSubmit={handleSearchSubmit} className="space-y-3 sm:space-y-4">
              {/* Recherche mobile-first - améliorée */}
              <div className="relative">
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Rechercher par nom, téléphone, numéro d'adhésion..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-10 sm:pl-12 pr-10 sm:pr-12 h-10 sm:h-12 border-2 border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg sm:rounded-xl text-sm sm:text-base shadow-sm"
                  disabled={loading}
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      fetchCotisations(1, '', statusFilter, memberFilter, weekFilter);
                    }}
                    className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 transition-colors"
                    title="Effacer la recherche"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Conseils de recherche rapide */}
              {!searchTerm && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <div className="text-blue-600 mt-0.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-xs sm:text-sm text-blue-800">
                      <p className="font-medium mb-1">💡 Conseils de recherche rapide :</p>
                      <ul className="space-y-1">
                        <li>• Tapez le <strong>prénom ou nom</strong> du membre</li>
                        <li>• Utilisez le <strong>numéro d'adhésion</strong> (ex: DH001)</li>
                        <li>• Entrez le <strong>numéro de téléphone</strong></li>
                        <li>• Recherchez par <strong>montant</strong> (ex: 250)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Filtres rapides */}
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={statusFilter === 'PAYE' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFilterChange('status', statusFilter === 'PAYE' ? 'all' : 'PAYE')}
                  className="text-xs sm:text-sm h-8 px-3"
                >
                  ✅ Payé
                </Button>
                <Button
                  type="button"
                  variant={statusFilter === 'EN_ATTENTE' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFilterChange('status', statusFilter === 'EN_ATTENTE' ? 'all' : 'EN_ATTENTE')}
                  className="text-xs sm:text-sm h-8 px-3"
                >
                  ⏳ En attente
                </Button>
                <Button
                  type="button"
                  variant={statusFilter === 'EN_RETARD' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFilterChange('status', statusFilter === 'EN_RETARD' ? 'all' : 'EN_RETARD')}
                  className="text-xs sm:text-sm h-8 px-3"
                >
                  ⚠️ En retard
                </Button>
              </div>

              {/* Filtres avancés */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <Select value={memberFilter} onValueChange={(value) => handleFilterChange('member', value)}>
                  <SelectTrigger className="h-10 sm:h-12 border-2 border-slate-200 focus:border-blue-500 rounded-lg sm:rounded-xl text-sm sm:text-base">
                    <SelectValue placeholder="Membre spécifique" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les membres</SelectItem>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {formatFullName(member.prenom, member.nom)} - {member.numeroAdhesion}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="relative">
                  <Calendar className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                  <Input
                    type="week"
                    value={weekFilter}
                    onChange={(e) => handleFilterChange('week', e.target.value)}
                    className="pl-10 sm:pl-12 h-10 sm:h-12 border-2 border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg sm:rounded-xl text-sm sm:text-base"
                    placeholder="Semaine spécifique"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 h-10 sm:h-12 px-4 sm:px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg sm:rounded-xl text-sm sm:text-base"
                  >
                    <Search className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Rechercher
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setMemberFilter('all');
                      setWeekFilter('');
                      fetchCotisations(1, '', '', '', '');
                    }}
                    variant="outline"
                    className="h-10 sm:h-12 px-3 sm:px-4 border-2 border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg sm:rounded-xl text-sm sm:text-base"
                  >
                    <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Liste des cotisations mobile-first - plus compact */}
        <Card className="bg-white border border-slate-200 shadow-lg rounded-xl sm:rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200 p-3 sm:p-6">
            <CardTitle className="flex items-center space-x-3 text-slate-900">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-sm">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-base sm:text-lg lg:text-xl font-bold">Liste des Cotisations</span>
              {searchTerm && (
                <span className="text-xs sm:text-sm font-normal text-indigo-600 ml-2 bg-indigo-100 px-2 sm:px-3 py-1 rounded-full">
                  🔍 Recherche : "{searchTerm}"
                </span>
              )}
            </CardTitle>
            <CardDescription className="text-slate-600 text-xs sm:text-sm lg:text-base">
              {searchTerm 
                ? `🎯 ${totalCotisations} résultat(s) trouvé(s) pour "${searchTerm}"`
                : 'Gérez les cotisations de vos membres avec facilité'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {error ? (
              <div className="text-center py-8 sm:py-12">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <span className="text-xl sm:text-2xl">⚠️</span>
                </div>
                <p className="text-red-600 text-base sm:text-lg font-medium">{error}</p>
                <Button onClick={() => fetchCotisations()} className="mt-3 sm:mt-4 bg-red-600 hover:bg-red-700">
                  🔄 Réessayer
                </Button>
              </div>
            ) : cotisations.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <span className="text-xl sm:text-2xl">📭</span>
                </div>
                <p className="text-gray-500 text-base sm:text-lg">Aucune cotisation trouvée</p>
                <p className="text-gray-400 text-sm sm:text-base">Commencez par ajouter une nouvelle cotisation</p>
              </div>
            ) : (
              <>
                {/* Table desktop */}
                <div className="hidden lg:block overflow-x-auto">
                  <Table className="border border-slate-200 rounded-xl overflow-hidden">
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-slate-100 to-blue-50">
                        <TableHead className="font-bold text-slate-900 py-4">👤 Membre</TableHead>
                        <TableHead className="font-bold text-slate-900 py-4">💰 Montant</TableHead>
                        <TableHead className="font-bold text-slate-900 py-4">📅 Semaine</TableHead>
                        <TableHead className="font-bold text-slate-900 py-4">🏷️ Type</TableHead>
                        <TableHead className="font-bold text-slate-900 py-4">📝 Description</TableHead>
                        <TableHead className="font-bold text-slate-900 py-4">📊 Statut</TableHead>
                        <TableHead className="font-bold text-slate-900 py-4">📝 Date d'enregistrement</TableHead>
                        <TableHead className="font-bold text-slate-900 py-4">⚡ Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cotisations.map((cotisation, index) => (
                        <TableRow 
                          key={cotisation.id} 
                          className={`group hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 ${
                            index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                          }`}
                          style={{
                            animationDelay: `${index * 50}ms`,
                            animation: 'fadeInUp 0.5s ease-out forwards'
                          }}
                        >
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="border-2 border-blue-200">
                                <AvatarImage 
                                  src={cotisation.member?.photoProfile ? `http://localhost:3001${cotisation.member.photoProfile}` : undefined} 
                                />
                                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white font-semibold">
                                  {getInitials(cotisation.member?.prenom, cotisation.member?.nom)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {formatFullName(cotisation.member?.prenom, cotisation.member?.nom)}
                                </p>
                                <p className="text-sm text-gray-500">
                                  #{cotisation.member?.numeroAdhesion}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-bold text-lg text-green-600">
                              {formatCurrency(cotisation.montant)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-orange-500" />
                              <span className="text-sm font-medium">{formatDate(cotisation.semaine)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getTypeBadge(cotisation.type, cotisation.evenementType, cotisation.description)}
                          </TableCell>
                          <TableCell>
                            {cotisation.description && (
                              <p className="text-sm text-gray-700 truncate" title={cotisation.description}>
                                {cotisation.description}
                              </p>
                            )}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(cotisation.statut)}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-500 font-medium">
                              {formatDate(cotisation.createdAt)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button 
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditCotisation(cotisation)}
                                className="group/btn p-2 h-8 w-8 bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 rounded-lg transition-all duration-300 hover:scale-110"
                                title="Modifier"
                              >
                                <Edit className="h-4 w-4 group-hover/btn:rotate-12 transition-transform duration-300" />
                              </Button>
                              {cotisation.member && cotisation.member.id ? (
                                <Button 
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleViewMemberHistory(cotisation.member)}
                                  className="group/btn p-2 h-8 w-8 bg-purple-50 hover:bg-purple-100 text-purple-600 hover:text-purple-700 rounded-lg transition-all duration-300 hover:scale-110"
                                  title="Historique cotisations"
                                >
                                  <History className="h-4 w-4 group-hover/btn:scale-110 transition-transform duration-300" />
                                </Button>
                              ) : (
                                <div className="p-2 h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                  <span className="text-xs text-gray-500">?</span>
                                </div>
                              )}
                              <Button 
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteCotisation(cotisation)}
                                className="group/btn p-2 h-8 w-8 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 rounded-lg transition-all duration-300 hover:scale-110"
                                title="Supprimer"
                              >
                                <Trash2 className="h-4 w-4 group-hover/btn:scale-110 transition-transform duration-300" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Cartes mobile - plus compact avec indicateurs visuels */}
                <div className="lg:hidden space-y-3 p-3 sm:p-4">
                  {cotisations.map((cotisation, index) => (
                    <Card 
                      key={cotisation.id}
                      className={`group hover:shadow-lg transition-all duration-300 border-l-4 bg-white ${
                        cotisation.statut === 'PAYE' ? 'border-l-green-500' :
                        cotisation.statut === 'EN_ATTENTE' ? 'border-l-yellow-500' :
                        cotisation.statut === 'EN_RETARD' ? 'border-l-red-500' : 'border-l-blue-500'
                      }`}
                      style={{ animationDelay: `${index * 50}ms`, animation: 'fadeInUp 0.5s ease-out forwards' }}
                    >
                      <CardContent className="p-3 sm:p-4">
                        {/* En-tête de la carte avec indicateurs */}
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <Avatar className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-blue-200">
                              <AvatarImage 
                                src={cotisation.member?.photoProfile ? `http://localhost:3001${cotisation.member.photoProfile}` : undefined} 
                              />
                              <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-sm sm:text-lg font-semibold">
                                {getInitials(cotisation.member?.prenom, cotisation.member?.nom)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold text-base sm:text-lg text-slate-900">
                                {formatFullName(cotisation.member?.prenom, cotisation.member?.nom)}
                              </h3>
                              <div className="flex items-center space-x-2">
                                <p className="text-xs sm:text-sm text-slate-600">#{cotisation.member?.numeroAdhesion}</p>
                                {cotisation.member?.telephone && (
                                  <span className="text-xs text-slate-500">📞 {cotisation.member.telephone}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-lg sm:text-xl text-green-600">
                              {formatCurrency(cotisation.montant)}
                            </span>
                            <div className="mt-1">
                              {getStatusBadge(cotisation.statut)}
                            </div>
                          </div>
                        </div>

                        {/* Informations principales avec indicateurs visuels */}
                        <div className="grid grid-cols-1 gap-2 sm:gap-3 mb-3 sm:mb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500" />
                              <span className="text-xs sm:text-sm font-medium text-slate-700">Semaine</span>
                            </div>
                            <span className="text-xs sm:text-sm font-medium text-slate-700 bg-orange-50 px-2 py-1 rounded">
                              {formatDate(cotisation.semaine)}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm font-medium text-slate-700">Type</span>
                            <div>{getTypeBadge(cotisation.type, cotisation.evenementType, cotisation.description)}</div>
                          </div>

                          {cotisation.description && (
                            <div className="flex items-center justify-between">
                              <span className="text-xs sm:text-sm font-medium text-slate-700">Description</span>
                              <p className="text-xs sm:text-sm text-slate-700 text-right max-w-[150px] sm:max-w-[200px] truncate bg-slate-50 px-2 py-1 rounded" title={cotisation.description}>
                                {cotisation.description}
                              </p>
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm font-medium text-slate-700">Date d'enregistrement</span>
                            <span className="text-xs sm:text-sm text-slate-700 bg-slate-50 px-2 py-1 rounded">
                              {formatDate(cotisation.createdAt)}
                            </span>
                          </div>
                        </div>

                        {/* Actions avec indicateurs visuels */}
                        <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-slate-100">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditCotisation(cotisation)}
                              className="flex items-center space-x-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 rounded-lg transition-all duration-200 min-h-[40px] sm:min-h-[44px]"
                            >
                              <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="text-xs sm:text-sm">Modifier</span>
                            </Button>
                            {cotisation.member && cotisation.member.id && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewMemberHistory(cotisation.member)}
                                className="flex items-center space-x-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-purple-50 hover:bg-purple-100 text-purple-600 hover:text-purple-700 rounded-lg transition-all duration-200 min-h-[40px] sm:min-h-[44px]"
                              >
                                <History className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="text-xs sm:text-sm">Cotisations</span>
                              </Button>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCotisation(cotisation)}
                            className="flex items-center space-x-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 rounded-lg transition-all duration-200 min-h-[40px] sm:min-h-[44px]"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="text-xs sm:text-sm">Supprimer</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination mobile-first - plus compact */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between p-3 sm:p-4 lg:p-6 bg-gradient-to-r from-slate-50 to-blue-50 border-t border-slate-200 space-y-2 sm:space-y-0">
                    <p className="text-xs sm:text-sm text-slate-600 font-medium flex items-center space-x-2 text-center sm:text-left">
                      <span className="p-1 bg-slate-200 rounded-full">📄</span>
                      <span>Page {currentPage} sur {totalPages}</span>
                    </p>
                    <div className="flex items-center space-x-2 w-full sm:w-auto justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1 || loading}
                        className="group border-2 border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50 transition-all duration-300 min-h-[40px] sm:min-h-[44px] px-3 sm:px-4"
                      >
                        <span className="group-hover:-translate-x-1 transition-transform duration-300">←</span>
                        <span className="ml-1 hidden sm:inline">Précédent</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages || loading}
                        className="group border-2 border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50 transition-all duration-300 min-h-[40px] sm:min-h-[44px] px-3 sm:px-4"
                      >
                        <span className="mr-1 hidden sm:inline">Suivant</span>
                        <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modales */}
      <CotisationForm
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        onSuccess={handleFormSuccess}
        cotisation={selectedCotisation}
        members={members}
      />

      <BulkCotisationForm
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        onSuccess={handleFormSuccess}
        members={members}
      />

      <CotisationReport
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        selectedWeek={reportWeek}
        selectedMonth={reportMonth}
      />

      <MemberDetails
        isOpen={showMemberHistory}
        onClose={() => setShowMemberHistory(false)}
        member={selectedMember}
        defaultTab={defaultTab}
        onEdit={() => {
          setShowMemberHistory(false);
          // Ici on pourrait rediriger vers la page des membres pour éditer
        }}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="border-2 border-red-200 bg-gradient-to-br from-white to-red-50">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-800 flex items-center gap-2">
              <span className="text-2xl">⚠️</span>
              Confirmer la suppression
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-700">
              Êtes-vous sûr de vouloir supprimer cette cotisation de{' '}
              <strong className="text-red-800">
                {selectedCotisation ? formatFullName(selectedCotisation.member?.prenom, selectedCotisation.member?.nom) : ''}
              </strong> ?
              <br />
              <span className="text-red-600 font-medium">Cette action est irréversible.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-2 border-gray-300 hover:border-gray-400 bg-white">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold"
            >
              🗑️ Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal des restes à payer */}
      <RestesAPayerModal 
        isOpen={showRestesModal} 
        onClose={() => setShowRestesModal(false)} 
      />

      {/* Modal des restes à payer sur une période personnalisée */}
      <RestesAPayerPeriodeModal 
        isOpen={showRestesPeriodeModal} 
        onClose={() => setShowRestesPeriodeModal(false)} 
      />
    </Layout>
  );
};

// Composant pour afficher les restes à payer
const RestesAPayerModal = ({ isOpen, onClose }) => {
  const [restesData, setRestesData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchRestesAPayer = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔄 Chargement des restes à payer...');
      
      const data = await cotisationService.getRestesAPayer();
      console.log('✅ Restes à payer chargés:', data);
      setRestesData(data);
    } catch (err) {
      console.error('❌ Erreur lors du chargement des restes:', err);
      console.error('Détails de l\'erreur:', err.response?.data || err.message);
      setError(`Erreur lors du chargement des données: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRestesAPayer();
    }
  }, [isOpen]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatFullName = (prenom, nom) => {
    return `${prenom || ''} ${nom || ''}`.trim();
  };

  const getInitials = (prenom, nom) => {
    return `${prenom?.charAt(0) || ''}${nom?.charAt(0) || ''}`.toUpperCase();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-4xl lg:max-w-6xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-white to-red-50 border-2 border-red-200 p-4 sm:p-6">
        <DialogHeader className="text-center">
          <DialogTitle className="text-xl sm:text-3xl font-bold text-red-900 flex items-center justify-center gap-3">
            <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
            ⚠️ Restes à Payer
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-sm sm:text-lg">
            Membres ayant des cotisations en retard pour {restesData?.mois}/{restesData?.annee}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="text-center p-8">
            <p className="text-red-600 font-medium">{error}</p>
            <Button onClick={fetchRestesAPayer} className="mt-4">
              Réessayer
            </Button>
          </div>
        ) : restesData ? (
          <div className="space-y-6">
            {/* Statistiques globales mobile-first */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-xl">
                <div className="text-lg sm:text-2xl font-bold text-red-900">{restesData.nombreMembresEnRetard}</div>
                <p className="text-xs sm:text-sm text-red-700 font-medium">Membres en retard</p>
              </div>
              <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-xl">
                <div className="text-lg sm:text-2xl font-bold text-orange-900">{formatCurrency(restesData.totalRestes)}</div>
                <p className="text-xs sm:text-sm text-orange-700 font-medium">Total restes</p>
              </div>
              <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-xl">
                <div className="text-lg sm:text-2xl font-bold text-yellow-900">{restesData.nombreJeudis}</div>
                <p className="text-xs sm:text-sm text-yellow-700 font-medium">Jeudis du mois</p>
              </div>
              <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl">
                <div className="text-lg sm:text-2xl font-bold text-blue-900">{restesData.mois}/{restesData.annee}</div>
                <p className="text-xs sm:text-sm text-blue-700 font-medium">Période</p>
              </div>
            </div>

            {/* Liste des membres avec restes */}
            <div className="space-y-4">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                Détail des restes à payer
              </h3>
              
              {restesData.restesAPayer.length === 0 ? (
                <div className="text-center p-8 bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 rounded-xl">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <p className="text-green-800 font-medium text-lg">🎉 Aucun reste à payer !</p>
                  <p className="text-green-600">Tous les membres sont à jour avec leurs cotisations.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {restesData.restesAPayer.map((item, index) => (
                    <div key={item.member.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl hover:from-red-100 hover:to-orange-100 transition-all duration-200">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-white">
                            {getInitials(item.member.prenom, item.member.nom)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {formatFullName(item.member.prenom, item.member.nom)}
                          </p>
                          <p className="text-sm text-gray-500">#{item.member.numeroAdhesion}</p>
                          <p className="text-xs text-gray-400">
                            {item.nombreCotisations}/{item.nombreJeudis} cotisations ({item.tauxParticipation.toFixed(1)}%)
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-red-700">
                          -{formatCurrency(item.reste)}
                        </div>
                        <p className="text-sm text-gray-500">
                          Payé: {formatCurrency(item.totalCotise)} / Attendu: {formatCurrency(item.montantAttendu)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}

        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            Fermer
          </Button>
          <Button 
            onClick={fetchRestesAPayer}
            className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Modal pour afficher les restes à payer sur une période personnalisée
const RestesAPayerPeriodeModal = ({ isOpen, onClose }) => {
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [memberId, setMemberId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setResult(null);
      setError('');
      setDateDebut('');
      setDateFin('');
      setMemberId('');
      fetchMembers();
    }
  }, [isOpen]);

  const fetchMembers = async () => {
    try {
      const res = await memberService.getMembers({ limit: 1000 });
      setMembers(res.members);
    } catch (err) {
      setMembers([]);
    }
  };

  const handleSearch = async () => {
    if (!dateDebut || !dateFin) {
      setError('Veuillez choisir une période.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const params = { dateDebut, dateFin };
      if (memberId) params.memberId = memberId;
      const data = await cotisationService.getRestesAPayerPeriode(params);
      setResult(data);
    } catch (err) {
      setError('Erreur lors du chargement des données.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-4xl lg:max-w-5xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-white to-orange-50 border-2 border-orange-200 p-4 sm:p-6">
        <DialogHeader className="text-center">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-orange-900 flex items-center justify-center gap-3">
            <AlertCircle className="h-6 w-6 sm:h-7 sm:w-7 text-orange-600" />
            Restes à Payer sur une Période
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-sm sm:text-lg">
            Calculez les restes à payer pour tous les membres ou un membre précis sur la période de votre choix.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 sm:flex sm:flex-wrap sm:gap-4 sm:items-end sm:mb-6">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">Date début</label>
            <input 
              type="date" 
              value={dateDebut} 
              onChange={e => setDateDebut(e.target.value)} 
              className="w-full border-2 border-orange-200 rounded-lg p-3 h-12 text-base" 
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">Date fin</label>
            <input 
              type="date" 
              value={dateFin} 
              onChange={e => setDateFin(e.target.value)} 
              className="w-full border-2 border-orange-200 rounded-lg p-3 h-12 text-base" 
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">Membre (optionnel)</label>
            <select 
              value={memberId} 
              onChange={e => setMemberId(e.target.value)} 
              className="w-full border-2 border-orange-200 rounded-lg p-3 h-12 text-base"
            >
              <option value="">Tous les membres</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.prenom} {m.nom} ({m.numeroAdhesion})</option>
              ))}
            </select>
          </div>
          <Button 
            onClick={handleSearch} 
            className="w-full sm:w-auto bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold px-6 py-3 h-12 rounded-lg shadow-lg text-base"
          >
            Calculer
          </Button>
        </div>
        {error && <div className="text-red-600 text-center mb-4">{error}</div>}
        {loading && <div className="text-center py-8">Chargement...</div>}
        {result && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-xl">
                <div className="text-lg sm:text-2xl font-bold text-orange-900">{result.membres.length}</div>
                <p className="text-xs sm:text-sm text-orange-700 font-medium">Membres</p>
              </div>
              <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-xl">
                <div className="text-lg sm:text-2xl font-bold text-red-900">{result.totalRestes} FCFA</div>
                <p className="text-xs sm:text-sm text-red-700 font-medium">Total restes</p>
              </div>
              <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-xl">
                <div className="text-lg sm:text-2xl font-bold text-yellow-900">{result.nombreJeudis}</div>
                <p className="text-xs sm:text-sm text-yellow-700 font-medium">Jeudis</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl">
                <div className="text-2xl font-bold text-blue-900">{result.dateDebut} → {result.dateFin}</div>
                <p className="text-sm text-blue-700 font-medium">Période</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full border mt-4">
                <thead>
                  <tr className="bg-gradient-to-r from-orange-100 to-orange-200">
                    <th className="p-2 border">Membre</th>
                    <th className="p-2 border">Montant attendu</th>
                    <th className="p-2 border">Montant payé</th>
                    <th className="p-2 border">Reste à payer</th>
                    <th className="p-2 border">Cotisations payées</th>
                  </tr>
                </thead>
                <tbody>
                  {result.membres.map((item, idx) => (
                    <tr key={item.member.id} className={item.reste > 0 ? 'bg-red-50' : 'bg-green-50'}>
                      <td className="p-2 border font-semibold">{item.member.prenom} {item.member.nom} <span className="text-xs text-gray-500">({item.member.numeroAdhesion})</span></td>
                      <td className="p-2 border">{item.montantAttendu} FCFA</td>
                      <td className="p-2 border">{item.montantPaye} FCFA</td>
                      <td className="p-2 border font-bold text-red-700">{item.reste} FCFA</td>
                      <td className="p-2 border">{item.cotisationsPayees}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button onClick={onClose} variant="outline">Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Cotisations; 