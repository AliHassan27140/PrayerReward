import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';

const TermsScreen = () => {
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
        <Text style={styles.headerText}>Användarvillkor</Text>
      </View>

      {/* Back button */}
      <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={30} color="#FFF" />
      </TouchableOpacity>

      {/* ScrollView to allow scrolling */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.text}>1. Användarvillkor för [Appens namn]</Text>
        <Text style={styles.text}>2. Introduktion</Text>
        <Text style={styles.text}>
          Välkommen till [Appens namn]! Dessa användarvillkor ("Villkoren") styr din användning av [Appens namn] ("Appen"). Genom att använda Appen godkänner du att följa dessa Villkor. Om du inte accepterar Villkoren, vänligen avstå från att använda Appen.
        </Text>
        <Text style={styles.text}>3. Tjänstens syfte och funktioner</Text>
        <Text style={styles.text}>
          [Appens namn] är en app som gör det möjligt för användare att registrera sina bönetider och spara bönanteckningar. Appen erbjuder följande funktioner:
        </Text>
        <Text style={styles.text}>- Registrering och spårning av bönetider (timmar, minuter och sekunder).</Text>
        <Text style={styles.text}>- Spara och analysera bönstatistik.</Text>
        <Text style={styles.text}>- Lagra och organisera personliga bönanteckningar.</Text>
        <Text style={styles.text}>4. Användarkonto</Text>
        <Text style={styles.text}>
          För att använda Appens funktioner krävs ett användarkonto. Du är ansvarig för att hålla dina kontouppgifter, inklusive lösenord, konfidentiella och för alla aktiviteter som sker under ditt konto. Om du misstänker att någon annan har fått åtkomst till ditt konto, vänligen kontakta oss omedelbart.
        </Text>
        <Text style={styles.text}>5. Användning av tjänsten</Text>
        <Text style={styles.text}>
          Du godkänner att inte använda Appen för:
        </Text>
        <Text style={styles.text}>- Att utföra olagliga aktiviteter eller aktiviteter som kan skada, störa eller på annat sätt påverka Appen negativt.</Text>
        <Text style={styles.text}>- Att försöka få obehörig åtkomst till Appens system eller någon annan användares konto.</Text>
        <Text style={styles.text}>6. Datainsamling och lagring</Text>
        <Text style={styles.text}>
          För att ge dig bästa möjliga upplevelse lagrar vi viss användardata, inklusive bönetider, statistik och bönanteckningar. För mer information om hur vi hanterar dina data, vänligen se vår Dataintegritetspolicy.
        </Text>
        <Text style={styles.text}>7. Immateriella rättigheter</Text>
        <Text style={styles.text}>
          Allt innehåll, inklusive text, grafik och programvara i Appen, ägs av [Företagsnamn] och är skyddat av upphovsrätt och andra immateriella rättigheter. Du får inte använda eller distribuera detta material utan vårt uttryckliga tillstånd.
        </Text>
        <Text style={styles.text}>8. Ansvarsbegränsning</Text>
        <Text style={styles.text}>
          Appen tillhandahålls "i befintligt skick". Vi ansvarar inte för eventuella skador, förluster eller andra negativa konsekvenser som kan uppstå genom användning av Appen. Vi kan inte garantera att Appen alltid kommer att vara felfri eller tillgänglig.
        </Text>
        <Text style={styles.text}>9. Uppsägning av tjänsten</Text>
        <Text style={styles.text}>
          Vi förbehåller oss rätten att avsluta eller begränsa din åtkomst till Appen om du bryter mot dessa Villkor.
        </Text>
        <Text style={styles.text}>10. Ändringar av Villkoren</Text>
        <Text style={styles.text}>
          Vi kan uppdatera dessa Villkor när som helst. Eventuella ändringar publiceras i Appen, och du godkänner ändringarna genom att fortsätta använda Appen efter publiceringen.
        </Text>
        <Text style={styles.text}>11. Tillämplig lag</Text>
        <Text style={styles.text}>
          Dessa Villkor regleras av svensk lag och tvister ska hanteras av svensk domstol.
        </Text>
        <Text style={styles.text}>12. Kontakt</Text>
        <Text style={styles.text}>
          Om du har några frågor om dessa Villkor, kontakta oss på [kontaktinformation].
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
  scrollContainer: {
    flexGrow: 1,  // Makes sure the ScrollView takes up all available space
    paddingBottom: 100,  // Add some padding at the bottom to avoid content going under the back button
    marginTop: 120,  // Adjust this value to push text down under the back button
  },
  headerText: {
    color: '#FFF',
    fontSize: 30,
    textAlign: 'center',
    marginTop: 50,
    fontWeight: 'bold',
  },
  text: {
    color: '#FFF',
    fontSize: 18,
    textAlign: 'left',  // Align text to the left
    marginVertical: 10,
    lineHeight: 24,
    paddingHorizontal: 15,
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

export default TermsScreen;
