document.getElementById('fillForm').addEventListener('click', async () => {
  const statusDiv = document.getElementById('status');
  
  try {
    // Get the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Send message to content script to fill the form
    chrome.tabs.sendMessage(tab.id, { action: 'fillForm' }, (response) => {
      if (chrome.runtime.lastError) {
        showStatus('Error: ' + chrome.runtime.lastError.message, 'error');
      } else if (response && response.success) {
        showStatus('Form filled successfully!', 'success');
      } else {
        showStatus('No form fields found on this page', 'error');
      }
    });
  } catch (error) {
    showStatus('Error: ' + error.message, 'error');
  }
});

document.getElementById('saveData').addEventListener('click', () => {
  // Open options page or show input fields for custom data
  showStatus('Custom data feature coming soon!', 'success');
});

function showStatus(message, type) {
  const statusDiv = document.getElementById('status');
  statusDiv.textContent = message;
  statusDiv.className = 'status ' + type;
  statusDiv.style.display = 'block';
  
  setTimeout(() => {
    statusDiv.style.display = 'none';
  }, 3000);
}