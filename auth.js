
function loadUsers() {
  try {
    return JSON.parse(localStorage.getItem("users") || "{}");
  } catch (e) {
    console.error("Error loading users:", e);
    return {};
  }
}

function saveUsers(u) {
  try {
    localStorage.setItem("users", JSON.stringify(u));
  } catch (e) {
    console.error("Error saving users:", e);
    showNotification("Error saving data", "error");
  }
}

// Create Demo Users with 100 coins each
function createDemoUsers() {
  const users = loadUsers();
  
  // Create Owner
  if (!users['Owner']) {
    users['Owner'] = {
      password: 'owner1122',
      inventory: [],
      equipped: null,
      level: 100,
      xp: 999999,
      coins: 100,
      maxInventory: 1000,
      characters: [],
      squad: [],
      auras: [],
      freeSpins: 50,
      stats: {
        totalRolls: 9999,
        totalTrades: 9999,
        totalSales: 9999,
        legendaryFound: 999,
        epicFound: 999,
        rareFound: 999,
        bestItem: null,
        battlesWon: 9999,
        battlesLost: 0
      },
      achievements: [],
      tradeHistory: [],
      rollHistory: [],
      dailyStreak: 999,
      lastLoginDate: null,
      isOwner: true
    };
  }
  
  // Create demo users if only Owner exists
  if (Object.keys(users).length === 1) {
    users['Alice'] = {
      password: 'a',
      inventory: [],
      equipped: null,
      level: 1,
      xp: 0,
      coins: 100,
      maxInventory: 50,
      characters: [],
      squad: [],
      auras: [],
      freeSpins: 10,
      stats: {
        totalRolls: 0,
        totalTrades: 0,
        totalSales: 0,
        legendaryFound: 0,
        epicFound: 0,
        rareFound: 0,
        bestItem: null,
        battlesWon: 0,
        battlesLost: 0
      },
      achievements: [],
      tradeHistory: [],
      rollHistory: [],
      dailyStreak: 0,
      lastLoginDate: null
    };
    
    users['Bob'] = {
      password: 'b',
      inventory: [],
      equipped: null,
      level: 1,
      xp: 0,
      coins: 100,
      maxInventory: 50,
      characters: [],
      squad: [],
      auras: [],
      freeSpins: 10,
      stats: {
        totalRolls: 0,
        totalTrades: 0,
        totalSales: 0,
        legendaryFound: 0,
        epicFound: 0,
        rareFound: 0,
        bestItem: null,
        battlesWon: 0,
        battlesLost: 0
      },
      achievements: [],
      tradeHistory: [],
      rollHistory: [],
      dailyStreak: 0,
      lastLoginDate: null
    };
  }
  
  // Give 100 coins and 10 free spins to all users
  Object.keys(users).forEach(username => {
    if (users[username].coins < 100) {
      users[username].coins = 100;
    }
    if (!users[username].freeSpins) {
      users[username].freeSpins = 10;
    }
  });
  
  saveUsers(users);
}

// Utility Functions
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Authentication Functions
function handleLogin() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  
  if (!username || !password) {
    showNotification('Please fill in both fields', 'error');
    return;
  }
  
  const users = loadUsers();
  
  if (!users[username] || users[username].password !== password) {
    showNotification('Invalid username or password', 'error');
    return;
  }
  
  // Store current user and redirect
  localStorage.setItem('currentUser', username);
  showNotification(`Welcome back, ${username}!`, 'success');
  
  // Redirect to game
  setTimeout(() => {
    window.location.href = 'game.html';
  }, 1000);
}

function handleRegister() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  
  if (!username || !password) {
    showNotification('Please fill in both fields', 'error');
    return;
  }
  
  if (username.length < 3) {
    showNotification('Username must be at least 3 characters', 'error');
    return;
  }
  
  if (password.length < 3) {
    showNotification('Password must be at least 3 characters', 'error');
    return;
  }
  
  const users = loadUsers();
  if (users[username]) {
    showNotification('Username already exists', 'error');
    return;
  }
  
  // Create new user
  users[username] = {
    password: password,
    inventory: [],
    equipped: null,
    level: 1,
    xp: 0,
    coins: 100,
    maxInventory: 50,
    characters: [],
    squad: [],
    auras: [],
    freeSpins: 10,
    stats: {
      totalRolls: 0,
      totalTrades: 0,
      totalSales: 0,
      legendaryFound: 0,
      epicFound: 0,
      rareFound: 0,
      bestItem: null,
      battlesWon: 0,
      battlesLost: 0
    },
    achievements: [],
    tradeHistory: [],
    rollHistory: [],
    dailyStreak: 0,
    lastLoginDate: null
  };
  
  saveUsers(users);
  showNotification('Registration successful! You can now login.', 'success');
  
  // Clear form
  document.getElementById('username').value = '';
  document.getElementById('password').value = '';
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Create demo users
  createDemoUsers();
  
  // Check if user is already logged in
  const currentUser = localStorage.getItem('currentUser');
  if (currentUser) {
    // User is already logged in, redirect to game
    window.location.href = 'game.html';
    return;
  }
  
  // Add event listeners for auth buttons
  const loginBtn = document.getElementById('login-btn');
  const registerBtn = document.getElementById('register-btn');
  
  if (loginBtn) loginBtn.addEventListener('click', handleLogin);
  if (registerBtn) registerBtn.addEventListener('click', handleRegister);
  
  // Handle Enter key for auth
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  
  if (usernameInput) {
    usernameInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleLogin();
      }
    });
  }
  
  if (passwordInput) {
    passwordInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleLogin();
      }
    });
  }
});