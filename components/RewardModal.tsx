import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Animated
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { levels, getLevelProgress } from '../hooks/useRewardSystem';

interface RewardModalProps {
  visible: boolean;
  onClose: () => void;
  totalPoints: number;
  currentLevel: number;
  unlockedLevels: number[];
}

const RewardModal: React.FC<RewardModalProps> = ({
  visible,
  onClose,
  totalPoints,
  currentLevel,
  unlockedLevels,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  const renderLevelItem = (level: typeof levels[0], index: number) => {
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
            <Icon
              name="lock"
              size={24}
              color={isUnlocked ? '#FFD700' : 'rgba(255, 255, 255, 0.3)'}
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
        )}

        {isSelected && isUnlocked && (
          <View style={styles.levelDescription}>
            <Text style={styles.levelDescriptionText}>
              {level.title}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

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
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>🏆 Reward System - All Time</Text>
                <Text style={styles.modalSubtitle}>(30 minutes = 1 point)</Text>
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

              <Text style={styles.sectionTitle}>Level thresholds (7 levels, cumulative points)</Text>

              <ScrollView 
                style={styles.levelsContainer} 
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
                contentContainerStyle={styles.levelsContentContainer}
              >
                {levels.map((level, index) => renderLevelItem(level, index))}
              </ScrollView>

              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
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
    width: '90%',
    maxHeight: '90%',
    backgroundColor: '#522f60ff',
    borderRadius: 14,
    padding: 20,
    flex: 0,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F5E6D9',
    textAlign: 'center',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#BDC3C7',
    textAlign: 'center',
    marginBottom: 12,
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
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFD700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#BDC3C7',
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F5E6D9',
    textAlign: 'center',
    marginBottom: 15,
  },
  levelsContainer: {
    maxHeight: "55%",
    minHeight: 200,
  },
  levelsContentContainer: {
    paddingBottom: 10,
  },
  levelItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
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
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F5E6D9',
    marginBottom: 2,
  },
  levelTitleLocked: {
    color: 'rgba(255, 255, 255, 0.4)',
  },
  levelPoints: {
    fontSize: 14,
    color: '#BDC3C7',
    fontWeight: '500',
  },
  levelPointsLocked: {
    color: 'rgba(255, 255, 255, 0.3)',
  },
  progressContainer: {
    marginTop: 10,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 5,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#9B59B6',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#BDC3C7',
    textAlign: 'right',
  },
  levelDescription: {
    marginTop: 10,
    padding: 10,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#FFD700',
  },
  levelDescriptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFD700',
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
    textAlign: 'center',
  },
});

export default RewardModal;