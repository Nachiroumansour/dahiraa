import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Configuration d'axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Services d'authentification
export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
  
  updateProfile: async (userData) => {
    const response = await api.put('/auth/profile', userData);
    return response.data;
  }
};

// Services des membres
export const memberService = {
  getMembers: async (params = {}) => {
    const response = await api.get('/members', { params });
    return response.data;
  },
  
  getMemberById: async (id) => {
    const response = await api.get(`/members/${id}`);
    return response.data;
  },
  
  createMember: async (memberData) => {
    const formData = new FormData();
    Object.keys(memberData).forEach(key => {
      if (memberData[key] !== null && memberData[key] !== undefined) {
        formData.append(key, memberData[key]);
      }
    });
    
    const response = await api.post('/members', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  updateMember: async (id, memberData) => {
    const formData = new FormData();
    Object.keys(memberData).forEach(key => {
      if (memberData[key] !== null && memberData[key] !== undefined) {
        formData.append(key, memberData[key]);
      }
    });
    
    const response = await api.put(`/members/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  deleteMember: async (id) => {
    const response = await api.delete(`/members/${id}`);
    return response.data;
  },
  
  getMemberStats: async (id) => {
    const response = await api.get(`/members/${id}/stats`);
    return response.data;
  },
  
  getGlobalStats: async () => {
    const response = await api.get('/members/stats');
    return response.data;
  }
};

// Services des cotisations
export const cotisationService = {
  getCotisations: async (params = {}) => {
    const response = await api.get('/cotisations', { params });
    return response.data;
  },
  
  createCotisation: async (cotisationData) => {
    const response = await api.post('/cotisations', cotisationData);
    return response.data;
  },
  
  updateCotisation: async (id, cotisationData) => {
    const response = await api.put(`/cotisations/${id}`, cotisationData);
    return response.data;
  },
  
  deleteCotisation: async (id) => {
    const response = await api.delete(`/cotisations/${id}`);
    return response.data;
  },
  
  getCotisationsByWeek: async (semaine) => {
    const response = await api.get(`/cotisations/week/${semaine}`);
    return response.data;
  },
  
  getMonthlyReport: async (mois, annee) => {
    const response = await api.get(`/cotisations/monthly-report/${mois}/${annee}`);
    return response.data;
  },
  
  getYearlyReport: async (annee) => {
    const response = await api.get(`/cotisations/yearly-report/${annee}`);
    return response.data;
  },
  
  getRestesAPayer: async (params = {}) => {
    const response = await api.get('/cotisations/restes-a-payer', { params });
    return response.data;
  },
  
  getRestesAPayerPeriode: async (params = {}) => {
    const response = await api.get('/cotisations/restes-a-payer-periode', { params });
    return response.data;
  },
  
  getMemberCotisationHistory: async (memberId, params = {}) => {
    const response = await api.get(`/cotisations/history/${memberId}`, { params });
    return response.data;
  },
  
  bulkCreateCotisations: async (data) => {
    const response = await api.post('/cotisations/bulk', data);
    return response.data;
  }
};

// Services des événements
export const eventService = {
  getEvents: async (params = {}) => {
    const response = await api.get('/events', { params });
    return response.data;
  },
  
  getEventById: async (id) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },
  
  createEvent: async (eventData) => {
    const response = await api.post('/events', eventData);
    return response.data;
  },
  
  updateEvent: async (id, eventData) => {
    const response = await api.put(`/events/${id}`, eventData);
    return response.data;
  },
  
  deleteEvent: async (id) => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },
  
  addParticipant: async (eventId, memberId) => {
    const response = await api.post(`/events/${eventId}/participants`, { memberId });
    return response.data;
  },
  
  updateParticipation: async (eventId, memberId, participationData) => {
    const response = await api.put(`/events/${eventId}/participants/${memberId}`, participationData);
    return response.data;
  },
  
  removeParticipant: async (eventId, memberId) => {
    const response = await api.delete(`/events/${eventId}/participants/${memberId}`);
    return response.data;
  }
};

// Services des dépenses
export const expenseService = {
  getExpenses: async (params = {}) => {
    const response = await api.get('/expenses', { params });
    return response.data;
  },
  
  getExpenseById: async (id) => {
    const response = await api.get(`/expenses/${id}`);
    return response.data;
  },
  
  createExpense: async (expenseData) => {
    const formData = new FormData();
    Object.keys(expenseData).forEach(key => {
      if (expenseData[key] !== null && expenseData[key] !== undefined) {
        formData.append(key, expenseData[key]);
      }
    });
    
    const response = await api.post('/expenses', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  updateExpense: async (id, expenseData) => {
    const formData = new FormData();
    Object.keys(expenseData).forEach(key => {
      if (expenseData[key] !== null && expenseData[key] !== undefined) {
        formData.append(key, expenseData[key]);
      }
    });
    
    const response = await api.put(`/expenses/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  deleteExpense: async (id) => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  },
  
  getExpenseStats: async (params = {}) => {
    const response = await api.get('/expenses/stats', { params });
    return response.data;
  }
};

// Services du tableau de bord
export const dashboardService = {
  getDashboardStats: async () => {
    const response = await api.get('/dashboard');
    return response.data;
  },
  
  getFinancialSummary: async (params = {}) => {
    const response = await api.get('/dashboard/financial-summary', { params });
    return response.data;
  },
  
  getWeeklyReport: async (params = {}) => {
    const response = await api.get('/dashboard/weekly-report', { params });
    return response.data;
  }
};

// Export des membres
export const exportMembersToExcel = async () => {
  try {
    const response = await api.get('/members/export/excel', {
      responseType: 'blob'
    });
    
    // Créer un lien de téléchargement
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'membres_dahiraa.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de l\'export Excel:', error);
    throw error;
  }
};

export const exportMembersToPDF = async () => {
  try {
    const response = await api.get('/members/export/pdf', {
      responseType: 'blob'
    });
    
    // Créer un lien de téléchargement
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'membres_dahiraa.pdf');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de l\'export PDF:', error);
    throw error;
  }
};

export default api;

