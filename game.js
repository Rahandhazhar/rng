const loginBtn=document.getElementById("login-btn");
const registerBtn=document.getElementById("register-btn");
const logoutBtn=document.getElementById("logout-btn");
const authContainer=document.getElementById("auth-container");
const gameContainer=document.getElementById("game-container");
const playerNameDisplay=document.getElementById("player-name");
const authMessage=document.getElementById("auth-message");
const rollBtn=document.getElementById("roll-btn");
const megaRollBtn=document.getElementById("mega-roll-btn");
const rollResult=document.getElementById("roll-result");
const slotReel=document.getElementById("slot-reel");
const multiplierDisplay=document.getElementById("multiplier-display");
const inventoryList=document.getElementById("inventory-list");
const inventoryCount=document.getElementById("inventory-count");
const inventoryFilter=document.getElementById("inventory-filter");
const equipBtn=document.getElementById("equip-btn");
const inspectBtn=document.getElementById("inspect-btn");
const sellBtn=document.getElementById("sell-btn");
const fusionBtn=document.getElementById("fusion-btn");
const equipName=document.getElementById("equip-name");
const levelDisplay=document.getElementById("level-display");
const xpDisplay=document.getElementById("xp-display");
const coinsDisplay=document.getElementById("coins-display");
const tradeUserSelect=document.getElementById("trade-user");
const refreshUsersBtn=document.getElementById("refresh-users");
const tradeInventoryList=document.getElementById("trade-inventory");
const sendTradeBtn=document.getElementById("send-trade");
const requestTradeBtn=document.getElementById("request-trade");
const tradeMessage=document.getElementById("trade-message");
const chatBox=document.getElementById("chat-box");
const chatInput=document.getElementById("chat-input");
const sendChat=document.getElementById("send-chat");
const shopBtn=document.getElementById("btn-shop");
const dailyBtn=document.getElementById("btn-daily");
const questsBtn=document.getElementById("btn-quests");

let currentUser=null;
let selectedFusionItems = [];

function loadUsers(){return JSON.parse(localStorage.getItem("users")||"{}");}
function saveUsers(u){localStorage.setItem("users",JSON.stringify(u));}
function getInventory(u){return loadUsers()[u]?.inventory||[];}
function saveInventory(u,inv){let uobj=loadUsers();if(!uobj[u])uobj[u]={};uobj[u].inventory=inv;saveUsers(uobj);}
function setEquipped(u,item){let uobj=loadUsers();if(!uobj[u])uobj[u]={};uobj[u].equipped=item;saveUsers(uobj);}
function getEquipped(u){return loadUsers()[u]?.equipped||null;}

function ensureUserStats(username){
  const users = loadUsers();
  if(!users[username]) users[username] = {};
  const user = users[username];
  if(typeof user.level !== 'number') user.level = 1;
  if(typeof user.xp !== 'number') user.xp = 0;
  if(typeof user.coins !== 'number') user.coins = 100;
  if(typeof user.maxInventory !== 'number') user.maxInventory = 50;
  if(!user.inventory) user.inventory = [];
  if(!user.consumables) user.consumables = {};
  saveUsers(users);
  return user;
}

function updateDisplays(){
  if(!currentUser) return;
  const user = ensureUserStats(currentUser);
  levelDisplay.textContent = user.level;
  xpDisplay.textContent = user.xp;
  coinsDisplay.textContent = user.coins;
  
  const inv = getInventory(currentUser);
  inventoryCount.textContent = `(${inv.length}/${user.maxInventory})`;
  
  const eq = getEquipped(currentUser);
  equipName.textContent = eq ? `${eq.name} (${eq.rarity})` : "None";
}

function makeListItem(item,index){
  const li=document.createElement("li");
  li.dataset.index=index;
  li.className=getRarityClass(item.rarity);
  const badge=document.createElement("span");
  badge.className="badge";
  li.appendChild(badge);
  const name=document.createElement("div");
  name.textContent=item.name;
  name.style.fontWeight="700";
  li.appendChild(name);
  const value=document.createElement("div");
  value.className="rarity-label";
  value.textContent=`${item.rarity.toUpperCase()} (${item.value}g)`;
  li.appendChild(value);
  li.addEventListener("click",()=>{
    const list=li.parentElement;
    list.querySelectorAll("li").forEach(x=>x.classList.remove("selected"));
    li.classList.add("selected");
  });
  return li;
}

function displayInventory(){
  inventoryList.innerHTML="";
  const inv=getInventory(currentUser);
  inv.forEach((it,idx)=>inventoryList.appendChild(makeListItem(it,idx)));
  updateDisplays();
  populateTradeInventory();
  applyInventoryFilter();
}

function applyInventoryFilter(){
  const query = inventoryFilter.value.toLowerCase();
  document.querySelectorAll("#inventory-list li").forEach(li=>{
    const text = li.textContent.toLowerCase();
    li.style.display = query ? (text.includes(query) ? "" : "none") : "";
  });
}

function populateTradeUsers(){
  tradeUserSelect.innerHTML="";
  const u=loadUsers();
  Object.keys(u).forEach(name=>{
    if(name!==currentUser){
      const opt=document.createElement("option");
      opt.value=name;
      opt.textContent=name;
      tradeUserSelect.appendChild(opt);
    }
  });
  populateTradeInventory();
}

function populateTradeInventory(){
  tradeInventoryList.innerHTML="";
  const inv=getInventory(currentUser);
  inv.forEach((it,idx)=>tradeInventoryList.appendChild(makeListItem(it,idx)));
}

function broadcastChat(msg,issystem=false){
  const p=document.createElement("div");
  p.className="chat-message "+(issystem?"system":"msg-user");
  const time=document.createElement("span");
  time.className="msg-time";
  const d=new Date();
  time.textContent=` ${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}`;
  p.textContent=msg;
  p.appendChild(time);
  chatBox.appendChild(p);
  chatBox.scrollTop=chatBox.scrollHeight;
}

function awardXP(amount){
  if(!currentUser) return;
  const users = loadUsers();
  const user = users[currentUser];
  user.xp = (user.xp || 0) + amount;
  
  const xpNeeded = user.level * 100;
  if(user.xp >= xpNeeded){
    user.xp -= xpNeeded;
    user.level++;
    user.coins = (user.coins || 0) + user.level * 10;
    broadcastChat(`🌟 ${currentUser} leveled up to ${user.level}! (+${user.level * 10} coins)`, true);
    showLevelUpEffect();
  }
  
  saveUsers(users);
  updateDisplays();
}

function showLevelUpEffect(){
  const badge = document.createElement("div");
  badge.className = "level-up-badge";
  badge.textContent = `Level Up!`;
  document.getElementById("top-bar").appendChild(badge);
  setTimeout(() => badge.remove(), 2000);
}

registerBtn.addEventListener("click",()=>{
  const u=document.getElementById("username").value.trim();
  const p=document.getElementById("password").value.trim();
  if(!u||!p){authMessage.textContent="Fill both fields";return;}
  const users=loadUsers();
  if(users[u]){authMessage.textContent="User exists";return;}
  users[u]={password:p,inventory:[],equipped:null,level:1,xp:0,coins:100,maxInventory:50};
  saveUsers(users);
  authMessage.textContent="Registered successfully!";
  populateTradeUsers();
});

loginBtn.addEventListener("click",()=>{
  const u=document.getElementById("username").value.trim();
  const p=document.getElementById("password").value.trim();
  const users=loadUsers();
  if(users[u]&&users[u].password===p){
    currentUser=u;
    ensureUserStats(currentUser);
    authContainer.style.display="none";
    gameContainer.style.display="block";
    playerNameDisplay.textContent=currentUser;
    displayInventory();
    populateTradeUsers();
    updateQuestProgress(currentUser, "login");
    broadcastChat(`${currentUser} entered the realm`,true);
    updateDisplays();
  } else {
    authMessage.textContent="Invalid credentials";
  }
});

logoutBtn.addEventListener("click",()=>{
  broadcastChat(`${currentUser} left the realm`,true);
  currentUser=null;
  authContainer.style.display="block";
  gameContainer.style.display="none";
  document.getElementById("username").value="";
  document.getElementById("password").value="";
});

function seedReel(finalName){
  slotReel.innerHTML="";
  const pool=[];
  for(let i=0;i<30;i++){
    const pick=items[Math.floor(Math.random()*items.length)];
    pool.push(pick);
  }
  const finalIndex=pool.length-1;
  pool[finalIndex]=finalName;
  pool.forEach((it,idx)=>{
    const div=document.createElement("div");
    div.className="slot-item";
    if(idx === finalIndex){
      div.classList.add(it.rarity);
    }
    div.textContent=typeof it==="string"?it:it.name;
    slotReel.appendChild(div);
  });
  slotReel.style.transform="translateY(0)";
  return pool.length;
}

function animateReel(finalItem){
  const steps=seedReel(finalItem.name);
  let pos=0;
  let speed=18+Math.random()*6;
  const itemHeight=48;
  const decel=0.985;
  return new Promise(resolve=>{
    const tick=()=>{
      pos+=speed;
      if(speed>0.35) speed*=decel;
      slotReel.style.transform=`translateY(${-pos}px)`;
      if(pos>=(steps-4)*itemHeight && speed<=0.6){
        const overshoot=(Math.random()*6);
        slotReel.style.transform=`translateY(${-(steps-1)*itemHeight - overshoot}px)`;
        setTimeout(()=>{resolve();},420);
      } else {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  });
}

rollBtn.addEventListener("click",async()=>{
  if(!currentUser) return;
  const user = ensureUserStats(currentUser);
  if(user.coins < 10){
    rollResult.textContent="Not enough coins!";
    return;
  }
  
  rollBtn.disabled=true;
  rollResult.textContent="Spinning...";
  multiplierDisplay.textContent="1x";
  
  user.coins -= 10;
  const final=rollItem();
  await animateReel(final);
  
  rollResult.innerHTML=`You got <span class="${getRarityClass(final.rarity)}">${final.name}</span>!`;
  
  const inv=getInventory(currentUser);
  if(inv.length >= user.maxInventory){
    rollResult.textContent="Inventory full! Sell items to make space.";
    rollBtn.disabled=false;
    return;
  }
  
  inv.push(final);
  saveInventory(currentUser,inv);
  
  if(final.rarity === 'rare') updateQuestProgress(currentUser, "collect_rare");
  updateQuestProgress(currentUser, "roll");
  
  awardXP(final.rarity === 'legendary' ? 25 : final.rarity === 'epic' ? 15 : final.rarity === 'rare' ? 10 : 5);
  
  displayInventory();
  broadcastChat(`${currentUser} rolled ${final.name} (${final.rarity})`,true);
  
  const users = loadUsers();
  users[currentUser] = user;
  saveUsers(users);
  
  rollBtn.disabled=false;
});

megaRollBtn.addEventListener("click",async()=>{
  if(!currentUser) return;
  const user = ensureUserStats(currentUser);
  if(user.coins < 50){
    rollResult.textContent="Not enough coins for Mega Roll!";
    return;
  }
  
  megaRollBtn.disabled=true;
  rollResult.textContent="MEGA SPINNING...";
  multiplierDisplay.textContent="3x";
  
  user.coins -= 50;
  const final=rollItem(true);
  await animateReel(final);
  
  rollResult.innerHTML=`MEGA ROLL: <span class="${getRarityClass(final.rarity)}">${final.name}</span>!`;
  
  const inv=getInventory(currentUser);
  if(inv.length >= user.maxInventory){
    rollResult.textContent="Inventory full! Sell items to make space.";
    megaRollBtn.disabled=false;
    return;
  }
  
  inv.push(final);
  saveInventory(currentUser,inv);
  
  if(final.rarity === 'rare') updateQuestProgress(currentUser, "collect_rare");
  updateQuestProgress(currentUser, "roll");
  
  awardXP(final.rarity === 'legendary' ? 50 : final.rarity === 'epic' ? 30 : final.rarity === 'rare' ? 20 : 10);
  
  displayInventory();
  broadcastChat(`${currentUser} MEGA rolled ${final.name} (${final.rarity})`,true);
  
  const users = loadUsers();
  users[currentUser] = user;
  saveUsers(users);
  
  megaRollBtn.disabled=false;
});

equipBtn.addEventListener("click",()=>{
  const sel=inventoryList.querySelector("li.selected");
  if(!sel) return;
  const idx=Number(sel.dataset.index);
  const item=getInventory(currentUser)[idx];
  setEquipped(currentUser,item);
  displayInventory();
  broadcastChat(`${currentUser} equipped ${item.name}`,true);
});

inspectBtn.addEventListener("click",()=>{
  const sel=inventoryList.querySelector("li.selected");
  if(!sel) return;
  const idx=Number(sel.dataset.index);
  const item=getInventory(currentUser)[idx];
  const msg=`${item.name} — Rarity: ${item.rarity}, Value: ${item.value} coins`;
  tradeMessage.textContent=msg;
});

sellBtn.addEventListener("click",()=>{
  const sel=inventoryList.querySelector("li.selected");
  if(!sel) return;
  const idx=Number(sel.dataset.index);
  const inv=getInventory(currentUser);
  const item=inv[idx];
  
  let sellValue = item.value;
  if(coinBoostSales > 0){
    sellValue *= 2;
    coinBoostSales--;
  }
  
  const users = loadUsers();
  users[currentUser].coins = (users[currentUser].coins || 0) + sellValue;
  
  inv.splice(idx, 1);
  saveInventory(currentUser, inv);
  saveUsers(users);
  
  updateQuestProgress(currentUser, "sell");
  displayInventory();
  broadcastChat(`${currentUser} sold ${item.name} for ${sellValue} coins`,true);
  tradeMessage.textContent=`Sold ${item.name} for ${sellValue} coins`;
});

inventoryFilter.addEventListener("input", applyInventoryFilter);

refreshUsersBtn.addEventListener("click",populateTradeUsers);

sendTradeBtn.addEventListener("click",()=>{
  const sel=tradeInventoryList.querySelector("li.selected");
  const target=tradeUserSelect.value;
  if(!sel || !target){
    tradeMessage.textContent="Pick a target user and an item";
    return;
  }
  const idx=Number(sel.dataset.index);
  const users=loadUsers();
  const item=getInventory(currentUser)[idx];
  if(!users[target].inventory) users[target].inventory=[];
  users[target].inventory.push(item);
  let inv=getInventory(currentUser);
  inv.splice(idx,1);
  saveInventory(currentUser,inv);
  saveUsers(users);
  updateQuestProgress(currentUser, "trade");
  displayInventory();
  broadcastChat(`${currentUser} sent ${item.name} to ${target}`,true);
  tradeMessage.textContent=`Sent ${item.name} to ${target}`;
});

sendChat.addEventListener("click",()=>{
  const txt=chatInput.value.trim();
  if(!txt) return;
  broadcastChat(`${currentUser}: ${txt}`,false);
  chatInput.value="";
});

chatInput.addEventListener("keypress", (e) => {
  if(e.key === "Enter") sendChat.click();
});

document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const tab = btn.dataset.tab;
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(`${tab}-trade`).classList.add("active");
    
    if(tab === "market") displayMarketListings();
  });
});

function displayMarketListings(){
  const container = document.getElementById("market-listings");
  const listings = getMarketListings();
  container.innerHTML = "";
  
  if(listings.length === 0){
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

window.buyMarketItem = function(listingId){
  const result = buyFromMarket(listingId, currentUser);
  if(result.success){
    displayInventory();
    displayMarketListings();
    broadcastChat(`${currentUser} bought ${result.item.name} for ${result.price} coins from market`, true);
    tradeMessage.textContent = `Bought ${result.item.name} for ${result.price} coins`;
  } else {
    tradeMessage.textContent = result.message;
  }
};

document.getElementById("list-item").addEventListener("click", () => {
  const sel = tradeInventoryList.querySelector("li.selected");
  const priceInput = document.getElementById("list-price");
  const price = parseInt(priceInput.value);
  
  if(!sel || !price || price < 1){
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

dailyBtn.addEventListener("click", () => {
  const users = loadUsers();
  const user = users[currentUser];
  const today = new Date().toDateString();
  
  if(user.lastDaily === today){
    alert("You already claimed your daily reward today!");
    return;
  }
  
  user.lastDaily = today;
  user.coins = (user.coins || 0) + 50;
  
  const commonItem = items.find(item => item.rarity === 'common');
  if(commonItem && user.inventory.length < user.maxInventory){
    user.inventory.push(structuredClone(commonItem));
  }
  
  saveUsers(users);
  displayInventory();
  broadcastChat(`${currentUser} claimed daily reward: +50 coins & ${commonItem ? commonItem.name : 'bonus item'}`, true);
  dailyBtn.textContent = "Claimed ✓";
  setTimeout(() => dailyBtn.textContent = "Claim Daily", 2000);
});

questsBtn.addEventListener("click", () => {
  document.getElementById("quests-modal").style.display = "flex";
  displayQuests();
});

document.getElementById("close-quests").addEventListener("click", () => {
  document.getElementById("quests-modal").style.display = "none";
});

function displayQuests(){
  const container = document.getElementById("quest-list");
  const users = loadUsers();
  const user = users[currentUser];
  
  if(!user.quests || user.questDate !== new Date().toDateString()){
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

shopBtn.addEventListener("click", () => {
  document.getElementById("shop-modal").style.display = "flex";
  displayShop();
});

document.getElementById("close-shop").addEventListener("click", () => {
  document.getElementById("shop-modal").style.display = "none";
});

function displayShop(){
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

window.buyShopItem = function(effect, cost, name){
  const users = loadUsers();
  const user = users[currentUser];
  
  if(user.coins < cost){
    alert("Not enough coins!");
    return;
  }
  
  user.coins -= cost;
  
  switch(effect){
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
  }
  
  saveUsers(users);
  updateDisplays();
  broadcastChat(`${currentUser} bought ${name} from shop`, true);
  displayShop();
};

fusionBtn.addEventListener("click", () => {
  document.getElementById("fusion-modal").style.display = "flex";
  displayFusionSlots();
});

document.getElementById("fusion-cancel").addEventListener("click", () => {
  document.getElementById("fusion-modal").style.display = "none";
  selectedFusionItems = [];
});

function displayFusionSlots(){
  const container = document.getElementById("fusion-slots");
  container.innerHTML = "";
  
  for(let i = 0; i < 3; i++){
    const slot = document.createElement("div");
    slot.className = `fusion-slot ${selectedFusionItems[i] ? 'filled' : ''}`;
    slot.textContent = selectedFusionItems[i] ? selectedFusionItems[i].name : `Slot ${i+1}`;
    slot.addEventListener("click", () => selectItemForFusion(i));
    container.appendChild(slot);
  }
}

function selectItemForFusion(slotIndex){
  const sel = inventoryList.querySelector("li.selected");
  if(!sel) {
    alert("Select an item from your inventory first");
    return;
  }
  
  const idx = Number(sel.dataset.index);
  const item = getInventory(currentUser)[idx];
  selectedFusionItems[slotIndex] = {item, index: idx};
  displayFusionSlots();
}

document.getElementById("fusion-confirm").addEventListener("click", () => {
  if(selectedFusionItems.length !== 3 || selectedFusionItems.some(slot => !slot)){
    alert("Fill all 3 fusion slots");
    return;
  }
  
  const items = selectedFusionItems.map(slot => slot.item);
  const result = fuseItems(items);
  
  if(!result){
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
});

document.addEventListener("DOMContentLoaded",()=>{
  populateTradeUsers();
  const demo=loadUsers();
  if(Object.keys(demo).length===0){
    demo["Alice"]={password:"a",inventory:[],equipped:null,level:1,xp:0,coins:100,maxInventory:50};
    demo["Bob"]={password:"b",inventory:[],equipped:null,level:1,xp:0,coins:100,maxInventory:50};
    saveUsers(demo);
  }
  populateTradeUsers();
});