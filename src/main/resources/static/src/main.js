import { initUser, getUser, getUserTasks, createQuest, completeQuest, buyReward, buyTitle } from './api.js';
import { playClickSound, playCoinSound, playQuestCompleteSound, playLevelUpSound, toggleSound, isSoundEnabled } from './audio.js';

// Application State
let appState = {
  user: null,
  tasks: [],
  activeFilter: 'ALL',
  selectedDifficulty: { diff: 'EASY', xp: 10, gold: 5 },
  isCrtOn: true
};

// DOM Cache
const DOM = {
  apiStatusBadge: document.getElementById('apiStatusBadge'),
  apiStatusText: document.getElementById('apiStatusText'),
  toggleCrtBtn: document.getElementById('toggleCrtBtn'),
  toggleSoundBtn: document.getElementById('toggleSoundBtn'),
  heroUsername: document.getElementById('heroUsername'),
  heroLevel: document.getElementById('heroLevel'),
  heroGold: document.getElementById('heroGold'),
  heroStreak: document.getElementById('heroStreak'),
  heroXpBar: document.getElementById('heroXpBar'),
  xpNumericText: document.getElementById('xpNumericText'),
  heroTitleBadge: document.getElementById('heroTitleBadge'),
  heroTitleText: document.getElementById('heroTitleText'),
  questForm: document.getElementById('questForm'),
  questTitleInput: document.getElementById('questTitleInput'),
  attributeSelect: document.getElementById('attributeSelect'),
  difficultyGroup: document.getElementById('difficultyGroup'),
  previewXpBadge: document.getElementById('previewXpBadge'),
  previewGoldBadge: document.getElementById('previewGoldBadge'),
  addQuestBtn: document.getElementById('addQuestBtn'),
  questList: document.getElementById('questList'),
  emptyQuestState: document.getElementById('emptyQuestState'),
  questCountBadge: document.getElementById('questCountBadge'),
  toastContainer: document.getElementById('toastContainer')
};

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
  setupEventListeners();
  await loadUserData();
});

// Setup All DOM Event Listeners
function setupEventListeners() {
  // CRT Toggle Button
  DOM.toggleCrtBtn.addEventListener('click', () => {
    playClickSound();
    appState.isCrtOn = !appState.isCrtOn;
    if (appState.isCrtOn) {
      document.body.classList.add('crt-enabled');
      DOM.toggleCrtBtn.textContent = '📺 CRT: ON';
    } else {
      document.body.classList.remove('crt-enabled');
      DOM.toggleCrtBtn.textContent = '📺 CRT: OFF';
    }
  });

  // Sound FX Toggle Button
  DOM.toggleSoundBtn.addEventListener('click', () => {
    const isEnabled = toggleSound();
    if (isEnabled) playClickSound();
    DOM.toggleSoundBtn.textContent = isEnabled ? '🔊 SFX: ON' : '🔇 SFX: OFF';
  });

  // Difficulty Button Group Handler
  const diffButtons = DOM.difficultyGroup.querySelectorAll('.difficulty-btn');
  diffButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      playClickSound();
      diffButtons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');

      const diff = btn.dataset.diff;
      const xp = Number(btn.dataset.xp);
      const gold = Number(btn.dataset.gold);

      appState.selectedDifficulty = { diff, xp, gold };
      
      // Update preview badge
      DOM.previewXpBadge.innerHTML = `<span class="is-primary">+${xp} XP</span>`;
      DOM.previewGoldBadge.innerHTML = `<span class="is-warning">+${gold} 🪙</span>`;
    });
  });

  // Quest Form Submission
  DOM.questForm.addEventListener('submit', handleAddQuest);

  // Filter Buttons
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      playClickSound();
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      appState.activeFilter = btn.dataset.filter;
      renderQuestList();
    });
  });

  // Shop Purchase - Buy Real-Life Reward
  document.querySelectorAll('.buy-reward-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      playClickSound();
      const cost = parseInt(btn.getAttribute('data-cost') || '0', 10);

      if (!appState.user || appState.user.gold < cost) {
        alert('Not enough gold!');
        return;
      }

      try {
        const result = await buyReward(appState.user.id, cost);
        if (result) {
          playCoinSound();
          await loadUserData();
          showToast(`Reward Purchased for 🪙 ${cost} Gold!`, "gold");
        } else {
          alert('Not enough gold!');
        }
      } catch (err) {
        console.error("Failed buying reward", err);
        alert('Not enough gold!');
      }
    });
  });

  // Shop Purchase - Buy Cosmetic Title
  document.querySelectorAll('.buy-title-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      playClickSound();
      const title = btn.getAttribute('data-title');
      const cost = parseInt(btn.getAttribute('data-cost') || '0', 10);

      if (!appState.user || appState.user.gold < cost) {
        alert('Not enough gold!');
        return;
      }

      try {
        const result = await buyTitle(appState.user.id, title, cost);
        if (result) {
          playLevelUpSound();
          await loadUserData();
          showToast(`Equipped Title '${title}'!`, "gold");
        } else {
          alert('Not enough gold!');
        }
      } catch (err) {
        console.error("Failed buying title", err);
        alert('Not enough gold!');
      }
    });
  });
}

// Load Initial User and Task Data
async function loadUserData() {
  try {
    const { user, isLive } = await initUser();
    appState.user = user;

    // Update Top API Status Badge
    if (isLive) {
      DOM.apiStatusBadge.innerHTML = '<span class="is-success">LIVE SPRING BOOT API</span>';
    } else {
      DOM.apiStatusBadge.innerHTML = '<span class="is-warning">DEMO MODE (MOCK API)</span>';
    }

    // Fetch User Active Tasks
    appState.tasks = await getUserTasks(user.id);

    renderHeroStats();
    renderQuestList();
  } catch (err) {
    console.error("Failed to load user data", err);
    showToast("Error initializing player data!", "error");
  }
}

// Render Hero Stats Header
function renderHeroStats() {
  const { user } = appState;
  if (!user) return;

  DOM.heroUsername.textContent = user.username || "HERO";
  DOM.heroLevel.textContent = user.level || 1;
  DOM.heroGold.textContent = user.gold || 0;
  DOM.heroStreak.textContent = user.streak || 0;

  // Title Badge
  const heroTitleText = document.getElementById('heroTitleText') || DOM.heroTitleText;
  if (heroTitleText) {
    heroTitleText.textContent = user.title ? user.title : 'NO TITLE';
  }

  // XP Progress Bar
  const currentXp = user.currentXp || 0;
  const maxXp = user.maxXp || 100;
  const percentage = Math.min(100, Math.round((currentXp / maxXp) * 100));

  DOM.heroXpBar.value = currentXp;
  DOM.heroXpBar.max = maxXp;
  DOM.xpNumericText.textContent = `${currentXp} / ${maxXp} XP (${percentage}%)`;
}


// Render Active Quests List
function renderQuestList() {
  const { tasks, activeFilter } = appState;
  
  // Filter Tasks
  const filteredTasks = tasks.filter(t => {
    if (activeFilter === 'ALL') return true;
    return (t.attribute || '').toUpperCase() === activeFilter;
  });

  DOM.questCountBadge.textContent = `${filteredTasks.length} Quest${filteredTasks.length === 1 ? '' : 's'}`;

  if (filteredTasks.length === 0) {
    DOM.questList.innerHTML = '';
    DOM.emptyQuestState.classList.remove('hidden');
    return;
  }

  DOM.emptyQuestState.classList.add('hidden');

  DOM.questList.innerHTML = filteredTasks.map(task => {
    const attr = (task.attribute || 'INT').toUpperCase();
    const attrClass = attr === 'INT' ? 'attr-int' : attr === 'STR' ? 'attr-str' : 'attr-disc';
    const attrName = attr === 'INT' ? '🧠 INT' : attr === 'STR' ? '⚔️ STR' : '🛡️ DISC';

    return `
      <article class="quest-card" id="quest-card-${task.id}">
        <div class="quest-card-header">
          <h3 class="quest-card-title">${escapeHtml(task.title)}</h3>
          <span class="badge-attr ${attrClass}">${attrName}</span>
        </div>
        <div class="quest-card-body">
          <div class="quest-rewards">
            <span class="reward-item reward-xp">⚡ +${task.xpReward} XP</span>
            <span class="reward-item reward-gold">🪙 +${task.goldReward} GOLD</span>
          </div>
          <button type="button" class="nes-btn is-warning complete-btn" data-task-id="${task.id}">
            ✓ COMPLETE
          </button>
        </div>
      </article>
    `;
  }).join('');

  // Attach Event Listeners to Complete Buttons
  const completeBtns = DOM.questList.querySelectorAll('.complete-btn');
  completeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => handleCompleteQuest(e, btn.dataset.taskId));
  });
}

// Handle Add Quest Form Submission
async function handleAddQuest(e) {
  e.preventDefault();
  playClickSound();

  const title = DOM.questTitleInput.value.trim();
  const attribute = DOM.attributeSelect.value;
  const { diff, xp, gold } = appState.selectedDifficulty;

  if (!title) {
    showToast("Please enter a Quest title!", "info");
    return;
  }

  DOM.addQuestBtn.disabled = true;
  DOM.addQuestBtn.textContent = 'ADDING...';

  try {
    const questData = {
      title,
      attribute,
      difficulty: diff,
      xpReward: xp,
      goldReward: gold
    };

    const newTask = await createQuest(questData, appState.user.id);
    appState.tasks.unshift(newTask);

    playCoinSound();
    showToast(`New Quest Recruited: "${title}"`, "success");

    // Reset Form
    DOM.questTitleInput.value = '';
    renderQuestList();
  } catch (err) {
    console.error("Failed to add quest", err);
    showToast("Failed to create quest!", "error");
  } finally {
    DOM.addQuestBtn.disabled = false;
    DOM.addQuestBtn.textContent = '➕ ADD QUEST';
  }
}

// Handle Complete Quest
async function handleCompleteQuest(e, taskId) {
  const card = document.getElementById(`quest-card-${taskId}`);
  if (card) {
    card.classList.add('completing');
  }

  playQuestCompleteSound();

  try {
    const previousLevel = appState.user ? appState.user.level : 1;
    const result = await completeQuest(taskId, appState.user.id);

    // Remove task from state array
    appState.tasks = appState.tasks.filter(t => String(t.id) !== String(taskId));

    // Update user state if returned
    if (result && result.user) {
      appState.user = result.user;
    } else {
      // Manual state increment fallback
      const completedTask = appState.tasks.find(t => String(t.id) === String(taskId));
      if (completedTask && appState.user) {
        appState.user.currentXp += completedTask.xpReward;
        appState.user.gold += completedTask.goldReward;
        if (appState.user.currentXp >= appState.user.maxXp) {
          appState.user.level += 1;
          appState.user.currentXp -= appState.user.maxXp;
          appState.user.maxXp = Math.round(appState.user.maxXp * 1.25);
        }
      }
    }

    // Check if leveled up!
    if (appState.user.level > previousLevel) {
      setTimeout(() => {
        playLevelUpSound();
        showToast(`LEVEL UP! 🎉 NOW LEVEL ${appState.user.level} HERO!`, "gold");
      }, 300);
    } else {
      playCoinSound();
      showToast(`Quest Complete! Rewards Collected! 🪙⚡`, "gold");
    }

    setTimeout(() => {
      renderHeroStats();
      renderQuestList();
    }, 450);

  } catch (err) {
    console.error("Failed to complete quest", err);
    showToast("Error completing quest", "error");
  }
}

// Retro Toast Notification
function showToast(message, type = "info") {
  const toast = document.createElement('div');
  const typeClass = type === 'success' ? 'toast-success' : type === 'gold' ? 'toast-gold' : 'toast-info';
  
  toast.className = `retro-toast ${typeClass}`;
  toast.innerHTML = `<span>${escapeHtml(message)}</span>`;

  DOM.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 350);
  }, 3000);
}

// Utility: Escape HTML
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
