import { useRouter } from 'expo-router';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, Keyboard, Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { LocaleConfig } from 'react-native-calendars';
import { auth, firestore } from '../components/firebaseConfig';
import { languageEvents } from '../hooks/languageEvents';
import i18n, { setAppLanguage } from '../locales/i18n';
import Icon from 'react-native-vector-icons/FontAwesome'; // Import FontAwesome
import { useRewardSystem } from '../hooks/useRewardSystem';
import ManualInputModal from './ManualInputModal'; // Adjust the path as needed
import SupportModal from './SupportModal'; // Adjust the path as needed

export default function HomeScreen() {
  const router = useRouter();
  const [timer, setTimer] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [intervalId, setIntervalId] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [manualModalVisible, setManualModalVisible] = useState<boolean>(false);
  const [scaleValue] = useState(new Animated.Value(1));
  const [shadowOffset, setShadowOffset] = useState({ width: 0, height: 10 });
  const [isSaving, setIsSaving] = useState(false);
  
  const { totalPoints, currentLevel, unlockedLevels, hasLevelUp, clearLevelUpNotification } = useRewardSystem();

  const [supportModalVisible, setSupportModalVisible] = useState<boolean>(false);
  const [manualDate, setManualDate] = useState<string>('');
  const [manualHours, setManualHours] = useState<string>('');
  const [manualMinutes, setManualMinutes] = useState<string>('');
  const [manualSeconds, setManualSeconds] = useState<string>('');
  const [language, setLanguage] = React.useState(i18n.locale || 'en');
  const [lightningScale] = useState(new Animated.Value(1));
  const [vibrationInterval, setVibrationInterval] = useState<ReturnType<typeof setInterval> | null>(null);
  
  useEffect(() => {
    console.log('Vibration effect - hasLevelUp:', hasLevelUp);
    if (hasLevelUp) {
      const startVibration = () => {
        Animated.sequence([
          Animated.timing(lightningScale, {
            toValue: 1.2,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(lightningScale, {
            toValue: 0.9,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(lightningScale, {
            toValue: 1.1,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(lightningScale, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      };

      startVibration();
      const interval = setInterval(startVibration, 3000);
      setVibrationInterval(interval);
    } else {
      if (vibrationInterval) {
        clearInterval(vibrationInterval);
        setVibrationInterval(null);
      }
    }

    return () => {
      if (vibrationInterval) {
        clearInterval(vibrationInterval);
      }
    };
  }, [hasLevelUp, lightningScale]);

  useEffect(() => {
    configureCalendarLocale(language);
    LocaleConfig.defaultLocale = language;
  }, [language]);

  const configureCalendarLocale = (lang: string) => {
    // Locale Configuration based on i18n
    LocaleConfig.locales[lang] = {
      monthNames: [
        i18n.t('calendar.months.january'),
        i18n.t('calendar.months.february'),
        i18n.t('calendar.months.march'),
        i18n.t('calendar.months.april'),
        i18n.t('calendar.months.may'),
        i18n.t('calendar.months.june'),
        i18n.t('calendar.months.july'),
        i18n.t('calendar.months.august'),
        i18n.t('calendar.months.september'),
        i18n.t('calendar.months.october'),
        i18n.t('calendar.months.november'),
        i18n.t('calendar.months.december'),
      ],
      monthNamesShort: [
        i18n.t('calendar.monthsShort.jan'),
        i18n.t('calendar.monthsShort.feb'),
        i18n.t('calendar.monthsShort.mar'),
        i18n.t('calendar.monthsShort.apr'),
        i18n.t('calendar.monthsShort.may'),
        i18n.t('calendar.monthsShort.jun'),
        i18n.t('calendar.monthsShort.jul'),
        i18n.t('calendar.monthsShort.aug'),
        i18n.t('calendar.monthsShort.sep'),
        i18n.t('calendar.monthsShort.oct'),
        i18n.t('calendar.monthsShort.nov'),
        i18n.t('calendar.monthsShort.dec'),
      ],
      dayNames: [
        i18n.t('calendar.days.sunday'),
        i18n.t('calendar.days.monday'),
        i18n.t('calendar.days.tuesday'),
        i18n.t('calendar.days.wednesday'),
        i18n.t('calendar.days.thursday'),
        i18n.t('calendar.days.friday'),
        i18n.t('calendar.days.saturday'),
      ],
      dayNamesShort: [
        i18n.t('calendar.daysShort.sun'),
        i18n.t('calendar.daysShort.mon'),
        i18n.t('calendar.daysShort.tue'),
        i18n.t('calendar.daysShort.wed'),
        i18n.t('calendar.daysShort.thu'),
        i18n.t('calendar.daysShort.fri'),
        i18n.t('calendar.daysShort.sat'),
      ],
      today: i18n.t('calendar.today'),
    };
    LocaleConfig.defaultLocale = lang;
  };

  useEffect(() => {
    const listener = async (newLang: string) => {
      await setAppLanguage(newLang);
      setLanguage(newLang);
    };
    languageEvents.on('languageChanged', listener);
    return () => {
      languageEvents.off('languageChanged', listener);
    };
  }, []);

  const getTodayDate = (): string => {
    const today = new Date();
    return today.getFullYear() + '-' + (today.getMonth() + 1).toString().padStart(2, '0') + '-' + today.getDate().toString().padStart(2, '0');
  };

  const toggleTimer = () => {
    if (isRunning) {
      clearInterval(intervalId);
      setIntervalId(null);
      setModalVisible(true);
    } else {
      const id = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
      setIntervalId(id);
    }
    setIsRunning(!isRunning);
  };

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleSavePrayerTime = async () => {
    if (isSaving) return;
    setIsSaving(true);
    const prayerDuration = timer;
    const userId = auth.currentUser?.uid;
    const date = getTodayDate();
    const savedAt = Timestamp.now();

    if (!userId) {
      setIsSaving(false);
      return;
    }

    try {
      const prayerId = savedAt.toMillis().toString();
      const userDocRef = doc(firestore, 'users', userId, 'prayerTimes', prayerId);
      await setDoc(userDocRef, {
        date: date,
        durationInSeconds: prayerDuration,
        durationFormatted: formatTime(prayerDuration),
        timestamp: savedAt,
        prayerSavedAt: savedAt,
      });
      setTimer(0);
      setIsRunning(false);
      setModalVisible(false);
      router.push('/boneliv');
    } catch (error) {
      console.error('Error saving prayer time:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveManualTime = async () => {
    if (isSaving) return;
    setIsSaving(true);

    const userId = auth.currentUser?.uid;
    const date = manualDate || getTodayDate();
    const hours = parseInt(manualHours) || 0;
    const minutes = parseInt(manualMinutes) || 0;
    const seconds = parseInt(manualSeconds) || 0;
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    const savedAt = Timestamp.now();

    if (!userId) {
      setIsSaving(false);
      return;
    }

    try {
      const prayerId = savedAt.toMillis().toString();
      const userDocRef = doc(firestore, 'users', userId, 'prayerTimes', prayerId);
      await setDoc(userDocRef, {
        date: date,
        durationInSeconds: totalSeconds,
        durationFormatted: formatTime(totalSeconds),
        timestamp: savedAt,
        prayerSavedAt: savedAt,
      });

      setManualModalVisible(false);
      setTimer(0);
      setIsRunning(false);
      router.push('/boneliv');
    } catch (error) {
      console.error('Error saving manual prayer time:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestart = () => {
    setTimer(0);
    setIsRunning(false);
    setModalVisible(false);
  };

  const onPressIn = () => {
    setShadowOffset({ width: 0, height: 15 });
    Animated.spring(scaleValue, {
      toValue: 0.95,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    setShadowOffset({ width: 0, height: 10 });
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.container}>
      {/* Dark overlay when timer is running */}
      {isRunning && (
        <View style={styles.darkOverlay} />
      )}
      <TouchableOpacity
        style={[styles.lightningIconContainer, isRunning && styles.disabledButton]}
        onPress={async () => {
          if (hasLevelUp) {
            await clearLevelUpNotification();
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          router.push('/rewards');
        }}
        activeOpacity={0.8}
        disabled={isRunning}
      >
        <Animated.View style={{ transform: [{ scale: lightningScale }] }}>
          <Icon name="bolt" size={30} color="#FFEB3B" />
        </Animated.View>
      </TouchableOpacity>

      <Text style={[styles.title, isRunning && styles.dimmedElement]}>
        <Text style={styles.boldText}>{i18n.t('home.title2')}</Text>
        {"\n"}
        <Text style={styles.smallItalicText}>{i18n.t('home.title3')}</Text>
      </Text>

      <Text style={styles.timerText}>{formatTime(timer)}</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={toggleTimer}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <Animated.View
          style={[
            styles.buttonInner,
            {
              transform: [{ scale: scaleValue }],
              shadowOffset: shadowOffset,
            },
          ]}
        >
          <Text style={styles.buttonText}>{isRunning ? i18n.t('home.stop') : i18n.t('home.start')}</Text>
        </Animated.View>
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{i18n.t('home.yourPrayerToday')}</Text>
              <Text style={styles.modalText}>{i18n.t('home.time')}: {formatTime(timer)}</Text>
              <Text style={styles.modalText}>Sparad tid: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>

              <View style={styles.prayerModalButtonContainer}>
                <TouchableOpacity
                  style={styles.prayerModalButton}
                  onPress={handleSavePrayerTime}  
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.modalButtonText}>{isSaving ? i18n.t('home.saving') : i18n.t('home.save')}</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.prayerModalButton}
                  onPress={handleRestart}
                >
                  <Text style={styles.modalButtonText}>{i18n.t('home.restart')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.prayerModalButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>{i18n.t('home.cancel')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Manual Input Modal */}
      <ManualInputModal
        visible={manualModalVisible}
        onClose={() => setManualModalVisible(false)}
        onSave={handleSaveManualTime}
        manualDate={manualDate}
        setManualDate={setManualDate}
        manualHours={manualHours}
        setManualHours={setManualHours}
        manualMinutes={manualMinutes}
        setManualMinutes={setManualMinutes}
        manualSeconds={manualSeconds}
        setManualSeconds={setManualSeconds}
        isSaving={isSaving}
      />

      {/* Support Modal */}
      <SupportModal
        visible={supportModalVisible}
        onClose={() => setSupportModalVisible(false)}
        onSubscribe={() => console.log('Support subscribed')}
      />

      <TouchableOpacity
        style={[styles.heartIconStyle, isRunning && styles.disabledButton]}
        onPress={() => setSupportModalVisible(true)}
        activeOpacity={0.8}
        disabled={isRunning}
      >
        <View style={styles.iconWithText}>
          <Icon name="heart" size={30} color="#FF69B4" />
          <Text style={styles.iconText}>Stöd oss</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.manuallyButton, isRunning && styles.disabledButton]}
          onPress={() => setManualModalVisible(true)}
          disabled={isRunning}
        >
          <Text style={styles.manuallyButtonText}>{i18n.t('home.fillManual')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonRow: {
    position: 'absolute',
    top: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4A235A',
  },
  lightningIconContainer: {
    position: 'absolute',
    top: 20,
    right: 25,
    zIndex: 1,
  },
  heartIconStyle: {
    position: 'absolute',
    top: 20,
    left: 25,
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '500',
    marginBottom: 10,
    color: '#D1D1D1',
    textAlign: 'center',
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#D1D1D1',
  },
  smallItalicText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#D1D1D1',
    textAlign: 'center',
    marginTop: 10,
    opacity: 0.8,
  },
  boldText: {
    fontWeight: 'bold',
  },
  timerText: {
    fontSize: 60,
    fontWeight: 'bold',
    marginBottom: 320,
    color: '#F5E6D9',
  },
  button: {
    width: 150,
    height: 150,
    backgroundColor: '#9B59B6',
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#9B59B6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -75 }],
  },
  buttonInner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
    textShadowColor: '#8E44AD',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    width: 350,
    padding: 30,
    backgroundColor: '#522f60ff',
    borderRadius: 14,
    marginTop: -60,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 18,
    textAlign: 'center',
    color: '#F5E6D9',
  },
  modalText: {
    fontSize: 20,
    marginBottom: 25,
    textAlign: 'center',
    color: '#BDC3C7',
  },
  modalButton: {
    backgroundColor: '#8E44AD',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    width: '48%',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  prayerModalButtonContainer: {
    marginTop: 30,
  },
  prayerModalButton: {
    backgroundColor: '#8E44AD',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  manuallyButton: {
    backgroundColor: 'rgba(155, 89, 182, 0.3)',
    padding: 4,
    margin: 3,
    borderRadius: 6,
    alignItems: 'center',
  },
  manuallyButtonText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },

  iconWithText: {
    alignItems: 'center',
  },
  iconText: {
    fontSize: 12,
    color: '#FF69B4',
    marginTop: 5,
  },
  darkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 0,
  },
  dimmedElement: {
    opacity: 0.3,
  },
  disabledButton: {
    opacity: 0.3,
  },
});
