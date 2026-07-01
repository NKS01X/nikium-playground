# Nikium Agents Documentation

## Overview
Nikium is an interactive playground for learning and exploring the Nikium programming language through guided lessons and real-time code execution.

## Agent Architecture

### 1. **Execution Agent**
Responsible for running Nikium code and returning results.
- Handles code validation
- Executes interpreted code
- Captures output and errors
- Returns execution timing information

### 2. **Lesson Agent**
Manages the lesson curriculum and progression.
- Stores lesson metadata (title, description, difficulty)
- Tracks starter code for each lesson
- Manages lesson objectives and explanations
- Provides context for learning

### 3. **UI Agent**
Handles the frontend user experience.
- Manages sidebar navigation
- Orchestrates editor interactions
- Renders output and results
- Handles state management for active lessons

## Components

### Frontend Components
- **Sidebar**: Navigation between lessons with visual feedback
- **Editor**: Code editor with syntax highlighting (CodeMirror)
- **Output**: Real-time execution results display
- **LessonContent**: Lesson description and learning material

### Services
- **nikium-runner**: Bridges frontend to backend execution
- **lessons**: Lesson data and curriculum management

## Data Flow

```
User Input (Sidebar/Editor)
    ↓
Lesson Agent (Load lesson content)
    ↓
UI Agent (Render UI state)
    ↓
User edits code in Editor
    ↓
Execution Agent (Run code via nikium-runner)
    ↓
Output Agent (Display results)
```

## Future Enhancements
- Multi-user collaboration
- Real-time code sharing
- Advanced debugging capabilities
- Performance profiling
- Code templates and snippets
- Interactive tutorials with 3D visualizations
