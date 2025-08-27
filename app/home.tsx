import { Picker } from '@react-native-picker/picker'; // Lägg till denna import
import { useRouter } from 'expo-router';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, Keyboard, Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { auth, firestore } from '../components/firebaseConfig';
import { languageEvents } from '../hooks/languageEvents';
import i18n, { setAppLanguage } from '../locales/i18n';
import Icon from 'react-native-vector-icons/FontAwesome'; // Importera FontAwesome för hjärt-ikonen
import { useRewardSystem } from '../hooks/useRewardSystem';


export default function HomeScreen() {
  const router = useRouter();
  const [timer, setTimer] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [intervalId, setIntervalId] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [infoModalVisible, setInfoModalVisible] = useState<boolean>(false);
  const [manualModalVisible, setManualModalVisible] = useState<boolean>(false);
  const [scaleValue] = useState(new Animated.Value(1));
  const [shadowOffset, setShadowOffset] = useState({ width: 0, height: 10 });
  const [isSaving, setIsSaving] = useState(false); // Track saving state

  // Use reward system hook
  const {
    totalPoints,
    currentLevel,
    unlockedLevels,
    hasLevelUp,
    clearLevelUpNotification
  } = useRewardSystem();


  // *** NYTT: state för stöd/donation-modalen ***
  const [supportModalVisible, setSupportModalVisible] = useState<boolean>(false);

  // State for the manual input modal
  const [manualDate, setManualDate] = useState<string>('');
  const [manualHours, setManualHours] = useState<string>('0');
  const [manualMinutes, setManualMinutes] = useState<string>('0');
  const [manualSeconds, setManualSeconds] = useState<string>('0');
  const [language, setLanguage] = React.useState(i18n.locale || 'en');
  const [lightningScale] = useState(new Animated.Value(1));

  // Handle level up vibration effect
  useEffect(() => {
    if (hasLevelUp) {
      // Vibration animation for lightning icon
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
      ]).start(() => {
        clearLevelUpNotification();
      });
    }
  }, [hasLevelUp, lightningScale, clearLevelUpNotification]);

  useEffect(() => {
    configureCalendarLocale(language);
    LocaleConfig.defaultLocale = language;
  }, [language]);

  // Update calendar locale config based on current language
  const configureCalendarLocale = (lang: string) => {
    if (lang === 'sv') {
      // Swedish locale using your i18n keys
      LocaleConfig.locales['sv'] = {
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
      LocaleConfig.defaultLocale = 'sv';
    } else if (lang === 'es') {
      // Swedish locale using your i18n keys
      LocaleConfig.locales['es'] = {
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
      LocaleConfig.defaultLocale = 'es';
    } else {
      // Default to English locale using your i18n keys (same keys as above)
      LocaleConfig.locales['en'] = {
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
      LocaleConfig.defaultLocale = 'en';
    }
  };

  useEffect(() => {
    const listener = async (newLang: string) => {
      await setAppLanguage(newLang);
      setLanguage(newLang); // triggers useEffect above
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
    if (isSaving) return; // Prevent saving if already in process
    setIsSaving(true); // Set saving flag to true to indicate the process

    const prayerDuration = timer;
    const userId = auth.currentUser?.uid;
    const date = getTodayDate();

    if (!userId) {
      console.log('Användaren är inte inloggad');
      setIsSaving(false); // Reset flag if user is not logged in
      return;
    }

    try {
      const prayerId = Timestamp.now().toMillis().toString();
      const userDocRef = doc(firestore, 'users', userId, 'prayerTimes', prayerId);
      await setDoc(userDocRef, {
        date: date,
        durationInSeconds: prayerDuration,
        durationFormatted: formatTime(prayerDuration),
        timestamp: Timestamp.now(),
      });

      setTimer(0);
      setIsRunning(false);
      setModalVisible(false);
      router.push('/boneliv');
    } catch (error) {
      console.error('Fel vid sparande av bönestund:', error);
    } finally {
      setIsSaving(false); // Reset flag when saving is finished
    }
  };

  const handleSaveManualTime = async () => {
    if (isSaving) return; // Prevent saving if already in process
    setIsSaving(true); // Set saving flag to true to indicate the process

    const userId = auth.currentUser?.uid;
    const date = manualDate || getTodayDate();
    const hours = parseInt(manualHours);
    const minutes = parseInt(manualMinutes);
    const seconds = parseInt(manualSeconds);
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;

    if (!userId) {
      console.log('Användaren är inte inloggad');
      setIsSaving(false); // Reset flag if user is not logged in
      return;
    }

    try {
      const prayerId = Timestamp.now().toMillis().toString();
      const userDocRef = doc(firestore, 'users', userId, 'prayerTimes', prayerId);
      await setDoc(userDocRef, {
        date: date,
        durationInSeconds: totalSeconds,
        durationFormatted: formatTime(totalSeconds),
        timestamp: Timestamp.now(),
      });

      setManualModalVisible(false);
      setTimer(0);
      setIsRunning(false);
      router.push('/boneliv');
    } catch (error) {
      console.error('Fel vid sparande av bönestund:', error);
    } finally {
      setIsSaving(false); // Reset flag when saving is finished
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

  const handleDateSelect = (date: string) => {
    setManualDate(date);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{i18n.t('home.title')}</Text>
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

      {/* Modal for Prayer Time */}
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
{/* Support Modal */}















{/* Lightning Icon in the top-right corner */}
<TouchableOpacity
  style={styles.lightningIconContainer}
  onPress={() => router.push('/rewards')}
  activeOpacity={0.8}
>
  <Animated.View style={{ transform: [{ scale: lightningScale }] }}>
    <Icon name="bolt" size={30} color="#FFEB3B" />
  </Animated.View>
</TouchableOpacity>














      {/* Manual Input Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={manualModalVisible}
        onRequestClose={() => setManualModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Calendar
                style={styles.calendarContainer}
                markedDates={{
                  [manualDate]: { selected: true, selectedColor: '#9B59B6', selectedTextColor: '#fff' },
                  [getTodayDate()]: {
                    selected: true,
                    selectedColor: '#d5bab8ff',
                    selectedTextColor: '#fff',
                  },
                }}
                onDayPress={(day) => handleDateSelect(day.dateString)}
                firstDay={1}
                theme={{
                  selectedDayBackgroundColor: '#9B59B6',
                  selectedDayTextColor: '#FFF',
                  dayTextColor: '#FF69B4',
                  arrowColor: '#9B59B6',
                  monthTextColor: '#9B59B6',
                  textSectionTitleColor: '#9B59B6',
                  backgroundColor: '#F4F4F4',
                  todayTextColor: '#fff',
                  todayBackgroundColor: '#E74C3C',
                  textDayFontFamily: 'Roboto',
                  textMonthFontFamily: 'Roboto',
                  textDayHeaderFontFamily: 'Roboto',
                  textDayFontSize: 16,
                  textMonthFontSize: 20,
                  textDayHeaderFontSize: 14,
                }}
              />

              {/* Time Inputs in a row */}
              <View style={styles.timePickerContainer}>
                {/* Hour Picker */}
                <View style={styles.timeInput}>
                  <Text style={styles.timeLabel}>{i18n.t('home.hours')}</Text>
                  <Picker
                    selectedValue={manualHours}
                    onValueChange={(itemValue) => setManualHours(itemValue.toString())}
                    style={styles.timePicker}
                    itemStyle={{ color: '#fff' }}
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <Picker.Item key={i} label={`${i}`} value={i.toString()} />
                    ))}
                  </Picker>
                </View>

                {/* Minute Picker */}
                <View style={styles.timeInput}>
                  <Text style={styles.timeLabel}>{i18n.t('home.minutes')}</Text>
                  <Picker
                    selectedValue={manualMinutes}
                    onValueChange={(itemValue) => setManualMinutes(itemValue.toString())}
                    style={styles.timePicker}
                    itemStyle={{ color: '#fff' }}
                  >
                    {Array.from({ length: 60 }, (_, i) => (
                      <Picker.Item key={i} label={`${i}`} value={i.toString()} />
                    ))}
                  </Picker>
                </View>

                {/* Second Picker */}
                <View style={styles.timeInput}>
                  <Text style={styles.timeLabel}>{i18n.t('home.seconds')}</Text>
                  <Picker
                    selectedValue={manualSeconds}
                    onValueChange={(itemValue) => setManualSeconds(itemValue.toString())}
                    style={styles.timePicker}
                    itemStyle={{ color: '#fff' }}
                  >
                    {Array.from({ length: 60 }, (_, i) => (
                      <Picker.Item key={i} label={`${i}`} value={i.toString()} />
                    ))}
                  </Picker>
                </View>
              </View>

              {/* Buttons Container */}
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={handleSaveManualTime}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.modalButtonText}>{i18n.t('home.save')}</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setManualModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>{i18n.t('minaboner.cancel')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Heart Icon in the top-left corner */}
      <TouchableOpacity
        style={styles.heartIconContainer}
        onPress={() => setSupportModalVisible(true)} // *** NYTT: öppna stöd-modalen ***
        activeOpacity={0.8}
      >
        <Icon name="heart" size={30} color="#FF69B4" />
      </TouchableOpacity>

      {/* *** NYTT: Stöd / Donate Modal *** */}
  <Modal
  animationType="fade"
  transparent={true}
  visible={supportModalVisible}
  onRequestClose={() => setSupportModalVisible(false)}
>
  <TouchableWithoutFeedback onPress={() => setSupportModalVisible(false)}>
    <View style={styles.modalOverlay}>
      <TouchableWithoutFeedback onPress={() => {}}>
        <View style={styles.modalContent}>
          {/* Rubrik nära linjen */}
          <Text style={[styles.modalTitle, { marginBottom: 4 }]}>Stöd oss</Text>

          {/* Streck under rubriken */}
          <View
            style={{
              height: 1,
              backgroundColor: '#ccc',
              width: '100%',
              marginBottom: 12
            }}
          />

         <Text style={[styles.modalText, { marginTop: 0, textAlign: 'center' }]}>
  Hjälp till att utveckla Hayye appen genom ett frivilligt månadsstöd.{'\n'}
  Välj 9 kr, 19 kr eller 29 kr/månad.{'\n\n'}
  </Text>
  <Text style={[styles.modalText, { marginTop: 0, textAlign: 'center', fontWeight: 'bold', fontSize: 16 }]}>
    Med denna prenumeration försvinner alla reklamavbrott och appen blir helt reklamfri.
  </Text>


          {/* Knappar – längre och centrerade */}
          <View style={{ marginTop: 20, width: '100%', alignItems: 'center' }}>
            <TouchableOpacity
              style={[styles.modalButton, { width: '80%', marginBottom: 12 }]}
              onPress={() => {
                console.log('Prenumerera 9 kr');
                setSupportModalVisible(false);
              }}
              activeOpacity={0.9}
            >
              <Text style={styles.modalButtonText}>Prenumerera 9 kr</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, { width: '80%', marginBottom: 12 }]}
              onPress={() => {
                console.log('Prenumerera 19 kr');
                setSupportModalVisible(false);
              }}
              activeOpacity={0.9}
            >
              <Text style={styles.modalButtonText}>Prenumerera 19 kr</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, { width: '80%' }]}
              onPress={() => {
                console.log('Prenumerera 29 kr');
                setSupportModalVisible(false);
              }}
              activeOpacity={0.9}
            >
              <Text style={styles.modalButtonText}>Prenumerera 29 kr</Text>
            </TouchableOpacity>
          </View>

          {/* Stäng-knapp längre ner */}
          <View style={{ marginTop: 50, alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => setSupportModalVisible(false)}
              style={styles.secondaryCloseBtn}
            >
              <Text style={styles.secondaryCloseBtnText}>
                {i18n.t('home.cancel') || 'Stäng'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </View>
  </TouchableWithoutFeedback>
</Modal>


      {/* Info Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={infoModalVisible}
        onRequestClose={() => setInfoModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{i18n.t('home.infoTitle')}</Text>
            <Text style={styles.modalText}>{i18n.t('home.infoText')}</Text>
            <TouchableOpacity style={styles.modalButton} onPress={() => setInfoModalVisible(false)}>
              <Text style={styles.modalButtonText}>{i18n.t('home.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.infoButton} onPress={() => setInfoModalVisible(true)}>
          <Text style={styles.infoButtonText}>{i18n.t('home.infoButton')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.manuallyButton}
          onPress={() => setManualModalVisible(true)} // Open the manual modal
        >
          <Text style={styles.manuallyButtonText}>{i18n.t('home.fillManual')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#5B2C6F',
  },
    lightningIconContainer: {
    position: 'absolute',
    top: 70,
    right: 25,  // Adjust to fit as needed
    zIndex: 1,  // Ensure it's on top of other elements
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#F5E6D9',
  },
  timerText: {
    fontSize: 60,
    fontWeight: 'bold',
    marginBottom: 40,
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Bakgrund för modalen
  },
  modalContent: {
    width: 350,
    padding: 30,
    backgroundColor: '#522f60ff',
    borderRadius: 14,
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
  buttonRow: {
    position: 'absolute',
    top: 70,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  infoButton: {
    backgroundColor: 'rgba(155, 89, 182, 0.3)',
    padding: 4,
    margin: 3,
    borderRadius: 6,
    alignItems: 'center',
  },
  manuallyButton: {
    backgroundColor: 'rgba(155, 89, 182, 0.3)',
    padding: 4,
    margin: 3,
    borderRadius: 6,
    alignItems: 'center',
  },
  infoButtonText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  manuallyButtonText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 10,
    paddingLeft: 8,
    color: '#fff',
    fontSize: 18,
    width: '100%',
  },
  inputGroup: {
    marginBottom: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 16,
    color: '#F5E6D9',
    marginBottom: 5,
    textAlign: 'center',
  },
  calendarContainer: {
    borderWidth: 1,
    borderColor: '#9B59B6',
    borderRadius: 12,
    backgroundColor: '#E8F0F3',
    padding: 15,
    marginVertical: 20,
    shadowColor: '#9B59B6',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  line: {
    width: 1,
    height: '80%',
    backgroundColor: '#BDC3C7',
    marginHorizontal: 5,
  },
  picker: {
    height: 150,
    width: '100%',
    color: '#fff',
    backgroundColor: '#522f60ff',
    borderRadius: 6,
    marginBottom: 10,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 40,
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

  // New styles for time picker modal layout
  timePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 35,
  },
  timeInput: {
    width: '30%',
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  timePicker: {
    height: 150,
    width: '100%',
    color: '#fff',
    backgroundColor: '#522f60ff',
    borderRadius: 6,
  },
  heartIconContainer: {
    position: 'absolute',
    top: 70,
    left: 25,
    zIndex: 1, // Säkerställer att ikonen är över andra komponenter
  },

  // *** NYTT: subtil stäng-knapp för stöd-modallen ***
  secondaryCloseBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  secondaryCloseBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
