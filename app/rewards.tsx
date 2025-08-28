import React, { useState } from 'react';
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

export default function RewardsScreen() {
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  
  const {
    totalPoints: realTotalPoints,
    currentLevel: realCurrentLevel,
    unlockedLevels: realUnlockedLevels,
    hasLevelUp,
    clearLevelUpNotification,
  } = useRewardSystem();

  // ========== VIBRATION TEST - COMMENT/UNCOMMENT TO TEST ==========
  // Uncomment this to test lightning vibration manually:
  // const [testVibration, setTestVibration] = useState(false);
  
  // ========== TEST CODE - COMMENT/UNCOMMENT TO TEST LEVELS ==========
  // Uncomment ONE of these lines to test different levels:
  
  // const testPoints = 0;   // No levels unlocked
  // const testPoints = 1;   // Level 1 unlocked
  // const testPoints = 3;   // Level 1-2 unlocked
  // const testPoints = 6;   // Level 1-3 unlocked
  // const testPoints = 10;  // Level 1-4 unlocked
  // const testPoints = 15;  // Level 1-5 unlocked
  // const testPoints = 21;  // Level 1-6 unlocked
  // const testPoints = 28;  // All levels unlocked
  
  // Comment out this line to use test data:
  const testPoints = null;
  
  // Use test data or real data
  const totalPoints = testPoints !== null ? testPoints : realTotalPoints;
  const currentLevel = testPoints !== null ? levels.find(l => testPoints >= l.totalPoints)?.level || 0 : realCurrentLevel;
  const unlockedLevels = testPoints !== null ? levels.filter(l => testPoints >= l.totalPoints).map(l => l.level) : realUnlockedLevels;
  // ========== END TEST CODE ==========

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
      >
        <View style={styles.levelHeader}>
          <View style={styles.levelIconContainer}>
            <Image
              source={isUnlocked ? require('../assets/images/reward.jpeg') : require('../assets/images/lock.png')}
              style={[
                styles.levelIcon,
                !isUnlocked && styles.levelIconLocked
              ]}
              resizeMode='contain'
            />
          </View>
          <View style={styles.levelInfo}>
            <Text style={[styles.levelTitle, !isUnlocked && styles.levelTitleLocked]}>
              Level {level.level}
            </Text>
            <Text style={[styles.levelPoints, !isUnlocked && styles.levelPointsLocked]}>
              {level.totalPoints} pts - {level.timeEquivalent}
            </Text>
          </View>
        </View>
        {!isUnlocked && (
          <>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progress.percentage}%` }
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {progress.current}/{progress.required} pts
            </Text>
          </View>
          </>
        )}

        {isSelected && isUnlocked && (
          <>
                  <Image
          source={require('../assets/images/historic.jpeg')}
          style={styles.historicImage}
          resizeMode='contain'
        />

          <View style={styles.levelDescription}>
            <Text style={styles.levelDescriptionText}>
              {level.title}
            </Text>
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
        >
          <Icon name="arrow-left" size={20} color="#F5E6D9" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🏆 Reward System</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.titleSection}>
          <Text style={styles.title}>All Time</Text>
          <Text style={styles.subtitle}>(30 minutes = 1 point)</Text>
          <View style={styles.divider} />
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalPoints}</Text>
            <Text style={styles.statLabel}>Total Points</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{currentLevel}</Text>
            <Text style={styles.statLabel}>Current Level</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{unlockedLevels.length}</Text>
            <Text style={styles.statLabel}>Unlocked</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Level thresholds (7 levels, cumulative points)
        </Text>

        <View style={styles.levelsContainer}>
          {levels.map((level) => renderLevelItem(level))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5B2C6F',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F5E6D9',
  },
  placeholder: {
    width: 36, // Same width as back button for centering
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 120,
    flexGrow: 1,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 25,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F5E6D9',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#BDC3C7',
    marginBottom: 15,
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    width: '100%',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFD700',
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 13,
    color: '#BDC3C7',
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F5E6D9',
    textAlign: 'center',
    marginBottom: 20,
  },
  levelsContainer: {
    gap: 12,
  },
  levelItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  levelItemUnlocked: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderColor: '#FFD700',
  },
  levelItemSelected: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderColor: '#FFD700',
    borderWidth: 2,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelIconContainer: {
    marginRight: 15,
  },
  levelIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  levelIconLocked: {
    opacity: 0.4,
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F5E6D9',
    marginBottom: 4,
  },
  levelTitleLocked: {
    color: 'rgba(255, 255, 255, 0.4)',
  },
  levelPoints: {
    fontSize: 15,
    color: '#BDC3C7',
    fontWeight: '500',
  },
  levelPointsLocked: {
    color: 'rgba(255, 255, 255, 0.3)',
  },
  progressContainer: {
    marginTop: 12,
  },
  historicImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    marginBottom: 12,
    marginTop: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#9B59B6',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    color: '#BDC3C7',
    textAlign: 'right',
    fontWeight: '600',
  },
  levelDescription: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  levelDescriptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFD700',
    textAlign: 'center',
  },
});