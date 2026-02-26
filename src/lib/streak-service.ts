
'use client';

import { doc, getDoc, setDoc, Firestore } from 'firebase/firestore';

/**
 * Updates the unified writing streak for a user.
 * Triggered by any meaningful writing activity (Quest, Mystery, Standard, Revision).
 */
export async function updateGlobalWritingStreak(db: Firestore, userId: string) {
  const today = new Date().toISOString().split('T')[0];
  const streakRef = doc(db, 'users', userId, 'writingStreaks', 'main');
  
  try {
    const streakSnap = await getDoc(streakRef);
    let currentStreak = 1;
    let longestStreak = 1;
    let lastActivityDate = today;

    if (streakSnap.exists()) {
      const data = streakSnap.data();
      const lastDate = data.lastActivityDate || data.lastCompletedDate;

      // If already updated today, don't double count
      if (lastDate === today) {
        return;
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastDate === yesterdayStr) {
        // Consecutive day
        currentStreak = (data.currentStreak || 0) + 1;
      } else {
        // Streak broken
        currentStreak = 1;
      }

      longestStreak = Math.max(currentStreak, data.longestStreak || data.currentStreak || 0);
    }

    // Mutate Firestore
    setDoc(streakRef, {
      userId,
      currentStreak,
      longestStreak,
      lastActivityDate: today,
      // lastCompletedDate kept for backward compatibility if needed by older components
      lastCompletedDate: today,
    }, { merge: true });

    return { currentStreak, longestStreak };
  } catch (error) {
    console.error("Error updating streak:", error);
    return null;
  }
}
