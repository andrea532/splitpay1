import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  Alert,
} from 'react-native';
import { styles } from '../../styles/globalStyles';
import { IconComponent } from '../../utils/icons';

const MembersModal = ({ visible, group, onClose, onAddMember, onRemoveMember }) => {
  const [newMemberName, setNewMemberName] = useState('');

  const handleAddMember = () => {
    const result = onAddMember(newMemberName);
    if (result.success) {
      setNewMemberName('');
    } else {
      Alert.alert('Errore', result.error);
    }
  };

  const handleClose = () => {
    setNewMemberName('');
    onClose();
  };

  const renderMemberItem = ({ item }) => (
    <View style={styles.memberItem}>
      <Text style={styles.memberName}>{item.name}</Text>
      <TouchableOpacity
        style={styles.removeMemberButton}
        onPress={() => onRemoveMember(item.id)}
      >
        <IconComponent name="remove" size={18} color="white" />
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleClose}>
              <Text style={styles.modalCancel}>Chiudi</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Gestisci Membri</Text>
            <View style={{ width: 50 }} />
          </View>
          
          <View style={styles.modalContent}>
            {/* Sezione Aggiungi Membro */}
            <Text style={styles.inputLabel}>Aggiungi nuovo membro</Text>
            <View style={styles.addMemberSection}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 8, marginBottom: 0 }]}
                placeholder="Nome del membro"
                value={newMemberName}
                onChangeText={setNewMemberName}
                maxLength={30}
                returnKeyType="done"
                onSubmitEditing={handleAddMember}
              />
              <TouchableOpacity style={styles.addMemberButton} onPress={handleAddMember}>
                <Text style={styles.addMemberButtonText}>Aggiungi</Text>
              </TouchableOpacity>
            </View>
            
            {/* Lista Membri */}
            <Text style={styles.inputLabel}>
              Membri del gruppo ({group.members.length})
            </Text>
            
            {group.members.length === 0 ? (
              <View style={styles.emptyMembers}>
                <IconComponent name="people-outline" size={40} color="#ccc" />
                <Text style={styles.emptyText}>Nessun membro aggiunto</Text>
                <Text style={styles.emptySubText}>
                  Aggiungi il primo membro per iniziare
                </Text>
              </View>
            ) : (
              <>
                <FlatList
                  data={group.members}
                  keyExtractor={(item) => item.id}
                  renderItem={renderMemberItem}
                  showsVerticalScrollIndicator={false}
                  style={{ maxHeight: 200 }}
                />
                <Text style={styles.helpText}>
                  💡 Tocca il pulsante - per rimuovere un membro
                </Text>
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default MembersModal;