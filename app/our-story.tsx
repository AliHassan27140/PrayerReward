import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';

const OurStoryScreen = () => {
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
        <Text style={styles.header}>Vår Historia</Text>
      </View>

      <ScrollView contentContainerStyle={styles.menuContainer}>
        {/* Story Section */}
    <Text style={styles.sectionTitle}>Väx i din tro och böneliv</Text>
<Text style={styles.bodyText}>
  Vår passion handlar om att hjälpa människor att växa i sin tro och böneliv. Vi tror att en stark relation med Gud inte bara bygger på andakt, utan också på medvetenhet och reflektion över den andliga resan. Därför har vi skapat ett verktyg för att inte bara be, utan också för att aktivt följa din utveckling och se hur dina böner påverkar ditt liv.
</Text>
<Text style={styles.bodyText}>
  Genom att ha kontroll över din bönestatistik och kristna liv kan du se de konkreta resultaten av din andakt. Varje bön, varje stund av tystnad och reflektion, gör skillnad. Med vår app kan du enkelt hålla reda på dina böner, de tider du bett, och hur du utvecklas i din relation till Gud.
</Text>
<Text style={styles.bodyText}>
  Vår vision är att hjälpa dig att fortsätta växa, både andligt och mentalt, och att ge dig verktygen att förstå din resa med Gud på djupet. Vi tror att det att se sin utveckling, inte bara genom bön utan även genom att förstå sin egen andliga tillväxt, kan ge en extra dimension till ditt liv.
</Text>

<Text style={styles.storyHintText}>
  Låt oss vara en del av din resa. Klicka här för att börja följa din utveckling.
</Text>


        {/* Faint Text */}
        <Text style={styles.storyHintText}>
          Klicka här för att läsa mer om vår resa.
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
    marginTop: 20,
    marginBottom: 20,
    justifyContent: 'center',
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
  menuContainer: {
    paddingTop: 10,
  },
  bodyText: {
    fontSize: 18,
    color: '#F5E6D9',
    textAlign: 'left',
    marginTop: 20,
    lineHeight: 25,
  },
  storyHintText: {
    fontSize: 12,
    color: '#F5E6D9',
    textAlign: 'center',
    marginTop: 10,
    opacity: 0.7,  // Making the text faint
  },
});

export default OurStoryScreen;
