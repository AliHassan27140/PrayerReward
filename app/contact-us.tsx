import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';

const ContactUsScreen = () => {
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
      {/* Back button */}
      <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={30} color="#FFF" />
      </TouchableOpacity>
      <Text style={styles.text}>Kontakta oss</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,  // Add some padding to the container for better spacing
  },
  text: {
    color: '#FFF',
    fontSize: 24,
    textAlign: 'center',
    marginTop: 50,
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

export default ContactUsScreen;
