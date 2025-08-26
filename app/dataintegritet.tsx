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

  // Hide the sidebar button on this screen
  useEffect(() => {
    // Set header options to hide the sidebar button
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={30} color="#FFF" />
        </TouchableOpacity>
      ),
      // Hide the drawer button (sidebar toggle)
      drawerIcon: () => null, // Hide the drawer icon
      drawerLockMode: 'locked-closed', // Lock the drawer so it can't be opened
    });

    // Clean up when leaving the screen
    return () => {
      navigation.setOptions({
        drawerLockMode: 'unlocked', // Restore drawer toggle functionality
      });
    };
  }, [navigation]);

  return (
    <View style={[styles.container, { backgroundColor: '#522f60ff' }]}>
      {/* Upper background view with the same color as the container */}
      <View style={[styles.upperBackground, { backgroundColor: '#522f60ff' }]}>
        {/* Text header above the background */}
        <Text style={styles.headerText}>Integritet</Text>
      </View>

      {/* Back button */}
      <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={30} color="#FFF" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.bodyText}>
          Inga cookies. Inga annonser. Ingen spårning.
        </Text>
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
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,  // Add some padding to the container for better spacing
  },
  upperBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120, // This defines the height of the background bar at the top
    backgroundColor: '#522f60ff', // Matching background color
    zIndex: 10, // Make sure it's below the back button
    justifyContent: 'center', // Center the text vertically within the background
    alignItems: 'center', // Center the text horizontally within the background
  },
  contentContainer: {
    paddingBottom: 40,  // Ensure content doesn't get cut off on small screens
  },
  headerText: {
    color: '#FFF',
    fontSize: 30,
    textAlign: 'center',
    marginTop: 50,
    fontWeight: 'bold',
  },
  bodyText: {
    color: '#FFF',
    fontSize: 18,
    textAlign: 'left',
    marginTop: 20,
    lineHeight: 25,
  },
  backButton: {
    position: 'absolute',
    top: 69,  // Placerar knappen på samma höjd som i Sidebar-knappen
    left: 20, // Lika vänsterposition som sidomenyn
    zIndex: 20, // Säkerställer att knappen visas över andra element
    backgroundColor: '#9B59B6', // Lila bakgrund som i sidomenyn
    borderRadius: 50, // Rundar knappen
    width: 52,  // Lika storlek på knappen som sidebar
    height: 52, // Sätt samma höjd som bredden för att göra knappen rund
    justifyContent: 'center', // Centrerar innehållet (ikonen) horisontellt
    alignItems: 'center', // Centrerar innehållet (ikonen) vertikalt
    padding: 0,  // Ingen extra padding eftersom vi har satt bredd och höjd
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
});

export default DataintegritetScreen;
