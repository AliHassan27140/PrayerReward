import React, { createContext, useContext, useState, ReactNode } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface BlurOverlayContextType {
  showBlurOverlay: () => void;
  hideBlurOverlay: () => void;
  isBlurVisible: boolean;
}

const BlurOverlayContext = createContext<BlurOverlayContextType | undefined>(undefined);

interface BlurOverlayProviderProps {
  children: ReactNode;
}

export const BlurOverlayProvider: React.FC<BlurOverlayProviderProps> = ({ children }) => {
  const [isBlurVisible, setIsBlurVisible] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const showBlurOverlay = () => {
    setIsBlurVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hideBlurOverlay = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsBlurVisible(false);
    });
  };

  return (
    <BlurOverlayContext.Provider value={{ showBlurOverlay, hideBlurOverlay, isBlurVisible }}>
      {children}
      
      {isBlurVisible && (
        <>
          {/* Background blur layers without Modal */}
          <View style={[StyleSheet.absoluteFillObject, styles.blurLayer1]} pointerEvents="none" />
          <View style={[StyleSheet.absoluteFillObject, styles.blurLayer2]} pointerEvents="none" />
          <Animated.View 
            style={[
              StyleSheet.absoluteFillObject,
              styles.darkOverlay,
              { opacity: fadeAnim }
            ]}
            pointerEvents="none"
          />
        </>
      )}
    </BlurOverlayContext.Provider>
  );
};

// Custom hook to use the blur overlay
export const useBlurOverlay = () => {
  const context = useContext(BlurOverlayContext);
  if (context === undefined) {
    throw new Error('useBlurOverlay must be used within a BlurOverlayProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  blurLayer1: {
    backgroundColor: 'rgba(74, 35, 90, 0.85)', // Purple tint
    zIndex: 500,
    elevation: 500,
  },
  blurLayer2: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dark overlay
    zIndex: 600,
    elevation: 600,
  },
  darkOverlay: {
    backgroundColor: 'rgba(28, 14, 35, 0.3)', // Extra dark purple
    zIndex: 700,
    elevation: 700,
  },
});

export default BlurOverlayContext;