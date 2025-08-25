// Enhanced Game Logic with Better Animations and Features

// DOM Elements
const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");
const logoutBtn = document.getElementById("logout-btn");
const authContainer = document.getElementById("auth-container");
const gameContainer = document.getElementById("game-container");
const playerNameDisplay = document.getElementById("player-name");
const authMessage = document.getElementById("auth-message");
const rollBtn = document.getElementById("roll-btn");
const megaRollBtn = document.getElementById("mega-roll-btn");
const rollResult = document.getElementById("roll-result");
const slotReel = document.getElementById("slot-reel");
const multiplierDisplay = document.getElementById("multiplier-display");
const inventoryList = document.getElementById("inventory-list");
const inventoryCount = document.getElementById("inventory-count");
const inventoryFilter = document.getElementById("inventory-filter");
const equipBtn = document.getElementById("equip-btn");
const inspectBtn = document.getElementById("inspect-btn");
const sellBtn = document.getElementById("sell-btn");
const fusionBtn = document.getElementById("fusion-btn");
const equipName = document.getElementById("equip-name");
const levelDisplay = document.getElementById("level-display");
const xpDisplay = document.getElementById("xp-display");
const coinsDisplay = document.getElementById("coins-display");
const tradeUserSelect = document.getElementById("trade-user");
const refreshUsersBtn = document.getElementById("refresh-users");
const tradeInventoryList = document.getElementById("trade-inventory");
const sendTradeBtn = document.getElementById("send-trade");
const requestTradeBtn = document.getElementById("request-trade");
const tradeMessage = document.getElementById("trade-message");
const chatBox = document.getElementById("chat-box");
const chatInput = document.getElementById("chat-input");
const sendChat = document.getElementById("send-chat");
const shopBtn = document.getElementById("btn-shop");
const dailyBtn = document.getElementById("btn-daily");
const questsBtn = document.getElementById("btn-quests");
const achievementsBtn = document.getElementById("btn-achievements");
const clearChatBtn = document.getElementById("clear-chat");
const toggleSoundBtn = document.getElementById("toggle-sound");

// Game State
let currentUser = null;
let selectedFusionItems = [];
let lastRolledItem = null;
let rollHistory = [];
let animationQueue = [];
let soundEnabled = true;
let tradeHistory = [];
let achievements = [];
let dailyStreak = 0;
let lastLoginDate = null;
let gameStats = {
  totalRolls: 0,
  totalTrades: 0,
  totalSales: 0,
  legendaryFound: 0,
  epicFound: 0,
  rareFound: 0,
  bestItem: null
};

// Enhanced User Management
function loadUsers() {
  try {
    return JSON.parse(localStorage.getItem("users") || "{}");
  } catch (e) {
    console.error("Error loading users:", e);
    return {};
  }
}

function saveUsers(u) {
  try {
    localStorage.setItem("users", JSON.stringify(u));
  } catch (e) {
    console.error("Error saving users:", e);
    showNotification("Error saving data", "error");
  }
}

function getInventory(u) {
  return loadUsers()[u]?.inventory || [];
}

function saveInventory(u, inv) {
  let uobj = loadUsers();
  if (!uobj[u]) uobj[u] = {};
  uobj[u].inventory = inv;
  saveUsers(uobj);
}

function setEquipped(u, item) {
  let uobj = loadUsers();
  if (!uobj[u]) uobj[u] = {};
  uobj[u].equipped = item;
  saveUsers(uobj);
}

function getEquipped(u) {
  return loadUsers()[u]?.equipped || null;
}

function ensureUserStats(username) {
  const users = loadUsers();
  if (!users[username]) users[username] = {};
  const user = users[username];
  
  // Initialize all required fields
  if (typeof user.level !== 'number') user.level = 1;
  if (typeof user.xp !== 'number') user.xp = 0;
  if (typeof user.coins !== 'number') user.coins = 100;
  if (typeof user.maxInventory !== 'number') user.maxInventory = 50;
  if (!user.inventory) user.inventory = [];
  if (!user.consumables) user.consumables = {};
  if (!user.achievements) user.achievements = [];
  if (!user.stats) user.stats = {
    totalRolls: 0,
    totalTrades: 0,
    totalSales: 0,
    legendaryFound: 0,
    epicFound: 0,
    rareFound: 0,
    bestItem: null
  };
  if (!user.tradeHistory) user.tradeHistory = [];
  if (!user.rollHistory) user.rollHistory = [];
  if (typeof user.dailyStreak !== 'number') user.dailyStreak = 0;
  if (!user.lastLoginDate) user.lastLoginDate = null;
  
  saveUsers(users);
  return user;
}

// Utility Functions
function showNotification(message, type = "info") {
  const container = document.getElementById("notification-container");
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  container.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = "slideOutRight 0.3s ease forwards";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function playSound(type = "success") {
  if (!soundEnabled) return;
  
  // Create audio context for sound effects
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  switch(type) {
    case "success":
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
      break;
    case "error":
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(150, audioContext.currentTime + 0.1);
      break;
    case "legendary":
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
      break;
  }
  
  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.3);
}

function updateRarityCounts() {
  const inv = getInventory(currentUser);
  const counts = {
    common: 0,
    rare: 0,
    epic: 0,
    legendary: 0
  };
  
  inv.forEach(item => {
    if (counts.hasOwnProperty(item.rarity)) {
      counts[item.rarity]++;
    }
  });
  
  document.getElementById("common-count").textContent = counts.common;
  document.getElementById("rare-count").textContent = counts.rare;
  document.getElementById("epic-count").textContent = counts.epic;
  document.getElementById("legendary-count").textContent = counts.legendary;
}

function updateRollStats() {
  const user = ensureUserStats(currentUser);
  document.getElementById("total-rolls").textContent = user.stats.totalRolls;
  
  if (user.stats.bestItem) {
    document.getElementById("best-item").textContent = user.stats.bestItem.name;
  } else {
    document.getElementById("best-item").textContent = "None";
  }
}

// Enhanced Display Updates
function updateDisplays() {
  if (!currentUser) return;
  const user = ensureUserStats(currentUser);
  levelDisplay.textContent = user.level;
  xpDisplay.textContent = user.xp;
  coinsDisplay.textContent = user.coins.toLocaleString();
  
  const inv = getInventory(currentUser);
  inventoryCount.textContent = `(${inv.length}/${user.maxInventory})`;
  
  const eq = getEquipped(currentUser);
  equipName.textContent = eq ? `${eq.name} (${eq.rarity})` : "None";
  
  // Update all stats
  updateRarityCounts();
  updateRollStats();
  updateStreakDisplay();
  updateQuestProgress();
}

function updateStreakDisplay() {
  const users = loadUsers();
  const user = users[currentUser];
  if (user && user.dailyStreak) {
    const streakElement = document.getElementById("login-streak");
    if (!streakElement) {
      const streakDiv = document.createElement("div");
      streakDiv.id = "login-streak";
      streakDiv.className = "streak-counter";
      document.getElementById("game-container").appendChild(streakDiv);
    }
    streakElement.textContent = `🔥 ${user.dailyStreak} day streak`;
  }
}

function updateQuestProgress() {
  const users = loadUsers();
  const user = users[currentUser];
  if (!user || !user.quests) return;
  
  const completed = user.quests.filter(q => q.completed).length;
  const total = user.quests.length;
  const progressFill = document.getElementById("quest-progress-fill");
  const progressText = document.getElementById("quest-progress-text");
  
  if (progressFill && progressText) {
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    progressFill.style.width = `${percentage}%`;
    progressText.textContent = `${completed}/${total} Completed`;
  }
}

function createParticleEffect(x, y, color = "#ffd700") {
  for (let i = 0; i < 8; i++) {
    const particle = document.createElement("div");
    particle.className = "particle";
    particle.style.left = x + "px";
    particle.style.top = y + "px";
    particle.style.background = color;
    document.body.appendChild(particle);
    
    const angle = (i / 8) * Math.PI * 2;
    const distance = 50 + Math.random() * 50;
    const targetX = x + Math.cos(angle) * distance;
    const targetY = y + Math.sin(angle) * distance;
    
    particle.animate([
      { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      { transform: `translate(${targetX - x}px, ${targetY - y}px) scale(0)`, opacity: 0 }
    ], {
      duration: 1000,
      easing: 'ease-out'
    }).onfinish = () => particle.remove();
  }
}

// Enhanced Inventory Display
function makeListItem(item, index) {
  const li = document.createElement("li");
  li.dataset.index = index;
  li.className = getRarityClass(item.rarity);
  
  const badge = document.createElement("span");
  badge.className = "badge";
  li.appendChild(badge);
  
  const name = document.createElement("div");
  name.textContent = item.name;
  name.style.fontWeight = "700";
  li.appendChild(name);
  
  const value = document.createElement("div");
  value.className = "rarity-label";
  value.textContent = `${item.rarity.toUpperCase()} (${item.value}g)`;
  li.appendChild(value);
  
  // Add special effect indicator
  if (item.effect) {
    const effectIcon = document.createElement("span");
    effectIcon.textContent = "✨";
    effectIcon.style.marginLeft = "8px";
    effectIcon.title = `Special Effect: ${item.effect}`;
    li.appendChild(effectIcon);
  }
  
  li.addEventListener("click", () => {
    const list = li.parentElement;
    list.querySelectorAll("li").forEach(x => x.classList.remove("selected"));
    li.classList.add("selected");
    
    // Show item details
    showItemDetails(item);
  });
  
  return li;
}

function showItemDetails(item) {
  const detailsDiv = document.getElementById("item-details");
  if (!detailsDiv) {
    const div = document.createElement("div");
    div.id = "item-details";
    div.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(10, 10, 20, 0.95);
      padding: 20px;
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      z-index: 10000;
      max-width: 300px;
      backdrop-filter: blur(20px);
    `;
    document.body.appendChild(div);
  }
  
  detailsDiv.innerHTML = `
    <h3 style="margin: 0 0 10px 0; color: #fff;">${item.name}</h3>
    <p style="margin: 5px 0; color: rgba(255,255,255,0.8);">Rarity: ${item.rarity.toUpperCase()}</p>
    <p style="margin: 5px 0; color: rgba(255,255,255,0.8);">Value: ${item.value} coins</p>
    ${item.effect ? `<p style="margin: 5px 0; color: #4ade80;">Effect: ${item.effect}</p>` : ''}
    <button onclick="this.parentElement.remove()" style="margin-top: 10px;">Close</button>
  `;
}

function displayInventory() {
  inventoryList.innerHTML = "";
  const inv = getInventory(currentUser);
  inv.forEach((it, idx) => inventoryList.appendChild(makeListItem(it, idx)));
  updateDisplays();
  populateTradeInventory();
  applyInventoryFilter();
}

function applyInventoryFilter() {
  const query = inventoryFilter.value.toLowerCase();
  document.querySelectorAll("#inventory-list li").forEach(li => {
    const text = li.textContent.toLowerCase();
    li.style.display = query ? (text.includes(query) ? "" : "none") : "";
  });
}

// Enhanced Trading System
function populateTradeUsers() {
  tradeUserSelect.innerHTML = "";
  const u = loadUsers();
  Object.keys(u).forEach(name => {
    if (name !== currentUser) {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      tradeUserSelect.appendChild(opt);
    }
  });
  populateTradeInventory();
}

function populateTradeInventory() {
  tradeInventoryList.innerHTML = "";
  const inv = getInventory(currentUser);
  inv.forEach((it, idx) => tradeInventoryList.appendChild(makeListItem(it, idx)));
}

// Enhanced Chat System
function broadcastChat(msg, isSystem = false) {
  const p = document.createElement("div");
  p.className = "chat-message " + (isSystem ? "system" : "msg-user");
  
  const time = document.createElement("span");
  time.className = "msg-time";
  const d = new Date();
  time.textContent = ` ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  
  p.textContent = msg;
  p.appendChild(time);
  chatBox.appendChild(p);
  chatBox.scrollTop = chatBox.scrollHeight;
  
  // Add animation
  p.style.animation = "messageSlideIn 0.3s ease";
}

// Enhanced XP and Leveling System
function awardXP(amount) {
  if (!currentUser) return;
  const users = loadUsers();
  const user = users[currentUser];
  
  // Apply XP boost if active
  if (window.xpBoostActive) {
    amount *= 2;
  }
  
  user.xp = (user.xp || 0) + amount;
  
  const xpNeeded = user.level * 100;
  if (user.xp >= xpNeeded) {
    user.xp -= xpNeeded;
    user.level++;
    user.coins = (user.coins || 0) + user.level * 15;
    
    // Level up rewards
    if (user.level % 5 === 0) {
      user.maxInventory += 5;
      broadcastChat(`🎉 ${currentUser} reached level ${user.level}! Inventory expanded!`, true);
    } else {
      broadcastChat(`🌟 ${currentUser} leveled up to ${user.level}! (+${user.level * 15} coins)`, true);
    }
    
    showLevelUpEffect();
    checkAchievements();
  }
  
  saveUsers(users);
  updateDisplays();
}

function showLevelUpEffect() {
  const badge = document.createElement("div");
  badge.className = "level-up-badge";
  badge.textContent = `Level Up!`;
  document.getElementById("top-bar").appendChild(badge);
  
  // Add particle effects
  createParticleEffect(badge);
  
  setTimeout(() => badge.remove(), 3000);
}

function createParticleEffect(element) {
  const rect = element.getBoundingClientRect();
  for (let i = 0; i < 10; i++) {
    const particle = document.createElement("div");
    particle.style.cssText = `
      position: fixed;
      width: 4px;
      height: 4px;
      background: #ffd700;
      border-radius: 50%;
      pointer-events: none;
      z-index: 10000;
      left: ${rect.left + rect.width / 2}px;
      top: ${rect.top + rect.height / 2}px;
    `;
    document.body.appendChild(particle);
    
    const angle = (i / 10) * Math.PI * 2;
    const distance = 50 + Math.random() * 50;
    const targetX = rect.left + rect.width / 2 + Math.cos(angle) * distance;
    const targetY = rect.top + rect.height / 2 + Math.sin(angle) * distance;
    
    particle.animate([
      { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      { transform: `translate(${targetX - rect.left - rect.width / 2}px, ${targetY - rect.top - rect.height / 2}px) scale(0)`, opacity: 0 }
    ], {
      duration: 1000,
      easing: 'ease-out'
    }).onfinish = () => particle.remove();
  }
}

// Enhanced Achievement System
function checkAchievements() {
  const users = loadUsers();
  const user = users[currentUser];
  if (!user) return;
  
  const achievements = [
    { id: "first_legendary", name: "Legendary Hunter", desc: "Find your first legendary item", reward: 200, condition: () => user.stats.legendaryFound >= 1 },
    { id: "roll_master", name: "Roll Master", desc: "Roll 100 times", reward: 150, condition: () => user.stats.totalRolls >= 100 },
    { id: "trade_king", name: "Trade King", desc: "Complete 50 trades", reward: 200, condition: () => user.stats.totalTrades >= 50 },
    { id: "level_10", name: "Veteran", desc: "Reach level 10", reward: 300, condition: () => user.level >= 10 },
    { id: "rich_player", name: "Rich Player", desc: "Have 1000 coins", reward: 100, condition: () => user.coins >= 1000 },
    { id: "epic_collector", name: "Epic Collector", desc: "Find 10 epic items", reward: 250, condition: () => user.stats.epicFound >= 10 },
    { id: "rare_hunter", name: "Rare Hunter", desc: "Find 25 rare items", reward: 200, condition: () => user.stats.rareFound >= 25 },
    { id: "streak_master", name: "Streak Master", desc: "7-day login streak", reward: 500, condition: () => user.dailyStreak >= 7 },
    { id: "fusion_master", name: "Fusion Master", desc: "Fuse 10 items", reward: 300, condition: () => (user.stats.fusions || 0) >= 10 },
    { id: "market_trader", name: "Market Trader", desc: "Buy 20 items from market", reward: 200, condition: () => (user.stats.marketBuys || 0) >= 20 }
  ];
  
  achievements.forEach(achievement => {
    if (!user.achievements.includes(achievement.id) && achievement.condition()) {
      user.achievements.push(achievement.id);
      user.coins += achievement.reward;
      broadcastChat(`🏆 ${currentUser} unlocked achievement: ${achievement.name}! (+${achievement.reward} coins)`, true);
      showAchievementPopup(achievement.name, achievement.reward);
      playSound("success");
    }
  });
  
  saveUsers(users);
}

function showAchievementPopup(achievementName, reward) {
  const popup = document.createElement("div");
  popup.className = "achievement-popup";
  popup.innerHTML = `🏆 Achievement Unlocked: ${achievementName}!<br><small>+${reward} coins</small>`;
  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), 4000);
}

function displayAchievements() {
  const container = document.getElementById("achievements-list");
  const users = loadUsers();
  const user = users[currentUser];
  
  if (!user) return;
  
  const allAchievements = [
    { id: "first_legendary", name: "Legendary Hunter", desc: "Find your first legendary item", reward: 200 },
    { id: "roll_master", name: "Roll Master", desc: "Roll 100 times", reward: 150 },
    { id: "trade_king", name: "Trade King", desc: "Complete 50 trades", reward: 200 },
    { id: "level_10", name: "Veteran", desc: "Reach level 10", reward: 300 },
    { id: "rich_player", name: "Rich Player", desc: "Have 1000 coins", reward: 100 },
    { id: "epic_collector", name: "Epic Collector", desc: "Find 10 epic items", reward: 250 },
    { id: "rare_hunter", name: "Rare Hunter", desc: "Find 25 rare items", reward: 200 },
    { id: "streak_master", name: "Streak Master", desc: "7-day login streak", reward: 500 },
    { id: "fusion_master", name: "Fusion Master", desc: "Fuse 10 items", reward: 300 },
    { id: "market_trader", name: "Market Trader", desc: "Buy 20 items from market", reward: 200 }
  ];
  
  container.innerHTML = "";
  
  allAchievements.forEach(achievement => {
    const isUnlocked = user.achievements.includes(achievement.id);
    const div = document.createElement("div");
    div.className = `achievement-item ${isUnlocked ? 'unlocked' : 'locked'}`;
    div.innerHTML = `
      <div class="achievement-info">
        <h4>${achievement.name}</h4>
        <p>${achievement.desc}</p>
        <small>Reward: ${achievement.reward} coins</small>
      </div>
      <div class="achievement-status">
        ${isUnlocked ? '✅ Unlocked' : '🔒 Locked'}
      </div>
    `;
    container.appendChild(div);
  });
}

// Enhanced Shop System
function displayShop(category = "all") {
  const container = document.getElementById("shop-items");
  container.innerHTML = "";
  
  let filteredItems = shopItems;
  if (category !== "all") {
    filteredItems = shopItems.filter(item => item.type === category);
  }
  
  filteredItems.forEach(item => {
    const div = document.createElement("div");
    div.className = "shop-item";
    div.innerHTML = `
      <div>
        <strong>${item.name}</strong>
        <p>${item.desc}</p>
        <small>Cost: ${item.cost} coins</small>
      </div>
      <button onclick="buyShopItem('${item.effect}', ${item.cost}, '${item.name}')" class="buy-btn">Buy</button>
    `;
    container.appendChild(div);
  });
}

// Enhanced Slot Machine Animation
function seedReel(finalName) {
  slotReel.innerHTML = "";
  const pool = [];
  for (let i = 0; i < 40; i++) {
    const pick = items[Math.floor(Math.random() * items.length)];
    pool.push(pick);
  }
  const finalIndex = pool.length - 1;
  pool[finalIndex] = finalName;
  pool.forEach((it, idx) => {
    const div = document.createElement("div");
    div.className = "slot-item";
    if (idx === finalIndex) {
      div.classList.add(it.rarity);
    }
    div.textContent = typeof it === "string" ? it : it.name;
    slotReel.appendChild(div);
  });
  slotReel.style.transform = "translateY(0)";
  return pool.length;
}

function animateReel(finalItem) {
  const steps = seedReel(finalItem.name);
  let pos = 0;
  let speed = 20 + Math.random() * 8;
  const itemHeight = 48;
  const decel = 0.985;
  
  return new Promise(resolve => {
    const tick = () => {
      pos += speed;
      if (speed > 0.4) speed *= decel;
      slotReel.style.transform = `translateY(${-pos}px)`;
      
      if (pos >= (steps - 4) * itemHeight && speed <= 0.8) {
        const overshoot = (Math.random() * 8);
        slotReel.style.transform = `translateY(${-(steps - 1) * itemHeight - overshoot}px)`;
        setTimeout(() => { resolve(); }, 500);
      } else {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  });
}

// Enhanced Roll Functions
rollBtn.addEventListener("click", async () => {
  if (!currentUser) return;
  const user = ensureUserStats(currentUser);
  if (user.coins < 10) {
    rollResult.textContent = "Not enough coins!";
    showNotification("Not enough coins for roll!", "error");
    playSound("error");
    return;
  }
  
  rollBtn.disabled = true;
  rollResult.textContent = "Spinning...";
  multiplierDisplay.textContent = "1x";
  
  // Create loading effect
  const rect = rollBtn.getBoundingClientRect();
  createParticleEffect(rect.left + rect.width / 2, rect.top + rect.height / 2, "#6366f1");
  
  user.coins -= 10;
  user.stats.totalRolls = (user.stats.totalRolls || 0) + 1;
  
  const final = rollItem();
  lastRolledItem = final;
  user.rollHistory = user.rollHistory || [];
  user.rollHistory.push({
    item: final,
    timestamp: new Date().toISOString()
  });
  
  await animateReel(final);
  
  // Update best item if necessary
  if (!user.stats.bestItem || final.value > user.stats.bestItem.value) {
    user.stats.bestItem = final;
  }
  
  rollResult.innerHTML = `You got <span class="${getRarityClass(final.rarity)}">${final.name}</span>!`;
  
  const inv = getInventory(currentUser);
  if (inv.length >= user.maxInventory) {
    rollResult.textContent = "Inventory full! Sell items to make space.";
    showNotification("Inventory is full!", "error");
    playSound("error");
    rollBtn.disabled = false;
    return;
  }
  
  inv.push(final);
  saveInventory(currentUser, inv);
  
  // Update stats and quests
  if (final.rarity === 'legendary') {
    user.stats.legendaryFound = (user.stats.legendaryFound || 0) + 1;
    updateQuestProgress(currentUser, "collect_legendary");
    playSound("legendary");
    showNotification("🎉 LEGENDARY ITEM FOUND!", "success");
    createParticleEffect(rect.left + rect.width / 2, rect.top + rect.height / 2, "#ffd700");
  } else if (final.rarity === 'epic') {
    user.stats.epicFound = (user.stats.epicFound || 0) + 1;
    updateQuestProgress(currentUser, "collect_epic");
    playSound("success");
    showNotification("Epic item found!", "info");
  } else if (final.rarity === 'rare') {
    user.stats.rareFound = (user.stats.rareFound || 0) + 1;
    updateQuestProgress(currentUser, "collect_rare");
    playSound("success");
  } else {
    playSound("success");
  }
  
  updateQuestProgress(currentUser, "roll");
  
  // Apply item effects
  if (final.effect) {
    applyItemEffect(final, currentUser);
  }
  
  awardXP(final.rarity === 'legendary' ? 25 : final.rarity === 'epic' ? 15 : final.rarity === 'rare' ? 10 : 5);
  
  displayInventory();
  broadcastChat(`${currentUser} rolled ${final.name} (${final.rarity})`, true);
  
  const users = loadUsers();
  users[currentUser] = user;
  saveUsers(users);
  
  checkAchievements();
  rollBtn.disabled = false;
});

megaRollBtn.addEventListener("click", async () => {
  if (!currentUser) return;
  const user = ensureUserStats(currentUser);
  if (user.coins < 50) {
    rollResult.textContent = "Not enough coins for Mega Roll!";
    return;
  }
  
  megaRollBtn.disabled = true;
  rollResult.textContent = "MEGA SPINNING...";
  multiplierDisplay.textContent = "3x";
  
  user.coins -= 50;
  user.stats.totalRolls = (user.stats.totalRolls || 0) + 1;
  
  const final = rollItem(true);
  lastRolledItem = final;
  rollHistory.push(final);
  
  await animateReel(final);
  
  rollResult.innerHTML = `MEGA ROLL: <span class="${getRarityClass(final.rarity)}">${final.name}</span>!`;
  
  const inv = getInventory(currentUser);
  if (inv.length >= user.maxInventory) {
    rollResult.textContent = "Inventory full! Sell items to make space.";
    megaRollBtn.disabled = false;
    return;
  }
  
  inv.push(final);
  saveInventory(currentUser, inv);
  
  // Update stats and quests
  if (final.rarity === 'legendary') {
    user.stats.legendaryFound = (user.stats.legendaryFound || 0) + 1;
    updateQuestProgress(currentUser, "collect_legendary");
  } else if (final.rarity === 'epic') {
    user.stats.epicFound = (user.stats.epicFound || 0) + 1;
    updateQuestProgress(currentUser, "collect_epic");
  } else if (final.rarity === 'rare') {
    user.stats.rareFound = (user.stats.rareFound || 0) + 1;
    updateQuestProgress(currentUser, "collect_rare");
  }
  
  updateQuestProgress(currentUser, "roll");
  
  // Apply item effects
  if (final.effect) {
    applyItemEffect(final, currentUser);
  }
  
  awardXP(final.rarity === 'legendary' ? 50 : final.rarity === 'epic' ? 30 : final.rarity === 'rare' ? 20 : 10);
  
  displayInventory();
  broadcastChat(`${currentUser} MEGA rolled ${final.name} (${final.rarity})`, true);
  
  const users = loadUsers();
  users[currentUser] = user;
  saveUsers(users);
  
  checkAchievements();
  megaRollBtn.disabled = false;
});

// Enhanced Item Actions
equipBtn.addEventListener("click", () => {
  const sel = inventoryList.querySelector("li.selected");
  if (!sel) return;
  const idx = Number(sel.dataset.index);
  const item = getInventory(currentUser)[idx];
  setEquipped(currentUser, item);
  displayInventory();
  broadcastChat(`${currentUser} equipped ${item.name}`, true);
  
  // Show equip effect
  showEquipEffect(item);
});

function showEquipEffect(item) {
  const effect = document.createElement("div");
  effect.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 24px;
    font-weight: 900;
    color: #4ade80;
    text-shadow: 0 0 20px rgba(74, 222, 128, 0.8);
    animation: comboAnim 2s ease-out forwards;
    pointer-events: none;
    z-index: 1000;
  `;
  effect.textContent = `EQUIPPED: ${item.name}`;
  document.body.appendChild(effect);
  setTimeout(() => effect.remove(), 2000);
}

inspectBtn.addEventListener("click", () => {
  const sel = inventoryList.querySelector("li.selected");
  if (!sel) return;
  const idx = Number(sel.dataset.index);
  const item = getInventory(currentUser)[idx];
  const msg = `${item.name} — Rarity: ${item.rarity}, Value: ${item.value} coins${item.effect ? `, Effect: ${item.effect}` : ''}`;
  tradeMessage.textContent = msg;
});

sellBtn.addEventListener("click", () => {
  const sel = inventoryList.querySelector("li.selected");
  if (!sel) return;
  const idx = Number(sel.dataset.index);
  const inv = getInventory(currentUser);
  const item = inv[idx];
  
  let sellValue = item.value;
  if (coinBoostSales > 0) {
    sellValue *= 3;
    coinBoostSales--;
  }
  
  const users = loadUsers();
  users[currentUser].coins = (users[currentUser].coins || 0) + sellValue;
  users[currentUser].stats.totalSales = (users[currentUser].stats.totalSales || 0) + 1;
  
  inv.splice(idx, 1);
  saveInventory(currentUser, inv);
  saveUsers(users);
  
  updateQuestProgress(currentUser, "sell");
  displayInventory();
  broadcastChat(`${currentUser} sold ${item.name} for ${sellValue} coins`, true);
  tradeMessage.textContent = `Sold ${item.name} for ${sellValue} coins`;
  
  // Show sell effect
  showSellEffect(item, sellValue);
});

function showSellEffect(item, value) {
  const effect = document.createElement("div");
  effect.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 20px;
    font-weight: 700;
    color: #10b981;
    text-shadow: 0 0 15px rgba(16, 185, 129, 0.8);
    animation: comboAnim 1.5s ease-out forwards;
    pointer-events: none;
    z-index: 1000;
  `;
  effect.textContent = `+${value} coins`;
  document.body.appendChild(effect);
  setTimeout(() => effect.remove(), 1500);
}

// Enhanced Authentication
registerBtn.addEventListener("click", () => {
  const u = document.getElementById("username").value.trim();
  const p = document.getElementById("password").value.trim();
  
  if (!u || !p) {
    authMessage.textContent = "Fill both fields";
    playSound("error");
    return;
  }
  
  if (u.length < 3) {
    authMessage.textContent = "Username must be at least 3 characters";
    playSound("error");
    return;
  }
  
  if (p.length < 3) {
    authMessage.textContent = "Password must be at least 3 characters";
    playSound("error");
    return;
  }
  
  const users = loadUsers();
  if (users[u]) {
    authMessage.textContent = "User already exists";
    playSound("error");
    return;
  }
  
  users[u] = {
    password: p,
    inventory: [],
    equipped: null,
    level: 1,
    xp: 0,
    coins: 100,
    maxInventory: 50,
    stats: {
      totalRolls: 0,
      totalTrades: 0,
      totalSales: 0,
      legendaryFound: 0,
      epicFound: 0,
      rareFound: 0,
      bestItem: null
    },
    achievements: [],
    tradeHistory: [],
    rollHistory: [],
    dailyStreak: 0,
    lastLoginDate: null
  };
  
  saveUsers(users);
  authMessage.textContent = "Registered successfully!";
  playSound("success");
  showNotification("Account created successfully!", "success");
  populateTradeUsers();
});

loginBtn.addEventListener("click", () => {
  const u = document.getElementById("username").value.trim();
  const p = document.getElementById("password").value.trim();
  
  if (!u || !p) {
    authMessage.textContent = "Fill both fields";
    playSound("error");
    return;
  }
  
  const users = loadUsers();
  if (users[u] && users[u].password === p) {
    currentUser = u;
    const user = ensureUserStats(currentUser);
    
    // Update login streak
    const today = new Date().toDateString();
    if (user.lastLoginDate !== today) {
      if (user.lastLoginDate === new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()) {
        user.dailyStreak = (user.dailyStreak || 0) + 1;
      } else {
        user.dailyStreak = 1;
      }
      user.lastLoginDate = today;
      saveUsers(users);
    }
    
    authContainer.style.display = "none";
    gameContainer.style.display = "block";
    playerNameDisplay.textContent = currentUser;
    
    displayInventory();
    populateTradeUsers();
    updateQuestProgress(currentUser, "login");
    broadcastChat(`${currentUser} entered the realm`, true);
    updateDisplays();
    checkAchievements();
    
    playSound("success");
    showNotification(`Welcome back, ${currentUser}!`, "success");
    
    // Show streak notification
    if (user.dailyStreak >= 7) {
      showNotification(`🔥 ${user.dailyStreak}-day login streak!`, "info");
    }
  } else {
    authMessage.textContent = "Invalid credentials";
    playSound("error");
  }
});

logoutBtn.addEventListener("click", () => {
  if (currentUser) {
    broadcastChat(`${currentUser} left the realm`, true);
  }
  currentUser = null;
  authContainer.style.display = "block";
  gameContainer.style.display = "none";
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
  authMessage.textContent = "";
});

// New Event Listeners
if (clearChatBtn) {
  clearChatBtn.addEventListener("click", () => {
    chatBox.innerHTML = "";
    showNotification("Chat cleared", "info");
  });
}

if (toggleSoundBtn) {
  toggleSoundBtn.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    toggleSoundBtn.textContent = soundEnabled ? "🔊 Sound" : "🔇 Sound";
    showNotification(soundEnabled ? "Sound enabled" : "Sound disabled", "info");
  });
}

if (achievementsBtn) {
  achievementsBtn.addEventListener("click", () => {
    document.getElementById("achievements-modal").style.display = "flex";
    displayAchievements();
  });
}

document.getElementById("close-achievements")?.addEventListener("click", () => {
  document.getElementById("achievements-modal").style.display = "none";
});

// Shop category buttons
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("category-btn")) {
    document.querySelectorAll(".category-btn").forEach(btn => btn.classList.remove("active"));
    e.target.classList.add("active");
    displayShop(e.target.dataset.category);
  }
});

// Enhanced Event Listeners
inventoryFilter.addEventListener("input", applyInventoryFilter);

refreshUsersBtn.addEventListener("click", populateTradeUsers);

sendTradeBtn.addEventListener("click", () => {
  const sel = tradeInventoryList.querySelector("li.selected");
  const target = tradeUserSelect.value;
  if (!sel || !target) {
    tradeMessage.textContent = "Pick a target user and an item";
    return;
  }
  const idx = Number(sel.dataset.index);
  const users = loadUsers();
  const item = getInventory(currentUser)[idx];
  if (!users[target].inventory) users[target].inventory = [];
  users[target].inventory.push(item);
  let inv = getInventory(currentUser);
  inv.splice(idx, 1);
  saveInventory(currentUser, inv);
  saveUsers(users);
  
  // Update stats
  users[currentUser].stats.totalTrades = (users[currentUser].stats.totalTrades || 0) + 1;
  saveUsers(users);
  
  updateQuestProgress(currentUser, "trade");
  displayInventory();
  broadcastChat(`${currentUser} sent ${item.name} to ${target}`, true);
  tradeMessage.textContent = `Sent ${item.name} to ${target}`;
});

sendChat.addEventListener("click", () => {
  const txt = chatInput.value.trim();
  if (!txt) return;
  broadcastChat(`${currentUser}: ${txt}`, false);
  chatInput.value = "";
});

chatInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendChat.click();
});

// Enhanced Tab System
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const tab = btn.dataset.tab;
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(`${tab}-trade`).classList.add("active");
    
    if (tab === "market") displayMarketListings();
  });
});

// Enhanced Market System
function displayMarketListings() {
  const container = document.getElementById("market-listings");
  const listings = getMarketListings();
  container.innerHTML = "";
  
  if (listings.length === 0) {
    container.innerHTML = "<p class='small muted'>No items for sale</p>";
    return;
  }
  
  listings.forEach(listing => {
    const div = document.createElement("div");
    div.className = "market-item";
    div.innerHTML = `
      <span>${listing.item.name} (${listing.item.rarity})</span>
      <span>${listing.price} coins</span>
      <button onclick="buyMarketItem('${listing.id}')" ${listing.seller === currentUser ? 'disabled' : ''}>
        ${listing.seller === currentUser ? 'Your Item' : 'Buy'}
      </button>
    `;
    container.appendChild(div);
  });
}

window.buyMarketItem = function(listingId) {
  const result = buyFromMarket(listingId, currentUser);
  if (result.success) {
    displayInventory();
    displayMarketListings();
    broadcastChat(`${currentUser} bought ${result.item.name} for ${result.price} coins from market`, true);
    tradeMessage.textContent = `Bought ${result.item.name} for ${result.price} coins`;
    
    // Update stats
    const users = loadUsers();
    users[currentUser].stats.totalTrades = (users[currentUser].stats.totalTrades || 0) + 1;
    saveUsers(users);
  } else {
    tradeMessage.textContent = result.message;
  }
};

document.getElementById("list-item").addEventListener("click", () => {
  const sel = tradeInventoryList.querySelector("li.selected");
  const priceInput = document.getElementById("list-price");
  const price = parseInt(priceInput.value);
  
  if (!sel || !price || price < 1) {
    tradeMessage.textContent = "Select an item and enter a valid price";
    return;
  }
  
  const idx = Number(sel.dataset.index);
  const inv = getInventory(currentUser);
  const item = inv[idx];
  
  listItemOnMarket(currentUser, item, price);
  inv.splice(idx, 1);
  saveInventory(currentUser, inv);
  
  displayInventory();
  displayMarketListings();
  priceInput.value = "";
  broadcastChat(`${currentUser} listed ${item.name} for ${price} coins on market`, true);
  tradeMessage.textContent = `Listed ${item.name} for ${price} coins`;
});

// Enhanced Daily System
dailyBtn.addEventListener("click", () => {
  const users = loadUsers();
  const user = users[currentUser];
  const today = new Date().toDateString();
  
  if (user.lastDaily === today) {
    alert("You already claimed your daily reward today!");
    return;
  }
  
  user.lastDaily = today;
  user.coins = (user.coins || 0) + 50;
  
  const commonItem = items.find(item => item.rarity === 'common');
  if (commonItem && user.inventory.length < user.maxInventory) {
    user.inventory.push(structuredClone(commonItem));
  }
  
  saveUsers(users);
  displayInventory();
  broadcastChat(`${currentUser} claimed daily reward: +50 coins & ${commonItem ? commonItem.name : 'bonus item'}`, true);
  dailyBtn.textContent = "Claimed ✓";
  setTimeout(() => dailyBtn.textContent = "Claim Daily", 2000);
});

// Enhanced Shop System
shopBtn.addEventListener("click", () => {
  document.getElementById("shop-modal").style.display = "flex";
  displayShop();
});

document.getElementById("close-shop").addEventListener("click", () => {
  document.getElementById("shop-modal").style.display = "none";
});

function displayShop() {
  const container = document.getElementById("shop-items");
  container.innerHTML = "";
  
  shopItems.forEach(item => {
    const div = document.createElement("div");
    div.className = "shop-item";
    div.innerHTML = `
      <div>
        <strong>${item.name}</strong>
        <p>${item.desc}</p>
        <small>Cost: ${item.cost} coins</small>
      </div>
      <button onclick="buyShopItem('${item.effect}', ${item.cost}, '${item.name}')">Buy</button>
    `;
    container.appendChild(div);
  });
}

window.buyShopItem = function(effect, cost, name) {
  const users = loadUsers();
  const user = users[currentUser];
  
  if (user.coins < cost) {
    alert("Not enough coins!");
    return;
  }
  
  user.coins -= cost;
  
  switch (effect) {
    case "extra_roll":
      user.coins += 10;
      break;
    case "luck_boost":
      luckBoostRolls += 5;
      break;
    case "coin_boost":
      coinBoostSales += 10;
      break;
    case "inventory_expand":
      user.maxInventory += 10;
      break;
    case "mystery_box":
      const mysteryItem = openMysteryBox('common');
      user.inventory.push(mysteryItem);
      break;
    case "reroll":
      if (lastRolledItem) {
        const newItem = rollItem();
        user.inventory.push(newItem);
        broadcastChat(`${currentUser} rerolled and got ${newItem.name}!`, true);
      }
      break;
    case "xp_boost":
      xpBoostActive = true;
      setTimeout(() => xpBoostActive = false, 3600000); // 1 hour
      break;
    case "rarity_boost":
      rarityBoostActive = true;
      break;
    case "trade_slots":
      tradeSlots += 1;
      break;
    case "auto_sell":
      autoSellCommon = true;
      break;
  }
  
  saveUsers(users);
  updateDisplays();
  broadcastChat(`${currentUser} bought ${name} from shop`, true);
  displayShop();
};

// Enhanced Quest System
questsBtn.addEventListener("click", () => {
  document.getElementById("quests-modal").style.display = "flex";
  displayQuests();
});

document.getElementById("close-quests").addEventListener("click", () => {
  document.getElementById("quests-modal").style.display = "none";
});

function displayQuests() {
  const container = document.getElementById("quest-list");
  const users = loadUsers();
  const user = users[currentUser];
  
  if (!user.quests || user.questDate !== new Date().toDateString()) {
    user.quests = generateDailyQuests(currentUser);
    user.questDate = new Date().toDateString();
    saveUsers(users);
  }
  
  container.innerHTML = "";
  user.quests.forEach(quest => {
    const div = document.createElement("div");
    div.className = `quest-item ${quest.completed ? 'quest-complete' : ''}`;
    div.innerHTML = `
      <div>
        <strong>${quest.name}</strong>
        <p>${quest.desc}</p>
        <small>Progress: ${quest.progress}/${quest.target} | Reward: ${quest.reward} coins</small>
      </div>
      <div>${quest.completed ? '✓ Complete' : `${Math.floor((quest.progress/quest.target)*100)}%`}</div>
    `;
    container.appendChild(div);
  });
}

// Enhanced Fusion System
fusionBtn.addEventListener("click", () => {
  document.getElementById("fusion-modal").style.display = "flex";
  displayFusionSlots();
});

document.getElementById("fusion-cancel").addEventListener("click", () => {
  document.getElementById("fusion-modal").style.display = "none";
  selectedFusionItems = [];
});

function displayFusionSlots() {
  const container = document.getElementById("fusion-slots");
  container.innerHTML = "";
  
  for (let i = 0; i < 3; i++) {
    const slot = document.createElement("div");
    slot.className = `fusion-slot ${selectedFusionItems[i] ? 'filled' : ''}`;
    slot.textContent = selectedFusionItems[i] ? selectedFusionItems[i].name : `Slot ${i+1}`;
    slot.addEventListener("click", () => selectItemForFusion(i));
    container.appendChild(slot);
  }
}

function selectItemForFusion(slotIndex) {
  const sel = inventoryList.querySelector("li.selected");
  if (!sel) {
    alert("Select an item from your inventory first");
    return;
  }
  
  const idx = Number(sel.dataset.index);
  const item = getInventory(currentUser)[idx];
  selectedFusionItems[slotIndex] = {item, index: idx};
  displayFusionSlots();
}

document.getElementById("fusion-confirm").addEventListener("click", () => {
  if (selectedFusionItems.length !== 3 || selectedFusionItems.some(slot => !slot)) {
    alert("Fill all 3 fusion slots");
    return;
  }
  
  const items = selectedFusionItems.map(slot => slot.item);
  const result = fuseItems(items);
  
  if (!result) {
    alert("Cannot fuse these items. Items must be same rarity and not legendary.");
    return;
  }
  
  const inv = getInventory(currentUser);
  selectedFusionItems.sort((a,b) => b.index - a.index);
  selectedFusionItems.forEach(slot => inv.splice(slot.index, 1));
  
  inv.push(result);
  saveInventory(currentUser, inv);
  
  displayInventory();
  document.getElementById("fusion-modal").style.display = "none";
  selectedFusionItems = [];
  
  broadcastChat(`${currentUser} fused 3 ${items[0].rarity} items into ${result.name} (${result.rarity})`, true);
  awardXP(20);
  updateQuestProgress(currentUser, "fuse");
});

// Enhanced Mega Roll
megaRollBtn.addEventListener("click", async () => {
  if (!currentUser) return;
  const user = ensureUserStats(currentUser);
  if (user.coins < 50) {
    rollResult.textContent = "Not enough coins for Mega Roll!";
    showNotification("Not enough coins for Mega Roll!", "error");
    playSound("error");
    return;
  }
  
  megaRollBtn.disabled = true;
  rollResult.textContent = "MEGA SPINNING...";
  multiplierDisplay.textContent = "3x";
  
  // Enhanced mega roll effect
  const rect = megaRollBtn.getBoundingClientRect();
  createParticleEffect(rect.left + rect.width / 2, rect.top + rect.height / 2, "#f59e0b");
  
  user.coins -= 50;
  user.stats.totalRolls = (user.stats.totalRolls || 0) + 1;
  
  const final = rollItem(true);
  lastRolledItem = final;
  user.rollHistory = user.rollHistory || [];
  user.rollHistory.push({
    item: final,
    timestamp: new Date().toISOString(),
    mega: true
  });
  
  await animateReel(final);
  
  // Update best item if necessary
  if (!user.stats.bestItem || final.value > user.stats.bestItem.value) {
    user.stats.bestItem = final;
  }
  
  rollResult.innerHTML = `MEGA ROLL: <span class="${getRarityClass(final.rarity)}">${final.name}</span>!`;
  
  const inv = getInventory(currentUser);
  if (inv.length >= user.maxInventory) {
    rollResult.textContent = "Inventory full! Sell items to make space.";
    showNotification("Inventory is full!", "error");
    playSound("error");
    megaRollBtn.disabled = false;
    return;
  }
  
  inv.push(final);
  saveInventory(currentUser, inv);
  
  // Enhanced rewards for mega roll
  if (final.rarity === 'legendary') {
    user.stats.legendaryFound = (user.stats.legendaryFound || 0) + 1;
    updateQuestProgress(currentUser, "collect_legendary");
    playSound("legendary");
    showNotification("🎉 MEGA LEGENDARY!", "success");
    createParticleEffect(rect.left + rect.width / 2, rect.top + rect.height / 2, "#ffd700");
  } else if (final.rarity === 'epic') {
    user.stats.epicFound = (user.stats.epicFound || 0) + 1;
    updateQuestProgress(currentUser, "collect_epic");
    playSound("success");
    showNotification("Mega Epic item!", "info");
  } else if (final.rarity === 'rare') {
    user.stats.rareFound = (user.stats.rareFound || 0) + 1;
    updateQuestProgress(currentUser, "collect_rare");
    playSound("success");
  } else {
    playSound("success");
  }
  
  updateQuestProgress(currentUser, "roll");
  
  // Apply item effects
  if (final.effect) {
    applyItemEffect(final, currentUser);
  }
  
  awardXP(final.rarity === 'legendary' ? 50 : final.rarity === 'epic' ? 30 : final.rarity === 'rare' ? 20 : 10);
  
  displayInventory();
  broadcastChat(`${currentUser} MEGA rolled ${final.name} (${final.rarity})`, true);
  
  const users = loadUsers();
  users[currentUser] = user;
  saveUsers(users);
  
  checkAchievements();
  megaRollBtn.disabled = false;
});

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  populateTradeUsers();
  const demo = loadUsers();
  if (Object.keys(demo).length === 0) {
    demo["Alice"] = {
      password: "a",
      inventory: [],
      equipped: null,
      level: 1,
      xp: 0,
      coins: 100,
      maxInventory: 50,
      stats: {
        totalRolls: 0,
        totalTrades: 0,
        totalSales: 0,
        legendaryFound: 0,
        epicFound: 0,
        rareFound: 0,
        bestItem: null
      },
      achievements: [],
      tradeHistory: [],
      rollHistory: [],
      dailyStreak: 0,
      lastLoginDate: null
    };
    demo["Bob"] = {
      password: "b",
      inventory: [],
      equipped: null,
      level: 1,
      xp: 0,
      coins: 100,
      maxInventory: 50,
      stats: {
        totalRolls: 0,
        totalTrades: 0,
        totalSales: 0,
        legendaryFound: 0,
        epicFound: 0,
        rareFound: 0,
        bestItem: null
      },
      achievements: [],
      tradeHistory: [],
      rollHistory: [],
      dailyStreak: 0,
      lastLoginDate: null
    };
    saveUsers(demo);
  }
  populateTradeUsers();
  
  // Initialize background particles
  initBackgroundParticles();
});

function initBackgroundParticles() {
  const container = document.getElementById("particles-container");
  if (!container) return;
  
  for (let i = 0; i < 20; i++) {
    const particle = document.createElement("div");
    particle.className = "particle";
    particle.style.left = Math.random() * 100 + "%";
    particle.style.top = Math.random() * 100 + "%";
    particle.style.animationDelay = Math.random() * 3 + "s";
    container.appendChild(particle);
  }
}