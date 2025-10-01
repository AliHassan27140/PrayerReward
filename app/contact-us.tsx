import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const UserAccountScreen = () => {
  const navigation = useNavigation();

  const [userData, setUserData] = useState({
    email: '',
  });

  useEffect(() => {
    // Simulating user data; no need to use Firebase here since we are replacing the email text.
    setUserData({
      email: 'Hayyeapp', // Use Hayyeapp instead of email address.
    });
  }, []);

  // Function to open Instagram link when the section is clicked
  const handleInstagramPress = () => {
    Linking.openURL('https://www.instagram.com/hayyeapp/')
      .catch((err) => console.error("Couldn't open Instagram", err));
  };

  return (
    <View style={[styles.container, { backgroundColor: '#522f60ff' }]}>
      {/* Back Button and Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={30} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.header}>Kontakta oss</Text>
      </View>

      <ScrollView contentContainerStyle={styles.menuContainer}>
        {/* Instagram Section */}
        <Text style={styles.sectionTitle}>INSTAGRAM</Text>
        <TouchableOpacity onPress={handleInstagramPress} style={styles.menuItem}>
          <Ionicons name="logo-instagram" size={24} color="#F5E6D9" />
          <Text style={styles.menuText}>Hayyeapp</Text> {/* Keeping 'Instagram' text */}
        </TouchableOpacity>

        {/* Faint Text Under Instagram Section */}
        <Text style={styles.instagramHintText}>
          Klicka på Instagram formen för att komma till våran instagram
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20, // Space from the top
    marginBottom: 20,
    justifyContent: 'center', // Center both the icon and header
  },
  backButton: {
    position: 'absolute',
    left: 0, // Move back button to the left
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
  menuContainer: {
    paddingTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: '#6a4b8d',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  menuText: {
    fontSize: 16,
    marginLeft: 15,
    color: '#F5E6D9',
  },
  instagramHintText: {
    fontSize: 12,
    color: '#F5E6D9',
    textAlign: 'center',
    marginTop: 10,
    opacity: 0.7,  // To make the text faint
  },
});

export default UserAccountScreen;
