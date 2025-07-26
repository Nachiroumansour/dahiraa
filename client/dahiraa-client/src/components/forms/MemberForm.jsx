import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, User, Phone, Mail, MapPin, Briefcase, Heart, Users, BookOpen, Shield, UserCheck, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { memberService } from '../../services/api';
import { formatDate } from '../../utils/format';

const MemberForm = ({ isOpen, onClose, onSuccess, member = null }) => {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // 1- Informations de l'adhérent
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
    adresse: '',
    adresseComplement: '',
    profession: '',
    genre: '',
    dateNaissance: '',
    
    // 2- Autres informations
    situationMatrimoniale: '',
    dateAdhesion: '',
    decouverteDahira: '',
    commission: '',
    niveauArabe: '',
    categorie: '',
    
    // 3- Informations médicales
    antecedentsMedicaux: '',
    allergies: '',
    traitements: '',
    contactUrgenceTel: '',
    
    // 4- Informations du parent ou tuteur
    typeAutorite: '',
    contactUrgenceNom: '',
    contactUrgencePrenom: '',
    contactUrgenceTelephone: '',
    
    // Informations existantes
    numeroAdhesion: '',
    photoProfile: null
  });

  const [numeroAdhesion, setNumeroAdhesion] = useState('');

  const steps = [
    {
      id: 1,
      title: "Informations personnelles",
      icon: User,
      description: "Nom, prénom, contact, adresse"
    },
    {
      id: 2,
      title: "Informations d'adhésion",
      icon: Users,
      description: "Commission, niveau arabe, découverte"
    },
    {
      id: 3,
      title: "Informations médicales",
      icon: Heart,
      description: "Antécédents, allergies, traitements"
    },
    {
      id: 4,
      title: "Contact d'urgence",
      icon: Shield,
      description: "Personne à contacter en cas d'urgence"
    }
  ];

  useEffect(() => {
    if (member) {
      setFormData({
        nom: member.nom || '',
        prenom: member.prenom || '',
        telephone: member.telephone || '',
        email: member.email || '',
        adresse: member.adresse || '',
        adresseComplement: member.adresseComplement || '',
        profession: member.profession || '',
        genre: member.genre || '',
        dateNaissance: member.dateNaissance ? formatDate(member.dateNaissance, 'yyyy-MM-dd') : '',
        situationMatrimoniale: member.situationMatrimoniale || '',
        dateAdhesion: member.dateAdhesion ? formatDate(member.dateAdhesion, 'yyyy-MM-dd') : '',
        decouverteDahira: member.decouverteDahira || '',
        commission: member.commission || '',
        niveauArabe: member.niveauArabe || '',
        categorie: member.categorie || '',
        antecedentsMedicaux: member.antecedentsMedicaux || '',
        allergies: member.allergies || '',
        traitements: member.traitements || '',
        contactUrgenceTel: member.contactUrgenceTel || '',
        typeAutorite: member.typeAutorite || '',
        contactUrgenceNom: member.contactUrgenceNom || '',
        contactUrgencePrenom: member.contactUrgencePrenom || '',
        contactUrgenceTelephone: member.contactUrgenceTelephone || '',
        numeroAdhesion: member.numeroAdhesion || '',
        photoProfile: member.photoProfile
      });
      setNumeroAdhesion(member.numeroAdhesion || '');
    } else {
      // Générer un nouveau numéro d'adhésion
      generateNumeroAdhesion();
    }
  }, [member]);

  const generateNumeroAdhesion = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const newNumero = `DAH${year}${random}`;
    setNumeroAdhesion(newNumero);
    setFormData(prev => ({ ...prev, numeroAdhesion: newNumero }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = (step) => {
    switch (step) {
      case 1:
        return formData.nom && formData.prenom && formData.telephone && formData.genre && formData.dateNaissance;
      case 2:
        return formData.dateAdhesion && formData.commission && formData.niveauArabe && formData.categorie;
      case 3:
        return true; // Optionnel
      case 4:
        return formData.contactUrgenceNom && formData.contactUrgenceTelephone;
      default:
        return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isStepValid(currentStep)) {
      return;
    }

    if (currentStep < steps.length) {
      nextStep();
      return;
    }

    // Soumission finale
    setLoading(true);
    try {
      const submitData = {
        ...formData,
        dateAdhesion: formData.dateAdhesion || new Date().toISOString().split('T')[0]
      };

      if (member) {
        await memberService.updateMember(member.id, submitData);
      } else {
        await memberService.createMember(submitData);
      }

      onSuccess();
      onClose();
      setCurrentStep(1);
      setFormData({
        nom: '', prenom: '', telephone: '', email: '', adresse: '', adresseComplement: '',
        profession: '', genre: '', dateNaissance: '', situationMatrimoniale: '', dateAdhesion: '',
        decouverteDahira: '', commission: '', niveauArabe: '', categorie: '', antecedentsMedicaux: '',
        allergies: '', traitements: '', contactUrgenceTel: '', typeAutorite: '',
        contactUrgenceNom: '', contactUrgencePrenom: '', contactUrgenceTelephone: '',
        numeroAdhesion: '', photoProfile: null
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="w-full max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Informations personnelles</h2>
              <p className="text-gray-600">Renseignez vos informations de base</p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nom" className="text-sm font-medium text-gray-700 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    Nom *
                  </Label>
                  <div className="relative">
                    <Input
                      id="nom"
                      name="nom"
                      value={formData.nom}
                      onChange={handleChange}
                      required
                      className="h-14 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 pl-4 text-lg"
                      placeholder="Entrez le nom"
                    />
                    <User className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prenom" className="text-sm font-medium text-gray-700 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    Prénom *
                  </Label>
                  <div className="relative">
                    <Input
                      id="prenom"
                      name="prenom"
                      value={formData.prenom}
                      onChange={handleChange}
                      required
                      className="h-14 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 pl-4 text-lg"
                      placeholder="Entrez le prénom"
                    />
                    <User className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telephone" className="text-sm font-medium text-gray-700 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    N° de TEL personnel *
                  </Label>
                  <div className="relative">
                    <Input
                      id="telephone"
                      name="telephone"
                      value={formData.telephone}
                      onChange={handleChange}
                      required
                      className="h-14 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 pl-4 text-lg"
                      placeholder="Ex: 776519860"
                    />
                    <Phone className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center">
                    <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                    E-mail
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="h-14 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 pl-4 text-lg"
                      placeholder="exemple@email.com"
                    />
                    <Mail className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adresse" className="text-sm font-medium text-gray-700 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    Adresse *
                  </Label>
                  <div className="relative">
                    <Input
                      id="adresse"
                      name="adresse"
                      value={formData.adresse}
                      onChange={handleChange}
                      required
                      className="h-14 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 pl-4 text-lg"
                      placeholder="Adresse complète"
                    />
                    <MapPin className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adresseComplement" className="text-sm font-medium text-gray-700 flex items-center">
                    <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                    Complément d'adresse
                  </Label>
                  <div className="relative">
                    <Input
                      id="adresseComplement"
                      name="adresseComplement"
                      value={formData.adresseComplement}
                      onChange={handleChange}
                      placeholder="Villa N°78, etc."
                      className="h-14 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 pl-4 text-lg"
                    />
                    <MapPin className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profession" className="text-sm font-medium text-gray-700 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    Profession *
                  </Label>
                  <div className="relative">
                    <Input
                      id="profession"
                      name="profession"
                      value={formData.profession}
                      onChange={handleChange}
                      required
                      className="h-14 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 pl-4 text-lg"
                      placeholder="Ex: Enseignant, Médecin..."
                    />
                    <Briefcase className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="genre" className="text-sm font-medium text-gray-700 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    Genre *
                  </Label>
                  <Select value={formData.genre} onValueChange={(value) => handleSelectChange('genre', value)} required>
                    <SelectTrigger className="h-14 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-lg">
                      <SelectValue placeholder="Sélectionner le genre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HOMME">Homme</SelectItem>
                      <SelectItem value="FEMME">Femme</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateNaissance" className="text-sm font-medium text-gray-700 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    Date de naissance *
                  </Label>
                  <div className="relative">
                    <Input
                      id="dateNaissance"
                      name="dateNaissance"
                      type="date"
                      value={formData.dateNaissance}
                      onChange={handleChange}
                      required
                      className="h-14 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 pl-4 text-lg"
                    />
                    <Calendar className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="w-full max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Informations d'adhésion</h2>
              <p className="text-gray-600">Renseignez vos informations de membre</p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="situationMatrimoniale" className="text-sm font-medium text-gray-700 flex items-center">
                    <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                    Situation matrimoniale
                  </Label>
                  <div className="relative">
                    <Input
                      id="situationMatrimoniale"
                      name="situationMatrimoniale"
                      value={formData.situationMatrimoniale}
                      onChange={handleChange}
                      placeholder="Célibataire, Marié, etc."
                      className="h-14 border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 pl-4 text-lg"
                    />
                    <Heart className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateAdhesion" className="text-sm font-medium text-gray-700 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    Date d'adhésion *
                  </Label>
                  <div className="relative">
                    <Input
                      id="dateAdhesion"
                      name="dateAdhesion"
                      type="date"
                      value={formData.dateAdhesion}
                      onChange={handleChange}
                      required
                      className="h-14 border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 pl-4 text-lg"
                    />
                    <Calendar className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="commission" className="text-sm font-medium text-gray-700 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    Commission ou sous-commission *
                  </Label>
                  <div className="relative">
                    <Input
                      id="commission"
                      name="commission"
                      value={formData.commission}
                      onChange={handleChange}
                      placeholder="Secrétaire General et Pr Communication"
                      required
                      className="h-14 border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 pl-4 text-lg"
                    />
                    <Users className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-medium text-gray-700 flex items-center">
                  <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                  Comment avez-vous découvert la dàhira ?
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-purple-300 transition-colors">
                    <Checkbox
                      id="decouverteMembre"
                      checked={formData.decouverteDahira === 'Via un membre'}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleSelectChange('decouverteDahira', 'Via un membre');
                        } else {
                          handleSelectChange('decouverteDahira', '');
                        }
                      }}
                      className="text-purple-600"
                    />
                    <Label htmlFor="decouverteMembre" className="text-lg font-medium cursor-pointer">Via un membre</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-purple-300 transition-colors">
                    <Checkbox
                      id="decouverteTIC"
                      checked={formData.decouverteDahira === 'À travers les TIC'}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleSelectChange('decouverteDahira', 'À travers les TIC');
                        } else {
                          handleSelectChange('decouverteDahira', '');
                        }
                      }}
                      className="text-purple-600"
                    />
                    <Label htmlFor="decouverteTIC" className="text-lg font-medium cursor-pointer">À travers les TIC</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-medium text-gray-700 flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  Catégorie *
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-purple-300 transition-colors">
                    <Checkbox
                      id="categorieA"
                      checked={formData.categorie === 'A'}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleSelectChange('categorie', 'A');
                        } else {
                          handleSelectChange('categorie', '');
                        }
                      }}
                      className="text-purple-600"
                    />
                    <Label htmlFor="categorieA" className="text-lg font-medium cursor-pointer">A</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-purple-300 transition-colors">
                    <Checkbox
                      id="categorieB"
                      checked={formData.categorie === 'B'}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleSelectChange('categorie', 'B');
                        } else {
                          handleSelectChange('categorie', '');
                        }
                      }}
                      className="text-purple-600"
                    />
                    <Label htmlFor="categorieB" className="text-lg font-medium cursor-pointer">B</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-medium text-gray-700 flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  Niveau de lecture en Arabe *
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-purple-300 transition-colors">
                    <Checkbox
                      id="niveauDebutant"
                      checked={formData.niveauArabe === 'DEBUTANT'}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleSelectChange('niveauArabe', 'DEBUTANT');
                        } else {
                          handleSelectChange('niveauArabe', '');
                        }
                      }}
                      className="text-purple-600"
                    />
                    <Label htmlFor="niveauDebutant" className="text-lg font-medium cursor-pointer">Débutant</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-purple-300 transition-colors">
                    <Checkbox
                      id="niveauMoyen"
                      checked={formData.niveauArabe === 'MOYEN'}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleSelectChange('niveauArabe', 'MOYEN');
                        } else {
                          handleSelectChange('niveauArabe', '');
                        }
                      }}
                      className="text-purple-600"
                    />
                    <Label htmlFor="niveauMoyen" className="text-lg font-medium cursor-pointer">Moyen</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-purple-300 transition-colors">
                    <Checkbox
                      id="niveauBon"
                      checked={formData.niveauArabe === 'BON'}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleSelectChange('niveauArabe', 'BON');
                        } else {
                          handleSelectChange('niveauArabe', '');
                        }
                      }}
                      className="text-purple-600"
                    />
                    <Label htmlFor="niveauBon" className="text-lg font-medium cursor-pointer">Bon niveau</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-purple-300 transition-colors">
                    <Checkbox
                      id="niveauExcellent"
                      checked={formData.niveauArabe === 'EXCELLENT'}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleSelectChange('niveauArabe', 'EXCELLENT');
                        } else {
                          handleSelectChange('niveauArabe', '');
                        }
                      }}
                      className="text-purple-600"
                    />
                    <Label htmlFor="niveauExcellent" className="text-lg font-medium cursor-pointer">Excellent</Label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="w-full max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-full mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Informations médicales</h2>
              <p className="text-gray-600">Ces informations sont importantes pour votre sécurité</p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="antecedentsMedicaux" className="text-sm font-medium text-gray-700 flex items-center">
                    <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                    Problèmes médicaux
                  </Label>
                  <div className="relative">
                    <Textarea
                      id="antecedentsMedicaux"
                      name="antecedentsMedicaux"
                      value={formData.antecedentsMedicaux}
                      onChange={handleChange}
                      placeholder="Sinusite, diabète, hypertension, etc."
                      rows={4}
                      className="border-2 border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-200 resize-none text-lg p-4"
                    />
                    <div className="absolute top-4 right-4">
                      <Heart className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="allergies" className="text-sm font-medium text-gray-700 flex items-center">
                    <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                    Allergies
                  </Label>
                  <div className="relative">
                    <Textarea
                      id="allergies"
                      name="allergies"
                      value={formData.allergies}
                      onChange={handleChange}
                      placeholder="Poussière, parfum, médicaments, etc."
                      rows={4}
                      className="border-2 border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-200 resize-none text-lg p-4"
                    />
                    <div className="absolute top-4 right-4">
                      <Shield className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="traitements" className="text-sm font-medium text-gray-700 flex items-center">
                  <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                  Traitements ou médicaments pris régulièrement
                </Label>
                <div className="relative">
                  <Textarea
                    id="traitements"
                    name="traitements"
                    value={formData.traitements}
                    onChange={handleChange}
                    placeholder="Genset comprimé, insuline, etc."
                    rows={3}
                    className="border-2 border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-200 resize-none text-lg p-4"
                  />
                  <div className="absolute top-4 right-4">
                    <Briefcase className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactUrgenceTel" className="text-sm font-medium text-gray-700 flex items-center">
                  <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                  Numéro d'urgence
                </Label>
                <div className="relative">
                  <Input
                    id="contactUrgenceTel"
                    name="contactUrgenceTel"
                    value={formData.contactUrgenceTel}
                    onChange={handleChange}
                    placeholder="776519860"
                    className="h-14 border-2 border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-200 pl-4 text-lg"
                  />
                  <Phone className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="w-full max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-full mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Contact d'urgence</h2>
              <p className="text-gray-600">Informations de la personne à contacter en cas d'urgence</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <Label className="text-sm font-medium text-gray-700 flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  Type d'autorité *
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-amber-300 transition-colors">
                    <Checkbox
                      id="typePere"
                      checked={formData.typeAutorite === 'PERE'}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleSelectChange('typeAutorite', 'PERE');
                        } else {
                          handleSelectChange('typeAutorite', '');
                        }
                      }}
                      className="text-amber-600"
                    />
                    <Label htmlFor="typePere" className="text-lg font-medium cursor-pointer">Père</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-amber-300 transition-colors">
                    <Checkbox
                      id="typeMere"
                      checked={formData.typeAutorite === 'MERE'}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleSelectChange('typeAutorite', 'MERE');
                        } else {
                          handleSelectChange('typeAutorite', '');
                        }
                      }}
                      className="text-amber-600"
                    />
                    <Label htmlFor="typeMere" className="text-lg font-medium cursor-pointer">Mère</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-amber-300 transition-colors">
                    <Checkbox
                      id="typeTuteur"
                      checked={formData.typeAutorite === 'TUTEUR'}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleSelectChange('typeAutorite', 'TUTEUR');
                        } else {
                          handleSelectChange('typeAutorite', '');
                        }
                      }}
                      className="text-amber-600"
                    />
                    <Label htmlFor="typeTuteur" className="text-lg font-medium cursor-pointer">Tuteur</Label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="contactUrgenceNom" className="text-sm font-medium text-gray-700 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    Nom *
                  </Label>
                  <div className="relative">
                    <Input
                      id="contactUrgenceNom"
                      name="contactUrgenceNom"
                      value={formData.contactUrgenceNom}
                      onChange={handleChange}
                      required
                      className="h-14 border-2 border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all duration-200 pl-4 text-lg"
                      placeholder="Nom du contact"
                    />
                    <User className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactUrgencePrenom" className="text-sm font-medium text-gray-700 flex items-center">
                    <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                    Prénom
                  </Label>
                  <div className="relative">
                    <Input
                      id="contactUrgencePrenom"
                      name="contactUrgencePrenom"
                      value={formData.contactUrgencePrenom}
                      onChange={handleChange}
                      className="h-14 border-2 border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all duration-200 pl-4 text-lg"
                      placeholder="Prénom du contact"
                    />
                    <User className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="contactUrgenceTelephone" className="text-sm font-medium text-gray-700 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    Téléphone *
                  </Label>
                  <div className="relative">
                    <Input
                      id="contactUrgenceTelephone"
                      name="contactUrgenceTelephone"
                      value={formData.contactUrgenceTelephone}
                      onChange={handleChange}
                      required
                      className="h-14 border-2 border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all duration-200 pl-4 text-lg"
                      placeholder="776519860"
                    />
                    <Phone className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-4xl lg:max-w-5xl max-h-[95vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-sm">
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-800">
                  {member ? 'Modifier le membre' : 'Nouveau membre'}
                </DialogTitle>
                <p className="text-sm sm:text-base text-gray-600">
                  {member ? 'Modifiez les informations du membre' : 'Ajoutez un nouveau membre à la dàhira'}
                </p>
              </div>
            </div>
          </div>

          {/* Progress bar mobile-first */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Étape {currentStep} sur {steps.length}
              </span>
              <span className="text-sm text-gray-500">
                {Math.round((currentStep / steps.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Step indicator mobile-first */}
          <div className="flex justify-center space-x-4 sm:space-x-8 mb-6">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center">
                <div className={`
                  w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300
                  ${currentStep > step.id 
                    ? 'bg-green-500 text-white' 
                    : currentStep === step.id 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-500'
                  }
                `}>
                  {currentStep > step.id ? (
                    <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <step.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </div>
                <span className="text-xs mt-2 text-center font-medium">
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="min-h-[500px] flex flex-col justify-center">
            {renderStepContent()}
          </div>

          {/* Navigation mobile-first */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center justify-center space-x-2 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 h-12 px-6 text-base font-medium"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Précédent</span>
            </Button>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
              {currentStep < steps.length ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={!isStepValid(currentStep)}
                  className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold h-12 px-6 rounded-lg shadow-lg text-base"
                >
                  <span>Suivant</span>
                  <ChevronRight className="w-5 h-5" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={loading || !isStepValid(currentStep)}
                  className="flex items-center justify-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold h-12 px-6 rounded-lg shadow-lg text-base"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Enregistrement...</span>
                    </>
                  ) : (
                    <>
                      <span>{member ? 'Modifier le membre' : 'Créer le membre'}</span>
                      <Check className="w-5 h-5" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MemberForm; 