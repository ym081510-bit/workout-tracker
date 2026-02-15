# Workout Tracker

A comprehensive workout and nutrition tracking application built with React.

## Features

### 📝 Record
- Log workouts with exercises, weight, and reps
- Custom exercise creation by category
- Date picker with calendar interface
- Workout memo support
- Nutrition tracking (Protein, Fat, Carbs with auto-calculated calories)

### 📅 History
- Calendar view of workout history
- Exercise-specific history with tile selection
- Detailed session breakdown (Max Weight, Total Volume, Total Reps)
- Date-based workout viewing with nutrition info

### 📊 Progress
- Exercise-specific progress tracking
- Max Weight and Total Volume graphs
- Graph toggle between metrics
- Last 5 sessions display
- Visual progress indicators

### 🍎 Nutrition
- Daily nutrition logging
- Auto-calculated calories from macros (P: 4kcal/g, F: 9kcal/g, C: 4kcal/g)
- Historical nutrition records
- Color-coded macro display

### ⚙️ Management
- Exercise Manager: Edit/delete preset and custom exercises
- Backup & Restore: Export/import all data as JSON
- Data persistence via localStorage

## Tech Stack

- React (Hooks)
- Tailwind CSS
- Lucide React (Icons)
- LocalStorage for data persistence

## Installation

```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install

# Start development server
npm start
```

## Usage

1. **Record Tab**: Log your daily workouts and nutrition
2. **History Tab**: View past workouts by date or exercise
3. **Progress Tab**: Track your strength gains with visual graphs
4. **Nutrition Tab**: Review your nutritional intake history

## Data Management

- All data is stored locally in your browser
- Export your data regularly using the Backup feature
- Import previously exported data to restore your history

## License

MIT
