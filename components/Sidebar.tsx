/*
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Definiera en mer exakt typ för icon-typen som motsvarar de tillåtna ikonerna
type IconName = 
  | "home-outline" 
  | "restaurant-outline" 
  | "heart-outline" 
  | "settings-outline" 
  | "pulse";

// Menyobjekt för sidomenyn
const items = [
  { name: 'Hem', icon: 'home-outline', route: '/home' },
  { name: 'Böneliv', icon: 'restaurant-outline', route: '/boneliv' },
  { name: 'Bönebok', icon: 'heart-outline', route: '/minaboner' },
  // Ta bort Frågor & Svar och Aktivitet
  { name: 'Inställningar', icon: 'settings-outline', route: '/instellningar' },
];

type SidebarProps = {
  onItemPress: (route: string) => void;  // onItemPress tar emot en specifik väg
};

const Sidebar: React.FC<SidebarProps> = ({ onItemPress }) => {
  return (
    <View style={styles.sidebar}>
      <View style={styles.header}>
        <Ionicons name="flame-outline" size={40} color="#F5E6D9" />
        <Text style={styles.headerText}>Haye</Text>
      </View>

      <ScrollView style={styles.menu}>
        {items.map((item) => (
          <TouchableOpacity
            key={item.route}
            style={styles.menuItem}
            onPress={() => onItemPress(item.route)}
          >
     /*
            <Ionicons name={item.icon as IconName} size={22} color="#F5E6D9" style={styles.menuIcon} />
            <Text style={styles.menuText}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};
/*
// Kommentarer ut hela StyleSheet-koden också
/*
const styles = StyleSheet.create({
  sidebar: {
    flex: 1,
    backgroundColor: '#5B2C6F',  // Matching the safe background color
    paddingTop: 90,  // Increased the top padding to push everything further down
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 30,
    fontWeight: '700',
    marginLeft: 8,
    color: '#F5E6D9',  // Light text color for contrast
  },
  menu: { flex: 1 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,  // Slightly more space between each menu item
    borderRadius: 8,
    marginVertical: 6,
    paddingHorizontal: 12,  // Slightly more padding for a more spacious feel
    backgroundColor: '#9B59B6',  // Updated to match the purple theme
  },
  menuItemActive: {
    backgroundColor: '#F39C12',  // Active item in yellow
  },
  menuIcon: {
    marginRight: 14,  // Increased space between icon and text
  },
  menuText: {
    fontSize: 18,
    color: '#F5E6D9',  // Light text color for contrast
    fontWeight: '600',
  },
});
*/
/*
export default Sidebar;
*/
