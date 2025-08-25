const items = [
  {name:"Divine Crown",rarity:"legendary",chance:0.001,value:500},
  {name:"Fire Aura",rarity:"legendary",chance:0.005,value:400},
  {name:"Lightning Sword",rarity:"legendary",chance:0.008,value:350},
  {name:"Cute Pet Dragon",rarity:"legendary",chance:0.003,value:600},
  {name:"Mystic Orb",rarity:"legendary",chance:0.006,value:380},
  
  {name:"Water Aura",rarity:"epic",chance:0.08,value:120},
  {name:"Shadow Dagger",rarity:"epic",chance:0.06,value:100},
  {name:"Anime Hero Figure",rarity:"epic",chance:0.05,value:90},
  {name:"Crystal Staff",rarity:"epic",chance:0.07,value:110},
  {name:"Phantom Cloak",rarity:"epic",chance:0.04,value:130},
  {name:"Thunder Gauntlets",rarity:"epic",chance:0.06,value:105},
  
  {name:"Wind Aura",rarity:"rare",chance:2,value:25},
  {name:"Healing Staff",rarity:"rare",chance:1.5,value:30},
  {name:"Mystic Potion",rarity:"rare",chance:3,value:20},
  {name:"Silver Bow",rarity:"rare",chance:2.5,value:28},
  {name:"Magic Ring",rarity:"rare",chance:2.2,value:26},
  {name:"Steel Armor",rarity:"rare",chance:1.8,value:32},
  
  {name:"Earth Aura",rarity:"common",chance:15,value:5},
  {name:"Iron Shield",rarity:"common",chance:18,value:4},
  {name:"Golden Coins",rarity:"common",chance:25,value:3},
  {name:"Health Potion",rarity:"common",chance:20,value:4},
  {name:"Wooden Sword",rarity:"common",chance:22,value:3},
  {name:"Cloth Robe",rarity:"common",chance:16,value:5}
];

const questTemplates = [
  {id:"roll10",name:"Rolling Enthusiast",desc:"Roll 10 times",target:10,reward:50,type:"roll"},
  {id:"collect5rare",name:"Rare Collector",desc:"Collect 5 rare items",target:5,reward:80,type:"collect_rare"},
  {id:"trade3",name:"Social Trader",desc:"Complete 3 trades",target:3,reward:60,type:"trade"},
  {id:"sell10",name:"Merchant",desc:"Sell 10 items",target:10,reward:70,type:"sell"},
  {id:"login",name:"Daily Login",desc:"Login today",target:1,reward:30,type:"login"}
];

const shopItems = [
  {name:"Extra Roll Token",desc:"Get an extra roll",cost:25,type:"consumable",effect:"extra_roll"},
  {name:"Luck Potion",desc:"2x chance for rare+ items (5 rolls)",cost:40,type:"consumable",effect:"luck_boost"},
  {name:"Coin Multiplier",desc:"2x coins from selling (10 sales)",cost:60,type:"consumable",effect:"coin_boost"},
  {name:"Inventory Expansion",desc:"Increase inventory by 10 slots",cost:100,type:"upgrade",effect:"inventory_expand"}
];

let multiplier = 1;
let luckBoostRolls = 0;
let coinBoostSales = 0;

function rollItem(isMega = false){
  let baseChances = [...items];
  
  if(isMega){
    multiplier = 3;
    baseChances = baseChances.map(item => ({
      ...item,
      chance: item.rarity === 'legendary' ? item.chance * 5 : 
              item.rarity === 'epic' ? item.chance * 3 : 
              item.rarity === 'rare' ? item.chance * 2 : item.chance
    }));
  }
  
  if(luckBoostRolls > 0){
    baseChances = baseChances.map(item => ({
      ...item,
      chance: item.rarity !== 'common' ? item.chance * 2 : item.chance
    }));
    luckBoostRolls--;
  }
  
  const rand = Math.random() * 100;
  let cumulative = 0;
  
  for(const it of baseChances){
    cumulative += it.chance;
    if(rand <= cumulative){
      const result = structuredClone(it);
      if(multiplier > 1){
        result.name += " ★".repeat(Math.min(multiplier-1, 3));
        result.value = Math.floor(result.value * multiplier);
      }
      multiplier = 1;
      return result;
    }
  }
  return structuredClone(baseChances[baseChances.length-1]);
}

function getRarityClass(r){
  return `item-${r}`;
}

function generateDailyQuests(user){
  const quests = [];
  const selected = [...questTemplates].sort(() => Math.random() - 0.5).slice(0, 3);
  
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

function updateQuestProgress(user, type, amount = 1){
  if(!user || typeof loadUsers !== "function") return;
  
  const users = loadUsers();
  if(!users[user]) return;
  
  if(!users[user].quests || users[user].questDate !== new Date().toDateString()){
    users[user].quests = generateDailyQuests(user);
    users[user].questDate = new Date().toDateString();
  }
  
  users[user].quests.forEach(quest => {
    if(quest.type === type && !quest.completed){
      quest.progress = Math.min(quest.progress + amount, quest.target);
      if(quest.progress >= quest.target){
        quest.completed = true;
        users[user].coins = (users[user].coins || 0) + quest.reward;
        if(typeof broadcastChat === "function"){
          broadcastChat(`🏆 ${user} completed quest: ${quest.name} (+${quest.reward} coins)`, true);
        }
      }
    }
  });
  
  if(typeof saveUsers === "function") saveUsers(users);
}

function getMarketListings(){
  try {
    return JSON.parse(localStorage.getItem("marketListings") || "[]");
  } catch(e) {
    return [];
  }
}

function saveMarketListings(listings){
  localStorage.setItem("marketListings", JSON.stringify(listings));
}

function listItemOnMarket(seller, item, price){
  const listings = getMarketListings();
  const listing = {
    id: "market_" + Date.now() + "_" + Math.random().toString(36).slice(2,6),
    seller,
    item: structuredClone(item),
    price,
    listedAt: new Date().toISOString()
  };
  listings.push(listing);
  saveMarketListings(listings);
  return listing;
}

function buyFromMarket(listingId, buyer){
  const listings = getMarketListings();
  const index = listings.findIndex(l => l.id === listingId);
  if(index === -1) return {success: false, message: "Listing not found"};
  
  const listing = listings[index];
  if(listing.seller === buyer) return {success: false, message: "Cannot buy your own item"};
  
  const users = typeof loadUsers === "function" ? loadUsers() : {};
  const buyerData = users[buyer];
  if(!buyerData || (buyerData.coins || 0) < listing.price) {
    return {success: false, message: "Not enough coins"};
  }
  
  buyerData.coins = (buyerData.coins || 0) - listing.price;
  buyerData.inventory = buyerData.inventory || [];
  buyerData.inventory.push(listing.item);
  
  const sellerData = users[listing.seller];
  if(sellerData){
    sellerData.coins = (sellerData.coins || 0) + listing.price;
  }
  
  listings.splice(index, 1);
  saveMarketListings(listings);
  if(typeof saveUsers === "function") saveUsers(users);
  
  return {success: true, item: listing.item, price: listing.price};
}

function fuseItems(items){
  if(items.length !== 3) return null;
  
  const rarity = items[0].rarity;
  if(!items.every(item => item.rarity === rarity)) return null;
  
  const rarityOrder = ['common', 'rare', 'epic', 'legendary'];
  const currentIndex = rarityOrder.indexOf(rarity);
  if(currentIndex >= rarityOrder.length - 1) return null;
  
  const nextRarity = rarityOrder[currentIndex + 1];
  const availableItems = items.filter(item => item.rarity === nextRarity);
  
  if(availableItems.length === 0) return null;
  
  return structuredClone(availableItems[Math.floor(Math.random() * availableItems.length)]);
}