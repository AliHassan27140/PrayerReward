import AsyncStorage from '@react-native-async-storage/async-storage'; // Importera AsyncStorage
import { useRouter } from 'expo-router';
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import {
  Button,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Importera ikonbiblioteket
import { auth } from '../components/firebaseConfig.js';
import i18n from '../locales/i18n';
export default function AuthScreen() {
  const router = useRouter();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('test@hotmail.com');
  const [password, setPassword] = useState('abc123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State för att visa/dölja lösenord
  const [resetPasswordModalVisible, setResetPasswordModalVisible] = useState(false); // Modal state
  const [requestSentModalVisible, setRequestSentModalVisible] = useState(false); // Förfrågan skickad modal

  useEffect(() => {
    // Försök att ladda sparade användardata från AsyncStorage
    const loadUserData = async () => {
      try {
        const storedEmail = await AsyncStorage.getItem('email');
        const storedPassword = await AsyncStorage.getItem('password');
        if (storedEmail && storedPassword) {
          setEmail(storedEmail);
          setPassword(storedPassword);
        }
      } catch (e) {
        console.error('Error loading user data from AsyncStorage:', e);
      }
    };

    loadUserData();
  }, []);

  const handleAuth = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError(i18n.t('auth.errors.fillEmailPassword'));
      return;
    }
    setLoading(true);

    try {
      if (isLoginMode) {
        // Logga in
        await signInWithEmailAndPassword(auth, email.trim(), password);
        // Spara användarens e-post och lösenord om de loggar in
        await AsyncStorage.setItem('email', email.trim());
        await AsyncStorage.setItem('password', password);
      } else {
        // Registrera nytt konto
        await createUserWithEmailAndPassword(auth, email.trim(), password);
        // Spara användarens e-post och lösenord efter registrering
        await AsyncStorage.setItem('email', email.trim());
        await AsyncStorage.setItem('password', password);
      }
      // Navigera alltid till /home efter inloggning
      router.replace('/home');  // Detta navigerar till hem-sidan direkt efter lyckad inloggning
    } catch (err: any) {
      const code = err.code as string;
     switch (code) {
      case 'auth/user-not-found':
        setError(i18n.t('auth.errors.userNotFound'));
        break;
      case 'auth/wrong-password':
        setError(i18n.t('auth.errors.wrongPassword'));
        break;
      case 'auth/email-already-in-use':
        setError(i18n.t('auth.errors.emailInUse'));
        break;
      case 'auth/invalid-email':
        setError(i18n.t('auth.errors.invalidEmail'));
        break;
      case 'auth/weak-password':
        setError(i18n.t('auth.errors.weakPassword'));
        break;
      default:
        setError(err.message);
    }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email.trim()) {
   setError(i18n.t('auth.errors.enterEmailForReset'));
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setRequestSentModalVisible(true); // Visa förfrågan skickad modal
      setResetPasswordModalVisible(false); // Stäng återställningsmodalen
    } catch (err: any) {
     setError(i18n.t('auth.errors.resetFailed'));
    }
  };

  return (
    <KeyboardAvoidingView
  style={styles.container}
  behavior={Platform.select({ ios: 'padding', android: undefined })}
>
  <Text style={styles.title}>
    {isLoginMode
      ? i18n.t('auth.login')
      : i18n.t('auth.registerAccount')}
  </Text>

  {error && <Text style={styles.error}>{error}</Text>}

  <TextInput
    style={styles.input}
    placeholder={i18n.t('auth.emailPlaceholder')}
    keyboardType="email-address"
    autoCapitalize="none"
    value={email}
    onChangeText={setEmail}
  />
  <View style={styles.passwordContainer}>
    <TextInput
      style={styles.input}
      placeholder={i18n.t('auth.passwordPlaceholder')}
      secureTextEntry={!showPassword}
      value={password}
      onChangeText={setPassword}
    />
    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
      <Icon name={showPassword ? 'visibility' : 'visibility-off'} size={24} color="#34495E" />
    </TouchableOpacity>
  </View>

  <View style={styles.button}>
    <Button
      title={
        loading
          ? isLoginMode
            ? i18n.t('auth.loggingIn')
            : i18n.t('auth.creatingAccount')
          : isLoginMode
          ? i18n.t('auth.loginButton')
          : i18n.t('auth.registerButton')
      }
      onPress={handleAuth}
      disabled={loading}
    />
  </View>

  {isLoginMode && (
    <TouchableOpacity onPress={() => setResetPasswordModalVisible(true)} style={styles.forgotPassword}>
      <Text style={styles.forgotPasswordText}>{i18n.t('auth.forgotPassword')}</Text>
    </TouchableOpacity>
  )}

  <TouchableOpacity
    style={styles.switch}
    onPress={() => {
      setIsLoginMode(m => !m);
      setError(null);
    }}
  >
    <Text style={styles.switchText}>
      {isLoginMode
        ? i18n.t('auth.noAccount')
        : i18n.t('auth.alreadyMember')}
    </Text>
  </TouchableOpacity>

  {/* Modal for reset password */}
  <Modal
    transparent={true}
    animationType="fade"
    visible={resetPasswordModalVisible}
    onRequestClose={() => setResetPasswordModalVisible(false)}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>{i18n.t('auth.resetPasswordTitle')}</Text>
        <Text style={styles.modalDescription}>{i18n.t('auth.resetPasswordDescription')}</Text>
        <TextInput
          style={styles.input}
          placeholder={i18n.t('auth.emailPlaceholder')}
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        {error && <Text style={styles.error}>{error}</Text>}
        <View style={styles.modalButton}>
          <Button title={i18n.t('auth.sendResetLinkButton')} onPress={handlePasswordReset} />
        </View>
        <TouchableOpacity onPress={() => setResetPasswordModalVisible(false)} style={styles.closeModalButton}>
          <Text style={styles.closeModalButtonText}>{i18n.t('auth.closeButton')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>

  {/* Modal for request sent */}
  <Modal
    transparent={true}
    animationType="fade"
    visible={requestSentModalVisible}
    onRequestClose={() => setRequestSentModalVisible(false)}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>{i18n.t('auth.requestSentTitle')}</Text>
        <Text style={styles.modalDescription}>{i18n.t('auth.requestSentDescription')}</Text>
        <TouchableOpacity onPress={() => setRequestSentModalVisible(false)} style={styles.closeModalButton}>
          <Text style={styles.closeModalButtonText}>{i18n.t('auth.closeButton')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
</KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#9B59B6',  // Purple background color to match the theme
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
    color: '#F5E6D9',  // Light text color for contrast
  },
  error: {
    color: 'red',
    marginBottom: 12,
    textAlign: 'center',
  },
  input: {
    height: 48,
    borderColor: '#F5E6D9',  // Light color border to contrast with the purple background
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
    color: '#34495E',  // Dark grey text for input fields
  },
  button: {
    marginTop: 8,
    backgroundColor: '#9B59B6',  // Button background in purple
    borderRadius: 12,
    overflow: 'hidden',
  },
  switch: {
    marginTop: 16,
    alignItems: 'center',
  },
  switchText: {
    color: '#F5E6D9',  // Light text for the switch
    fontWeight: '600',
  },
  forgotPassword: {
    marginTop: 12,
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: '#F5E6D9',  // Light text for the "forgot password" link
    fontWeight: '600',
  },
  passwordContainer: {
    position: 'relative',
  },
  eyeIcon: {
    position: 'absolute',
    right: 10,
    top: 12,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',  // Transparent background overlay
  },
  modalContent: {
    width: 320,
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 10,  // Shadow effect for Android
    shadowColor: '#000',  // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 10,
    color: '#9B59B6',  // Matching title color
  },
  modalDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#34495E',
  },
  modalButton: {
    width: '100%',
    marginBottom: 12,
  },
  closeModalButton: {
    marginTop: 10,
  },
  closeModalButtonText: {
    color: '#9B59B6',
    fontWeight: '600',
  },
});
