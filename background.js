chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.set({ links: [] }, function() {
    console.log('Initialized links storage.');
  });
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'addLink') {
    chrome.storage.sync.get('links', function(data) {
      var links = data.links;
      links.push({ name: request.linkName, link: request.link });
      chrome.storage.sync.set({ links: links }, function() {
        sendResponse({ message: 'Link added successfully.' });
      });
    });
  }
});
