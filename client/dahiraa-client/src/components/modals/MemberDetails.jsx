import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Hash, 
  Edit, 
  Trash2,
  TrendingUp,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  BarChart3,
  History,
  Filter,
  Search
} from 'lucide-react';
import { cotisationService } from '../../services/api';
import { formatDate, formatFullName, formatCurrency, getInitials } from '../../utils/format';

const MemberDetails = ({ isOpen, onClose, member, onEdit, onDelete, defaultTab = 'info' }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [cotisationHistory, setCotisationHistory] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    statut: 'all',
    dateDebut: '',
    dateFin: ''
  });

  useEffect(() => {
    if (isOpen && member && activeTab === 'history') {
      fetchCotisationHistory();
    }
  }, [isOpen, member, activeTab]);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
    }
  }, [isOpen, defaultTab]);

  const fetchCotisationHistory = async () => {
    if (!member) return;
    
    try {
      setLoadingHistory(true);
      setHistoryError('');
      
      const params = {};
      if (filters.type !== 'all') params.type = filters.type;
      if (filters.statut !== 'all') params.statut = filters.statut;
      if (filters.dateDebut) params.dateDebut = filters.dateDebut;
      if (filters.dateFin) params.dateFin = filters.dateFin;
      
      const response = await cotisationService.getMemberCotisationHistory(member.id, params);
      setCotisationHistory(response);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
      setHistoryError('Erreur lors du chargement de l\'historique des cotisations');
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    fetchCotisationHistory();
  };

  const getStatusBadge = (statut) => {
    switch (statut) {
      case 'PAYE':
        return <Badge className="bg-green-100 text-green-800">✅ Payé</Badge>;
      case 'EN_ATTENTE':
        return <Badge className="bg-yellow-100 text-yellow-800">⏳ En attente</Badge>;
      case 'EN_RETARD':
        return <Badge className="bg-red-100 text-red-800">⚠️ En retard</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{statut}</Badge>;
    }
  };

  const getTypeBadge = (type, evenementType, description) => {
    if (type === 'HEBDOMADAIRE') {
      return <Badge className="bg-blue-100 text-blue-800">📅 Hebdomadaire</Badge>;
    } else if (type === 'EVENEMENT') {
      const eventLabels = {
        'MARIAGE': '💒 Mariage',
        'BAPTEME': '👶 Baptême',
        'FUNERAILLE': '⚰️ Funérailles',
        'NAISSANCE': '🎉 Naissance',
        'RETRAITE': '🎊 Retraite',
        'VOYAGE': '✈️ Voyage',
        'PROJET': '🏗️ Projet',
        'AUTRE': '🎯 Autre'
      };
      return <Badge className="bg-purple-100 text-purple-800">{eventLabels[evenementType] || '🎯 Événement'}</Badge>;
    }
    return <Badge className="bg-gray-100 text-gray-800">{type}</Badge>;
  };

  if (!member) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-4xl lg:max-w-6xl max-h-[95vh] overflow-y-auto bg-white p-4 sm:p-6">
        <DialogHeader className="text-center pb-4">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <User className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            Détails du Membre
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base text-gray-600">
            Informations complètes et historique des cotisations
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-10 sm:h-12">
            <TabsTrigger value="info" className="text-xs sm:text-sm">Informations</TabsTrigger>
            <TabsTrigger value="history" className="text-xs sm:text-sm">Historique Cotisations</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4 sm:space-y-6">
            {/* Informations du membre */}
            <Card className="border border-gray-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200 p-3 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <Avatar className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-white shadow-lg">
                      <AvatarImage 
                        src={member.photoProfile ? `http://localhost:3001${member.photoProfile}` : undefined} 
                      />
                      <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-lg sm:text-xl font-bold">
                        {getInitials(member.prenom, member.nom)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg sm:text-2xl font-bold text-gray-900">
                        {formatFullName(member.prenom, member.nom)}
                      </CardTitle>
                      <CardDescription className="text-sm sm:text-base text-gray-600">
                        #{member.numeroAdhesion}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => onEdit(member)}
                      variant="outline"
                      size="sm"
                      className="h-8 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm"
                    >
                      <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Modifier
                    </Button>
                    <Button
                      onClick={() => onDelete(member)}
                      variant="outline"
                      size="sm"
                      className="h-8 sm:h-10 px-3 sm:px-4 text-red-600 hover:text-red-700 text-xs sm:text-sm"
                    >
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                {/* Informations de base - Affichage conditionnel */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
                  <div className="space-y-3 sm:space-y-4">
                    {member.telephone && (
                      <div className="flex items-center space-x-3">
                        <Phone className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Téléphone</p>
                          <p className="text-sm sm:text-base text-gray-900">{member.telephone}</p>
                        </div>
                      </div>
                    )}
                    {member.email && (
                      <div className="flex items-center space-x-3">
                        <Mail className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Email</p>
                          <p className="text-sm sm:text-base text-gray-900">{member.email}</p>
                        </div>
                      </div>
                    )}
                    {member.adresse && (
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-4 w-4 text-orange-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Adresse</p>
                          <p className="text-sm sm:text-base text-gray-900">{member.adresse}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    {member.dateAdhesion && (
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-4 w-4 text-purple-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Date d'adhésion</p>
                          <p className="text-sm sm:text-base text-gray-900">
                            {formatDate(member.dateAdhesion)}
                          </p>
                        </div>
                      </div>
                    )}
                    {member.genre && (
                      <div className="flex items-center space-x-3">
                        <User className="h-4 w-4 text-indigo-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Genre</p>
                          <Badge className={`${
                            member.genre === 'HOMME' 
                              ? 'bg-blue-100 text-blue-800 border-blue-200' 
                              : 'bg-pink-100 text-pink-800 border-pink-200'
                          } border-2`}>
                            {member.genre === 'HOMME' ? '👨 Homme' : '👩 Femme'}
                          </Badge>
                        </div>
                      </div>
                    )}
                    {member.numeroAdhesion && (
                      <div className="flex items-center space-x-3">
                        <Hash className="h-4 w-4 text-gray-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Numéro d'adhésion</p>
                          <p className="text-sm sm:text-base text-gray-900 font-mono">#{member.numeroAdhesion}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Informations professionnelles - Affichage conditionnel */}
                {(member.profession || member.entreprise || member.commission || member.niveauEtudes || member.niveauArabe || member.typeAutorite) && (
                  <Card className="border border-gray-200 shadow-sm">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-200 p-3 sm:p-4">
                      <CardTitle className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                        <User className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                        Informations professionnelles
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-3 sm:space-y-4">
                          {member.profession && (
                            <div className="flex items-center space-x-3">
                              <div className="h-4 w-4 text-blue-600">💼</div>
                              <div>
                                <p className="text-sm font-medium text-gray-500">Profession</p>
                                <p className="text-sm sm:text-base text-gray-900">{member.profession}</p>
                              </div>
                            </div>
                          )}
                          {member.entreprise && (
                            <div className="flex items-center space-x-3">
                              <div className="h-4 w-4 text-purple-600">🏢</div>
                              <div>
                                <p className="text-sm font-medium text-gray-500">Entreprise</p>
                                <p className="text-sm sm:text-base text-gray-900">{member.entreprise}</p>
                              </div>
                            </div>
                          )}
                          {member.commission && (
                            <div className="flex items-center space-x-3">
                              <div className="h-4 w-4 text-green-600">📋</div>
                              <div>
                                <p className="text-sm font-medium text-gray-500">Commission</p>
                                <p className="text-sm sm:text-base text-gray-900">{member.commission}</p>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="space-y-3 sm:space-y-4">
                          {member.niveauEtudes && (
                            <div className="flex items-center space-x-3">
                              <div className="h-4 w-4 text-orange-600">🎓</div>
                              <div>
                                <p className="text-sm font-medium text-gray-500">Niveau d'études</p>
                                <p className="text-sm sm:text-base text-gray-900">{member.niveauEtudes}</p>
                              </div>
                            </div>
                          )}
                          {member.niveauArabe && (
                            <div className="flex items-center space-x-3">
                              <div className="h-4 w-4 text-red-600">📚</div>
                              <div>
                                <p className="text-sm font-medium text-gray-500">Niveau arabe</p>
                                <p className="text-sm sm:text-base text-gray-900">{member.niveauArabe}</p>
                              </div>
                            </div>
                          )}
                          {member.typeAutorite && (
                            <div className="flex items-center space-x-3">
                              <div className="h-4 w-4 text-indigo-600">⚖️</div>
                              <div>
                                <p className="text-sm font-medium text-gray-500">Type d'autorité</p>
                                <p className="text-sm sm:text-base text-gray-900">{member.typeAutorite}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Informations personnelles - Affichage conditionnel */}
                {(member.dateNaissance || member.lieuNaissance || member.nationalite || member.etatCivil || member.nombreEnfants || member.notes) && (
                  <Card className="border border-gray-200 shadow-sm">
                    <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50 border-b border-gray-200 p-3 sm:p-4">
                      <CardTitle className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                        <User className="h-4 w-4 sm:h-5 sm:w-5 text-pink-600" />
                        Informations personnelles
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-3 sm:space-y-4">
                          {member.dateNaissance && (
                            <div className="flex items-center space-x-3">
                              <div className="h-4 w-4 text-blue-600">🎂</div>
                              <div>
                                <p className="text-sm font-medium text-gray-500">Date de naissance</p>
                                <p className="text-sm sm:text-base text-gray-900">
                                  {formatDate(member.dateNaissance)}
                                </p>
                              </div>
                            </div>
                          )}
                          {member.lieuNaissance && (
                            <div className="flex items-center space-x-3">
                              <div className="h-4 w-4 text-green-600">🏠</div>
                              <div>
                                <p className="text-sm font-medium text-gray-500">Lieu de naissance</p>
                                <p className="text-sm sm:text-base text-gray-900">{member.lieuNaissance}</p>
                              </div>
                            </div>
                          )}
                          {member.nationalite && (
                            <div className="flex items-center space-x-3">
                              <div className="h-4 w-4 text-purple-600">🌍</div>
                              <div>
                                <p className="text-sm font-medium text-gray-500">Nationalité</p>
                                <p className="text-sm sm:text-base text-gray-900">{member.nationalite}</p>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="space-y-3 sm:space-y-4">
                          {member.etatCivil && (
                            <div className="flex items-center space-x-3">
                              <div className="h-4 w-4 text-orange-600">💒</div>
                              <div>
                                <p className="text-sm font-medium text-gray-500">État civil</p>
                                <p className="text-sm sm:text-base text-gray-900">{member.etatCivil}</p>
                              </div>
                            </div>
                          )}
                          {member.nombreEnfants && (
                            <div className="flex items-center space-x-3">
                              <div className="h-4 w-4 text-red-600">👨‍👩‍👧‍👦</div>
                              <div>
                                <p className="text-sm font-medium text-gray-500">Nombre d'enfants</p>
                                <p className="text-sm sm:text-base text-gray-900">{member.nombreEnfants}</p>
                              </div>
                            </div>
                          )}
                          {member.notes && (
                            <div className="flex items-center space-x-3">
                              <div className="h-4 w-4 text-indigo-600">📝</div>
                              <div>
                                <p className="text-sm font-medium text-gray-500">Notes</p>
                                <p className="text-sm sm:text-base text-gray-900">{member.notes}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4 sm:space-y-6">
            {/* Filtres */}
            <Card className="border border-gray-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-200 p-3 sm:p-6">
                <CardTitle className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  Filtres de recherche
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div>
                    <Label className="text-xs sm:text-sm font-medium text-gray-700">Type</Label>
                    <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
                      <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les types</SelectItem>
                        <SelectItem value="HEBDOMADAIRE">Hebdomadaire</SelectItem>
                        <SelectItem value="EVENEMENT">Événement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs sm:text-sm font-medium text-gray-700">Statut</Label>
                    <Select value={filters.statut} onValueChange={(value) => handleFilterChange('statut', value)}>
                      <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les statuts</SelectItem>
                        <SelectItem value="PAYE">Payé</SelectItem>
                        <SelectItem value="EN_ATTENTE">En attente</SelectItem>
                        <SelectItem value="EN_RETARD">En retard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs sm:text-sm font-medium text-gray-700">Date début</Label>
                    <Input
                      type="date"
                      value={filters.dateDebut}
                      onChange={(e) => handleFilterChange('dateDebut', e.target.value)}
                      className="h-9 sm:h-10 text-xs sm:text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs sm:text-sm font-medium text-gray-700">Date fin</Label>
                    <Input
                      type="date"
                      value={filters.dateFin}
                      onChange={(e) => handleFilterChange('dateFin', e.target.value)}
                      className="h-9 sm:h-10 text-xs sm:text-sm"
                    />
                  </div>
                </div>
                <div className="mt-3 sm:mt-4">
                  <Button
                    onClick={applyFilters}
                    disabled={loadingHistory}
                    className="w-full sm:w-auto h-9 sm:h-10 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm"
                  >
                    <Search className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Appliquer les filtres
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Statistiques */}
            {cotisationHistory && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs sm:text-sm font-semibold text-blue-800">💰 Total Cotisé</CardTitle>
                    <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl sm:text-3xl font-bold text-blue-900">
                      {formatCurrency(cotisationHistory.statistiques.totalCotise)}
                    </div>
                    <p className="text-xs text-blue-600 mt-1">Montant total</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs sm:text-sm font-semibold text-green-800">✅ Payées</CardTitle>
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl sm:text-3xl font-bold text-green-900">
                      {cotisationHistory.statistiques.cotisationsPayees}
                    </div>
                    <p className="text-xs text-green-600 mt-1">Cotisations payées</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs sm:text-sm font-semibold text-yellow-800">⏳ En attente</CardTitle>
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl sm:text-3xl font-bold text-yellow-900">
                      {cotisationHistory.statistiques.cotisationsEnAttente}
                    </div>
                    <p className="text-xs text-yellow-600 mt-1">En attente</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs sm:text-sm font-semibold text-red-800">⚠️ En retard</CardTitle>
                    <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl sm:text-3xl font-bold text-red-900">
                      {cotisationHistory.statistiques.cotisationsEnRetard}
                    </div>
                    <p className="text-xs text-red-600 mt-1">En retard</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Liste des cotisations */}
            <Card className="border border-gray-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200 p-3 sm:p-6">
                <CardTitle className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                  <History className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                  Historique des cotisations
                </CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  {cotisationHistory?.cotisations?.length || 0} cotisation(s) trouvée(s)
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                {loadingHistory ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement de l'historique...</p>
                  </div>
                ) : historyError ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">⚠️</span>
                    </div>
                    <p className="text-red-600">{historyError}</p>
                  </div>
                ) : cotisationHistory?.cotisations?.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {cotisationHistory.cotisations.map((cotisation, index) => (
                      <div key={cotisation.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border border-gray-100 rounded-lg sm:rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200">
                        <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-0">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-xs sm:text-sm font-bold text-white">
                              {getInitials(cotisation.member.prenom, cotisation.member.nom)}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm sm:text-lg">
                              {formatFullName(cotisation.member.prenom, cotisation.member.nom)}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500">#{cotisation.member.numeroAdhesion}</p>
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-6">
                            <div className="text-center">
                              <p className="text-xs sm:text-sm text-gray-500 font-medium">💰 Montant</p>
                              <p className="font-bold text-green-600 text-sm sm:text-lg">
                                {formatCurrency(cotisation.montant)}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs sm:text-sm text-gray-500 font-medium">📅 Semaine</p>
                              <p className="font-bold text-blue-600 text-sm sm:text-lg">
                                {formatDate(cotisation.semaine)}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs sm:text-sm text-gray-500 font-medium">📋 Type</p>
                              <div className="mt-1">
                                {getTypeBadge(cotisation.type, cotisation.evenementType, cotisation.description)}
                              </div>
                            </div>
                            <div className="text-center">
                              <p className="text-xs sm:text-sm text-gray-500 font-medium">📊 Statut</p>
                              <div className="mt-1">
                                {getStatusBadge(cotisation.statut)}
                              </div>
                            </div>
                          </div>
                          {cotisation.description && (
                            <div className="mt-2 text-center sm:text-right">
                              <p className="text-xs text-gray-500 italic">"{cotisation.description}"</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">📄</span>
                    </div>
                    <p className="text-gray-600">Aucune cotisation trouvée</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter className="pt-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full sm:w-auto h-10 sm:h-12 border-2 border-gray-300 hover:border-gray-400 bg-white text-gray-700 font-semibold px-4 sm:px-6 rounded-lg text-sm sm:text-base"
          >
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MemberDetails; 