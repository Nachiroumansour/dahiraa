import React, { useState, useMemo, useEffect, useRef } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, DollarSign, Gift, Edit, Plus, Search, User, Hash, FileText } from 'lucide-react';
import { cotisationService } from '../../services/api';

const CotisationForm = ({ isOpen, onClose, onSuccess, cotisation = null, members = [] }) => {
  const [formData, setFormData] = useState({
    memberId: cotisation?.memberId || '',
    montant: cotisation?.montant || '',
    semaine: cotisation?.semaine ? cotisation.semaine.split('T')[0] : '',
    statut: cotisation?.statut || 'PAYE',
    type: cotisation?.type || 'HEBDOMADAIRE',
    evenementType: cotisation?.evenementType || '',
    description: cotisation?.description || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          searchRef.current && !searchRef.current.contains(event.target)) {
        setShowMemberDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Initialiser les données quand le modal s'ouvre
  useEffect(() => {
    if (isOpen && cotisation) {
      setFormData({
        memberId: cotisation.memberId || cotisation.member?.id || '',
        montant: cotisation.montant || '',
        semaine: cotisation.semaine ? cotisation.semaine.split('T')[0] : '',
        statut: cotisation.statut || 'PAYE',
        type: cotisation.type || 'HEBDOMADAIRE',
        evenementType: cotisation.evenementType || '',
        description: cotisation.description || ''
      });
    } else if (isOpen && !cotisation) {
      // Réinitialiser pour une nouvelle cotisation
      setFormData({
        memberId: '',
        montant: '',
        semaine: '',
        statut: 'PAYE',
        type: 'HEBDOMADAIRE',
        evenementType: '',
        description: ''
      });
    }
  }, [isOpen, cotisation]);

  // Filtrer les membres basé sur la recherche
  const filteredMembers = useMemo(() => {
    if (!memberSearchTerm) return members.slice(0, 10); // Afficher seulement les 10 premiers si pas de recherche
    
    const searchLower = memberSearchTerm.toLowerCase();
    return members.filter(member => 
      member.prenom?.toLowerCase().includes(searchLower) ||
      member.nom?.toLowerCase().includes(searchLower) ||
      member.numeroAdhesion?.toLowerCase().includes(searchLower) ||
      member.telephone?.includes(searchLower)
    ).slice(0, 15); // Limiter à 15 résultats
  }, [members, memberSearchTerm]);

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

  const handleMemberSelect = (memberId) => {
    setFormData(prev => ({
      ...prev,
      memberId
    }));
    setMemberSearchTerm('');
    setShowMemberDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (cotisation) {
        // Mise à jour
        await cotisationService.updateCotisation(cotisation.id, formData);
      } else {
        // Création
        await cotisationService.createCotisation(formData);
      }
      
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedMember = () => {
    return members.find(m => m.id === formData.memberId);
  };

  const isEditMode = !!cotisation;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[95vh] overflow-y-auto bg-white p-4 sm:p-6">
        <DialogHeader className="text-center pb-4">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
            {isEditMode ? (
              <>
                <Edit className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                Modifier la cotisation
              </>
            ) : (
              <>
                <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                + Nouvelle cotisation
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base text-gray-600">
            {isEditMode ? 'Modifiez les informations de la cotisation' : 'Enregistrez une nouvelle cotisation pour un membre'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Type de cotisation */}
          <div className="space-y-2 sm:space-y-3">
            <Label htmlFor="type" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Gift className="h-4 w-4 text-purple-600" />
              Type de cotisation *
            </Label>
            <Select 
              value={formData.type} 
              onValueChange={(value) => handleSelectChange('type', value)}
              disabled={loading}
            >
              <SelectTrigger className="h-10 sm:h-12 border-2 border-purple-200 focus:border-purple-400 bg-white text-sm sm:text-base">
                <SelectValue placeholder="Sélectionner le type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HEBDOMADAIRE">
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600">📅</span>
                    <span>HEBDOMADAIRE - 250 FCFA</span>
                  </div>
                </SelectItem>
                <SelectItem value="EVENEMENT">
                  <div className="flex items-center space-x-2">
                    <span className="text-purple-600">🎉</span>
                    <span>ÉVÉNEMENT - Montant variable</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Type d'événement (conditionnel) */}
          {formData.type === 'EVENEMENT' && (
            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="evenementType" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Gift className="h-4 w-4 text-indigo-600" />
                Type d'événement
              </Label>
              <Select 
                value={formData.evenementType} 
                onValueChange={(value) => handleSelectChange('evenementType', value)}
                disabled={loading}
              >
                <SelectTrigger className="h-10 sm:h-12 border-2 border-indigo-200 focus:border-indigo-400 bg-white text-sm sm:text-base">
                  <SelectValue placeholder="Sélectionner l'événement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MARIAGE">💒 Mariage</SelectItem>
                  <SelectItem value="BAPTEME">👶 Baptême</SelectItem>
                  <SelectItem value="FUNERAILLE">⚰️ Funérailles</SelectItem>
                  <SelectItem value="NAISSANCE">🎉 Naissance</SelectItem>
                  <SelectItem value="RETRAITE">🎊 Retraite</SelectItem>
                  <SelectItem value="VOYAGE">✈️ Voyage</SelectItem>
                  <SelectItem value="PROJET">🏗️ Projet communautaire</SelectItem>
                  <SelectItem value="AUTRE">🎯 Autre événement</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Description (pour les événements) */}
          {formData.type === 'EVENEMENT' && (
            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="description" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-600" />
                Description de l'événement
              </Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Décrivez l'événement (optionnel)..."
                rows="2"
                className="w-full p-2 sm:p-3 border-2 border-indigo-200 focus:border-indigo-400 bg-white rounded-lg resize-none text-sm sm:text-base"
                disabled={loading}
              />
              <p className="text-xs text-indigo-600">
                💡 Ex: "Mariage de Fatou et Mamadou - 15 août 2025"
              </p>
            </div>
          )}

          {/* Membre avec recherche intelligente */}
          <div className="space-y-2 sm:space-y-3">
            <Label htmlFor="memberSearch" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              Membre *
            </Label>
            
            <div className="relative" ref={dropdownRef}>
              {/* Affichage du membre sélectionné */}
              {formData.memberId && getSelectedMember() ? (
                <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-xs sm:text-sm font-bold text-white">
                          {getSelectedMember().prenom?.charAt(0)}{getSelectedMember().nom?.charAt(0)}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                          {getSelectedMember().prenom} {getSelectedMember().nom}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Hash className="h-3 w-3" />
                          {getSelectedMember().numeroAdhesion}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, memberId: '' }));
                        setMemberSearchTerm('');
                      }}
                      className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                    >
                      ✕
                    </Button>
                  </div>
                </div>
              ) : (
                /* Champ de recherche */
                <div className="relative" ref={searchRef}>
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="memberSearch"
                    type="text"
                    placeholder="Rechercher par nom, numéro, téléphone..."
                    value={memberSearchTerm}
                    onChange={(e) => {
                      setMemberSearchTerm(e.target.value);
                      setShowMemberDropdown(true);
                    }}
                    onFocus={() => setShowMemberDropdown(true)}
                    className="pl-10 h-10 sm:h-12 border-2 border-blue-200 focus:border-blue-400 bg-white text-sm sm:text-base"
                    disabled={loading}
                  />
                </div>
              )}

              {/* Dropdown des résultats */}
              {showMemberDropdown && memberSearchTerm && (
                <div className="absolute z-50 w-full mt-1 bg-white border-2 border-blue-200 rounded-lg shadow-xl max-h-48 sm:max-h-60 overflow-y-auto">
                  {filteredMembers.length > 0 ? (
                    filteredMembers.map((member) => (
                      <div
                        key={member.id}
                        onClick={() => handleMemberSelect(member.id)}
                        className="p-2 sm:p-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-all duration-200"
                      >
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-white">
                              {member.prenom?.charAt(0)}{member.nom?.charAt(0)}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 text-sm truncate">
                              {member.prenom} {member.nom}
                            </p>
                            <div className="flex items-center gap-2 sm:gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Hash className="h-3 w-3" />
                                {member.numeroAdhesion}
                              </span>
                              {member.telephone && (
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {member.telephone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 sm:p-4 text-center text-gray-500">
                      <User className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">Aucun membre trouvé</p>
                      <p className="text-xs">Essayez avec un autre terme de recherche</p>
                    </div>
                  )}
                </div>
              )}

              {/* Statistiques de recherche */}
              {memberSearchTerm && (
                <div className="mt-1 text-xs text-gray-500">
                  {filteredMembers.length > 0 ? (
                    <span className="text-green-600">
                      ✅ {filteredMembers.length} membre(s) trouvé(s)
                    </span>
                  ) : (
                    <span className="text-red-600">
                      ❌ Aucun résultat pour "{memberSearchTerm}"
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Conseils de recherche - plus compact */}
            {!formData.memberId && (
              <div className="p-2 sm:p-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800 font-medium mb-1">
                  💡 Conseils de recherche :
                </p>
                <div className="text-xs text-yellow-700 space-y-0.5">
                  <p>• Tapez le prénom ou nom du membre</p>
                  <p>• Utilisez le numéro d'adhésion (ex: DH001)</p>
                  <p>• Entrez le numéro de téléphone</p>
                </div>
              </div>
            )}
          </div>

          {/* Montant */}
          <div className="space-y-2 sm:space-y-3">
            <Label htmlFor="montant" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              Montant (FCFA) *
            </Label>
            <Input
              id="montant"
              name="montant"
              type="number"
              min="0"
              step="50"
              value={formData.montant}
              onChange={handleChange}
              placeholder={formData.type === 'HEBDOMADAIRE' ? '250' : '5000'}
              required
              disabled={loading}
              className="h-10 sm:h-12 border-2 border-green-200 focus:border-green-400 bg-white text-sm sm:text-base"
            />
            {formData.type === 'HEBDOMADAIRE' && (
              <div className="p-2 sm:p-3 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
                <p className="text-xs text-green-700 font-medium">
                  💡 Montant standard : 250 FCFA pour la cotisation hebdomadaire
                </p>
                <p className="text-xs text-green-600 mt-1">
                  • Montant fixe pour tous les jeudis
                </p>
              </div>
            )}
            {formData.type === 'EVENEMENT' && (
              <div className="p-2 sm:p-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
                <p className="text-xs text-purple-700 font-medium">
                  🎉 Montant variable pour les événements
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  • Mariages, baptêmes, funérailles, etc.
                </p>
              </div>
            )}
          </div>

          {/* Semaine */}
          <div className="space-y-2 sm:space-y-3">
            <Label htmlFor="semaine" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-orange-600" />
              Semaine *
            </Label>
            <Input
              id="semaine"
              name="semaine"
              type="date"
              value={formData.semaine}
              onChange={handleChange}
              required
              disabled={loading}
              className="h-10 sm:h-12 border-2 border-orange-200 focus:border-orange-400 bg-white text-sm sm:text-base"
            />
            <p className="text-xs text-orange-600 font-medium">
              📅 Sélectionnez le jeudi de la semaine de cotisation
            </p>
          </div>

          {/* Statut */}
          <div className="space-y-2 sm:space-y-3">
            <Label htmlFor="statut" className="text-sm font-semibold text-gray-700">
              Statut
            </Label>
            <Select 
              value={formData.statut} 
              onValueChange={(value) => handleSelectChange('statut', value)}
              disabled={loading}
            >
              <SelectTrigger className="h-10 sm:h-12 border-2 border-gray-200 focus:border-gray-400 bg-white text-sm sm:text-base">
                <SelectValue placeholder="Sélectionner le statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PAYE">
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    ✅ Payé
                  </Badge>
                </SelectItem>
                <SelectItem value="EN_ATTENTE">
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    ⏳ En attente
                  </Badge>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              disabled={loading}
              className="w-full sm:w-auto h-10 sm:h-12 border-2 border-gray-300 hover:border-gray-400 bg-white text-gray-700 text-sm sm:text-base"
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.memberId}
              className="w-full sm:w-auto h-10 sm:h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-4 sm:px-6 rounded-lg shadow-lg disabled:opacity-50 text-sm sm:text-base"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{isEditMode ? 'Modification...' : 'Création...'}</span>
                </div>
              ) : (
                <span>{isEditMode ? 'Modifier' : 'Créer'}</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CotisationForm; 