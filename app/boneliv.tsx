import { Picker } from '@react-native-picker/picker';
import { collection, deleteDoc, doc, onSnapshot, orderBy, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { auth, firestore } from '../components/firebaseConfig';
import { useRewardSystem } from '../hooks/useRewardSystem';
import i18n from '../locales/i18n';

interface SavedTime {
  date: string;
  durationInSeconds: number;
  durationFormatted: string;
  id: string;
}

type Props = {};

/** Säker översättningshjälpare som aldrig visar "missing ..." */
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

  useEffect(() => {
    if (hasLevelUp) {
      const timer = setTimeout(() => {
        Alert.alert(
          t('boneliv.rewardUnlocked', 'You have unlocked a new reward'),
          t('boneliv.goThere', 'Go there now?'),
          [
            {
              text: t('boneliv.cancel', 'Cancel'),
              style: 'cancel',
              onPress: () => clearLevelUpNotification()
            },
            {
              text: t('boneliv.goThere', 'Go there'),
              onPress: async () => {
                await clearLevelUpNotification();
                router.push('/rewards');
              }
            }
          ]
        );
      }, 500);

      return () => clearTimeout(timer);
    }
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
      // Svälj fel här om du inte vill logga i konsolen
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

  const renderSavedTimes = ({ item }: { item: SavedTime }) => (
    <Swipeable renderRightActions={() => renderRightActions(item.id)} friction={2} rightThreshold={80} overshootRight={false}>
      <View style={styles.cardOuter}>
        <View style={styles.cardAccent} />
        <View style={styles.cardInner}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>
              {t('date.label', 'Datum')}: {item.date}
            </Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{t('boneliv.time', 'Tid')}</Text>
            </View>
          </View>

          <View style={styles.hairline} />

          <View style={styles.cardContentRow}>
            <Text style={styles.cardLabel}>{t('boneliv.duration', 'Varaktighet')}</Text>
            <Text style={styles.cardValue}>{item.durationFormatted}</Text>
          </View>
        </View>
      </View>
    </Swipeable>
  );

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
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          />
        ) : (
          <Text style={styles.noDataText}>{t('boneliv.noSavedPrayerTimes', 'Inga sparade bönestunder')}</Text>
        )}
      </View>
    </GestureHandlerRootView>
  );
}

/* ---- STYLES: exakt som du ville behålla ---- */
const COLORS = {
  bg: '#4A235A',
  card: '#FAF6FF',
  ink: '#3D1D47',
  accent: '#9B59B6',
  accentDark: '#6C3483',
  danger: '#E74C3C',
  inkMuted: '#6E5975',
  hair: 'rgba(0,0,0,0.1)',
};

const RADIUS = 14;

const styles = StyleSheet.create({
  /* ===== Layout ===== */
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingTop: 65,
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

  /* ===== Summary card ===== */
  summaryCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS,
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
    color: COLORS.inkMuted,
    fontWeight: '700',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    color: COLORS.ink,
    fontWeight: '800',
  },
  vDivider: {
    width: 1,
    height: 36,
    backgroundColor: COLORS.hair,
    marginHorizontal: 6,
  },

  /* ===== Filter chips ===== */
  selectContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginTop: 14,
    marginBottom: 6,
  },
  pickerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.accent,
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
    color: COLORS.ink,
  },
  chev: { fontSize: 14, color: COLORS.accentDark },

  picker: {
    width: '100%',
    alignSelf: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS,
    marginTop: 8,
    marginBottom: 12,
  },

  /* ===== List ===== */
  listContent: {
    paddingVertical: 12,
  },

  /* Kort med vänster accent-streck och hårfin divider */
  cardOuter: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardAccent: {
    width: 6,
    backgroundColor: COLORS.accent,
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
    color: COLORS.ink,
  },
  badge: {
    backgroundColor: '#EFE6F7',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.accentDark,
  },
  hairline: {
    height: 1,
    backgroundColor: COLORS.hair,
    marginVertical: 8,
  },
  cardContentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontSize: 13,
    color: COLORS.inkMuted,
    fontWeight: '700',
  },
  cardValue: {
    fontSize: 15,
    color: COLORS.ink,
    fontWeight: '800',
  },

  /* ===== Swipe actions ===== */
  rightActionContainer: {
    width: 90, // större yta vid swipe
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: COLORS.danger,
    width: '100%', // fyller hela container-bredden
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

  /* ===== Övrigt ===== */
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
});
