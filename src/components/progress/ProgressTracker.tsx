import { useState } from 'react';
import { deleteWorkout, useWorkout } from '../../hooks/useDatabase';
import WorkoutHistory from './WorkoutHistory';
import WorkoutDetail from './WorkoutDetail';
import ProgressStats from './ProgressStats';
import PersonalRecords from './PersonalRecords';
import WorkoutCalendar from './WorkoutCalendar';
import './ProgressTracker.css';

type ProgressTab = 'history' | 'stats' | 'records' | 'calendar';

export default function ProgressTracker() {
  const [activeTab, setActiveTab] = useState<ProgressTab>('history');
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(
    null
  );
  const selectedWorkout = useWorkout(selectedWorkoutId || undefined);

  const handleViewWorkout = (workoutId: string) => {
    setSelectedWorkoutId(workoutId);
  };

  const handleCloseWorkout = () => {
    setSelectedWorkoutId(null);
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    await deleteWorkout(workoutId);
  };

  return (
    <div className="progress-tracker">
      <div className="progress-header">
        <h1>Progress Tracking</h1>
        <p className="progress-subtitle">
          Track your training journey and achievements
        </p>
      </div>

      <div className="progress-tabs">
        <button
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          aria-pressed={activeTab === 'history'}
          onClick={() => setActiveTab('history')}
        >
          History
        </button>
        <button
          className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
          aria-pressed={activeTab === 'stats'}
          onClick={() => setActiveTab('stats')}
        >
          Stats
        </button>
        <button
          className={`tab-btn ${activeTab === 'records' ? 'active' : ''}`}
          aria-pressed={activeTab === 'records'}
          onClick={() => setActiveTab('records')}
        >
          Records
        </button>
        <button
          className={`tab-btn ${activeTab === 'calendar' ? 'active' : ''}`}
          aria-pressed={activeTab === 'calendar'}
          onClick={() => setActiveTab('calendar')}
        >
          Calendar
        </button>
      </div>

      <div className="progress-content">
        {activeTab === 'history' && (
          <WorkoutHistory onViewWorkout={handleViewWorkout} />
        )}
        {activeTab === 'stats' && <ProgressStats />}
        {activeTab === 'records' && <PersonalRecords />}
        {activeTab === 'calendar' && <WorkoutCalendar />}
      </div>

      {selectedWorkoutId && selectedWorkout && (
        <WorkoutDetail
          workout={selectedWorkout}
          onClose={handleCloseWorkout}
          onDelete={handleDeleteWorkout}
        />
      )}
    </div>
  );
}
