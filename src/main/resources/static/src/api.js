/**
 * Life RPG API Service
 * Endpoint URL: http://localhost:8080/api
 * Endpoints:
 *  - POST /user/init
 *  - GET  /user/{id}
 *  - GET  /user/{id}/tasks
 *  - POST /user/{id}/tasks
 *  - POST /user/{id}/tasks/{taskId}/complete
 */

const API_BASE_URL = 'http://localhost:8080/api';
const LOCAL_STORAGE_USER_KEY = 'life_rpg_user_v1';
const LOCAL_STORAGE_TASKS_KEY = 'life_rpg_tasks_v1';

let isLiveBackend = false;
let currentUserId = 1;

// Default initial mock data if fallback is triggered
const DEFAULT_MOCK_USER = {
  id: 1,
  username: "RETRO_HERO",
  level: 3,
  currentXp: 45,
  maxXp: 100,
  gold: 120,
  streak: 7
};

const DEFAULT_MOCK_TASKS = [
  {
    id: 101,
    title: "Master Data Structures (Graph BFS)",
    attribute: "INT",
    difficulty: "HARD",
    xpReward: 60,
    goldReward: 35,
    completed: false
  },
  {
    id: 102,
    title: "Complete Morning 5km Run",
    attribute: "STR",
    difficulty: "MEDIUM",
    xpReward: 25,
    goldReward: 15,
    completed: false
  },
  {
    id: 103,
    title: "Read 20 Pages of System Design",
    attribute: "DISC",
    difficulty: "EASY",
    xpReward: 10,
    goldReward: 5,
    completed: false
  }
];

// Helper: Get local storage mock user
function getLocalUser() {
  const stored = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(DEFAULT_MOCK_USER));
  return { ...DEFAULT_MOCK_USER };
}

// Helper: Save local storage user
function saveLocalUser(user) {
  localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
}

// Helper: Get local storage tasks
function getLocalTasks() {
  const stored = localStorage.getItem(LOCAL_STORAGE_TASKS_KEY);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(LOCAL_STORAGE_TASKS_KEY, JSON.stringify(DEFAULT_MOCK_TASKS));
  return [...DEFAULT_MOCK_TASKS];
}

// Helper: Save local storage tasks
function saveLocalTasks(tasks) {
  localStorage.setItem(LOCAL_STORAGE_TASKS_KEY, JSON.stringify(tasks));
}

export async function initUser() {
  try {
    const response = await fetch(`${API_BASE_URL}/user/init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: "RETRO_HERO" })
    });

    if (response.ok) {
      const data = await response.json();
      isLiveBackend = true;
      currentUserId = data.id || 1;
      return { user: data, isLive: true };
    }
  } catch (err) {
    console.warn("Backend API unavailable at http://localhost:8080/api. Switching to Demo Mode.", err);
  }

  // Fallback to local storage
  isLiveBackend = false;
  const localUser = getLocalUser();
  return { user: localUser, isLive: false };
}

export async function getUser(userId = currentUserId) {
  if (isLiveBackend) {
    try {
      const res = await fetch(`${API_BASE_URL}/user/${userId}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Error fetching user from backend", e);
    }
  }
  return getLocalUser();
}

export async function getUserTasks(userId = currentUserId) {
  if (isLiveBackend) {
    try {
      const res = await fetch(`${API_BASE_URL}/user/${userId}/tasks`);
      if (res.ok) {
        const tasks = await res.json();
        return tasks.filter(t => !t.completed);
      }
    } catch (e) {
      console.warn("Error fetching tasks from backend", e);
    }
  }
  const tasks = getLocalTasks();
  return tasks.filter(t => !t.completed);
}

export async function createQuest(questData, userId = currentUserId) {
  if (isLiveBackend) {
    try {
      const res = await fetch(`${API_BASE_URL}/user/${userId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questData)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Error creating task on backend", e);
    }
  }

  // Local fallback creation
  const tasks = getLocalTasks();
  const newTask = {
    id: Date.now(),
    title: questData.title,
    attribute: questData.attribute,
    difficulty: questData.difficulty,
    xpReward: Number(questData.xpReward || 10),
    goldReward: Number(questData.goldReward || 5),
    completed: false
  };
  tasks.push(newTask);
  saveLocalTasks(tasks);
  return newTask;
}

export async function completeQuest(taskId, userId = currentUserId) {
  if (isLiveBackend) {
    try {
      const res = await fetch(`${API_BASE_URL}/user/${userId}/tasks/${taskId}/complete`, {
        method: 'POST'
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Error completing task on backend", e);
    }
  }

  // Local fallback completion
  const tasks = getLocalTasks();
  const taskIndex = tasks.findIndex(t => String(t.id) === String(taskId));
  let completedTask = null;

  if (taskIndex !== -1) {
    tasks[taskIndex].completed = true;
    completedTask = tasks[taskIndex];
    saveLocalTasks(tasks);

    // Update Local User Stats
    const user = getLocalUser();
    user.currentXp += completedTask.xpReward;
    user.gold += completedTask.goldReward;

    // Check level up
    if (user.currentXp >= user.maxXp) {
      user.level += 1;
      user.currentXp = user.currentXp - user.maxXp;
      user.maxXp = Math.round(user.maxXp * 1.25);
    }
    saveLocalUser(user);
    return { user, task: completedTask };
  }

  return null;
}

export async function buyReward(userId = currentUserId, cost) {
  if (isLiveBackend) {
    try {
      const res = await fetch(`${API_BASE_URL}/user/${userId}/buy-reward?cost=${cost}`, {
        method: 'POST'
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Error buying reward on backend", e);
    }
  }

  // Local fallback
  const user = getLocalUser();
  const numericCost = Number(cost);
  if (user.gold >= numericCost) {
    user.gold -= numericCost;
    saveLocalUser(user);
    return user;
  }
  return null;
}

export async function buyTitle(userId = currentUserId, title, cost) {
  if (isLiveBackend) {
    try {
      const res = await fetch(`${API_BASE_URL}/user/${userId}/buy-title?title=${title}&cost=${cost}`, {
        method: 'POST'
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Error buying title on backend", e);
    }
  }

  // Local fallback
  const user = getLocalUser();
  const numericCost = Number(cost);
  if (user.gold >= numericCost) {
    user.gold -= numericCost;
    user.title = title;
    saveLocalUser(user);
    return user;
  }
  return null;
}

export function isBackendLive() {
  return isLiveBackend;
}

