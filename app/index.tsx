import React, { useEffect, useState } from 'react';
import { Image, KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../components/firebaseConfig.js';
import i18n from '../locales/i18n';

export default function AuthScreen() {
  const router = useRouter();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('test@hotmail.com');
  const [password, setPassword] = useState('abc123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetPasswordModalVisible, setResetPasswordModalVisible] = useState(false);
  const [requestSentModalVisible, setRequestSentModalVisible] = useState(false);

  useEffect(() => {
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
        await signInWithEmailAndPassword(auth, email.trim(), password);
        await AsyncStorage.setItem('email', email.trim());
        await AsyncStorage.setItem('password', password);
      } else {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
        await AsyncStorage.setItem('email', email.trim());
        await AsyncStorage.setItem('password', password);
      }
      router.replace('/home');
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
      setRequestSentModalVisible(true);
      setResetPasswordModalVisible(false);
    } catch (err: any) {
      setError(i18n.t('auth.errors.resetFailed'));
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.select({ ios: 'padding', android: undefined })}>
      <Image source={require('../assets/images/Icon2no.png')} style={styles.logo} />
      <Text style={styles.hayyeText}>HAYYE</Text>
      <Text style={styles.title}>
        {isLoginMode ? i18n.t('auth.login') : i18n.t('auth.registerAccount')}
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

      {/* Custom Login Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleAuth}
        disabled={loading}  // Disable button while loading
      >
        <Text style={styles.buttonText}>
          {loading
            ? isLoginMode
              ? i18n.t('auth.loggingIn')
              : i18n.t('auth.creatingAccount')
            : isLoginMode
            ? i18n.t('auth.loginButton')
            : i18n.t('auth.registerButton')}
        </Text>
      </TouchableOpacity>

      {isLoginMode && (
        <TouchableOpacity onPress={() => setResetPasswordModalVisible(true)} style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>{i18n.t('auth.forgotPassword')}</Text>
        </TouchableOpacity>
      )}
<View style={styles.footerContainer}>
  <TouchableOpacity
    onPress={() => {
      setIsLoginMode(m => !m); // Växla mellan inloggning och registrering
      setError(null); // Rensa eventuella felmeddelanden
      }}
  >
    <Text style={styles.switchText}>
      {isLoginMode ? i18n.t('auth.noAccount') : i18n.t('auth.alreadyMember')}
    </Text>
  </TouchableOpacity>
</View>




      {/* Modal for reset password */}
      <Modal transparent={true} animationType="fade" visible={resetPasswordModalVisible} onRequestClose={() => setResetPasswordModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{i18n.t('auth.resetPasswordTitle')}</Text>
            <Text style={styles.modalDescription}>{i18n.t('auth.resetPasswordDescription')}</Text>
            <TextInput
              style={styles.emailInput}
              placeholder={i18n.t('auth.emailPlaceholder')}
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            {error && <Text style={styles.error}>{error}</Text>}
            <TouchableOpacity style={styles.primaryButton} onPress={handlePasswordReset}>
              <Text style={styles.buttonText}>{i18n.t('auth.sendResetLinkButton')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setResetPasswordModalVisible(false)} style={styles.closeModalButton}>
              <Text style={styles.closeModalButtonText}>{i18n.t('auth.closeButton')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal for request sent */}
      <Modal transparent={true} animationType="fade" visible={requestSentModalVisible} onRequestClose={() => setRequestSentModalVisible(false)}>
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
    justifyContent: 'flex-start',
    paddingHorizontal: 24,
    backgroundColor: '#8E44AD',
    paddingTop: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 24,
    marginLeft: 0,
    textAlign: 'left',
    color: '#F5E6D9',
  },
  error: {
    color: 'red',
    marginBottom: 12,
    textAlign: 'center',
  },
  input: {
    height: 48,
    borderColor: '#F5E6D9',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 20,
    backgroundColor: '#fff',
    color: '#34495E',
    marginTop: -10,
  },
  button: {
    marginTop: -5,
    backgroundColor: '#9B59B6',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 40,
    width: '100%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  switch: {
    marginTop: 10,
    alignItems: 'center',
  },
  
  forgotPassword: {
    marginTop: 20,  
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: '#F5E6D9',
    fontWeight: '600',
    fontSize: 13,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  footerContainer: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#9B59B6',  // Bakgrundsfärg för hela containern
    paddingVertical: 12,  // Vertikal padding för att ge lite höjd till bakgrunden
    borderRadius: 25,  // Rundade hörn för bakgrunden
    elevation: 5,  // 3D-effekt för Android
    shadowColor: '#000',  // Skugga för iOS
    shadowOffset: { width: 0, height: 4 },  // Skuggans position
    shadowOpacity: 0.3,  // Skuggans intensitet
    shadowRadius: 5,  // Skuggans spridning
     right: '7%',
  },
  
  switchText: {
    color: '#F5E6D9',  // Textfärg
    fontWeight: '600',  // Fet stil
    fontSize: 16,  // Textstorlek
    textAlign: 'center',  // Centrerad text
    textTransform: 'uppercase',  // Versaler
    letterSpacing: 1.5,  // Mellanrum mellan bokstäver
    paddingHorizontal: 40,  // Padding så texten inte är för nära kanten
    paddingVertical: 12,  // Padding för att göra hela ytan klickbar
    
  },
  passwordContainer: {
    position: 'relative',
  },
  eyeIcon: {
    position: 'absolute',
    right: 10,
    top: 2,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 320,
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
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
    color: '#28A745',
  },
  primaryButton: {
    backgroundColor: '#9B59B6',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: -5,
  },
  closeModalButton: {
    marginTop: 10,
  },
  closeModalButtonText: {
    color: '#717578ff',
    fontWeight: '600',
    marginTop: 30,
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
  logo: {
    width: 300,
    height: 300,
    alignSelf: 'center',
    marginBottom: 10,
  },
hayyeText: {
  fontSize: 24,
  fontWeight: 'bold',
  color: '#F5E6D9',
  textAlign: 'center',
  position: 'absolute', // Placera texten absolut
  top: 255, // Justera värdet här för att flytta texten upp
  left: '50%', // Centrera texten horisontellt
  marginLeft: -15, // Justera denna för att flytta texten exakt i mitten
}


});
