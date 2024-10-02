// Load saved websites
function loadWebsites() {
  chrome.storage.sync.get('websites', function(data) {
    const websites = data.websites || [];
    const websiteList = document.getElementById('websiteList');
    websiteList.innerHTML = '';
    websites.forEach((website, index) => {
      const item = document.createElement('div');
      item.className = 'website-item';
      item.innerHTML = `
        <span>${website}</span>
        <button class="remove-website" data-index="${index}">Remove</button>
      `;
      websiteList.appendChild(item);
    });
  });
}

// Save websites
function saveWebsites(websites) {
  chrome.storage.sync.set({websites: websites}, function() {
    // Update status to let user know options were saved.
    const status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Add website
function addWebsite() {
  const newWebsite = document.getElementById('newWebsite').value.trim();
  if (newWebsite) {
    chrome.storage.sync.get('websites', function(data) {
      const websites = data.websites || [];
      websites.push(newWebsite);
      saveWebsites(websites);
      loadWebsites();
      document.getElementById('newWebsite').value = '';
    });
  }
}

// Event listener for the Add Website button
document.getElementById('addWebsite').addEventListener('click', addWebsite);

// Event listener for the Enter key in the input field
document.getElementById('newWebsite').addEventListener('keyup', function(event) {
  if (event.key === 'Enter') {
    addWebsite();
  }
});

// Remove website
document.getElementById('websiteList').addEventListener('click', function(e) {
  if (e.target.classList.contains('remove-website')) {
    const index = parseInt(e.target.getAttribute('data-index'));
    chrome.storage.sync.get('websites', function(data) {
      const websites = data.websites || [];
      websites.splice(index, 1);
      saveWebsites(websites);
      loadWebsites();
    });
  }
});

// Load websites when the options page is opened
document.addEventListener('DOMContentLoaded', loadWebsites);

// Theme toggle functionality
function setTheme(isDark) {
  document.body.classList.toggle('dark-theme', isDark);
  chrome.storage.sync.set({isDarkTheme: isDark});
}

document.addEventListener('DOMContentLoaded', function() {
  loadWebsites();
  
  // Load saved theme preference
  chrome.storage.sync.get('isDarkTheme', function(data) {
    const isDark = data.isDarkTheme || false;
    document.getElementById('theme-switch').checked = isDark;
    setTheme(isDark);
  });
});

document.getElementById('theme-switch').addEventListener('change', function(e) {
  setTheme(e.target.checked);
});
