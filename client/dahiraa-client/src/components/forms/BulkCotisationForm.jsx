import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cotisationService } from '../../services/api';
import { formatFullName } from '../../utils/format';

const BulkCotisationForm = ({ isOpen, onClose, onSuccess, members = [] }) => {
  const [formData, setFormData] = useState({
    semaine: '',
    montantDefaut: 250,
    statutDefaut: 'PAYE'
  });
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [memberCotisations, setMemberCotisations] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Réinitialiser le formulaire quand il s'ouvre
  useEffect(() => {
    if (isOpen) {
      setFormData({
        semaine: '',
        montantDefaut: 250,
        statutDefaut: 'PAYE'
      });
      setSelectedMembers([]);
      setMemberCotisations({});
      setError('');
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMemberToggle = (memberId) => {
    setSelectedMembers(prev => {
      if (prev.includes(memberId)) {
        const newSelected = prev.filter(id => id !== memberId);
        // Supprimer les cotisations pour ce membre
        setMemberCotisations(prevCotisations => {
          const newCotisations = { ...prevCotisations };
          delete newCotisations[memberId];
          return newCotisations;
        });
        return newSelected;
      } else {
        const newSelected = [...prev, memberId];
        // Ajouter une cotisation par défaut pour ce membre
        setMemberCotisations(prevCotisations => ({
          ...prevCotisations,
          [memberId]: {
            montant: formData.montantDefaut,
            statut: formData.statutDefaut
          }
        }));
        return newSelected;
      }
    });
  };

  const handleMemberCotisationChange = (memberId, field, value) => {
    setMemberCotisations(prev => ({
      ...prev,
      [memberId]: {
        ...prev[memberId],
        [field]: value
      }
    }));
  };

  const handleSelectAll = () => {
    if (selectedMembers.length === members.length) {
      // Désélectionner tous
      setSelectedMembers([]);
      setMemberCotisations({});
    } else {
      // Sélectionner tous
      const allMemberIds = members.map(member => member.id);
      setSelectedMembers(allMemberIds);
      const defaultCotisations = {};
      allMemberIds.forEach(memberId => {
        defaultCotisations[memberId] = {
          montant: formData.montantDefaut,
          statut: formData.statutDefaut
        };
      });
      setMemberCotisations(defaultCotisations);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const cotisations = selectedMembers.map(memberId => ({
        memberId,
        montant: memberCotisations[memberId]?.montant || formData.montantDefaut,
        statut: memberCotisations[memberId]?.statut || formData.statutDefaut
      }));

      const bulkData = {
        semaine: formData.semaine,
        cotisations
      };

      await cotisationService.bulkCreateCotisations(bulkData);
      
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (prenom, nom) => {
    return `${prenom?.charAt(0) || ''}${nom?.charAt(0) || ''}`.toUpperCase();
  };

  const totalMontant = selectedMembers.reduce((total, memberId) => {
    return total + (memberCotisations[memberId]?.montant || formData.montantDefaut);
  }, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-4xl lg:max-w-5xl max-h-[95vh] overflow-y-auto bg-white p-4 sm:p-6">
        <DialogHeader className="text-center pb-4">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <span className="text-2xl sm:text-3xl">📊</span>
            Enregistrement en Lot
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base text-gray-600">
            Enregistrez les cotisations pour plusieurs membres en une fois
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {error && (
            <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 text-center">{error}</p>
            </div>
          )}

          {/* Configuration générale */}
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 shadow-lg">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-base sm:text-lg font-bold text-blue-900 flex items-center gap-2">
                <span className="text-lg sm:text-xl">⚙️</span>
                Configuration Générale
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                <div className="space-y-2 sm:space-y-3">
                  <Label htmlFor="semaine" className="text-sm font-semibold text-gray-700">📅 Semaine *</Label>
                  <Input
                    id="semaine"
                    name="semaine"
                    type="date"
                    value={formData.semaine}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="h-10 sm:h-12 border-2 border-blue-200 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
                  />
                  <p className="text-xs text-gray-600">
                    Sélectionnez le jeudi de la semaine
                  </p>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <Label htmlFor="montantDefaut" className="text-sm font-semibold text-gray-700">💰 Montant par défaut (FCFA)</Label>
                  <Input
                    id="montantDefaut"
                    name="montantDefaut"
                    type="number"
                    min="0"
                    step="50"
                    value={formData.montantDefaut}
                    onChange={handleChange}
                    disabled={loading}
                    className="h-10 sm:h-12 border-2 border-blue-200 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
                  />
                  <p className="text-xs text-gray-600">
                    Montant standard par membre
                  </p>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <Label htmlFor="statutDefaut" className="text-sm font-semibold text-gray-700">📋 Statut par défaut</Label>
                  <Select 
                    value={formData.statutDefaut} 
                    onValueChange={(value) => handleSelectChange('statutDefaut', value)}
                    disabled={loading}
                  >
                    <SelectTrigger className="h-10 sm:h-12 border-2 border-blue-200 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PAYE">✅ Payé</SelectItem>
                      <SelectItem value="EN_ATTENTE">⏳ En attente</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-600">
                    Statut par défaut pour tous
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sélection des membres */}
          <Card className="bg-gradient-to-br from-green-50 to-blue-50 border border-green-200 shadow-lg">
            <CardHeader className="pb-2 sm:pb-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <CardTitle className="text-base sm:text-lg font-bold text-green-900 flex items-center gap-2">
                  <span className="text-lg sm:text-xl">👥</span>
                  Sélection des Membres
                </CardTitle>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    disabled={loading}
                    className="w-full sm:w-auto h-10 bg-gradient-to-r from-green-100 to-blue-100 border-2 border-green-300 hover:from-green-200 hover:to-blue-200 text-sm"
                  >
                    {selectedMembers.length === members.length ? '❌ Désélectionner tout' : '✅ Sélectionner tout'}
                  </Button>
                  <Badge className="bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold px-3 py-2 text-center text-sm">
                    {selectedMembers.length} membre{selectedMembers.length > 1 ? 's' : ''} sélectionné{selectedMembers.length > 1 ? 's' : ''}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-3 sm:p-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 max-h-64 sm:max-h-96 overflow-y-auto">
                {members.map((member) => {
                  const isSelected = selectedMembers.includes(member.id);
                  const cotisation = memberCotisations[member.id];

                  return (
                    <Card key={member.id} className={`${isSelected ? 'ring-2 ring-green-500 bg-gradient-to-br from-green-50 to-blue-50' : 'bg-white'} border ${isSelected ? 'border-green-300' : 'border-gray-200'} shadow-lg hover:shadow-xl transition-all duration-200`}>
                      <CardHeader className="pb-2 sm:pb-3">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleMemberToggle(member.id)}
                            disabled={loading}
                            className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                          />
                          <Avatar className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-gray-200">
                            <AvatarImage 
                              src={member.photoProfile ? `http://localhost:3001${member.photoProfile}` : undefined} 
                            />
                            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white font-bold text-xs sm:text-sm">
                              {getInitials(member.prenom, member.nom)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <CardTitle className="text-sm font-bold text-gray-900 truncate">
                              {formatFullName(member.prenom, member.nom)}
                            </CardTitle>
                            <p className="text-xs text-gray-500 font-medium">#{member.numeroAdhesion}</p>
                          </div>
                        </div>
                      </CardHeader>
                      
                      {isSelected && (
                        <CardContent className="pt-0 p-3 sm:p-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                            <div className="space-y-1 sm:space-y-2">
                              <Label className="text-xs font-semibold text-gray-700">💰 Montant</Label>
                              <Input
                                type="number"
                                min="0"
                                step="50"
                                value={cotisation?.montant || formData.montantDefaut}
                                onChange={(e) => handleMemberCotisationChange(member.id, 'montant', parseFloat(e.target.value))}
                                className="h-9 sm:h-10 text-sm border-2 border-green-200 focus:border-green-500 focus:ring-green-500"
                                disabled={loading}
                              />
                            </div>
                            <div className="space-y-1 sm:space-y-2">
                              <Label className="text-xs font-semibold text-gray-700">📋 Statut</Label>
                              <Select 
                                value={cotisation?.statut || formData.statutDefaut}
                                onValueChange={(value) => handleMemberCotisationChange(member.id, 'statut', value)}
                                disabled={loading}
                              >
                                <SelectTrigger className="h-9 sm:h-10 text-sm border-2 border-green-200 focus:border-green-500 focus:ring-green-500">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="PAYE">✅ Payé</SelectItem>
                                  <SelectItem value="EN_ATTENTE">⏳ En attente</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Résumé */}
          {selectedMembers.length > 0 && (
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-300 shadow-lg">
              <CardContent className="p-3 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1 sm:space-y-2">
                    <p className="font-bold text-green-900 text-base sm:text-lg">
                      📊 Résumé : {selectedMembers.length} cotisation{selectedMembers.length > 1 ? 's' : ''} à enregistrer
                    </p>
                    <p className="text-base sm:text-lg font-semibold text-green-700">
                      💰 Montant total : {totalMontant.toLocaleString()} FCFA
                    </p>
                  </div>
                  <Badge className="bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold px-3 sm:px-4 py-2 text-sm text-center">
                    {formData.semaine ? `📅 Semaine du ${new Date(formData.semaine).toLocaleDateString('fr-FR')}` : '📅 Semaine non définie'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          <DialogFooter className="pt-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              disabled={loading}
              className="w-full sm:w-auto h-10 sm:h-12 border-2 border-gray-300 hover:border-gray-400 px-4 sm:px-6 text-sm sm:text-base"
            >
              ❌ Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={loading || selectedMembers.length === 0 || !formData.semaine}
              className="w-full sm:w-auto h-10 sm:h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold px-4 sm:px-6 shadow-lg text-sm sm:text-base"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>⏳ Enregistrement...</span>
                </div>
              ) : (
                <span>✅ Enregistrer {selectedMembers.length} cotisation{selectedMembers.length > 1 ? 's' : ''}</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BulkCotisationForm; 