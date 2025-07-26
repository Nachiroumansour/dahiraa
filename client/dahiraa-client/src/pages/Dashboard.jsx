import React, { useState, useEffect } from 'react';
import { Users, CreditCard, Receipt, TrendingUp, Calendar, AlertTriangle, BarChart3, PieChart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Layout from '../components/layout/Layout';
import MonthlyTrendChart from '../components/charts/MonthlyTrendChart';
import ExpensesPieChart from '../components/charts/ExpensesPieChart';
import { dashboardService } from '../services/api';
import { formatCurrency, formatDate, formatFullName } from '../utils/format';

const StatCard = ({ title, value, description, icon: Icon, trend, color = 'blue' }) => {
  const colorConfig = {
    blue: {
      bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
      border: 'border-blue-200',
      iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
      text: 'text-blue-700',
      title: 'text-blue-800'
    },
    green: {
      bg: 'bg-gradient-to-br from-green-50 to-green-100',
      border: 'border-green-200',
      iconBg: 'bg-gradient-to-br from-green-500 to-green-600',
      text: 'text-green-700',
      title: 'text-green-800'
    },
    yellow: {
      bg: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
      border: 'border-yellow-200',
      iconBg: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
      text: 'text-yellow-700',
      title: 'text-yellow-800'
    },
    red: {
      bg: 'bg-gradient-to-br from-red-50 to-red-100',
      border: 'border-red-200',
      iconBg: 'bg-gradient-to-br from-red-500 to-red-600',
      text: 'text-red-700',
      title: 'text-red-800'
    }
  };

  const config = colorConfig[color];

  return (
    <Card className={`${config.bg} ${config.border} border-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className={`text-sm font-semibold ${config.title} mb-2`}>{title}</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
            {description && (
              <p className={`text-sm font-medium ${config.text}`}>{description}</p>
            )}
          </div>
          <div className={`p-4 rounded-xl ${config.iconBg} shadow-lg border-2 border-white`}>
            <Icon className="h-7 w-7 text-white" />
          </div>
        </div>
        {trend && (
          <div className="mt-4 flex items-center">
            <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
            <span className="text-sm font-medium text-green-600">{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await dashboardService.getDashboardStats();
        setDashboardData(data);
      } catch (err) {
        setError('Erreur lors du chargement des données');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Layout title="Tableau de bord">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Tableau de bord">
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
          >
            Réessayer
          </Button>
        </div>
      </Layout>
    );
  }

  const { summary, upcomingEvents, recentCotisations, membersWithoutRecentCotisation, charts } = dashboardData;

  return (
    <Layout title="Tableau de bord">
      <div className="space-y-8">
        {/* En-tête du tableau de bord */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">📊 Tableau de Bord</h1>
              <p className="text-blue-100 text-lg">Vue d'ensemble de votre organisation</p>
            </div>
            <div className="text-right">
              <p className="text-blue-100 text-sm">Dernière mise à jour</p>
              <p className="font-semibold">{new Date().toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
            </div>
          </div>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Membres"
            value={summary.totalMembers}
            description="Membres actifs"
            icon={Users}
            color="blue"
          />
          <StatCard
            title="Solde en Caisse"
            value={formatCurrency(summary.soldeTotal)}
            description="Montant disponible"
            icon={CreditCard}
            color={summary.soldeTotal >= 0 ? 'green' : 'red'}
          />
          <StatCard
            title="Cotisations ce mois"
            value={formatCurrency(summary.cotisationsThisMonth.montant)}
            description={`${summary.cotisationsThisMonth.count} paiements`}
            icon={TrendingUp}
            color="green"
          />
          <StatCard
            title="Dépenses ce mois"
            value={formatCurrency(summary.expensesThisMonth.montant)}
            description={`${summary.expensesThisMonth.count} dépenses`}
            icon={Receipt}
            color="yellow"
          />
        </div>

        {/* Graphiques et analyses */}
        <Card className="bg-gradient-to-br from-white to-blue-50 border-2 border-blue-200 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b-2 border-blue-200">
            <CardTitle className="flex items-center space-x-3 text-blue-900">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold">📈 Analyses Financières</span>
            </CardTitle>
            <CardDescription className="text-gray-600 text-lg">
              Visualisation des tendances et répartitions financières
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs defaultValue="trends" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-blue-100 to-purple-100 p-1 rounded-xl">
                <TabsTrigger 
                  value="trends" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg font-semibold"
                >
                  📊 Tendances mensuelles
                </TabsTrigger>
                <TabsTrigger 
                  value="expenses" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg font-semibold"
                >
                  🥧 Répartition des dépenses
                </TabsTrigger>
              </TabsList>
              <TabsContent value="trends" className="mt-8">
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">📈 Évolution des Finances</h3>
                    <p className="text-gray-600 text-lg">
                      Comparaison des cotisations et dépenses sur les 6 derniers mois
                    </p>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-100">
                    <MonthlyTrendChart data={charts?.monthlyTrend} />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="expenses" className="mt-8">
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">🥧 Répartition des Dépenses</h3>
                    <p className="text-gray-600 text-lg">
                      Distribution des dépenses par catégorie
                    </p>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-100">
                    <ExpensesPieChart data={charts?.expensesByType} />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Événements à venir */}
          <Card className="bg-gradient-to-br from-white to-green-50 border-2 border-green-200 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b-2 border-green-200">
              <CardTitle className="flex items-center space-x-3 text-green-900">
                <div className="p-2 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">📅 Événements à Venir</span>
              </CardTitle>
              <CardDescription className="text-gray-600">
                Prochains événements programmés
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {upcomingEvents.length > 0 ? (
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border-2 border-green-100 hover:shadow-md transition-all duration-200">
                      <div>
                        <p className="font-bold text-gray-900 text-lg">{event.titre}</p>
                        <p className="text-sm text-gray-600 font-medium">📍 {event.lieu}</p>
                        <p className="text-sm text-gray-500">
                          📅 {formatDate(event.dateDebut)} - 👥 {event._count.participants} participants
                        </p>
                      </div>
                      <Badge className="bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold px-3 py-1">
                        {formatCurrency(event.montantContribution)}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">📅</div>
                  <p className="text-gray-500 text-lg font-medium">
                    Aucun événement programmé
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cotisations récentes */}
          <Card className="bg-gradient-to-br from-white to-purple-50 border-2 border-purple-200 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b-2 border-purple-200">
              <CardTitle className="flex items-center space-x-3 text-purple-900">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">💰 Cotisations Récentes</span>
              </CardTitle>
              <CardDescription className="text-gray-600">
                Derniers paiements reçus
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {recentCotisations.length > 0 ? (
                <div className="space-y-4">
                  {recentCotisations.map((cotisation) => (
                    <div key={cotisation.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-100 hover:shadow-md transition-all duration-200">
                      <div>
                        <p className="font-bold text-gray-900 text-lg">
                          {formatFullName(cotisation.member.prenom, cotisation.member.nom)}
                        </p>
                        <p className="text-sm text-gray-600 font-medium">
                          #{cotisation.member.numeroAdhesion}
                        </p>
                        <p className="text-sm text-gray-500">
                          📅 {formatDate(cotisation.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600 text-lg">
                          {formatCurrency(cotisation.montant)}
                        </p>
                        <Badge 
                          className={cotisation.statut === 'PAYE' 
                            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white font-bold' 
                            : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold'
                          }
                        >
                          {cotisation.statut === 'PAYE' ? '✅ Payé' : '⏳ En attente'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">💰</div>
                  <p className="text-gray-500 text-lg font-medium">
                    Aucune cotisation récente
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Membres sans cotisation récente */}
        {membersWithoutRecentCotisation.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span>Membres sans cotisation récente</span>
              </CardTitle>
              <CardDescription>
                Membres n'ayant pas cotisé depuis plus de 2 semaines
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {membersWithoutRecentCotisation.map((member) => (
                  <div key={member.id} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="font-medium text-gray-900">
                      {formatFullName(member.prenom, member.nom)}
                    </p>
                    <p className="text-sm text-gray-600">{member.numeroAdhesion}</p>
                    <p className="text-sm text-gray-500">{member.telephone}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;

