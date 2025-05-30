import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { styles } from '../styles/globalStyles';
import { IconComponent } from '../utils/icons';
import CreateGroupModal from './modals/CreateGroupModal';

const GroupsList = ({ groups, onSelectGroup, onUpdateGroups }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const createGroup = (groupName) => {
    if (!groupName.trim()) {
      Alert.alert('Errore', 'Inserisci un nome per il gruppo');
      return false;
    }

    if (groups.some(group => group.name.toLowerCase() === groupName.toLowerCase())) {
      Alert.alert('Errore', 'Esiste già un gruppo con questo nome');
      return false;
    }

    const newGroup = {
      id: Date.now().toString(),
      name: groupName.trim(),
      members: [],
      expenses: [],
      createdAt: new Date().toISOString(),
    };

    const updatedGroups = [...groups, newGroup];
    onUpdateGroups(updatedGroups);
    return true;
  };

  const deleteGroup = (groupId) => {
    const group = groups.find(g => g.id === groupId);
    Alert.alert(
      'Elimina Gruppo',
      `Sei sicuro di voler eliminare "${group.name}"?\nTutti i dati verranno persi.`,
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: () => {
            const updatedGroups = groups.filter(g => g.id !== groupId);
            onUpdateGroups(updatedGroups);
          }
        }
      ]
    );
  };

  const renderGroupCard = ({ item }) => {
    const totalAmount = item.expenses.reduce((sum, expense) => sum + expense.totalAmount, 0);
    
    return (
      <TouchableOpacity
        style={styles.groupCard}
        onPress={() => onSelectGroup(item)}
        onLongPress={() => deleteGroup(item.id)}
      >
        <View style={styles.groupInfo}>
          <Text style={styles.groupName}>{item.name}</Text>
          <Text style={styles.groupDetails}>
            {item.members.length} membri • {item.expenses.length} spese
          </Text>
          {totalAmount > 0 && (
            <Text style={styles.groupAmount}>
              Totale: {totalAmount.toFixed(2)}€
            </Text>
          )}
        </View>
        <IconComponent name="chevron-forward" size={20} color="#666" />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2196F3" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SmartSplit</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
        >
          <IconComponent name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {groups.length === 0 ? (
          <View style={styles.emptyState}>
            <IconComponent name="people-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>Nessun gruppo creato</Text>
            <Text style={styles.emptySubText}>
              Tocca + per creare il tuo primo gruppo
            </Text>
            <TouchableOpacity
              style={styles.createFirstGroupButton}
              onPress={() => setShowCreateModal(true)}
            >
              <Text style={styles.createFirstGroupButtonText}>
                Crea il tuo primo gruppo
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>I tuoi gruppi</Text>
            <FlatList
              data={groups}
              keyExtractor={(item) => item.id}
              renderItem={renderGroupCard}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
            <Text style={styles.helpText}>
              💡 Tieni premuto su un gruppo per eliminarlo
            </Text>
          </>
        )}
      </View>

      {/* Modal Creazione Gruppo */}
      <CreateGroupModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateGroup={createGroup}
      />
    </SafeAreaView>
  );
};

export default GroupsList;