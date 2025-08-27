import { useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { auth, firestore } from '../components/firebaseConfig';

// Level configuration
export const levels = [
  // ========== LEVEL CONFIGURATION TEST - COMMENT/UNCOMMENT ==========
  // For testing (1 minute = 1 point):
  // { level: 1, totalPoints: 1, timeEquivalent: "1 min", title: "The First Step 🟢" },
  // { level: 2, totalPoints: 3, timeEquivalent: "3 min", title: "Warming Up 🔥" },
  // { level: 3, totalPoints: 6, timeEquivalent: "6 min", title: "Solid Ground 🧱" },
  // { level: 4, totalPoints: 10, timeEquivalent: "10 min", title: "Marathon Trainee 🏃" },
  // { level: 5, totalPoints: 15, timeEquivalent: "15 min", title: "Advanced Focus 🎯" },
  // { level: 6, totalPoints: 21, timeEquivalent: "21 min", title: "Focus Master 🥇" },
  // { level: 7, totalPoints: 28, timeEquivalent: "28 min", title: "GRAND MASTER 👑✨" }
  
  // For production (30 minutes = 1 point):
  { level: 1, totalPoints: 1, timeEquivalent: "30 min", title: "The First Step 🟢" },
  { level: 2, totalPoints: 3, timeEquivalent: "1h 30m", title: "Warming Up 🔥" },
  { level: 3, totalPoints: 6, timeEquivalent: "3h", title: "Solid Ground 🧱" },
  { level: 4, totalPoints: 10, timeEquivalent: "5h", title: "Marathon Trainee 🏃" },
  { level: 5, totalPoints: 15, timeEquivalent: "7h 30m", title: "Advanced Focus 🎯" },
  { level: 6, totalPoints: 21, timeEquivalent: "10h 30m", title: "Focus Master 🥇" },
  { level: 7, totalPoints: 28, timeEquivalent: "14h", title: "GRAND MASTER 👑✨" }
  // ========== END LEVEL CONFIGURATION TEST ==========
];

// Helper function to calculate points from seconds
export const calculatePoints = (durationInSeconds: number): number => {
  // ========== POINT CALCULATION TEST - COMMENT/UNCOMMENT ==========
  // For testing (1 minute = 1 point):
  // return Math.floor(durationInSeconds / 60); // 60 seconds = 1 minute
  
  // For production (30 minutes = 1 point):
  return Math.floor(durationInSeconds / 1800); // 1800 seconds = 30 minutes
  // ========== END POINT CALCULATION TEST ==========
};

// Get current level based on total points
export const getCurrentLevel = (points: number): number => {
  for (let i = levels.length - 1; i >= 0; i--) {
    if (points >= levels[i].totalPoints) {
      return levels[i].level;
    }
  }
  return 0;
};

// Get unlocked levels based on total points
export const getUnlockedLevels = (points: number): number[] => {
  return levels.filter(level => points >= level.totalPoints).map(level => level.level);
};

// Get progress for a specific level
export const getLevelProgress = (points: number, targetLevel: number): { current: number, required: number, percentage: number } => {
  const level = levels.find(l => l.level === targetLevel);
  if (!level) return { current: 0, required: 1, percentage: 0 };
  
  const current = Math.min(points, level.totalPoints);
  const required = level.totalPoints;
  const percentage = (current / required) * 100;
  
  return { current, required, percentage };
};

// Custom hook for reward system
export const useRewardSystem = () => {
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [currentLevel, setCurrentLevel] = useState<number>(0);
  const [unlockedLevels, setUnlockedLevels] = useState<number[]>([]);
  const [previousLevel, setPreviousLevel] = useState<number>(0);
  const [hasLevelUp, setHasLevelUp] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      setTotalPoints(0);
      setCurrentLevel(0);
      setUnlockedLevels([]);
      setLoading(false);
      return;
    }

    const userDocRef = collection(firestore, 'users', userId, 'prayerTimes');
    const q = query(userDocRef);
    
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        let totalDurationInSeconds = 0;

        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const duration = Number(data.durationInSeconds) || 0;
          totalDurationInSeconds += duration;
        });

        const points = calculatePoints(totalDurationInSeconds);
        const newLevel = getCurrentLevel(points);
        const unlocked = getUnlockedLevels(points);

        // Check for level up
        if (newLevel > currentLevel && currentLevel > 0) {
          setHasLevelUp(true);
        }

        setTotalPoints(points);
        setPreviousLevel(currentLevel);
        setCurrentLevel(newLevel);
        setUnlockedLevels(unlocked);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching prayer times for rewards:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentLevel]);

  const clearLevelUpNotification = () => {
    setHasLevelUp(false);
  };

  return {
    totalPoints,
    currentLevel,
    unlockedLevels,
    previousLevel,
    hasLevelUp,
    loading,
    clearLevelUpNotification,
  };
};