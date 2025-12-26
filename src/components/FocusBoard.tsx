import React, { useState, useEffect } from 'react';
import { CheckSquare, Plus, Trash2, Circle } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { collection, query, where, orderBy, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { Task } from '../lib/types';

const FocusBoard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<Task['priority']>('medium');
  const [loading, setLoading] = useState(true);

  const priorities = {
    high: { label: 'High Priority', color: 'bg-red-600', icon: '🔥', desc: 'Urgent & Important' },
    medium: { label: 'Medium Priority', color: 'bg-amber-600', icon: '⭐', desc: 'Important' },
    low: { label: 'Low Priority', color: 'bg-green-600', icon: '🌱', desc: 'Nice to have' }
  };

  const spiritualTaskSuggestions = [
    "Read Bhagavad Gita for 15 minutes",
    "Practice 108 rounds of Naam Japa",
    "Write in gratitude journal",
    "Meditate for 10 minutes",
    "Listen to spiritual discourse",
    "Serve someone selflessly today",
    "Practice pranayama breathing",
    "Study sacred texts",
    "Attend virtual satsang",
    "Offer prayers before meals"
  ];

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, 'tasks'),
        where('user_id', '==', user.uid),
        orderBy('created_at', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));

      setTasks(data || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async () => {
    if (!newTask.trim()) return;

    try {
      const user = auth.currentUser;
      if (!user) return;

      const task: Task = {
        user_id: user.uid,
        task_text: newTask.trim(),
        priority: selectedPriority,
        is_completed: false,
        created_at: new Date().toISOString()
      };

      await addDoc(collection(db, 'tasks'), task);

      setNewTask('');
      await loadTasks();
    } catch (error) {
      console.error('Error adding task:', error);
      alert('Error adding sacred task. Please try again.');
    }
  };

  const toggleTask = async (taskId: string, isCompleted: boolean) => {
    // If it's already completed (shouldn't happen with new logic, but safety check), do nothing or delete
    if (isCompleted) {
      await deleteTask(taskId);
      return;
    }

    if (!confirm('Mark as complete and remove this sacred task?')) return;

    try {
      // Remove the task from the database when completed
      await deleteDoc(doc(db, 'tasks', taskId));
      await loadTasks();
    } catch (error) {
      console.error('Error completing task:', error);
      alert('Error completing task. Please try again.');
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to remove this sacred task?')) return;

    try {
      await deleteDoc(doc(db, 'tasks', taskId));
      await loadTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Error removing task. Please try again.');
    }
  };

  const addSpiritualTask = (suggestion: string) => {
    setNewTask(suggestion);
    setSelectedPriority('medium');
  };

  const getCompletionStats = () => {
    // Since completed tasks are deleted, we can't track "completed" vs "total" historically in this view.
    // We will just show active tasks count.
    const active = tasks.length;
    return { active };
  };

  const { active } = getCompletionStats();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center text-amber-100">Loading your sacred focus board...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 mandala-bg">
      <div className="floating-particles">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 20}s`,
              animationDuration: `${15 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-emerald-200 to-emerald-400 rounded-full flex items-center justify-center">
            <CheckSquare className="w-8 h-8 text-indigo-900" />
          </div>
          <h1 className="text-4xl font-bold text-amber-100 mb-4">🎯 Sacred Focus Board</h1>
          <p className="sacred-text text-xl">Meaningful tasks aligned with your dharma</p>
        </div>

        {/* Active Tasks Overview */}
        <div className="spiritual-card rounded-2xl p-8 mb-8 text-center divine-glow">
          <h3 className="text-2xl font-bold text-amber-100 mb-4">Current Focus</h3>
          <div className="flex justify-center items-center space-x-4">
            <div>
              <div className="text-5xl font-bold text-amber-300 mb-2">{active}</div>
              <p className="sacred-text">Active Tasks</p>
            </div>
          </div>
        </div>

        {/* Add New Task */}
        <div className="spiritual-card rounded-2xl p-8 mb-8 divine-glow">
          <h3 className="text-2xl font-bold text-amber-100 mb-6 text-center">✨ Add Sacred Task</h3>

          <div className="space-y-6">
            <div>
              <label className="block text-amber-100 font-medium mb-3">Priority Level</label>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(priorities).map(([key, priority]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedPriority(key as Task['priority'])}
                    className={`p-4 rounded-xl transition-all ${selectedPriority === key
                      ? `${priority.color} text-white border-2 border-white/50`
                      : 'bg-slate-700/30 border border-slate-600/50 text-amber-100 hover:bg-slate-600/30'
                      }`}
                  >
                    <div className="text-2xl mb-2">{priority.icon}</div>
                    <div className="font-medium">{priority.label}</div>
                    <div className="text-xs opacity-75">{priority.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-amber-100 font-medium mb-3">Sacred Task</label>
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="What meaningful action will you take today?"
                className="w-full p-4 bg-slate-800/50 text-amber-100 rounded-xl border border-slate-600/50 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300/20 transition-all"
                onKeyPress={(e) => e.key === 'Enter' && addTask()}
              />
            </div>

            <button
              onClick={addTask}
              disabled={!newTask.trim()}
              className="w-full sacred-button text-amber-100 font-semibold py-4 px-6 rounded-xl transition-all flex items-center justify-center disabled:opacity-50"
            >
              <Plus className="w-6 h-6 mr-3" />
              Add Sacred Task
            </button>
          </div>
        </div>

        {/* Spiritual Task Suggestions */}
        <div className="spiritual-card rounded-2xl p-8 mb-8 divine-glow">
          <h3 className="text-2xl font-bold text-amber-100 mb-6 text-center">🌟 Spiritual Task Suggestions</h3>
          <div className="grid grid-cols-1 gap-3">
            {spiritualTaskSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => addSpiritualTask(suggestion)}
                className="text-left p-4 bg-slate-700/30 hover:bg-slate-600/30 rounded-xl transition-all border border-slate-600/50 hover:border-amber-300/50"
              >
                <span className="text-amber-100">{suggestion}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tasks List */}
        <div className="spiritual-card rounded-2xl p-8 divine-glow">
          <h3 className="text-2xl font-bold text-amber-100 mb-6 text-center">📋 Your Sacred Tasks</h3>

          {tasks.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-6">🎯</div>
              <p className="sacred-text text-xl mb-4">Urgent tasks are clear.</p>
              <p className="text-slate-400">Add tasks that align with your spiritual growth and life purpose.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Active Tasks */}
              <div>
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl mb-3">
                    <div className="flex items-center flex-1">
                      <button
                        onClick={() => toggleTask(task.id!, task.is_completed)}
                        className="mr-4 text-slate-400 hover:text-emerald-400 transition-colors"
                        title="Mark Complete & Remove"
                      >
                        <Circle className="w-6 h-6" />
                      </button>

                      <div className="flex-1">
                        <p className="text-amber-100 font-medium">{task.task_text}</p>
                        <div className="flex items-center mt-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorities[task.priority].color} text-white`}>
                            {priorities[task.priority].icon} {priorities[task.priority].label}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteTask(task.id!)}
                      className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-slate-600/50 transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FocusBoard;