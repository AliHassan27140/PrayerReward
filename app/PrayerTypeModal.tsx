import React from 'react';
import { Modal, View, Text, TouchableOpacity, TextInput, ActivityIndicator, StyleSheet } from 'react-native';

interface PrayerTypeModalProps {
  visible: boolean;
  onClose: () => void;
  onCreatePrayerType: (newPrayerType: string) => void;
  onSelectPrayerType: (prayerType: string) => void;
  availablePrayerTypes: string[];
  loadingCreate: boolean;
  newPrayerType: string;
  setNewPrayerType: (value: string) => void;
}

const PrayerTypeModal: React.FC<PrayerTypeModalProps> = ({
  visible,
  onClose,
  onCreatePrayerType,
  onSelectPrayerType,
  availablePrayerTypes,
  loadingCreate,
  newPrayerType,
  setNewPrayerType,
}) => {
  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Välj bön</Text>
          <Text style={styles.modalMessage}>Välj en bön eller skapa ett nytt böneämne.</Text>
          
          <View style={styles.formContainer}>
            {/* Character Count */}
            <View style={styles.characterCountContainer}>
              <Text style={styles.characterCount}>{15 - newPrayerType.length} tecken kvar</Text>
            </View>

            {/* TextInput for New Prayer Type */}
            <TextInput
              value={newPrayerType}
              onChangeText={setNewPrayerType}
              placeholder="Skriv nytt böneämne"
              style={styles.textInput}
              maxLength={15}
            />

            <TouchableOpacity
              style={[styles.button, styles.createButton]}
              onPress={() => onCreatePrayerType(newPrayerType)}
              disabled={loadingCreate}
            >
              {loadingCreate ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Spara</Text>
              )}
            </TouchableOpacity>

            {/* Predefined Prayer Types with Lines */}
            <View style={styles.line} />  {/* Top line */}
            <View style={styles.prayerButtonsContainer}>
              {[
                'Godmorgon ☀️', 
                'Godnatt 🌙', 
                'Hälsa 💚', 
                'Utmaningar 💪', 
                'Visdom 🦉', 
                'Tacksamhet 🌸',
                'Frid 🕊️',  
                'Kärlek ❤️',  
                'Hopp 🌟',  
                'Styrka 💪'
              ].map((prayerType) => (
                <TouchableOpacity
                  key={prayerType}
                  style={[styles.button, styles.primaryButton, styles.smallButton]}
                  onPress={() => onSelectPrayerType(prayerType)}
                >
                  <Text style={styles.buttonText}>{prayerType}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.line} />  {/* Bottom line */}

            {/* Cancel Button */}
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Avbryt</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: 320,
    backgroundColor: '#FAF3F3',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
    marginHorizontal: 30,
    marginTop: 50,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#3D1D47',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 14,
    color: '#6E5975',
    marginBottom: 24,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    width: '100%',
    paddingVertical: 12,
    marginBottom: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#8E44AD',
  },
  createButton: {
    backgroundColor: '#27AE60',
  },
  cancelButton: {
    backgroundColor: '#8E44AD',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  textInput: {
    width: '100%',
    padding: 12,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#9B59B6',
    backgroundColor: '#FAF6FF',
    fontSize: 14,
    color: '#3D1D47',
  },
  characterCountContainer: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  characterCount: {
    fontSize: 12,
    color: '#6E5975',
    textAlign: 'right',
  },
  prayerButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    width: '100%',
    marginBottom: 24,
  },
  smallButton: {
    width: 'auto',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 10,
    marginBottom: 10,
  },
  line: {
    width: '100%',
    height: 1,
    backgroundColor: '#ddd',  // Light grey color for the line
    marginVertical: 12,
  },
});

export default PrayerTypeModal;
