// Game.js - Game logic for game.html only

// Global Variables
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
let currentBanner = 'anime'; // 'anime' or 'aura'
let pvpRequests = [];
let selectedInventoryItem = null;

// Game State
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

// Panel Navigation System
function showPanel(panelName) {
  // Hide all panels
  document.querySelectorAll('.panel').forEach(panel => {
    panel.classList.remove('active');
  });
  
  // Remove active class from all nav buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Show selected panel
  const targetPanel = document.getElementById(`${panelName}-panel`);
  if (targetPanel) {
    targetPanel.classList.add('active');
  }
  
  // Add active class to nav button
  const navBtn = document.querySelector(`[data-panel="${panelName}"]`);
  if (navBtn) {
    navBtn.classList.add('active');
  }
  
  // Update panel content based on panel type
  switch(panelName) {
    case 'roll':
      updateRollPanel();
      break;
    case 'inventory':
      updateInventoryPanel();
      break;
    case 'trade':
      updateTradePanel();
      break;
    case 'chat':
      updateChatPanel();
      break;
    case 'shop':
      updateShopPanel();
      break;
    case 'quests':
      updateQuestsPanel();
      break;
    case 'achievements':
      updateAchievementsPanel();
      break;
    case 'characters':
      updateCharactersPanel();
      break;
    case 'squad':
      updateSquadPanel();
      break;
    case 'bosses':
      updateBossesPanel();
      break;
  }
}

// Banner Selection
function switchBanner(bannerType) {
  currentBanner = bannerType;
  
  // Update banner buttons
  document.querySelectorAll('.banner-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  const activeBtn = document.querySelector(`[data-banner="${bannerType}"]`);
  if (activeBtn) {
    activeBtn.classList.add('active');
  }
  
  // Update banner display
  const bannerText = document.querySelector('.banner-selector h3');
  if (bannerText) {
    bannerText.textContent = bannerType === 'anime' ? '🎭 Anime Characters' : '✨ Aura Banner';
  }
  
  showNotification(`Switched to ${bannerType} banner`, 'info');
}

// FREE ROLL SYSTEM - Available to Everyone
function rollItem() {
  if (!currentUser) {
    showNotification('Please log in first', 'error');
    return;
  }
  
  const users = loadUsers();
  const user = users[currentUser];
  
  if (!user) {
    showNotification('User not found', 'error');
    return;
  }
  
  // Check if user is banned
  if (user.banned) {
    showNotification('You are banned from rolling', 'error');
    return;
  }
  
  // Check if user has free spins
  let usedFreeSpin = false;
  if (user.freeSpins > 0) {
    user.freeSpins--;
    usedFreeSpin = true;
    showNotification('🎲 Used a free spin!', 'success');
  } else {
    showNotification('No free spins remaining! Use paid spins for exclusive characters.', 'info');
    return;
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
  
  saveUsers(users);
  updateRollPanel();
  updateDisplays();
  
  // Play sound
  playSound("success");
}

// PAID ROLL SYSTEM - For Exclusive Characters
function paidRoll() {
  if (!currentUser) {
    showNotification('Please log in first', 'error');
    return;
  }
  
  const users = loadUsers();
  const user = users[currentUser];
  
  if (!user) {
    showNotification('User not found', 'error');
    return;
  }
  
  // Check if user is banned
  if (user.banned) {
    showNotification('You are banned from rolling', 'error');
    return;
  }
  
  // Check if user has enough coins
  if (user.coins < 50) {
    showNotification("Not enough coins! Need 50 coins for paid spins.", "error");
    return;
  }
  
  user.coins -= 50;
  
  // Update stats
  user.stats = user.stats || {};
  user.stats.totalRolls = (user.stats.totalRolls || 0) + 1;
  
  // Get exclusive character (higher chances for rare characters)
  let rolledItem = getExclusiveCharacter();
  
  if (rolledItem) {
    // Add to user's collection
    user.characters = user.characters || [];
    const existingChar = user.characters.find(c => c.id === rolledItem.id);
    if (!existingChar) {
      user.characters.push(rolledItem);
      showNotification(`🌟 EXCLUSIVE! Got ${rolledItem.name} (${rolledItem.rarity})!`, "success");
    } else {
      showNotification(`🌟 Duplicate ${rolledItem.name}! +100 coins`, "info");
      user.coins += 100;
    }
  }
  
  saveUsers(users);
  updateRollPanel();
  updateDisplays();
  
  // Play sound
  playSound("success");
}

// Get Exclusive Character with Higher Rarity Chances
function getExclusiveCharacter() {
  const characters = window.ANIME_BANNERS?.characters || [];
  
  // First, try to get exclusive paid-only characters (90% chance)
  const exclusiveCharacters = characters.filter(char => char.exclusive === true);
  if (Math.random() < 0.9 && exclusiveCharacters.length > 0) {
    return exclusiveCharacters[Math.floor(Math.random() * exclusiveCharacters.length)];
  }
  
  // Then, try to get high rarity characters (80% chance)
  const highRarityCharacters = characters.filter(char => 
    char.rarity === 'epic' || char.rarity === 'legendary' || char.rarity === 'mythical'
  );
  
  if (Math.random() < 0.8 && highRarityCharacters.length > 0) {
    return highRarityCharacters[Math.floor(Math.random() * highRarityCharacters.length)];
  }
  
  // Fallback to any character
  return characters[Math.floor(Math.random() * characters.length)];
}

// Mega Roll (10x paid rolls)
function megaRoll() {
  if (!currentUser) {
    showNotification('Please log in first', 'error');
    return;
  }
  
  const users = loadUsers();
  const user = users[currentUser];
  
  if (!user) {
    showNotification('User not found', 'error');
    return;
  }
  
  // Check if user has enough coins
  if (user.coins < 500) {
    showNotification("Not enough coins! Need 500 coins for mega roll.", "error");
    return;
  }
  
  user.coins -= 500;
  
  // Do 10 paid rolls
  const results = [];
  for (let i = 0; i < 10; i++) {
    const item = getExclusiveCharacter();
    if (item) {
      results.push(item);
      
      // Add to user's collection
      user.characters = user.characters || [];
      const existingChar = user.characters.find(c => c.id === item.id);
      if (!existingChar) {
        user.characters.push(item);
      } else {
        user.coins += 100; // Bonus for duplicates
      }
    }
  }
  
  // Update stats
  user.stats = user.stats || {};
  user.stats.totalRolls = (user.stats.totalRolls || 0) + 10;
  
  saveUsers(users);
  updateRollPanel();
  updateDisplays();
  
  showNotification(`🌟 MEGA ROLL! Got ${results.length} exclusive characters!`, "success");
  playSound("success");
}

// Update Roll Panel
function updateRollPanel() {
  const users = loadUsers();
  const user = users[currentUser];
  if (!user) return;
  
  // Update banner display
  const bannerText = document.querySelector('.banner-selector h3');
  if (bannerText) {
    bannerText.textContent = currentBanner === 'anime' ? '🎭 Anime Characters' : '✨ Aura Banner';
  }
  
  // Update user stats
  const levelDisplay = document.getElementById('level-display');
  const xpDisplay = document.getElementById('xp-display');
  const coinsDisplay = document.getElementById('coins-display');
  
  if (levelDisplay) levelDisplay.textContent = user.level || 1;
  if (xpDisplay) xpDisplay.textContent = user.xp || 0;
  if (coinsDisplay) coinsDisplay.textContent = (user.coins || 0).toLocaleString();
  
  // Show free spins for everyone
  if (user.freeSpins > 0) {
    let freeSpinsDisplay = document.getElementById('free-spins-display');
    if (!freeSpinsDisplay) {
      freeSpinsDisplay = document.createElement('div');
      freeSpinsDisplay.id = 'free-spins-display';
      freeSpinsDisplay.className = 'free-spins-display';
      const rollSection = document.querySelector('.roll-section');
      if (rollSection) {
        rollSection.insertBefore(freeSpinsDisplay, rollSection.firstChild);
      }
    }
    freeSpinsDisplay.textContent = `🎲 FREE SPINS: ${user.freeSpins}`;
  } else {
    const freeSpinsDisplay = document.getElementById('free-spins-display');
    if (freeSpinsDisplay) {
      freeSpinsDisplay.remove();
    }
  }
  
  // Show total spins count for everyone
  let totalSpinsDisplay = document.getElementById('total-spins-display');
  if (!totalSpinsDisplay) {
    totalSpinsDisplay = document.createElement('div');
    totalSpinsDisplay.id = 'total-spins-display';
    totalSpinsDisplay.className = 'total-spins-display';
    const rollSection = document.querySelector('.roll-section');
    if (rollSection) {
      rollSection.insertBefore(totalSpinsDisplay, rollSection.firstChild);
    }
  }
  totalSpinsDisplay.textContent = `🎰 TOTAL SPINS: ${user.stats?.totalRolls || 0}`;
}

// Update All Displays
function updateDisplays() {
  updateRollPanel();
  updateInventoryPanel();
  updateCharactersPanel();
  updateSquadPanel();
  updateBossesPanel();
}

// Panel Update Functions
function updateInventoryPanel() {
  const users = loadUsers();
  const user = users[currentUser];
  if (!user) return;
  
  const inventoryList = document.getElementById('inventory-list');
  const inventoryCount = document.getElementById('inventory-count');
  
  if (inventoryList) {
    inventoryList.innerHTML = '';
    const items = user.inventory || [];
    
    items.forEach((item, index) => {
      const li = document.createElement('li');
      li.className = selectedInventoryItem === index ? 'selected' : '';
      li.onclick = () => selectInventoryItem(index);
      li.innerHTML = `
        <div class="item-info">
          <span class="item-name">${item.name}</span>
          <span class="rarity-badge ${item.rarity}">${item.rarity}</span>
        </div>
        <div class="item-stats">
          <span>Power: ${item.power || 0}</span>
          <span>Value: ${item.value || 0} coins</span>
        </div>
      `;
      inventoryList.appendChild(li);
    });
  }
  
  if (inventoryCount) {
    const items = user.inventory || [];
    inventoryCount.textContent = `(${items.length}/${user.maxInventory || 50})`;
  }
}

function updateCharactersPanel() {
  const users = loadUsers();
  const user = users[currentUser];
  if (!user) return;
  
  const charactersList = document.getElementById('characters-list');
  if (charactersList) {
    charactersList.innerHTML = '';
    const characters = user.characters || [];
    
    characters.forEach(character => {
      const card = document.createElement('div');
      card.className = `character-card ${character.rarity}`;
      card.innerHTML = `
        <div class="character-info">
          <h3>${character.name}</h3>
          <span class="rarity-badge ${character.rarity}">${character.rarity}</span>
          <p>Power: ${character.power}</p>
          <p>Health: ${character.health}</p>
          <p>Series: ${character.series}</p>
        </div>
      `;
      charactersList.appendChild(card);
    });
  }
}

function updateSquadPanel() {
  const users = loadUsers();
  const user = users[currentUser];
  if (!user) return;
  
  const squadDisplay = document.getElementById('squad-display');
  if (squadDisplay) {
    squadDisplay.innerHTML = '';
    const squad = user.squad || [];
    
    squad.forEach((member, index) => {
      const memberDiv = document.createElement('div');
      memberDiv.className = 'squad-member';
      memberDiv.innerHTML = `
        <h4>${member.name}</h4>
        <span class="rarity-badge ${member.rarity}">${member.rarity}</span>
        <p>Power: ${member.power}</p>
      `;
      squadDisplay.appendChild(memberDiv);
    });
  }
}

function updateBossesPanel() {
  const bossesList = document.getElementById('bosses-list');
  if (bossesList && window.ANIME_BANNERS?.bosses) {
    bossesList.innerHTML = '';
    
    window.ANIME_BANNERS.bosses.forEach(boss => {
      const bossCard = document.createElement('div');
      bossCard.className = 'boss-card';
      bossCard.innerHTML = `
        <div class="boss-info">
          <h3>${boss.name}</h3>
          <span class="rarity-badge ${boss.rarity}">${boss.rarity}</span>
          <p>Power: ${boss.power}</p>
          <p>Health: ${boss.health}</p>
          <p>Reward: ${boss.reward} coins</p>
        </div>
        <button class="boss-battle-btn" onclick="battleBoss('${boss.id}')">Battle</button>
      `;
      bossesList.appendChild(bossCard);
    });
  }
}

function updateTradePanel() {
  // Trade panel update logic
}

function updateChatPanel() {
  // Chat panel update logic
}

function updateShopPanel() {
  // Initialize shop with all items when panel is first opened
  updateShopItemsByCategory('all');
}

function updateQuestsPanel() {
  // Quests panel update logic
}

function updateAchievementsPanel() {
  // Achievements panel update logic
}

// Trade Tab Functions
function switchTradeTab(tab) {
  // Remove active class from all tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Hide all tab contents
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  
  // Add active class to selected tab button
  const activeBtn = document.querySelector(`[data-tab="${tab}"]`);
  if (activeBtn) {
    activeBtn.classList.add('active');
  }
  
  // Show selected tab content
  const activeContent = document.getElementById(`${tab}-trade`);
  if (activeContent) {
    activeContent.classList.add('active');
  }
}

// Shop Category Functions
function switchShopCategory(category) {
  // Remove active class from all category buttons
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Add active class to selected category button
  const activeBtn = document.querySelector(`[data-category="${category}"]`);
  if (activeBtn) {
    activeBtn.classList.add('active');
  }
  
  // Update shop items display based on category
  updateShopItemsByCategory(category);
}

function updateShopItemsByCategory(category) {
  const shopItems = document.getElementById('shop-items');
  if (!shopItems) return;
  
  // Sample shop items
  const items = [
    { name: 'Health Potion', category: 'potions', price: 50, description: 'Restores 100 HP' },
    { name: 'Power Boost', category: 'consumable', price: 100, description: 'Increases power by 10%' },
    { name: 'Inventory Expansion', category: 'upgrade', price: 200, description: 'Adds 10 slots to inventory' },
    { name: 'Mana Potion', category: 'potions', price: 75, description: 'Restores 50 MP' }
  ];
  
  const filteredItems = category === 'all' ? items : items.filter(item => item.category === category);
  
  shopItems.innerHTML = '';
  filteredItems.forEach(item => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'shop-item';
    itemDiv.innerHTML = `
      <div class="item-info">
        <h3>${item.name}</h3>
        <p>${item.description}</p>
        <span class="price">${item.price} coins</span>
      </div>
      <button class="buy-btn" onclick="buyItem('${item.name}', ${item.price})">Buy</button>
    `;
    shopItems.appendChild(itemDiv);
  });
}

// Character Filter Functions
function filterCharacters(filter) {
  // Remove active class from all filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Add active class to selected filter button
  const activeBtn = document.querySelector(`[data-filter="${filter}"]`);
  if (activeBtn) {
    activeBtn.classList.add('active');
  }
  
  // Update characters display based on filter
  updateCharactersByFilter(filter);
}

function updateCharactersByFilter(filter) {
  const users = loadUsers();
  const user = users[currentUser];
  if (!user) return;
  
  const charactersList = document.getElementById('characters-list');
  if (!charactersList) return;
  
  charactersList.innerHTML = '';
  const characters = user.characters || [];
  const filteredCharacters = filter === 'all' ? characters : characters.filter(char => char.rarity === filter);
  
  filteredCharacters.forEach(character => {
    const card = document.createElement('div');
    card.className = `character-card ${character.rarity}`;
    card.innerHTML = `
      <div class="character-info">
        <h3>${character.name}</h3>
        <span class="rarity-badge ${character.rarity}">${character.rarity}</span>
        <p>Power: ${character.power}</p>
        <p>Health: ${character.health}</p>
        <p>Series: ${character.series}</p>
      </div>
    `;
    charactersList.appendChild(card);
  });
}

// Buy Item Function
function buyItem(itemName, price) {
  if (!currentUser) {
    showNotification('Please log in first', 'error');
    return;
  }
  
  const users = loadUsers();
  const user = users[currentUser];
  
  if (!user || user.coins < price) {
    showNotification('Not enough coins!', 'error');
    return;
  }
  
  user.coins -= price;
  showNotification(`Purchased ${itemName}!`, 'success');
  
  saveUsers(users);
  updateDisplays();
}

// Inventory Functions
function selectInventoryItem(index) {
  selectedInventoryItem = index;
  updateInventoryPanel();
}

function equipItem() {
  if (selectedInventoryItem === null) {
    showNotification('Please select an item first', 'error');
    return;
  }
  
  const users = loadUsers();
  const user = users[currentUser];
  const items = user.inventory || [];
  const item = items[selectedInventoryItem];
  
  if (item) {
    setEquipped(currentUser, item);
    showNotification(`Equipped ${item.name}!`, 'success');
    updateDisplays();
  }
}

function inspectItem() {
  if (selectedInventoryItem === null) {
    showNotification('Please select an item first', 'error');
    return;
  }
  
  const users = loadUsers();
  const user = users[currentUser];
  const items = user.inventory || [];
  const item = items[selectedInventoryItem];
  
  if (item) {
    showNotification(`Inspecting ${item.name}: Power ${item.power}, Value ${item.value} coins`, 'info');
  }
}

function sellItem() {
  if (selectedInventoryItem === null) {
    showNotification('Please select an item first', 'error');
    return;
  }
  
  const users = loadUsers();
  const user = users[currentUser];
  const items = user.inventory || [];
  const item = items[selectedInventoryItem];
  
  if (item) {
    user.coins += item.value || 10;
    items.splice(selectedInventoryItem, 1);
    user.inventory = items;
    selectedInventoryItem = null;
    
    saveUsers(users);
    showNotification(`Sold ${item.name} for ${item.value || 10} coins!`, 'success');
    updateDisplays();
  }
}

// Boss Battle Function
function battleBoss(bossId) {
  const boss = window.ANIME_BANNERS?.bosses?.find(b => b.id === bossId);
  if (!boss) return;
  
  const users = loadUsers();
  const user = users[currentUser];
  const squad = user.squad || [];
  
  if (squad.length === 0) {
    showNotification('You need a squad to battle bosses!', 'error');
    return;
  }
  
  // Simple battle calculation
  const squadPower = squad.reduce((total, member) => total + member.power, 0);
  const bossPower = boss.power;
  
  if (squadPower > bossPower) {
    user.coins += boss.reward;
    user.stats.battlesWon = (user.stats.battlesWon || 0) + 1;
    showNotification(`Victory! Earned ${boss.reward} coins!`, 'success');
  } else {
    user.stats.battlesLost = (user.stats.battlesLost || 0) + 1;
    showNotification('Defeat! Try again with a stronger squad.', 'error');
  }
  
  saveUsers(users);
  updateDisplays();
}

// Utility Functions
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

function playSound(type) {
  if (!soundEnabled) return;
  
  // Simple sound simulation
  console.log(`Playing ${type} sound`);
}

// Logout Function
function handleLogout() {
  currentUser = null;
  localStorage.removeItem('currentUser');
  showNotification('Logged out successfully', 'info');
  
  // Redirect to login page
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 1000);
}

// Initialize everything when DOM is loaded for game.html only
document.addEventListener('DOMContentLoaded', function() {
  // Check if user is logged in
  currentUser = localStorage.getItem('currentUser');
  
  if (!currentUser) {
    // User not logged in, redirect to login page
    window.location.href = 'index.html';
    return;
  }
  
  // Update player name
  const playerName = document.getElementById('player-name');
  if (playerName && currentUser) {
    playerName.textContent = currentUser;
  }
  
  // Show roll panel by default
  showPanel('roll');
  
  // Add event listeners
  addEventListeners();
});

function addEventListeners() {
  // Logout button listener
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
  
  // Navigation event listeners
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const panel = btn.getAttribute('data-panel');
      if (panel) {
        showPanel(panel);
      }
    });
  });
  
  // Game event listeners
  const rollBtn = document.getElementById('roll-btn');
  const paidRollBtn = document.getElementById('paid-roll-btn');
  const megaRollBtn = document.getElementById('mega-roll-btn');
  
  if (rollBtn) rollBtn.addEventListener('click', rollItem);
  if (paidRollBtn) paidRollBtn.addEventListener('click', paidRoll);
  if (megaRollBtn) megaRollBtn.addEventListener('click', megaRoll);
  
  // Inventory event listeners
  const equipBtn = document.getElementById('equip-btn');
  const inspectBtn = document.getElementById('inspect-btn');
  const sellBtn = document.getElementById('sell-btn');
  
  if (equipBtn) equipBtn.addEventListener('click', equipItem);
  if (inspectBtn) inspectBtn.addEventListener('click', inspectItem);
  if (sellBtn) sellBtn.addEventListener('click', sellItem);
  
  // Banner event listeners
  document.querySelectorAll('.banner-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const banner = btn.getAttribute('data-banner');
      if (banner) {
        switchBanner(banner);
      }
    });
  });
  
  // Trade tab listeners
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = btn.getAttribute('data-tab');
      if (tab) {
        switchTradeTab(tab);
      }
    });
  });
  
  // Shop category listeners
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const category = btn.getAttribute('data-category');
      if (category) {
        switchShopCategory(category);
      }
    });
  });
  
  // Character filter listeners
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const filter = btn.getAttribute('data-filter');
      if (filter) {
        filterCharacters(filter);
      }
    });
  });
  
  // Modal close buttons
  document.querySelectorAll('button[id^="close-"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const modal = btn.closest('.modal-backdrop');
      if (modal) modal.style.display = 'none';
    });
  });
  
}