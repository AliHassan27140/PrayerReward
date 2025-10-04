import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Slot, useRouter, useSegments } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, StyleSheet, View, Text, Pressable, Platform, Modal, ScrollView, Image } from 'react-native';
import { languageEvents } from '../hooks/languageEvents';
import i18n, { initI18n, setAppLanguage } from "../locales/i18n";
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurOverlayProvider } from '../contexts/BlurOverlayContext';

const TOP_VISUAL_HEIGHT = 100; // höjden under statusbar

// Typen för alla tillåtna vägar
type ValidRoutes = 
  | "/home" 
  | "/minaboner" 
  | "/boneliv" 
  | "/instellningar" 
  | `/aktivitet?${string}` 
  | `/aktivitet#${string}` 
  | "/chat"
  | "/change-language"
  ;

function MenuItem({
  iconName,
  active,
  onPress,
  accessibilityLabel,
}: {
  iconName: React.ComponentProps<typeof Ionicons>['name'],
  active: boolean,
  onPress: () => void,
  accessibilityLabel?: string,
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
    Animated.spring(scale, {
      toValue: 0.92,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      accessibilityLabel={accessibilityLabel}
      android_ripple={{ color: 'rgba(255,255,255,0.15)', radius: 26, borderless: true }}
      style={({ pressed }) => [styles.menuButton, pressed && styles.menuButtonPressed]}
    >
      <Animated.View
        style={[
          styles.iconWrap,
          active && styles.iconWrapActive,
          { transform: [{ scale }] },
        ]}
      >
        <Ionicons name={iconName} size={28} color={active ? '#1B0B22' : '#F5E6D9'} />
      </Animated.View>
    </Pressable>
  );
}

function CenterButton({
  active,
  onPress,
  accessibilityLabel,
}: {
  active: boolean,
  onPress: () => void,
  accessibilityLabel?: string,
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
    Animated.spring(scale, {
      toValue: 0.94,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      accessibilityLabel={accessibilityLabel}
      android_ripple={{ color: 'rgba(0,0,0,0.08)', radius: 38, borderless: true }}
      style={styles.centerButton}
    >
      <Animated.View style={[styles.centerButtonInner, active && styles.centerButtonInnerActive, { transform: [{ scale }] }]}>
        <Ionicons name="flame" size={36} color={active ? '#1B0B22' : '#000'} />
      </Animated.View>
    </Pressable>
  );
}

export default function RootLayout() {
  const segments = useSegments();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [activeRoute, setActiveRoute] = useState<ValidRoutes>("/home");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [ready, setReady] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [labelAnim] = useState(new Animated.Value(1)); // start synlig
  const [infoOpen, setInfoOpen] = useState(false);

  // Kontrollera om användaren är inloggad
  useEffect(() => {
    const checkIfLoggedIn = async () => {
      const storedEmail = await AsyncStorage.getItem('email');
      const storedPassword = await AsyncStorage.getItem('password');
      if (storedEmail && storedPassword) {
        setIsLoggedIn(true);
        if (!segments[0]) setActiveRoute("/home");
      } else {
        setIsLoggedIn(false);
      }
    };
    checkIfLoggedIn();
  }, [segments]);

  useEffect(() => {
    (async () => {
      await initI18n();
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    const listener = async (lang: string) => {
      await setAppLanguage(lang);
      setReloadKey((prev) => prev + 1);
    };
    languageEvents.on('languageChanged', listener);
    return () => {
      languageEvents.off('languageChanged', listener);
    };
  }, []);

  // Update activeRoute based on current segments
  useEffect(() => {
    if (segments[0] && isLoggedIn) {
      const currentPath = ('/' + segments[0]) as ValidRoutes;
      if (
        currentPath === "/home" ||
        currentPath === "/minaboner" ||
        currentPath === "/boneliv" ||
        currentPath === "/instellningar" ||
        currentPath === "/chat" ||
        currentPath.startsWith("/aktivitet")
      ) {
        setActiveRoute(currentPath);
      }
    }
  }, [segments, isLoggedIn]);

  const isIndexPage = !segments[0];
  const shouldShowMenu = !isIndexPage && isLoggedIn;

  const handleSidebarItemPress = (item: ValidRoutes) => {
    setActiveRoute(item); 
    router.push(item);
  };

  // Get label based on active route
  const getLabelForRoute = (route: ValidRoutes) => {
    if (route === "/home") return i18n.t('home.title'); // Dynamically change label for /home route
    switch (route) {
      case "/minaboner": return i18n.t('rootMenu.prayerBook');
      case "/boneliv": return i18n.t('rootMenu.prayerLife');
      case "/chat": return i18n.t('rootMenu.info');
      case "/instellningar": return i18n.t('rootMenu.settings');
      default: return '';
    }
  };

  // Help text for each page
  const getInfoForRoute = (route: ValidRoutes) => {
    if (route.startsWith("/aktivitet")) {
      return (
`Din aktivitet

• Se dagens och veckans bön-aktivitet.
• Öppna kalendern för att se historik och mönster.
• Följ dina streaks – små steg blir stora resultat.
Tips: Tryck på en dag för detaljer och korta reflektioner.`
      );
    }
    switch (route) {
      case "/home":
        return (
`Välkommen hem

• Här får du snabb överblick över dagen.
• Fortsätt där du slutade – senaste bönen och mål.
• Snabbgenvägar till det du gör oftast.
Tips: Börja med ”Dagens bön” för en fokuserad start.`
        );
      case "/minaboner":
        return (
`Mina böner

• Samla dina favoritböner och egna texter.
• Skapa kategorier och markera favoriter.
• Sök snabbt när du behöver något specifikt.
Tips: Håll viktiga böner överst genom att favoritmarkera dem.`
        );
      case "/boneliv":
        return (
`Böneliv

• Sätt mål och bygg en regelbunden rytm.
• Lägg in påminnelser och planera din vecka.
• Följ framsteg med streaks och reflektioner.
Tips: Små, konsekventa vanor slår intensiva ryck.`
        );
      case "/chat":
        return (
`Information & hjälp

• Vanliga frågor och praktiska tips om appen.
• Behöver du stöd? Här hittar du kontakt och guider.
• Dela feedback så blir appen bättre för alla.
Tips: Sök i listan innan du hör av dig – svaret finns ofta där.`
        );
      case "/instellningar":
        return (
`Inställningar

• Byt språk och justera aviseringar.
• Välj tema och textstorlek för bättre läsbarhet.
• Hantera konto och säkerhetskopior.
Tips: Slå på påminnelser för att hålla rytmen levande.`
        );
      default:
        return '';
    }
  };

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: '#5B2C6F' }}>
        <ActivityIndicator size="large" color={"#fff"} />
      </View>
    );
  }

  const topHeaderHeight = insets.top + (TOP_VISUAL_HEIGHT - 50); 

  return (
    <BlurOverlayProvider>
      <View style={styles.container} key={reloadKey}>
      {/* 1) Måla hela safe area-toppen (kant till kant, inkl “öron”) */}
      {shouldShowMenu && (
        <SafeAreaView style={styles.topEdgeBg} edges={['top']} />
      )}

      {/* 2) Headerbakgrund + innehåll (vänster "Hayye" + verified, centrerad pill, info-ikon) */}
      {shouldShowMenu && (
        <View style={[styles.topBackground, { paddingTop: insets.top, height: topHeaderHeight }]}>
          <View style={styles.headerRow}>
            {/* Vänster varumärke + verified */}
            <View style={styles.leftBrand}>
              <View style={styles.brandRow}>
                <Image
                  source={require('../assets/images/Icon2no.png')}
                  style={{ width: 60, height: 60 }} // Adjust image size as needed
                  accessibilityLabel="App icon"
                />
              </View>
            </View>

            {/* Info-ikon till höger (klickbar) */}
            <Pressable
              accessibilityLabel={i18n.t?.('common.info') ?? 'Information'}
              onPress={() => setInfoOpen(true)}
              hitSlop={10}
              style={styles.infoButton}
            >
              <Ionicons name="information-circle-outline" size={26} color="#F5E6D9" />
            </Pressable>

            {/* Absolut centrerad pill-etikett */}
            <Animated.View
              pointerEvents="none"
              style={[
                styles.headerCenterOverlay,
                {
                  opacity: labelAnim,
                  transform: [{
                    translateY: labelAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-6, 0],
                    })
                  }]
                }
              ]}
            >
              <View style={styles.headerPill}>
                <Text style={styles.headerPillText}>
                  {getLabelForRoute(activeRoute)} {/* Dynamiskt utbytt text här */}
                </Text>
              </View>
            </Animated.View>
          </View>
        </View>
      )}

      {/* Innehållet trycks ner under top header */}
      <View style={[styles.content, shouldShowMenu && { paddingTop: topHeaderHeight }]}>
        <Slot />
      </View>

      {/* Bottenmeny */}
      {shouldShowMenu && (
        <>
          <View style={styles.bottomMenuContainer}>
            <MenuItem
              iconName="book-outline"
              active={activeRoute === "/minaboner"}
              onPress={() => handleSidebarItemPress("/minaboner")}
              accessibilityLabel={i18n.t('rootMenu.prayerBook')}
            />
            <MenuItem
              iconName="heart-outline"
              active={activeRoute === "/boneliv"}
              onPress={() => handleSidebarItemPress("/boneliv")}
              accessibilityLabel={i18n.t('rootMenu.prayerLife')}
            />
            <CenterButton
              active={activeRoute === "/home"}
              onPress={() => handleSidebarItemPress("/home")}
              accessibilityLabel={i18n.t('rootMenu.home')}
            />
            <MenuItem
              iconName="chatbubbles-outline"
              active={activeRoute === "/chat"}
              onPress={() => handleSidebarItemPress("/chat")}
              accessibilityLabel={i18n.t('rootMenu.info')}
            />
            <MenuItem
              iconName="settings-outline"
              active={activeRoute === "/instellningar"}
              onPress={() => handleSidebarItemPress("/instellningar")}
              accessibilityLabel={i18n.t('rootMenu.settings')}
            />
          </View>

          {/* Täcker nedersta ytan under baren */}
          <View style={styles.bottomFill} />
        </>
      )}

      {/* Info-modal */}
      <Modal
        visible={infoOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setInfoOpen(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setInfoOpen(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{getLabelForRoute(activeRoute)}</Text>
              <Pressable onPress={() => setInfoOpen(false)} hitSlop={10} style={styles.modalClose}>
                <Ionicons name="close" size={22} color="#1B0B22" />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={{ paddingBottom: 8 }}>
              <Text style={styles.modalText}>{getInfoForRoute(activeRoute)}</Text>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
      </View>
    </BlurOverlayProvider>
  );
}

const styles = StyleSheet.create({
  // Root-bakgrund så inget vitt syns bakom
  container: { 
    flex: 1,
    backgroundColor: '#5B2C6F',
  },
  content: { 
    flex: 1,
    backgroundColor: 'transparent',
  },

  // ---------- TOP ----------
  topEdgeBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#5B2C6F',
    zIndex: 100,
    elevation: 10,
  },

  topBackground: {
    position: 'absolute',
    top: -3,
    left: 0,
    right: 0,
    backgroundColor: '#5B2C6F',
    zIndex: 101,
    elevation: 11,
    justifyContent: 'flex-end',
    paddingBottom: 8,
  },

  headerRow: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },

  // Vänster varumärke (bild istället för text)
  leftBrand: {
    minWidth: 40,            // minst samma som info-knappens bredd
    paddingRight: 6,
    justifyContent: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Info-knapp till höger
  infoButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Absolut centrerad overlay för pillen (för exakt centrering)
  headerCenterOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },

  // Pill/etikett
  headerPill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: { elevation: 2 },
    }),
    backgroundColor: 'transparent', // Ensure no background
    borderWidth: 0, // Remove the border
    borderColor: 'transparent', // Ensure no border color
  },
  headerPillText: {
    color: '#FFFFFF', // Set text color to white
    fontSize: 18,
    fontWeight: '700',
    includeFontPadding: false,
  },

  // ---------- BOTTOM MENU ----------
  bottomMenuContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    backgroundColor: '#5B2C6F',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
  },
  bottomFill: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 20,
    backgroundColor: '#5B2C6F',
  },

  // Bottens knappar
  menuButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 64,
    height: 56,
    borderRadius: 16,
  },
  menuButtonPressed: { opacity: 0.9 },

  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  iconWrapActive: {
    backgroundColor: '#F5E6D9',
  },

  centerButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#0000001a',
    top: -30
  },
  centerButtonInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  centerButtonInnerActive: {
    backgroundColor: '#F5E6D9',
  },

  // ---------- MODAL ----------
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#F5E6D9',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 24,
    maxHeight: '70%',
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B0B22',
  },
  modalClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#1B0B22',
  },
  
});
