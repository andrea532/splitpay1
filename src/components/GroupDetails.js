import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { styles } from '../styles/globalStyles';
import { IconComponent } from '../utils/icons';
import { calculations } from '../utils/calculations';
import MembersModal from './modals/MembersModal';
import AddExpenseModal from './modals/AddExpenseModal';

const GroupDetails = ({ group, groups, onGoBack, onUpdateGroups }) => {
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  const updateGroup = (updatedGroup) => {
    const updatedGroups = groups.map(g => 
      g.id === group.id ? updatedGroup : g
    );
    onUpdateGroups(updatedGroups);
  };

  const addMember = (memberName) => {
    if (!memberName.trim()) {
      return { success: false, error: 'Inserisci un nome per il membro' };
    }

    if (group.members.some(member => 
      member.name.toLowerCase() === memberName.toLowerCase()
    )) {
      return { success: false, error: 'Questo membro esiste già nel gruppo' };
    }

    const newMember = {
      id: Date.now().toString(),
      name: memberName.trim(),
      addedAt: new Date().toISOString(),
    };

    const updatedGroup = {
      ...group,
      members: [...group.members, newMember]
    };

    updateGroup(updatedGroup);
    return { success: true };
  };

  const removeMember = (memberId) => {
    const member = group.members.find(m => m.id === memberId);
    
    Alert.alert(
      'Rimuovi Membro',
      `Sei sicuro di voler rimuovere ${member.name} dal gruppo?\nTutte le sue spese verranno eliminate.`,
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Rimuovi',
          style: 'destructive',
          onPress: () => {
            // Rimuovi il membro e pulisci le spese
            const newMembers = group.members.filter(m => m.id !== memberId);
            const newExpenses = group.expenses
              .filter(expense => expense.paidBy !== memberId) // Rimuovi spese pagate da questo membro
              .map(expense => {
                // Rimuovi i consumi di questo membro dalle altre spese
                const newMemberExpenses = { ...expense.memberExpenses };
                delete newMemberExpenses[memberId];
                
                // Ricalcola il totale se necessario
                const totalConsumed = Object.values(newMemberExpenses)
                  .reduce((sum, amount) => sum + (parseFloat(amount) || 0), 0);
                
                return {
                  ...expense,
                  memberExpenses: newMemberExpenses,
                  // Mantieni il totalAmount originale (quello che è stato effettivamente pagato)
                };
              });

            const updatedGroup = {
              ...group,
              members: newMembers,
              expenses: newExpenses
            };

            updateGroup(updatedGroup);
          }
        }
      ]
    );
  };

  const addExpense = (expenseData) => {
    const validation = calculations.validateExpense(expenseData, group.members);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const newExpense = {
      id: Date.now().toString(),
      description: expenseData.description.trim(),
      location: expenseData.location.trim(),
      date: new Date().toLocaleDateString('it-IT'),
      totalAmount: parseFloat(expenseData.totalAmount),
      paidBy: expenseData.paidBy,
      memberExpenses: expenseData.memberExpenses,
      createdAt: new Date().toISOString(),
    };

    const updatedGroup = {
      ...group,
      expenses: [...group.expenses, newExpense]
    };

    updateGroup(updatedGroup);
    return { success: true };
  };

  const deleteExpense = (expenseId) => {
    const expense = group.expenses.find(e => e.id === expenseId);
    Alert.alert(
      'Elimina Spesa',
      `Sei sicuro di voler eliminare "${expense.description}"?`,
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: () => {
            const updatedGroup = {
              ...group,
              expenses: group.expenses.filter(e => e.id !== expenseId)
            };
            updateGroup(updatedGroup);
          }
        }
      ]
    );
  };

  const openExpenseModal = () => {
    if (group.members.length === 0) {
      Alert.alert('Errore', 'Aggiungi prima dei membri al gruppo');
      return;
    }
    setShowExpenseModal(true);
  };

  const balances = calculations.calculateBalances(group);
  const settlements = calculations.calculateSettlements(group);
  const stats = calculations.getGroupStats(group);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2196F3" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onGoBack}>
          <IconComponent name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{group.name}</Text>
        <TouchableOpacity onPress={() => setShowMembersModal(true)}>
          <IconComponent name="people" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Statistiche Gruppo */}
        {stats.totalExpenses > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Statistiche</Text>
            <View style={styles.statsCard}>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Spese totali:</Text>
                <Text style={styles.statValue}>{stats.totalExpenses}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Importo totale:</Text>
                <Text style={styles.statValue}>{stats.totalAmount.toFixed(2)}€</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Media per spesa:</Text>
                <Text style={styles.statValue}>{stats.averageExpense.toFixed(2)}€</Text>
              </View>
              {stats.mostActiveUser && (
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Chi paga di più:</Text>
                  <Text style={styles.statValue}>{stats.mostActiveUser}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Sezione Bilanci */}
        {group.expenses.length > 0 && Object.keys(balances).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💰 Bilanci</Text>
            <Text style={styles.sectionSubtitle}>
              Chi deve ricevere (+) o dare (-) denaro
            </Text>
            {Object.values(balances).map((balance, index) => (
              <View key={index} style={styles.balanceCard}>
                <View style={styles.balanceInfo}>
                  <Text style={styles.balanceName}>{balance.name}</Text>
                  <Text style={styles.balanceDetails}>
                    Pagato: {balance.totalPaid.toFixed(2)}€ • Consumato: {balance.totalConsumed.toFixed(2)}€
                  </Text>
                </View>
                <Text style={[
                  styles.balanceAmount,
                  { color: balance.balance >= 0 ? '#4CAF50' : '#F44336' }
                ]}>
                  {balance.balance >= 0 ? '+' : ''}{balance.balance.toFixed(2)}€
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Sezione Regolamenti */}
        {settlements.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔄 Regolamenti</Text>
            <Text style={styles.sectionSubtitle}>
              Pagamenti da effettuare per pareggiare i conti
            </Text>
            {settlements.map((settlement, index) => (
              <View key={index} style={styles.settlementCard}>
                <Text style={styles.settlementText}>
                  <Text style={styles.settlementFrom}>{settlement.from}</Text>
                  {' deve '}
                  <Text style={styles.settlementAmount}>{settlement.amount.toFixed(2)}€</Text>
                  {' a '}
                  <Text style={styles.settlementTo}>{settlement.to}</Text>
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Sezione Spese */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>💳 Spese</Text>
            <TouchableOpacity
              style={styles.addExpenseButton}
              onPress={openExpenseModal}
            >
              <IconComponent name="add" size={20} color="white" />
            </TouchableOpacity>
          </View>

          {group.expenses.length === 0 ? (
            <View style={styles.emptyExpenses}>
              <IconComponent name="receipt-outline" size={60} color="#ccc" />
              <Text style={styles.emptyText}>Nessuna spesa aggiunta</Text>
              <Text style={styles.emptySubText}>
                Tocca + per aggiungere la prima spesa
              </Text>
            </View>
          ) : (
            group.expenses.map((expense) => {
              const paidByMember = group.members.find(m => m.id === expense.paidBy);
              return (
                <TouchableOpacity 
                  key={expense.id} 
                  style={styles.expenseCard}
                  onLongPress={() => deleteExpense(expense.id)}
                >
                  <View style={styles.expenseHeader}>
                    <Text style={styles.expenseDescription} numberOfLines={2}>
                      {expense.description}
                    </Text>
                    <Text style={styles.expenseAmount}>
                      {expense.totalAmount.toFixed(2)}€
                    </Text>
                  </View>
                  
                  <View style={styles.expenseInfo}>
                    <Text style={styles.expensePaidBy}>
                      💳 Pagato da: <Text style={styles.expensePaidByName}>{paidByMember?.name || 'Sconosciuto'}</Text>
                    </Text>
                  </View>

                  {expense.location && (
                    <View style={styles.expenseLocationContainer}>
                      <IconComponent name="location" size={12} color="#666" />
                      <Text style={styles.expenseLocation}>{expense.location}</Text>
                    </View>
                  )}
                  
                  <View style={styles.expenseDateContainer}>
                    <IconComponent name="calendar" size={12} color="#999" />
                    <Text style={styles.expenseDate}>{expense.date}</Text>
                  </View>
                  
                  <View style={styles.expenseDetails}>
                    <Text style={styles.expenseDetailsTitle}>Consumi:</Text>
                    {Object.entries(expense.memberExpenses).map(([memberId, amount]) => {
                      const member = group.members.find(m => m.id === memberId);
                      return amount > 0 ? (
                        <Text key={memberId} style={styles.memberExpense}>
                          • {member?.name}: {parseFloat(amount).toFixed(2)}€
                        </Text>
                      ) : null;
                    })}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Suggerimento */}
        {group.expenses.length > 0 && (
          <View style={styles.helpSection}>
            <Text style={styles.helpText}>
              💡 Tieni premuto su una spesa per eliminarla
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Modal Membri */}
      <MembersModal
        visible={showMembersModal}
        group={group}
        onClose={() => setShowMembersModal(false)}
        onAddMember={addMember}
        onRemoveMember={removeMember}
      />

      {/* Modal Aggiungi Spesa */}
      <AddExpenseModal
        visible={showExpenseModal}
        group={group}
        onClose={() => setShowExpenseModal(false)}
        onAddExpense={addExpense}
      />
    </SafeAreaView>
  );
};

export default GroupDetails;