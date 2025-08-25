const items = [
  {name: "Fire Aura", rarity: "Legendary", chance: 0.01},
  {name: "Water Aura", rarity: "Epic", chance: 0.1},
  {name: "Wind Aura", rarity: "Rare", chance: 1},
  {name: "Earth Aura", rarity: "Common", chance: 20},
  {name: "Lightning Sword", rarity: "Legendary", chance: 0.005},
  {name: "Shadow Dagger", rarity: "Epic", chance: 0.05},
  {name: "Healing Staff", rarity: "Rare", chance: 1},
  {name: "Iron Shield", rarity: "Common", chance: 20},
  {name: "Cute Pet Dragon", rarity: "Legendary", chance: 0.001},
  {name: "Anime Hero Figure", rarity: "Epic", chance: 0.05},
  {name: "Mystic Potion", rarity: "Rare", chance: 5},
  {name: "Golden Coins", rarity: "Common", chance: 50},
];

function rollItem() {
  const rand = Math.random() * 100;
  let cumulative = 0;
  for (let item of items) {
    cumulative += item.chance;
    if (rand <= cumulative) return item;
  }
  return null;
}
