function extractSearchResults(websites) {
  const results = [];
  const resultElements = document.querySelectorAll('.g');
  
  resultElements.forEach((element) => {
    const titleElement = element.querySelector('h3');
    const linkElement = element.querySelector('a');
    const snippetElement = element.querySelector('.VwiC3b');

    if (titleElement && linkElement && snippetElement) {
      const link = linkElement.href;
      const result = {
        title: titleElement.textContent,
        link: link,
        snippet: snippetElement.textContent,
        priority: 0
      };

      // Check if the link contains any of the monitored websites
      const matchedWebsiteIndex = websites.findIndex(website => link?.toLowerCase().includes(website?.toLowerCase()));
      if (matchedWebsiteIndex !== -1) {
        result.priority = matchedWebsiteIndex + 1;
        results.push(result);
      }
    }
  });

  // Sort results by priority (highest first) and then by original order
  results.sort((a, b) => b.priority - a.priority);

  return results;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getResults") {
    const results = extractSearchResults(request.websites);
    chrome.runtime.sendMessage({ action: "showResults", results: results });
    sendResponse({ results: results }); // Send response back to background script
  }
  return true; // Indicates that the response will be sent asynchronously
});

// Don't extract results immediately, wait for the message from background.js
