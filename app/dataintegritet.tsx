import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';

const DataintegritetScreen = () => {
  const router = useRouter();
  const navigation = useNavigation();

  // Handle going back to the previous screen
  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back(); // This goes back to the previous screen using expo-router
    } else {
      navigation.goBack(); // This goes back to the previous screen using React Navigation
    }
  };

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={30} color="#FFF" />
        </TouchableOpacity>
      ),
      drawerIcon: () => null, 
      drawerLockMode: 'locked-closed', // Lock the drawer so it can't be opened
    });

    return () => {
      navigation.setOptions({
        drawerLockMode: 'unlocked', // Restore drawer toggle functionality
      });
    };
  }, [navigation]);

  return (
    <View style={[styles.container, { backgroundColor: '#522f60ff' }]}>
      {/* Back Button and Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={30} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.header}>Integritetspolicy</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Privacy Content */}
        <Text style={styles.sectionTitle}>Inga cookies. Inga annonser. Ingen spårning.</Text>
        <Text style={styles.bodyText}>
          Dina böneuppgifter lämnar aldrig din enhet.
        </Text>
        <Text style={styles.bodyText}>
          Allt du lägger in i Prayminder – som böneteman eller anteckningar – sparas lokalt i en databas på din enhet. Vi laddar aldrig upp, samlar in eller får tillgång till den informationen på något sätt.
        </Text>
        <Text style={styles.bodyText}>
          (Viktigt: om du avinstallerar appen försvinner dina uppgifter.)
        </Text>
        <Text style={styles.bodyText}>
          För att hjälpa oss förbättra upplevelsen använder Prayminder Google Analytics för att samla in anonym användningsdata – till exempel när ”Amen”-knappen trycks eller i vilket geografiskt område appen används. Denna data kopplas aldrig till dig som person.
        </Text>
        <Text style={styles.bodyText}>
          Böneremindrar schemaläggs och hanteras direkt av appen på din enhet. Ingen server, ingen molnanslutning behövs. Den enda begränsningen är att du behöver öppna appen var tredje–fjärde dag för att påminnelserna ska fortsätta fungera.
        </Text>
        <Text style={styles.bodyText}>
          Vi har byggt Prayminder på det här sättet eftersom vi tror att bön alltid ska vara säker, privat och enkel.
        </Text>

        {/* Faint Text */}
        <Text style={styles.privacyHintText}></Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,  // Add some padding to the container for better spacing
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 0, // Adjust the marginTop to make the back button a bit higher
    marginBottom: 20,
    justifyContent: 'center', // Center both the icon and header
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
  scrollContainer: {
    flexGrow: 1,  // Makes sure the ScrollView takes up all available space
    paddingBottom: 100,  // Add some padding at the bottom to avoid content going under the back button
    marginTop: 0,  // Adjust this value to push text down under the back button
  },
  bodyText: {
    color: '#FFF',
    fontSize: 18,
    textAlign: 'left',
    marginTop: 20,
    lineHeight: 25,
  },
  privacyHintText: {
    fontSize: 12,
    color: '#F5E6D9',
    textAlign: 'center',
    marginTop: 10,
    opacity: 0.7,  // Faint text effect
  },
});

export default DataintegritetScreen;
