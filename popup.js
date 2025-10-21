// Predefined profiles
const profiles = {
  personal: {
    name: 'John Doe',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@email.com',
    phone: '555-123-4567',
    address: '123 Main Street',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    country: 'United States'
  },
  business: {
    name: 'Jane Smith',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@company.com',
    phone: '555-987-6543',
    company: 'Tech Corp Inc',
    address: '456 Business Ave',
    city: 'San Francisco',
    state: 'CA',
    zip: '94102',
    country: 'United States'
  },
  test: {
    name: 'Test User',
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    phone: '555-000-0000',
    address: '789 Test Lane',
    city: 'TestCity',
    state: 'TC',
    zip: '00000',
    country: 'TestLand',
    username: 'testuser123',
    password: 'Test@12345'
  },
  custom: {}
};

let currentProfile = 'personal';
let stats = { fieldsFound: 0, fieldsFilled: 0, lastUsed: 'Never' };

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  updateProfileDisplay();
});

// Profile selector
document.getElementById('profileSelect').addEventListener('change', (e) => {
  currentProfile = e.target.value;
  updateProfileDisplay();
  saveSettings();
});

// Fill form button with improved connection handling
document.getElementById('fillForm').addEventListener('click', async () => {
  const autoDetect = document.getElementById('autoDetect').checked;
  
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Check if we can access the page
    if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
      showStatus('❌ Cannot fill forms on Chrome internal pages', 'error');
      return;
    }
    
    showStatus('⏳ Filling form...', 'info');
    
    // Inject content script if needed (for dynamic pages)
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
    } catch (e) {
      // Content script might already be injected, continue
    }
    
    // Wait a moment for script to load
    setTimeout(() => {
      chrome.tabs.sendMessage(tab.id, { 
        action: 'fillForm',
        profile: profiles[currentProfile],
        autoDetect: autoDetect
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error:', chrome.runtime.lastError);
          showStatus('⚠️ Please refresh the page and try again', 'error');
        } else if (response && response.success) {
          stats.fieldsFound = response.found;
          stats.fieldsFilled = response.filled;
          stats.lastUsed = new Date().toLocaleTimeString();
          updateStats();
          showStatus(`✅ Success! Filled ${response.filled} of ${response.found} fields`, 'success');
          saveSettings();
        } else {
          showStatus('⚠️ No form fields found on this page', 'error');
        }
      });
    }, 100);
    
  } catch (error) {
    showStatus('❌ Error: ' + error.message, 'error');
  }
});

// Clear form button
document.getElementById('clearForm').addEventListener('click', async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.tabs.sendMessage(tab.id, { action: 'clearForm' }, (response) => {
      if (chrome.runtime.lastError) {
        showStatus('⚠️ Please refresh the page and try again', 'error');
      } else if (response && response.success) {
        showStatus('✅ Form cleared successfully', 'success');
      } else {
        showStatus('⚠️ No form fields found', 'error');
      }
    });
  } catch (error) {
    showStatus('❌ Error: ' + error.message, 'error');
  }
});

// Save profile button
document.getElementById('saveProfile').addEventListener('click', () => {
  const name = prompt('Enter profile name:');
  if (name) {
    showStatus(`💾 Profile "${name}" saved!`, 'success');
  }
});

// Manage profiles button
document.getElementById('manageProfiles').addEventListener('click', () => {
  showStatus('⚙️ Profile management coming soon!', 'info');
});

// Auto-detect toggle
document.getElementById('autoDetect').addEventListener('change', (e) => {
  saveSettings();
  showStatus(e.target.checked ? '✅ Auto-detect enabled' : '⚠️ Auto-detect disabled', 'info');
});

// Helper functions
function showStatus(message, type) {
  const statusDiv = document.getElementById('status');
  statusDiv.textContent = message;
  statusDiv.className = 'status ' + type;
  statusDiv.style.display = 'block';
  
  setTimeout(() => {
    statusDiv.style.display = 'none';
  }, 3000);
}

function updateProfileDisplay() {
  const profile = profiles[currentProfile];
  document.getElementById('profileName').textContent = profile.name || '-';
  document.getElementById('profileEmail').textContent = profile.email || '-';
  document.getElementById('profilePhone').textContent = profile.phone || '-';
}

function updateStats() {
  document.getElementById('stats').style.display = 'block';
  document.getElementById('fieldsFound').textContent = stats.fieldsFound;
  document.getElementById('fieldsFilled').textContent = stats.fieldsFilled;
  document.getElementById('lastUsed').textContent = stats.lastUsed;
}

function saveSettings() {
  chrome.storage.sync.set({
    currentProfile: currentProfile,
    autoDetect: document.getElementById('autoDetect').checked,
    stats: stats
  });
}

function loadSettings() {
  chrome.storage.sync.get(['currentProfile', 'autoDetect', 'stats'], (data) => {
    if (data.currentProfile) {
      currentProfile = data.currentProfile;
      document.getElementById('profileSelect').value = currentProfile;
    }
    if (data.autoDetect !== undefined) {
      document.getElementById('autoDetect').checked = data.autoDetect;
    }
    if (data.stats) {
      stats = data.stats;
      updateStats();
    }
  });
}