import React from 'react';
import { Modal, TouchableOpacity, Text, View, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Importera Ionicons

type SupportModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubscribe: (amount: number) => void;
};

const SupportModal: React.FC<SupportModalProps> = ({ visible, onClose, onSubscribe }) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.modalContent}>
              {/* ECHO+ Header with Icon */}
              <View style={styles.headerContainer}>
                {/* Main Title */}
                <Text style={styles.modalTitle}>Bli medlem i HAYYE+ idag!</Text>
                {/* Underline */}
                <View style={styles.underline}></View>
              </View>

              {/* "HAYYE APP" text and verification icon */}
              <View style={styles.appInfoContainer}>
                <Text style={styles.appText}>HAYYE</Text>
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color="#B0EACD" // Mild green for a verified feel
                  style={styles.brandIcon}
                />
              </View>

              {/* Subscription Details */}
              <Text style={styles.modalText}>
                Genom att bli Hayye+ medlem stödjer du oss i att täcka allt underhåll och utveckling 
                av appen, vilket gör att vi kan fortsätta förbättra och optimera den för alla 
                våra användare. Alla Hayye+ konton blir helt reklamfria, så att användarna kan njuta av en mer 
                fokuserad och bekväm användarupplevelse. Tack för ditt givarskap och stöd - Gud välsigne dig!
              </Text>

              {/* Subscription Button */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => onSubscribe(9)} // Prenumerera för 9 kr
                  activeOpacity={0.9}
                >
                  <Text style={styles.modalButtonText}>
                    <Text style={styles.largerText}>Få en annonsfri upplevelse nu!</Text>
                    {'\n'}
                    <Text style={styles.smallerText}>Endast 16,58 kr/månad, faktureras årligen för 199,00 kr.</Text>
                    {'\n'}
                  </Text>

                  <Text style={styles.clickHereText}>Klicka här för att aktivera!</Text>
                </TouchableOpacity>
              </View>

              {/* Restore Purchases */}
              <TouchableOpacity onPress={() => {}} style={styles.restorePurchases}>
                <Text style={styles.restoreText}>Återställ köp</Text>
              </TouchableOpacity>

              {/* Bottom Text - Subscription Terms */}
              <Text style={styles.termsText}>
                Prenumerationsvillkor: Denna årliga prenumeration kostar 199,99 kr och förnyas automatiskt varje år. När köpet har genomförts aktiveras den reklamfria upplevelsen direkt.
              </Text>

              {/* Legal Links */}
              <View style={styles.linksContainer}>
                <TouchableOpacity onPress={() => {/* Handle User Terms */}}>
                  <Text style={styles.linkText}>Användarvillkor</Text>
                </TouchableOpacity>
                <Text style={styles.linkSeparator}> | </Text>
                <TouchableOpacity onPress={() => {/* Handle Data Integrity */}}>
                  <Text style={styles.linkText}>Dataintegritet</Text>
                </TouchableOpacity>
              </View>

              {/* Close Button at the very bottom */}
              <View style={styles.closeButtonContainer}>
                <TouchableOpacity onPress={onClose} style={styles.secondaryCloseBtn}>
                  <Text style={styles.secondaryCloseBtnText}>Stäng</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    width: 350,
    padding: 30,
    backgroundColor: '#522f60ff', // Background color as before
    borderRadius: 14,
    marginTop: 10,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#F5E6D9', // Light color for the title
  },
  // Underline style
  underline: {
    width: '100%',
    height: 1,
    backgroundColor: '#BDC3C7', // Light grey color for the line
    marginTop: 10, // Space between title and line
  },
  appInfoContainer: {
    flexDirection: 'row', // Align text and icon horizontally
    justifyContent: 'center', // Center the content horizontally
    marginBottom: 20, // Space between title and the next text
    alignItems: 'center', // Align vertically
  },
  appText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff', // White text color for HAYYE APP
    marginRight: 4, // Adjusted space between the text and icon
  },
  brandIcon: {
    marginLeft: 2, // Reduced space between text and icon
  },
  modalText: {
    fontSize: 16,
    color: '#BDC3C7',
    textAlign: 'center',
    marginBottom: 25,
  },
  modalButton: {
    backgroundColor: '#8E44AD', // Original button color
    padding: 14,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
  smallerText: {
    fontSize: 13,
    color: '#BDC3C7',
  },
  largerText: {
    fontSize: 18,
  },
  buttonContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  restorePurchases: {
    marginTop: 20,
    alignItems: 'center',
  },
  restoreText: {
    fontSize: 16,
    color: '#c65ff3ff', // Button color for restore purchases
  },
  closeButtonContainer: {
    marginTop: 50,
    alignItems: 'center',
  },
  secondaryCloseBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  secondaryCloseBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  termsText: {
    fontSize: 12,
    color: '#BDC3C7',
    textAlign: 'center',
    marginTop: 20,
  },
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
  linkText: {
    color: '#c65ff3ff',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  linkSeparator: {
    color: '#BDC3C7',
    fontSize: 14,
  },
  clickHereText: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    fontStyle: 'italic', // För att göra texten kursiv
    marginTop: 10,
  },
});

export default SupportModal;
