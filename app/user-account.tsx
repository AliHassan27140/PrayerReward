import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useRouter } from 'expo-router';
import { sendPasswordResetEmail } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { Alert, Button, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth } from '../components/firebaseConfig';

type RootStackParamList = {
  UserAccount: undefined;
  Index: undefined;
};

type UserAccountScreenNavigationProp = StackNavigationProp<RootStackParamList, 'UserAccount'>;

const UserAccountScreen = () => {
  const router = useRouter();
  const navigation = useNavigation<UserAccountScreenNavigationProp>();

  const [userData, setUserData] = useState({
    email: '',
    creationDate: '',
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [resetPasswordModalVisible, setResetPasswordModalVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [requestSentModalVisible, setRequestSentModalVisible] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const email = user.email || '';
      const creationTime = user.metadata.creationTime
        ? new Date(user.metadata.creationTime).toLocaleDateString()
        : '';
      setUserData({
        email,
        creationDate: creationTime,
      });
      setEmail(email);
    }
  }, []);

  const handlePasswordReset = async () => {
    if (!email.trim()) {
      setError('Vänligen ange din e-postadress');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setRequestSentModalVisible(true);
      setResetPasswordModalVisible(false);
    } catch (err: any) {
      setError('Något gick fel. Kontrollera din e-postadress.');
    }
  };

  const handleDeleteAccount = () => {
    setIsModalVisible(true);
  };

  const confirmDeleteAccount = () => {
    const user = auth.currentUser;
    if (user && emailInput === user.email) {
      user.delete()
        .then(() => {
          Alert.alert(
            'Kontot raderat!',
            'Ditt konto och all din data har raderats permanent. Du kommer inte att kunna återställa denna information.'
          );
          navigation.navigate('Index');
        })
        .catch((error) => {
          Alert.alert('Fel', 'Det gick inte att radera kontot: ' + error.message);
        });
    } else {
      Alert.alert('Fel', 'E-postadressen stämmer inte.');
    }
    setIsModalVisible(false);
    setEmailInput('');
  };

  const navigateTo = (path: '/user-account' | '/terms' | '/change-language' | '/contact-us') => {
    router.push(path);
  };

  return (
    <View style={[styles.container, { backgroundColor: '#522f60ff' }]}>
      {/* Back Button */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={30} color="#FFF" />
      </TouchableOpacity>

      <Text style={styles.header}>Användarkonto</Text>

      <ScrollView contentContainerStyle={styles.menuContainer}>
        {/* User Info Section */}
        <Text style={styles.sectionTitle}>ANVÄNDARINFO</Text>
        <View style={styles.menuItem}>
          <Ionicons name="person-circle-outline" size={24} color="#F5E6D9" />
          <Text style={styles.menuText}>E-post: {userData.email}</Text>
        </View>
        <View style={styles.menuItem}>
          <Ionicons name="calendar-outline" size={24} color="#F5E6D9" />
          <Text style={styles.menuText}>Registrerad: {userData.creationDate}</Text>
        </View>

        {/* Reset Password Section */}
        <Text style={styles.sectionTitle}>ÅTERSTÄLL LÖSENORD</Text>
        <TouchableOpacity style={styles.menuItem} onPress={() => setResetPasswordModalVisible(true)}>
          <Ionicons name="key-outline" size={24} color="#F5E6D9" />
          <Text style={styles.menuText}>Återställ lösenord</Text>
        </TouchableOpacity>

        {/* Delete Account Section */}
        <Text style={styles.sectionTitle}>RADERA KONTO</Text>
        <TouchableOpacity style={styles.menuItem} onPress={handleDeleteAccount}>
          <Ionicons name="trash-outline" size={24} color="#F5E6D9" />
          <Text style={styles.menuText}>Radera konto</Text>
        </TouchableOpacity>

        {/* Modal for Password Reset */}
        <Modal
          transparent={true}
          animationType="fade"
          visible={resetPasswordModalVisible}
          onRequestClose={() => setResetPasswordModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Återställ lösenord</Text>
              <TextInput
                style={styles.input}
                placeholder="Din e‑postadress"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
              {error && <Text style={styles.error}>{error}</Text>}
              <Button title="Skicka länk för återställning" onPress={handlePasswordReset} />
              <TouchableOpacity onPress={() => setResetPasswordModalVisible(false)} style={styles.closeModalButton}>
                <Text style={styles.closeModalButtonText}>Stäng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal for Confirming Account Deletion */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Bekräfta Radering</Text>
              <TextInput
                style={styles.input}
                placeholder="Skriv din e-postadress för att bekräfta"
                value={emailInput}
                onChangeText={setEmailInput}
                autoCapitalize="none"
              />
              <Text style={styles.warningText}>
                All din data kommer att raderas permanent, inklusive:
              </Text>
              <Text style={styles.bulletPoint}>• Böner</Text>
              <Text style={styles.bulletPoint}>• Böner tider</Text>
              <Text style={styles.bulletPoint}>• Personlig information</Text>
              <Text style={styles.bulletPoint}>• All annan sparad data</Text>
              <Text style={styles.warningText}>Det går inte att återställa någon av dessa uppgifter.</Text>
              <View style={styles.modalButtonsContainer}>
                <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.cancelButton}>
                  <Text style={styles.buttonText}>Avbryt</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={confirmDeleteAccount} style={styles.deleteButtonModal}>
                  <Text style={styles.buttonText}>Radera konto</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>

      {/* Footer Section */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Gjort med ❤️ av Reactcap</Text>
        <View style={styles.socialLinks}>
          <Ionicons name="logo-instagram" size={24} color="#F5E6D9" />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: '600',
    color: '#F5E6D9',
    marginTop: 56,
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#F5E6D9',
    marginVertical: 10,
  },
  menuContainer: {
    paddingTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: '#6a4b8d',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  menuText: {
    fontSize: 16,
    marginLeft: 15,
    color: '#F5E6D9',
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#D1D1D1',
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#F5E6D9',
    textAlign: 'center',
    marginBottom: 10,
  },
  socialLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  deleteButtonModal: {
    backgroundColor: '#D32F2F',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },

  // Back Button Styles
  backButton: {
    position: 'absolute',
    top: 69, 
    left: 20, 
    zIndex: 20, 
    backgroundColor: '#9B59B6', 
    borderRadius: 50, 
    width: 52,  
    height: 52, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 0,  
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
  },
  modalContainer: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 10,
    width: 320,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 10,
    color: '#9B59B6',
  },
  modalDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#34495E',
  },
  input: {
    height: 48,
    borderColor: '#F5E6D9',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
    color: '#34495E',
  },
  error: {
    color: 'red',
    marginBottom: 12,
    textAlign: 'center',
  },
  closeModalButton: {
    marginTop: 10,
  },
  closeModalButtonText: {
    color: '#9B59B6',
    fontWeight: '600',
  },
  warningText: {
    fontSize: 16,
    color: '#D32F2F',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  bulletPoint: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
    marginBottom: 5,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: 20,
  },
});

export default UserAccountScreen;
