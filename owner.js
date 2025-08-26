
const OWNER_USERNAME = 'Owner';
const OWNER_PASSWORD = 'owner1122';


let ownerPanel = null;
let userStats = {};
let serverStats = {
  totalUsers: 0,
  totalRolls: 0,
  totalCharacters: 0,
  totalCoins: 0,
  activeUsers: 0
};

// Owner Authentication Check
function isOwner() {
  const currentUser = localStorage.getItem('currentUser');
  return currentUser === OWNER_USERNAME;
}

// Initialize Owner System
function initializeOwnerSystem() {
  if (!isOwner()) return;
  
  // Create owner panel
  createOwnerPanel();
  
  // Add owner navigation button
  addOwnerNavButton();
  
  // Load server stats
  updateServerStats();
  
  // Set up auto-refresh
  setInterval(updateServerStats, 30000); // Update every 30 seconds
}

// Create Owner Panel
function createOwnerPanel() {
  // Remove existing panel if any
  const existingPanel = document.getElementById('owner-panel');
  if (existingPanel) {
    existingPanel.remove();
  }
  
  // Create owner panel HTML
  const ownerPanelHTML = `
    <section id="owner-panel" class="panel">
      <div class="panel-header">
        <h2>👑 Owner Panel - Owner</h2>
      </div>
      <div class="panel-content">
        <div class="owner-stats">
          <h3>📊 Server Statistics</h3>
          <div class="stats-grid">
            <div class="stat-card">
              <span class="stat-number" id="total-users">0</span>
              <span class="stat-label">Total Users</span>
            </div>
            <div class="stat-card">
              <span class="stat-number" id="total-rolls">0</span>
              <span class="stat-label">Total Rolls</span>
            </div>
            <div class="stat-card">
              <span class="stat-number" id="total-characters">0</span>
              <span class="stat-label">Characters Owned</span>
            </div>
            <div class="stat-card">
              <span class="stat-number" id="total-coins">0</span>
              <span class="stat-label">Total Coins</span>
            </div>
          </div>
        </div>
        
        <div class="owner-controls">
          <h3>⚙️ User Management</h3>
          <div class="control-section">
            <label for="target-user">Select User:</label>
            <select id="target-user" class="owner-select">
              <option value="">Choose a user...</option>
            </select>
          </div>
          
          <div class="control-section">
            <h4>💰 Give Coins</h4>
            <input type="number" id="give-coins-amount" placeholder="Amount" min="1" class="owner-input">
            <button id="give-coins-btn" class="owner-btn">Give Coins</button>
          </div>
          
          <div class="control-section">
            <h4>🎭 Give Character</h4>
            <select id="give-character-select" class="owner-select">
              <option value="">Choose character...</option>
            </select>
            <button id="give-character-btn" class="owner-btn">Give Character</button>
          </div>
          
          <div class="control-section">
            <h4>🎲 Give Free Spins</h4>
            <input type="number" id="give-spins-amount" placeholder="Amount" min="1" class="owner-input">
            <button id="give-spins-btn" class="owner-btn">Give Free Spins</button>
          </div>
          
          <div class="control-section">
            <h4>🎁 Give Items</h4>
            <select id="give-item-select" class="owner-select">
              <option value="">Choose item...</option>
              <option value="mega_boost">Mega Boost</option>
              <option value="luck_boost">Luck Boost</option>
              <option value="rarity_boost">Rarity Boost</option>
              <option value="xp_boost">XP Boost</option>
            </select>
            <button id="give-item-btn" class="owner-btn">Give Item</button>
          </div>
          
          <div class="control-section">
            <h4>🚫 Ban User</h4>
            <button id="ban-user-btn" class="owner-btn danger">Ban Selected User</button>
          </div>
          
          <div class="control-section">
            <h4>✅ Unban User</h4>
            <button id="unban-user-btn" class="owner-btn success">Unban Selected User</button>
          </div>
        </div>
        
        <div class="owner-log">
          <h3>📝 Action Log</h3>
          <div id="owner-log-content" class="log-content"></div>
          <button id="clear-log-btn" class="owner-btn">Clear Log</button>
        </div>
      </div>
    </section>
  `;
  
  // Insert panel into main content
  const mainContent = document.querySelector('.main-content');
  mainContent.insertAdjacentHTML('beforeend', ownerPanelHTML);
  
  // Initialize owner panel functionality
  initializeOwnerPanelFunctions();
}

// Add Owner Navigation Button
function addOwnerNavButton() {
  const navBar = document.querySelector('.navigation-bar');
  const ownerBtn = document.createElement('button');
  ownerBtn.className = 'nav-btn';
  ownerBtn.setAttribute('data-panel', 'owner');
  ownerBtn.innerHTML = '👑 Owner';
  ownerBtn.style.background = 'linear-gradient(135deg, #ff00ff, #800080)';
  ownerBtn.style.borderColor = '#ff00ff';
  ownerBtn.style.color = 'white';
  ownerBtn.style.fontWeight = '800';
  
  navBar.appendChild(ownerBtn);
  
  // Add event listener
  ownerBtn.addEventListener('click', () => {
    showPanel('owner');
  });
}

// Initialize Owner Panel Functions
function initializeOwnerPanelFunctions() {
  // Load users into select
  loadUsersIntoSelect();
  
  // Load characters into select
  loadCharactersIntoSelect();
  
  // Add event listeners
  addOwnerEventListeners();
  
  // Load action log
  loadActionLog();
}

// Load Users into Select
function loadUsersIntoSelect() {
  const users = loadUsers();
  const targetUserSelect = document.getElementById('target-user');
  
  if (!targetUserSelect) return;
  
  targetUserSelect.innerHTML = '<option value="">Choose a user...</option>';
  
  Object.keys(users).forEach(username => {
    if (username !== OWNER_USERNAME) {
      const option = document.createElement('option');
      option.value = username;
      option.textContent = username;
      targetUserSelect.appendChild(option);
    }
  });
}

// Load Characters into Select
function loadCharactersIntoSelect() {
  const characterSelect = document.getElementById('give-character-select');
  
  if (!characterSelect || !window.ANIME_BANNERS) return;
  
  characterSelect.innerHTML = '<option value="">Choose character...</option>';
  
  window.ANIME_BANNERS.characters.forEach(character => {
    const option = document.createElement('option');
    option.value = character.id;
    option.textContent = `${character.name} (${character.rarity})`;
    characterSelect.appendChild(option);
  });
}

// Add Owner Event Listeners
function addOwnerEventListeners() {
  // Give coins
  document.getElementById('give-coins-btn')?.addEventListener('click', giveCoinsToUser);
  
  // Give character
  document.getElementById('give-character-btn')?.addEventListener('click', giveCharacterToUser);
  
  // Give spins
  document.getElementById('give-spins-btn')?.addEventListener('click', giveSpinsToUser);
  
  // Give items
  document.getElementById('give-item-btn')?.addEventListener('click', giveItemToUser);
  
  // Ban user
  document.getElementById('ban-user-btn')?.addEventListener('click', banUser);
  
  // Unban user
  document.getElementById('unban-user-btn')?.addEventListener('click', unbanUser);
  
  // Clear log
  document.getElementById('clear-log-btn')?.addEventListener('click', clearActionLog);
  
  // Refresh users
  document.getElementById('target-user')?.addEventListener('change', () => {
    loadUsersIntoSelect();
  });
}

// Owner Functions
function giveCoinsToUser() {
  const targetUser = document.getElementById('target-user').value;
  const amount = parseInt(document.getElementById('give-coins-amount').value);
  
  if (!targetUser || !amount || amount <= 0) {
    showNotification('Please select a user and enter a valid amount', 'error');
    return;
  }
  
  const users = loadUsers();
  if (!users[targetUser]) {
    showNotification('User not found', 'error');
    return;
  }
  
  users[targetUser].coins = (users[targetUser].coins || 0) + amount;
  saveUsers(users);
  
  logAction(`Gave ${amount} coins to ${targetUser}`);
  showNotification(`Gave ${amount} coins to ${targetUser}`, 'success');
  
  // Clear input
  document.getElementById('give-coins-amount').value = '';
  
  // Update server stats
  updateServerStats();
}

function giveCharacterToUser() {
  const targetUser = document.getElementById('target-user').value;
  const characterId = document.getElementById('give-character-select').value;
  
  if (!targetUser || !characterId) {
    showNotification('Please select a user and character', 'error');
    return;
  }
  
  const users = loadUsers();
  if (!users[targetUser]) {
    showNotification('User not found', 'error');
    return;
  }
  
  const character = window.ANIME_BANNERS?.characters.find(c => c.id === characterId);
  if (!character) {
    showNotification('Character not found', 'error');
    return;
  }
  
  users[targetUser].characters = users[targetUser].characters || [];
  users[targetUser].characters.push(character);
  saveUsers(users);
  
  logAction(`Gave ${character.name} (${character.rarity}) to ${targetUser}`);
  showNotification(`Gave ${character.name} to ${targetUser}`, 'success');
  
  // Update server stats
  updateServerStats();
}

function giveSpinsToUser() {
  const targetUser = document.getElementById('target-user').value;
  const amount = parseInt(document.getElementById('give-spins-amount').value);
  
  if (!targetUser || !amount || amount <= 0) {
    showNotification('Please select a user and enter a valid amount', 'error');
    return;
  }
  
  const users = loadUsers();
  if (!users[targetUser]) {
    showNotification('User not found', 'error');
    return;
  }
  
  users[targetUser].freeSpins = (users[targetUser].freeSpins || 0) + amount;
  saveUsers(users);
  
  logAction(`Gave ${amount} free spins to ${targetUser}`);
  showNotification(`Gave ${amount} free spins to ${targetUser}`, 'success');
  
  // Clear input
  document.getElementById('give-spins-amount').value = '';
}

function giveItemToUser() {
  const targetUser = document.getElementById('target-user').value;
  const itemType = document.getElementById('give-item-select').value;
  
  if (!targetUser || !itemType) {
    showNotification('Please select a user and item', 'error');
    return;
  }
  
  const users = loadUsers();
  if (!users[targetUser]) {
    showNotification('User not found', 'error');
    return;
  }
  
  // Create item based on type
  const item = {
    id: itemType,
    name: itemType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    type: 'consumable',
    rarity: 'epic',
    power: 100,
    value: 200,
    effect: itemType
  };
  
  users[targetUser].inventory = users[targetUser].inventory || [];
  users[targetUser].inventory.push(item);
  saveUsers(users);
  
  logAction(`Gave ${item.name} to ${targetUser}`);
  showNotification(`Gave ${item.name} to ${targetUser}`, 'success');
  
  // Clear selection
  document.getElementById('give-item-select').value = '';
}

function banUser() {
  const targetUser = document.getElementById('target-user').value;
  
  if (!targetUser) {
    showNotification('Please select a user to ban', 'error');
    return;
  }
  
  if (targetUser === OWNER_USERNAME) {
    showNotification('Cannot ban the owner', 'error');
    return;
  }
  
  const users = loadUsers();
  if (!users[targetUser]) {
    showNotification('User not found', 'error');
    return;
  }
  
  users[targetUser].banned = true;
  saveUsers(users);
  
  logAction(`Banned user: ${targetUser}`);
  showNotification(`Banned ${targetUser}`, 'success');
}

function unbanUser() {
  const targetUser = document.getElementById('target-user').value;
  
  if (!targetUser) {
    showNotification('Please select a user to unban', 'error');
    return;
  }
  
  const users = loadUsers();
  if (!users[targetUser]) {
    showNotification('User not found', 'error');
    return;
  }
  
  users[targetUser].banned = false;
  saveUsers(users);
  
  logAction(`Unbanned user: ${targetUser}`);
  showNotification(`Unbanned ${targetUser}`, 'success');
}

// Update Server Statistics
function updateServerStats() {
  const users = loadUsers();
  let totalRolls = 0;
  let totalCharacters = 0;
  let totalCoins = 0;
  
  Object.values(users).forEach(user => {
    totalRolls += user.stats?.totalRolls || 0;
    totalCharacters += user.characters?.length || 0;
    totalCoins += user.coins || 0;
  });
  
  serverStats = {
    totalUsers: Object.keys(users).length,
    totalRolls: totalRolls,
    totalCharacters: totalCharacters,
    totalCoins: totalCoins,
    activeUsers: Object.values(users).filter(u => !u.banned).length
  };
  
  // Update display
  updateServerStatsDisplay();
}

// Update Server Stats Display
function updateServerStatsDisplay() {
  const elements = {
    'total-users': serverStats.totalUsers,
    'total-rolls': serverStats.totalRolls.toLocaleString(),
    'total-characters': serverStats.totalCharacters.toLocaleString(),
    'total-coins': serverStats.totalCoins.toLocaleString()
  };
  
  Object.entries(elements).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  });
}

// Action Log System
function logAction(action) {
  const logs = JSON.parse(localStorage.getItem('ownerLogs') || '[]');
  const logEntry = {
    action: action,
    timestamp: new Date().toISOString(),
    user: OWNER_USERNAME
  };
  
  logs.unshift(logEntry);
  
  // Keep only last 100 logs
  if (logs.length > 100) {
    logs.splice(100);
  }
  
  localStorage.setItem('ownerLogs', JSON.stringify(logs));
  updateActionLogDisplay();
}

// Load Action Log
function loadActionLog() {
  updateActionLogDisplay();
}

// Update Action Log Display
function updateActionLogDisplay() {
  const logContent = document.getElementById('owner-log-content');
  if (!logContent) return;
  
  const logs = JSON.parse(localStorage.getItem('ownerLogs') || '[]');
  
  logContent.innerHTML = logs.map(log => `
    <div class="log-entry">
      <span class="log-timestamp">${new Date(log.timestamp).toLocaleString()}</span>
      <span class="log-action">${log.action}</span>
    </div>
  `).join('');
}

// Clear Action Log
function clearActionLog() {
  localStorage.removeItem('ownerLogs');
  updateActionLogDisplay();
  showNotification('Action log cleared', 'success');
}

// Enhanced Game Mechanics

// Free Spins System - Available to Everyone
function hasFreeSpins() {
  const users = loadUsers();
  const currentUser = localStorage.getItem('currentUser');
  const user = users[currentUser];
  
  return user && (user.freeSpins || 0) > 0;
}

function useFreeSpin() {
  const users = loadUsers();
  const currentUser = localStorage.getItem('currentUser');
  const user = users[currentUser];
  
  if (user && user.freeSpins > 0) {
    user.freeSpins--;
    saveUsers(users);
    return true;
  }
  
  return false;
}

// Instant Spin System (1000+ spins) - Available to Everyone
function shouldUseInstantSpin() {
  const users = loadUsers();
  const currentUser = localStorage.getItem('currentUser');
  const user = users[currentUser];
  
  return user && (user.stats?.totalRolls || 0) >= 1000;
}

// Auto Delete System - Available to Everyone
function shouldAutoDelete(item) {
  const users = loadUsers();
  const currentUser = localStorage.getItem('currentUser');
  const user = users[currentUser];
  
  if (!user) return false;
  
  // Auto delete common items if inventory is getting full
  if (item.rarity === 'common' && user.inventory.length > 40) {
    return true;
  }
  
  // Auto delete rare items if user has too many
  if (item.rarity === 'rare' && user.inventory.length > 35) {
    return true;
  }
  
  return false;
}

// Enhanced Roll Function
function enhancedRoll() {
  if (!isOwner()) return;
  
  const users = loadUsers();
  const currentUser = localStorage.getItem('currentUser');
  const user = users[currentUser];
  
  if (!user) return;
  
  // Check if user has free spins
  if (hasFreeSpins()) {
    useFreeSpin();
  } else {
    // Regular coin cost
    if (user.coins < 10) {
      showNotification("Not enough coins! Need 10 coins to roll.", "error");
      return;
    }
    user.coins -= 10;
  }
  
  // Update stats
  user.stats = user.stats || {};
  user.stats.totalRolls = (user.stats.totalRolls || 0) + 1;
  
  let rolledItem;
  
  if (currentBanner === 'anime') {
    rolledItem = window.ANIME_BANNERS?.getRandomCharacter();
  } else {
    rolledItem = window.ANIME_BANNERS?.getRandomAura();
  }
  
  if (rolledItem) {
    // Check if should auto delete
    if (shouldAutoDelete(rolledItem)) {
      showNotification(`Auto-deleted ${rolledItem.name} (inventory full)`, 'info');
      logAction(`Auto-deleted ${rolledItem.name} for ${currentUser}`);
    } else {
      // Add to user's collection
      if (currentBanner === 'anime') {
        user.characters = user.characters || [];
        const existingChar = user.characters.find(c => c.id === rolledItem.id);
        if (!existingChar) {
          user.characters.push(rolledItem);
          showNotification(`🎭 Got ${rolledItem.name} (${rolledItem.rarity})!`, "success");
        } else {
          showNotification(`🎭 Duplicate ${rolledItem.name}! +50 coins`, "info");
          user.coins += 50;
        }
      } else {
        user.auras = user.auras || [];
        const existingAura = user.auras.find(a => a.id === rolledItem.id);
        if (!existingAura) {
          user.auras.push(rolledItem);
          showNotification(`✨ Got ${rolledItem.name} (${rolledItem.rarity})!`, "success");
        } else {
          showNotification(`✨ Duplicate ${rolledItem.name}! +50 coins`, "info");
          user.coins += 50;
        }
      }
    }
  }
  
  saveUsers(users);
  updateRollPanel();
  
  // Use instant spin if available
  if (shouldUseInstantSpin()) {
    // Skip animation
    showNotification("Instant spin activated! (1000+ spins)", "info");
  } else {
    playSound("success");
  }
  
  // Update server stats
  updateServerStats();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Wait a bit for other scripts to load
  setTimeout(() => {
    initializeOwnerSystem();
  }, 1000);
});

// Export functions for use in other scripts
window.OWNER = {
  isOwner,
  enhancedRoll,
  hasFreeSpins,
  shouldUseInstantSpin,
  updateServerStats,
  logAction
};
