// Background script for handling extension lifecycle events

chrome.runtime.onInstalled.addListener(() => {
  console.log('Auto Form Filler installed');
  
  // Set default data in storage
  chrome.storage.sync.set({
    testData: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '5551234567'
    }
  });
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getData') {
    chrome.storage.sync.get('testData', (data) => {
      sendResponse({ data: data.testData });
    });
    return true; // Keep message channel open
  }
});