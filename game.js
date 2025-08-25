const loginBtn=document.getElementById("login-btn");
const registerBtn=document.getElementById("register-btn");
const logoutBtn=document.getElementById("logout-btn");
const authContainer=document.getElementById("auth-container");
const gameContainer=document.getElementById("game-container");
const playerNameDisplay=document.getElementById("player-name");
const authMessage=document.getElementById("auth-message");
const rollBtn=document.getElementById("roll-btn");
const rollResult=document.getElementById("roll-result");
const slotReel=document.getElementById("slot-reel");
const inventoryList=document.getElementById("inventory-list");
const equipBtn=document.getElementById("equip-btn");
const inspectBtn=document.getElementById("inspect-btn");
const equipName=document.getElementById("equip-name");
const tradeUserSelect=document.getElementById("trade-user");
const refreshUsersBtn=document.getElementById("refresh-users");
const tradeInventoryList=document.getElementById("trade-inventory");
const sendTradeBtn=document.getElementById("send-trade");
const tradeMessage=document.getElementById("trade-message");
const chatBox=document.getElementById("chat-box");
const chatInput=document.getElementById("chat-input");
const sendChat=document.getElementById("send-chat");

let currentUser=null;

function loadUsers(){return JSON.parse(localStorage.getItem("users")||"{}")}
function saveUsers(u){localStorage.setItem("users",JSON.stringify(u))}
function getInventory(u){return loadUsers()[u]?.inventory||[]}
function saveInventory(u,inv){let uobj=loadUsers();if(!uobj[u])uobj[u]={};uobj[u].inventory=inv;saveUsers(uobj)}
function setEquipped(u,item){let uobj=loadUsers();if(!uobj[u])uobj[u]={};uobj[u].equipped=item;saveUsers(uobj)}
function getEquipped(u){return loadUsers()[u]?.equipped||null}

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
  const rar=document.createElement("div");
  rar.className="rarity-label";
  rar.textContent=item.rarity.toUpperCase();
  li.appendChild(rar);
  li.addEventListener("click",()=>{const list=li.parentElement;list.querySelectorAll("li").forEach(x=>x.classList.remove("selected"));li.classList.add("selected")});
  return li;
}

function displayInventory(){
  inventoryList.innerHTML="";
  const inv=getInventory(currentUser);
  inv.forEach((it,idx)=>inventoryList.appendChild(makeListItem(it,idx)));
  const eq=getEquipped(currentUser);
  equipName.textContent=eq?`${eq.name} (${eq.rarity})`:"None";
  populateTradeInventory();
}

function populateTradeUsers(){
  tradeUserSelect.innerHTML="";
  const u=loadUsers();
  Object.keys(u).forEach(name=>{if(name!==currentUser){const opt=document.createElement("option");opt.value=name;opt.textContent=name;tradeUserSelect.appendChild(opt)}});
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

registerBtn.addEventListener("click",()=>{
  const u=document.getElementById("username").value.trim();
  const p=document.getElementById("password").value.trim();
  if(!u||!p){authMessage.textContent="Fill both fields";return}
  const users=loadUsers();
  if(users[u]){authMessage.textContent="User exists";return}
  users[u]={password:p,inventory:[],equipped:null};
  saveUsers(users);
  authMessage.textContent="Registered. Login to continue";
  populateTradeUsers();
});

loginBtn.addEventListener("click",()=>{
  const u=document.getElementById("username").value.trim();
  const p=document.getElementById("password").value.trim();
  const users=loadUsers();
  if(users[u]&&users[u].password===p){
    currentUser=u;
    authContainer.style.display="none";
    gameContainer.style.display="block";
    playerNameDisplay.textContent=currentUser;
    displayInventory();
    populateTradeUsers();
    broadcastChat(`${currentUser} entered the realm`,true);
  } else authMessage.textContent="Invalid credentials";
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
  for(let i=0;i<30;i++){const pick=items[Math.floor(Math.random()*items.length)];pool.push(pick)}
  const finalIndex=pool.length-1;
  pool[finalIndex]=finalName;
  pool.forEach(it=>{
    const div=document.createElement("div");
    div.className="slot-item";
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
        setTimeout(()=>{resolve()},420);
      } else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

rollBtn.addEventListener("click",async()=>{
  if(!currentUser) return;
  rollBtn.disabled=true;
  rollResult.textContent="Spinning...";
  const final=rollItem();
  await animateReel(final);
  rollResult.innerHTML=`You got <span class="${getRarityClass(final.rarity)}">${final.name} (${final.rarity})</span>!`;
  const inv=getInventory(currentUser);
  inv.push(final);
  saveInventory(currentUser,inv);
  displayInventory();
  broadcastChat(`${currentUser} rolled ${final.name} (${final.rarity})`,true);
  const el=document.querySelector(`#inventory-list li[data-index="${inv.length-1}"]`);
  if(el) el.classList.add("selected");
  rollBtn.disabled=false;
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
  const msg=`Inspecting ${item.name} — rarity: ${item.rarity}`;
  tradeMessage.textContent=msg;
});

refreshUsersBtn.addEventListener("click",populateTradeUsers);

function animateTradeFly(sourceEl,targetRect, label, rarityClass){
  const rect=sourceEl.getBoundingClientRect();
  const clone=document.createElement("div");
  clone.className="flying-clone "+rarityClass;
  clone.style.left=`${rect.left}px`;
  clone.style.top=`${rect.top}px`;
  clone.style.background="linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))";
  clone.style.padding="8px 12px";
  clone.style.borderRadius="10px";
  clone.textContent=label;
  document.body.appendChild(clone);
  requestAnimationFrame(()=>{clone.style.transform=`translate(${targetRect.left-rect.left}px,${targetRect.top-rect.top}px) scale(.7)`;clone.style.opacity="0.95";});
  setTimeout(()=>{clone.style.opacity="0";clone.style.transform+=` translateY(-10px) scale(.6)`},700);
  setTimeout(()=>{clone.remove()},1200);
}

sendTradeBtn.addEventListener("click",()=>{
  const sel=tradeInventoryList.querySelector("li.selected");
  const target=tradeUserSelect.value;
  if(!sel || !target){tradeMessage.textContent="Pick a target user and an item";return}
  const idx=Number(sel.dataset.index);
  const users=loadUsers();
  const item=getInventory(currentUser)[idx];
  if(!users[target].inventory) users[target].inventory=[];
  users[target].inventory.push(item);
  let inv=getInventory(currentUser);
  inv.splice(idx,1);
  saveInventory(currentUser,inv);
  saveUsers(users);
  displayInventory();
  broadcastChat(`${currentUser} sent ${item.name} to ${target}`,true);
  tradeMessage.textContent=`Sent ${item.name} to ${target}`;
  const srcEl=sel;
  const chatRect=chatBox.getBoundingClientRect();
  animateTradeFly(srcEl,{left:chatRect.left+10,top:chatRect.top+10},item.name,getRarityClass(item.rarity));
});

sendChat.addEventListener("click",()=>{
  const txt=chatInput.value.trim();
  if(!txt) return;
  broadcastChat(`${currentUser}: ${txt}`,false);
  chatInput.value="";
});

document.addEventListener("DOMContentLoaded",()=>{
  populateTradeUsers();
  const demo=loadUsers();
  if(Object.keys(demo).length===0){
    demo["Alice"]={password:"a",inventory:[],equipped:null};
    demo["Bob"]={password:"b",inventory:[],equipped:null};
    saveUsers(demo);
  }
  populateTradeUsers();
});
