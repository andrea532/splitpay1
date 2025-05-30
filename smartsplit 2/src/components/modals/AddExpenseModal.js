import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { styles } from '../../styles/globalStyles';

// Componente Picker per selezionare chi ha pagato
const PayerPicker = ({ members, selectedPayer, onPayerChange }) => {
  const [showPicker, setShowPicker] = useState(false);
  
  const selectedMember = members.find(m => m.id === selectedPayer);
  
  return (
    <View>
      <Text style={styles.pickerLabel}>Chi ha pagato la spesa?</Text>
      <TouchableOpacity
        style={styles.pickerContainer}
        onPress={() => setShowPicker(!showPicker)}
      >
        <View style={[styles.input, { marginBottom: 0, justifyContent: 'center' }]}>
          <Text style={{ color: selectedMember ? '#333' : '#999' }}>
            {selectedMember ? selectedMember.name : 'Seleziona chi ha pagato...'}
          </Text>
        </View>
      </TouchableOpacity>
      
      {showPicker && (
        <View style={{ backgroundColor: '#f8f9fa', borderRadius: 8, marginTop: 4 }}>
          {members.map(member => (
            <TouchableOpacity
              key={member.id}
              style={{
                padding: 12,
                borderBottomWidth: 1,
                borderBottomColor: '#eee',
                backgroundColor: selectedPayer === member.id ? '#e3f2fd' : 'transparent'
              }}
              onPress={() => {
                onPayerChange(member.id);
                setShowPicker(false);
              }}
            >
              <Text style={{
                color: selectedPayer === member.id ? '#1976d2' : '#333',
                fontWeight: selectedPayer === member.id ? 'bold' : 'normal'
              }}>
                {member.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const AddExpenseModal = ({ visible, group, onClose, onAddExpense }) => {
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [memberExpenses, setMemberExpenses] = useState({});

  // Reset form quando il modal si apre
  useEffect(() => {
    if (visible) {
      resetForm();
    }
  }, [visible, group]);

  const resetForm = () => {
    setDescription('');
    setLocation('');
    setTotalAmount('');
    setPaidBy(group.members.length > 0 ? group.members[0].id : '');
    
    // Inizializza le spese dei membri
    const initialExpenses = {};
    group.members.forEach(member => {
      initialExpenses[member.id] = '';
    });
    setMemberExpenses(initialExpenses);
  };

  const updateMemberExpense = (memberId, value) => {
    setMemberExpenses(prev => ({
      ...prev,
      [memberId]: value
    }));
  };

  const calculateTotalConsumed = () => {
    return Object.values(memberExpenses).reduce((sum, amount) => {
      const num = parseFloat(amount);
      return sum + (isNaN(num) ? 0 : num);
    }, 0);
  };

  const handleAddExpense = () => {
    // Validazioni
    if (!description.trim()) {
      Alert.alert('Errore', 'Inserisci una descrizione per la spesa');
      return;
    }

    const total = parseFloat(totalAmount);
    if (isNaN(total) || total <= 0) {
      Alert.alert('Errore', 'Inserisci un importo valido maggiore di 0');
      return;
    }

    if (!paidBy) {
      Alert.alert('Errore', 'Seleziona chi ha pagato la spesa');
      return;
    }

    // Verifica che almeno qualcuno abbia consumato
    const hasConsumers = Object.values(memberExpenses).some(amount => {
      const num = parseFloat(amount);
      return !isNaN(num) && num > 0;
    });

    if (!hasConsumers) {
      Alert.alert('Errore', 'Almeno una persona deve aver consumato qualcosa');
      return;
    }

    // Verifica che il totale consumato non superi quello pagato
    const totalConsumed = calculateTotalConsumed();
    if (totalConsumed > total) {
      Alert.alert(
        'Errore',
        `Il totale consumato (${totalConsumed.toFixed(2)}€) supera quello pagato (${total.toFixed(2)}€)`
      );
      return;
    }

    // Pulisci i dati prima di inviarli
    const cleanedMemberExpenses = {};
    Object.entries(memberExpenses).forEach(([memberId, amount]) => {
      const num = parseFloat(amount);
      if (!isNaN(num) && num > 0) {
        cleanedMemberExpenses[memberId] = num;
      }
    });

    const expenseData = {
      description: description.trim(),
      location: location.trim(),
      totalAmount: total,
      paidBy: paidBy,
      memberExpenses: cleanedMemberExpenses,
    };

    const result = onAddExpense(expenseData);
    if (result.success) {
      resetForm();
      onClose();
    } else {
      Alert.alert('Errore', result.error);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleClose}>
              <Text style={styles.modalCancel}>Annulla</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Nuova Spesa</Text>
            <TouchableOpacity onPress={handleAddExpense}>
              <Text style={styles.modalSave}>Aggiungi</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Descrizione */}
            <Text style={styles.inputLabel}>Descrizione della spesa</Text>
            <TextInput
              style={styles.input}
              placeholder="Es: Cena al ristorante, Spesa supermercato..."
              value={description}
              onChangeText={setDescription}
              maxLength={100}
            />

            {/* Luogo (opzionale) */}
            <Text style={styles.inputLabel}>Luogo (opzionale)</Text>
            <TextInput
              style={styles.input}
              placeholder="Es: Ristorante Da Mario, Esselunga..."
              value={location}
              onChangeText={setLocation}
              maxLength={50}
            />

            {/* Importo totale pagato */}
            <Text style={styles.inputLabel}>Importo totale pagato</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              value={totalAmount}
              onChangeText={setTotalAmount}
              keyboardType="numeric"
              maxLength={10}
            />

            {/* Chi ha pagato */}
            <PayerPicker
              members={group.members}
              selectedPayer={paidBy}
              onPayerChange={setPaidBy}
            />

            {/* Consumi individuali */}
            <Text style={styles.inputLabel}>
              Quanto ha consumato ogni persona?
            </Text>
            <Text style={styles.sectionSubtitle}>
              Inserisci solo l'importo per chi ha effettivamente consumato qualcosa
            </Text>

            {group.members.map((member) => (
              <View key={member.id} style={styles.memberExpenseInput}>
                <Text style={styles.memberLabel} numberOfLines={1}>
                  {member.name}
                  {member.id === paidBy && ' 💳'}
                </Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0.00"
                  value={memberExpenses[member.id] || ''}
                  onChangeText={(text) => updateMemberExpense(member.id, text)}
                  keyboardType="numeric"
                  maxLength={10}
                />
                <Text style={styles.currencyLabel}>€</Text>
              </View>
            ))}

            {/* Totali */}
            <View style={styles.totalSection}>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Importo pagato:</Text>
                <Text style={styles.statValue}>
                  {isNaN(parseFloat(totalAmount)) ? '0.00' : parseFloat(totalAmount).toFixed(2)}€
                </Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Totale consumato:</Text>
                <Text style={styles.statValue}>
                  {calculateTotalConsumed().toFixed(2)}€
                </Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Differenza:</Text>
                <Text style={[
                  styles.statValue,
                  { 
                    color: (parseFloat(totalAmount) || 0) >= calculateTotalConsumed() 
                      ? '#4CAF50' 
                      : '#F44336' 
                  }
                ]}>
                  {((parseFloat(totalAmount) || 0) - calculateTotalConsumed()).toFixed(2)}€
                </Text>
              </View>
            </View>

            {/* Spiegazione */}
            <View style={{ marginTop: 16, padding: 12, backgroundColor: '#f0f8ff', borderRadius: 8 }}>
              <Text style={styles.helpText}>
                💡 <Text style={{ fontWeight: 'bold' }}>Come funziona:</Text>
                {'\n'}• Chi paga ottiene un credito per l'importo totale
                {'\n'}• Chi consuma ha un debito per quello che ha consumato
                {'\n'}• Esempio: Marco paga 40€, Sara consuma 15€ → Sara deve 15€ a Marco
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default AddExpenseModal;