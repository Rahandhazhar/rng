(function(){
  const STORAGE_KEY = "tradeRequests_v1";
  const CSS_ID = "extra-features-css";
  function injectStyles(){
    if(document.getElementById(CSS_ID)) return;
    const s = document.createElement("style");
    s.id = CSS_ID;
    s.textContent = `
.extra-burst { position:absolute; pointer-events:none; width:220px; height:220px; left:50%; top:50%; transform:translate(-50%,-50%) scale(0.6); border-radius:50%; mix-blend-mode:screen; animation: burstPop 900ms ease-out forwards; filter: blur(6px); }
@keyframes burstPop { 0%{opacity:0;transform:translate(-50%,-50%) scale(0.3)}30%{opacity:.9;transform:translate(-50%,-50%) scale(1.05)}100%{opacity:0;transform:translate(-50%,-50%) scale(1.5)} }
.flying-clone { position:fixed; z-index:9999; pointer-events:none; padding:8px 12px; border-radius:10px; font-weight:800; transform-origin:center; transition: transform 900ms cubic-bezier(.2,.9,.25,1), opacity 400ms ease; box-shadow:0 12px 30px rgba(2,6,23,0.6); background: rgba(255,255,255,0.03); }
.extra-modal-backdrop { position:fixed; inset:0; background:rgba(0,0,0,0.45); display:flex; align-items:center; justify-content:center; z-index:10020; }
.extra-modal { width:360px; background:rgba(10,10,20,0.98); padding:14px; border-radius:12px; border:1px solid rgba(255,255,255,0.04); box-shadow:0 18px 40px rgba(2,6,23,0.7); }
.extra-modal h3{ margin:0 0 8px 0; font-size:16px; }
.extra-modal p{ margin:6px 0; color: rgba(255,255,255,0.9); }
.extra-modal .row{ display:flex; gap:8px; justify-content:flex-end; margin-top:12px; }
.extra-top-btn { margin-left:10px; background:transparent; border:1px solid rgba(255,255,255,0.06); padding:8px 10px; border-radius:10px; font-weight:700; cursor:pointer; color:inherit }
.extra-legend{ margin-top:10px; padding:10px; background: rgba(255,255,255,0.015); border-radius:10px; font-size:13px; color: rgba(255,255,255,0.9); }
.extra-filter{ width:100%; padding:8px; margin-top:8px; border-radius:8px; border:none; background:rgba(255,255,255,0.02); color:#fff; }
.level-up-badge{ position:absolute; right:18px; top:10px; padding:6px 10px; background: linear-gradient(135deg,#ffd76b,#ffb84d); color:#111; border-radius:10px; font-weight:900; box-shadow:0 12px 30px rgba(255,180,60,0.12); transform-origin:center; animation: popLevel 900ms cubic-bezier(.2,.9,.25,1); }
@keyframes popLevel { 0%{transform:scale(.2);opacity:0}60%{transform:scale(1.08);opacity:1}100%{transform:scale(1);opacity:1} }
`;
    document.head.appendChild(s);
  }
  function loadTradeRequests(){
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
    catch(e){ return []; }
  }
  function saveTradeRequests(reqs){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reqs));
  }
  function ensureUserMeta(name){
    const users = typeof loadUsers === "function" ? loadUsers() : {};
    users[name] = users[name] || { password: "", inventory: [], equipped: null };
    const u = users[name];
    if(typeof u.xp !== "number") u.xp = 0;
    if(typeof u.level !== "number") u.level = 1;
    if(!u.lastDaily) u.lastDaily = null;
    if(typeof saveUsers === "function") saveUsers(users);
    return users;
  }
  function xpToNext(level){
    return Math.floor(100 * level * (1 + level * 0.12));
  }
  function awardXP(user, amount){
    if(!user || typeof loadUsers !== "function" || typeof saveUsers !== "function") return;
    const users = loadUsers();
    if(!users[user]) return;
    users[user].xp = (users[user].xp || 0) + amount;
    let leveled = false;
    while(users[user].xp >= xpToNext(users[user].level)){
      users[user].xp -= xpToNext(users[user].level);
      users[user].level = (users[user].level || 1) + 1;
      leveled = true;
    }
    saveUsers(users);
    if(typeof displayInventory === "function") displayInventory();
    if(leveled) showLevelUp(user, users[user].level);
  }
  function showLevelUp(user, newLevel){
    if(typeof broadcastChat === "function") broadcastChat(`🌟 ${user} reached level ${newLevel}!`, true);
    const slot = document.getElementById("slot-window");
    if(slot){
      const b = document.createElement("div");
      b.className = "extra-burst";
      b.style.background = "radial-gradient(circle at 30% 30%, rgba(255,215,107,0.55), rgba(255,110,145,0.12), rgba(255,255,255,0))";
      slot.appendChild(b);
      setTimeout(()=> b.remove(), 1200);
    }
    const topBar = document.getElementById("top-bar");
    if(topBar){
      const badge = document.createElement("div");
      badge.className = "level-up-badge";
      badge.textContent = `Level ${newLevel}`;
      topBar.appendChild(badge);
      setTimeout(()=> badge.remove(), 2000);
    }
  }
  function canClaimDaily(user){
    if(!user || typeof loadUsers !== "function") return false;
    const users = loadUsers();
    const u = users[user];
    if(!u) return true;
    if(!u.lastDaily) return true;
    const last = new Date(u.lastDaily);
    const now = new Date();
    return !( last.getFullYear() === now.getFullYear() && last.getMonth() === now.getMonth() && last.getDate() === now.getDate());
  }
  function claimDaily(user){
    if(!user || typeof loadUsers !== "function" || typeof saveUsers !== "function") return { ok:false, msg:"no user" };
    const users = loadUsers();
    users[user] = users[user] || { password:"", inventory:[], equipped:null };
    users[user].lastDaily = new Date().toISOString();
    saveUsers(users);
    awardXP(user, 18);
    const common = (typeof items !== "undefined" ? items.find(it => it.rarity === "common") : null) || (typeof items !== "undefined" ? items[items.length-1] : null);
    const inv = (typeof getInventory === "function" ? getInventory(user) : []) || [];
    if(common) inv.push(structuredClone(common));
    if(typeof saveInventory === "function") saveInventory(user, inv);
    if(typeof displayInventory === "function") displayInventory();
    if(typeof broadcastChat === "function") broadcastChat(`🎁 ${user} claimed daily reward: +18 XP & ${common ? common.name : "a surprise item"}`, true);
    return { ok:true, item:common };
  }
  function createTradeRequest(from, to, itemIndex){
    if(typeof getInventory !== "function") return { ok:false, msg:"inventory API missing" };
    const inv = getInventory(from);
    if(!inv || !inv[itemIndex]) return { ok:false, msg:"invalid item" };
    const reqs = loadTradeRequests();
    const req = {
      id: "r_" + Date.now() + "_" + Math.random().toString(36).slice(2,8),
      from, to, itemIndex, item: structuredClone(inv[itemIndex]),
      createdAt: new Date().toISOString(),
      status: "pending"
    };
    reqs.push(req);
    saveTradeRequests(reqs);
    if(typeof broadcastChat === "function") broadcastChat(`🔔 ${from} requested to send ${req.item.name} to ${to}`, true);
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
    if(typeof loadUsers !== "function" || typeof saveUsers !== "function") return { ok:false, msg:"user API missing" };
    const users = loadUsers();
    const fromInv = users[req.from]?.inventory || [];
    const foundIndex = fromInv.findIndex(it => it.name === req.item.name && it.rarity === req.item.rarity);
    if(foundIndex === -1){
      req.status = "rejected";
      saveTradeRequests(reqs);
      if(typeof broadcastChat === "function") broadcastChat(`⚠️ Trade failed: ${req.from}'s item not found`, true);
      return { ok:false, msg:"item not found" };
    }
    const item = fromInv.splice(foundIndex,1)[0];
    users[req.to] = users[req.to] || { password:"", inventory:[], equipped:null };
    users[req.to].inventory = users[req.to].inventory || [];
    users[req.to].inventory.push(item);
    saveUsers(users);
    req.status = "accepted";
    req.resolvedAt = new Date().toISOString();
    saveTradeRequests(reqs);
    if(typeof broadcastChat === "function") broadcastChat(`✅ ${req.to} accepted trade from ${req.from}: ${item.name}`, true);
    awardXP(req.from, 8);
    awardXP(req.to, 6);
    setTimeout(()=> {
      try {
        const sel = document.querySelector(`#trade-inventory li[data-index="${foundIndex}"]`) || document.querySelector(`#inventory-list li`);
        if(sel){
          const chatRect = document.getElementById("chat-box").getBoundingClientRect();
          animateFlyFromTo(sel.getBoundingClientRect(), { left: chatRect.left+10, top: chatRect.top+8 }, item.name, (typeof getRarityClass === "function" ? getRarityClass(item.rarity) : ""));
        }
      } catch(e){}
    }, 60);
    return { ok:true };
  }
  function rejectTradeRequest(id){
    const reqs = loadTradeRequests();
    const idx = reqs.findIndex(r => r.id === id);
    if(idx === -1) return { ok:false };
    const req = reqs[idx];
    req.status = "rejected";
    req.resolvedAt = new Date().toISOString();
    saveTradeRequests(reqs);
    if(typeof broadcastChat === "function") broadcastChat(`❌ ${req.to} rejected trade request from ${req.from}`, true);
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
    h.textContent = "Pending Trade Requests";
    modal.appendChild(h);
    pending.forEach(req=>{
      const p = document.createElement("p");
      p.innerHTML = `<strong>${req.from}</strong> → <strong>${req.to}</strong> : ${req.item.name} <span class="small-muted">[${new Date(req.createdAt).toLocaleString()}]</span>`;
      const row = document.createElement("div");
      row.className = "row";
      const accept = document.createElement("button");
      accept.textContent = "Accept";
      const reject = document.createElement("button");
      reject.textContent = "Reject";
      accept.onclick = ()=>{
        accept.disabled = true; reject.disabled = true;
        const res = acceptTradeRequest(req.id);
        if(res.ok){
          if(typeof broadcastChat === "function") broadcastChat(`🎉 ${user} accepted trade and received ${req.item.name}`, true);
          backdrop.remove();
          if(typeof displayInventory === "function") displayInventory();
        } else {
          alert(res.msg || "Failed to accept trade");
        }
      };
      reject.onclick = ()=>{
        reject.disabled = true; accept.disabled = true;
        rejectTradeRequest(req.id);
        backdrop.remove();
      };
      row.appendChild(reject);
      row.appendChild(accept);
      modal.appendChild(p);
      modal.appendChild(row);
    });
    const closeRow = document.createElement("div");
    closeRow.className = "row";
    const closeBtn = document.createElement("button");
    closeBtn.textContent = "Close";
    closeBtn.onclick = ()=>backdrop.remove();
    closeRow.appendChild(closeBtn);
    modal.appendChild(closeRow);
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);
  }
  function animateFlyFromTo(fromRect, toRect, label, rarityClass){
    const clone = document.createElement("div");
    clone.className = "flying-clone " + (rarityClass || "");
    clone.textContent = label;
    clone.style.left = `${fromRect.left}px`;
    clone.style.top = `${fromRect.top}px`;
    clone.style.opacity = "1";
    document.body.appendChild(clone);
    requestAnimationFrame(()=>{
      clone.style.transform = `translate(${toRect.left - fromRect.left}px, ${toRect.top - fromRect.top}px) scale(.7)`;
      clone.style.opacity = "0.96";
    });
    setTimeout(()=>{ clone.style.opacity = "0"; clone.style.transform += " translateY(-8px) scale(.6)"; }, 700);
    setTimeout(()=>{ clone.remove(); }, 1200);
  }
  function addInventoryFilterAndLegend(){
    const invPanel = document.getElementById("inventory-panel");
    if(!invPanel) return;
    if(!document.getElementById("extra-filter-input")){
      const input = document.createElement("input");
      input.id = "extra-filter-input";
      input.className = "extra-filter";
      input.placeholder = "Filter inventory (name or rarity)...";
      invPanel.insertBefore(input, invPanel.querySelector("ul"));
      input.addEventListener("input", ()=>{
        const q = input.value.trim().toLowerCase();
        document.querySelectorAll("#inventory-list li").forEach(li=>{
          const txt = li.textContent.toLowerCase();
          li.style.display = q ? (txt.includes(q) ? "" : "none") : "";
        });
      });
    }
    const rollPanel = document.getElementById("roll-panel");
    if(!rollPanel) return;
    if(!document.getElementById("extra-legend")){
      const btn = document.createElement("button");
      btn.id = "extra-legend-toggle";
      btn.className = "extra-top-btn";
      btn.textContent = "Rarity Legend";
      rollPanel.insertBefore(btn, rollPanel.firstChild ? rollPanel.firstChild.nextSibling : rollPanel.firstChild);
      const legend = document.createElement("div");
      legend.id = "extra-legend";
      legend.className = "extra-legend";
      legend.style.display = "none";
      legend.innerHTML = `
        <div><strong>Legend:</strong> <span class="small-muted">approx chances</span></div>
        <div style="margin-top:8px"><span style="display:inline-block;width:10px;height:10px;background:linear-gradient(180deg,#ffd76b,#ffb84d);border-radius:50%;margin-right:8px"></span> Legendary — extremely rare</div>
        <div style="margin-top:6px"><span style="display:inline-block;width:10px;height:10px;background:linear-gradient(180deg,#c37bff,#8b3aff);border-radius:50%;margin-right:8px"></span> Epic — very rare</div>
        <div style="margin-top:6px"><span style="display:inline-block;width:10px;height:10px;background:linear-gradient(180deg,#69b9ff,#318cff);border-radius:50%;margin-right:8px"></span> Rare — uncommon</div>
        <div style="margin-top:6px"><span style="display:inline-block;width:10px;height:10px;background:linear-gradient(180deg,#a0a0a0,#808080);border-radius:50%;margin-right:8px"></span> Common — frequent</div>`;
      rollPanel.appendChild(legend);
      btn.onclick = ()=>{ legend.style.display = legend.style.display === "none" ? "block" : "none"; }
    }
  }
  function addDailyButton(){
    const topActions = document.querySelector("#top-actions");
    if(!topActions) return;
    if(document.getElementById("btn-daily")) return;
    const btn = document.createElement("button");
    btn.id = "btn-daily";
    btn.className = "extra-top-btn";
    btn.textContent = "Claim Daily";
    btn.onclick = ()=>{
      const user = window.currentUser || (document.getElementById("player-name") && document.getElementById("player-name").textContent);
      if(!user){ alert("Login first"); return; }
      if(!canClaimDaily(user)){ alert("You already claimed daily today."); return; }
      const res = claimDaily(user);
      if(res.ok){ btn.textContent = "Claimed ✓"; setTimeout(()=> btn.textContent = "Claim Daily", 2000); }
    };
    topActions.insertBefore(btn, topActions.firstChild);
  }
  function showPendingIfAny(){
    const user = window.currentUser || (document.getElementById("player-name") && document.getElementById("player-name").textContent);
    if(!user) return;
    const pending = getPendingFor(user);
    if(pending.length) {
      setTimeout(()=> showPendingRequestsModalFor(user), 350);
    }
  }
  function wireRequestTradeButton(){
    const reqBtn = document.getElementById("request-trade");
    if(!reqBtn) return;
    const clone = reqBtn.cloneNode(true);
    reqBtn.parentNode.replaceChild(clone, reqBtn);
    clone.addEventListener("click", ()=>{
      const user = window.currentUser || (document.getElementById("player-name") && document.getElementById("player-name").textContent);
      if(!user){ alert("Login first"); return; }
      const sel = document.querySelector("#trade-inventory li.selected");
      const target = document.getElementById("trade-user") ? document.getElementById("trade-user").value : null;
      if(!sel || !target){ alert("Select a target user and an item"); return; }
      const idx = Number(sel.dataset.index);
      const res = createTradeRequest(user, target, idx);
      if(res.ok){
        if(typeof broadcastChat === "function") broadcastChat(`🔁 ${user} sent a trade request to ${target} for ${res.req.item.name}`, true);
        alert("Trade request sent!");
      } else alert("Failed to create request: " + (res.msg || "unknown"));
    });
  }
  function animateFlyFromTo(fromRect, toRect, label, rarityClass){
    const clone = document.createElement("div");
    clone.className = "flying-clone " + (rarityClass || "");
    clone.textContent = label;
    clone.style.left = `${fromRect.left}px`;
    clone.style.top = `${fromRect.top}px`;
    clone.style.opacity = "1";
    document.body.appendChild(clone);
    requestAnimationFrame(()=>{
      clone.style.transform = `translate(${toRect.left - fromRect.left}px, ${toRect.top - fromRect.top}px) scale(.7)`;
      clone.style.opacity = "0.96";
    });
    setTimeout(()=>{ clone.style.opacity = "0"; clone.style.transform += " translateY(-8px) scale(.6)"; }, 700);
    setTimeout(()=>{ clone.remove(); }, 1200);
  }
  function initExtras(){
    injectStyles();
    addInventoryFilterAndLegend();
    addDailyButton();
    wireRequestTradeButton();
    showPendingIfAny();
  }
  window.EXTRA = {
    createTradeRequest,
    acceptTradeRequest,
    rejectTradeRequest,
    getPendingFor,
    awardXP,
    claimDaily,
    initExtras
  };
  document.addEventListener("DOMContentLoaded",()=>{
    try { initExtras(); } catch(e){}
    try {
      if(typeof loadUsers === "function" && typeof saveUsers === "function"){
        const u = loadUsers();
        if(Object.keys(u).length === 0){
          u["Alice"] = { password:"a", inventory:[], equipped:null, xp:0, level:1, lastDaily:null };
          u["Bob"] = { password:"b", inventory:[], equipped:null, xp:0, level:1, lastDaily:null };
          saveUsers(u);
          if(typeof populateTradeUsers === "function") populateTradeUsers();
        }
      }
    } catch(e){}
    let lastUser = null;
    setInterval(()=>{
      const current = window.currentUser || (document.getElementById("player-name") && document.getElementById("player-name").textContent);
      if(current && current !== lastUser){
        lastUser = current;
        setTimeout(()=> showPendingRequestsModalFor(current), 450);
      }
    }, 900);
  });
})();
