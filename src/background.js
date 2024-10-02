chrome.runtime.onInstalled.addListener(function() {
  chrome.runtime.openOptionsPage();
});

chrome.webNavigation.onCompleted.addListener((details) => {
  if (details.url) {
    chrome.storage.sync.get('websites', function(data) {
      const websites = data.websites || [];
      chrome.tabs.sendMessage(details.tabId, { action: "getResults", websites: websites }, (response) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
          return;
        }
        if (response && response.results) {
          const resultCount = response.results.length;
          if (resultCount > 0) {
            chrome.action.setBadgeText({ text: resultCount.toString(), tabId: details.tabId });
            chrome.action.setBadgeBackgroundColor({ color: '#4CAF50', tabId: details.tabId });
            chrome.action.openPopup();
          } else {
            chrome.action.setBadgeText({ text: '', tabId: details.tabId });
          }
        }
      });
    });
  }
}, { 
  url: [
    { urlContains: 'google.com/search' },
    { urlContains: 'bing.com/search' },
    { urlContains: 'duckduckgo.com/' }
  ] 
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "showResults") {
    console.log("Search Results:", request.results);
    if (request.results && request.results.length > 0) {
      chrome.action.openPopup();
    }
  }
});
