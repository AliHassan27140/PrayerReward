import { useNavigation } from '@react-navigation/native';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentData,
  query,
  where,
  onSnapshot,
  updateDoc
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { firestore } from '../components/firebaseConfig';
import i18n from '../locales/i18n';

type Prayer = {
  id: string;
  title: string;
  prayerText: string;
  date: string;
};

export default function HomeScreen() {
  const navigation = useNavigation();
  const auth = getAuth(); // För att hämta aktuell användare (UID)
  const userId = auth.currentUser?.uid; // Få användarens UID

  const titleInputRef = useRef<TextInput>(null);
  const prayerTextInputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const TOPBAR_HEIGHT = 70;
  const NAVBAR_HEIGHT = 120;

  const [confirmationModalVisible, setConfirmationModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [prayerText, setPrayerText] = useState('');
  const [savedPrayers, setSavedPrayers] = useState<Prayer[]>([]);
  const [selectedPrayerIndex, setSelectedPrayerIndex] = useState<number | null>(null);
  const [activePrayer, setActivePrayer] = useState<Prayer | null>(null); // null = listläge
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  const isCreating = !!activePrayer && activePrayer.id === ''; // ny anteckning som inte är sparad än
  const isDirty =
    !!activePrayer &&
    (title !== (activePrayer?.title ?? '') || prayerText !== (activePrayer?.prayerText ?? ''));

  useLayoutEffect(() => {
    navigation.setOptions?.({
      headerLeft: activePrayer ? () => null : undefined,
      swipeEnabled: !activePrayer,
    });
  }, [activePrayer, navigation]);

  useEffect(() => {
    if (!userId) return; // Om ingen användare är inloggad, hämta inte anteckningar

    // Filtrera anteckningar per användare
    const prayersQuery = query(
      collection(firestore, 'prayers'),
      where('userId', '==', userId) // Endast anteckningar för den aktuella användaren
    );

    const unsubscribe = onSnapshot(
      prayersQuery,
      (querySnapshot) => {
        const prayersData = querySnapshot.docs.map((d) => {
          const data = d.data() as DocumentData;
          return {
            id: d.id,
            title: data.title ?? '',
            prayerText: data.prayerText ?? '',
            date: data.date
          } as Prayer;
        });
        prayersData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setSavedPrayers(prayersData);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error getting prayers: ', error);
        setIsLoading(false);
      }
    );

    // Avsluta prenumerationen när komponenten tas bort
    return () => unsubscribe();
  }, [userId]);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardWillShow', () => setIsTyping(true));
    const hideSub = Keyboard.addListener('keyboardWillHide', () => setIsTyping(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const openPrayerDetails = (prayer: Prayer, index: number) => {
    setActivePrayer(prayer);
    setSelectedPrayerIndex(index);
    setTitle(prayer.title ?? '');
    setPrayerText(prayer.prayerText ?? '');
  };

  const startCreateNew = () => {
    const draft: Prayer = {
      id: '', // markerar "ny"
      title: '',
      prayerText: '',
      date: new Date().toISOString(),
    };
    setSelectedPrayerIndex(null);
    setActivePrayer(draft);
    setTitle('');
    setPrayerText('');
  };

  const closePrayer = () => {
    setActivePrayer(null);
    Keyboard.dismiss();
  };

 const saveActive = useCallback(async () => {
  if (!activePrayer || !userId) return;

  if (isCreating && (!title.trim() || !prayerText.trim())) {
    alert(i18n.t('minaboner.fillAll') || 'Titel och bönetext måste fyllas i innan du sparar!');
    return;
  }

  if (!isCreating && !isDirty) return;  // Om vi inte har ändrat något, ingen anledning att spara

  try {
    setIsSaving(true);
    const currentDate = new Date().toISOString();

    if (isCreating) {
      // Kontrollera om anteckningen redan finns (om samma titel finns)
      const existingPrayer = savedPrayers.find(prayer => prayer.title === title.trim());
      if (existingPrayer) {
        alert(i18n.t('minaboner.alreadyExists') || 'Den här anteckningen finns redan!');
        setIsSaving(false);
        return;
      }

      // Skapa en ny anteckning om den inte finns
      const newDoc = await addDoc(collection(firestore, 'prayers'), {
        title: title.trim(),
        prayerText: prayerText.trim(),
        date: currentDate,
        userId: userId // Lägg till användarens ID för att koppla anteckningen till användaren
      });

      const newPrayer: Prayer = {
        id: newDoc.id,
        title: title.trim(),
        prayerText: prayerText.trim(),
        date: currentDate,
      };

      // Uppdatera listan korrekt för att undvika dubbletter
      setSavedPrayers(prev => {
        const newPrayersList = prev.filter(p => p.id !== newPrayer.id); // Ta bort befintliga med samma ID (om någon)
        return [newPrayer, ...newPrayersList]; // Lägg till den nya anteckningen i listan
      });

      setActivePrayer(newPrayer);
      setSelectedPrayerIndex(0);
    } else {
      // Uppdatera befintlig anteckning om vi inte är i skaparläge
      await updateDoc(doc(firestore, 'prayers', activePrayer.id), {
        title: title ?? '',
        prayerText: prayerText ?? '',
        date: currentDate,
      });

      const updatedPrayer: Prayer = {
        ...activePrayer,
        title: title ?? '',
        prayerText: prayerText ?? '',
        date: currentDate,
      };

      setSavedPrayers(prev => {
        const newList = prev.filter(p => p.id !== activePrayer.id); // Ta bort den gamla versionen
        return [updatedPrayer, ...newList]; // Lägg till den uppdaterade anteckningen i listan
      });

      setActivePrayer(updatedPrayer);
      setSelectedPrayerIndex(0);
    }
  } catch (e) {
    console.error('Error saving prayer: ', e);
  } finally {
    setIsSaving(false);
  }
}, [activePrayer, isCreating, isDirty, title, prayerText, savedPrayers, userId]);


  const deletePrayerById = useCallback(async (id: string) => {
    try {
      await deleteDoc(doc(firestore, 'prayers', id));
      setSavedPrayers(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting prayer (list): ', error);
    }
  }, []);

  const handleDelete = async () => {
    if (!activePrayer || activePrayer.id === '') {
      setConfirmationModalVisible(false);
      setActivePrayer(null);
      return;
    }
    try {
      await deleteDoc(doc(firestore, 'prayers', activePrayer.id));
      setSavedPrayers(prev => prev.filter(p => p.id !== activePrayer.id));
      setSelectedPrayerIndex(null);
      setActivePrayer(null);
      setConfirmationModalVisible(false);
    } catch (error) {
      console.error('Error deleting prayer: ', error);
    }
  };

  const filteredPrayers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return savedPrayers;
    return savedPrayers.filter(prayer =>
      (prayer.title || '').toLowerCase().includes(q) ||
      (prayer.prayerText || '').toLowerCase().includes(q)
    );
  }, [savedPrayers, searchQuery]);

  const renderRightActions = (id: string) => (
    <View style={styles.rightActionContainer}>
      <TouchableOpacity style={styles.deleteButton} onPress={() => deletePrayerById(id)}>
        <Text style={styles.deleteText}>{i18n.t('minaboner.delete') || 'Ta bort'}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safe}>
        <TouchableWithoutFeedback
          onPress={() => {
            if (!titleInputRef.current?.isFocused() && !prayerTextInputRef.current?.isFocused()) {
              Keyboard.dismiss();
            }
          }}
        >
          <View style={styles.container}>

            {/* Topbar: Sök + Plus */}
            {!activePrayer && !isLoading && (
              <View style={[styles.topBar, { height: TOPBAR_HEIGHT }]}>
                <View style={styles.searchWrapper}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder={i18n.t('minaboner.searchPlaceholder')}
                    placeholderTextColor="#8E66A6"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    returnKeyType="search"
                  />
                  <View style={styles.searchIcon}>
                    <Icon name="search" size={20} color="#6C3483" />
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.topBarPlus}
                  onPress={startCreateNew}
                >
                  <Icon name="add" size={24} color={COLORS.card} />
                </TouchableOpacity>
              </View>
            )}

            {/* Lista med Swipeable */}
            {!activePrayer && !isLoading && (
              <ScrollView
                style={styles.prayersList}
                contentContainerStyle={{
                  paddingTop: TOPBAR_HEIGHT + 10,
                  paddingBottom: NAVBAR_HEIGHT + -5,
                }}
                keyboardShouldPersistTaps="handled"
              >
                {filteredPrayers.length === 0 ? (
                  <View style={styles.noPrayersContainer}>
                    <Text style={styles.noPrayersText}>
                      {i18n.t('minaboner.noPrayers') || 'Inga sparade anteckningar'}
                    </Text>
                  </View>
                ) : (
                  filteredPrayers.map((prayer, index) => (
                    <Swipeable
                      key={prayer.id}
                      renderRightActions={() => renderRightActions(prayer.id)}
                      friction={2}
                      rightThreshold={80}
                      overshootRight={false}
                    >
                      <View style={styles.cardOuter}>
                        <View style={styles.cardAccent} />
                        <TouchableOpacity
                          style={styles.cardInner}
                          onPress={() => openPrayerDetails(prayer, index)}
                          activeOpacity={0.9}
                        >
                          <View style={styles.cardHeaderRow}>
                            <Text style={styles.prayerTitle} numberOfLines={1}>
                              {prayer.title}
                            </Text>
                            <View style={styles.badge}>
                              <Text style={styles.badgeText}>
                                {new Date(prayer.date).toLocaleDateString('sv-SE')}
                              </Text>
                            </View>
                          </View>

                          <View style={styles.hairline} />

                          <Text
                            style={styles.prayerText}
                            numberOfLines={2}
                            ellipsizeMode="tail"
                          >
                            {prayer.prayerText}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </Swipeable>
                  ))
                )}
              </ScrollView>
            )}

            {/* Detaljvy – direktredigerbar */}
            {activePrayer && (
              <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 20}
                enabled={true}
              >
                <View style={styles.backButtonContainer}>
                  <TouchableOpacity style={styles.backButton} onPress={closePrayer}>
                    <Text style={styles.backArrow}>←</Text>
                  </TouchableOpacity>

                  {/* Klar-knapp: position oförändrad, bara disabled/opacity styrs av isTyping */}
                  <TouchableOpacity
                    style={[styles.clearFab, !isTyping && { opacity: 0.5 }]}
                    onPress={() => Keyboard.dismiss()}
                    disabled={!isTyping}
                  >
                    <Text style={styles.clearText}>
                      {i18n.t('minaboner.done') || 'Klar'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.saveFab,
                      ((isCreating
                        ? !title.trim() || !prayerText.trim()
                        : !isDirty) || isSaving) && { opacity: 0.6 }
                    ]}
                    onPress={saveActive}
                    disabled={(isCreating
                      ? !title.trim() || !prayerText.trim()
                      : !isDirty) || isSaving}
                  >
                    {isSaving ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.saveText}>
                        {i18n.t('minaboner.save') || 'Spara'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>

                <View style={styles.detailWrapper}>
                  <ScrollView
                    ref={scrollViewRef}
                    style={{ flex: 1, paddingTop: TOPBAR_HEIGHT + 10 }}
                    contentContainerStyle={{ paddingBottom: Platform.OS === 'ios' ? 400 : 200, flexGrow: 1 }}
                    keyboardShouldPersistTaps="always"
                    keyboardDismissMode="on-drag"
                    showsVerticalScrollIndicator={false}
                    automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
                    automaticallyAdjustContentInsets={false}
                    scrollEventThrottle={16}
                    onScrollBeginDrag={() => setIsScrolling(true)}
                    onScrollEndDrag={() => setIsScrolling(false)}
                    onMomentumScrollBegin={() => setIsScrolling(true)}
                    onMomentumScrollEnd={() => setIsScrolling(false)}
                  >
                    <View style={styles.detailContent}>
                      {/* DATUM ÖVER TITELN */}
                      <Text style={styles.noteDateTop}>
                        {isCreating
                          ? new Date().toLocaleDateString('sv-SE')
                          : new Date(activePrayer.date).toLocaleDateString('sv-SE')}
                      </Text>

                      <TextInput
                        ref={titleInputRef}
                        style={[styles.detailTitle, { textAlign: 'center' }]}
                        value={title}
                        onChangeText={setTitle}
                        placeholder={i18n.t('minaboner.title')}
                        placeholderTextColor="#8E66A6"
                        multiline
                        returnKeyType="done"
                        onFocus={() => setIsTyping(true)}
                        onBlur={() => setIsTyping(false)}
                        pointerEvents={isScrolling ? 'none' : 'auto'}
                        editable={!isScrolling}
                      />

                      <View style={styles.hairlineWide} />

                      <TextInput
                        ref={prayerTextInputRef}
                        style={[styles.detailText, { minHeight: 200, textAlignVertical: 'top' }]}
                        value={prayerText}
                        onChangeText={setPrayerText}
                        placeholder={i18n.t('minaboner.text')}
                        placeholderTextColor="#8E66A6"
                        multiline
                        scrollEnabled={false}
                        onFocus={() => setIsTyping(true)}
                        onBlur={() => setIsTyping(false)}
                        textAlignVertical="top"
                        pointerEvents={isScrolling ? 'none' : 'auto'}
                        editable={!isScrolling}
                      />
                    </View>
                  </ScrollView>
                </View>
              </KeyboardAvoidingView>
            )}
          </View>
        </TouchableWithoutFeedback>

        {/* FULLSKÄRMS LOADER – SYSKON TILL INNEHÅLLET */}
        {isLoading && (
          <View style={styles.loadingContainer} pointerEvents="auto">
            <ActivityIndicator size="large" color={COLORS.card} />
          </View>
        )}

        {/* Bekräfta radering (används bara i detaljvyn om du lägger till en delete-trigger igen) */}
        <Modal
          animationType="fade"
          transparent
          visible={confirmationModalVisible}
          onRequestClose={() => setConfirmationModalVisible(false)}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>{i18n.t('minaboner.deleteConfirmation')}</Text>
              <View style={styles.modalButtonsRow}>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnDanger]} onPress={handleDelete}>
                  <Text style={styles.modalBtnText}>{i18n.t('minaboner.delete')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalBtn} onPress={() => setConfirmationModalVisible(false)}>
                  <Text style={styles.modalBtnTextSecondary}>{i18n.t('minaboner.cancel')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

/* STYLES SOM VANLIGT */


/* ====== DESIGNKONSTANTER ====== */
const COLORS = {
  bg: '#4A235A',
  card: '#FAF6FF',
  ink: '#3D1D47',
  accent: '#9B59B6',
  accentDark: '#6C3483',
  danger: '#E74C3C',
  inkMuted: '#6E5975',
  hair: 'rgba(0,0,0,0.1)'
};

const RADIUS = 14;

/* =============== STYLES =============== */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1 },

  /* Topbar */
  topBar: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    zIndex: 10,
    flexDirection: 'row',
    gap: 8,
  },
  searchWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.accent,
    paddingVertical: 8,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.ink,
    paddingRight: 8,
  },
  searchIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFE6F7',
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  topBarPlus: {
    padding: 8,
    borderRadius: 999,
    backgroundColor: COLORS.accentDark,
    alignItems: 'center',
    justifyContent: 'center',
  },

  prayersList: {
    flex: 1,
    zIndex: 5,
  },

  /* Kortlista */
  cardOuter: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS,
    overflow: 'hidden',
    marginHorizontal: 15,
    marginVertical: 4,
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

  prayerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.ink,
    maxWidth: '70%',
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
  prayerText: {
    fontSize: 14,
    color: COLORS.ink,
  },

  /* FULLSKÄRMS LADDNING */
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    elevation: 100,
  },

  /* Detaljvy – toppknappar */
  backButtonContainer: {
    position: 'absolute',
    top: 10, left: 16, right: 16,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 10,
    borderRadius: 999,
    backgroundColor: COLORS.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  backArrow: {
    fontSize: 18,
    color: COLORS.ink,
    fontWeight: '800',
  },
  // deleteFab borttagen

  // Spara-knapp
  saveFab: {
    marginLeft: 'auto',
    width: 70,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  saveText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 12,
    textAlign: 'center',
  },

  /* Detaljvy – innehåll */
  detailWrapper: {
    position: 'absolute',
    top: 75, left: 0, right: 0, bottom: 0,
    backgroundColor: COLORS.card,
    zIndex: 5,
    borderTopLeftRadius: RADIUS,
    borderTopRightRadius: RADIUS,
    overflow: 'hidden',
  },
  detailContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  /* Datum över titeln i detaljvyn */
  noteDateTop: {
    position: 'absolute',
    top: -70,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 13,
    color: COLORS.inkMuted,
    zIndex: 21,
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.ink,
    textAlign: 'center',
    marginBottom: 10,
    marginTop: -2,
  },
  hairlineWide: {
    height: 1,
    backgroundColor: COLORS.hair,
    marginVertical: 12,
    marginHorizontal: 6,
  },
  detailText: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.ink,
    textAlign: 'left',
  },

  /* Modaler (radering från detalj) */
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 16,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: COLORS.card,
    padding: 18,
    borderRadius: RADIUS,
    alignItems: 'stretch',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
    color: COLORS.ink,
    textAlign: 'center',
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 10,
  },
  modalBtn: {
    flex: 1,
    backgroundColor: '#EFE6F7',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  modalBtnDanger: {
    backgroundColor: COLORS.danger,
    borderColor: COLORS.danger,
  },
  modalBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  modalBtnTextSecondary: {
    color: COLORS.accentDark,
    fontWeight: '800',
  },

  /* Swipe actions – samma höjd som anteckningscellen */
  rightActionContainer: {
    width: 96,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    right: -15,
    marginTop: 4,
    marginBottom: 4
  },

  deleteButton: {
    backgroundColor: COLORS.danger,
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

  // Din Klar-knapp style (oförändrad position/layout)
  clearFab: {
    marginLeft: 'auto',
    width: 70,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -150,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  clearText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 12,
    textAlign: 'center',
  },
  noPrayersContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: 20,
},
noPrayersText: {
  fontSize: 16,
   color: '#E5D8EF',
  textAlign: 'center',
},
});
