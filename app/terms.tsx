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

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={30} color="#FFF" />
        </TouchableOpacity>
      ),
      drawerIcon: () => null, 
      drawerLockMode: 'locked-closed',
    });

    return () => {
      navigation.setOptions({
        drawerLockMode: 'unlocked',
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
        <Text style={styles.header}>Användarvillkor</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Terms and Content */}
        <Text style={styles.sectionTitle}>1. Användarvillkor för [Appens namn]</Text>
        <Text style={styles.text}>Välkommen till [Appens namn]! Dessa användarvillkor ("Villkoren") styr din användning av [Appens namn] ("Appen"). Genom att använda Appen godkänner du att följa dessa Villkor. Om du inte accepterar Villkoren, vänligen avstå från att använda Appen.</Text>
        
        <Text style={styles.sectionTitle}>2. Tjänstens syfte och funktioner</Text>
        <Text style={styles.text}>[Appens namn] är en app som gör det möjligt för användare att registrera sina bönetider och spara bönanteckningar. Appen erbjuder följande funktioner:</Text>
        <Text style={styles.text}>- Registrering och spårning av bönetider (timmar, minuter och sekunder).</Text>
        <Text style={styles.text}>- Spara och analysera bönstatistik.</Text>
        <Text style={styles.text}>- Lagra och organisera personliga bönanteckningar.</Text>

        <Text style={styles.sectionTitle}>3. Användarkonto</Text>
        <Text style={styles.text}>För att använda Appens funktioner krävs ett användarkonto. Du är ansvarig för att hålla dina kontouppgifter, inklusive lösenord, konfidentiella och för alla aktiviteter som sker under ditt konto. Om du misstänker att någon annan har fått åtkomst till ditt konto, vänligen kontakta oss omedelbart.</Text>

        <Text style={styles.sectionTitle}>4. Användning av tjänsten</Text>
        <Text style={styles.text}>Du godkänner att inte använda Appen för:</Text>
        <Text style={styles.text}>- Att utföra olagliga aktiviteter eller aktiviteter som kan skada, störa eller på annat sätt påverka Appen negativt.</Text>
        <Text style={styles.text}>- Att försöka få obehörig åtkomst till Appens system eller någon annan användares konto.</Text>

        {/* More content sections as necessary */}

        {/* Faint Text */}
        <Text style={styles.termsHintText}></Text>
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
    marginTop: 0, // Space from the top
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
  text: {
    color: '#FFF',
    fontSize: 18,
    textAlign: 'left',
    marginVertical: 10,
    lineHeight: 24,
    paddingHorizontal: 15,
  },
  termsHintText: {
    fontSize: 12,
    color: '#F5E6D9',
    textAlign: 'center',
    marginTop: 10,
    opacity: 0.7,  // Making the text faint
  },
});

export default TermsScreen;
