import { StudyStreak } from '../types';

/**
 * Returns a date string formatted as YYYY-MM-DD in local time.
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns yesterday's date string formatted as YYYY-MM-DD in local time.
 */
export function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return getLocalDateString(d);
}

/**
 * Calculates or updates the study streak when the student is active today.
 */
export function recordDailyActivity(existingStreak?: StudyStreak): {
  streak: StudyStreak;
  hasChanged: boolean;
  isNewStreakDay: boolean;
} {
  const today = getLocalDateString();
  const yesterday = getYesterdayDateString();

  if (!existingStreak || !existingStreak.lastActiveDate) {
    const newStreak: StudyStreak = {
      currentStreak: 1,
      longestStreak: 1,
      lastActiveDate: today,
      activeDates: [today],
    };
    return { streak: newStreak, hasChanged: true, isNewStreakDay: true };
  }

  const { currentStreak = 0, longestStreak = 0, lastActiveDate, activeDates = [] } = existingStreak;

  // Case 1: Already marked active today
  if (lastActiveDate === today) {
    const updatedDates = activeDates.includes(today) ? activeDates : [...activeDates, today];
    return {
      streak: {
        currentStreak: Math.max(1, currentStreak),
        longestStreak: Math.max(longestStreak, currentStreak, 1),
        lastActiveDate: today,
        activeDates: updatedDates,
      },
      hasChanged: !activeDates.includes(today),
      isNewStreakDay: false,
    };
  }

  // Case 2: Consecutive day (was active yesterday)
  if (lastActiveDate === yesterday) {
    const nextCurrent = currentStreak + 1;
    const nextLongest = Math.max(longestStreak, nextCurrent);
    const updatedDates = activeDates.includes(today) ? activeDates : [...activeDates, today];
    
    // Keep at most 90 days in array to keep state light
    const trimmedDates = updatedDates.slice(-90);

    return {
      streak: {
        currentStreak: nextCurrent,
        longestStreak: nextLongest,
        lastActiveDate: today,
        activeDates: trimmedDates,
      },
      hasChanged: true,
      isNewStreakDay: true,
    };
  }

  // Case 3: Missed 1 or more days (streak broken, reset to 1)
  const updatedDates = activeDates.includes(today) ? activeDates : [...activeDates, today];
  const trimmedDates = updatedDates.slice(-90);

  return {
    streak: {
      currentStreak: 1,
      longestStreak: Math.max(longestStreak, 1),
      lastActiveDate: today,
      activeDates: trimmedDates,
    },
    hasChanged: true,
    isNewStreakDay: true,
  };
}

/**
 * Returns rolling 7 days up to today with active statuses.
 */
export function getRollingSevenDays(activeDates: string[] = []): Array<{
  dateStr: string;
  dayName: string;
  dayNumber: number;
  isToday: boolean;
  isActive: boolean;
}> {
  const result = [];
  const todayStr = getLocalDateString();

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = getLocalDateString(d);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }); // e.g. "Mon"
    const dayNumber = d.getDate();
    const isToday = dateStr === todayStr;
    const isActive = activeDates.includes(dateStr);

    result.push({
      dateStr,
      dayName,
      dayNumber,
      isToday,
      isActive,
    });
  }

  return result;
}

/**
 * Returns milestone encouragement based on current streak.
 */
export function getStreakMilestone(currentStreak: number): {
  levelTitle: string;
  nextMilestone: number;
  progressPercent: number;
  message: string;
} {
  if (currentStreak < 3) {
    return {
      levelTitle: 'Spark Builder',
      nextMilestone: 3,
      progressPercent: Math.round((currentStreak / 3) * 100),
      message: 'Consistency is the secret to WAEC & JAMB distinction. Day by day!',
    };
  }
  if (currentStreak < 7) {
    return {
      levelTitle: 'Study Flame',
      nextMilestone: 7,
      progressPercent: Math.round((currentStreak / 7) * 100),
      message: 'You have serious momentum! Keep this flame burning strong.',
    };
  }
  if (currentStreak < 14) {
    return {
      levelTitle: 'Exam Torchbearer',
      nextMilestone: 14,
      progressPercent: Math.round((currentStreak / 14) * 100),
      message: 'Over a full week of non-stop dedication! A1 in your subjects is loading.',
    };
  }
  if (currentStreak < 30) {
    return {
      levelTitle: 'Syllabus Master',
      nextMilestone: 30,
      progressPercent: Math.round((currentStreak / 30) * 100),
      message: 'Elite study discipline! You are among the top 1% of prepared candidates.',
    };
  }
  return {
    levelTitle: 'Academic Titan',
    nextMilestone: 50,
    progressPercent: Math.min(100, Math.round((currentStreak / 50) * 100)),
    message: 'Unstoppable consistency! Your target university admission is well within reach.',
  };
}
