

const items = [
  
  {name: "Divine Crown of Eternity", rarity: "legendary", chance: 0.001, value: 1000, effect: "doubles_all_rewards"},
  {name: "Dragon's Heart Crystal", rarity: "legendary", chance: 0.002, value: 800, effect: "fire_aura"},
  {name: "Thunder God's Hammer", rarity: "legendary", chance: 0.003, value: 750, effect: "lightning_strike"},
  {name: "Phoenix Feather Cloak", rarity: "legendary", chance: 0.002, value: 900, effect: "immortality"},
  {name: "Cosmic Void Blade", rarity: "legendary", chance: 0.001, value: 1200, effect: "void_power"},
  {name: "Ancient Dragon Egg", rarity: "legendary", chance: 0.004, value: 600, effect: "pet_companion"},
  {name: "Stellar Nexus Orb", rarity: "legendary", chance: 0.002, value: 850, effect: "cosmic_energy"},
  {name: "Time Warp Crystal", rarity: "legendary", chance: 0.001, value: 1500, effect: "time_manipulation"},
  
  // EPIC ITEMS (Very Rare)
  {name: "Shadow Assassin's Dagger", rarity: "epic", chance: 0.05, value: 200, effect: "stealth_mode"},
  {name: "Crystal Ice Staff", rarity: "epic", chance: 0.06, value: 180, effect: "ice_magic"},
  {name: "Golden Phoenix Armor", rarity: "epic", chance: 0.04, value: 250, effect: "fire_resistance"},
  {name: "Mystic Forest Bow", rarity: "epic", chance: 0.07, value: 160, effect: "nature_power"},
  {name: "Thunder Gauntlets", rarity: "epic", chance: 0.05, value: 190, effect: "electric_boost"},
  {name: "Void Walker Boots", rarity: "epic", chance: 0.03, value: 300, effect: "teleport"},
  {name: "Ocean's Heart Trident", rarity: "epic", chance: 0.06, value: 170, effect: "water_control"},
  {name: "Solar Flare Sword", rarity: "epic", chance: 0.04, value: 220, effect: "light_damage"},
  {name: "Moonlight Serenade", rarity: "epic", chance: 0.05, value: 200, effect: "healing_aura"},
  {name: "Storm Caller's Horn", rarity: "epic", chance: 0.06, value: 180, effect: "weather_control"},
  
  // RARE ITEMS (Uncommon)
  {name: "Wind Dancer's Robe", rarity: "rare", chance: 1.5, value: 45, effect: "wind_boost"},
  {name: "Healing Light Staff", rarity: "rare", chance: 2.0, value: 40, effect: "healing"},
  {name: "Mystic Potion of Luck", rarity: "rare", chance: 2.5, value: 35, effect: "luck_boost"},
  {name: "Silver Moon Bow", rarity: "rare", chance: 1.8, value: 42, effect: "precision"},
  {name: "Magic Ring of Wisdom", rarity: "rare", chance: 2.2, value: 38, effect: "intelligence"},
  {name: "Steel Guardian Armor", rarity: "rare", chance: 1.6, value: 48, effect: "defense"},
  {name: "Fire Essence Gem", rarity: "rare", chance: 2.0, value: 40, effect: "fire_power"},
  {name: "Water Crystal Pendant", rarity: "rare", chance: 1.9, value: 41, effect: "water_power"},
  {name: "Earth Stone Amulet", rarity: "rare", chance: 2.1, value: 39, effect: "earth_power"},
  {name: "Lightning Bolt Charm", rarity: "rare", chance: 1.7, value: 44, effect: "lightning_power"},
  
  // COMMON ITEMS (Common)
  {name: "Iron Warrior's Sword", rarity: "common", chance: 12, value: 8, effect: "basic_attack"},
  {name: "Wooden Guardian Shield", rarity: "common", chance: 15, value: 6, effect: "basic_defense"},
  {name: "Golden Treasure Coins", rarity: "common", chance: 18, value: 5, effect: "wealth"},
  {name: "Healing Herb Potion", rarity: "common", chance: 14, value: 7, effect: "minor_healing"},
  {name: "Leather Traveler's Boots", rarity: "common", chance: 16, value: 6, effect: "movement"},
  {name: "Cotton Mage's Robe", rarity: "common", chance: 13, value: 8, effect: "magic_boost"},
  {name: "Stone Miner's Pickaxe", rarity: "common", chance: 17, value: 5, effect: "mining"},
  {name: "Copper Merchant's Scale", rarity: "common", chance: 11, value: 9, effect: "trading"},
  {name: "Bamboo Archer's Bow", rarity: "common", chance: 14, value: 7, effect: "ranged_attack"},
  {name: "Wool Shepherd's Staff", rarity: "common", chance: 12, value: 8, effect: "guidance"}
];

// Special Event Items (Seasonal/Holiday)
const seasonalItems = [
  {name: "Halloween Pumpkin Crown", rarity: "legendary", chance: 0.005, value: 500, effect: "spooky_power", seasonal: "halloween"},
  {name: "Christmas Star Ornament", rarity: "epic", chance: 0.1, value: 150, effect: "holiday_cheer", seasonal: "christmas"},
  {name: "Valentine's Heart Crystal", rarity: "rare", chance: 1.0, value: 50, effect: "love_power", seasonal: "valentine"},
  {name: "Easter Bunny Ears", rarity: "common", chance: 8, value: 12, effect: "spring_joy", seasonal: "easter"}
];

// Mystery Box Items
const mysteryBoxItems = [
  {name: "Mystery Box - Common", rarity: "mystery", chance: 5, value: 20, effect: "random_common"},
  {name: "Mystery Box - Rare", rarity: "mystery", chance: 2, value: 50, effect: "random_rare"},
  {name: "Mystery Box - Epic", rarity: "mystery", chance: 0.5, value: 150, effect: "random_epic"},
  {name: "Mystery Box - Legendary", rarity: "mystery", chance: 0.1, value: 500, effect: "random_legendary"}
];

// Quest Templates with More Variety
const questTemplates = [
  {id: "roll10", name: "Rolling Enthusiast", desc: "Roll 10 times", target: 10, reward: 50, type: "roll"},
  {id: "roll50", name: "Rolling Master", desc: "Roll 50 times", target: 50, reward: 200, type: "roll"},
  {id: "roll100", name: "Rolling Legend", desc: "Roll 100 times", target: 100, reward: 500, type: "roll"},
  {id: "collect5rare", name: "Rare Collector", desc: "Collect 5 rare items", target: 5, reward: 80, type: "collect_rare"},
  {id: "collect10rare", name: "Rare Hunter", desc: "Collect 10 rare items", target: 10, reward: 150, type: "collect_rare"},
  {id: "collect3epic", name: "Epic Seeker", desc: "Collect 3 epic items", target: 3, reward: 120, type: "collect_epic"},
  {id: "collect1legendary", name: "Legendary Finder", desc: "Collect 1 legendary item", target: 1, reward: 300, type: "collect_legendary"},
  {id: "trade3", name: "Social Trader", desc: "Complete 3 trades", target: 3, reward: 60, type: "trade"},
  {id: "trade10", name: "Trade Master", desc: "Complete 10 trades", target: 10, reward: 150, type: "trade"},
  {id: "sell10", name: "Merchant", desc: "Sell 10 items", target: 10, reward: 70, type: "sell"},
  {id: "sell50", name: "Trade Baron", desc: "Sell 50 items", target: 50, reward: 250, type: "sell"},
  {id: "login", name: "Daily Login", desc: "Login today", target: 1, reward: 30, type: "login"},
  {id: "login7", name: "Weekly Warrior", desc: "Login 7 days in a row", target: 7, reward: 200, type: "login_streak"},
  {id: "fuse3", name: "Fusion Artist", desc: "Fuse items 3 times", target: 3, reward: 100, type: "fuse"},
  {id: "buy5", name: "Market Investor", desc: "Buy 5 items from market", target: 5, reward: 80, type: "market_buy"},
  {id: "sell_market5", name: "Market Seller", desc: "Sell 5 items on market", target: 5, reward: 90, type: "market_sell"}
];

// Enhanced Shop Items
const shopItems = [
  {name: "Extra Roll Token", desc: "Get an extra roll", cost: 25, type: "consumable", effect: "extra_roll"},
  {name: "Luck Potion", desc: "3x chance for rare+ items (5 rolls)", cost: 50, type: "consumable", effect: "luck_boost"},
  {name: "Coin Multiplier", desc: "3x coins from selling (10 sales)", cost: 80, type: "consumable", effect: "coin_boost"},
  {name: "Inventory Expansion", desc: "Increase inventory by 10 slots", cost: 100, type: "upgrade", effect: "inventory_expand"},
  {name: "Mystery Box", desc: "Random item of any rarity", cost: 75, type: "consumable", effect: "mystery_box"},
  {name: "Reroll Token", desc: "Reroll your last item", cost: 40, type: "consumable", effect: "reroll"},
  {name: "XP Booster", desc: "2x XP for 1 hour", cost: 60, type: "consumable", effect: "xp_boost"},
  {name: "Rarity Booster", desc: "Guaranteed rare+ item on next roll", cost: 120, type: "consumable", effect: "rarity_boost"},
  {name: "Trade Slot Unlock", desc: "Unlock additional trade slots", cost: 150, type: "upgrade", effect: "trade_slots"},
  {name: "Auto-Sell Common", desc: "Automatically sell common items", cost: 200, type: "upgrade", effect: "auto_sell"}
];

// Global Variables
let multiplier = 1;
let luckBoostRolls = 0;
let coinBoostSales = 0;
let xpBoostActive = false;
let rarityBoostActive = false;
let autoSellCommon = false;
let tradeSlots = 1;
let loginStreak = 0;
let lastLoginDate = null;

// Enhanced RNG Functions
function getCurrentSeason() {
  const month = new Date().getMonth();
  const day = new Date().getDate();
  
  if (month === 9 && day >= 15 || month === 10 && day <= 15) return "halloween";
  if (month === 11 && day >= 15 || month === 0 && day <= 15) return "christmas";
  if (month === 1 && day >= 10 && day <= 20) return "valentine";
  if (month === 2 && day >= 20 || month === 3 && day <= 10) return "easter";
  
  return null;
}

function rollItem(isMega = false, isMystery = false) {
  let baseChances = [...items];
  let currentSeason = getCurrentSeason();
  
  // Add seasonal items if applicable
  if (currentSeason) {
    const seasonal = seasonalItems.filter(item => item.seasonal === currentSeason);
    baseChances = baseChances.concat(seasonal);
  }
  
  // Add mystery box items if mystery roll
  if (isMystery) {
    baseChances = baseChances.concat(mysteryBoxItems);
  }
  
  // Apply mega roll bonuses
  if (isMega) {
    multiplier = 3;
    baseChances = baseChances.map(item => ({
      ...item,
      chance: item.rarity === 'legendary' ? item.chance * 6 : 
              item.rarity === 'epic' ? item.chance * 4 : 
              item.rarity === 'rare' ? item.chance * 2.5 : item.chance
    }));
  }
  
  // Apply luck boost
  if (luckBoostRolls > 0) {
    baseChances = baseChances.map(item => ({
      ...item,
      chance: item.rarity !== 'common' ? item.chance * 3 : item.chance
    }));
    luckBoostRolls--;
  }
  
  // Apply rarity boost
  if (rarityBoostActive) {
    baseChances = baseChances.map(item => ({
      ...item,
      chance: item.rarity === 'common' ? 0 : item.chance * 2
    }));
    rarityBoostActive = false;
  }
  
  // Calculate total chance
  const totalChance = baseChances.reduce((sum, item) => sum + item.chance, 0);
  const rand = Math.random() * totalChance;
  let cumulative = 0;
  
  for (const item of baseChances) {
    cumulative += item.chance;
    if (rand <= cumulative) {
      const result = structuredClone(item);
      
      // Apply multiplier effects
      if (multiplier > 1) {
        result.name += " ★".repeat(Math.min(multiplier - 1, 3));
        result.value = Math.floor(result.value * multiplier);
      }
      
      // Add special effects
      if (result.effect) {
        result.specialEffect = result.effect;
      }
      
      multiplier = 1;
      return result;
    }
  }
  
  // Fallback to common item
  return structuredClone(baseChances.find(item => item.rarity === 'common'));
}

function openMysteryBox(rarity) {
  const rarityMap = {
    'common': items.filter(item => item.rarity === 'common'),
    'rare': items.filter(item => item.rarity === 'rare'),
    'epic': items.filter(item => item.rarity === 'epic'),
    'legendary': items.filter(item => item.rarity === 'legendary')
  };
  
  const possibleItems = rarityMap[rarity] || items;
  return structuredClone(possibleItems[Math.floor(Math.random() * possibleItems.length)]);
}

function getRarityClass(rarity) {
  return `item-${rarity}`;
}

function generateDailyQuests(user) {
  const quests = [];
  const selected = [...questTemplates].sort(() => Math.random() - 0.5).slice(0, 4);
  
  selected.forEach(template => {
    quests.push({
      ...template,
      progress: 0,
      completed: false,
      date: new Date().toDateString()
    });
  });
  
  return quests;
}

function updateQuestProgress(user, type, amount = 1) {
  if (!user || typeof loadUsers !== "function") return;
  
  const users = loadUsers();
  if (!users[user]) return;
  
  if (!users[user].quests || users[user].questDate !== new Date().toDateString()) {
    users[user].quests = generateDailyQuests(user);
    users[user].questDate = new Date().toDateString();
  }
  
  users[user].quests.forEach(quest => {
    if (quest.type === type && !quest.completed) {
      quest.progress = Math.min(quest.progress + amount, quest.target);
      if (quest.progress >= quest.target) {
        quest.completed = true;
        users[user].coins = (users[user].coins || 0) + quest.reward;
        if (typeof broadcastChat === "function") {
          broadcastChat(`🏆 ${user} completed quest: ${quest.name} (+${quest.reward} coins)`, true);
        }
      }
    }
  });
  
  if (typeof saveUsers === "function") saveUsers(users);
}

// Market Functions
function getMarketListings() {
  try {
    return JSON.parse(localStorage.getItem("marketListings") || "[]");
  } catch (e) {
    return [];
  }
}

function saveMarketListings(listings) {
  localStorage.setItem("marketListings", JSON.stringify(listings));
}

function listItemOnMarket(seller, item, price) {
  const listings = getMarketListings();
  const listing = {
    id: "market_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
    seller,
    item: structuredClone(item),
    price,
    listedAt: new Date().toISOString()
  };
  listings.push(listing);
  saveMarketListings(listings);
  return listing;
}

function buyFromMarket(listingId, buyer) {
  const listings = getMarketListings();
  const index = listings.findIndex(l => l.id === listingId);
  if (index === -1) return { success: false, message: "Listing not found" };
  
  const listing = listings[index];
  if (listing.seller === buyer) return { success: false, message: "Cannot buy your own item" };
  
  const users = typeof loadUsers === "function" ? loadUsers() : {};
  const buyerData = users[buyer];
  if (!buyerData || (buyerData.coins || 0) < listing.price) {
    return { success: false, message: "Not enough coins" };
  }
  
  buyerData.coins = (buyerData.coins || 0) - listing.price;
  buyerData.inventory = buyerData.inventory || [];
  buyerData.inventory.push(listing.item);
  
  const sellerData = users[listing.seller];
  if (sellerData) {
    sellerData.coins = (sellerData.coins || 0) + listing.price;
  }
  
  listings.splice(index, 1);
  saveMarketListings(listings);
  if (typeof saveUsers === "function") saveUsers(users);
  
  return { success: true, item: listing.item, price: listing.price };
}

// Enhanced Fusion System
function fuseItems(items) {
  if (items.length !== 3) return null;
  
  const rarity = items[0].rarity;
  if (!items.every(item => item.rarity === rarity)) return null;
  
  const rarityOrder = ['common', 'rare', 'epic', 'legendary'];
  const currentIndex = rarityOrder.indexOf(rarity);
  if (currentIndex >= rarityOrder.length - 1) return null;
  
  const nextRarity = rarityOrder[currentIndex + 1];
  const availableItems = items.filter(item => item.rarity === nextRarity);
  
  if (availableItems.length === 0) return null;
  
  const result = structuredClone(availableItems[Math.floor(Math.random() * availableItems.length)]);
  
  // Add fusion bonus
  result.name = "Fused " + result.name;
  result.value = Math.floor(result.value * 1.5);
  
  return result;
}

// Login Streak System
function updateLoginStreak(user) {
  const users = loadUsers();
  if (!users[user]) return;
  
  const today = new Date().toDateString();
  const lastLogin = users[user].lastLoginDate;
  
  if (lastLogin === today) return; // Already logged in today
  
  if (lastLogin === new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()) {
    // Consecutive day
    users[user].loginStreak = (users[user].loginStreak || 0) + 1;
  } else {
    // Break in streak
    users[user].loginStreak = 1;
  }
  
  users[user].lastLoginDate = today;
  
  // Streak rewards
  const streak = users[user].loginStreak;
  if (streak >= 7) {
    users[user].coins = (users[user].coins || 0) + 100;
    if (typeof broadcastChat === "function") {
      broadcastChat(`🔥 ${user} has a ${streak}-day login streak! (+100 coins)`, true);
    }
  }
  
  saveUsers(users);
}

// Special Effects System
function applyItemEffect(item, user) {
  if (!item.effect) return;
  
  const users = loadUsers();
  if (!users[user]) return;
  
  switch (item.effect) {
    case "doubles_all_rewards":
      users[user].doubleRewards = true;
      break;
    case "fire_aura":
      users[user].fireAura = true;
      break;
    case "lightning_strike":
      users[user].lightningStrike = true;
      break;
    case "immortality":
      users[user].immortality = true;
      break;
    case "void_power":
      users[user].voidPower = true;
      break;
    case "pet_companion":
      users[user].petCompanion = true;
      break;
    case "cosmic_energy":
      users[user].cosmicEnergy = true;
      break;
    case "time_manipulation":
      users[user].timeManipulation = true;
      break;
  }
  
  saveUsers(users);
}

// Enhanced RNG System with Anime Integration
function rollItem() {
  // Get active effects for luck boost
  const currentUser = localStorage.getItem('currentUser');
  const users = loadUsers();
  const user = users[currentUser];
  let luckBoost = 0;
  
  if (user && user.activeEffects) {
    const activeEffects = window.ANIME_BANNERS.getActiveEffects(user);
    for (let [potionId, effect] of Object.entries(activeEffects)) {
      if (potionId.startsWith('luck_boost_') && effect.boost) {
        luckBoost += effect.boost;
      }
    }
  }

  // Combine regular items with anime characters
  const allItems = [...items, ...window.ANIME_BANNERS.characters];
  
  // Apply luck boost to legendary chances
  const adjustedItems = allItems.map(item => {
    if (item.rarity === 'legendary') {
      return { ...item, chance: item.chance + luckBoost };
    }
    return item;
  });

  const totalChance = adjustedItems.reduce((sum, item) => sum + item.chance, 0);
  let random = Math.random() * totalChance;
  
  for (let item of adjustedItems) {
    random -= item.chance;
    if (random <= 0) {
      return { ...item };
    }
  }
  
  return adjustedItems[0]; // Fallback
}

// Enhanced Shop Items with Potions
const enhancedShopItems = [
  ...shopItems,
  ...window.ANIME_BANNERS.potions.map(potion => ({
    ...potion,
    type: 'potion',
    description: potion.effect
  }))
];

// Boss Battle System
function generateBossBattle() {
  return window.ANIME_BANNERS.getRandomBoss();
}

function calculateBossBattleResult(playerSquad, boss) {
  let playerPower = 0;
  
  playerSquad.forEach(char => {
    let charPower = char.power;
    if (char.equippedAura) {
      charPower += char.equippedAura.power;
    }
    playerPower += charPower;
  });
  
  // Boss is much stronger
  const bossPower = boss.power * 1.5;
  const playerRoll = Math.random() * 30 - 15;
  
  playerPower += playerRoll;
  
  return {
    playerPower: Math.max(0, playerPower),
    bossPower: bossPower,
    playerWins: playerPower > bossPower,
    reward: playerPower > bossPower ? boss.reward : 0,
    xpReward: playerPower > bossPower ? boss.xpReward : 0
  };
}

// Enhanced AI Squad Generation
function generateAISquad() {
  return window.ANIME_BANNERS.generateAISquad();
}

function calculateBattleResult(playerSquad, aiSquad) {
  return window.ANIME_BANNERS.calculateBattleResult(playerSquad, aiSquad);
}

// Potion Management
function applyPotionEffect(potionId, user) {
  return window.ANIME_BANNERS.applyPotionEffect(potionId, user);
}

function getActiveEffects(user) {
  return window.ANIME_BANNERS.getActiveEffects(user);
}

function cleanupExpiredEffects(user) {
  return window.ANIME_BANNERS.cleanupExpiredEffects(user);
}

// Export functions for use in other files
window.RNG = {
  rollItem,
  openMysteryBox,
  getRarityClass,
  generateDailyQuests,
  updateQuestProgress,
  getMarketListings,
  saveMarketListings,
  listItemOnMarket,
  buyFromMarket,
  fuseItems,
  updateLoginStreak,
  applyItemEffect,
  getCurrentSeason,
  generateAISquad,
  calculateBattleResult,
  generateBossBattle,
  calculateBossBattleResult,
  applyPotionEffect,
  getActiveEffects,
  cleanupExpiredEffects,
  items,
  seasonalItems,
  mysteryBoxItems,
  enhancedShopItems,
  questTemplates
};