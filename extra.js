(function(){
  const STORAGE_KEY = "tradeRequests_v2";
  const CSS_ID = "extra-features-css";
  
  function injectStyles(){
    if(document.getElementById(CSS_ID)) return;
    const s = document.createElement("style");
    s.id = CSS_ID;
    s.textContent = `
.extra-burst { 
  position:absolute; pointer-events:none; width:280px; height:280px; 
  left:50%; top:50%; transform:translate(-50%,-50%) scale(0.6); 
  border-radius:50%; mix-blend-mode:screen; 
  animation: burstPop 1200ms ease-out forwards; filter: blur(8px); 
}
@keyframes burstPop { 
  0%{opacity:0;transform:translate(-50%,-50%) scale(0.2)}
  40%{opacity:.95;transform:translate(-50%,-50%) scale(1.15)}
  100%{opacity:0;transform:translate(-50%,-50%) scale(1.8)} 
}
.flying-clone { 
  position:fixed; z-index:9999; pointer-events:none; padding:10px 16px; 
  border-radius:12px; font-weight:800; transform-origin:center; 
  transition: transform 1000ms cubic-bezier(.2,.9,.25,1), opacity 500ms ease; 
  box-shadow:0 16px 40px rgba(2,6,23,0.7); 
  background: linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02)); 
  border: 1px solid rgba(255,255,255,0.1);
}
.extra-modal-backdrop { 
  position:fixed; inset:0; background:rgba(0,0,0,0.65); 
  display:flex; align-items:center; justify-content:center; z-index:10020; 
}
.extra-modal { 
  width:420px; background:rgba(8,8,18,0.98); padding:20px; 
  border-radius:16px; border:1px solid rgba(255,255,255,0.06); 
  box-shadow:0 20px 60px rgba(2,6,23,0.8); max-height:80vh; overflow:auto;
}
.extra-modal h3{ margin:0 0 16px 0; font-size:18px; color:#fff; }
.extra-modal p{ margin:8px 0; color: rgba(255,255,255,0.9); line-height:1.4; }
.extra-modal .row{ display:flex; gap:12px; justify-content:flex-end; margin-top:16px; }
.extra-modal button{ font-size:14px; padding:10px 16px; }
.notification-badge{
  position:absolute; top:-8px; right:-8px; background:#ff4757; 
  color:white; border-radius:50%; width:20px; height:20px; 
  display:flex; align-items:center; justify-content:center; 
  font-size:12px; font-weight:800; animation: pulse 2s infinite;
}
@keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.1)} }
.trade-request-item{
  background:rgba(255,255,255,0.02); border-radius:12px; padding:16px; 
  margin:12px 0; border:1px solid rgba(255,255,255,0.04);
  transition:all 0.2s ease;
}
.trade-request-item:hover{
  background:rgba(255,255,255,0.04); border-color:rgba(255,255,255,0.08);
}
.combo-effect{
  position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
  font-size:24px; font-weight:900; color:#ffd76b; text-shadow:0 0 20px rgba(255,215,107,0.8);
  animation: comboAnim 2s ease-out forwards; pointer-events:none; z-index:1000;
}
@keyframes comboAnim{
  0%{opacity:0; transform:translate(-50%,-50%) scale(0.5)}
  20%{opacity:1; transform:translate(-50%,-50%) scale(1.2)}
  80%{opacity:1; transform:translate(-50%,-50%) scale(1)}
  100%{opacity:0; transform:translate(-50%,-50%) scale(0.8) translateY(-30px)}
}
.streak-counter{
  position:absolute; top:12px; left:12px; background:linear-gradient(135deg,#ff6b6b,#ee5a52);
  color:white; padding:6px 12px; border-radius:20px; font-size:13px; font-weight:700;
  box-shadow:0 4px 15px rgba(238,90,82,0.3);
}
.achievement-popup{
  position:fixed; top:20px; right:20px; background:linear-gradient(135deg,#4ade80,#22c55e);
  color:white; padding:16px 20px; border-radius:12px; font-weight:700;
  box-shadow:0 8px 25px rgba(34,197,94,0.4); z-index:10000;
  animation: slideInRight 0.5s ease-out forwards;
}
@keyframes slideInRight{
  0%{transform:translateX(100%); opacity:0}
  100%{transform:translateX(0); opacity:1}
}
`;
    document.head.appendChild(s);
  }
  
  function loadTradeRequests(){
    try { 
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); 
    } catch(e){ 
      return []; 
    }
  }
  
  function saveTradeRequests(reqs){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reqs));
  }
  
  function createTradeRequest(from, to, itemIndex){
    if(typeof getInventory !== "function") return { ok:false, msg:"inventory API missing" };
    const inv = getInventory(from);
    if(!inv || !inv[itemIndex]) return { ok:false, msg:"invalid item" };
    
    const reqs = loadTradeRequests();
    const req = {
      id: "tr_" + Date.now() + "_" + Math.random().toString(36).slice(2,8),
      from, to, itemIndex, item: structuredClone(inv[itemIndex]),
      createdAt: new Date().toISOString(),
      status: "pending"
    };
    
    reqs.push(req);
    saveTradeRequests(reqs);
    
    if(typeof broadcastChat === "function"){
      broadcastChat(`🔔 ${from} sent a trade request to ${to} for ${req.item.name}`, true);
    }
    
    showNotificationBadge();
    return { ok:true, req };
  }
  
  function getPendingFor(user){
    return loadTradeRequests().filter(r => r.to === user && r.status === "pending");
  }
  
  function acceptTradeRequest(id){
    const reqs = loadTradeRequests();
    const idx = reqs.findIndex(r => r.id === id);
    if(idx === -1) return { ok:false, msg:"not found" };
    
    const req = reqs[idx];
    if(req.status !== "pending") return { ok:false, msg:"not pending" };
    
    if(typeof loadUsers !== "function" || typeof saveUsers !== "function"){
      return { ok:false, msg:"user API missing" };
    }
    
    const users = loadUsers();
    const fromUser = users[req.from];
    const toUser = users[req.to];
    
    if(!fromUser || !toUser) return { ok:false, msg:"users not found" };
    
    const fromInv = fromUser.inventory || [];
    const foundIndex = fromInv.findIndex(it => 
      it.name === req.item.name && it.rarity === req.item.rarity
    );
    
    if(foundIndex === -1){
      req.status = "rejected";
      reqs[idx] = req;
      saveTradeRequests(reqs);
      if(typeof broadcastChat === "function"){
        broadcastChat(`⚠️ Trade failed: ${req.from}'s ${req.item.name} no longer available`, true);
      }
      return { ok:false, msg:"item not available" };
    }
    
    if(toUser.inventory.length >= (toUser.maxInventory || 50)){
      req.status = "rejected";
      reqs[idx] = req;
      saveTradeRequests(reqs);
      if(typeof broadcastChat === "function"){
        broadcastChat(`⚠️ Trade failed: ${req.to}'s inventory is full`, true);
      }
      return { ok:false, msg:"inventory full" };
    }
    
    const item = fromInv.splice(foundIndex, 1)[0];
    toUser.inventory = toUser.inventory || [];
    toUser.inventory.push(item);
    
    if(typeof updateQuestProgress === "function"){
      updateQuestProgress(req.from, "trade");
      updateQuestProgress(req.to, "trade");
    }
    
    req.status = "accepted";
    req.resolvedAt = new Date().toISOString();
    reqs[idx] = req;
    
    saveUsers(users);
    saveTradeRequests(reqs);
    
    if(typeof broadcastChat === "function"){
      broadcastChat(`✅ ${req.to} accepted ${req.from}'s trade: ${item.name}`, true);
    }
    
    if(typeof awardXP === "function"){
      awardXP(8);
    }
    
    showTradeCompleteEffect();
    return { ok:true, item };
  }
  
  function rejectTradeRequest(id){
    const reqs = loadTradeRequests();
    const idx = reqs.findIndex(r => r.id === id);
    if(idx === -1) return { ok:false };
    
    const req = reqs[idx];
    req.status = "rejected";
    req.resolvedAt = new Date().toISOString();
    reqs[idx] = req;
    
    saveTradeRequests(reqs);
    
    if(typeof broadcastChat === "function"){
      broadcastChat(`❌ ${req.to} declined trade from ${req.from}`, true);
    }
    
    return { ok:true };
  }
  
  function showPendingRequestsModalFor(user){
    const pending = getPendingFor(user);
    if(!pending.length) return;
    
    const backdrop = document.createElement("div");
    backdrop.className = "extra-modal-backdrop";
    
    const modal = document.createElement("div");
    modal.className = "extra-modal";
    
    const h = document.createElement("h3");
    h.textContent = "Trade Requests";
    modal.appendChild(h);
    
    pending.forEach(req => {
      const div = document.createElement("div");
      div.className = "trade-request-item";
      
      const timeAgo = Math.floor((Date.now() - new Date(req.createdAt)) / 1000 / 60);
      div.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
          <strong style="color:#4ade80;">${req.from}</strong>
          <span style="font-size:12px;color:rgba(255,255,255,0.6);">${timeAgo}m ago</span>
        </div>
        <p style="margin:4px 0;">wants to send you: <span style="color:#ffd76b;font-weight:600;">${req.item.name}</span></p>
        <p style="font-size:13px;color:rgba(255,255,255,0.7);margin:4px 0;">Rarity: ${req.item.rarity} | Value: ${req.item.value} coins</p>
      `;
      
      const row = document.createElement("div");
      row.className = "row";
      row.style.marginTop = "12px";
      
      const accept = document.createElement("button");
      accept.textContent = "Accept";
      accept.style.background = "linear-gradient(135deg,#4ade80,#22c55e)";
      accept.style.color = "white";
      
      const reject = document.createElement("button");
      reject.textContent = "Decline";
      reject.style.background = "linear-gradient(135deg,#ef4444,#dc2626)";
      reject.style.color = "white";
      
      accept.onclick = () => {
        accept.disabled = true; 
        reject.disabled = true;
        const res = acceptTradeRequest(req.id);
        if(res.ok){
          backdrop.remove();
          if(typeof displayInventory === "function") displayInventory();
          showAchievementPopup(`Received ${req.item.name}!`);
        } else {
          alert(`Failed: ${res.msg}`);
          backdrop.remove();
        }
      };
      
      reject.onclick = () => {
        reject.disabled = true; 
        accept.disabled = true;
        rejectTradeRequest(req.id);
        backdrop.remove();
      };
      
      row.appendChild(reject);
      row.appendChild(accept);
      div.appendChild(row);
      modal.appendChild(div);
    });
    
    const closeRow = document.createElement("div");
    closeRow.className = "row";
    closeRow.style.marginTop = "16px";
    const closeBtn = document.createElement("button");
    closeBtn.textContent = "Close";
    closeBtn.onclick = () => backdrop.remove();
    closeRow.appendChild(closeBtn);
    modal.appendChild(closeRow);
    
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);
  }
  
  function showNotificationBadge(){
    const user = window.currentUser || 
      (document.getElementById("player-name") && document.getElementById("player-name").textContent);
    if(!user) return;
    
    const pending = getPendingFor(user);
    const existingBadge = document.querySelector(".notification-badge");
    
    if(existingBadge) existingBadge.remove();
    
    if(pending.length > 0){
      const badge = document.createElement("div");
      badge.className = "notification-badge";
      badge.textContent = pending.length;
      
      const questsBtn = document.getElementById("btn-quests");
      if(questsBtn){
        questsBtn.style.position = "relative";
        questsBtn.appendChild(badge);
      }
    }
  }
  
  function showTradeCompleteEffect(){
    const slot = document.getElementById("slot-window");
    if(slot){
      const effect = document.createElement("div");
      effect.className = "combo-effect";
      effect.textContent = "TRADE SUCCESS!";
      slot.appendChild(effect);
      setTimeout(() => effect.remove(), 2000);
    }
  }
  
  function showAchievementPopup(text){
    const popup = document.createElement("div");
    popup.className = "achievement-popup";
    popup.innerHTML = `🎉 ${text}`;
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 3000);
  }
  
  function animateFlyFromTo(fromRect, toRect, label, rarityClass){
    const clone = document.createElement("div");
    clone.className = "flying-clone " + (rarityClass || "");
    clone.textContent = label;
    clone.style.left = `${fromRect.left}px`;
    clone.style.top = `${fromRect.top}px`;
    clone.style.opacity = "1";
    document.body.appendChild(clone);
    
    requestAnimationFrame(() => {
      clone.style.transform = `translate(${toRect.left - fromRect.left}px, ${toRect.top - fromRect.top}px) scale(.8)`;
      clone.style.opacity = "0.9";
    });
    
    setTimeout(() => { 
      clone.style.opacity = "0"; 
      clone.style.transform += " translateY(-12px) scale(.6)"; 
    }, 800);
    
    setTimeout(() => { 
      clone.remove(); 
    }, 1300);
  }
  
  function wireRequestTradeButton(){
    const reqBtn = document.getElementById("request-trade");
    if(!reqBtn) return;
    
    const clone = reqBtn.cloneNode(true);
    reqBtn.parentNode.replaceChild(clone, reqBtn);
    
    clone.addEventListener("click", () => {
      const user = window.currentUser || 
        (document.getElementById("player-name") && document.getElementById("player-name").textContent);
      if(!user){ 
        alert("Login first"); 
        return; 
      }
      
      const sel = document.querySelector("#trade-inventory li.selected");
      const target = document.getElementById("trade-user") ? document.getElementById("trade-user").value : null;
      
      if(!sel || !target){ 
        const tradeMsg = document.getElementById("trade-message");
        if(tradeMsg) tradeMsg.textContent = "Select a target user and an item";
        return; 
      }
      
      const idx = Number(sel.dataset.index);
      const res = createTradeRequest(user, target, idx);
      
      if(res.ok){
        const tradeMsg = document.getElementById("trade-message");
        if(tradeMsg) tradeMsg.textContent = `Trade request sent to ${target}!`;
        
        setTimeout(() => {
          const chatRect = document.getElementById("chat-box").getBoundingClientRect();
          animateFlyFromTo(
            sel.getBoundingClientRect(), 
            { left: chatRect.left + 20, top: chatRect.top + 20 }, 
            res.req.item.name, 
            typeof getRarityClass === "function" ? getRarityClass(res.req.item.rarity) : ""
          );
        }, 100);
        
      } else {
        alert("Failed to create request: " + (res.msg || "unknown error"));
      }
    });
  }
  
  function enhanceRollEffects(){
    const rollBtn = document.getElementById("roll-btn");
    const megaRollBtn = document.getElementById("mega-roll-btn");
    
    if(rollBtn && !rollBtn.dataset.enhanced){
      rollBtn.dataset.enhanced = "true";
      const originalClick = rollBtn.onclick;
      rollBtn.onclick = async function(e){
        if(originalClick) await originalClick.call(this, e);
        
        setTimeout(() => {
          const slotWindow = document.getElementById("slot-window");
          if(slotWindow && Math.random() < 0.3){
            const burst = document.createElement("div");
            burst.className = "extra-burst";
            burst.style.background = "radial-gradient(circle at 40% 40%, rgba(105,185,255,0.6), rgba(49,140,255,0.2), rgba(255,255,255,0))";
            slotWindow.appendChild(burst);
            setTimeout(() => burst.remove(), 1200);
          }
        }, 600);
      };
    }
    
    if(megaRollBtn && !megaRollBtn.dataset.enhanced){
      megaRollBtn.dataset.enhanced = "true";
      const originalClick = megaRollBtn.onclick;
      megaRollBtn.onclick = async function(e){
        if(originalClick) await originalClick.call(this, e);
        
        setTimeout(() => {
          const slotWindow = document.getElementById("slot-window");
          if(slotWindow){
            const burst = document.createElement("div");
            burst.className = "extra-burst";
            burst.style.background = "radial-gradient(circle at 30% 30%, rgba(255,215,107,0.8), rgba(255,184,77,0.4), rgba(255,111,145,0.2))";
            slotWindow.appendChild(burst);
            setTimeout(() => burst.remove(), 1500);
          }
        }, 800);
      };
    }
  }
  
  function initExtras(){
    injectStyles();
    wireRequestTradeButton();
    enhanceRollEffects();
    
    const user = window.currentUser || 
      (document.getElementById("player-name") && document.getElementById("player-name").textContent);
    if(user) showNotificationBadge();
    
    setInterval(() => {
      const currentUser = window.currentUser || 
        (document.getElementById("player-name") && document.getElementById("player-name").textContent);
      if(currentUser) showNotificationBadge();
    }, 5000);
  }
  
  window.EXTRA = {
    createTradeRequest,
    acceptTradeRequest,
    rejectTradeRequest,
    getPendingFor,
    showPendingRequestsModalFor,
    showNotificationBadge,
    initExtras
  };
  
  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
      try { 
        initExtras(); 
      } catch(e){
        console.log("Extra features init error:", e);
      }
    }, 500);
    
    let lastUser = null;
    setInterval(() => {
      const current = window.currentUser || 
        (document.getElementById("player-name") && document.getElementById("player-name").textContent);
      if(current && current !== lastUser){
        lastUser = current;
        setTimeout(() => {
          const pending = getPendingFor(current);
          if(pending.length > 0){
            showPendingRequestsModalFor(current);
          }
        }, 800);
      }
    }, 2000);
  });
})();