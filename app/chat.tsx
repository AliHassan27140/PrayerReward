import { Stack } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import i18n from '../locales/i18n';

const TOPBAR_HEIGHT = 70;      // Höjd på topbaren
const TOP_OFFSET = 40;         // Hur långt ner från toppen baren ligger
const SIDEBAR_BTN_WIDTH = 48;  // Reserverat utrymme för sidomeny-knapp

// Aktivera LayoutAnimation på Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type QA = {
  question: string;
  answer: string;
  verse?: string;
};

export default function FAQScreen() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const qaList = i18n.t('chat.questions', { returnObjects: true }) as QA[];

  const toggle = useCallback((index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenIndex(prev => (prev === index ? null : index));
  }, []);

  // Liten animation direkt när skärmen visas
  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={styles.safe}>
        {/* Topbar */}
        <View style={[styles.topBar, { height: TOPBAR_HEIGHT }]}>
          <View style={{ width: SIDEBAR_BTN_WIDTH }} />
          <Text style={styles.topTitle}>{i18n.t('chat.title')}</Text>
          <View style={{ width: SIDEBAR_BTN_WIDTH }} />
        </View>

        {/* Innehåll */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{
            paddingTop: TOP_OFFSET + TOPBAR_HEIGHT + 10,
            paddingBottom: 40,
          }}
        >
          <View style={styles.container}>
            {qaList.map((qa, index) => {
              const isOpen = openIndex === index;
              return (
                <View key={index} style={styles.qaItem}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => toggle(index)}
                    accessibilityRole="button"
                    accessibilityState={{ expanded: isOpen }}
                    style={[styles.questionCard, isOpen && styles.questionCardOpen]}
                  >
                    <View style={styles.row}>
                      <Text style={styles.questionText}>{qa.question}</Text>

                      {/* Enkel “chevron” som roterar */}
                      <View style={[styles.chevron, isOpen && styles.chevronOpen]}>
                        <Text style={styles.chevronGlyph}>⌄</Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {isOpen && (
                    <View style={styles.answerCard}>
                      <View style={styles.answerInner}>
                        <Text style={styles.answerText}>{qa.answer}</Text>

                        {!!qa.verse && (
                          <>
                            <View style={styles.divider} />
                            <View style={styles.versePill}>
                              <Text numberOfLines={1} style={styles.versePillText}>
                                {i18n.t('chat.bibleVerseLabel', { defaultValue: 'Bibelvers' })}:
                              </Text>
                              <Text style={styles.verseText}>{qa.verse}</Text>
                            </View>
                          </>
                        )}
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const COLORS = {
  bg: '#5B2C6F',          // Bakgrund (lila)
  card: '#9B59B6',        // Primär card
  cardAlt: '#522F60FF',   // Svarsbakgrund
  textOnCard: '#F5E6D9',  // Rubriktext
  textSubtle: '#BDC3C7',  // Brödtext
  border: '#9B59B6',      // Kant/Skugga
  shadow: '#2E1A35',      // Djup skugga
};

const RADIUS = 12; // lite mindre rundning

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  // Top navbar
  topBar: {
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14, // något mindre än 16
    flexDirection: 'row',
  },

  topTitle: {
    flex: 1,
    fontSize: 20, // från 22 → 20
    color: COLORS.textOnCard,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: -5,
  },

  scroll: { flex: 1 },

  container: {
    width: '90%',
    maxWidth: 620, // något mindre maxbredd
    alignSelf: 'center',
  },

  qaItem: {
    marginBottom: 16, // från 18 → 16
  },

  questionCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS,
    paddingVertical: 14, // från 16 → 14
    paddingHorizontal: 12, // från 14 → 12
    elevation: 3,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 4,
    borderWidth: 0,
  },

  questionCardOpen: {
    elevation: 4,
    shadowOpacity: 0.20,
    transform: [{ translateY: -1 }],
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  questionText: {
    flex: 1,
    color: COLORS.textOnCard,
    fontSize: 17, // från 18 → 17
    fontWeight: '600',
    lineHeight: 21,
  },

  chevron: {
    width: 26, // från 28 → 26
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '0deg' }],
  },

  chevronOpen: {
    transform: [{ rotate: '180deg' }],
  },

  chevronGlyph: {
    color: COLORS.textOnCard,
    fontSize: 18, // från 20 → 18
    marginTop: -2,
  },

  answerCard: {
    backgroundColor: COLORS.cardAlt,
    borderRadius: RADIUS,
    marginTop: 7, // från 8 → 7
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  answerInner: {
    padding: 14, // från 16 → 14
  },

  answerText: {
    fontSize: 15, // från 16 → 15
    color: COLORS.textSubtle,
    lineHeight: 21,
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#A77AC5',
    marginVertical: 10, // från 12 → 10
    opacity: 0.6,
  },

  versePill: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: 5,
  },

  versePillText: {
    fontSize: 13,
    color: COLORS.textOnCard,
    opacity: 0.9,
    fontWeight: '700',
  },

  verseText: {
    fontSize: 13,
    color: COLORS.textSubtle,
    fontStyle: 'italic',
    flexShrink: 1,
  },
});
