import * as SQLite from "expo-sqlite";

// Open the database
const db = SQLite.openDatabaseSync("habits.db");

export interface Habit {
    id?: number;
    title: string;
    description: string;
    frequency: string;
    streak_count: number;
    best_streak: number;
    total_count: number;
    last_completed: string;
    created_at: string;
    user_id: string;
    appwrite_id?: string;
}

/**
 * Initializes the database and creates the habits table if it doesn't exist.
 */
export const initDB = async () => {
    try {
        await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS habits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        frequency TEXT NOT NULL,
        streak_count INTEGER DEFAULT 0,
        best_streak INTEGER DEFAULT 0,
        total_count INTEGER DEFAULT 0,
        last_completed TEXT,
        created_at TEXT NOT NULL,
        user_id TEXT NOT NULL,
        appwrite_id TEXT
      );
    `);
        console.log("Database initialized successfully");
    } catch (error) {
        console.error("Failed to initialize database:", error);
        throw error;
    }
};

/**
 * Adds a new habit to the local database.
 */
export const addHabitLocal = async (habit: Omit<Habit, "id">) => {
    try {
        const result = await db.runAsync(
            "INSERT INTO habits (title, description, frequency, streak_count, best_streak, total_count, last_completed, created_at, user_id, appwrite_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                habit.title,
                habit.description,
                habit.frequency,
                habit.streak_count,
                habit.best_streak || 0,
                habit.total_count || 0,
                habit.last_completed,
                habit.created_at,
                habit.user_id,
                habit.appwrite_id || null,
            ]
        );
        return result.lastInsertRowId;
    } catch (error) {
        console.error("Error adding habit locally:", error);
        throw error;
    }
};

/**
 * Fetches all habits from the local database.
 */
export const getHabitsLocal = async (): Promise<Habit[]> => {
    try {
        const habits = await db.getAllAsync<Habit>("SELECT * FROM habits ORDER BY created_at DESC");
        return habits;
    } catch (error) {
        console.error("Error fetching habits locally:", error);
        throw error;
    }
};

/**
 * Fetches top 3 habits by streak count.
 */
export const getTopStreaksLocal = async (limit: number = 3): Promise<Habit[]> => {
    try {
        const habits = await db.getAllAsync<Habit>(`SELECT * FROM habits ORDER BY streak_count DESC LIMIT ${limit}`);
        return habits;
    } catch (error) {
        console.error("Error fetching top streaks locally:", error);
        throw error;
    }
};

/**
 * Updates an existing habit in the local database.
 */
export const updateHabitLocal = async (id: number, updates: Partial<Habit>) => {
    const fields = Object.keys(updates);
    if (fields.length === 0) return;

    const setClause = fields.map((field) => `${field} = ?`).join(", ");
    const values = Object.values(updates);

    try {
        await db.runAsync(
            `UPDATE habits SET ${setClause} WHERE id = ?`,
            [...values, id]
        );
    } catch (error) {
        console.error("Error updating habit locally:", error);
        throw error;
    }
};

/**
 * Deletes a single habit from the local database.
 */
export const deleteHabitLocal = async (id: number) => {
    try {
        await db.runAsync("DELETE FROM habits WHERE id = ?", [id]);
    } catch (error) {
        console.error("Error deleting habit locally:", error);
        throw error;
    }
};

/**
 * Deletes multiple habits from the local database.
 */
export const deleteHabitsLocal = async (ids: number[]) => {
    if (ids.length === 0) return;
    const placeholders = ids.map(() => "?").join(", ");
    try {
        await db.runAsync(`DELETE FROM habits WHERE id IN (${placeholders})`, ids);
    } catch (error) {
        console.error("Error deleting multiple habits locally:", error);
        throw error;
    }
};
