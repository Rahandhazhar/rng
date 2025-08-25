const items = [
  {name: "Fire Aura", rarity: "legendary", chance: 0.01},
  {name: "Water Aura", rarity: "epic", chance: 0.1},
  {name: "Wind Aura", rarity: "rare", chance: 1},
  {name: "Earth Aura", rarity: "common", chance: 20},
  {name: "Lightning Sword", rarity: "legendary", chance: 0.005},
  {name: "Shadow Dagger", rarity: "epic", chance: 0.05},
  {name: "Healing Staff", rarity: "rare", chance: 1},
  {name: "Iron Shield", rarity: "common", chance: 20},
  {name: "Cute Pet Dragon", rarity: "legendary", chance: 0.001},
  {name: "Anime Hero Figure", rarity: "epic", chance: 0.05},
  {name: "Mystic Potion", rarity: "rare", chance: 5},
  {name: "Golden Coins", rarity: "common", chance: 50},
];

function rollItem() {
  const rand = Math.random() * 100;
  let cumulative = 0;
  for (let item of items) {
    cumulative += item.chance;
    if (rand <= cumulative) return item;
  }
  return items[items.length-1];
}

function getRarityClass(rarity){
  return `item-${rarity}`;
}
