import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  TextInput,
  ScrollView
} from 'react-native';
import { authService } from './services/authService';
import { groupsService } from './services/groupsService';
import AuthScreen from './components/AuthScreen';

// Icone semplici
const Icon = ({ name, size = 24, color = "#000" }) => {
  const icons = {
    'add': '+',
    'arrow-back': '←',
    'people': '👥',
    'chevron-forward': '→',
    'people-outline': '👥',
    'close': '✕',
    'logout': '🚪',
    'user': '👤',
    'settings': '⚙️',
    'qr-code': '📱',
    'share': '📤',
    'refresh': '🔄',
    'wallet': '💰',
    'receipt': '🧾',
    'calendar': '📅',
    'location': '📍'
  };
  
  return (
    <Text style={{ fontSize: size, color, fontWeight: 'bold' }}>
      {icons[name] || '●'}
    </Text>
  );
};

const SmartSplitApp = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [groupExpenses, setGroupExpenses] = useState([]);
  const [groupBalances, setGroupBalances] = useState(null);

  // Modals
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showJoinGroupModal, setShowJoinGroupModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Form data
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [expenseForm, setExpenseForm] = useState({
    title: '',
    description: '',
    totalAmount: '',
    location: '',
    shares: {}
  });

  useEffect(() => {
    initializeAuth();
  }, []);

  useEffect(() => {
    if (user) {
      loadUserGroups();
    }
  }, [user]);

  useEffect(() => {
    if (activeGroup) {
      loadGroupData();
      // Setup real-time subscription
      const unsubscribe = groupsService.subscribeToGroupChanges(activeGroup.id, {
        onExpenseChange: () => loadGroupData(),
        onMemberChange: () => loadGroupData(),
        onShareChange: () => loadGroupData()
      });

      return unsubscribe;
    }
  }, [activeGroup]);

  const initializeAuth = async () => {
    try {
      // Check for existing session
      const { data: { session } } = await authService.getCurrentSession();
      
      if (session?.user) {
        setUser(session.user);
      }

      // Setup auth state listener
      authService.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setGroups([]);
          setActiveGroup(null);
        }
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserGroups = async () => {
    try {
      const result = await groupsService.getUserGroups();
      if (result.success) {
        setGroups(result.groups);
      } else {
        Alert.alert('Errore', result.error);
      }
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  };

  const loadGroupData = async () => {
    if (!activeGroup) return;

    try {
      // Load expenses
      const expensesResult = await groupsService.getGroupExpenses(activeGroup.id);
      if (expensesResult.success) {
        setGroupExpenses(expensesResult.expenses);
      }

      // Load balances
      const balancesResult = await groupsService.calculateGroupBalances(activeGroup.id);
      if (balancesResult.success) {
        setGroupBalances(balancesResult);
      }

      // Refresh group details
      const groupResult = await groupsService.getGroupDetails(activeGroup.id);
      if (groupResult.success) {
        setActiveGroup(groupResult.group);
      }
    } catch (error) {
      console.error('Error loading group data:', error);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      Alert.alert('Errore', 'Inserisci un nome per il gruppo');
      return;
    }

    try {
      const result = await groupsService.createGroup(newGroupName, newGroupDescription);
      if (result.success) {
        Alert.alert('Successo!', result.message);
        setNewGroupName('');
        setNewGroupDescription('');
        setShowCreateGroupModal(false);
        loadUserGroups();
      } else {
        Alert.alert('Errore', result.error);
      }
    } catch (error) {
      Alert.alert('Errore', 'Si è verificato un errore imprevisto');
    }
  };

  const handleJoinGroup = async () => {
    if (!inviteCode.trim()) {
      Alert.alert('Errore', 'Inserisci il codice invito');
      return;
    }

    try {
      const result = await groupsService.joinGroupByInviteCode(inviteCode);
      if (result.success) {
        Alert.alert('Successo!', result.message);
        setInviteCode('');
        setShowJoinGroupModal(false);
        loadUserGroups();
      } else {
        Alert.alert('Errore', result.error);
      }
    } catch (error) {
      Alert.alert('Errore', 'Si è verificato un errore imprevisto');
    }
  };

  const handleAddExpense = async () => {
    if (!expenseForm.title.trim()) {
      Alert.alert('Errore', 'Inserisci un titolo per la spesa');
      return;
    }

    const totalAmount = parseFloat(expenseForm.totalAmount);
    if (isNaN(totalAmount) || totalAmount <= 0) {
      Alert.alert('Errore', 'Inserisci un importo valido');
      return;
    }

    // Verifica che ci siano consumi
    const hasShares = Object.values(expenseForm.shares).some(amount => 
      parseFloat(amount) > 0
    );

    if (!hasShares) {
      Alert.alert('Errore', 'Almeno una persona deve aver consumato qualcosa');
      return;
    }

    try {
      const result = await groupsService.createExpense(activeGroup.id, expenseForm);
      if (result.success) {
        Alert.alert('Successo!', result.message);
        setExpenseForm({ title: '', description: '', totalAmount: '', location: '', shares: {} });
        setShowAddExpenseModal(false);
        loadGroupData();
      } else {
        Alert.alert('Errore', result.error);
      }
    } catch (error) {
      Alert.alert('Errore', 'Si è verificato un errore imprevisto');
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Sei sicuro di voler uscire?',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Esci',
          style: 'destructive',
          onPress: async () => {
            const result = await authService.signOut();
            if (!result.success) {
              Alert.alert('Errore', result.error);
            }
          }
        }
      ]
    );
  };

  const shareInviteCode = (code) => {
    Alert.alert(
      'Codice Invito',
      `Condividi questo codice con i tuoi amici:\n\n${code}`,
      [
        { text: 'Chiudi', style: 'cancel' },
        {
          text: 'Copia',
          onPress: () => {
            // In un'app reale, qui useresti Clipboard.setString(code)
            Alert.alert('Copiato!', 'Codice copiato negli appunti');
          }
        }
      ]
    );
  };

  const openExpenseModal = () => {
    if (!activeGroup?.group_members || activeGroup.group_members.length === 0) {
      Alert.alert('Errore', 'Il gruppo deve avere almeno un membro per aggiungere spese');
      return;
    }

    // Inizializza shares per tutti i membri
    const initialShares = {};
    activeGroup.group_members.forEach(member => {
      initialShares[member.user_id] = '';
    });

    setExpenseForm({
      title: '',
      description: '',
      totalAmount: '',
      location: '',
      shares: initialShares
    });
    setShowAddExpenseModal(true);
  };

  const calculateTotalShares = () => {
    return Object.values(expenseForm.shares).reduce((sum, amount) => {
      const num = parseFloat(amount);
      return sum + (isNaN(num) ? 0 : num);
    }, 0);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Caricamento...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return <AuthScreen onAuthSuccess={setUser} />;
  }

  // LISTA GRUPPI
  if (!activeGroup) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>I tuoi gruppi</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setShowProfileModal(true)}
            >
              <Icon name="user" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setShowCreateGroupModal(true)}
            >
              <Icon name="add" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => setShowCreateGroupModal(true)}
            >
              <Icon name="add" size={24} color="#2196F3" />
              <Text style={styles.quickActionText}>Crea Gruppo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => setShowJoinGroupModal(true)}
            >
              <Icon name="qr-code" size={24} color="#4CAF50" />
              <Text style={styles.quickActionText}>Unisciti</Text>
            </TouchableOpacity>
          </View>

          {/* Groups List */}
          {groups.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="people-outline" size={80} color="#ccc" />
              <Text style={styles.emptyText}>Nessun gruppo ancora</Text>
              <Text style={styles.emptySubText}>
                Crea un gruppo o unisciti a uno esistente per iniziare!
              </Text>
            </View>
          ) : (
            <FlatList
              data={groups}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.groupCard}
                  onPress={() => setActiveGroup(item)}
                >
                  <View style={styles.groupInfo}>
                    <Text style={styles.groupName}>{item.name}</Text>
                    <Text style={styles.groupDetails}>
                      {item.memberCount} membri • {item.expenseCount} spese
                    </Text>
                    {item.totalAmount > 0 && (
                      <Text style={styles.groupAmount}>
                        Totale: {item.totalAmount.toFixed(2)}€
                      </Text>
                    )}
                    <Text style={styles.groupRole}>
                      {item.userRole === 'admin' ? '👑 Admin' : '👤 Membro'}
                    </Text>
                  </View>
                  <Icon name="chevron-forward" size={20} color="#666" />
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        {/* Modals */}
        {/* Create Group Modal */}
        <Modal visible={showCreateGroupModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowCreateGroupModal(false)}>
                  <Text style={styles.modalCancel}>Annulla</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Nuovo Gruppo</Text>
                <TouchableOpacity onPress={handleCreateGroup}>
                  <Text style={styles.modalSave}>Crea</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.modalContent}>
                <TextInput
                  style={styles.input}
                  placeholder="Nome del gruppo"
                  value={newGroupName}
                  onChangeText={setNewGroupName}
                  maxLength={50}
                />
                <TextInput
                  style={[styles.input, { height: 80 }]}
                  placeholder="Descrizione (opzionale)"
                  value={newGroupDescription}
                  onChangeText={setNewGroupDescription}
                  multiline
                  maxLength={200}
                />
              </View>
            </View>
          </View>
        </Modal>

        {/* Join Group Modal */}
        <Modal visible={showJoinGroupModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowJoinGroupModal(false)}>
                  <Text style={styles.modalCancel}>Annulla</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Unisciti a Gruppo</Text>
                <TouchableOpacity onPress={handleJoinGroup}>
                  <Text style={styles.modalSave}>Unisciti</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.modalContent}>
                <TextInput
                  style={styles.input}
                  placeholder="Codice invito"
                  value={inviteCode}
                  onChangeText={setInviteCode}
                  autoCapitalize="characters"
                  maxLength={10}
                />
                <Text style={styles.helpText}>
                  💡 Chiedi il codice invito al creatore del gruppo
                </Text>
              </View>
            </View>
          </View>
        </Modal>

        {/* Profile Modal */}
        <Modal visible={showProfileModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowProfileModal(false)}>
                  <Text style={styles.modalCancel}>Chiudi</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Profilo</Text>
                <TouchableOpacity onPress={handleLogout}>
                  <Text style={styles.modalLogout}>Esci</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.modalContent}>
                <View style={styles.profileInfo}>
                  <Icon name="user" size={40} color="#2196F3" />
                  <Text style={styles.profileName}>
                    {user.user_metadata?.full_name || user.email}
                  </Text>
                  <Text style={styles.profileEmail}>{user.email}</Text>
                </View>
                
                <View style={styles.profileStats}>
                  <Text style={styles.statsTitle}>Le tue statistiche:</Text>
                  <Text style={styles.statItem}>👥 {groups.length} gruppi</Text>
                  <Text style={styles.statItem}>
                    💰 {groups.reduce((sum, g) => sum + g.expenseCount, 0)} spese create
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  // DETTAGLI GRUPPO
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setActiveGroup(null)}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{activeGroup.name}</Text>
        <TouchableOpacity
          onPress={() => shareInviteCode(activeGroup.invite_code)}
        >
          <Icon name="share" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Group Info */}
        <View style={styles.groupInfoCard}>
          <Text style={styles.groupInfoTitle}>{activeGroup.name}</Text>
          {activeGroup.description && (
            <Text style={styles.groupInfoDescription}>{activeGroup.description}</Text>
          )}
          <View style={styles.groupInfoStats}>
            <Text style={styles.groupInfoStat}>
              👥 {activeGroup.group_members?.length || 0} membri
            </Text>
            <Text style={styles.groupInfoStat}>
              💰 {groupExpenses.length} spese
            </Text>
            <TouchableOpacity
              onPress={() => shareInviteCode(activeGroup.invite_code)}
              style={styles.inviteButton}
            >
              <Text style={styles.inviteButtonText}>
                📱 Invita: {activeGroup.invite_code}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bilanci */}
        {groupBalances && groupBalances.balances.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💰 Bilanci</Text>
            {groupBalances.balances.map((balance, index) => (
              <View key={index} style={styles.balanceCard}>
                <View style={styles.balanceInfo}>
                  <Text style={styles.balanceName}>
                    {balance.full_name || balance.email}
                  </Text>
                  <Text style={styles.balanceDetails}>
                    Pagato: {parseFloat(balance.total_paid).toFixed(2)}€ • 
                    Consumato: {parseFloat(balance.total_consumed).toFixed(2)}€
                  </Text>
                </View>
                <Text style={[
                  styles.balanceAmount,
                  { color: parseFloat(balance.balance) >= 0 ? '#4CAF50' : '#F44336' }
                ]}>
                  {parseFloat(balance.balance) >= 0 ? '+' : ''}{parseFloat(balance.balance).toFixed(2)}€
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Regolamenti */}
        {groupBalances && groupBalances.settlements.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔄 Regolamenti</Text>
            {groupBalances.settlements.map((settlement, index) => (
              <View key={index} style={styles.settlementCard}>
                <Text style={styles.settlementText}>
                  {settlement.from} deve {settlement.amount.toFixed(2)}€ a {settlement.to}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Spese */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>💳 Spese Recenti</Text>
            <TouchableOpacity
              style={styles.addExpenseButton}
              onPress={openExpenseModal}
            >
              <Icon name="add" size={20} color="white" />
            </TouchableOpacity>
          </View>

          {groupExpenses.length === 0 ? (
            <View style={styles.emptyExpenses}>
              <Icon name="receipt" size={60} color="#ccc" />
              <Text style={styles.emptyText}>Nessuna spesa ancora</Text>
              <Text style={styles.emptySubText}>
                Tocca + per aggiungere la prima spesa!
              </Text>
            </View>
          ) : (
            groupExpenses.map((expense) => (
              <View key={expense.id} style={styles.expenseCard}>
                <View style={styles.expenseHeader}>
                  <Text style={styles.expenseTitle}>{expense.title}</Text>
                  <Text style={styles.expenseAmount}>
                    {parseFloat(expense.total_amount).toFixed(2)}€
                  </Text>
                </View>
                
                <Text style={styles.expenseCreator}>
                  💳 Pagato da {expense.created_by_profile?.full_name || expense.created_by_profile?.email}
                </Text>
                
                {expense.description && (
                  <Text style={styles.expenseDescription}>{expense.description}</Text>
                )}
                
                {expense.location && (
                  <Text style={styles.expenseLocation}>📍 {expense.location}</Text>
                )}
                
                <Text style={styles.expenseDate}>
                  📅 {new Date(expense.expense_date).toLocaleDateString('it-IT')}
                </Text>

                {expense.expense_shares && expense.expense_shares.length > 0 && (
                  <View style={styles.expenseShares}>
                    <Text style={styles.expenseSharesTitle}>Consumi:</Text>
                    {expense.expense_shares.map((share, index) => (
                      <Text key={index} style={styles.expenseShare}>
                        • {share.profiles?.full_name || share.profiles?.email}: {parseFloat(share.amount_consumed).toFixed(2)}€
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Add Expense Modal */}
      <Modal visible={showAddExpenseModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowAddExpenseModal(false)}>
                <Text style={styles.modalCancel}>Annulla</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Nuova Spesa</Text>
              <TouchableOpacity onPress={handleAddExpense}>
                <Text style={styles.modalSave}>Aggiungi</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              <TextInput
                style={styles.input}
                placeholder="Titolo spesa (es: Cena ristorante)"
                value={expenseForm.title}
                onChangeText={(text) => setExpenseForm({...expenseForm, title: text})}
                maxLength={100}
              />
              
              <TextInput
                style={[styles.input, { height: 60 }]}
                placeholder="Descrizione (opzionale)"
                value={expenseForm.description}
                onChangeText={(text) => setExpenseForm({...expenseForm, description: text})}
                multiline
                maxLength={200}
              />
              
              <TextInput
                style={styles.input}
                placeholder="Importo totale pagato"
                value={expenseForm.totalAmount}
                onChangeText={(text) => setExpenseForm({...expenseForm, totalAmount: text})}
                keyboardType="numeric"
              />
              
              <TextInput
                style={styles.input}
                placeholder="Luogo (opzionale)"
                value={expenseForm.location}
                onChangeText={(text) => setExpenseForm({...expenseForm, location: text})}
                maxLength={100}
              />

              <Text style={styles.inputLabel}>Quanto ha consumato ogni persona?</Text>
              {activeGroup.group_members?.map((member) => (
                <View key={member.user_id} style={styles.memberExpenseInput}>
                  <Text style={styles.memberLabel}>
                    {member.profiles?.full_name || member.profiles?.email}
                    {member.user_id === user.id && ' (Tu)'}
                  </Text>
                  <TextInput
                    style={styles.amountInput}
                    placeholder="0.00"
                    value={expenseForm.shares[member.user_id] || ''}
                    onChangeText={(text) => setExpenseForm({
                      ...expenseForm,
                      shares: {
                        ...expenseForm.shares,
                        [member.user_id]: text
                      }
                    })}
                    keyboardType="numeric"
                  />
                  <Text style={styles.currencyLabel}>€</Text>
                </View>
              ))}

              <View style={styles.totalSection}>
                <Text style={styles.totalLabel}>
                  Totale consumato: {calculateTotalShares().toFixed(2)}€
                </Text>
                <Text style={styles.totalPaid}>
                  Importo pagato: {parseFloat(expenseForm.totalAmount || 0).toFixed(2)}€
                </Text>
              </View>

              <View style={styles.helpSection}>
                <Text style={styles.helpText}>
                  💡 <Text style={{fontWeight: 'bold'}}>Ricorda:</Text>
                  {'\n'}• Solo tu puoi aggiungere le TUE spese
                  {'\n'}• Inserisci l\'importo che HAI PAGATO
                  {'\n'}• Indica quanto ha consumato ogni persona
                  {'\n'}• I calcoli avvengono automaticamente!
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    backgroundColor: '#1976D2',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  groupCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  groupDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  groupAmount: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
    marginTop: 4,
  },
  groupRole: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  groupInfoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  groupInfoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  groupInfoDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  groupInfoStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  groupInfoStat: {
    fontSize: 14,
    color: '#666',
  },
  inviteButton: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  inviteButtonText: {
    color: '#1976D2',
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  addExpenseButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  balanceInfo: {
    flex: 1,
  },
  balanceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  balanceDetails: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  settlementCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  settlementText: {
    fontSize: 14,
    color: '#1976D2',
    textAlign: 'center',
    fontWeight: '500',
  },
  expenseCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  expenseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  expenseCreator: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  expenseDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  expenseLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  expenseDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  expenseShares: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
  },
  expenseSharesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  expenseShare: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  emptyExpenses: {
    padding: 32,
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    backgroundColor: '#f8f9fa',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalCancel: {
    fontSize: 16,
    color: '#666',
  },
  modalSave: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  modalLogout: {
    fontSize: 16,
    color: '#F44336',
    fontWeight: 'bold',
  },
  modalContent: {
    padding: 16,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  memberExpenseInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  memberLabel: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginRight: 8,
  },
  amountInput: {
    width: 80,
    textAlign: 'right',
    fontSize: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  currencyLabel: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  totalSection: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  totalPaid: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  helpSection: {
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  profileStats: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  statItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
};

export default SmartSplitApp;