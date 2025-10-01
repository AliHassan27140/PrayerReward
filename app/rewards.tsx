import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/FontAwesome';
import { levels, getLevelProgress, useRewardSystem } from '../hooks/useRewardSystem';
import i18n from '../locales/i18n';
import { languageEvents } from '../hooks/languageEvents';

export default function RewardsScreen() {
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [, setLangTick] = useState(0); // force re-render on language change

  useEffect(() => {
    const onLangChanged = () => setLangTick((x) => x + 1);
    languageEvents.on('languageChanged', onLangChanged);
    return () => {
      languageEvents.off('languageChanged', onLangChanged);
    };
  }, []);

  const {
    totalPoints: realTotalPoints,
    currentLevel: realCurrentLevel,
    unlockedLevels: realUnlockedLevels,
    hasLevelUp,
    clearLevelUpNotification,
  } = useRewardSystem();

  // ========== TESTKOD ==========
  // const testPoints = 0;
  const testPoints = null;
    // Begränsa totalpoängen till högst 28
  const maxPoints = 28;
  const totalPoints = testPoints !== null ? testPoints : Math.min(realTotalPoints, maxPoints);
  const currentLevel =
    testPoints !== null
      ? levels.find((l) => testPoints >= l.totalPoints)?.level || 0
      : realCurrentLevel;
  const unlockedLevels =
    testPoints !== null
      ? levels.filter((l) => testPoints >= l.totalPoints).map((l) => l.level)
      : realUnlockedLevels;

  const renderLevelItem = (level: typeof levels[0]) => {
    const isUnlocked = unlockedLevels.includes(level.level);
    const progress = getLevelProgress(totalPoints, level.level);
    const isSelected = selectedLevel === level.level;
    
    
    

    return (
      <TouchableOpacity
        key={level.level}
        style={[
          styles.levelItem,
          isUnlocked && styles.levelItemUnlocked,
          isSelected && styles.levelItemSelected,
        ]}
        onPress={() => {
          if (isUnlocked) {
            setSelectedLevel(isSelected ? null : level.level);
          }
        }}
        disabled={!isUnlocked}
        activeOpacity={isUnlocked ? 0.7 : 1}
        accessibilityRole="button"
        accessibilityState={{ disabled: !isUnlocked, selected: isSelected }}
      >
        <View style={styles.levelHeader}>
          <View style={styles.levelIconContainer}>
            <Image
              source={
                isUnlocked
                  ? require('../assets/images/reward.png')
                  : require('../assets/images/lock.png')
              }
              style={[styles.levelIcon, !isUnlocked && styles.levelIconLocked]}
              resizeMode="contain"
              accessible
              accessibilityLabel={isUnlocked ? i18n.t('rewards.unlocked') : i18n.t('rewards.locked')}
            />
          </View>
          <View style={styles.levelInfo}>
            <Text style={[styles.levelTitle, !isUnlocked && styles.levelTitleLocked]}>
              {i18n.t('rewards.level')} {level.level}
            </Text>
            <Text style={[styles.levelPoints, !isUnlocked && styles.levelPointsLocked]}>
              {level.totalPoints} {i18n.t('rewards.pts')} - {level.timeEquivalent}
            </Text>
          </View>
        </View>

        {!isUnlocked && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress.percentage}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {progress.current}/{progress.required} {i18n.t('rewards.pts')}
            </Text>
          </View>
        )}

        {isSelected && isUnlocked && (
          <>
            <Image source={level.image} style={styles.historicImage} resizeMode="contain" />
            <View style={styles.levelDescription}>
              <Text style={styles.levelDescriptionText}>{level.title}</Text>
            </View>
          </>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel={i18n.t('rewards.back')}
        >
          <Icon name="arrow-left" size={20} color="#F5E6D9" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{i18n.t('rewards.headerTitle')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator
      >
        <View style={styles.titleSection}>
          <Text style={styles.title}>{i18n.t('rewards.allTime')}</Text>
          <Text style={styles.subtitle}>{i18n.t('rewards.pointsInfo')}</Text>
          <View style={styles.divider} />
        </View>

        {/* --- Stats card: oförändrad textstorlek, men mer längdutrymme --- */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalPoints}</Text>
            <Text
              style={styles.statLabel}
              numberOfLines={2}                // låt gå till 2 rader vid behov
              // inget auto-shrink -> behåller storleken
            >
              {i18n.t('rewards.totalPoints')}
            </Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statValue}>{currentLevel}</Text>
            <Text style={styles.statLabel} numberOfLines={2}>
              {i18n.t('rewards.currentLevel')}
            </Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statValue}>{unlockedLevels.length}</Text>
            <Text style={styles.statLabel} numberOfLines={2}>
              {i18n.t('rewards.unlocked')}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>{i18n.t('rewards.thresholdsTitle')}</Text>

        <View style={styles.levelsContainer}>{levels.map((level) => renderLevelItem(level))}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#5B2C6F' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#F5E6D9' },
  placeholder: { width: 36 },

  content: { flex: 1 },
contentContainer: {
  paddingHorizontal: 16,
  paddingBottom: 120,  // Öka detta värde för att ge mer utrymme för scrollning
  flexGrow: 1,  // Gör så att innehållet växer om det behövs
},


  titleSection: { alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: '800', color: '#F5E6D9', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#BDC3C7', marginBottom: 12 },
  divider: { height: 1, backgroundColor: '#ccc', width: '100%' },

  // ——— Stats card: lägg mer längdutrymme utan att minska fontstorlek ———
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,      // smalare inner-marginal ger mer plats för text
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  statValue: {
    fontSize: 28,              // behåller storlek
    fontWeight: '800',
    color: '#FFD700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,              // behåller storlek
    lineHeight: 16,
    color: '#BDC3C7',
    fontWeight: '600',
    textAlign: 'center',
    alignSelf: 'stretch',      // tillåt full bredd för wrap
    flexWrap: 'wrap',          // gör att texten bryts istället för att krympa
  },
  statDivider: {
    width: 1,
    marginHorizontal: 6,       // smalare divider ger mer horisontellt utrymme
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F5E6D9',
    textAlign: 'center',
    marginBottom: 16,
  },

  levelsContainer: { gap: 12 },
  levelItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  levelItemUnlocked: { backgroundColor: 'rgba(255, 215, 0, 0.1)', borderColor: '#FFD700' },
  levelItemSelected: { backgroundColor: 'rgba(255, 215, 0, 0.2)', borderColor: '#FFD700', borderWidth: 2 },
  levelHeader: { flexDirection: 'row', alignItems: 'center' },
  levelIconContainer: { marginRight: 12 },
  levelIcon: { width: 28, height: 28, borderRadius: 14 },
  levelIconLocked: { opacity: 0.4 },
  levelInfo: { flex: 1 },
  levelTitle: { fontSize: 18, fontWeight: '700', color: '#F5E6D9', marginBottom: 4 },
  levelTitleLocked: { color: 'rgba(255, 255, 255, 0.4)' },
  levelPoints: { fontSize: 15, color: '#BDC3C7', fontWeight: '500' },
  levelPointsLocked: { color: 'rgba(255, 255, 255, 0.3)' },
  progressContainer: { marginTop: 12 },
  historicImage: { width: '100%', height: 300, borderRadius: 12, marginBottom: 12, marginTop: 20 },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: { height: '100%', backgroundColor: '#9B59B6', borderRadius: 4 },
  progressText: { fontSize: 13, color: '#BDC3C7', textAlign: 'right', fontWeight: '600' },
  levelDescription: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  levelDescriptionText: { fontSize: 16, fontWeight: '600', color: '#FFD700', textAlign: 'center' },
});
