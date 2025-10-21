// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fillForm') {
    const result = fillFormFields(request.profile, request.autoDetect);
    sendResponse({ success: result.filled > 0, filled: result.filled, found: result.found });
  } else if (request.action === 'clearForm') {
    const result = clearFormFields();
    sendResponse({ success: result });
  }
  return true;
});

// Enhanced form filling with smart detection
function fillFormFields(profileData, autoDetect = true) {
  let fieldsFound = 0;
  let fieldsFilled = 0;
  
  const formElements = document.querySelectorAll('input, textarea, select');
  
  formElements.forEach(element => {
    // Skip unwanted field types
    if (element.type === 'hidden' || element.type === 'submit' || 
        element.type === 'button' || element.type === 'image' ||
        element.type === 'file' || element.disabled || element.readOnly) {
      return;
    }
    
    fieldsFound++;
    
    const name = element.name?.toLowerCase() || '';
    const id = element.id?.toLowerCase() || '';
    const placeholder = element.placeholder?.toLowerCase() || '';
    const type = element.type?.toLowerCase() || '';
    const ariaLabel = element.getAttribute('aria-label')?.toLowerCase() || '';
    const className = element.className?.toLowerCase() || '';
    
    // Combined field identifier
    const fieldIdentifier = `${name} ${id} ${placeholder} ${ariaLabel} ${className}`;
    
    let filled = false;
    let value = '';
    
    // Smart field detection with scoring
    const fieldMatches = {
      email: ['email', 'e-mail', 'mail'],
      phone: ['phone', 'tel', 'mobile', 'cell'],
      firstName: ['firstname', 'first-name', 'first_name', 'fname', 'given'],
      lastName: ['lastname', 'last-name', 'last_name', 'lname', 'surname', 'family'],
      name: ['name', 'fullname', 'full-name', 'full_name'],
      address: ['address', 'street', 'addr', 'line1'],
      city: ['city', 'town', 'locality'],
      state: ['state', 'province', 'region'],
      zip: ['zip', 'postal', 'postcode', 'pincode'],
      country: ['country', 'nation'],
      company: ['company', 'organization', 'org'],
      username: ['username', 'user', 'login'],
      password: ['password', 'pass', 'pwd']
    };
    
    // Check email
    if (type === 'email' || matchesAny(fieldIdentifier, fieldMatches.email)) {
      value = profileData.email;
      filled = true;
    }
    // Check phone
    else if (type === 'tel' || matchesAny(fieldIdentifier, fieldMatches.phone)) {
      value = profileData.phone;
      filled = true;
    }
    // Check first name
    else if (matchesAny(fieldIdentifier, fieldMatches.firstName)) {
      value = profileData.firstName;
      filled = true;
    }
    // Check last name
    else if (matchesAny(fieldIdentifier, fieldMatches.lastName)) {
      value = profileData.lastName;
      filled = true;
    }
    // Check full name
    else if (matchesAny(fieldIdentifier, fieldMatches.name) && !matchesAny(fieldIdentifier, [...fieldMatches.firstName, ...fieldMatches.lastName])) {
      value = profileData.name;
      filled = true;
    }
    // Check address
    else if (matchesAny(fieldIdentifier, fieldMatches.address)) {
      value = profileData.address;
      filled = true;
    }
    // Check city
    else if (matchesAny(fieldIdentifier, fieldMatches.city)) {
      value = profileData.city;
      filled = true;
    }
    // Check state
    else if (matchesAny(fieldIdentifier, fieldMatches.state)) {
      value = profileData.state;
      filled = true;
    }
    // Check zip
    else if (matchesAny(fieldIdentifier, fieldMatches.zip)) {
      value = profileData.zip;
      filled = true;
    }
    // Check country
    else if (matchesAny(fieldIdentifier, fieldMatches.country)) {
      value = profileData.country;
      filled = true;
    }
    // Check company
    else if (matchesAny(fieldIdentifier, fieldMatches.company)) {
      value = profileData.company;
      filled = true;
    }
    // Check username
    else if (matchesAny(fieldIdentifier, fieldMatches.username)) {
      value = profileData.username;
      filled = true;
    }
    // Check password
    else if (type === 'password' || matchesAny(fieldIdentifier, fieldMatches.password)) {
      value = profileData.password;
      filled = true;
    }
    // Check date
    else if (type === 'date') {
      value = new Date().toISOString().split('T')[0];
      filled = true;
    }
    // Check number (generic)
    else if (type === 'number' && profileData.age) {
      value = profileData.age;
      filled = true;
    }
    // Check textarea
    else if (element.tagName === 'TEXTAREA') {
      value = profileData.message || 'This is a test message.';
      filled = true;
    }
    // Check text inputs (fallback)
    else if (type === 'text' && autoDetect) {
      // Try to guess based on position or context
      value = profileData.name || '';
      filled = !!value;
    }
    
    if (filled && value) {
      // Set the value
      element.value = value;
      fieldsFilled++;
      
      // Trigger all necessary events for frameworks
      const events = ['input', 'change', 'blur', 'keyup'];
      events.forEach(eventType => {
        element.dispatchEvent(new Event(eventType, { bubbles: true }));
      });
      
      // Visual feedback with smooth animation
      element.style.transition = 'all 0.3s ease';
      element.style.backgroundColor = '#90EE90';
      element.style.border = '2px solid #4CAF50';
      
      setTimeout(() => {
        element.style.backgroundColor = '';
        element.style.border = '';
      }, 1500);
    }
  });
  
  // Show completion message
  if (fieldsFilled > 0) {
    showNotification(`✅ Filled ${fieldsFilled} out of ${fieldsFound} fields`);
  }
  
  return { found: fieldsFound, filled: fieldsFilled };
}

// Clear form fields
function clearFormFields() {
  let cleared = 0;
  const formElements = document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea');
  
  formElements.forEach(element => {
    if (!element.disabled && !element.readOnly) {
      element.value = '';
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
      
      // Visual feedback
      element.style.transition = 'all 0.3s ease';
      element.style.backgroundColor = '#ffebee';
      setTimeout(() => {
        element.style.backgroundColor = '';
      }, 1000);
      
      cleared++;
    }
  });
  
  if (cleared > 0) {
    showNotification(`🗑️ Cleared ${cleared} fields`);
  }
  
  return cleared > 0;
}

// Helper function to match field identifiers
function matchesAny(text, keywords) {
  return keywords.some(keyword => text.includes(keyword));
}

// Show in-page notification
function showNotification(message) {
  // Remove existing notification
  const existing = document.getElementById('formfiller-notification');
  if (existing) existing.remove();
  
  const notification = document.createElement('div');
  notification.id = 'formfiller-notification';
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 15px 25px;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    z-index: 999999;
    font-family: Arial, sans-serif;
    font-size: 14px;
    font-weight: 600;
    animation: slideInRight 0.3s ease;
  `;
  
  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideInRight {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.transition = 'all 0.3s ease';
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(400px)';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}