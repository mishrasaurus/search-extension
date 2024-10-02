function displayResults(results) {
  const resultsContainer = document.getElementById('results');
  resultsContainer.innerHTML = '';

  if (results.length === 0) {
    resultsContainer.innerHTML = '<p class="no-results">No matching results found.</p>';
    return;
  }

  results.forEach((result) => {
    const resultElement = document.createElement('div');
    resultElement.className = 'result';
    resultElement.innerHTML = `
      <h3><a href="${result.link}" target="_blank">${result.title}</a></h3>
      <div class="url">${result.link}</div>
      <div class="snippet">${result.snippet}</div>
    `;
    resultsContainer.appendChild(resultElement);
  });
}

function updateOptionsLink(websitesCount) {
  const optionsLink = document.getElementById('options-link');
  optionsLink.innerHTML = `
    <a href="#" id="open-options">Manage sites (${websitesCount})</a>
  `;
  
  document.getElementById('open-options').addEventListener('click', function(e) {
    e.preventDefault();
    chrome.tabs.create({url: 'chrome-extension://' + chrome.runtime.id + '/options.html'});
  });
}

function loadResults() {
  chrome.storage.sync.get(['websites', 'isDarkTheme'], function(data) {
    const websites = data.websites || [];
    const isDark = data.isDarkTheme || false;
    document.body.classList.toggle('dark-theme', isDark);
    updateOptionsLink(websites.length);

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      const currentTab = tabs[0];
      if (currentTab.url.includes('google.com/search')) {
        chrome.tabs.sendMessage(currentTab.id, {action: "getResults", websites: websites}, (response) => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            document.getElementById('results').innerHTML = '<p class="no-results">Error: Unable to fetch results.</p>';
            return;
          }
          if (response && response.results) {
            displayResults(response.results);
          } else {
            document.getElementById('results').innerHTML = '<p class="no-results">No results available.</p>';
          }
        });
      } else {
        document.getElementById('results').innerHTML = '<p class="no-results">This extension only works on Google search result pages.</p>';
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', loadResults);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "showResults") {
    displayResults(request.results);
  }
});
