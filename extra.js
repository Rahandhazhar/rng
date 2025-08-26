

(function(){
    const STORAGE_KEY = "tradeRequests_v2";
    const CSS_ID = "extra-features-css";
    
    function injectStyles(){
      if(document.getElementById(CSS_ID)) return;
      const s = document.createElement("style");
      s.id = CSS_ID;
      s.textContent = `
        /* Advanced Animation Effects */
        .extra-burst { 
          position: absolute; 
          pointer-events: none; 
          width: 320px; 
          height: 320px; 
          left: 50%; 
          top: 50%; 
          transform: translate(-50%, -50%) scale(0.6); 
          border-radius: 50%; 
          mix-blend-mode: screen; 
          animation: burstPop 1500ms ease-out forwards; 
          filter: blur(12px); 
        }
        
        @keyframes burstPop { 
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.1);
          }
          30% {
            opacity: 0.8;
            transform: translate(-50%, -50%) scale(1.2);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(2.0);
          }
        }
        
        .flying-clone { 
          position: fixed; 
          z-index: 10000; 
          pointer-events: none; 
          padding: 12px 18px; 
          border-radius: 16px; 
          font-weight: 800; 
          transform-origin: center; 
          transition: transform 1200ms cubic-bezier(.2,.9,.25,1), opacity 600ms ease; 
          box-shadow: 0 20px 50px rgba(2,6,23,0.8); 
          background: linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03)); 
          border: 1px solid rgba(255,255,255,0.15);
          backdrop-filter: blur(10px);
        }
        
        .extra-modal-backdrop { 
          position: fixed; 
          inset: 0; 
          background: rgba(0,0,0,0.75); 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          z-index: 10020; 
          backdrop-filter: blur(15px);
          animation: modalFadeIn 0.4s ease;
        }
        
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .extra-modal { 
          width: 480px; 
          background: rgba(8,8,18,0.98); 
          padding: 24px; 
          border-radius: 20px; 
          border: 1px solid rgba(255,255,255,0.08); 
          box-shadow: 0 25px 80px rgba(2,6,23,0.9); 
          max-height: 80vh; 
          overflow: auto;
          animation: modalSlideIn 0.4s cubic-bezier(0.2, 0.9, 0.25, 1);
        }
        
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-60px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .extra-modal h3{ 
          margin: 0 0 20px 0; 
          font-size: 20px; 
          color: #fff; 
          text-align: center;
        }
        
        .extra-modal p{ 
          margin: 10px 0; 
          color: rgba(255,255,255,0.9); 
          line-height: 1.5; 
        }
        
        .extra-modal .row{ 
          display: flex; 
          gap: 16px; 
          justify-content: flex-end; 
          margin-top: 20px; 
        }
        
        .extra-modal button{ 
          font-size: 14px; 
          padding: 12px 20px; 
          border-radius: 12px;
          border: none;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .extra-modal button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.3);
        }
        
        .notification-badge{
          position: absolute; 
          top: -10px; 
          right: -10px; 
          background: linear-gradient(135deg, #ff4757, #ff3742); 
          color: white; 
          border-radius: 50%; 
          width: 24px; 
          height: 24px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          font-size: 12px; 
          font-weight: 800; 
          animation: pulse 2s infinite;
          box-shadow: 0 4px 15px rgba(255, 71, 87, 0.4);
        }
        
        @keyframes pulse { 
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 4px 15px rgba(255, 71, 87, 0.4);
          }
          50% {
            transform: scale(1.1);
            box-shadow: 0 6px 20px rgba(255, 71, 87, 0.6);
          }
        }
        
        .trade-request-item{
          background: rgba(255,255,255,0.03); 
          border-radius: 16px; 
          padding: 20px; 
          margin: 16px 0; 
          border: 1px solid rgba(255,255,255,0.06);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        
        .trade-request-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
          transition: left 0.5s ease;
        }
        
        .trade-request-item:hover::before {
          left: 100%;
        }
        
        .trade-request-item:hover{
          background: rgba(255,255,255,0.06); 
          border-color: rgba(255,255,255,0.12);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.3);
        }
        
        .combo-effect{
          position: absolute; 
          top: 50%; 
          left: 50%; 
          transform: translate(-50%, -50%);
          font-size: 28px; 
          font-weight: 900; 
          color: #ffd76b; 
          text-shadow: 0 0 30px rgba(255,215,107,0.9);
          animation: comboAnim 2.5s ease-out forwards; 
          pointer-events: none; 
          z-index: 1000;
          text-align: center;
        }
        
        @keyframes comboAnim{
          0% {
            opacity: 0; 
            transform: translate(-50%, -50%) scale(0.3);
            filter: blur(5px);
          }
          20% {
            opacity: 1; 
            transform: translate(-50%, -50%) scale(1.3);
            filter: blur(0px);
          }
          80% {
            opacity: 1; 
            transform: translate(-50%, -50%) scale(1);
            filter: blur(0px);
          }
          100% {
            opacity: 0; 
            transform: translate(-50%, -50%) scale(0.8) translateY(-40px);
            filter: blur(2px);
          }
        }
        
        .streak-counter{
          position: absolute; 
          top: 16px; 
          left: 16px; 
          background: linear-gradient(135deg,#ff6b6b,#ee5a52);
          color: white; 
          padding: 8px 16px; 
          border-radius: 25px; 
          font-size: 14px; 
          font-weight: 700;
          box-shadow: 0 6px 20px rgba(238,90,82,0.4);
          animation: streakGlow 3s ease-in-out infinite;
        }
        
        @keyframes streakGlow {
          0%, 100% {
            box-shadow: 0 6px 20px rgba(238,90,82,0.4);
          }
          50% {
            box-shadow: 0 8px 30px rgba(238,90,82,0.7);
          }
        }
        
        .achievement-popup{
          position: fixed; 
          top: 30px; 
          right: 30px; 
          background: linear-gradient(135deg,#4ade80,#22c55e);
          color: white; 
          padding: 20px 24px; 
          border-radius: 16px; 
          font-weight: 700;
          box-shadow: 0 12px 35px rgba(34,197,94,0.5); 
          z-index: 10000;
          animation: slideInRight 0.6s cubic-bezier(0.2, 0.9, 0.25, 1) forwards;
          max-width: 300px;
          backdrop-filter: blur(10px);
        }
        
        @keyframes slideInRight{
          0% {
            transform: translateX(100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        /* Particle Effects */
        .particle {
          position: absolute;
          width: 6px;
          height: 6px;
          background: radial-gradient(circle, #ffd700 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
          z-index: 9999;
          animation: particleFloat 3s ease-in-out infinite;
        }
        
        @keyframes particleFloat {
          0%, 100% {
            transform: translateY(0) scale(1);
            opacity: 0;
          }
          50% {
            transform: translateY(-30px) scale(1.5);
            opacity: 1;
          }
        }
        
        /* Rarity Glow Effects */
        .item-legendary {
          animation: legendaryGlow 3s ease-in-out infinite;
        }
        
        @keyframes legendaryGlow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
          }
          50% {
            box-shadow: 0 0 40px rgba(255, 215, 0, 0.6);
          }
        }
        
        .item-epic {
          animation: epicGlow 4s ease-in-out infinite;
        }
        
        @keyframes epicGlow {
          0%, 100% {
            box-shadow: 0 0 15px rgba(139, 92, 246, 0.3);
          }
          50% {
            box-shadow: 0 0 30px rgba(139, 92, 246, 0.5);
          }
        }
        
        /* Loading Animation */
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(255, 255, 255, 0.1);
          border-left: 4px solid #6366f1;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Hover Effects */
        .hover-lift {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
        }
        
        /* Success/Error States */
        .success-state {
          border-color: #10b981 !important;
          box-shadow: 0 0 25px rgba(16, 185, 129, 0.4) !important;
          animation: successPulse 0.6s ease;
        }
        
        @keyframes successPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        .error-state {
          border-color: #ef4444 !important;
          box-shadow: 0 0 25px rgba(239, 68, 68, 0.4) !important;
          animation: errorShake 0.6s ease;
        }
        
        @keyframes errorShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
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
      createParticleEffect();
      return { ok:true, req };
    }
    
    function createParticleEffect() {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      for (let i = 0; i < 15; i++) {
        const particle = document.createElement("div");
        particle.className = "particle";
        particle.style.left = centerX + "px";
        particle.style.top = centerY + "px";
        document.body.appendChild(particle);
        
        const angle = (i / 15) * Math.PI * 2;
        const distance = 100 + Math.random() * 100;
        const targetX = centerX + Math.cos(angle) * distance;
        const targetY = centerY + Math.sin(angle) * distance;
        
        particle.animate([
          { transform: 'translate(0, 0) scale(1)', opacity: 1 },
          { transform: `translate(${targetX - centerX}px, ${targetY - centerY}px) scale(0)`, opacity: 0 }
        ], {
          duration: 2000,
          easing: 'ease-out',
          delay: i * 50
        }).onfinish = () => particle.remove();
      }
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
      createSuccessEffect();
      return { ok:true, item };
    }
    
    function createSuccessEffect() {
      const effect = document.createElement("div");
      effect.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 32px;
        font-weight: 900;
        color: #10b981;
        text-shadow: 0 0 30px rgba(16, 185, 129, 0.8);
        animation: successAnim 2s ease-out forwards;
        pointer-events: none;
        z-index: 10000;
      `;
      effect.textContent = "TRADE SUCCESS!";
      document.body.appendChild(effect);
      setTimeout(() => effect.remove(), 2000);
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
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
            <strong style="color:#4ade80;">${req.from}</strong>
            <span style="font-size:12px;color:rgba(255,255,255,0.6);">${timeAgo}m ago</span>
          </div>
          <p style="margin:6px 0;">wants to send you: <span style="color:#ffd76b;font-weight:600;">${req.item.name}</span></p>
          <p style="font-size:13px;color:rgba(255,255,255,0.7);margin:6px 0;">Rarity: ${req.item.rarity} | Value: ${req.item.value} coins</p>
        `;
        
        const row = document.createElement("div");
        row.className = "row";
        row.style.marginTop = "16px";
        
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
      closeRow.style.marginTop = "20px";
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
        setTimeout(() => effect.remove(), 2500);
      }
    }
    
    function showAchievementPopup(text){
      const popup = document.createElement("div");
      popup.className = "achievement-popup";
      popup.innerHTML = `🎉 ${text}`;
      document.body.appendChild(popup);
      setTimeout(() => popup.remove(), 4000);
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
        clone.style.transform += " translateY(-15px) scale(.6)"; 
      }, 1000);
      
      setTimeout(() => { 
        clone.remove(); 
      }, 1600);
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
            if(slotWindow && Math.random() < 0.4){
              const burst = document.createElement("div");
              burst.className = "extra-burst";
              burst.style.background = "radial-gradient(circle at 40% 40%, rgba(105,185,255,0.7), rgba(49,140,255,0.3), rgba(255,255,255,0))";
              slotWindow.appendChild(burst);
              setTimeout(() => burst.remove(), 1500);
            }
          }, 800);
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
              burst.style.background = "radial-gradient(circle at 30% 30%, rgba(255,215,107,0.9), rgba(255,184,77,0.5), rgba(255,111,145,0.3))";
              slotWindow.appendChild(burst);
              setTimeout(() => burst.remove(), 1800);
            }
          }, 1000);
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
          }, 1000);
        }
      }, 2000);
    });
  })();