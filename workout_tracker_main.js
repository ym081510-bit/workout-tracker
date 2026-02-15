import React, { useState, useEffect } from 'react';
import { Plus, X, TrendingUp, Calendar, Dumbbell, Edit2, Save, Settings, Download, Upload, Apple } from 'lucide-react';

const EXERCISE_CATEGORIES = {
  legs: { name: 'Legs', color: 'bg-blue-500/20 hover:bg-blue-500/30 border-blue-500', exercises: ['Squat', 'Leg Press', 'Leg Curl', 'Leg Extension', 'Deadlift'] },
  chest: { name: 'Chest', color: 'bg-red-500/20 hover:bg-red-500/30 border-red-500', exercises: ['Bench Press', 'Dumbbell Fly'] },
  biceps: { name: 'Biceps', color: 'bg-purple-500/20 hover:bg-purple-500/30 border-purple-500', exercises: ['Barbell Curl'] },
  triceps: { name: 'Triceps', color: 'bg-pink-500/20 hover:bg-pink-500/30 border-pink-500', exercises: ['Triceps Extension'] },
  shoulders: { name: 'Shoulders', color: 'bg-yellow-500/20 hover:bg-yellow-500/30 border-yellow-500', exercises: ['Shoulder Press'] },
  back: { name: 'Back', color: 'bg-green-500/20 hover:bg-green-500/30 border-green-500', exercises: ['Lat Pulldown', 'Barbell Row'] }
};

const getAllPresetExercises = () => Object.values(EXERCISE_CATEGORIES).flatMap(cat => cat.exercises);

export default function WorkoutTracker() {
  const [view, setView] = useState('record');
  const [workouts, setWorkouts] = useState([]);
  const [nutrition, setNutrition] = useState([]);
  const [exercises, setExercises] = useState(getAllPresetExercises());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentWorkout, setCurrentWorkout] = useState([]);
  const [workoutMemo, setWorkoutMemo] = useState('');
  const [currentNutrition, setCurrentNutrition] = useState({ protein: '', fat: '', carbs: '' });
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseCategory, setNewExerciseCategory] = useState('legs');
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showExerciseManager, setShowExerciseManager] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [showExerciseDeleteConfirm, setShowExerciseDeleteConfirm] = useState(null);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [showImportExport, setShowImportExport] = useState(false);
  const [addingSetToWorkout, setAddingSetToWorkout] = useState(null);
  const [selectedProgressExercise, setSelectedProgressExercise] = useState(null);
  const [progressGraphType, setProgressGraphType] = useState('maxWeight'); // 'maxWeight' or 'totalVolume'
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMonth, setDatePickerMonth] = useState(new Date().getMonth());
  const [datePickerYear, setDatePickerYear] = useState(new Date().getFullYear());
  const [selectedHistoryExercise, setSelectedHistoryExercise] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('workouts');
    if (stored) setWorkouts(JSON.parse(stored));
    const storedNutrition = localStorage.getItem('nutrition');
    if (storedNutrition) setNutrition(JSON.parse(storedNutrition));
    const storedEx = localStorage.getItem('customExercises');
    if (storedEx) {
      const custom = JSON.parse(storedEx);
      custom.forEach(item => {
        if (item.category && EXERCISE_CATEGORIES[item.category]) {
          if (!EXERCISE_CATEGORIES[item.category].exercises.includes(item.name)) {
            EXERCISE_CATEGORIES[item.category].exercises.push(item.name);
          }
        }
      });
      setExercises([...getAllPresetExercises(), ...custom.map(c => c.name)]);
    }
  }, []);

  useEffect(() => {
    const existing = nutrition.find(n => n.date === selectedDate);
    setCurrentNutrition(existing ? { protein: existing.protein || '', fat: existing.fat || '', carbs: existing.carbs || '' } : { protein: '', fat: '', carbs: '' });
  }, [selectedDate, nutrition]);

  const saveWorkouts = (newWorkouts) => { setWorkouts(newWorkouts); localStorage.setItem('workouts', JSON.stringify(newWorkouts)); };
  const saveNutrition = (newNutrition) => { setNutrition(newNutrition); localStorage.setItem('nutrition', JSON.stringify(newNutrition)); };

  const calculateCalories = (protein, fat, carbs) => {
    const p = parseFloat(protein) || 0;
    const f = parseFloat(fat) || 0;
    const c = parseFloat(carbs) || 0;
    return Math.round(p * 4 + f * 9 + c * 4);
  };

  const saveNutritionForDate = () => {
    const calories = calculateCalories(currentNutrition.protein, currentNutrition.fat, currentNutrition.carbs);
    const existingIndex = nutrition.findIndex(n => n.date === selectedDate);
    let newNutrition;
    if (existingIndex !== -1) {
      newNutrition = [...nutrition];
      newNutrition[existingIndex] = { date: selectedDate, ...currentNutrition, calories, id: nutrition[existingIndex].id };
    } else {
      newNutrition = [...nutrition, { date: selectedDate, ...currentNutrition, calories, id: Date.now() }];
    }
    saveNutrition(newNutrition);
  };

  const addCustomExercise = () => {
    if (newExerciseName.trim()) {
      const storedEx = localStorage.getItem('customExercises');
      const custom = storedEx ? JSON.parse(storedEx) : [];
      const newExercise = { name: newExerciseName.trim(), category: newExerciseCategory };
      custom.push(newExercise);
      localStorage.setItem('customExercises', JSON.stringify(custom));
      if (EXERCISE_CATEGORIES[newExerciseCategory]) {
        EXERCISE_CATEGORIES[newExerciseCategory].exercises.push(newExerciseName.trim());
      }
      setExercises([...getAllPresetExercises(), ...custom.map(c => c.name)]);
      setNewExerciseName('');
      setNewExerciseCategory('legs');
      setShowAddExercise(false);
    }
  };

  const addSetToWorkout = (exercise) => setCurrentWorkout([...currentWorkout, { exercise, weight: '', reps: '', id: Date.now() }]);
  const copySet = (set) => setCurrentWorkout([...currentWorkout, { exercise: set.exercise, weight: set.weight, reps: set.reps, id: Date.now() }]);
  const updateSet = (id, field, value) => setCurrentWorkout(currentWorkout.map(set => set.id === id ? { ...set, [field]: value } : set));
  const removeSet = (id) => setCurrentWorkout(currentWorkout.filter(set => set.id !== id));

  const saveWorkout = () => {
    if (currentWorkout.length === 0) return;
    const validSets = currentWorkout.filter(s => s.weight && s.reps);
    if (validSets.length === 0) return;
    const newWorkouts = [...workouts, { date: selectedDate, sets: validSets, memo: workoutMemo, id: Date.now() }];
    saveWorkouts(newWorkouts);
    setCurrentWorkout([]);
    setWorkoutMemo('');
  };

  const addSetToExistingWorkout = (workout) => setAddingSetToWorkout({ ...workout, newSet: { exercise: '', weight: '', reps: '', id: Date.now() } });

  const saveAddedSet = () => {
    if (!addingSetToWorkout.newSet.exercise || !addingSetToWorkout.newSet.weight || !addingSetToWorkout.newSet.reps) return;
    const newWorkouts = workouts.map(w => w.id === addingSetToWorkout.id ? { ...w, sets: [...w.sets, addingSetToWorkout.newSet] } : w);
    saveWorkouts(newWorkouts);
    setAddingSetToWorkout(null);
  };

  const startEditWorkout = (workout) => setEditingWorkout({ ...workout, sets: workout.sets.map(s => ({ ...s, id: s.id || Date.now() + Math.random() })) });
  const updateEditingSet = (id, field, value) => setEditingWorkout({ ...editingWorkout, sets: editingWorkout.sets.map(set => set.id === id ? { ...set, [field]: value } : set) });
  const removeEditingSet = (id) => setEditingWorkout({ ...editingWorkout, sets: editingWorkout.sets.filter(set => set.id !== id) });

  const saveEditedWorkout = () => {
    const validSets = editingWorkout.sets.filter(s => s.weight && s.reps);
    if (validSets.length === 0) { setShowDeleteConfirm(true); return; }
    const newWorkouts = workouts.map(w => w.id === editingWorkout.id ? { ...editingWorkout, sets: validSets } : w);
    saveWorkouts(newWorkouts);
    setEditingWorkout(null);
  };

  const confirmDelete = () => { const newWorkouts = workouts.filter(w => w.id !== editingWorkout.id); saveWorkouts(newWorkouts); setEditingWorkout(null); setShowDeleteConfirm(false); };
  const cancelDelete = () => setShowDeleteConfirm(false);

  const getCustomExercises = () => { const storedEx = localStorage.getItem('customExercises'); return storedEx ? JSON.parse(storedEx) : []; };

  const deleteCustomExercise = (exerciseName) => {
    const custom = getCustomExercises().filter(e => e.name !== exerciseName);
    localStorage.setItem('customExercises', JSON.stringify(custom));
    Object.values(EXERCISE_CATEGORIES).forEach(cat => { const index = cat.exercises.indexOf(exerciseName); if (index > -1) cat.exercises.splice(index, 1); });
    setExercises([...getAllPresetExercises(), ...custom.map(c => c.name)]);
    setEditingExercise(null);
    setShowExerciseDeleteConfirm(null);
  };

  const deletePresetExercise = (exerciseName, category) => {
    const index = EXERCISE_CATEGORIES[category].exercises.indexOf(exerciseName);
    if (index > -1) EXERCISE_CATEGORIES[category].exercises.splice(index, 1);
    const removedPresets = JSON.parse(localStorage.getItem('removedPresets') || '[]');
    removedPresets.push(exerciseName);
    localStorage.setItem('removedPresets', JSON.stringify(removedPresets));
    setExercises(exercises.filter(e => e !== exerciseName));
    setEditingExercise(null);
    setShowExerciseDeleteConfirm(null);
  };

  const updateCustomExercise = (oldName, newName, newCategory) => {
    const custom = getCustomExercises();
    const exerciseIndex = custom.findIndex(e => e.name === oldName);
    if (exerciseIndex !== -1) {
      custom[exerciseIndex] = { name: newName, category: newCategory };
      localStorage.setItem('customExercises', JSON.stringify(custom));
      Object.values(EXERCISE_CATEGORIES).forEach(cat => { const index = cat.exercises.indexOf(oldName); if (index > -1) cat.exercises.splice(index, 1); });
      if (EXERCISE_CATEGORIES[newCategory]) EXERCISE_CATEGORIES[newCategory].exercises.push(newName);
      setExercises([...getAllPresetExercises(), ...custom.map(c => c.name)]);
      setEditingExercise(null);
    }
  };

  const updatePresetExercise = (oldName, newName, oldCategory, newCategory) => {
    const index = EXERCISE_CATEGORIES[oldCategory].exercises.indexOf(oldName);
    if (index > -1) EXERCISE_CATEGORIES[oldCategory].exercises.splice(index, 1);
    if (EXERCISE_CATEGORIES[newCategory]) EXERCISE_CATEGORIES[newCategory].exercises.push(newName);
    const presetMods = JSON.parse(localStorage.getItem('presetModifications') || '{}');
    presetMods[oldName] = { newName, newCategory };
    localStorage.setItem('presetModifications', JSON.stringify(presetMods));
    setExercises(exercises.map(e => e === oldName ? newName : e));
    setEditingExercise(null);
  };

  const exportData = () => {
    const data = { workouts: JSON.parse(localStorage.getItem('workouts') || '[]'), nutrition: JSON.parse(localStorage.getItem('nutrition') || '[]'), customExercises: JSON.parse(localStorage.getItem('customExercises') || '[]'), presetModifications: JSON.parse(localStorage.getItem('presetModifications') || '{}'), removedPresets: JSON.parse(localStorage.getItem('removedPresets') || '[]'), exportDate: new Date().toISOString(), version: '1.0' };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workout-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result);
        if (!data.workouts || !Array.isArray(data.workouts)) { alert('Invalid backup file format'); return; }
        localStorage.setItem('workouts', JSON.stringify(data.workouts));
        if (data.nutrition) localStorage.setItem('nutrition', JSON.stringify(data.nutrition));
        if (data.customExercises) localStorage.setItem('customExercises', JSON.stringify(data.customExercises));
        if (data.presetModifications) localStorage.setItem('presetModifications', JSON.stringify(data.presetModifications));
        if (data.removedPresets) localStorage.setItem('removedPresets', JSON.stringify(data.removedPresets));
        alert('Data imported successfully! The page will now reload.');
        window.location.reload();
      } catch (error) { alert('Failed to import data. Please check the file format.'); console.error(error); }
    };
    reader.readAsText(file);
  };

  const getWorkoutsByDate = () => { const byDate = {}; workouts.forEach(w => { if (!byDate[w.date]) byDate[w.date] = []; byDate[w.date].push(w); }); return byDate; };
  const getExerciseHistory = (exercise) => { const history = []; workouts.forEach(w => { const sets = w.sets.filter(s => s.exercise === exercise); if (sets.length > 0) history.push({ date: w.date, sets }); }); return history.sort((a, b) => new Date(a.date) - new Date(b.date)); };

  const renderDatePicker = () => {
    const firstDay = new Date(datePickerYear, datePickerMonth, 1);
    const lastDay = new Date(datePickerYear, datePickerMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    const calendarDays = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) calendarDays.push(null);
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${datePickerYear}-${String(datePickerMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      calendarDays.push({ day, dateStr });
    }

    const today = new Date().toISOString().split('T')[0];

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => { if (datePickerMonth === 0) { setDatePickerMonth(11); setDatePickerYear(datePickerYear - 1); } else setDatePickerMonth(datePickerMonth - 1); }} className="px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600">←</button>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-100">{firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
              <button onClick={() => { const now = new Date(); setDatePickerMonth(now.getMonth()); setDatePickerYear(now.getFullYear()); }} className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">Today</button>
            </div>
            <button onClick={() => { if (datePickerMonth === 11) { setDatePickerMonth(0); setDatePickerYear(datePickerYear + 1); } else setDatePickerMonth(datePickerMonth + 1); }} className="px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600">→</button>
          </div>
          <div className="grid grid-cols-7 gap-2 mb-2">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="text-center text-xs font-semibold text-gray-400">{day}</div>)}</div>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {calendarDays.map((dayInfo, idx) => (
              <button 
                key={idx} 
                onClick={() => {
                  if (dayInfo) {
                    setSelectedDate(dayInfo.dateStr);
                    setShowDatePicker(false);
                  }
                }} 
                disabled={!dayInfo} 
                className={`aspect-square flex items-center justify-center rounded-lg text-sm ${dayInfo ? dayInfo.dateStr === selectedDate ? 'bg-blue-600 text-white font-bold' : dayInfo.dateStr === today ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-transparent'}`}
              >
                {dayInfo && dayInfo.day}
              </button>
            ))}
          </div>
          <button onClick={() => setShowDatePicker(false)} className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600">Close</button>
        </div>
      </div>
    );
  };

  const renderRecord = () => {
    const calculatedCalories = calculateCalories(currentNutrition.protein, currentNutrition.fat, currentNutrition.carbs);
    const displayDate = new Date(selectedDate + 'T00:00:00');
    const formattedDate = displayDate.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
    
    return (
      <div className="space-y-4">
        <div className="bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700">
          <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
          <button 
            onClick={() => {
              const selected = new Date(selectedDate + 'T00:00:00');
              setDatePickerMonth(selected.getMonth());
              setDatePickerYear(selected.getFullYear());
              setShowDatePicker(true);
            }}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-gray-100 text-left flex items-center justify-between hover:bg-gray-800"
          >
            <span>{formattedDate}</span>
            <Calendar size={20} className="text-gray-400" />
          </button>
        </div>
        <div className="bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg text-gray-100">Select Exercise</h3>
            <button onClick={() => setShowAddExercise(!showAddExercise)} className="text-blue-400 text-sm flex items-center gap-1 hover:text-blue-300"><Plus size={16} />Custom</button>
          </div>
          {showAddExercise && (
            <div className="mb-4 space-y-2">
              <input type="text" value={newExerciseName} onChange={(e) => setNewExerciseName(e.target.value)} placeholder="New exercise name" className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500" />
              <select value={newExerciseCategory} onChange={(e) => setNewExerciseCategory(e.target.value)} className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-100">
                <option value="legs">Legs</option><option value="chest">Chest</option><option value="biceps">Biceps</option><option value="triceps">Triceps</option><option value="shoulders">Shoulders</option><option value="back">Back</option>
              </select>
              <button onClick={addCustomExercise} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Add</button>
            </div>
          )}
          <div className="space-y-3">
            {Object.entries(EXERCISE_CATEGORIES).map(([key, category]) => (
              <div key={key}>
                <div className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">{category.name}</div>
                <div className="grid grid-cols-2 gap-2">
                  {category.exercises.map(ex => (
                    <button key={ex} onClick={() => addSetToWorkout(ex)} className={`px-3 py-2 rounded-lg text-sm border ${category.color} font-semibold text-gray-100`}>{ex}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        {currentWorkout.length > 0 && (
          <div className="bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700">
            <h3 className="font-semibold text-lg mb-4 text-gray-100">Today's Workout</h3>
            <div className="space-y-3">
              {currentWorkout.map(set => (
                <div key={set.id} className="flex items-center gap-2">
                  <div className="flex-1 text-sm font-medium text-gray-200">{set.exercise}</div>
                  <input type="number" placeholder="kg" value={set.weight} onChange={(e) => updateSet(set.id, 'weight', e.target.value)} className="w-20 px-2 py-1 bg-gray-900 border border-gray-600 rounded text-sm text-gray-100" />
                  <input type="number" placeholder="reps" value={set.reps} onChange={(e) => updateSet(set.id, 'reps', e.target.value)} className="w-20 px-2 py-1 bg-gray-900 border border-gray-600 rounded text-sm text-gray-100" />
                  <button onClick={() => copySet(set)} className="text-blue-400 text-xs px-2 py-1 border border-blue-500 rounded hover:bg-blue-500/20" title="Copy">Copy</button>
                  <button onClick={() => removeSet(set.id)} className="text-red-400 hover:text-red-300"><X size={20} /></button>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Memo</label>
              <textarea value={workoutMemo} onChange={(e) => setWorkoutMemo(e.target.value)} placeholder="Notes about today's session..." className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-sm text-gray-100 placeholder-gray-500" rows="3" />
            </div>
            <button onClick={saveWorkout} className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">Save</button>
          </div>
        )}
        {workouts.filter(w => w.date === selectedDate).length > 0 && (
          <div className="bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700">
            <h3 className="font-semibold text-lg mb-4 text-gray-100">Saved Records</h3>
            <div className="space-y-4">
              {workouts.filter(w => w.date === selectedDate).map(workout => (
                <div key={workout.id} className="border-l-4 border-green-500 pl-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 space-y-2">
                      {workout.sets.map((set, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="font-medium text-gray-200">{set.exercise}</span>
                          <span className="text-gray-400">{set.weight}kg × {set.reps} reps</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 ml-2">
                      <button onClick={() => addSetToExistingWorkout(workout)} className="text-green-400 hover:text-green-300" title="Add Set"><Plus size={18} /></button>
                      <button onClick={() => startEditWorkout(workout)} className="text-blue-400 hover:text-blue-300"><Edit2 size={18} /></button>
                    </div>
                  </div>
                  {workout.memo && <div className="text-xs text-gray-400 bg-gray-900/50 p-2 rounded">{workout.memo}</div>}
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700">
          <h3 className="font-semibold text-lg mb-4 text-gray-100 flex items-center gap-2"><Apple size={20} className="text-green-400" />Nutrition</h3>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs text-gray-400 mb-1">Protein (g)</label><input type="number" value={currentNutrition.protein} onChange={(e) => setCurrentNutrition({...currentNutrition, protein: e.target.value})} className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-100 text-sm" placeholder="0" /></div>
            <div><label className="block text-xs text-gray-400 mb-1">Fat (g)</label><input type="number" value={currentNutrition.fat} onChange={(e) => setCurrentNutrition({...currentNutrition, fat: e.target.value})} className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-100 text-sm" placeholder="0" /></div>
            <div><label className="block text-xs text-gray-400 mb-1">Carbs (g)</label><input type="number" value={currentNutrition.carbs} onChange={(e) => setCurrentNutrition({...currentNutrition, carbs: e.target.value})} className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-100 text-sm" placeholder="0" /></div>
            <div className="bg-gray-900/50 p-3 rounded-lg flex flex-col justify-center">
              <div className="text-xs text-gray-400">Calories (auto)</div>
              <div className="text-xl font-bold text-green-400">{calculatedCalories}</div>
              <div className="text-xs text-gray-500">kcal</div>
            </div>
          </div>
          <button onClick={saveNutritionForDate} className="w-full mt-3 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">Save Nutrition</button>
        </div>
      </div>
    );
  };

  const renderCalendar = () => {
    const byDate = getWorkoutsByDate();
    const firstDay = new Date(calendarYear, calendarMonth, 1);
    const lastDay = new Date(calendarYear, calendarMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    const calendarDays = [];
    for (let i = 0; i < startingDayOfWeek; i++) calendarDays.push(null);
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      calendarDays.push({ day, dateStr, hasWorkout: byDate[dateStr] !== undefined });
    }

    // 種目選択モード
    if (selectedHistoryExercise) {
      const exerciseHistory = getExerciseHistory(selectedHistoryExercise);
      
      return (
        <div className="space-y-4">
          <div className="bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-100">{selectedHistoryExercise}</h3>
              <button onClick={() => setSelectedHistoryExercise(null)} className="text-blue-400 text-sm hover:text-blue-300">← Back</button>
            </div>
            <div className="text-sm text-gray-400 mb-4">Total Sessions: {exerciseHistory.length}</div>
          </div>
          
          {exerciseHistory.length === 0 ? (
            <div className="bg-gray-800 rounded-lg shadow-lg p-8 text-center text-gray-400 border border-gray-700">No records for this exercise</div>
          ) : (
            <div className="space-y-3">
              {exerciseHistory.reverse().map((h, idx) => (
                <div key={idx} className="bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-semibold text-gray-100">{h.date}</div>
                    <div className="text-xs text-gray-400">{h.sets.length} sets</div>
                  </div>
                  <div className="space-y-2">
                    {h.sets.map((s, i) => (
                      <div key={i} className="flex justify-between items-center bg-gray-900/50 p-2 rounded">
                        <span className="text-sm text-gray-400">Set {i + 1}</span>
                        <span className="text-sm font-medium text-gray-200">{s.weight}kg × {s.reps} reps</span>
                        <span className="text-xs text-gray-500">{Math.round(parseFloat(s.weight) * parseFloat(s.reps))} vol</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-700 grid grid-cols-3 gap-2 text-center">
                    <div className="bg-gray-900/50 p-2 rounded">
                      <div className="text-xs text-gray-400">Max Weight</div>
                      <div className="text-sm font-bold text-blue-400">{Math.max(...h.sets.map(s => parseFloat(s.weight)))}kg</div>
                    </div>
                    <div className="bg-gray-900/50 p-2 rounded">
                      <div className="text-xs text-gray-400">Total Volume</div>
                      <div className="text-sm font-bold text-purple-400">{Math.round(h.sets.reduce((sum, s) => sum + (parseFloat(s.weight) * parseFloat(s.reps)), 0))}</div>
                    </div>
                    <div className="bg-gray-900/50 p-2 rounded">
                      <div className="text-xs text-gray-400">Total Reps</div>
                      <div className="text-sm font-bold text-green-400">{h.sets.reduce((sum, s) => sum + parseFloat(s.reps), 0)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // カレンダーモード（デフォルト）- 種目選択タイル表示
    const exercisesWithHistory = exercises.filter(ex => getExerciseHistory(ex).length > 0);
    const exercisesByCategory = {};
    
    Object.entries(EXERCISE_CATEGORIES).forEach(([key, category]) => {
      const categoryExercises = category.exercises.filter(ex => exercisesWithHistory.includes(ex));
      if (categoryExercises.length > 0) {
        exercisesByCategory[key] = { ...category, exercises: categoryExercises };
      }
    });

    return (
      <div className="space-y-4">
        <div className="bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700">
          <h3 className="font-semibold text-lg mb-4 text-gray-100">Select Exercise</h3>
          <div className="space-y-3">
            {Object.entries(exercisesByCategory).map(([key, category]) => (
              <div key={key}>
                <div className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">{category.name}</div>
                <div className="grid grid-cols-2 gap-2">
                  {category.exercises.map(ex => (
                    <button 
                      key={ex} 
                      onClick={() => setSelectedHistoryExercise(ex)} 
                      className={`px-3 py-2 rounded-lg text-sm border ${category.color} font-semibold text-gray-100`}
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {exercisesWithHistory.length === 0 && (
            <div className="text-center text-gray-400 py-4">No exercise history yet</div>
          )}
        </div>
        
        <div className="bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700">
          <h3 className="font-semibold text-lg mb-4 text-gray-100">Calendar View</h3>
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => { if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(calendarYear - 1); } else setCalendarMonth(calendarMonth - 1); setSelectedCalendarDate(null); }} className="px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600">←</button>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-100">{firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
              <button onClick={() => { const today = new Date(); setCalendarMonth(today.getMonth()); setCalendarYear(today.getFullYear()); setSelectedCalendarDate(null); }} className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">Today</button>
            </div>
            <button onClick={() => { if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(calendarYear + 1); } else setCalendarMonth(calendarMonth + 1); setSelectedCalendarDate(null); }} className="px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600">→</button>
          </div>
          <div className="grid grid-cols-7 gap-2 mb-2">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="text-center text-xs font-semibold text-gray-400">{day}</div>)}</div>
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((dayInfo, idx) => (
              <button key={idx} onClick={() => dayInfo && setSelectedCalendarDate(dayInfo.dateStr)} disabled={!dayInfo} className={`aspect-square flex items-center justify-center rounded-lg text-sm relative ${dayInfo ? dayInfo.hasWorkout ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-transparent'}`}>
                {dayInfo && <>{dayInfo.day}{dayInfo.hasWorkout && <div className="absolute bottom-1 w-1 h-1 bg-green-400 rounded-full"></div>}</>}
              </button>
            ))}
          </div>
        </div>
        {selectedCalendarDate && byDate[selectedCalendarDate] && (
          <div className="bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg text-gray-100">{selectedCalendarDate}</h3>
              <button onClick={() => setSelectedCalendarDate(null)} className="text-gray-400 hover:text-gray-300"><X size={20} /></button>
            </div>
            <div className="space-y-4 mb-4">
              {byDate[selectedCalendarDate].map((workout) => (
                <div key={workout.id} className="border-l-4 border-blue-500 pl-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 space-y-2">
                      {workout.sets.map((set, setIdx) => (
                        <div key={setIdx} className="flex justify-between text-sm">
                          <span className="font-medium text-gray-200">{set.exercise}</span>
                          <span className="text-gray-400">{set.weight}kg × {set.reps} reps</span>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => startEditWorkout(workout)} className="text-blue-400 ml-2 hover:text-blue-300"><Edit2 size={18} /></button>
                  </div>
                  {workout.memo && <div className="text-xs text-gray-400 bg-gray-900/50 p-2 rounded">{workout.memo}</div>}
                </div>
              ))}
            </div>
            {nutrition.find(n => n.date === selectedCalendarDate) && (
              <div className="border-t border-gray-700 pt-4">
                <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2"><Apple size={16} className="text-green-400" />Nutrition</h4>
                {(() => {
                  const n = nutrition.find(n => n.date === selectedCalendarDate);
                  return (
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-gray-400">Calories: <span className="text-gray-200">{n.calories || 0} kcal</span></div>
                      <div className="text-gray-400">Protein: <span className="text-gray-200">{n.protein || 0}g</span></div>
                      <div className="text-gray-400">Fat: <span className="text-gray-200">{n.fat || 0}g</span></div>
                      <div className="text-gray-400">Carbs: <span className="text-gray-200">{n.carbs || 0}g</span></div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderProgressGraph = (exercise) => {
    const history = getExerciseHistory(exercise);
    if (history.length === 0) return null;

    const dataPoints = history.map(h => {
      const maxWeight = Math.max(...h.sets.map(s => parseFloat(s.weight)));
      const totalVolume = h.sets.reduce((sum, s) => sum + (parseFloat(s.weight) * parseFloat(s.reps)), 0);
      return {
        date: h.date,
        maxWeight,
        totalVolume
      };
    });

    const isMaxWeight = progressGraphType === 'maxWeight';
    const values = dataPoints.map(d => isMaxWeight ? d.maxWeight : d.totalVolume);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const range = maxValue - minValue || 1;

    return (
      <div className="mt-4">
        <div className="flex gap-2 mb-3">
          <button 
            onClick={() => setProgressGraphType('maxWeight')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium ${progressGraphType === 'maxWeight' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
          >
            Max Weight
          </button>
          <button 
            onClick={() => setProgressGraphType('totalVolume')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium ${progressGraphType === 'totalVolume' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
          >
            Total Volume
          </button>
        </div>
        <div className="h-32 flex items-end gap-1 border-b border-gray-600 pb-2">
          {dataPoints.slice(-10).map((point, idx) => {
            const value = isMaxWeight ? point.maxWeight : point.totalVolume;
            const height = ((value - minValue) / range) * 100;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-xs text-gray-400">
                  {isMaxWeight ? `${point.maxWeight}kg` : `${Math.round(point.totalVolume)}`}
                </div>
                <div 
                  className={`w-full rounded-t transition-all ${isMaxWeight ? 'bg-blue-500 hover:bg-blue-400' : 'bg-purple-500 hover:bg-purple-400'}`}
                  style={{ height: `${Math.max(height, 10)}%` }}
                  title={`${point.date}: ${isMaxWeight ? `${point.maxWeight}kg` : `${Math.round(point.totalVolume)} vol`}`}
                />
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex justify-between text-xs text-gray-500">
          <span>{dataPoints[Math.max(0, dataPoints.length - 10)].date}</span>
          <span>{dataPoints[dataPoints.length - 1].date}</span>
        </div>
      </div>
    );
  };

  const renderProgress = () => {
    const exercisesWithData = exercises.filter(ex => getExerciseHistory(ex).length > 0);
    return (
      <div className="space-y-4">
        {exercisesWithData.length === 0 ? (
          <div className="bg-gray-800 rounded-lg shadow-lg p-8 text-center text-gray-400 border border-gray-700">No records yet</div>
        ) : (
          exercisesWithData.map(ex => {
            const history = getExerciseHistory(ex);
            const maxWeight = Math.max(...history.flatMap(h => h.sets.map(s => parseFloat(s.weight))));
            const latestHistory = history[history.length - 1];
            const latestTotalVolume = latestHistory.sets.reduce((sum, s) => sum + (parseFloat(s.weight) * parseFloat(s.reps)), 0);
            const isExpanded = selectedProgressExercise === ex;
            
            return (
              <div key={ex} className="bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-lg text-gray-100">{ex}</h3>
                  <button 
                    onClick={() => setSelectedProgressExercise(isExpanded ? null : ex)}
                    className="text-blue-400 text-sm hover:text-blue-300"
                  >
                    {isExpanded ? 'Hide Graph' : 'Show Graph'}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-gray-900/50 p-2 rounded">
                    <div className="text-xs text-gray-400">Max Weight</div>
                    <div className="text-lg font-bold text-blue-400">{maxWeight}kg</div>
                  </div>
                  <div className="bg-gray-900/50 p-2 rounded">
                    <div className="text-xs text-gray-400">Latest Volume</div>
                    <div className="text-lg font-bold text-purple-400">{Math.round(latestTotalVolume)}</div>
                  </div>
                </div>
                
                {isExpanded && renderProgressGraph(ex)}
                
                <div className="space-y-2 mt-4">
                  {history.slice(-5).map((h, idx) => (
                    <div key={idx} className="border-l-4 border-blue-500 pl-3">
                      <div className="text-xs text-gray-500">{h.date}</div>
                      {h.sets.map((s, i) => <div key={i} className="text-sm text-gray-300">{s.weight}kg × {s.reps} reps</div>)}
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  };

  const renderNutrition = () => {
    const sortedNutrition = [...nutrition].sort((a, b) => new Date(b.date) - new Date(a.date));
    return (
      <div className="space-y-4">
        {sortedNutrition.length === 0 ? (
          <div className="bg-gray-800 rounded-lg shadow-lg p-8 text-center text-gray-400 border border-gray-700">No nutrition records yet</div>
        ) : (
          sortedNutrition.map(n => (
            <div key={n.id} className="bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700">
              <div className="font-semibold text-lg mb-3 text-gray-100">{n.date}</div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-900/50 p-3 rounded-lg"><div className="text-xs text-gray-400">Calories</div><div className="text-xl font-bold text-green-400">{n.calories || 0}</div><div className="text-xs text-gray-500">kcal</div></div>
                <div className="bg-gray-900/50 p-3 rounded-lg"><div className="text-xs text-gray-400">Protein</div><div className="text-xl font-bold text-blue-400">{n.protein || 0}</div><div className="text-xs text-gray-500">g</div></div>
                <div className="bg-gray-900/50 p-3 rounded-lg"><div className="text-xs text-gray-400">Fat</div><div className="text-xl font-bold text-yellow-400">{n.fat || 0}</div><div className="text-xs text-gray-500">g</div></div>
                <div className="bg-gray-900/50 p-3 rounded-lg"><div className="text-xs text-gray-400">Carbs</div><div className="text-xl font-bold text-purple-400">{n.carbs || 0}</div><div className="text-xs text-gray-500">g</div></div>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  if (editingWorkout) {
    return (
      <div className="min-h-screen bg-gray-900" style={{fontFamily: 'monospace'}}>
        <div className="max-w-2xl mx-auto p-4">
          <div className="mb-6"><h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2"><Edit2 className="text-blue-400" />Edit Workout</h1><div className="text-sm text-gray-400 mt-1">{editingWorkout.date}</div></div>
          <div className="bg-gray-800 rounded-lg shadow-lg p-4 mb-4 border border-gray-700">
            <h3 className="font-semibold text-lg mb-4 text-gray-100">Sets</h3>
            <div className="space-y-3">
              {editingWorkout.sets.map(set => (
                <div key={set.id} className="flex items-center gap-2">
                  <div className="flex-1 text-sm font-medium text-gray-200">{set.exercise}</div>
                  <input type="number" placeholder="kg" value={set.weight} onChange={(e) => updateEditingSet(set.id, 'weight', e.target.value)} className="w-20 px-2 py-1 bg-gray-900 border border-gray-600 rounded text-sm text-gray-100" />
                  <input type="number" placeholder="reps" value={set.reps} onChange={(e) => updateEditingSet(set.id, 'reps', e.target.value)} className="w-20 px-2 py-1 bg-gray-900 border border-gray-600 rounded text-sm text-gray-100" />
                  <button onClick={() => removeEditingSet(set.id)} className="text-red-400 hover:text-red-300"><X size={20} /></button>
                </div>
              ))}
            </div>
            <div className="mt-4"><label className="block text-sm font-medium text-gray-300 mb-2">Memo</label><textarea value={editingWorkout.memo || ''} onChange={(e) => setEditingWorkout({...editingWorkout, memo: e.target.value})} placeholder="Notes about today's session..." className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-sm text-gray-100 placeholder-gray-500" rows="3" /></div>
          </div>
          <div className="flex gap-2">
            <button onClick={saveEditedWorkout} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-green-700"><Save size={20} />Save Changes</button>
            <button onClick={() => setEditingWorkout(null)} className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600">Cancel</button>
          </div>
          <button onClick={() => setShowDeleteConfirm(true)} className="w-full mt-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700">Delete Workout</button>
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-gray-800 rounded-lg p-6 max-w-sm w-full border border-gray-700">
                <h3 className="text-lg font-semibold text-gray-100 mb-4">Delete Workout?</h3>
                <p className="text-gray-300 mb-6">Are you sure you want to delete this workout? This action cannot be undone.</p>
                <div className="flex gap-2">
                  <button onClick={confirmDelete} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700">Delete</button>
                  <button onClick={cancelDelete} className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600">Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (showImportExport) {
    return (
      <div className="min-h-screen bg-gray-900" style={{fontFamily: 'monospace'}}>
        <div className="max-w-2xl mx-auto p-4">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2"><Settings className="text-blue-400" />Backup & Restore</h1>
            <button onClick={() => setShowImportExport(false)} className="text-gray-400 hover:text-gray-300"><X size={24} /></button>
          </div>
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
              <h3 className="font-semibold text-lg mb-2 text-gray-100 flex items-center gap-2"><Download size={20} className="text-green-400" />Export Data</h3>
              <p className="text-sm text-gray-400 mb-4">Download all your workout and nutrition data as a JSON file.</p>
              <button onClick={exportData} className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">Download Backup</button>
            </div>
            <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
              <h3 className="font-semibold text-lg mb-2 text-gray-100 flex items-center gap-2"><Upload size={20} className="text-blue-400" />Import Data</h3>
              <p className="text-sm text-gray-400 mb-4">Restore your data from a previous backup file. This will replace all current data.</p>
              <input type="file" accept=".json" onChange={importData} className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showExerciseManager) {
    const customExercises = getCustomExercises();
    
    return (
      <div className="min-h-screen bg-gray-900" style={{fontFamily: 'monospace'}}>
        <div className="max-w-2xl mx-auto p-4">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2"><Settings className="text-blue-400" />Exercise Manager</h1>
            <button onClick={() => setShowExerciseManager(false)} className="text-gray-400 hover:text-gray-300"><X size={24} /></button>
          </div>
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700">
              <h3 className="font-semibold text-lg mb-4 text-gray-100">Preset Exercises</h3>
              <div className="space-y-3">
                {Object.entries(EXERCISE_CATEGORIES).map(([catKey, category]) => (
                  <div key={catKey}>
                    <div className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">{category.name}</div>
                    <div className="space-y-2">
                      {category.exercises.map(ex => (
                        <div key={ex} className="flex items-center justify-between bg-gray-900/50 p-2 rounded">
                          <span className="text-sm text-gray-200">{ex}</span>
                          <div className="flex gap-2">
                            <button onClick={() => setEditingExercise({ name: ex, category: catKey, isPreset: true })} className="text-blue-400 text-xs hover:text-blue-300">Edit</button>
                            <button onClick={() => setShowExerciseDeleteConfirm({ name: ex, category: catKey, isPreset: true })} className="text-red-400 text-xs hover:text-red-300">Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {customExercises.length > 0 && (
              <div className="bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700">
                <h3 className="font-semibold text-lg mb-4 text-gray-100">Custom Exercises</h3>
                <div className="space-y-2">
                  {customExercises.map(ex => (
                    <div key={ex.name} className="flex items-center justify-between bg-gray-900/50 p-2 rounded">
                      <div>
                        <span className="text-sm text-gray-200">{ex.name}</span>
                        <span className="text-xs text-gray-500 ml-2">({EXERCISE_CATEGORIES[ex.category]?.name})</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setEditingExercise({ ...ex, isPreset: false })} className="text-blue-400 text-xs hover:text-blue-300">Edit</button>
                        <button onClick={() => setShowExerciseDeleteConfirm({ ...ex, isPreset: false })} className="text-red-400 text-xs hover:text-red-300">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {editingExercise && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700">
                <h3 className="text-lg font-semibold text-gray-100 mb-4">Edit Exercise</h3>
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Name</label>
                    <input type="text" value={editingExercise.name} onChange={(e) => setEditingExercise({...editingExercise, name: e.target.value})} className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-100" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Category</label>
                    <select value={editingExercise.category} onChange={(e) => setEditingExercise({...editingExercise, category: e.target.value})} className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-100">
                      {Object.entries(EXERCISE_CATEGORIES).map(([key, cat]) => <option key={key} value={key}>{cat.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => {
                    const oldName = editingExercise.isPreset ? editingExercise.name : customExercises.find(e => e.name === editingExercise.name)?.name;
                    if (editingExercise.isPreset) {
                      updatePresetExercise(oldName, editingExercise.name, editingExercise.category, editingExercise.category);
                    } else {
                      updateCustomExercise(oldName, editingExercise.name, editingExercise.category);
                    }
                  }} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">Save</button>
                  <button onClick={() => setEditingExercise(null)} className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600">Cancel</button>
                </div>
              </div>
            </div>
          )}
          {showExerciseDeleteConfirm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-gray-800 rounded-lg p-6 max-w-sm w-full border border-gray-700">
                <h3 className="text-lg font-semibold text-gray-100 mb-4">Delete Exercise?</h3>
                <p className="text-gray-300 mb-6">Are you sure you want to delete "{showExerciseDeleteConfirm.name}"?</p>
                <div className="flex gap-2">
                  <button onClick={() => {
                    if (showExerciseDeleteConfirm.isPreset) {
                      deletePresetExercise(showExerciseDeleteConfirm.name, showExerciseDeleteConfirm.category);
                    } else {
                      deleteCustomExercise(showExerciseDeleteConfirm.name);
                    }
                  }} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700">Delete</button>
                  <button onClick={() => setShowExerciseDeleteConfirm(null)} className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600">Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900" style={{fontFamily: 'monospace'}}>
      <div className="max-w-2xl mx-auto p-4">
        <div className="mb-4"><h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2"><Dumbbell className="text-blue-400" />Workout Tracker</h1></div>
        <div className="grid grid-cols-4 gap-2 mb-2">
          <button onClick={() => setView('record')} className={`py-2 rounded-lg text-sm font-medium ${view === 'record' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'}`}>Record</button>
          <button onClick={() => setView('calendar')} className={`py-2 rounded-lg text-sm font-medium ${view === 'calendar' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'}`}>History</button>
          <button onClick={() => setView('progress')} className={`py-2 rounded-lg text-sm font-medium ${view === 'progress' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'}`}>Progress</button>
          <button onClick={() => setView('nutrition')} className={`py-2 rounded-lg text-sm font-medium ${view === 'nutrition' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'}`}>Nutrition</button>
        </div>
        <div className="flex gap-2 mb-4 justify-end">
          <button onClick={() => setShowExerciseManager(true)} className="p-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700" title="Exercise Manager">
            <Settings size={20} />
          </button>
          <button onClick={() => setShowImportExport(true)} className="p-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700" title="Backup & Restore">
            <Download size={20} />
          </button>
        </div>
        {view === 'progress' && (
          <button onClick={() => { const storedEx = localStorage.getItem('customExercises'); const stored = localStorage.getItem('workouts'); if (storedEx || stored) { if (window.confirm('Delete all workout data? This cannot be undone.')) { localStorage.clear(); window.location.reload(); } } }} className="w-full mb-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">Reset All Data</button>
        )}
        {view === 'record' && renderRecord()}
        {view === 'calendar' && renderCalendar()}
        {view === 'progress' && renderProgress()}
        {view === 'nutrition' && renderNutrition()}

        {showDatePicker && renderDatePicker()}

        {addingSetToWorkout && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700">
              <h3 className="text-lg font-semibold text-gray-100 mb-4">Add Set</h3>
              <div className="space-y-3 mb-4">
                <div><label className="block text-sm text-gray-400 mb-1">Exercise</label>
                  <select value={addingSetToWorkout.newSet.exercise} onChange={(e) => setAddingSetToWorkout({ ...addingSetToWorkout, newSet: {...addingSetToWorkout.newSet, exercise: e.target.value} })} className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-100">
                    <option value="">Select exercise</option>{exercises.map(ex => <option key={ex} value={ex}>{ex}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-sm text-gray-400 mb-1">Weight (kg)</label><input type="number" value={addingSetToWorkout.newSet.weight} onChange={(e) => setAddingSetToWorkout({ ...addingSetToWorkout, newSet: {...addingSetToWorkout.newSet, weight: e.target.value} })} className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-100" placeholder="0" /></div>
                  <div><label className="block text-sm text-gray-400 mb-1">Reps</label><input type="number" value={addingSetToWorkout.newSet.reps} onChange={(e) => setAddingSetToWorkout({ ...addingSetToWorkout, newSet: {...addingSetToWorkout.newSet, reps: e.target.value} })} className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-100" placeholder="0" /></div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={saveAddedSet} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">Add Set</button>
                <button onClick={() => setAddingSetToWorkout(null)} className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
