import { DailyLog } from '../types';

export interface CoachingSuggestion {
  exerciseName: string;
  type: 'increase' | 'deload' | 'swap' | 'consistency';
  title: string;
  description: string;
}

export function generateWorkoutSuggestions(logs: DailyLog[], currentSplitName: string, recoveryScore = 80): CoachingSuggestion[] {
  const suggestions: CoachingSuggestion[] = [];
  
  // Find logs with completed workouts for this split
  const splitLogs = logs
    .filter(l => l.workoutCompleted && l.workoutSession && l.workoutSession.splitName.toLowerCase().includes(currentSplitName.toLowerCase()))
    .sort((a, b) => b.date.localeCompare(a.date)); // newest first

  // If recovery score is critically low (<60), add a general deload/intensity warning
  if (recoveryScore < 60) {
    suggestions.push({
      exerciseName: "All Exercises",
      type: "deload",
      title: "Systemic Deload Advised",
      description: `CNS recovery is low (${recoveryScore}%). Keep weights at 85% of standard load today and focus strictly on execution tempo.`
    });
  }

  // Calculate workout adherence in past 5 split sessions
  const last5SplitLogs = splitLogs.slice(0, 5);
  const workoutCount = last5SplitLogs.filter(l => l.workoutCompleted).length;
  if (workoutCount < 3 && splitLogs.length >= 3) {
    suggestions.push({
      exerciseName: "Session Frequency",
      type: "consistency",
      title: "Volume Recovery Plan",
      description: "Adherence is low for this split. Prioritise completing all prescribed sets today over adding heavier loads."
    });
  }

  if (splitLogs.length === 0) {
    // No previous history yet, provide default overload rules
    suggestions.push({
      exerciseName: "All Lifts",
      type: "increase",
      title: "Establish baseline load",
      description: "Perform your first set at RPE 8. If you complete 10 reps cleanly, use this weight as your progressive overload baseline."
    });
    return suggestions;
  }

  // Analyze specific exercise trends
  const latestSession = splitLogs[0].workoutSession;
  if (!latestSession) return suggestions;

  latestSession.exercises.forEach(exercise => {
    // Gather all historical logs for this exercise name
    const exerciseHistory: { reps: number[]; weights: number[]; completed: boolean }[] = [];
    
    splitLogs.slice(0, 3).forEach(log => {
      const match = log.workoutSession?.exercises.find(e => e.name.toLowerCase() === exercise.name.toLowerCase());
      if (match) {
        exerciseHistory.push({
          reps: match.sets.map(s => s.reps),
          weights: match.sets.map(s => s.weight),
          completed: match.sets.every(s => s.completed)
        });
      }
    });

    if (exerciseHistory.length === 0) return;

    const latest = exerciseHistory[0];

    // Progressive overload: check if they completed all sets and hit high reps (e.g. all sets >= 10 reps, or last set >= 8 reps with higher weights)
    const allSetsCompleted = latest.completed;
    const hitRepTarget = latest.reps.every(r => r >= 10);
    
    if (allSetsCompleted && hitRepTarget) {
      const avgWeight = latest.weights.reduce((sum, w) => sum + w, 0) / latest.weights.length;
      const increment = exercise.name.toLowerCase().includes('press') || exercise.name.toLowerCase().includes('squat') ? 5 : 2.5;
      
      suggestions.push({
        exerciseName: exercise.name,
        type: "increase",
        title: `Overload Triggered (+${increment}kg)`,
        description: `Exceeded rep ceilings (${latest.reps.join(', ')} reps) at ${avgWeight}kg in the last session. Increase load to ${avgWeight + increment}kg today.`
      });
      return;
    }

    // Deload / form warning: check if reps dropped dramatically in later sets (e.g. 10 -> 6 -> 4) or if they failed sets
    const repDrop = latest.reps.length > 1 && (latest.reps[0] - latest.reps[latest.reps.length - 1] >= 4);
    const failedSets = !latest.completed;

    if (failedSets || repDrop) {
      const avgWeight = latest.weights.reduce((sum, w) => sum + w, 0) / latest.weights.length;
      suggestions.push({
        exerciseName: exercise.name,
        type: "deload",
        title: "Fatigue Deload Active (-10%)",
        description: `Rep execution collapsed on later sets (${latest.reps.join(', ')}). Deload load by 10% (to ${Math.round(avgWeight * 0.9)}kg) to secure standard technique.`
      });

      // Suggest specific exercise variations
      if (exercise.name.toLowerCase().includes('bench press')) {
        suggestions.push({
          exerciseName: exercise.name,
          type: "swap",
          title: "Bench Press Alternative",
          description: "Struggling with bench shoulder joints? Swap to Flat Dumbbell Press or Hammer Strength Machine Press for better biomechanics."
        });
      } else if (exercise.name.toLowerCase().includes('squat')) {
        suggestions.push({
          exerciseName: exercise.name,
          type: "swap",
          title: "Squat Alternative",
          description: "Lower back fatigued under deficit? Swap Squats to Hack Squats or Leg Press to maintain quad isolation without spinal compression."
        });
      }
    }
  });

  return suggestions;
}
