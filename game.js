const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");
const logoutBtn = document.getElementById("logout-btn");
const authContainer = document.getElementById("auth-container");
const gameContainer = document.getElementById("game-container");
const playerNameDisplay = document.getElementById("player-name");
const authMessage = document.getElementById("auth-message");
const rollBtn = document.getElementById("roll-btn");
const rollResult = document.getElementById("roll-result");
const equipInfo = document.getElementById("equip-info");
const inventoryList = document.getElementById("inventory-list");
const equipBtn = document.getElementById("equip-btn");
const tradeUserSelect = document.getElementById("trade-user");
const refreshUsersBtn = document.getElementById("refresh-users");
const tradeInventoryList = document.getElementById("trade-inventory");
const sendTradeBtn = document.getElementById("send-trade");
const tradeMessage = document.getElementById("trade-message");
const chatBox = document.getElementById("chat-box");
const chatInput = document.getElementById("chat-input");
const sendChat = document.getElementById("send-chat");

let currentUser = null;

function loadUsers(){return JSON.parse(localStorage.getItem("users")||"{}");}
function saveUsers(users){localStorage.setItem("users",JSON.stringify(users));}
function getInventory(user){return loadUsers()[user]?.inventory||[];}
function saveInventory(user,inventory){let users=loadUsers();if(!users[user])users[user]={};users[user].inventory=inventory;saveUsers(users);}

function displayInventory(){
  inventoryList.innerHTML="";
  const inventory=getInventory(currentUser);
  inventory.forEach((item,index)=>{
    const li=document.createElement("li");
    li.textContent=item.name + " (" + item.rarity + ")";
    li.className=getRarityClass(item.rarity);
    li.dataset.index=index;
    li.addEventListener("click",()=>{
      inventoryList.querySelectorAll("li").forEach(el=>el.classList.remove("selected"));
      li.classList.add("selected");
    });
    inventoryList.appendChild(li);
  });
  const users=loadUsers();
  const equipped=users[currentUser].equipped;
  equipInfo.textContent = equipped?`Equipped: ${equipped.name} (${equipped.rarity})`:"Equipped: None";
}

function populateTradeUsers(){
  tradeUserSelect.innerHTML="";
  const users=loadUsers();
  Object.keys(users).forEach(user=>{
    if(user!==currentUser){
      const option=document.createElement("option");
      option.value=user;
      option.textContent=user;
      tradeUserSelect.appendChild(option);
    }
  });
  populateTradeInventory();
}

function populateTradeInventory(){
  tradeInventoryList.innerHTML="";
  const inventory=getInventory(currentUser);
  inventory.forEach((item,index)=>{
    const li=document.createElement("li");
    li.textContent=item.name + " (" + item.rarity + ")";
    li.className=getRarityClass(item.rarity);
    li.dataset.index=index;
    li.addEventListener("click",()=>{
      tradeInventoryList.querySelectorAll("li").forEach(el=>el.classList.remove("selected"));
      li.classList.add("selected");
    });
    tradeInventoryList.appendChild(li);
  });
}

function broadcastChat(message){
  const p = document.createElement("p");
  p.textContent = message;
  p.classList.add("chat-message");
  chatBox.appendChild(p);
  chatBox.scrollTop = chatBox.scrollHeight;
}

registerBtn.addEventListener("click",()=>{
  const username=document.getElementById("username").value.trim();
  const password=document.getElementById("password").value.trim();
  if(!username||!password){authMessage.textContent="Fill both fields!"; return;}
  let users=loadUsers();
  if(users[username]){authMessage.textContent="Username exists!"; return;}
  users[username]={password:password,inventory:[],equipped:null};
  saveUsers(users);
  authMessage.textContent="Registered! You can login now.";
});

loginBtn.addEventListener("click",()=>{
  const username=document.getElementById("username").value.trim();
  const password=document.getElementById("password").value.trim();
  let users=loadUsers();
  if(users[username]&&users[username].password===password){
    currentUser=username;
    authContainer.style.display="none";
    gameContainer.style.display="block";
    playerNameDisplay.textContent=currentUser;
    displayInventory();
    populateTradeUsers();
    broadcastChat(`✅ ${currentUser} has joined the game!`);
  } else authMessage.textContent="Invalid credentials!";
});

logoutBtn.addEventListener("click",()=>{
  broadcastChat(`❌ ${currentUser} has left the game!`);
  currentUser=null;
  authContainer.style.display="block";
  gameContainer.style.display="none";
  document.getElementById("username").value="";
  document.getElementById("password").value="";
});

rollBtn.addEventListener("click",()=>{
  rollBtn.disabled=true;
  let count=0;
  const interval=setInterval(()=>{
    const tempItem=items[Math.floor(Math.random()*items.length)];
    rollResult.innerHTML=`Rolling... <span class="${getRarityClass(tempItem.rarity)}">${tempItem.name}</span>`;
    count++;
    if(count>12){
      clearInterval(interval);
      const finalItem=rollItem();
      rollResult.innerHTML=`🎉 You got <span class="${getRarityClass(finalItem.rarity)}">${finalItem.name} (${finalItem.rarity})</span>!`;
      const inventory=getInventory(currentUser);
      inventory.push(finalItem);
      saveInventory(currentUser,inventory);
      displayInventory();
      rollBtn.disabled=false;
      broadcastChat(`✨ ${currentUser} rolled ${finalItem.name} (${finalItem.rarity})!`);
    }
  },100);
});

equipBtn.addEventListener("click",()=>{
  const selected=inventoryList.querySelector(".selected");
  if(!selected)return;
  const index=selected.dataset.index;
  let users=loadUsers();
  users[currentUser].equipped=getInventory(currentUser)[index];
  saveUsers(users);
  displayInventory();
});

refreshUsersBtn.addEventListener("click",populateTradeUsers);

sendTradeBtn.addEventListener("click",()=>{
  const selected=tradeInventoryList.querySelector(".selected");
  const targetUser=tradeUserSelect.value;
  if(!selected||!targetUser){tradeMessage.textContent="Select user and item!"; return;}
  const index=selected.dataset.index;
  let users=loadUsers();
  const item=getInventory(currentUser)[index];
  if(!users[targetUser].inventory)users[targetUser].inventory=[];
  users[targetUser].inventory.push(item);
  let inv=getInventory(currentUser);
  inv.splice(index,1);
  saveInventory(currentUser,inv);
  saveUsers(users);
  displayInventory();
  populateTradeInventory();
  tradeMessage.textContent=`Sent ${item.name} to ${targetUser}!`;
  broadcastChat(`🔄 ${currentUser} sent ${item.name} to ${targetUser}`);
});

sendChat.addEventListener("click",()=>{
  const msg=chatInput.value.trim();
  if(msg==="")return;
  broadcastChat(`${currentUser}: ${msg}`);
  chatInput.value="";
});
