import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Slot, useRouter, useSegments } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { languageEvents } from '../hooks/languageEvents';
import i18n, { initI18n, setAppLanguage } from "../locales/i18n";

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

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

export default function RootLayout() {
  const segments = useSegments();
  const router = useRouter();

  const [activeRoute, setActiveRoute] = useState<ValidRoutes>("/home");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [scale] = useState(new Animated.Value(1)); // For animating the flame icon
 const [ready, setReady] = useState(false);
 const [reloadKey, setReloadKey] = useState(0);

  // Kontrollera om användaren är inloggad genom att läsa från AsyncStorage
  useEffect(() => {
    const checkIfLoggedIn = async () => {
      const storedEmail = await AsyncStorage.getItem('email');
      const storedPassword = await AsyncStorage.getItem('password');
      if (storedEmail && storedPassword) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    };

    checkIfLoggedIn();
  }, []);

  useEffect(() => {
    (async () => {
      await initI18n();
      setReady(true);
    })();
  }, []);

  useEffect(() => {
  const listener = async (lang: string) => {
    console.log("LANG => ", lang)
   await setAppLanguage(lang);
  setReloadKey((prev) => prev + 1);
  };
  languageEvents.on('languageChanged', listener);
  return () => {
    languageEvents.off('languageChanged', listener);
  };
}, []);
  
  const isIndexPage = !segments[0];
  const shouldShowMenu = !isIndexPage && isLoggedIn;

  const handleSidebarItemPress = (item: ValidRoutes) => {
    setActiveRoute(item); 
    router.push(item); // Use activeRoute which is of ValidRoutes type
  };

  const handleFlameButtonPress = () => {
    console.log("Flame button pressed!");
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.2, // Scale up
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1, // Scale back down
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    console.log("Navigating to /home");
    router.push("/home");
  };

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={"#fff"} />
      </View>
    );
  }

  return (
    <View style={styles.container} key={reloadKey}>
      <View style={styles.content}>
        <Slot />
      </View>

      {shouldShowMenu && (
        <View style={styles.bottomMenuContainer}>
          <TouchableOpacity
            style={[styles.menuButton, activeRoute === "/minaboner" && styles.activeButton]} 
            onPress={() => handleSidebarItemPress("/minaboner")}
          >
            <Ionicons name="book-outline" size={30} color={activeRoute === "/minaboner" ? "#F5E6D9" : "#B0B0B0"} />
            <Text style={[styles.menuButtonText, activeRoute === "/minaboner" && styles.activeButtonText]}>{i18n.t('rootMenu.prayerBook')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuButton, activeRoute === "/boneliv" && styles.activeButton]}
            onPress={() => handleSidebarItemPress("/boneliv")}
          >
            <Ionicons name="heart-outline" size={30} color={activeRoute === "/boneliv" ? "#F5E6D9" : "#B0B0B0"} />
            <Text style={[styles.menuButtonText, activeRoute === "/boneliv" && styles.activeButtonText]}>{i18n.t('rootMenu.prayerLife')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              {
                justifyContent: 'center',
                alignItems: 'center',
                width: 70,             // Sätt en bredd för den runda knappen
                height: 70,   
                top:  -25,         // Sätt en höjd för den runda knappen
                backgroundColor: activeRoute === "/home" ? '#fff' : '#B0B0B0',  // Byt färg baserat på om knappen är aktiv
                borderRadius: 35,      // Gör knappen rund
                borderWidth: 1,        // Tunn kant
              },
            ]}
            onPress={() => handleSidebarItemPress("/home")}
          >
            <Ionicons 
              name="flame" 
              size={40} 
              color="#000"  // Färgen på ikonen sätts till svart
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuButton, activeRoute === "/chat" && styles.activeButton]}
            onPress={() => handleSidebarItemPress("/chat")}
          >
            <Ionicons name="chatbubbles-outline" size={30} color={activeRoute === "/chat" ? "#F5E6D9" : "#B0B0B0"} />
            <Text style={[styles.menuButtonText, activeRoute === "/chat" && styles.activeButtonText]}>{i18n.t('rootMenu.info')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuButton, activeRoute === "/instellningar" && styles.activeButton]}
            onPress={() => handleSidebarItemPress("/instellningar")}
          >
            <Ionicons name="settings-outline" size={30} color={activeRoute === "/instellningar" ? "#F5E6D9" : "#B0B0B0"} />
            <Text style={[styles.menuButtonText, activeRoute === "/instellningar" && styles.activeButtonText]}>{i18n.t('rootMenu.settings')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  bottomMenuContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    left: 0, 
    right: 0,
    width: SCREEN_WIDTH, 
    backgroundColor: '#5B2C6F',
    justifyContent: 'space-evenly',  // Distribute items evenly
    paddingVertical: 8,  // Reduced vertical padding
    paddingHorizontal: 10,  // Reduced horizontal padding
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },

  menuButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,  // Reduced padding
    paddingHorizontal: 8,  // Reduced horizontal padding
    width: 70,  // Ensured consistent width for buttons
  },
  activeButton: {
    borderRadius: 50,
  },
  menuButtonText: {
    color: '#B0B0B0',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
  activeButtonText: {},
  floatingButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#9B59B6',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: SCREEN_HEIGHT / 2 - 314,
    left: SCREEN_WIDTH / 2 - 35,
    elevation: 10,
  },
});
