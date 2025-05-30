// Logica corretta per i calcoli delle spese
export const calculations = {
  
  /**
   * Calcola i bilanci corretti:
   * - Chi paga ha un credito per l'importo pagato
   * - Chi consuma ha un debito per l'importo consumato
   * - Il bilancio finale è: pagato - consumato
   */
  calculateBalances: (group) => {
    if (!group || !group.expenses || group.expenses.length === 0) return {};

    const balances = {};
    
    // Inizializza i bilanci per tutti i membri
    group.members.forEach(member => {
      balances[member.id] = {
        name: member.name,
        totalPaid: 0,      // Quanto ha pagato in totale
        totalConsumed: 0,  // Quanto ha consumato in totale
        balance: 0         // Bilancio finale (pagato - consumato)
      };
    });

    // Calcola per ogni spesa
    group.expenses.forEach(expense => {
      const paidById = expense.paidBy; // Chi ha pagato
      const totalAmount = expense.totalAmount;

      // Chi ha pagato ottiene un credito
      if (balances[paidById]) {
        balances[paidById].totalPaid += totalAmount;
      }

      // Chi ha consumato ottiene un debito
      Object.entries(expense.memberExpenses).forEach(([memberId, amount]) => {
        const consumedAmount = parseFloat(amount) || 0;
        if (consumedAmount > 0 && balances[memberId]) {
          balances[memberId].totalConsumed += consumedAmount;
        }
      });
    });

    // Calcola il bilancio finale per ogni membro
    Object.keys(balances).forEach(memberId => {
      const member = balances[memberId];
      member.balance = member.totalPaid - member.totalConsumed;
    });

    return balances;
  },

  /**
   * Calcola i regolamenti ottimali:
   * - Chi ha bilancio positivo deve ricevere denaro
   * - Chi ha bilancio negativo deve dare denaro
   */
  calculateSettlements: (group) => {
    const balances = calculations.calculateBalances(group);
    const settlements = [];
    
    // Separa creditori e debitori
    const creditors = Object.values(balances)
      .filter(b => b.balance > 0.01)
      .map(b => ({ ...b }))
      .sort((a, b) => b.balance - a.balance); // Ordina per importo decrescente

    const debtors = Object.values(balances)
      .filter(b => b.balance < -0.01)
      .map(b => ({ ...b, balance: Math.abs(b.balance) }))
      .sort((a, b) => b.balance - a.balance); // Ordina per importo decrescente

    // Calcola i trasferimenti ottimali
    let i = 0, j = 0;
    while (i < creditors.length && j < debtors.length) {
      const creditor = creditors[i];
      const debtor = debtors[j];
      
      const transferAmount = Math.min(creditor.balance, debtor.balance);
      
      if (transferAmount > 0.01) {
        settlements.push({
          from: debtor.name,
          to: creditor.name,
          amount: transferAmount
        });
        
        creditor.balance -= transferAmount;
        debtor.balance -= transferAmount;
      }
      
      if (creditor.balance <= 0.01) i++;
      if (debtor.balance <= 0.01) j++;
    }

    return settlements;
  },

  /**
   * Verifica se una spesa è valida
   */
  validateExpense: (expense, members) => {
    if (!expense.description?.trim()) {
      return { valid: false, error: 'Inserisci una descrizione per la spesa' };
    }

    if (!expense.paidBy) {
      return { valid: false, error: 'Seleziona chi ha pagato la spesa' };
    }

    const memberExpenses = expense.memberExpenses || {};
    const hasConsumers = Object.values(memberExpenses).some(amount => 
      parseFloat(amount) > 0
    );

    if (!hasConsumers) {
      return { valid: false, error: 'Almeno una persona deve aver consumato qualcosa' };
    }

    // Verifica che il totale consumato non superi quello pagato
    const totalConsumed = Object.values(memberExpenses).reduce((sum, amount) => 
      sum + (parseFloat(amount) || 0), 0
    );

    if (totalConsumed > expense.totalAmount) {
      return { 
        valid: false, 
        error: `Il totale consumato (${totalConsumed.toFixed(2)}€) supera quello pagato (${expense.totalAmount.toFixed(2)}€)` 
      };
    }

    return { valid: true };
  },

  /**
   * Formatta un importo per la visualizzazione
   */
  formatAmount: (amount) => {
    return parseFloat(amount).toFixed(2);
  },

  /**
   * Calcola statistiche del gruppo
   */
  getGroupStats: (group) => {
    if (!group || !group.expenses || group.expenses.length === 0) {
      return {
        totalExpenses: 0,
        totalAmount: 0,
        averageExpense: 0,
        mostActiveUser: null
      };
    }

    const totalAmount = group.expenses.reduce((sum, expense) => 
      sum + expense.totalAmount, 0
    );

    const averageExpense = totalAmount / group.expenses.length;

    // Trova l'utente più attivo (quello che ha pagato di più)
    const paymentsByUser = {};
    group.expenses.forEach(expense => {
      const paidBy = expense.paidBy;
      if (!paymentsByUser[paidBy]) {
        paymentsByUser[paidBy] = 0;
      }
      paymentsByUser[paidBy] += expense.totalAmount;
    });

    let mostActiveUser = null;
    let maxAmount = 0;
    Object.entries(paymentsByUser).forEach(([userId, amount]) => {
      if (amount > maxAmount) {
        maxAmount = amount;
        const user = group.members.find(m => m.id === userId);
        mostActiveUser = user?.name || 'Sconosciuto';
      }
    });

    return {
      totalExpenses: group.expenses.length,
      totalAmount,
      averageExpense,
      mostActiveUser
    };
  }
};