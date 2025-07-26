import { format, parseISO, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';

// Formatage des montants en FCFA
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0 FCFA';
  }
  
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ' FCFA';
};

// Formatage des dates
export const formatDate = (date, formatString = 'dd/MM/yyyy') => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';
    
    return format(dateObj, formatString, { locale: fr });
  } catch (error) {
    console.error('Erreur de formatage de date:', error);
    return '';
  }
};

// Formatage des dates avec heure
export const formatDateTime = (date) => {
  return formatDate(date, 'dd/MM/yyyy à HH:mm');
};

// Formatage des dates pour les inputs
export const formatDateForInput = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';
    
    return format(dateObj, 'yyyy-MM-dd');
  } catch (error) {
    console.error('Erreur de formatage de date pour input:', error);
    return '';
  }
};

// Formatage des noms complets
export const formatFullName = (prenom, nom) => {
  if (!prenom && !nom) return '';
  if (!prenom) return nom;
  if (!nom) return prenom;
  return `${prenom} ${nom}`;
};

// Générer les initiales d'un nom
export const getInitials = (prenom, nom) => {
  if (!prenom && !nom) return '?';
  
  let initials = '';
  
  if (prenom) {
    initials += prenom.charAt(0).toUpperCase();
  }
  
  if (nom) {
    initials += nom.charAt(0).toUpperCase();
  }
  
  return initials || '?';
};

// Formatage des numéros de téléphone
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  // Supprimer tous les caractères non numériques
  const cleaned = phone.replace(/\D/g, '');
  
  // Formater selon le format sénégalais (77 123 45 67)
  if (cleaned.length === 9) {
    return cleaned.replace(/(\d{2})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4');
  }
  
  return phone;
};

// Formatage des statuts
export const formatStatus = (status) => {
  const statusMap = {
    'PAYE': 'Payé',
    'EN_ATTENTE': 'En attente',
    'ABSENT': 'Absent',
    'HOMME': 'Homme',
    'FEMME': 'Femme',
    'ADMIN': 'Administrateur',
    'GESTIONNAIRE': 'Gestionnaire',
    'EVENEMENT': 'Événement',
    'GENERALE': 'Générale'
  };
  
  return statusMap[status] || status;
};

// Obtenir la couleur d'un statut
export const getStatusColor = (status) => {
  const colorMap = {
    'PAYE': 'text-green-600 bg-green-50',
    'EN_ATTENTE': 'text-yellow-600 bg-yellow-50',
    'ABSENT': 'text-red-600 bg-red-50',
    'ADMIN': 'text-purple-600 bg-purple-50',
    'GESTIONNAIRE': 'text-blue-600 bg-blue-50',
    'EVENEMENT': 'text-indigo-600 bg-indigo-50',
    'GENERALE': 'text-gray-600 bg-gray-50'
  };
  
  return colorMap[status] || 'text-gray-600 bg-gray-50';
};

// Calculer l'âge à partir de la date de naissance
export const calculateAge = (birthDate) => {
  if (!birthDate) return '';
  
  try {
    const dateObj = typeof birthDate === 'string' ? parseISO(birthDate) : birthDate;
    if (!isValid(dateObj)) return '';
    
    const today = new Date();
    let age = today.getFullYear() - dateObj.getFullYear();
    const monthDiff = today.getMonth() - dateObj.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateObj.getDate())) {
      age--;
    }
    
    return `${age} ans`;
  } catch (error) {
    console.error('Erreur de calcul d\'âge:', error);
    return '';
  }
};

// Obtenir le jeudi de la semaine courante
export const getThursdayOfWeek = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay(); // 0 = dimanche, 4 = jeudi
  const daysToThursday = day <= 4 ? 4 - day : 11 - day;
  const thursday = new Date(d);
  thursday.setDate(d.getDate() + daysToThursday);
  thursday.setHours(0, 0, 0, 0);
  return thursday;
};

// Formater une période
export const formatPeriod = (startDate, endDate) => {
  if (!startDate && !endDate) return '';
  if (!endDate) return `Depuis le ${formatDate(startDate)}`;
  if (!startDate) return `Jusqu'au ${formatDate(endDate)}`;
  
  return `Du ${formatDate(startDate)} au ${formatDate(endDate)}`;
};

