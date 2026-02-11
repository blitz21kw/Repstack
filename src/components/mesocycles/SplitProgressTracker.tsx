/**
 * Component to display split progression within a mesocycle
 * Shows which splits have been completed in the current week
 */

import { useEffect, useState } from 'react';
import {
  getSplitCompletionStatus,
  recoverActiveWorkout,
} from '../../db/service';
import type { MesocycleSplitDay, Mesocycle, Workout } from '../../types/models';
import './SplitProgressTracker.css';

interface SplitCompletionInfo {
  splitDay: MesocycleSplitDay;
  completed: boolean;
  completedDate?: Date;
}

interface SplitProgressTrackerProps {
  mesocycle: Mesocycle;
  onStartWorkout?: (splitDayId: string) => void;
  onResumeWorkout?: () => void;
}

export default function SplitProgressTracker({
  mesocycle,
  onStartWorkout,
  onResumeWorkout,
}: SplitProgressTrackerProps) {
  const [splitStatus, setSplitStatus] = useState<SplitCompletionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);

  useEffect(() => {
    async function loadSplitStatus() {
      setLoading(true);
      try {
        const status = await getSplitCompletionStatus(mesocycle.id);
        setSplitStatus(status);

        // Check for active workout in progress
        const recovered = recoverActiveWorkout();
        setActiveWorkout(recovered);
      } catch (error) {
        console.error('Failed to load split completion status:', error);
      } finally {
        setLoading(false);
      }
    }

    loadSplitStatus();

    // Reload every 30 seconds to catch updates
    const interval = setInterval(loadSplitStatus, 30000);
    return () => clearInterval(interval);
  }, [mesocycle.id, mesocycle.currentWeek]);

  const isDeloadWeek = mesocycle.currentWeek === mesocycle.deloadWeek;
  const progress = (mesocycle.currentWeek / mesocycle.durationWeeks) * 100;

  // Find next recommended split
  const nextSplit = splitStatus.find((s) => !s.completed)?.splitDay;
  const allCompleted =
    splitStatus.length > 0 && splitStatus.every((s) => s.completed);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="split-progress-tracker loading">
        <p>Loading split progress...</p>
      </div>
    );
  }

  if (splitStatus.length === 0) {
    return (
      <div className="split-progress-tracker empty">
        <p>No split configuration found for this mesocycle.</p>
      </div>
    );
  }

  return (
    <div
      className={`split-progress-tracker ${isDeloadWeek ? 'deload-week' : ''}`}
    >
      {/* Header with week info */}
      <div className="tracker-header">
        <h3 className="tracker-title">
          {mesocycle.name} - Week {mesocycle.currentWeek} of{' '}
          {mesocycle.durationWeeks}
          {isDeloadWeek && <span className="deload-badge">🔄 Deload Week</span>}
        </h3>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar-container">
        <div className="progress-bar">
          <div
            className={`progress-fill ${isDeloadWeek ? 'deload' : ''}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="progress-label">{Math.round(progress)}%</span>
      </div>

      {/* Active Workout Resume Banner */}
      {activeWorkout && !activeWorkout.completed && onResumeWorkout && (
        <div className="active-workout-banner">
          <div className="active-workout-info">
            <span className="active-workout-icon">🏋️</span>
            <div className="active-workout-text">
              <strong>Workout in Progress</strong>
              <span className="active-workout-details">
                {activeWorkout.exercises.length} exercise
                {activeWorkout.exercises.length !== 1 ? 's' : ''} • Started{' '}
                {formatDate(activeWorkout.date)}
              </span>
            </div>
          </div>
          <button
            className="btn btn-primary resume-workout-btn"
            onClick={onResumeWorkout}
          >
            Resume Workout
          </button>
        </div>
      )}

      {/* This Week's Progress */}
      <div className="week-progress-section">
        <h4 className="section-title">This Week&apos;s Progress:</h4>

        <div className="split-cards">
          {splitStatus.map((info) => {
            const isNext = !allCompleted && info.splitDay.id === nextSplit?.id;
            const isInProgress =
              activeWorkout &&
              !activeWorkout.completed &&
              activeWorkout.splitDayId === info.splitDay.id;

            const handleCardClick = () => {
              if (isInProgress) {
                if (onResumeWorkout) {
                  onResumeWorkout();
                } else {
                  console.warn('Resume workout callback not provided');
                }
              } else if (onStartWorkout) {
                onStartWorkout(info.splitDay.id);
              } else {
                console.warn('Start workout callback not provided');
              }
            };

            return (
              <button
                type="button"
                key={info.splitDay.id}
                className={`split-card clickable ${info.completed ? 'completed' : ''} ${isNext ? 'next' : ''} ${isInProgress ? 'in-progress' : ''}`}
                onClick={handleCardClick}
                aria-label={`${
                  isInProgress ? 'Resume' : info.completed ? 'Redo' : 'Start'
                } ${info.splitDay.name}`}
              >
                <div className="split-card-header">
                  <span className="split-name">{info.splitDay.name}</span>
                  <span className="split-status">
                    {isInProgress
                      ? '🏋️ In Progress'
                      : info.completed
                        ? '✓'
                        : isNext
                          ? '★ Next'
                          : ''}
                  </span>
                </div>
                {info.completedDate && (
                  <div className="split-date">
                    {formatDate(info.completedDate)}
                  </div>
                )}
                {!info.completed && info.splitDay.exercises.length > 0 && (
                  <div className="split-info">
                    {info.splitDay.exercises.length} exercise
                    {info.splitDay.exercises.length !== 1 ? 's' : ''}
                  </div>
                )}
                <div className="split-card-action">
                  {isInProgress
                    ? 'Tap to resume'
                    : info.completed
                      ? 'Tap to redo'
                      : 'Tap to start'}
                </div>
              </button>
            );
          })}
        </div>

        {/* Completion Message */}
        {allCompleted && (
          <div className="completion-message">
            <span className="completion-icon">🎉</span>
            <p className="completion-text">All done this week!</p>
            <p className="completion-subtext">Tap any split above to redo it</p>
          </div>
        )}
      </div>

      {/* Deload Week Message */}
      {isDeloadWeek && (
        <div className="deload-message">
          <p>
            <strong>Deload Week:</strong> Reduce volume by 40-50% to facilitate
            recovery and prepare for the next training block.
          </p>
        </div>
      )}
    </div>
  );
}
