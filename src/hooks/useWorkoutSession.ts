/**
 * Hook for managing an active workout session
 * Handles state, auto-save, and workout progression
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  Workout,
  WorkoutExercise,
  WorkoutSet,
  WorkoutFeedback,
} from '../types/models';
import {
  createWorkout,
  updateWorkout,
  autoSaveWorkout,
  recoverActiveWorkout,
  clearAutoSavedWorkout,
  createEmptySet,
  getPreviousPerformance,
  startWorkoutFromSplit as startWorkoutFromSplitService,
} from '../db/service';

interface UseWorkoutSessionReturn {
  workout: Workout | null;
  isActive: boolean;
  startWorkout: () => void;
  startWorkoutFromSplit: (
    mesocycleId: string,
    splitDayId: string
  ) => Promise<void>;
  endWorkout: (feedback?: WorkoutFeedback) => Promise<void>;
  cancelWorkout: () => void;
  addExercise: (exerciseId: string) => Promise<void>;
  removeExercise: (exerciseId: string) => void;
  addSet: (exerciseId: string) => void;
  removeSet: (exerciseId: string, setId: string) => void;
  updateSet: (
    exerciseId: string,
    setId: string,
    updates: Partial<WorkoutSet>
  ) => void;
  updateExerciseNotes: (exerciseId: string, notes: string) => void;
  updateWorkoutNotes: (notes: string) => void;
  updateWorkoutFeedback: (feedback: WorkoutFeedback) => void;
  currentExerciseIndex: number;
  setCurrentExerciseIndex: (index: number) => void;
}

const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

export function useWorkoutSession(): UseWorkoutSessionReturn {
  // Initialize state with recovered workout if available
  const [workout, setWorkout] = useState<Workout | null>(() => {
    return recoverActiveWorkout();
  });
  const [isActive, setIsActive] = useState(() => {
    return recoverActiveWorkout() !== null;
  });
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const autoSaveTimerRef = useRef<number | null>(null);

  // Use refs to track current state for auto-save to avoid closure issues
  const workoutRef = useRef<Workout | null>(workout);
  const isActiveRef = useRef<boolean>(isActive);

  // Keep refs in sync with state
  useEffect(() => {
    workoutRef.current = workout;
    isActiveRef.current = isActive;
  }, [workout, isActive]);

  // Auto-save active workout
  useEffect(() => {
    // Only auto-save if workout is active and not completed
    if (!workout || !isActive || workout.completed) {
      return;
    }

    const save = () => {
      // Read from refs to get current state, not closure-captured values
      const currentWorkout = workoutRef.current;
      const currentIsActive = isActiveRef.current;

      if (currentWorkout && currentIsActive && !currentWorkout.completed) {
        autoSaveWorkout(currentWorkout);
      }
    };

    // Save immediately
    save();

    // Set up interval for periodic saves
    autoSaveTimerRef.current = window.setInterval(save, AUTO_SAVE_INTERVAL);

    return () => {
      if (autoSaveTimerRef.current) {
        window.clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [workout, isActive]);

  const startWorkout = useCallback(() => {
    const newWorkout: Workout = {
      id: 'temp-workout-' + crypto.randomUUID(),
      date: new Date(),
      exercises: [],
      notes: undefined,
      completed: false,
      duration: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setWorkout(newWorkout);
    setIsActive(true);
    setCurrentExerciseIndex(0);
  }, []);

  const startWorkoutFromSplit = useCallback(
    async (mesocycleId: string, splitDayId: string) => {
      try {
        const newWorkout = await startWorkoutFromSplitService(
          mesocycleId,
          splitDayId
        );
        setWorkout(newWorkout);
        setIsActive(true);
        setCurrentExerciseIndex(0);
      } catch (error) {
        console.error('Failed to start workout from split:', error);
        throw error;
      }
    },
    []
  );

  const endWorkout = useCallback(
    async (feedback?: WorkoutFeedback) => {
      if (!workout) return;

      // Stop auto-save interval immediately to prevent race conditions
      if (autoSaveTimerRef.current) {
        window.clearInterval(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }

      const duration = Math.round(
        (new Date().getTime() - workout.date.getTime()) / 60000
      ); // minutes

      const completedWorkout: Workout = {
        ...workout,
        completed: true,
        duration,
        feedback: feedback || workout.feedback,
        updatedAt: new Date(),
      };

      try {
        // Save to database
        if (workout.id.startsWith('temp-workout-')) {
          // Create new workout
          const id = await createWorkout({
            date: completedWorkout.date,
            splitDayId: completedWorkout.splitDayId,
            exercises: completedWorkout.exercises,
            notes: completedWorkout.notes,
            completed: true,
            duration,
            feedback: completedWorkout.feedback,
          });
          completedWorkout.id = id;
        } else {
          // Update existing workout
          await updateWorkout(workout.id, completedWorkout);
        }

        // Only clear localStorage after successful DB save
        clearAutoSavedWorkout();

        // Reset state
        setWorkout(null);
        setIsActive(false);
        setCurrentExerciseIndex(0);
      } catch (error) {
        // On error, keep the workout in localStorage so it can be recovered
        console.error('Failed to save workout to database:', error);
        throw error;
      }
    },
    [workout]
  );

  const cancelWorkout = useCallback(() => {
    if (!workout) return;

    // Stop auto-save interval immediately
    if (autoSaveTimerRef.current) {
      window.clearInterval(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }

    // Clear auto-saved data
    clearAutoSavedWorkout();

    // Reset state
    setWorkout(null);
    setIsActive(false);
    setCurrentExerciseIndex(0);
  }, [workout]);

  const addExercise = useCallback(
    async (exerciseId: string) => {
      if (!workout) return;

      // Try to get previous performance for this exercise
      const previousPerformance = await getPreviousPerformance(exerciseId);
      // Use the last set from previous workout for better progressive overload tracking
      const previousSet =
        previousPerformance?.sets[previousPerformance.sets.length - 1];

      const newExercise: WorkoutExercise = {
        exerciseId,
        sets: [createEmptySet(exerciseId, 1, previousSet)],
        notes: undefined,
      };

      setWorkout({
        ...workout,
        exercises: [...workout.exercises, newExercise],
        updatedAt: new Date(),
      });
    },
    [workout]
  );

  const removeExercise = useCallback(
    (exerciseId: string) => {
      if (!workout) return;

      setWorkout({
        ...workout,
        exercises: workout.exercises.filter(
          (ex) => ex.exerciseId !== exerciseId
        ),
        updatedAt: new Date(),
      });

      // Adjust current exercise index if needed
      if (currentExerciseIndex >= workout.exercises.length - 1) {
        setCurrentExerciseIndex(Math.max(0, workout.exercises.length - 2));
      }
    },
    [workout, currentExerciseIndex]
  );

  const addSet = useCallback(
    (exerciseId: string) => {
      if (!workout) return;

      setWorkout({
        ...workout,
        exercises: workout.exercises.map((ex) => {
          if (ex.exerciseId !== exerciseId) return ex;

          const lastSet = ex.sets[ex.sets.length - 1];
          const newSet = createEmptySet(
            exerciseId,
            ex.sets.length + 1,
            lastSet
          );

          return {
            ...ex,
            sets: [...ex.sets, newSet],
          };
        }),
        updatedAt: new Date(),
      });
    },
    [workout]
  );

  const removeSet = useCallback(
    (exerciseId: string, setId: string) => {
      if (!workout) return;

      setWorkout({
        ...workout,
        exercises: workout.exercises.map((ex) => {
          if (ex.exerciseId !== exerciseId) return ex;

          const updatedSets = ex.sets.filter((set) => set.id !== setId);
          // Renumber sets
          return {
            ...ex,
            sets: updatedSets.map((set, index) => ({
              ...set,
              setNumber: index + 1,
            })),
          };
        }),
        updatedAt: new Date(),
      });
    },
    [workout]
  );

  const updateSet = useCallback(
    (exerciseId: string, setId: string, updates: Partial<WorkoutSet>) => {
      if (!workout) return;

      setWorkout({
        ...workout,
        exercises: workout.exercises.map((ex) => {
          if (ex.exerciseId !== exerciseId) return ex;

          return {
            ...ex,
            sets: ex.sets.map((set) =>
              set.id === setId ? { ...set, ...updates } : set
            ),
          };
        }),
        updatedAt: new Date(),
      });
    },
    [workout]
  );

  const updateExerciseNotes = useCallback(
    (exerciseId: string, notes: string) => {
      if (!workout) return;

      setWorkout({
        ...workout,
        exercises: workout.exercises.map((ex) =>
          ex.exerciseId === exerciseId ? { ...ex, notes } : ex
        ),
        updatedAt: new Date(),
      });
    },
    [workout]
  );

  const updateWorkoutNotes = useCallback(
    (notes: string) => {
      if (!workout) return;

      setWorkout({
        ...workout,
        notes,
        updatedAt: new Date(),
      });
    },
    [workout]
  );

  const updateWorkoutFeedback = useCallback(
    (feedback: WorkoutFeedback) => {
      if (!workout) return;

      setWorkout({
        ...workout,
        feedback,
        updatedAt: new Date(),
      });
    },
    [workout]
  );

  return {
    workout,
    isActive,
    startWorkout,
    startWorkoutFromSplit,
    endWorkout,
    cancelWorkout,
    addExercise,
    removeExercise,
    addSet,
    removeSet,
    updateSet,
    updateExerciseNotes,
    updateWorkoutNotes,
    updateWorkoutFeedback,
    currentExerciseIndex,
    setCurrentExerciseIndex,
  };
}
