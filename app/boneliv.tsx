import { Picker } from '@react-native-picker/picker';
import { collection, deleteDoc, doc, onSnapshot, orderBy, query, updateDoc, Timestamp } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { auth, firestore } from '../components/firebaseConfig';
import { useRewardSystem } from '../hooks/useRewardSystem';
import i18n from '../locales/i18n';
import PrayerTypeModal from './PrayerTypeModal'; // Import PrayerTypeModal component
import LevelUpRewardPopup from './LevelUpRewardPopup'; // Import LevelUpRewardPopup component

interface SavedTime {
  date: string;
  durationInSeconds: number;
  durationFormatted: string;
  id: string;
  prayerType?: string;
  prayerSavedAt: any; // This should be Timestamp from Firestore
}

type Props = {};

const t = (key: string, defaultValue = '') => {
  const val = i18n.t(key, { defaultValue });
  if (typeof val === 'string' && val.toLowerCase().startsWith('missing ')) return defaultValue;
  return val as string;
};

export default function BoneLivScreen({}: Props) {
  const router = useRouter();
  const { hasLevelUp, clearLevelUpNotification } = useRewardSystem();
  const currentYear = new Date().getFullYear().toString();

  const monthDict: Record<string, string> | undefined =
    i18n?.translations?.[i18n.locale]?.months;

  const monthKeys = monthDict ? Object.keys(monthDict) : [];
  const months = monthKeys.length
    ? monthKeys.map((k) => t(`months.${k}`, k))
    : [
        t('months.January', 'January'),
        t('months.February', 'February'),
        t('months.March', 'March'),
        t('months.April', 'April'),
        t('months.May', 'May'),
        t('months.June', 'June'),
        t('months.July', 'July'),
        t('months.August', 'August'),
        t('months.September', 'September'),
        t('months.October', 'October'),
        t('months.November', 'November'),
        t('months.December', 'December'),
      ];

  const currentMonth = months[new Date().getMonth()];

  const [savedTimes, setSavedTimes] = useState<SavedTime[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedYear, setSelectedYear] = useState<string>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);
  const [totalTime, setTotalTime] = useState<number>(0);

  const [showYearPicker, setShowYearPicker] = useState<boolean>(false);
  const [showMonthPicker, setShowMonthPicker] = useState<boolean>(false);
  const [selectedPrayerType, setSelectedPrayerType] = useState<string | null>(null);
  const [isPopupVisible, setIsPopupVisible] = useState<boolean>(false);
  const [selectedPrayerId, setSelectedPrayerId] = useState<string | null>(null);
  const [newPrayerType, setNewPrayerType] = useState<string>('');
  const [availablePrayerTypes, setAvailablePrayerTypes] = useState<string[]>(['Godmorgon', 'Godnatt']);
  const [loadingCreate, setLoadingCreate] = useState<boolean>(false);  // New loading state for creating prayer type
  
  useEffect(() => {
    // Removed old Alert for reward notification
  }, [hasLevelUp, clearLevelUpNotification, router]);

  const getMonthNumber = (month: string): string => {
    const index = months.indexOf(month);
    return index !== -1 ? String(index + 1).padStart(2, '0') : '';
  };

  const deleteSavedTime = async (id: string) => {
    try {
      const userId = auth.currentUser?.uid;
      if (userId) {
        const docRef = doc(firestore, 'users', userId, 'prayerTimes', id);
        await deleteDoc(docRef);
      }
    } catch {
      // Swallow error if you don't want to log it in the console
    }
  };

  const updatePrayerType = async (id: string, prayerType: string) => {
    const userId = auth.currentUser?.uid;
    if (userId) {
      try {
        const docRef = doc(firestore, 'users', userId, 'prayerTimes', id);
        await updateDoc(docRef, { prayerType });
        setSelectedPrayerType(null); // Clear global selection after updating
      } catch (error) {
        console.error('Error updating prayer type:', error);
      }
    }
  };

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      setSavedTimes([]);
      setTotalTime(0);
      setLoading(false);
      return;
    }

    const userDocRef = collection(firestore, 'users', userId, 'prayerTimes');
    const q = query(userDocRef, orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const times: SavedTime[] = [];
        let totalDuration = 0;

        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data() as SavedTime;
          const [year, month] = (data.date ?? '').split('-');

          if (year === selectedYear && month === getMonthNumber(selectedMonth)) {
            times.push({ ...data, id: docSnap.id });
            const d = Number(data.durationInSeconds);
            if (!Number.isNaN(d)) totalDuration += d;
          }
        });

        setSavedTimes(times);
        setTotalTime(totalDuration);
        setLoading(false);
      },
      () => setLoading(false)
    );

    return () => unsubscribe();
  }, [selectedYear, selectedMonth]);

  const toggleYearPicker = () => {
    if (showMonthPicker) setShowMonthPicker(false);
    setShowYearPicker((prev) => !prev);
  };

  const toggleMonthPicker = () => {
    if (showYearPicker) setShowYearPicker(false);
    setShowMonthPicker((prev) => !prev);
  };

  const renderRightActions = (id: string) => (
    <View style={styles.rightActionContainer}>
      <TouchableOpacity style={styles.deleteButton} onPress={() => deleteSavedTime(id)}>
        <Text style={styles.deleteText}>{t('boneliv.delete', 'Ta bort')}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSavedTimes = ({ item }: { item: SavedTime }) => {
    const savedTime = item.prayerSavedAt instanceof Timestamp
      ? item.prayerSavedAt.toDate()
      : new Date(item.prayerSavedAt);
    const formattedSavedTime = savedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <Swipeable renderRightActions={() => renderRightActions(item.id)} friction={2} rightThreshold={80} overshootRight={false}>
        <View style={styles.cardOuter}>
          <View style={styles.cardAccent} />
          <View style={styles.cardInner}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>
                {t('date.label', 'Datum')}: {item.date}
              </Text>
              <View style={styles.timeContainer}>
                <TouchableOpacity onPress={() => handlePrayerTypePopup(item.id)} style={styles.timeTouchable}>
                  <Text style={styles.plusButton}>+</Text>
                  <Text style={styles.prayerTypeText}>{item.prayerType || 'Lägg till böneämne'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.hairline} />

            <View style={styles.cardContentRow}>
              <Text style={styles.cardLabel}>{t('boneliv.duration', 'Varaktighet')}</Text>
              <Text style={styles.cardValue}>{item.durationFormatted}</Text>
            </View>

            <View style={styles.separatorLine} />

            <View style={styles.cardContentRow}>
              <Text style={styles.cardLabel}>Tid Sparad</Text>
              <Text style={styles.cardValue}>{formattedSavedTime}</Text>
            </View>
          </View>
        </View>
      </Swipeable>
    );
  };

  const handlePrayerTypePopup = (id: string) => {
    setSelectedPrayerId(id);
    setIsPopupVisible(true);
  };

  const handleSelectPrayerType = (type: string) => {
    if (selectedPrayerId) {
      updatePrayerType(selectedPrayerId, type);
    }
    setIsPopupVisible(false);
  };

  const handleCreatePrayerType = async () => {
    if (newPrayerType.trim()) {
      setLoadingCreate(true);

      try {
        if (selectedPrayerId) {
          await updatePrayerType(selectedPrayerId, newPrayerType);
        }
        setAvailablePrayerTypes(prev => [...prev, newPrayerType]);
        setNewPrayerType('');
        setIsPopupVisible(false);
      } catch (error) {
        console.error('Error creating prayer type:', error);
      } finally {
        setLoadingCreate(false);
      }
    }
  };

  const hours = Math.floor(totalTime / 3600);
  const minutes = Math.floor((totalTime % 3600) / 60);
  const seconds = totalTime % 60;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>{t('boneliv.totalTimeThisMonth', 'Total tid denna månad')}</Text>

        <View style={styles.summaryCard}>
          <View style={styles.summaryCol}>
            <Text style={styles.summaryLabel}>{t('boneliv.totalCount', 'Antal')}</Text>
            <Text style={styles.summaryValue}>{savedTimes.length}</Text>
          </View>
          <View style={styles.vDivider} />
          <View style={styles.summaryCol}>
            <Text style={styles.summaryLabel}>{t('boneliv.hours', 'Timmar')}</Text>
            <Text style={styles.summaryValue}>{hours}</Text>
          </View>
          <View style={styles.vDivider} />
          <View style={styles.summaryCol}>
            <Text style={styles.summaryLabel}>{t('boneliv.minutes', 'Minuter')}</Text>
            <Text style={styles.summaryValue}>{minutes}</Text>
          </View>
          <View style={styles.vDivider} />
          <View style={styles.summaryCol}>
            <Text style={styles.summaryLabel}>{t('boneliv.seconds', 'Sekunder')}</Text>
            <Text style={styles.summaryValue}>{seconds}</Text>
          </View>
        </View>

        <View style={styles.selectContainer}>
          <TouchableOpacity onPress={toggleYearPicker} style={styles.pickerChip}>
            <Text style={styles.pickerChipText}>{selectedYear}</Text>
            <Text style={styles.chev}>▾</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleMonthPicker} style={styles.pickerChip}>
            <Text style={styles.pickerChipText}>{selectedMonth}</Text>
            <Text style={styles.chev}>▾</Text>
          </TouchableOpacity>
        </View>

        {showYearPicker && (
          <Picker selectedValue={selectedYear} onValueChange={(v: string) => setSelectedYear(v)} style={styles.picker}>
            <Picker.Item label="2025" value="2025" />
            <Picker.Item label="2024" value="2024" />
            <Picker.Item label="2023" value="2023" />
            <Picker.Item label="2022" value="2022" />
            <Picker.Item label="2021" value="2021" />
          </Picker>
        )}

        {showMonthPicker && (
          <Picker selectedValue={selectedMonth} onValueChange={(v: string) => setSelectedMonth(v)} style={styles.picker}>
            {(monthKeys.length
              ? monthKeys.map((k) => ({ label: t(`months.${k}`, k), value: t(`months.${k}`, k) }))
              : months.map((m) => ({ label: m, value: m }))
            ).map((opt, idx) => (
              <Picker.Item key={idx} label={opt.label} value={opt.value} />
            ))}
          </Picker>
        )}

        {loading ? (
          <ActivityIndicator size="large" color="#F5E6D9" style={styles.loader} />
        ) : savedTimes.length > 0 ? (
          <FlatList
            data={savedTimes}
            renderItem={renderSavedTimes}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              paddingTop: 16,
              paddingBottom: 150,
              flexGrow: 1,
            }}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          />
        ) : (
          <Text style={styles.noDataText}>{t('boneliv.noSavedPrayerTimes', 'Inga sparade bönestunder')}</Text>
        )}
      </View>

      {/* PrayerTypeModal Popup */}
      <PrayerTypeModal
        visible={isPopupVisible}
        onClose={() => setIsPopupVisible(false)}
        onCreatePrayerType={handleCreatePrayerType}
        onSelectPrayerType={handleSelectPrayerType}
        availablePrayerTypes={availablePrayerTypes}
        loadingCreate={loadingCreate}
        newPrayerType={newPrayerType}
        setNewPrayerType={setNewPrayerType}
      />

      {/* LevelUpRewardPopup */}
      {hasLevelUp && (
        <LevelUpRewardPopup
          onLevelUp={async () => {
            await clearLevelUpNotification();
            router.push('/rewards');
          }}
          onCancel={clearLevelUpNotification}
          t={t}
        />
      )}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4A235A',
    paddingTop: 15,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F5E6D9',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  summaryCard: {
    backgroundColor: '#FAF6FF',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  summaryCol: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6E5975',
    fontWeight: '700',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    color: '#3D1D47',
    fontWeight: '800',
  },
  vDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginHorizontal: 6,
  },
  selectContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginTop: 14,
    marginBottom: 14,
  },
  pickerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF6FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#9B59B6',
    gap: 6,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  pickerChipText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3D1D47',
  },
  chev: {
    fontSize: 14,
    color: '#6C3483',
  },
  picker: {
    width: '100%',
    alignSelf: 'center',
    backgroundColor: '#FAF6FF',
    borderRadius: 14,
    marginTop: 8,
    marginBottom: 12,
  },
  listContent: {
    paddingVertical: 12,
  },
  cardOuter: {
    flexDirection: 'row',
    backgroundColor: '#FAF6FF',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardAccent: {
    width: 6,
    backgroundColor: '#9B59B6',
  },
  cardInner: {
    flex: 1,
    padding: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#3D1D47',
  },
  badge: {
    backgroundColor: '#EFE6F7',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#9B59B6',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6C3483',
  },
  hairline: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginVertical: 8,
  },
  cardContentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontSize: 13,
    color: '#6E5975',
    fontWeight: '700',
  },
  cardValue: {
    fontSize: 15,
    color: '#3D1D47',
    fontWeight: '800',
  },
  rightActionContainer: {
    width: 90,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#E74C3C',
    width: '100%',
    height: '100%',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  noDataText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#E5D8EF',
    marginTop: 32,
  },
  loader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  plusButton: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#9B59B6',
    marginLeft: 10,
  },
  prayerTypeText: {
    fontSize: 14,
    color: '#6E5975',
    marginLeft: 5,
    fontStyle: 'italic',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6, // Space between the "+" button and the prayer type text
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: 320, // Larger width
    backgroundColor: '#ffffff', // Clean white background
    borderRadius: 20, // More rounded corners
    padding: 24, // Increased padding for better spacing
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2, // Softer shadow
    shadowRadius: 25, // Larger radius for smoother shadow
    shadowOffset: { width: 0, height: 10 },
    elevation: 8, // Slightly lower elevation for a more subtle effect
    marginHorizontal: 30, // Margin from left and right
    marginTop: 50, // Margin from the top
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3D1D47',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 14,
    color: '#6E5975',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    width: '100%',
    paddingVertical: 12,
    marginBottom: 10,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#9B59B6',
  },
  secondaryButton: {
    backgroundColor: '#6C3483',
  },
  cancelButton: {
    backgroundColor: '#E74C3C',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  createButton: {
    backgroundColor: '#27AE60', // Green button for creating new prayer type
  },
  textInput: {
    width: '100%',
    padding: 10,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#9B59B6',
    backgroundColor: '#FAF6FF',
    fontSize: 14,
    color: '#3D1D47',
  },
  characterCountContainer: {
    width: '100%',
    alignItems: 'flex-end', // Align the text to the right
    marginBottom: 5, // Space between the count and input
  },

  characterCount: {
    fontSize: 12,
    color: '#6E5975',
    textAlign: 'right',
  },
  separatorLine: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)', // Light gray color for separator
    marginVertical: 10, // Add margin to separate sections
  },
});
