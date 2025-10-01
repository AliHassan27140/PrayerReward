import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Animated, Image } from 'react-native';

interface LevelUpRewardPopupProps {
  onLevelUp: () => void;
  onCancel: () => void;
  t: (key: string, defaultValue: string) => string;
}

const LevelUpRewardPopup: React.FC<LevelUpRewardPopupProps> = ({ onLevelUp, onCancel, t }) => {
  const [scale] = useState(new Animated.Value(1)); // Create an animated value for scale

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95, // Scale down when pressed
      friction: 4,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1, // Scale back to normal when press is released
      friction: 4,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.popupContainer}>
        <Image 
          source={require('../assets/images/gift.gif')} // Path to the image you want to display
          style={styles.popupImage}
        />
        <Text style={styles.popupTitle}>{t('boneliv.rewardUnlocked', 'You have unlocked a new reward!')}</Text>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.button}
            onPressIn={onPressIn} // Trigger scale down on press in
            onPressOut={onPressOut} // Trigger scale up on press out
            onPress={onCancel}
          >
            <Text style={styles.buttonText}>{t('boneliv.cancel', 'Cancel')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            onPress={onLevelUp}
          >
            <Text style={styles.buttonText}>{t('boneliv.goThere', 'Go there')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent dark background
    justifyContent: 'center', // Center content vertically
    alignItems: 'center', // Center content horizontally
    zIndex: 999, // Ensure it stays on top of other content
  },
  popupContainer: {
    width: 320,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  popupImage: {
    width: 100, // Adjust size as needed
    height: 100, // Adjust size as needed
    marginBottom: 15, // Space between the image and the title
  },
  popupTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3D1D47',
    marginBottom: 15,
    textAlign: 'center',
    lineHeight: 28,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#8E44AD',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    shadowColor: '#8E44AD',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default LevelUpRewardPopup;
