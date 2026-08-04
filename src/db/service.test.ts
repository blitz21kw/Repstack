/**
 * Integration tests for database service
 * Tests CRUD operations with IndexedDB
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db } from '../db';
import {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
  createExercise,
  getExercise,
  updateExercise,
  deleteExercise,
  getAllExercises,
  createWorkout,
  createTrainingSession,
  getWorkout,
  updateWorkout,
  deleteWorkout,
  getAllWorkouts,
  createMesocycle,
  getMesocycle,
  updateMesocycle,
  deleteMesocycle,
  recoverActiveWorkout,
  autoSaveWorkout,
  clearAutoSavedWorkout,
  clearProgressData,
} from '../db/service';

describe('Database Service - User Profiles', () => {
  beforeEach(async () => {
    // Clear database before each test
    await db.delete();
    await db.open();
  });

  afterEach(async () => {
    await db.delete();
  });

  describe('createUserProfile', () => {
    it('should create a user profile successfully', async () => {
      const profileData = {
        name: 'John Doe',
        experienceLevel: 'intermediate' as const,
        preferences: {
          units: 'metric' as const,
          theme: 'dark' as const,
          firstDayOfWeek: 1 as const,
          defaultRestTimerSeconds: 90,
          restTimerSound: true,
          restTimerVibration: true,
          showRIRByDefault: true,
          autoAdvanceSet: false,
        },
      };

      const id = await createUserProfile(profileData);
      expect(id).toBeTruthy();
      expect(typeof id).toBe('string');

      const profile = await getUserProfile(id);
      expect(profile).toBeDefined();
      expect(profile?.name).toBe('John Doe');
      expect(profile?.experienceLevel).toBe('intermediate');
    });

    it('should sanitize name when creating profile', async () => {
      const profileData = {
        name: '<script>alert("xss")</script>',
        experienceLevel: 'beginner' as const,
        preferences: {
          units: 'metric' as const,
          theme: 'light' as const,
          firstDayOfWeek: 0 as const,
          defaultRestTimerSeconds: 60,
          restTimerSound: true,
          restTimerVibration: false,
          showRIRByDefault: false,
          autoAdvanceSet: false,
        },
      };

      const id = await createUserProfile(profileData);
      const profile = await getUserProfile(id);

      expect(profile?.name).not.toContain('<script>');
      expect(profile?.name).toContain('&lt;script&gt;');
    });

    it('should reject invalid profile data', async () => {
      const profileData = {
        name: '',
        experienceLevel: 'beginner' as const,
        preferences: {
          units: 'metric' as const,
          theme: 'light' as const,
          firstDayOfWeek: 0 as const,
          defaultRestTimerSeconds: 60,
          restTimerSound: true,
          restTimerVibration: false,
          showRIRByDefault: false,
          autoAdvanceSet: false,
        },
      };

      await expect(createUserProfile(profileData)).rejects.toThrow(
        'Validation failed'
      );
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile successfully', async () => {
      const id = await createUserProfile({
        name: 'John Doe',
        experienceLevel: 'beginner' as const,
        preferences: {
          units: 'metric' as const,
          theme: 'light' as const,
          firstDayOfWeek: 0 as const,
          defaultRestTimerSeconds: 60,
          restTimerSound: true,
          restTimerVibration: false,
          showRIRByDefault: false,
          autoAdvanceSet: false,
        },
      });

      await updateUserProfile(id, {
        experienceLevel: 'intermediate',
      });

      const profile = await getUserProfile(id);
      expect(profile?.experienceLevel).toBe('intermediate');
      expect(profile?.name).toBe('John Doe'); // Unchanged
    });

    it('should throw error for non-existent profile', async () => {
      await expect(
        updateUserProfile('nonexistent', { name: 'Test' })
      ).rejects.toThrow('not found');
    });
  });

  describe('deleteUserProfile', () => {
    it('should delete user profile successfully', async () => {
      const id = await createUserProfile({
        name: 'John Doe',
        experienceLevel: 'beginner' as const,
        preferences: {
          units: 'metric' as const,
          theme: 'light' as const,
          firstDayOfWeek: 0 as const,
          defaultRestTimerSeconds: 60,
          restTimerSound: true,
          restTimerVibration: false,
          showRIRByDefault: false,
          autoAdvanceSet: false,
        },
      });

      await deleteUserProfile(id);

      const profile = await getUserProfile(id);
      expect(profile).toBeUndefined();
    });
  });
});

describe('Database Service - Exercises', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
  });

  afterEach(async () => {
    await db.delete();
  });

  describe('createExercise', () => {
    it('should create an exercise successfully', async () => {
      const exerciseData = {
        name: 'Bench Press',
        category: 'barbell' as const,
        muscleGroups: ['chest' as const, 'triceps' as const],
        isCustom: true,
      };

      const id = await createExercise(exerciseData);
      expect(id).toBeTruthy();

      const exercise = await getExercise(id);
      expect(exercise).toBeDefined();
      expect(exercise?.name).toBe('Bench Press');
      expect(exercise?.category).toBe('barbell');
      expect(exercise?.muscleGroups).toContain('chest');
      expect(exercise?.muscleGroups).toContain('triceps');
    });

    it('should sanitize exercise name', async () => {
      const exerciseData = {
        name: '<script>Bench Press</script>',
        category: 'barbell' as const,
        muscleGroups: ['chest' as const],
        isCustom: true,
      };

      const id = await createExercise(exerciseData);
      const exercise = await getExercise(id);

      expect(exercise?.name).not.toContain('<script>');
    });

    it('should reject invalid exercise data', async () => {
      const exerciseData = {
        name: '',
        category: 'barbell' as const,
        muscleGroups: ['chest' as const],
        isCustom: true,
      };

      await expect(createExercise(exerciseData)).rejects.toThrow(
        'Validation failed'
      );
    });
  });

  describe('getAllExercises', () => {
    it('should retrieve all exercises', async () => {
      await createExercise({
        name: 'Bench Press',
        category: 'barbell' as const,
        muscleGroups: ['chest' as const],
        isCustom: true,
      });

      await createExercise({
        name: 'Squat',
        category: 'barbell' as const,
        muscleGroups: ['quads' as const],
        isCustom: true,
      });

      const exercises = await getAllExercises();
      expect(exercises).toHaveLength(2);
    });

    it('should return empty array when no exercises exist', async () => {
      const exercises = await getAllExercises();
      expect(exercises).toHaveLength(0);
    });
  });

  describe('updateExercise', () => {
    it('should update exercise successfully', async () => {
      const id = await createExercise({
        name: 'Bench Press',
        category: 'barbell' as const,
        muscleGroups: ['chest' as const],
        isCustom: true,
      });

      await updateExercise(id, {
        muscleGroups: ['chest', 'triceps', 'shoulders'],
      });

      const exercise = await getExercise(id);
      expect(exercise?.muscleGroups).toHaveLength(3);
      expect(exercise?.muscleGroups).toContain('shoulders');
    });

    it('should throw error for non-existent exercise', async () => {
      await expect(
        updateExercise('nonexistent', { name: 'Test' })
      ).rejects.toThrow('not found');
    });
  });

  describe('deleteExercise', () => {
    it('should delete exercise successfully', async () => {
      const id = await createExercise({
        name: 'Bench Press',
        category: 'barbell' as const,
        muscleGroups: ['chest' as const],
        isCustom: true,
      });

      await deleteExercise(id);

      const exercise = await getExercise(id);
      expect(exercise).toBeUndefined();
    });
  });
});

describe('Database Service - Workouts', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
  });

  afterEach(async () => {
    await db.delete();
  });

  describe('createWorkout', () => {
    it('should create a workout successfully', async () => {
      const exerciseId = await createExercise({
        name: 'Bench Press',
        category: 'barbell' as const,
        muscleGroups: ['chest' as const],
        isCustom: true,
      });

      const workoutData = {
        date: new Date(),
        exercises: [
          {
            exerciseId,
            sets: [
              {
                id: 'set-1',
                exerciseId,
                setNumber: 1,
                targetReps: 10,
                weight: 100,
                completed: true,
              },
            ],
          },
        ],
        completed: true,
      };

      const id = await createWorkout(workoutData);
      expect(id).toBeTruthy();

      const workout = await getWorkout(id);
      expect(workout).toBeDefined();
      expect(workout?.exercises).toHaveLength(1);
      expect(workout?.exercises[0].sets).toHaveLength(1);
    });

    it('should reject workout with future date', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 2);

      const workoutData = {
        date: futureDate,
        exercises: [
          {
            exerciseId: 'ex-1',
            sets: [],
          },
        ],
        completed: false,
      };

      await expect(createWorkout(workoutData)).rejects.toThrow(
        'Validation failed'
      );
    });

    it('should reject workout without exercises', async () => {
      const workoutData = {
        date: new Date(),
        exercises: [],
        completed: false,
      };

      await expect(createWorkout(workoutData)).rejects.toThrow(
        'Validation failed'
      );
    });
  });

  describe('getAllWorkouts', () => {
    it('should retrieve all workouts', async () => {
      const exerciseId = await createExercise({
        name: 'Bench Press',
        category: 'barbell' as const,
        muscleGroups: ['chest' as const],
        isCustom: true,
      });

      await createWorkout({
        date: new Date(),
        exercises: [
          {
            exerciseId,
            sets: [],
          },
        ],
        completed: true,
      });

      await createWorkout({
        date: new Date(),
        exercises: [
          {
            exerciseId,
            sets: [],
          },
        ],
        completed: true,
      });

      const workouts = await getAllWorkouts();
      expect(workouts).toHaveLength(2);
    });
  });

  describe('updateWorkout', () => {
    it('should update workout successfully', async () => {
      const exerciseId = await createExercise({
        name: 'Bench Press',
        category: 'barbell' as const,
        muscleGroups: ['chest' as const],
        isCustom: true,
      });

      const id = await createWorkout({
        date: new Date(),
        exercises: [
          {
            exerciseId,
            sets: [],
          },
        ],
        completed: false,
      });

      await updateWorkout(id, {
        completed: true,
        duration: 60,
      });

      const workout = await getWorkout(id);
      expect(workout?.completed).toBe(true);
      expect(workout?.duration).toBe(60);
    });
  });

  describe('deleteWorkout', () => {
    it('should delete workout successfully', async () => {
      const exerciseId = await createExercise({
        name: 'Bench Press',
        category: 'barbell' as const,
        muscleGroups: ['chest' as const],
        isCustom: true,
      });

      const id = await createWorkout({
        date: new Date(),
        exercises: [
          {
            exerciseId,
            sets: [],
          },
        ],
        completed: true,
      });

      await deleteWorkout(id);

      const workout = await getWorkout(id);
      expect(workout).toBeUndefined();
    });
  });

  describe('clearProgressData', () => {
    it('should clear workout history while keeping plans and exercises', async () => {
      const exerciseId = await createExercise({
        name: 'Bench Press',
        category: 'barbell' as const,
        muscleGroups: ['chest' as const],
        isCustom: true,
      });
      const mesocycleId = await createMesocycle({
        name: 'Test Plan',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-02-11'),
        durationWeeks: 6,
        currentWeek: 1,
        deloadWeek: 6,
        trainingSplit: 'upper_lower' as const,
        splitDays: [],
        status: 'active' as const,
      });
      const workoutId = await createWorkout({
        date: new Date('2024-01-10'),
        mesocycleId,
        exercises: [{ exerciseId, sets: [] }],
        completed: true,
      });

      await createTrainingSession({
        workoutId,
        exerciseId,
        date: new Date('2024-01-10'),
        pump: 4,
        soreness: 2,
        fatigue: 2,
        performance: 'good',
      });
      await updateMesocycle(mesocycleId, { currentWeek: 3 });
      localStorage.setItem('activeWorkout', 'stale-workout');

      await clearProgressData();

      expect(await db.workouts.count()).toBe(0);
      expect(await db.trainingSessions.count()).toBe(0);
      expect(await db.exercises.count()).toBe(1);
      expect(await db.mesocycles.get(mesocycleId)).toMatchObject({
        currentWeek: 1,
      });
      expect(localStorage.getItem('activeWorkout')).toBeNull();
    });
  });
});

describe('Database Service - Mesocycles', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
  });

  afterEach(async () => {
    await db.delete();
  });

  describe('createMesocycle', () => {
    it('should create a mesocycle successfully', async () => {
      const mesocycleData = {
        name: 'Test Mesocycle',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-02-11'),
        durationWeeks: 6,
        currentWeek: 1,
        deloadWeek: 6,
        trainingSplit: 'upper_lower' as const,
        splitDays: [
          {
            id: 'split-1',
            name: 'Upper',
            dayOrder: 1,
            exercises: [],
          },
        ],
        status: 'active' as const,
      };

      const id = await createMesocycle(mesocycleData);
      expect(id).toBeTruthy();

      const mesocycle = await getMesocycle(id);
      expect(mesocycle).toBeDefined();
      expect(mesocycle?.name).toBe('Test Mesocycle');
      expect(mesocycle?.durationWeeks).toBe(6);
      expect(mesocycle?.splitDays).toHaveLength(1);
    });

    it('should reject mesocycle with invalid data', async () => {
      const mesocycleData = {
        name: '',
        startDate: new Date(),
        endDate: new Date(),
        durationWeeks: 6,
        currentWeek: 1,
        deloadWeek: 6,
        trainingSplit: 'upper_lower' as const,
        splitDays: [],
        status: 'active' as const,
      };

      await expect(createMesocycle(mesocycleData)).rejects.toThrow(
        'Validation failed'
      );
    });

    it('should reject mesocycle with end date before start date', async () => {
      const mesocycleData = {
        name: 'Test',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-01-01'),
        durationWeeks: 6,
        currentWeek: 1,
        deloadWeek: 6,
        trainingSplit: 'upper_lower' as const,
        splitDays: [
          {
            id: 'split-1',
            name: 'Upper',
            dayOrder: 1,
            exercises: [],
          },
        ],
        status: 'active' as const,
      };

      await expect(createMesocycle(mesocycleData)).rejects.toThrow(
        'Validation failed'
      );
    });
  });

  describe('updateMesocycle', () => {
    it('should update mesocycle successfully', async () => {
      const id = await createMesocycle({
        name: 'Test Mesocycle',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-02-11'),
        durationWeeks: 6,
        currentWeek: 1,
        deloadWeek: 6,
        trainingSplit: 'upper_lower' as const,
        splitDays: [
          {
            id: 'split-1',
            name: 'Upper',
            dayOrder: 1,
            exercises: [],
          },
        ],
        status: 'active' as const,
      });

      await updateMesocycle(id, {
        currentWeek: 2,
      });

      const mesocycle = await getMesocycle(id);
      expect(mesocycle?.currentWeek).toBe(2);
    });

    it('should throw error for non-existent mesocycle', async () => {
      await expect(
        updateMesocycle('nonexistent', { currentWeek: 2 })
      ).rejects.toThrow('not found');
    });
  });

  describe('deleteMesocycle', () => {
    it('should delete mesocycle successfully', async () => {
      const id = await createMesocycle({
        name: 'Test Mesocycle',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-02-11'),
        durationWeeks: 6,
        currentWeek: 1,
        deloadWeek: 6,
        trainingSplit: 'upper_lower' as const,
        splitDays: [
          {
            id: 'split-1',
            name: 'Upper',
            dayOrder: 1,
            exercises: [],
          },
        ],
        status: 'active' as const,
      });

      await deleteMesocycle(id);

      const mesocycle = await getMesocycle(id);
      expect(mesocycle).toBeUndefined();
    });
  });
});

describe('Database Service - Data Flow Integration', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
  });

  afterEach(async () => {
    await db.delete();
  });

  it('should handle complete workout flow', async () => {
    // 1. Create exercise
    const exerciseId = await createExercise({
      name: 'Bench Press',
      category: 'barbell' as const,
      muscleGroups: ['chest' as const, 'triceps' as const],
      isCustom: true,
    });

    // 2. Create workout with exercise
    const workoutId = await createWorkout({
      date: new Date(),
      exercises: [
        {
          exerciseId,
          sets: [
            {
              id: 'set-1',
              exerciseId,
              setNumber: 1,
              targetReps: 10,
              actualReps: 10,
              weight: 100,
              completed: true,
            },
          ],
        },
      ],
      completed: true,
      duration: 45,
    });

    // 3. Verify workout was created with all data
    const workout = await getWorkout(workoutId);
    expect(workout).toBeDefined();
    expect(workout?.exercises[0].exerciseId).toBe(exerciseId);
    expect(workout?.exercises[0].sets[0].weight).toBe(100);

    // 4. Update workout
    await updateWorkout(workoutId, {
      duration: 50,
      notes: 'Great session!',
    });

    const updatedWorkout = await getWorkout(workoutId);
    expect(updatedWorkout?.duration).toBe(50);
    expect(updatedWorkout?.notes).toBe('Great session!');

    // 5. Delete workout
    await deleteWorkout(workoutId);
    const deletedWorkout = await getWorkout(workoutId);
    expect(deletedWorkout).toBeUndefined();

    // 6. Exercise should still exist
    const exercise = await getExercise(exerciseId);
    expect(exercise).toBeDefined();
  });

  it('should handle mesocycle with workouts flow', async () => {
    // 1. Create mesocycle
    const mesocycleId = await createMesocycle({
      name: 'Strength Block',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-02-11'),
      durationWeeks: 6,
      currentWeek: 1,
      deloadWeek: 6,
      trainingSplit: 'upper_lower' as const,
      splitDays: [
        {
          id: 'upper',
          name: 'Upper',
          dayOrder: 1,
          exercises: [],
        },
      ],
      status: 'active' as const,
    });

    // 2. Create exercise
    const exerciseId = await createExercise({
      name: 'Squat',
      category: 'barbell' as const,
      muscleGroups: ['quads' as const],
      isCustom: true,
    });

    // 3. Create workout linked to mesocycle
    const workoutId = await createWorkout({
      date: new Date('2024-01-05'),
      mesocycleId,
      weekNumber: 1,
      splitDayId: 'upper',
      exercises: [
        {
          exerciseId,
          sets: [
            {
              id: 'set-1',
              exerciseId,
              setNumber: 1,
              targetReps: 5,
              weight: 200,
              completed: true,
            },
          ],
        },
      ],
      completed: true,
    });

    // 4. Verify relationships
    const workout = await getWorkout(workoutId);
    expect(workout?.mesocycleId).toBe(mesocycleId);
    expect(workout?.weekNumber).toBe(1);

    const mesocycle = await getMesocycle(mesocycleId);
    expect(mesocycle?.status).toBe('active');
  });
});

describe('Workout Recovery Functions', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('recoverActiveWorkout', () => {
    it('should return null when no activeWorkout in localStorage', () => {
      const result = recoverActiveWorkout();
      expect(result).toBeNull();
    });

    it('should return null and clear localStorage when JSON is malformed', () => {
      localStorage.setItem('activeWorkout', 'invalid-json{');
      const result = recoverActiveWorkout();
      expect(result).toBeNull();
      expect(localStorage.getItem('activeWorkout')).toBeNull();
    });

    it('should return null and clear localStorage when JSON is not an object (null)', () => {
      localStorage.setItem('activeWorkout', 'null');
      const result = recoverActiveWorkout();
      expect(result).toBeNull();
      expect(localStorage.getItem('activeWorkout')).toBeNull();
    });

    it('should return null and clear localStorage when JSON is not an object (string)', () => {
      localStorage.setItem('activeWorkout', '"just a string"');
      const result = recoverActiveWorkout();
      expect(result).toBeNull();
      expect(localStorage.getItem('activeWorkout')).toBeNull();
    });

    it('should return null and clear localStorage when JSON is not an object (number)', () => {
      localStorage.setItem('activeWorkout', '42');
      const result = recoverActiveWorkout();
      expect(result).toBeNull();
      expect(localStorage.getItem('activeWorkout')).toBeNull();
    });

    it('should return null and clear localStorage when JSON is not an object (array)', () => {
      localStorage.setItem('activeWorkout', '[]');
      const result = recoverActiveWorkout();
      expect(result).toBeNull();
      expect(localStorage.getItem('activeWorkout')).toBeNull();
    });

    it('should return null and clear localStorage when workout is completed', () => {
      const completedWorkout = {
        id: 'workout-1',
        date: new Date().toISOString(),
        exercises: [],
        completed: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem('activeWorkout', JSON.stringify(completedWorkout));
      const result = recoverActiveWorkout();
      expect(result).toBeNull();
      expect(localStorage.getItem('activeWorkout')).toBeNull();
    });

    it('should return incomplete workout with revived Date objects', () => {
      const now = new Date();
      const incompleteWorkout = {
        id: 'workout-1',
        date: now.toISOString(),
        exercises: [],
        completed: false,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };
      localStorage.setItem('activeWorkout', JSON.stringify(incompleteWorkout));
      const result = recoverActiveWorkout();

      expect(result).not.toBeNull();
      expect(result?.id).toBe('workout-1');
      expect(result?.completed).toBe(false);
      // Check that dates were revived as Date objects
      expect(result?.date).toBeInstanceOf(Date);
      expect(result?.createdAt).toBeInstanceOf(Date);
      expect(result?.updatedAt).toBeInstanceOf(Date);
      // localStorage should NOT be cleared for incomplete workouts
      expect(localStorage.getItem('activeWorkout')).not.toBeNull();
    });

    it('should handle ISO date strings with milliseconds', () => {
      const now = new Date();
      const incompleteWorkout = {
        id: 'workout-1',
        date: now.toISOString(), // Format: 2026-02-10T09:02:02.270Z
        exercises: [],
        completed: false,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };
      localStorage.setItem('activeWorkout', JSON.stringify(incompleteWorkout));
      const result = recoverActiveWorkout();

      expect(result?.date).toBeInstanceOf(Date);
      expect(result?.date.getTime()).toBeCloseTo(now.getTime(), -1);
    });

    it('should handle ISO date strings without milliseconds', () => {
      const dateWithoutMs = '2026-02-10T09:02:02Z';
      const incompleteWorkout = {
        id: 'workout-1',
        date: dateWithoutMs,
        exercises: [],
        completed: false,
        createdAt: dateWithoutMs,
        updatedAt: dateWithoutMs,
      };
      localStorage.setItem('activeWorkout', JSON.stringify(incompleteWorkout));
      const result = recoverActiveWorkout();

      expect(result?.date).toBeInstanceOf(Date);
      expect(result?.date.toISOString()).toBe('2026-02-10T09:02:02.000Z');
    });
  });

  describe('autoSaveWorkout', () => {
    it('should save workout to localStorage', () => {
      const workout = {
        id: 'workout-1',
        date: new Date(),
        exercises: [],
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      autoSaveWorkout(workout);
      const saved = localStorage.getItem('activeWorkout');
      expect(saved).not.toBeNull();

      const parsed = JSON.parse(saved!);
      expect(parsed.id).toBe('workout-1');
      expect(parsed.completed).toBe(false);
    });

    it('should not throw on localStorage errors', () => {
      const workout = {
        id: 'workout-1',
        date: new Date(),
        exercises: [],
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock localStorage.setItem to throw
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = () => {
        throw new Error('localStorage is full');
      };

      // Should not throw
      expect(() => autoSaveWorkout(workout)).not.toThrow();

      // Restore
      localStorage.setItem = originalSetItem;
    });
  });

  describe('clearAutoSavedWorkout', () => {
    it('should remove activeWorkout from localStorage', () => {
      localStorage.setItem('activeWorkout', 'some-data');
      expect(localStorage.getItem('activeWorkout')).not.toBeNull();

      clearAutoSavedWorkout();
      expect(localStorage.getItem('activeWorkout')).toBeNull();
    });

    it('should not throw when activeWorkout does not exist', () => {
      expect(() => clearAutoSavedWorkout()).not.toThrow();
    });
  });
});
