'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  CheckSquare,
  Square,
  Plus,
  Play,
  Pause,
  RotateCcw,
  Clock,
  Calendar,
  Flame,
  Tag,
  AlertCircle,
  Trash2,
  Edit2,
  CheckCircle2,
  List,
  CalendarDays,
  Sparkles,
} from 'lucide-react';
import { TaskItem, TaskPriority, TaskStatus, TaskCategory, TimerMode } from '@/lib/types';
import { INITIAL_TASKS } from '@/lib/sampleData';
import { soundManager } from '@/lib/audio';
import { useToast } from '@/components/Notification/ToastContext';

export default function TaskManager() {
  const { showToast } = useToast();

  // Tasks state
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const [filterStatus, setFilterStatus] = useState<'all' | TaskStatus>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // Task creation form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<TaskCategory>('Coding');
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');
  const [newDueDate, setNewDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [newIsRecurring, setNewIsRecurring] = useState(false);
  const [newRecurrence, setNewRecurrence] = useState<'daily' | 'weekly'>('daily');
  const [newMinutes, setNewMinutes] = useState(30);

  // Focus Timer State
  const [timerMode, setTimerMode] = useState<TimerMode>('pomodoro');
  const [customMinutes, setCustomMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [focusMinutesToday, setFocusMinutesToday] = useState(65);

  const initialDuration = 
    timerMode === 'pomodoro' ? 25 * 60 :
    timerMode === 'short_break' ? 5 * 60 :
    timerMode === 'long_break' ? 15 * 60 : customMinutes * 60;

  // Countdown effect
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      // Play audible Web Audio chime
      soundManager.playTimerCompleteChime();
      showToast(
        timerMode === 'pomodoro'
          ? '🔔 Deep Focus Session Complete! Great work on your deliberate practice.'
          : '🔔 Break finished! Ready to jump into the next focus session?',
        'success',
        6000
      );

      if (timerMode === 'pomodoro') {
        setFocusMinutesToday((prev) => prev + 25);
      }
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft, timerMode, showToast]);

  const handleModeSwitch = (mode: TimerMode) => {
    setTimerMode(mode);
    setIsTimerRunning(false);
    if (mode === 'pomodoro') setTimeLeft(25 * 60);
    else if (mode === 'short_break') setTimeLeft(5 * 60);
    else if (mode === 'long_break') setTimeLeft(15 * 60);
    else setTimeLeft(customMinutes * 60);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    handleModeSwitch(timerMode);
  };

  // Toggle Task Completion
  const toggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const willComplete = t.status !== 'completed';
          if (willComplete) {
            soundManager.playAchievementChime();
            showToast(`Task Completed: "${t.title}"! Productivity streak updated.`, 'success');
          }
          return {
            ...t,
            status: willComplete ? 'completed' : 'todo',
            completedAt: willComplete ? new Date().toISOString() : undefined,
          };
        }
        return t;
      })
    );
  };

  // Delete Task
  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    showToast('Task deleted', 'info');
  };

  // Create Task
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: TaskItem = {
      id: `task_${Date.now()}`,
      title: newTitle.trim(),
      description: newDesc.trim(),
      category: newCategory,
      priority: newPriority,
      status: 'todo',
      dueDate: newDueDate,
      isRecurring: newIsRecurring,
      recurrencePattern: newRecurrence,
      estimatedMinutes: Number(newMinutes) || 30,
      createdAt: new Date().toISOString(),
    };

    setTasks([newTask, ...tasks]);
    setShowCreateModal(false);
    setNewTitle('');
    setNewDesc('');
    showToast('Task created and added to your schedule', 'success');
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesStatus = filterStatus === 'all' ? true : t.status === filterStatus;
    const matchesCat = filterCategory === 'all' ? true : t.category === filterCategory;
    return matchesStatus && matchesCat;
  });

  const minutesFormatted = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const secondsFormatted = (timeLeft % 60).toString().padStart(2, '0');
  const timerProgress = ((initialDuration - timeLeft) / initialDuration) * 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
      }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>Focus Time Today</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '28px', fontWeight: 800, color: '#00f2fe' }}>{focusMinutesToday}</span>
            <span style={{ fontSize: '14px', color: '#64748b' }}>minutes</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>Completed Tasks</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '28px', fontWeight: 800, color: '#10b981' }}>
              {tasks.filter((t) => t.status === 'completed').length} / {tasks.length}
            </span>
            <span style={{ fontSize: '14px', color: '#64748b' }}>goals</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>Daily Momentum</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Flame size={24} color="#f59e0b" />
            <span style={{ fontSize: '24px', fontWeight: 800, color: '#f59e0b' }}>8 Day Streak</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>Productivity Velocity</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '28px', fontWeight: 800, color: '#9d4edd' }}>94%</span>
            <span style={{ fontSize: '14px', color: '#64748b' }}>target reached</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Pomodoro Focus Timer on Left, Tasks on Right */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '360px 1fr',
        gap: '24px',
        alignItems: 'start',
      }}>
        {/* Pomodoro Focus Timer Card */}
        <div className="glass-panel" style={{ padding: '28px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Orbit Focus Studio</h3>

          {/* Mode Selector Tabs */}
          <div style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '10px',
            padding: '4px',
            marginBottom: '28px',
          }}>
            {[
              { id: 'pomodoro' as TimerMode, label: 'Focus (25m)' },
              { id: 'short_break' as TimerMode, label: 'Short (5m)' },
              { id: 'long_break' as TimerMode, label: 'Long (15m)' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => handleModeSwitch(m.id)}
                style={{
                  flex: 1,
                  padding: '7px 4px',
                  borderRadius: '7px',
                  fontSize: '12px',
                  fontWeight: timerMode === m.id ? 700 : 500,
                  background: timerMode === m.id ? 'linear-gradient(135deg, #00f2fe, #4facfe)' : 'transparent',
                  color: timerMode === m.id ? '#060911' : '#94a3b8',
                  cursor: 'pointer',
                }}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Big Circular Clock Display */}
          <div style={{
            position: 'relative',
            width: '210px',
            height: '210px',
            margin: '0 auto 28px auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {/* SVG Ring Progress */}
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <circle
                cx="105"
                cy="105"
                r="95"
                stroke="rgba(255, 255, 255, 0.06)"
                strokeWidth="10"
                fill="none"
              />
              <circle
                cx="105"
                cy="105"
                r="95"
                stroke="url(#timerGradient)"
                strokeWidth="10"
                fill="none"
                strokeDasharray={2 * Math.PI * 95}
                strokeDashoffset={2 * Math.PI * 95 * (1 - timerProgress / 100)}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.8s ease' }}
              />
              <defs>
                <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00f2fe" />
                  <stop offset="100%" stopColor="#7928ca" />
                </linearGradient>
              </defs>
            </svg>

            {/* Time readout */}
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{
                fontSize: '44px',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                color: '#fff',
                letterSpacing: '-0.02em',
              }}>
                {minutesFormatted}:{secondsFormatted}
              </div>
              <div style={{ fontSize: '12px', color: '#00f2fe', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {isTimerRunning ? 'Sprinting' : 'Ready'}
              </div>
            </div>
          </div>

          {/* Timer Controls */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px' }}>
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="gradient-btn-primary"
              style={{ padding: '12px 28px', fontSize: '15px' }}
            >
              {isTimerRunning ? <Pause size={17} /> : <Play size={17} />}
              <span>{isTimerRunning ? 'Pause' : 'Start Focus'}</span>
            </button>

            <button
              onClick={resetTimer}
              className="gradient-btn-secondary"
              style={{ padding: '12px 18px' }}
              title="Reset Timer"
            >
              <RotateCcw size={17} />
            </button>
          </div>

          <div style={{ marginTop: '20px', fontSize: '12px', color: '#64748b' }}>
            Audible Web Audio chime alerts upon interval conclusion.
          </div>
        </div>

        {/* Task Manager Column */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          {/* Action Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '20px',
          }}>
            <div>
              <h3 style={{ fontSize: '20px' }}>Daily Tasks & Learning Goals</h3>
              <p style={{ color: '#94a3b8', fontSize: '13px' }}>
                Organize milestones, priorities, and recurring practice.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* View Switcher */}
              <div style={{
                display: 'flex',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                padding: '3px',
              }}>
                <button
                  onClick={() => setViewMode('list')}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    background: viewMode === 'list' ? 'rgba(0, 242, 254, 0.2)' : 'transparent',
                    color: viewMode === 'list' ? '#00f2fe' : '#94a3b8',
                  }}
                >
                  <List size={16} />
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    background: viewMode === 'calendar' ? 'rgba(0, 242, 254, 0.2)' : 'transparent',
                    color: viewMode === 'calendar' ? '#00f2fe' : '#94a3b8',
                  }}
                >
                  <CalendarDays size={16} />
                </button>
              </div>

              {/* Add Task Button */}
              <button
                onClick={() => setShowCreateModal(true)}
                className="gradient-btn-primary"
                style={{ fontSize: '13px', padding: '8px 16px' }}
              >
                <Plus size={16} />
                <span>Create Task</span>
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '16px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '10px',
          }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['all', 'todo', 'in_progress', 'completed'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: filterStatus === status ? 700 : 400,
                    background: filterStatus === status ? 'rgba(0, 242, 254, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                    color: filterStatus === status ? '#00f2fe' : '#94a3b8',
                    border: '1px solid',
                    borderColor: filterStatus === status ? 'rgba(0, 242, 254, 0.3)' : 'transparent',
                    textTransform: 'capitalize',
                  }}
                >
                  {status === 'all' ? 'All Tasks' : status.replace('_', ' ')}
                </button>
              ))}
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{
                fontSize: '12px',
                padding: '4px 8px',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#cbd5e1',
              }}
            >
              <option value="all">All Categories</option>
              <option value="Coding">Coding</option>
              <option value="Study">Study</option>
              <option value="Career">Career</option>
              <option value="Project">Project</option>
              <option value="Personal">Personal</option>
            </select>
          </div>

          {/* Task List Rendering */}
          {viewMode === 'list' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredTasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  No tasks match the active filter.
                </div>
              ) : (
                filteredTasks.map((task) => {
                  const isDone = task.status === 'completed';
                  const priorityColor =
                    task.priority === 'urgent' ? '#f43f5e' :
                    task.priority === 'high' ? '#f59e0b' :
                    task.priority === 'medium' ? '#00f2fe' : '#64748b';

                  return (
                    <div
                      key={task.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        padding: '14px 18px',
                        borderRadius: '12px',
                        background: isDone ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        opacity: isDone ? 0.65 : 1,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleTask(task.id)}
                        style={{
                          color: isDone ? '#10b981' : '#64748b',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        {isDone ? <CheckCircle2 size={22} color="#10b981" /> : <Square size={22} />}
                      </button>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: isDone ? '#94a3b8' : '#f1f5f9',
                          textDecoration: isDone ? 'line-through' : 'none',
                        }}>
                          {task.title}
                        </div>
                        {task.description && (
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                            {task.description}
                          </div>
                        )}
                      </div>

                      {/* Metadata badges */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: priorityColor,
                          background: `${priorityColor}15`,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          border: `1px solid ${priorityColor}33`,
                          textTransform: 'uppercase',
                        }}>
                          {task.priority}
                        </span>

                        <span style={{
                          fontSize: '11px',
                          color: '#94a3b8',
                          background: 'rgba(255, 255, 255, 0.05)',
                          padding: '3px 8px',
                          borderRadius: '6px',
                        }}>
                          {task.category}
                        </span>

                        {task.dueDate && (
                          <span style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={12} />
                            {task.dueDate}
                          </span>
                        )}

                        <button
                          onClick={() => deleteTask(task.id)}
                          style={{ color: '#64748b', cursor: 'pointer', padding: '4px' }}
                          title="Delete Task"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* Calendar View Schedule Grid */
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
            }}>
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, i) => (
                <div
                  key={day}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    padding: '12px',
                    minHeight: '140px',
                  }}
                >
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#00f2fe', marginBottom: '8px' }}>
                    {day}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {tasks.slice(i % 3, (i % 3) + 2).map((t) => (
                      <div
                        key={t.id}
                        style={{
                          fontSize: '11px',
                          padding: '6px',
                          borderRadius: '6px',
                          background: 'rgba(0, 242, 254, 0.1)',
                          color: '#e2e8f0',
                        }}
                      >
                        {t.title}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}>
          <form
            onSubmit={handleCreateTask}
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '520px',
              padding: '28px',
              borderRadius: '20px',
            }}
          >
            <h3 style={{ fontSize: '20px', marginBottom: '18px' }}>Add Learning Goal or Task</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master PyTorch Attention or Solve 2 Medium Trees"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Subtasks, links, or notes..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  style={{ width: '100%', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as TaskCategory)}
                    style={{ width: '100%' }}
                  >
                    <option value="Coding">Coding</option>
                    <option value="Study">Study</option>
                    <option value="Career">Career</option>
                    <option value="Project">Project</option>
                    <option value="Personal">Personal</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                    style={{ width: '100%' }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                    Estimated Minutes
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="300"
                    value={newMinutes}
                    onChange={(e) => setNewMinutes(Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                <input
                  type="checkbox"
                  id="rec"
                  checked={newIsRecurring}
                  onChange={(e) => setNewIsRecurring(e.target.checked)}
                />
                <label htmlFor="rec" style={{ fontSize: '13px', color: '#cbd5e1' }}>
                  Make this a recurring goal (Daily / Weekly practice)
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="gradient-btn-secondary"
                style={{ padding: '8px 18px' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="gradient-btn-primary"
                style={{ padding: '8px 22px' }}
              >
                Save Goal
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
