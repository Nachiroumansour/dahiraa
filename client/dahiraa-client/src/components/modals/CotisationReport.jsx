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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  TrendingUp, 
  Users, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  XCircle,
  Download,
  FileSpreadsheet,
  FileText,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { cotisationService, memberService } from '../../services/api';
import { formatDate, formatCurrency } from '../../utils/format';

const CotisationReport = ({ isOpen, onClose, selectedWeek = '', selectedMonth = '' }) => {
  const [reportType, setReportType] = useState('weekly');
  const [weekDate, setWeekDate] = useState(selectedWeek);
  const [monthDate, setMonthDate] = useState(selectedMonth);
  const [yearDate, setYearDate] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [weeklyData, setWeeklyData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [yearlyData, setYearlyData] = useState(null);
  const [allMembers, setAllMembers] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchAllMembers();
      // Initialiser avec des valeurs par défaut si pas de sélection
      if (!weekDate && reportType === 'weekly') {
        const currentThursday = new Date();
        const day = currentThursday.getDay();
        const diff = currentThursday.getDate() - day + (day === 0 ? -3 : 4);
        const thursday = new Date(currentThursday.setDate(diff));
        setWeekDate(thursday.toISOString().split('T')[0]);
      }
      if (!monthDate && reportType === 'monthly') {
        setMonthDate(String(new Date().getMonth() + 1));
      }
      if (!yearDate && reportType === 'yearly') {
        setYearDate(new Date().getFullYear());
      }
    }
  }, [isOpen, reportType]);

  const fetchAllMembers = async () => {
    try {
      const response = await memberService.getMembers({ limit: 1000 });
      setAllMembers(response.members);
    } catch (err) {
      console.error('Erreur lors du chargement des membres:', err);
    }
  };

  const fetchWeeklyReport = async (week) => {
    try {
      setLoading(true);
      const response = await cotisationService.getCotisationsByWeek(week);
      setWeeklyData(response);
    } catch (err) {
      setError('Erreur lors du chargement du rapport hebdomadaire');
      console.error('Weekly report error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyReport = async (month, year) => {
    try {
      setLoading(true);
      setError('');
      const response = await cotisationService.getMonthlyReport(month, year);
      setMonthlyData(response);
    } catch (err) {
      console.error('Monthly report error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Erreur lors du chargement du rapport mensuel';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchYearlyReport = async (year) => {
    try {
      setLoading(true);
      const response = await cotisationService.getYearlyReport(year);
      setYearlyData(response);
    } catch (err) {
      setError('Erreur lors du chargement du rapport annuel');
      console.error('Yearly report error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReportTypeChange = (type) => {
    setReportType(type);
    setError('');
    
    // Initialiser les valeurs par défaut selon le type
    if (type === 'weekly' && !weekDate) {
      const currentThursday = new Date();
      const day = currentThursday.getDay();
      const diff = currentThursday.getDate() - day + (day === 0 ? -3 : 4);
      const thursday = new Date(currentThursday.setDate(diff));
      setWeekDate(thursday.toISOString().split('T')[0]);
    } else if (type === 'monthly' && !monthDate) {
      setMonthDate(String(new Date().getMonth() + 1));
    } else if (type === 'yearly' && !yearDate) {
      setYearDate(new Date().getFullYear());
    }
    
    // Charger les données si les valeurs sont disponibles
    if (type === 'weekly' && weekDate) {
      fetchWeeklyReport(weekDate);
    } else if (type === 'monthly' && monthDate && yearDate) {
      fetchMonthlyReport(monthDate, yearDate);
    } else if (type === 'yearly' && yearDate) {
      fetchYearlyReport(yearDate);
    }
  };

  const getInitials = (prenom, nom) => {
    return `${prenom?.charAt(0) || ''}${nom?.charAt(0) || ''}`.toUpperCase();
  };

  const renderWeeklyReport = () => {
    if (!weeklyData) return null;

    return (
      <div className="space-y-8">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-blue-800">👥 Total Membres</CardTitle>
              <Users className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">{weeklyData.stats.total}</div>
              <p className="text-xs text-blue-600 mt-1">Membres actifs</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-green-800">✅ Payés</CardTitle>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">{weeklyData.stats.payes}</div>
              <p className="text-xs text-green-600 mt-1">Cotisations payées</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-yellow-800">⏳ En Attente</CardTitle>
              <Clock className="h-5 w-5 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-900">{weeklyData.stats.enAttente}</div>
              <p className="text-xs text-yellow-600 mt-1">En attente de paiement</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-purple-800">💰 Montant Total</CardTitle>
              <DollarSign className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">{formatCurrency(weeklyData.stats.montantTotal)}</div>
              <p className="text-xs text-purple-600 mt-1">Total collecté</p>
            </CardContent>
          </Card>
        </div>

        {/* Liste des membres */}
        <Card className="border-2 border-gray-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b-2 border-gray-200">
            <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Détail par membre
            </CardTitle>
            <CardDescription className="text-gray-600">
              📅 Semaine du {formatDate(weeklyData.semaine)}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {weeklyData.report.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 border-2 border-gray-100 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-sm font-bold text-white">{getInitials(item.member.prenom, item.member.nom)}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-lg">{item.member.prenom} {item.member.nom}</p>
                      <p className="text-sm text-gray-500">#{item.member.numeroAdhesion}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {item.statut === 'PAYE' && (
                      <Badge className="bg-green-100 text-green-800 border-2 border-green-200 px-3 py-1">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Payé
                      </Badge>
                    )}
                    {item.statut === 'EN_ATTENTE' && (
                      <Badge className="bg-yellow-100 text-yellow-800 border-2 border-yellow-200 px-3 py-1">
                        <Clock className="w-4 h-4 mr-1" />
                        En attente
                      </Badge>
                    )}
                    {item.statut === 'ABSENT' && (
                      <Badge className="bg-red-100 text-red-800 border-2 border-red-200 px-3 py-1">
                        <XCircle className="w-4 h-4 mr-1" />
                        Absent
                      </Badge>
                    )}
                    {item.cotisation && (
                      <span className="text-lg font-bold text-green-600">
                        {formatCurrency(item.cotisation.montant)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderMonthlyReport = () => {
    if (!monthlyData) return null;

    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-semibold text-blue-800">👥 Total Membres</CardTitle>
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-blue-900">{monthlyData.totalMembers}</div>
              <p className="text-xs text-blue-600 mt-1">Membres actifs</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-semibold text-green-800">💰 Total Payé</CardTitle>
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-green-900">
                {formatCurrency(monthlyData.totalCotise)}
              </div>
              <p className="text-xs text-green-600 mt-1">Montant total payé</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-semibold text-purple-800">📊 Taux Participation</CardTitle>
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-purple-900">
                {monthlyData.tauxParticipationGlobal?.toFixed(1) || '0.0'}%
              </div>
              <p className="text-xs text-purple-600 mt-1">Taux global</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-semibold text-orange-800">📅 Jeudis</CardTitle>
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-orange-900">{monthlyData.nombreJeudis}</div>
              <p className="text-xs text-orange-600 mt-1">Jeudis du mois</p>
            </CardContent>
          </Card>
        </div>

        {/* Statistiques supplémentaires */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-semibold text-yellow-800">⚠️ En retard</CardTitle>
              <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-yellow-900">{monthlyData.membresEnRetard}</div>
              <p className="text-xs text-yellow-600 mt-1">Membres en retard</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-semibold text-red-800">💸 Restes</CardTitle>
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-red-900">
                {formatCurrency(monthlyData.totalRestes)}
              </div>
              <p className="text-xs text-red-600 mt-1">Montant restant</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-semibold text-indigo-800">📈 Attendu</CardTitle>
              <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-indigo-900">
                {formatCurrency(monthlyData.totalAttendu)}
              </div>
              <p className="text-xs text-indigo-600 mt-1">Montant attendu</p>
            </CardContent>
          </Card>
        </div>

        {/* Résumé par membre */}
        <Card className="border border-gray-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-purple-50 border-b border-gray-200 p-3 sm:p-6">
            <CardTitle className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
              <PieChart className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
              Résumé par membre
            </CardTitle>
            <CardDescription className="text-sm text-gray-600">
              📊 {new Date(monthlyData.annee, monthlyData.mois - 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              {monthlyData.memberStats?.map((item, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border border-gray-100 rounded-lg sm:rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200">
                  <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-xs sm:text-sm font-bold text-white">{getInitials(item.member.prenom, item.member.nom)}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm sm:text-lg">{item.member.prenom} {item.member.nom}</p>
                      <p className="text-xs sm:text-sm text-gray-500">#{item.member.numeroAdhesion}</p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-6">
                      <div className="text-center">
                        <p className="text-xs sm:text-sm text-gray-500 font-medium">💰 Payé</p>
                        <p className="font-bold text-green-600 text-sm sm:text-lg">{formatCurrency(item.totalCotise)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs sm:text-sm text-gray-500 font-medium">📊 Participation</p>
                        <p className="font-bold text-purple-600 text-sm sm:text-lg">{item.tauxParticipation?.toFixed(1) || '0.0'}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs sm:text-sm text-gray-500 font-medium">📅 Cotisations</p>
                        <p className="font-bold text-blue-600 text-sm sm:text-lg">{item.nombreCotisations}/{item.nombreJeudis}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs sm:text-sm text-gray-500 font-medium">💸 Reste</p>
                        <p className="font-bold text-red-600 text-sm sm:text-lg">{formatCurrency(Math.max(0, item.reste))}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderYearlyReport = () => {
    if (!yearlyData) return null;

    return (
      <div className="space-y-8">
        {/* Statistiques globales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-blue-800">👥 Total Membres</CardTitle>
              <Users className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">{yearlyData.stats.totalMembres}</div>
              <p className="text-xs text-blue-600 mt-1">Membres actifs</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-green-800">💰 Total Cotisé</CardTitle>
              <DollarSign className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">
                {formatCurrency(yearlyData.stats.totalCotise)}
              </div>
              <p className="text-xs text-green-600 mt-1">Montant total</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-purple-800">📊 Moyenne/Membre</CardTitle>
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">
                {formatCurrency(yearlyData.stats.moyenneParMembre)}
              </div>
              <p className="text-xs text-purple-600 mt-1">Par membre</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-orange-800">📅 Année</CardTitle>
              <Calendar className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-900">{yearlyData.annee}</div>
              <p className="text-xs text-orange-600 mt-1">Année fiscale</p>
            </CardContent>
          </Card>
        </div>

        {/* Évolution mensuelle */}
        <Card className="border-2 border-gray-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-orange-50 border-b-2 border-gray-200">
            <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange-600" />
              Évolution mensuelle
            </CardTitle>
            <CardDescription className="text-gray-600">📈 Répartition des cotisations par mois</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {yearlyData.monthlyStats.map((month, index) => (
                <div key={index} className="flex items-center justify-between p-4 border-2 border-gray-100 rounded-xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 transition-all duration-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center shadow-lg">
                      <span className="text-sm font-bold text-white">{month.mois}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-lg">{month.nomMois}</p>
                      <p className="text-sm text-gray-500">{month.nombreJeudis} jeudis</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-500 font-medium">💰 Cotisé</p>
                        <p className="font-bold text-green-600 text-lg">{formatCurrency(month.totalCotise)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500 font-medium">📊 Participation</p>
                        <p className="font-bold text-orange-600 text-lg">{month.tauxParticipation.toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-4xl lg:max-w-6xl max-h-[95vh] overflow-y-auto bg-white p-4 sm:p-6">
        <DialogHeader className="text-center pb-4">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            Rapports de Cotisations
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base text-gray-600">
            Consultez les rapports détaillés des cotisations avec des statistiques avancées
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          <Tabs value={reportType} onValueChange={handleReportTypeChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-10 sm:h-12">
              <TabsTrigger value="weekly" className="text-xs sm:text-sm">Hebdomadaire</TabsTrigger>
              <TabsTrigger value="monthly" className="text-xs sm:text-sm">Mensuel</TabsTrigger>
              <TabsTrigger value="yearly" className="text-xs sm:text-sm">Annuel</TabsTrigger>
            </TabsList>

            <TabsContent value="weekly" className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 sm:gap-4 p-3 sm:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl border border-blue-200">
                <div className="flex-1">
                  <Label htmlFor="week" className="text-sm font-semibold text-blue-800">📅 Semaine</Label>
                  <Input
                    id="week"
                    type="date"
                    value={weekDate}
                    onChange={(e) => setWeekDate(e.target.value)}
                    className="mt-2 h-10 sm:h-12 border-2 border-blue-300 focus:border-blue-500 bg-white text-sm sm:text-base"
                  />
                </div>
                <Button 
                  onClick={() => fetchWeeklyReport(weekDate)}
                  disabled={loading}
                  className="w-full sm:w-auto h-10 sm:h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-4 sm:px-6 rounded-lg shadow-lg text-sm sm:text-base"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Génération...</span>
                    </div>
                  ) : (
                    <>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Générer
                    </>
                  )}
                </Button>
              </div>
              {renderWeeklyReport()}
            </TabsContent>

            <TabsContent value="monthly" className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 sm:gap-4 p-3 sm:p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg sm:rounded-xl border border-purple-200">
                <div className="flex-1">
                  <Label htmlFor="month" className="text-sm font-semibold text-purple-800">📅 Mois</Label>
                  <Select value={monthDate} onValueChange={setMonthDate}>
                    <SelectTrigger className="mt-2 h-10 sm:h-12 border-2 border-purple-300 focus:border-purple-500 bg-white text-sm sm:text-base">
                      <SelectValue placeholder="Sélectionner le mois" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Janvier</SelectItem>
                      <SelectItem value="2">Février</SelectItem>
                      <SelectItem value="3">Mars</SelectItem>
                      <SelectItem value="4">Avril</SelectItem>
                      <SelectItem value="5">Mai</SelectItem>
                      <SelectItem value="6">Juin</SelectItem>
                      <SelectItem value="7">Juillet</SelectItem>
                      <SelectItem value="8">Août</SelectItem>
                      <SelectItem value="9">Septembre</SelectItem>
                      <SelectItem value="10">Octobre</SelectItem>
                      <SelectItem value="11">Novembre</SelectItem>
                      <SelectItem value="12">Décembre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label htmlFor="year" className="text-sm font-semibold text-purple-800">📅 Année</Label>
                  <Input
                    id="year"
                    type="number"
                    value={yearDate}
                    onChange={(e) => setYearDate(e.target.value)}
                    className="mt-2 h-10 sm:h-12 border-2 border-purple-300 focus:border-purple-500 bg-white text-sm sm:text-base"
                  />
                </div>
                <Button 
                  onClick={() => fetchMonthlyReport(monthDate, yearDate)}
                  disabled={loading}
                  className="w-full sm:w-auto h-10 sm:h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-4 sm:px-6 rounded-lg shadow-lg text-sm sm:text-base"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Génération...</span>
                    </div>
                  ) : (
                    <>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Générer
                    </>
                  )}
                </Button>
              </div>
              {renderMonthlyReport()}
            </TabsContent>

            <TabsContent value="yearly" className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 sm:gap-4 p-3 sm:p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg sm:rounded-xl border border-orange-200">
                <div className="flex-1">
                  <Label htmlFor="year" className="text-sm font-semibold text-orange-800">📅 Année</Label>
                  <Input
                    id="year"
                    type="number"
                    value={yearDate}
                    onChange={(e) => setYearDate(e.target.value)}
                    className="mt-2 h-10 sm:h-12 border-2 border-orange-300 focus:border-orange-500 bg-white text-sm sm:text-base"
                  />
                </div>
                <Button 
                  onClick={() => fetchYearlyReport(yearDate)}
                  disabled={loading}
                  className="w-full sm:w-auto h-10 sm:h-12 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold px-4 sm:px-6 rounded-lg shadow-lg text-sm sm:text-base"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Génération...</span>
                    </div>
                  ) : (
                    <>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Générer
                    </>
                  )}
                </Button>
              </div>
              {renderYearlyReport()}
            </TabsContent>
          </Tabs>

          {error && (
            <div className="text-red-600 text-center p-4 sm:p-6 bg-red-50 border border-red-200 rounded-lg sm:rounded-xl">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl sm:text-2xl">⚠️</span>
              </div>
              <p className="text-base sm:text-lg font-medium">{error}</p>
            </div>
          )}

          {loading && (
            <div className="text-center p-6 sm:p-8">
              <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 text-base sm:text-lg font-medium">Chargement en cours...</p>
              <p className="text-gray-400 text-sm sm:text-base">Génération des rapports détaillés</p>
            </div>
          )}
        </div>

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

export default CotisationReport; 