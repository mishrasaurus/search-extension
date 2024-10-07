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
      <h3><a class="link" href="${result.link}" target="_blank">${result.title}</a></h3>
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

      if (!currentTab) {
        console.error('Unable to get current tab');
        document.getElementById('results').innerHTML = '<p class="no-results">Error: Unable to access current page. Please try again.</p>';
        return;
      }

      chrome.tabs.sendMessage(currentTab.id, {action: "getResults", websites: websites}, (response) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
          document.getElementById('results').innerHTML = '<p class="no-results">This extension only works on Google, Bing, and DuckDuckGo search result pages.</p>';
          return;
        }
        if (response && response.results) {
          displayResults(response.results);
        } else {
          document.getElementById('results').innerHTML = '<p class="no-results">No results available.</p>';
        }
      });
    });
  });
}

document.addEventListener('DOMContentLoaded', loadResults);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "showResults") {
    displayResults(request.results);
  }
});

document.addEventListener('click', evt => {
  const a = evt.target.closest('.link');
  if (a) {
    evt.preventDefault();
    const isNewTab = evt.metaKey || evt.ctrlKey; // Command key on Mac or Control key on Windows/Linux
    
    if (isNewTab) {
      chrome.tabs.create({ url: a.href, active: false });
    } else {
      chrome.tabs.update({ url: a.href });
    }
  }
});
