import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  Users, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Eye,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { cotisationService, memberService } from '../../services/api';
import { formatDate, formatFullName, formatCurrency, getThursdayOfWeek } from '../../utils/format';

const WeeklyOverview = ({ onViewReport }) => {
  const [currentWeekData, setCurrentWeekData] = useState(null);
  const [allMembers, setAllMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestWeekWithData();
  }, []);

  // Fonction pour charger la semaine la plus récente avec des données
  const fetchLatestWeekWithData = async () => {
    try {
      setLoading(true);
      
      // Charger les membres
      const membersResponse = await memberService.getMembers({ limit: 1000 });
      setAllMembers(membersResponse.members || []);
      
      // Essayer les 4 dernières semaines pour trouver des données
      const currentThursday = getThursdayOfWeek();
      let foundData = false;
      
      for (let i = 0; i < 4; i++) {
        const testThursday = new Date(currentThursday);
        testThursday.setDate(testThursday.getDate() - (i * 7));
        const testWeekDate = testThursday.toISOString().split('T')[0];
        
        try {
          console.log(`🔄 Test semaine ${i + 1}:`, testWeekDate);
          const response = await cotisationService.getCotisationsByWeek(testWeekDate);
          
          if (response.report && response.report.length > 0) {
            console.log(`✅ Données trouvées pour la semaine:`, testWeekDate);
            
            const cotisations = response.report;
            const totalMontant = cotisations.reduce((sum, c) => sum + c.montant, 0);
            const nombrePaye = cotisations.filter(c => c.statut === 'PAYE').length;
            const nombreEnAttente = cotisations.filter(c => c.statut === 'EN_ATTENTE').length;
            
            setCurrentWeekData({
              semaine: testWeekDate,
              cotisations: cotisations,
              resume: {
                totalMontant,
                nombrePaye,
                nombreEnAttente
              }
            });
            
            foundData = true;
            break;
          }
        } catch (err) {
          console.log(`❌ Pas de données pour la semaine:`, testWeekDate);
        }
      }
      
      if (!foundData) {
        // Aucune donnée trouvée, utiliser la semaine courante avec des données vides
        const weekDate = currentThursday.toISOString().split('T')[0];
        setCurrentWeekData({
          semaine: weekDate,
          cotisations: [],
          resume: {
            totalMontant: 0,
            nombrePaye: 0,
            nombreEnAttente: 0
          }
        });
      }
    } catch (err) {
      console.error('❌ Erreur lors du chargement des données:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentWeekData = async () => {
    try {
      setLoading(true);
      
      // Obtenir le jeudi de la semaine courante
      const currentThursday = getThursdayOfWeek();
      const weekDate = currentThursday.toISOString().split('T')[0];
      
      console.log('📅 Chargement des données pour la semaine:', weekDate);
      console.log('📅 Date du jeudi calculée:', currentThursday);
      
      // Charger les membres
      const membersResponse = await memberService.getMembers({ limit: 1000 });
      console.log('👥 Membres chargés:', membersResponse.members?.length || 0);
      setAllMembers(membersResponse.members || []);
      
      // Charger les cotisations de la semaine
      try {
        console.log('🔄 Appel API pour les cotisations de la semaine:', weekDate);
        const cotisationsResponse = await cotisationService.getCotisationsByWeek(weekDate);
        console.log('💰 Réponse API cotisations:', cotisationsResponse);
        
        // Si pas de cotisations pour cette semaine, essayer la semaine précédente
        if (!cotisationsResponse.report || cotisationsResponse.report.length === 0) {
          const previousThursday = new Date(currentThursday);
          previousThursday.setDate(previousThursday.getDate() - 7);
          const previousWeekDate = previousThursday.toISOString().split('T')[0];
          
          console.log('🔄 Aucune cotisation trouvée, essai de la semaine précédente:', previousWeekDate);
          const previousResponse = await cotisationService.getCotisationsByWeek(previousWeekDate);
          console.log('💰 Réponse API semaine précédente:', previousResponse);
          
          if (previousResponse.report && previousResponse.report.length > 0) {
            // Utiliser les données de la semaine précédente
            const cotisations = previousResponse.report || [];
            const totalMontant = cotisations.reduce((sum, c) => sum + c.montant, 0);
            const nombrePaye = cotisations.filter(c => c.statut === 'PAYE').length;
            const nombreEnAttente = cotisations.filter(c => c.statut === 'EN_ATTENTE').length;
            
            console.log('📊 Cotisations trouvées (semaine précédente):', cotisations.length);
            console.log('📊 Statistiques calculées:', {
              totalMontant,
              nombrePaye,
              nombreEnAttente,
              totalCotisations: cotisations.length
            });
            
            setCurrentWeekData({
              semaine: previousWeekDate,
              cotisations: cotisations,
              resume: {
                totalMontant,
                nombrePaye,
                nombreEnAttente
              }
            });
            return;
          }
        }
      
        // Calculer les statistiques pour la semaine courante
        const cotisations = cotisationsResponse.report || [];
        const totalMontant = cotisations.reduce((sum, c) => sum + c.montant, 0);
        const nombrePaye = cotisations.filter(c => c.statut === 'PAYE').length;
        const nombreEnAttente = cotisations.filter(c => c.statut === 'EN_ATTENTE').length;
        
        console.log('📊 Cotisations trouvées:', cotisations.length);
        console.log('📊 Détails des cotisations:', cotisations.map(c => ({
          memberId: c.memberId,
          montant: c.montant,
          statut: c.statut,
          type: c.type,
          semaine: c.semaine
        })));
        console.log('📊 Statistiques calculées:', {
          totalMontant,
          nombrePaye,
          nombreEnAttente,
          totalCotisations: cotisations.length
        });
        
        setCurrentWeekData({
          semaine: weekDate,
          cotisations: cotisations,
          resume: {
            totalMontant,
            nombrePaye,
            nombreEnAttente
          }
        });
      } catch (err) {
        console.error('❌ Erreur lors du chargement des cotisations:', err);
        console.error('❌ Détails de l\'erreur:', err.response?.data || err.message);
        
        // Si pas de cotisations pour cette semaine, créer des données vides
        setCurrentWeekData({
          semaine: weekDate,
          cotisations: [],
          resume: {
            totalMontant: 0,
            nombrePaye: 0,
            nombreEnAttente: 0
          }
        });
      }
    } catch (err) {
      console.error('❌ Erreur lors du chargement des données:', err);
      console.error('❌ Détails de l\'erreur:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const getMemberStatus = (memberId) => {
    if (!currentWeekData) return null;
    const cotisation = currentWeekData.cotisations.find(c => c.memberId === memberId);
    return cotisation ? cotisation.statut : null;
  };

  const getMemberCotisation = (memberId) => {
    if (!currentWeekData) return null;
    return currentWeekData.cotisations.find(c => c.memberId === memberId);
  };

  const calculateRestesAPayer = () => {
    if (!currentWeekData || !allMembers.length) return [];
    
    const restes = [];
    const montantStandard = 250; // Montant hebdomadaire standard
    
    allMembers.forEach(member => {
      const cotisation = getMemberCotisation(member.id);
      const aCotise = cotisation && cotisation.statut === 'PAYE';
      const montantCotise = aCotise ? cotisation.montant : 0;
      const reste = montantStandard - montantCotise;
      
      // Inclure tous les membres qui n'ont pas cotisé ou qui ont cotisé moins que le montant standard
      if (reste > 0 || !cotisation) {
        restes.push({
          member,
          reste: reste > 0 ? reste : montantStandard,
          montantCotise,
          aCotise: aCotise && montantCotise >= montantStandard
        });
      }
    });
    
    return restes.sort((a, b) => b.reste - a.reste); // Trier par reste décroissant
  };

  const getInitials = (prenom, nom) => {
    return `${prenom?.charAt(0) || ''}${nom?.charAt(0) || ''}`.toUpperCase();
  };

  const totalMembers = allMembers.length;
  const payeCount = currentWeekData?.resume?.nombrePaye || 0;
  const enAttenteCount = currentWeekData?.resume?.nombreEnAttente || 0;
  const totalCotisations = payeCount + enAttenteCount;
  const participationRate = totalMembers > 0 ? (totalCotisations / totalMembers) * 100 : 0;
  const restesAPayer = calculateRestesAPayer();
  const totalRestes = restesAPayer.reduce((sum, item) => sum + item.reste, 0);

  if (loading) {
    return (
      <Card className="border-2 border-gray-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b-2 border-gray-200">
          <CardTitle className="flex items-center space-x-2 text-gray-800">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span>Aperçu de la semaine</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-gray-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b-2 border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-gray-800">
            <Calendar className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold">📅 Aperçu de la semaine du {formatDate(currentWeekData?.semaine)}</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            {/* <Button 
              variant="outline" 
              size="sm"
              onClick={fetchLatestWeekWithData}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white border-0 font-semibold shadow-lg"
              disabled={loading}
            >
              <span className="text-sm">🔄</span>
              Actualiser
            </Button> */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onViewReport(currentWeekData?.semaine)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 font-semibold shadow-lg"
            >
              <Eye className="h-4 w-4 mr-2" />
              📊 Voir le rapport
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8 p-6">
        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl shadow-lg">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <DollarSign className="h-8 w-8 text-white" />
            </div>
            <div className="text-3xl font-bold text-green-900">
              {formatCurrency(currentWeekData?.resume?.totalMontant || 0)}
            </div>
            <p className="text-sm text-green-700 font-medium">💰 Total collecté</p>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl shadow-lg">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <div className="text-3xl font-bold text-blue-900">{payeCount}</div>
            <p className="text-sm text-blue-700 font-medium">✅ Cotisations payées</p>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-xl shadow-lg">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="h-8 w-8 text-white" />
            </div>
            <div className="text-3xl font-bold text-yellow-900">{enAttenteCount}</div>
            <p className="text-sm text-yellow-700 font-medium">⏳ En attente</p>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-xl shadow-lg">
            <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="h-8 w-8 text-white" />
            </div>
            <div className="text-3xl font-bold text-red-900">{formatCurrency(totalRestes)}</div>
            <p className="text-sm text-red-700 font-medium">⚠️ Restes à payer</p>
          </div>
        </div>

        {/* Taux de participation */}
        <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-purple-800 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Taux de participation
              </span>
              <span className="text-2xl font-bold text-purple-900">{participationRate.toFixed(1)}%</span>
            </div>
            <Progress 
              value={participationRate} 
              className="h-3 bg-purple-200" 
              style={{
                '--progress-background': 'linear-gradient(to right, #8b5cf6, #ec4899)'
              }}
            />
            <p className="text-sm text-purple-700 font-medium">
              📊 {totalCotisations} sur {totalMembers} membres ont cotisé cette semaine
            </p>
          </div>
        </div>

        {/* Membres n'ayant pas encore cotisé */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <span>⚠️ Membres n'ayant pas encore cotisé ({allMembers.length - totalCotisations})</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {allMembers
              .filter(member => !getMemberStatus(member.id))
              .slice(0, 6)
              .map((member) => (
                <div key={member.id} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl hover:from-orange-100 hover:to-red-100 transition-all duration-200">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      {getInitials(member.prenom, member.nom)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate text-gray-900">
                      {formatFullName(member.prenom, member.nom)}
                    </p>
                    <p className="text-xs text-gray-500">#{member.numeroAdhesion}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="destructive" className="text-xs">
                      ❌ Pas encore cotisé
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      Reste: {formatCurrency(250)}
                    </p>
                  </div>
                </div>
              ))}
            {allMembers.filter(member => !getMemberStatus(member.id)).length > 6 && (
              <div className="col-span-full text-center p-4 bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl">
                <p className="text-sm text-orange-700 font-medium">
                  + {allMembers.filter(member => !getMemberStatus(member.id)).length - 6} autre(s) membre(s) en attente
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  Total restes: {formatCurrency(totalRestes)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Cotisations en attente (si il y en a) */}
        {enAttenteCount > 0 && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <span>⏳ Cotisations en attente ({enAttenteCount})</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {allMembers
                .filter(member => getMemberStatus(member.id) === 'EN_ATTENTE')
                .slice(0, 6)
                .map((member) => {
                  const cotisation = currentWeekData?.cotisations.find(c => c.memberId === member.id);
                  return (
                    <div key={member.id} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl hover:from-orange-50 hover:to-yellow-50 transition-all duration-200">
                      <Avatar className="w-8 h-8 border-2 border-yellow-200">
                        <AvatarImage 
                          src={member.photoProfile ? `http://localhost:3001${member.photoProfile}` : undefined} 
                        />
                        <AvatarFallback className="text-xs bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-bold">
                          {getInitials(member.prenom, member.nom)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate text-gray-900">
                          {formatFullName(member.prenom, member.nom)}
                        </p>
                        <p className="text-xs text-gray-500">#{member.numeroAdhesion}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-yellow-700">
                          {formatCurrency(cotisation?.montant || 0)}
                        </p>
                        <Badge className="bg-yellow-100 text-yellow-800 border-2 border-yellow-200 text-xs">
                          ⏳ En attente
                        </Badge>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Action rapide */}
        <div className="flex items-center justify-center pt-4">
          <Button 
            onClick={() => onViewReport(currentWeekData?.semaine)}
            className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-xl shadow-lg"
          >
            <TrendingUp className="h-5 w-5 mr-2" />
            📊 Voir le rapport complet de la semaine
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyOverview; 