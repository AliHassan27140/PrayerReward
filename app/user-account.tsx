import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useRouter } from 'expo-router';
import { sendPasswordResetEmail } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Button } from 'react-native';
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
  const [deletionSuccessModalVisible, setDeletionSuccessModalVisible] = useState(false);

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
          setDeletionSuccessModalVisible(true); // Show the success modal
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
      {/* Back Button and Header Together */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={30} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.header}>Användarkonto</Text>
      </View>

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
      </ScrollView>

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

            {/* icke-redigerbar TextInput */}
            <TextInput
              style={styles.emailInput}
              value={email}
              editable={false}  // Gör fältet icke-redigerbart
              selectTextOnFocus={false}  // Hindrar text från att markeras vid fokus
            />

            {error && <Text style={styles.error}>{error}</Text>}
            <TouchableOpacity style={styles.primaryButton} onPress={handlePasswordReset}>
              <Text style={styles.buttonText}>Skicka länk för återställning</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setResetPasswordModalVisible(false)} style={styles.closeModalButton}>
              <Text style={styles.closeModalButtonText}>Stäng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal for request sent confirmation */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={requestSentModalVisible}
        onRequestClose={() => setRequestSentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Återställningskod skickad</Text>
            <Text style={styles.successMessage}>En återställningslänk har skickats till din e-postadress.</Text>
            <TouchableOpacity onPress={() => setRequestSentModalVisible(false)} style={styles.closeModalButton}>
              <Text style={styles.closeModalButtonText}>Stäng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal for Account Deletion Success */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={deletionSuccessModalVisible}
        onRequestClose={() => setDeletionSuccessModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Raderingen lyckades!</Text>
            <Text style={styles.successMessage}>Ditt konto och all din data har raderats permanent.</Text>
            <TouchableOpacity
              onPress={() => {
                setDeletionSuccessModalVisible(false);
                router.replace('/');  // Navigate to login screen
              }}
              style={styles.closeModalButton}
            >
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
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
        }}>
          <View style={{
            backgroundColor: '#FFF',
            padding: 25,
            borderRadius: 20,
            width: 320,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 8,
          }}>
            <Text style={{
              fontSize: 24,
              fontWeight: '700',
              color: '#9B59B6',
              marginBottom: 25,
              textAlign: 'center',
            }}>
              Bekräfta Radering
            </Text>

            <TextInput
              style={{
                height: 55,
                borderColor: '#9B59B6',
                borderWidth: 1.5,
                borderRadius: 12,
                paddingHorizontal: 15,
                marginBottom: 25,
                backgroundColor: '#F5F5F5',
                color: '#34495E',
                fontSize: 16,
                textAlign: 'center',
              }}
              placeholder="Bekräfta din e-postadress"
              value={emailInput}
              onChangeText={setEmailInput}
              autoCapitalize="none"
            />

            <Text style={{
              fontSize: 16,
              color: '#E74C3C',
              textAlign: 'center',
              fontWeight: '600',
              marginBottom: 10,
            }}>
              All din data kommer att raderas permanent, inklusive:
            </Text>
            
            <Text style={{
              fontSize: 16,
              color: '#34495E',
              marginLeft: 0,
              marginBottom: 7,
              textAlign: 'left',
            }}>
              • Böner
            </Text>
            <Text style={{
              fontSize: 16,
              color: '#34495E',
              marginLeft: 0,
              marginBottom: 7,
              textAlign: 'left',
            }}>
              • Böner tider
            </Text>
            <Text style={{
              fontSize: 16,
              color: '#34495E',
              marginLeft: 0,
              marginBottom: 7,
              textAlign: 'left',
            }}>
              • Personlig information
            </Text>
            <Text style={{
              fontSize: 16,
              color: '#34495E',
              marginLeft: 0,
              marginBottom: 7,
              textAlign: 'left',
            }}>
              • All annan sparad data
            </Text>

            <Text style={{
              fontSize: 16,
              color: '#E74C3C',
              textAlign: 'center',
              fontWeight: '600',
              marginBottom: 20,
            }}>
              Det går inte att återställa någon av dessa uppgifter.
            </Text>

            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              width: '85%',
              marginTop: 25,
            }}>
              <TouchableOpacity 
                onPress={() => setIsModalVisible(false)} 
                style={{
                  backgroundColor: '#717578ff',
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  borderRadius: 8,
                  width: '45%',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{
                  color: '#FFF',
                  fontWeight: '600',
                  fontSize: 16,
                  textAlign: 'center',
                }}>
                  Avbryt
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={confirmDeleteAccount} 
                style={{
                  backgroundColor: emailInput === userData.email ? '#d9000bff' : '#cc8a8eff', // Change color when disabled
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  borderRadius: 8,
                  width: '45%',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                disabled={emailInput !== userData.email} // Disable the button if email doesn't match
              >
                <Text style={{
                  color: '#FFF',
                  fontWeight: '600',
                  fontSize: 16,
                  textAlign: 'center',
                }}>
                  Radera konto
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
    paddingHorizontal: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    zIndex: 10,
  },
  header: {
    fontSize: 22,
    fontWeight: '600',
    color: '#F5E6D9',
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
  primaryButton: {
    backgroundColor: '#9B59B6',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: -5,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 15,
    width: 320,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20,
    color: '#9B59B6',
  },
  emailInput: {
    height: 50,
    borderColor: '#9B59B6',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 20,
    backgroundColor: '#F5F5F5',
    color: '#34495E',
    fontSize: 16,
    textAlign: 'center',
  },
  input: {
    height: 50,
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
    color: '#717578ff',
    fontWeight: '600',
    marginTop: 30,
  },
  successMessage: {
    fontSize: 16,
    color: '#28A745',
    textAlign: 'center',
    marginBottom: 20,
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
