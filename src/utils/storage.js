// Gestione del salvataggio e caricamento dati
// Funziona sia con AsyncStorage (React Native) che con localStorage (web/Snack)

let AsyncStorage;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (e) {
  // Fallback per browser/Expo Snack
  AsyncStorage = {
    getItem: async (key) => {
      try {
        return localStorage.getItem(key);
      } catch (error) {
        return null;
      }
    },
    setItem: async (key, value) => {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        console.error('Errore salvataggio localStorage:', error);
      }
    },
    removeItem: async (key) => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error('Errore rimozione localStorage:', error);
      }
    }
  };
}

const STORAGE_KEY = 'smartsplit_groups_v2';

export const storage = {
  
  /**
   * Carica tutti i gruppi salvati
   */
  getGroups: async () => {
    try {
      const savedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const groups = JSON.parse(savedData);
        // Validazione e migrazione dati se necessario
        return storage.validateAndMigrateGroups(groups);
      }
      return [];
    } catch (error) {
      console.error('Errore nel caricamento gruppi:', error);
      return [];
    }
  },

  /**
   * Salva tutti i gruppi
   */
  saveGroups: async (groups) => {
    try {
      const dataToSave = JSON.stringify(groups);
      await AsyncStorage.setItem(STORAGE_KEY, dataToSave);
      return true;
    } catch (error) {
      console.error('Errore nel salvataggio gruppi:', error);
      return false;
    }
  },

  /**
   * Elimina tutti i dati (per reset completo)
   */
  clearAll: async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Errore nella cancellazione dati:', error);
      return false;
    }
  },

  /**
   * Valida e migra i dati da versioni precedenti
   */
  validateAndMigrateGroups: (groups) => {
    if (!Array.isArray(groups)) return [];

    return groups.map(group => {
      // Assicura che ogni gruppo abbia tutti i campi necessari
      const validatedGroup = {
        id: group.id || Date.now().toString(),
        name: group.name || 'Gruppo Senza Nome',
        members: Array.isArray(group.members) ? group.members : [],
        expenses: Array.isArray(group.expenses) ? group.expenses : [],
        createdAt: group.createdAt || new Date().toISOString(),
        ...group
      };

      // Valida i membri
      validatedGroup.members = validatedGroup.members.map(member => ({
        id: member.id || Date.now().toString(),
        name: member.name || 'Membro Senza Nome',
        addedAt: member.addedAt || new Date().toISOString(),
        ...member
      }));

      // Valida le spese
      validatedGroup.expenses = validatedGroup.expenses.map(expense => ({
        id: expense.id || Date.now().toString(),
        description: expense.description || 'Spesa',
        location: expense.location || '',
        date: expense.date || new Date().toLocaleDateString('it-IT'),
        totalAmount: parseFloat(expense.totalAmount) || 0,
        paidBy: expense.paidBy || (validatedGroup.members[0]?.id || ''),
        memberExpenses: expense.memberExpenses || {},
        createdAt: expense.createdAt || new Date().toISOString(),
        ...expense
      }));

      return validatedGroup;
    });
  },

  /**
   * Esporta i dati in formato JSON per backup
   */
  exportData: async () => {
    try {
      const groups = await storage.getGroups();
      const exportData = {
        version: '2.0',
        exportDate: new Date().toISOString(),
        groups: groups
      };
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Errore nell\'esportazione dati:', error);
      return null;
    }
  },

  /**
   * Importa i dati da un backup JSON
   */
  importData: async (jsonData) => {
    try {
      const importData = JSON.parse(jsonData);
      if (importData.groups && Array.isArray(importData.groups)) {
        const validatedGroups = storage.validateAndMigrateGroups(importData.groups);
        await storage.saveGroups(validatedGroups);
        return { success: true, groupsCount: validatedGroups.length };
      }
      return { success: false, error: 'Formato dati non valido' };
    } catch (error) {
      console.error('Errore nell\'importazione dati:', error);
      return { success: false, error: 'Errore nel parsing dei dati' };
    }
  },

  /**
   * Ottiene le statistiche di utilizzo
   */
  getUsageStats: async () => {
    try {
      const groups = await storage.getGroups();
      const totalGroups = groups.length;
      const totalMembers = groups.reduce((sum, group) => sum + group.members.length, 0);
      const totalExpenses = groups.reduce((sum, group) => sum + group.expenses.length, 0);
      const totalAmount = groups.reduce((sum, group) => 
        sum + group.expenses.reduce((expSum, expense) => expSum + expense.totalAmount, 0), 0
      );

      return {
        totalGroups,
        totalMembers,
        totalExpenses,
        totalAmount,
        averageGroupSize: totalGroups > 0 ? (totalMembers / totalGroups).toFixed(1) : 0,
        averageExpenseAmount: totalExpenses > 0 ? (totalAmount / totalExpenses).toFixed(2) : 0
      };
    } catch (error) {
      console.error('Errore nel calcolo statistiche:', error);
      return null;
    }
  }
};