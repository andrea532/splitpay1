import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { styles } from '../../styles/globalStyles';

const CreateGroupModal = ({ visible, onClose, onCreateGroup }) => {
  const [groupName, setGroupName] = useState('');

  const handleCreate = () => {
    const result = onCreateGroup(groupName);
    if (result) {
      setGroupName('');
      onClose();
    }
  };

  const handleClose = () => {
    setGroupName('');
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
            <Text style={styles.modalTitle}>Nuovo Gruppo</Text>
            <TouchableOpacity onPress={handleCreate}>
              <Text style={styles.modalSave}>Crea</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <Text style={styles.inputLabel}>Nome del gruppo</Text>
            <TextInput
              style={styles.input}
              placeholder="Es: Vacanza 2025, Coinquilini, Cena amici..."
              value={groupName}
              onChangeText={setGroupName}
              autoFocus
              maxLength={50}
              returnKeyType="done"
              onSubmitEditing={handleCreate}
            />
            
            <Text style={styles.helpText}>
              💡 Scegli un nome che descriva il gruppo o l'occasione
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CreateGroupModal;