const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");
const logoutBtn = document.getElementById("logout-btn");
const authContainer = document.getElementById("auth-container");
const gameContainer = document.getElementById("game-container");
const playerNameDisplay = document.getElementById("player-name");
const authMessage = document.getElementById("auth-message");
const rollBtn = document.getElementById("roll-btn");
const rollResult = document.getElementById("roll-result");
let currentUser = null;

registerBtn.addEventListener("click", () => {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  if (!username || !password) {
    authMessage.textContent = "Please fill both fields!";
    return;
  }
  let users = JSON.parse(localStorage.getItem("users") || "{}");
  if (users[username]) {
    authMessage.textContent = "Username already exists!";
  } else {
    users[username] = password;
    localStorage.setItem("users", JSON.stringify(users));
    authMessage.textContent = "Registered successfully! You can login now.";
  }
});

loginBtn.addEventListener("click", () => {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  let users = JSON.parse(localStorage.getItem("users") || "{}");
  if (users[username] && users[username] === password) {
    currentUser = username;
    authContainer.style.display = "none";
    gameContainer.style.display = "block";
    playerNameDisplay.textContent = currentUser;
    authMessage.textContent = "";
  } else {
    authMessage.textContent = "Invalid username or password!";
  }
});

logoutBtn.addEventListener("click", () => {
  currentUser = null;
  authContainer.style.display = "block";
  gameContainer.style.display = "none";
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
});

rollBtn.addEventListener("click", () => {
  rollBtn.disabled = true;
  let count = 0;
  const interval = setInterval(() => {
    const randomItem = items[Math.floor(Math.random() * items.length)];
    rollResult.textContent = `Rolling... ${randomItem.name}`;
    count++;
    if (count > 10) {
      clearInterval(interval);
      const finalItem = rollItem();
      rollResult.textContent = `You got ${finalItem.name} (${finalItem.rarity})! 🎉`;
      rollBtn.disabled = false;
    }
  }, 100);
});
