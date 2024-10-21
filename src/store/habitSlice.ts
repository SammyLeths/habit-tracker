import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Habit {
  id: string;
  name: string;
  frequency: "daily" | "weekly";
  completedDates: string[];
  createdAt: string;
}

interface HabitState {
  habits: Habit[];
  isLoading: boolean;
  error: string | null;
}

const HABITS_KEY = "stored_habits"; // Key for localStorage

// Function to get habits from localStorage
const loadHabitsFromLocalStorage = (): Habit[] => {
  const storedHabits = localStorage.getItem(HABITS_KEY);
  return storedHabits ? JSON.parse(storedHabits) : [];
};

// Function to save habits to localStorage
const saveHabitsToLocalStorage = (habits: Habit[]) => {
  localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
};

const initialState: HabitState = {
  habits: loadHabitsFromLocalStorage(),
  isLoading: false,
  error: null,
};

export const fetchHabits = createAsyncThunk("habits/fetchHabits", async () => {
  // Fetching habits from localStorage, simulating API fetch if needed
  const mockHabits: Habit[] = loadHabitsFromLocalStorage();
  if (mockHabits.length === 0) {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // simulate delay
    const defaultHabits: Habit[] = [
      {
        id: "1",
        name: "Read",
        frequency: "daily",
        completedDates: [],
        createdAt: new Date().toISOString(),
      },
      {
        id: "2",
        name: "Exercise",
        frequency: "weekly",
        completedDates: [],
        createdAt: new Date().toISOString(),
      },
    ];
    saveHabitsToLocalStorage(defaultHabits); // Save default habits to localStorage
    return defaultHabits;
  }
  return mockHabits;
});

const habitSlice = createSlice({
  name: "habits",
  initialState,
  reducers: {
    addHabit: (
      state,
      action: PayloadAction<{ name: string; frequency: "daily" | "weekly" }>
    ) => {
      const newHabit: Habit = {
        id: Date.now().toString(),
        name: action.payload.name,
        frequency: action.payload.frequency,
        completedDates: [],
        createdAt: new Date().toISOString(),
      };

      state.habits.push(newHabit);
      saveHabitsToLocalStorage(state.habits); // Save updated habits
    },
    toggleHabit: (
      state,
      action: PayloadAction<{ id: string; date: string }>
    ) => {
      const habit = state.habits.find((h) => h.id === action.payload.id);

      if (habit) {
        const index = habit.completedDates.indexOf(action.payload.date);
        if (index > -1) {
          habit.completedDates.splice(index, 1);
        } else {
          habit.completedDates.push(action.payload.date);
        }
      }
      saveHabitsToLocalStorage(state.habits); // Save updated habits
    },
    deleteHabit: (state, action: PayloadAction<string>) => {
      state.habits = state.habits.filter(
        (habit) => habit.id !== action.payload
      );
      saveHabitsToLocalStorage(state.habits);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHabits.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchHabits.fulfilled, (state, action) => {
        state.isLoading = false;
        state.habits = action.payload;
      })
      .addCase(fetchHabits.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch habits";
      });
  },
});

export const { addHabit, toggleHabit, deleteHabit } = habitSlice.actions;
export default habitSlice.reducer;
