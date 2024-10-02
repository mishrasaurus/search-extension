function extractSearchResults(websites, searchEngine) {
  const results = [];
  let resultElements;

  switch (searchEngine) {
    case 'google':
      resultElements = document.querySelectorAll('.g');
      break;
    case 'bing':
      resultElements = document.querySelectorAll('.b_algo');
      break;
    case 'duckduckgo':
      resultElements = document.querySelectorAll('article[data-testid="result"]');
      break;
    default:
      return results;
  }
  
  resultElements.forEach((element) => {
    let titleElement, linkElement, snippetElement;

    switch (searchEngine) {
      case 'google':
        titleElement = element.querySelector('h3');
        linkElement = element.querySelector('a');
        snippetElement = element.querySelector('.VwiC3b');
        
        if(!snippetElement) {
          const emElement = element.querySelector('em');
        snippetElement = emElement ? emElement.closest('div[style*="-webkit-line-clamp"]') : null;
        }
        break;
      case 'bing':
        titleElement = element.querySelector('h2');
        linkElement = element.querySelector('a');
        snippetElement = element.querySelector('.b_caption p');
        if (!snippetElement) {
          snippetElement = element.querySelector('.b_algoSlug');
        }
        break;
      case 'duckduckgo':
        titleElement = element.querySelector('h2');
        linkElement = element.querySelector('a[data-testid="result-title-a"]');
        snippetElement = element.querySelector('div[data-result="snippet"]');
        break;
    }

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

  return results;
}

function detectSearchEngine(url) {
  if (url.includes('google.com/search')) return 'google';
  if (url.includes('bing.com/search')) return 'bing';
  if (url.includes('duckduckgo.com/')) return 'duckduckgo';
  return null;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getResults") {
    const currentUrl = window.location.href;
    const searchEngine = detectSearchEngine(currentUrl);

    if (!searchEngine) {
      sendResponse({results: null});
      return true;
    }

    const websites = request.websites;
    const results = extractSearchResults(websites, searchEngine);
    sendResponse({results: results});
  }
  return true;
});

// Don't extract results immediately, wait for the message from background.js
