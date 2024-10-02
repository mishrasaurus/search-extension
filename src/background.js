chrome.runtime.onInstalled.addListener(function() {
  console.log('Extension installed');
  // Add your background script logic here
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('google.com/search')) {
    chrome.storage.sync.get('websites', function(data) {
      const websites = data.websites || [];
      chrome.tabs.sendMessage(tabId, { action: "getResults", websites: websites }, (response) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
          return;
        }
        if (response && response.results) {
          const resultCount = response.results.length;
          if (resultCount > 0) {
            chrome.action.setBadgeText({ text: resultCount.toString(), tabId: tabId });
            chrome.action.setBadgeBackgroundColor({ color: '#4CAF50', tabId: tabId });
            chrome.action.openPopup();
          } else {
            chrome.action.setBadgeText({ text: '', tabId: tabId });
          }
        }
      });
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "showResults") {
    console.log("Search Results:", request.results);
    if (request.results && request.results.length > 0) {
      chrome.action.openPopup();
    }
  }
});
