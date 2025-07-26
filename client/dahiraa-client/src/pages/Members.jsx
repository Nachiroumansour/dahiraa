import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  RotateCcw, 
  Edit, 
  Eye, 
  Trash2,
  Download,
  FileSpreadsheet,
  FileText,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  History
} from 'lucide-react';

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
`;

// Injecter les styles dans le head
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = animationStyles;
  document.head.appendChild(styleElement);
}
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useToast } from '../hooks/use-toast';
import { 
  memberService,
  exportMembersToExcel, 
  exportMembersToPDF 
} from '../services/api';
import MemberForm from '../components/forms/MemberForm';
import MemberDetails from '../components/modals/MemberDetails';
import { formatDate } from '../utils/format';
import Layout from '../components/layout/Layout';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { formatFullName, formatPhoneNumber } from '../utils/format';

const Members = () => {
  const { toast } = useToast();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [genreFilter, setGenreFilter] = useState('all');
  const [commissionFilter, setCommissionFilter] = useState('all');
  const [professionFilter, setProfessionFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMembers, setTotalMembers] = useState(0);

  // États pour les modales
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [showMemberDetails, setShowMemberDetails] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [editingMember, setEditingMember] = useState(null);

  // États pour les options de filtres
  const [commissions, setCommissions] = useState([]);
  const [professions, setProfessions] = useState([]);

  const fetchMembers = async (page = 1, search = '', genre = '', commission = '', profession = '') => {
    try {
      setLoading(true);
      setError(''); // Réinitialiser les erreurs
      
      const params = {
        page,
        limit: 10,
        ...(search && search.trim() && { search: search.trim() }),
        ...(genre && genre !== 'all' && { genre }),
        ...(commission && commission !== 'all' && { commission }),
        ...(profession && profession !== 'all' && { profession })
      };
      
      console.log('Paramètres de recherche:', params);
      
      const response = await memberService.getMembers(params);
      console.log('Réponse reçue:', response);
      
      setMembers(response.members);
      setTotalPages(response.pagination.pages);
      setTotalMembers(response.pagination.total);
      setCurrentPage(page);
    } catch (err) {
      console.error('Erreur détaillée:', err);
      setError('Erreur lors du chargement des membres');
      setMembers([]);
      setTotalPages(1);
      setTotalMembers(0);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour récupérer les options de filtres
  const fetchFilterOptions = async () => {
    try {
      const response = await memberService.getGlobalStats();
      
      // Extraire les commissions uniques
      setCommissions(response.filterOptions.commissions || []);
      
      // Extraire les professions uniques
      setProfessions(response.filterOptions.professions || []);
    } catch (err) {
      console.error('Erreur lors du chargement des options de filtres:', err);
      // Fallback : utiliser la méthode précédente
      try {
        const response = await memberService.getMembers({ limit: 1000 });
        const allMembers = response.members;
        
        const uniqueCommissions = [...new Set(allMembers.map(m => m.commission).filter(Boolean))];
        setCommissions(uniqueCommissions);
        
        const uniqueProfessions = [...new Set(allMembers.map(m => m.profession).filter(Boolean))];
        setProfessions(uniqueProfessions);
      } catch (fallbackErr) {
        console.error('Erreur lors du fallback des options de filtres:', fallbackErr);
      }
    }
  };

  useEffect(() => {
    fetchMembers();
    fetchFilterOptions();
  }, []);

  // Effet pour les filtres uniquement (pas la recherche automatique)
  useEffect(() => {
    if (genreFilter !== 'all' || commissionFilter !== 'all' || professionFilter !== 'all') {
      console.log('Filtres appliqués:', { genreFilter, commissionFilter, professionFilter });
      fetchMembers(1, searchTerm, genreFilter, commissionFilter, professionFilter);
    }
  }, [genreFilter, commissionFilter, professionFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchMembers(1, searchTerm, genreFilter, commissionFilter, professionFilter);
  };

  // Recherche manuelle
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  // Recherche manuelle avec Entrée
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      fetchMembers(1, searchTerm, genreFilter, commissionFilter, professionFilter);
    }
  };

  const handleFilterChange = (type, value) => {
    switch (type) {
      case 'genre':
        setGenreFilter(value);
        break;
      case 'commission':
        setCommissionFilter(value);
        break;
      case 'profession':
        setProfessionFilter(value);
        break;
    }
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    fetchMembers(page, searchTerm, genreFilter, commissionFilter, professionFilter);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setGenreFilter('all');
    setCommissionFilter('all');
    setProfessionFilter('all');
    fetchMembers(1, '', 'all', 'all', 'all');
  };

  const getInitials = (prenom, nom) => {
    return `${prenom?.charAt(0) || ''}${nom?.charAt(0) || ''}`.toUpperCase();
  };

  // Handlers pour les actions
  const handleAddMember = () => {
    setEditingMember(null);
    setShowMemberForm(true);
  };

  const handleEditMember = (member) => {
    setEditingMember(member);
    setShowMemberForm(true);
  };

  const handleViewMember = async (member) => {
    try {
      // Récupérer les détails complets du membre
      const response = await memberService.getMemberById(member.id);
      setSelectedMember(response.member);
      setDefaultTab('info');
      setShowMemberDetails(true);
    } catch (err) {
      console.error('Erreur lors du chargement des détails:', err);
    }
  };

  const handleViewCotisationHistory = async (member) => {
    try {
      // Récupérer les détails complets du membre
      const response = await memberService.getMemberById(member.id);
      setSelectedMember(response.member);
      setDefaultTab('history');
      setShowMemberDetails(true);
    } catch (err) {
      console.error('Erreur lors du chargement des détails:', err);
    }
  };

  const [defaultTab, setDefaultTab] = useState('info');

  const handleDeleteMember = (member) => {
    setSelectedMember(member);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await memberService.deleteMember(selectedMember.id);
      setShowDeleteDialog(false);
      setSelectedMember(null);
      fetchMembers(currentPage, searchTerm, genreFilter, commissionFilter, professionFilter);
      toast({
        title: "Membre supprimé",
        description: "Le membre a été supprimé avec succès.",
      });
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression du membre.",
        variant: "destructive",
      });
    }
  };

  const handleFormSuccess = () => {
    fetchMembers(currentPage, searchTerm, genreFilter, commissionFilter, professionFilter);
    fetchFilterOptions(); // Recharger les options de filtres
  };

  if (loading && members.length === 0) {
    return (
      <Layout title="Gestion des Membres">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Gestion des Membres">
      <div className="space-y-6">
        {/* Header compact avec recherche intégrée */}
        <div className="bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            {/* Titre et statistiques */}
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Gestion des Membres</h1>
                <p className="text-slate-600">{totalMembers} membres enregistrés</p>
              </div>
            </div>

            {/* Actions rapides */}
            <div className="flex items-center gap-3">
              <Button 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-4 py-2 rounded-xl shadow-lg transition-all duration-200" 
                onClick={handleAddMember}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nouveau membre
              </Button>
            </div>
          </div>

          {/* Barre de recherche et filtres mobile-first */}
          <div className="mt-6 space-y-4">
            {/* Recherche mobile-first */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Rechercher un membre..."
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyPress={handleSearchKeyPress}
                className="pl-12 pr-12 h-12 border-2 border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-base"
                disabled={loading}
              />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    fetchMembers(1, '', genreFilter, commissionFilter, professionFilter);
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Filtres mobile-first */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select value={genreFilter} onValueChange={(value) => handleFilterChange('genre', value)}>
                <SelectTrigger className="h-12 border-2 border-slate-200 focus:border-blue-500 rounded-lg text-base">
                  <SelectValue placeholder="Genre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="HOMME">Homme</SelectItem>
                  <SelectItem value="FEMME">Femme</SelectItem>
                </SelectContent>
              </Select>

              <Select value={commissionFilter} onValueChange={(value) => handleFilterChange('commission', value)}>
                <SelectTrigger className="h-12 border-2 border-slate-200 focus:border-blue-500 rounded-lg text-base">
                  <SelectValue placeholder="Commission" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  {commissions.map((commission) => (
                    <SelectItem key={commission} value={commission}>
                      {commission}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Actions rapides mobile-first */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Button
                onClick={() => fetchMembers(1, searchTerm, genreFilter, commissionFilter, professionFilter)}
                disabled={loading}
                className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white text-base font-medium rounded-lg flex-1 sm:flex-none"
              >
                <Search className="h-5 w-5 mr-2" />
                Rechercher
              </Button>
              <Button
                onClick={resetFilters}
                variant="outline"
                className="h-12 px-6 border-2 border-slate-200 hover:bg-slate-50 text-base font-medium rounded-lg flex-1 sm:flex-none"
              >
                <RotateCcw className="h-5 w-5 mr-2" />
                Réinitialiser
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => exportMembersToExcel(members)}
                variant="outline"
                className="h-8 px-3 border-green-200 hover:bg-green-50 text-green-600 text-sm rounded-lg"
              >
                <FileSpreadsheet className="h-3 w-3 mr-1" />
                Excel
              </Button>
              <Button
                onClick={() => exportMembersToPDF(members)}
                variant="outline"
                className="h-8 px-3 border-red-200 hover:bg-red-50 text-red-600 text-sm rounded-lg"
              >
                <FileText className="h-3 w-3 mr-1" />
                PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Liste des membres */}
        <Card className="bg-white border border-slate-200 shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
            <CardTitle className="flex items-center space-x-3 text-slate-900">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-sm">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-xl font-bold">Liste des Membres</span>
              {searchTerm && (
                <span className="text-sm font-normal text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full">
                  🔍 {totalMembers} résultat(s)
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {error ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚠️</span>
                </div>
                <p className="text-red-600 text-lg font-medium">{error}</p>
                <Button onClick={() => fetchMembers()} className="mt-4 bg-red-600 hover:bg-red-700">
                  🔄 Réessayer
                </Button>
              </div>
            ) : members.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">👥</span>
                </div>
                <p className="text-slate-500 text-lg">Aucun membre trouvé</p>
                <p className="text-slate-400">Commencez par ajouter un nouveau membre</p>
              </div>
            ) : (
              <>
                {/* Table desktop */}
                <div className="hidden lg:block overflow-x-auto">
                  <Table className="border border-slate-200 rounded-xl overflow-hidden">
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-slate-100 to-blue-50">
                        <TableHead className="font-bold text-slate-900 py-4">👤 Membre</TableHead>
                        <TableHead className="font-bold text-slate-900 py-4">📞 Contact</TableHead>
                        <TableHead className="font-bold text-slate-900 py-4">💼 Profession</TableHead>
                        <TableHead className="font-bold text-slate-900 py-4">🏛️ Commission</TableHead>
                        <TableHead className="font-bold text-slate-900 py-4">🆔 ID Adhésion</TableHead>
                        <TableHead className="font-bold text-slate-900 py-4">⚡ Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {members.map((member, index) => (
                        <TableRow 
                          key={member.id} 
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
                                  src={member.photoProfile ? `http://localhost:3001${member.photoProfile}` : undefined} 
                                />
                                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white font-semibold">
                                  {getInitials(member.prenom, member.nom)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-semibold text-slate-900">
                                  {formatFullName(member.prenom, member.nom)}
                                </p>
                                <Badge 
                                  className={`${
                                    member.genre === 'HOMME' 
                                      ? 'bg-blue-100 text-blue-800 border-blue-200' 
                                      : 'bg-pink-100 text-pink-800 border-pink-200'
                                  } border-2`}
                                >
                                  {member.genre === 'HOMME' ? '👨 Homme' : '👩 Femme'}
                                </Badge>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <Phone className="h-4 w-4 text-slate-400" />
                                <span className="text-sm font-medium">{formatPhoneNumber(member.telephone)}</span>
                              </div>
                              <p className="text-sm text-slate-500">{member.ville}, {member.pays}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-medium text-slate-700">{member.profession}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-medium text-slate-700">{member.commission}</span>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <span className="text-sm font-bold text-slate-900">#{member.numeroAdhesion}</span>
                              <p className="text-xs text-slate-500">{formatDate(member.dateAdhesion)}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button 
                                size="sm"
                                variant="ghost"
                                onClick={() => handleViewMember(member)}
                                className="group/btn p-2 h-8 w-8 bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 rounded-lg transition-all duration-300 hover:scale-110"
                                title="Voir détails"
                              >
                                <Eye className="h-4 w-4 group-hover/btn:scale-110 transition-transform duration-300" />
                              </Button>
                              <Button 
                                size="sm"
                                variant="ghost"
                                onClick={() => handleViewCotisationHistory(member)}
                                className="group/btn p-2 h-8 w-8 bg-purple-50 hover:bg-purple-100 text-purple-600 hover:text-purple-700 rounded-lg transition-all duration-300 hover:scale-110"
                                title="Historique cotisations"
                              >
                                <History className="h-4 w-4 group-hover/btn:scale-110 transition-transform duration-300" />
                              </Button>
                              <Button 
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditMember(member)}
                                className="group/btn p-2 h-8 w-8 bg-green-50 hover:bg-green-100 text-green-600 hover:text-green-700 rounded-lg transition-all duration-300 hover:scale-110"
                                title="Modifier"
                              >
                                <Edit className="h-4 w-4 group-hover/btn:scale-110 transition-transform duration-300" />
                              </Button>
                              <Button 
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteMember(member)}
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

                {/* Cartes mobile */}
                <div className="lg:hidden space-y-4 p-4">
                  {members.map((member, index) => (
                    <Card 
                      key={member.id}
                      className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500 bg-white"
                      style={{ animationDelay: `${index * 50}ms`, animation: 'fadeInUp 0.5s ease-out forwards' }}
                    >
                      <CardContent className="p-4">
                        {/* En-tête de la carte */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-12 h-12 border-2 border-blue-200">
                              <AvatarImage 
                                src={member.photoProfile ? `http://localhost:3001${member.photoProfile}` : undefined} 
                              />
                              <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-lg font-semibold">
                                {getInitials(member.prenom, member.nom)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold text-lg text-slate-900">
                                {formatFullName(member.prenom, member.nom)}
                              </h3>
                              <p className="text-sm text-slate-600">#{member.numeroAdhesion}</p>
                            </div>
                          </div>
                          <Badge 
                            className={`${
                              member.genre === 'HOMME' 
                                ? 'bg-blue-100 text-blue-800 border-blue-200' 
                                : 'bg-pink-100 text-pink-800 border-pink-200'
                            } border-2`}
                          >
                            {member.genre === 'HOMME' ? '👨 Homme' : '👩 Femme'}
                          </Badge>
                        </div>

                        {/* Informations principales */}
                        <div className="grid grid-cols-1 gap-3 mb-4">
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-slate-400" />
                            <span className="text-sm font-medium text-slate-700">{formatPhoneNumber(member.telephone)}</span>
                          </div>
                          {member.email && (
                            <div className="flex items-center space-x-2">
                              <Mail className="w-4 h-4 text-slate-400" />
                              <span className="text-sm font-medium text-slate-700">{member.email}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <span className="text-sm font-medium text-slate-700">{member.adresse}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Briefcase className="w-4 h-4 text-slate-400" />
                            <span className="text-sm font-medium text-slate-700">{member.profession}</span>
                          </div>
                          {member.commission && (
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 bg-purple-100 rounded-full flex items-center justify-center">
                                <span className="text-xs text-purple-600">🏛️</span>
                              </div>
                              <span className="text-sm font-medium text-slate-700">{member.commission}</span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewMember(member)}
                              className="flex items-center space-x-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 rounded-lg transition-all duration-200 min-h-[44px]"
                            >
                              <Eye className="w-4 h-4" />
                              <span className="text-sm">Voir</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewCotisationHistory(member)}
                              className="flex items-center space-x-1 px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-600 hover:text-purple-700 rounded-lg transition-all duration-200 min-h-[44px]"
                            >
                              <History className="w-4 h-4" />
                              <span className="text-sm">Cotisations</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditMember(member)}
                              className="flex items-center space-x-1 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-600 hover:text-green-700 rounded-lg transition-all duration-200 min-h-[44px]"
                            >
                              <Edit className="w-4 h-4" />
                              <span className="text-sm">Modifier</span>
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteMember(member)}
                            className="flex items-center space-x-1 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 rounded-lg transition-all duration-200 min-h-[44px]"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="text-sm">Supprimer</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination mobile-first */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-blue-50 border-t border-slate-200 space-y-3 sm:space-y-0">
                    <p className="text-sm text-slate-600 font-medium text-center sm:text-left">
                      Page {currentPage} sur {totalPages}
                    </p>
                    <div className="flex items-center space-x-2 w-full sm:w-auto justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1 || loading}
                        className="group border-2 border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50 transition-all duration-300 min-h-[44px] px-4"
                      >
                        <span className="group-hover:-translate-x-1 transition-transform duration-300">←</span>
                        <span className="ml-1 hidden sm:inline">Précédent</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages || loading}
                        className="group border-2 border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50 transition-all duration-300 min-h-[44px] px-4"
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
      <MemberForm
        isOpen={showMemberForm}
        onClose={() => setShowMemberForm(false)}
        onSuccess={handleFormSuccess}
        member={editingMember}
      />

      <MemberDetails
        isOpen={showMemberDetails}
        onClose={() => setShowMemberDetails(false)}
        member={selectedMember}
        defaultTab={defaultTab}
        onEdit={() => {
          setShowMemberDetails(false);
          setEditingMember(selectedMember);
          setShowMemberForm(true);
        }}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le membre{' '}
              <strong>{selectedMember ? formatFullName(selectedMember.prenom, selectedMember.nom) : ''}</strong> ?
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Members;

