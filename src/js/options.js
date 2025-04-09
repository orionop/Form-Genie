document.addEventListener('DOMContentLoaded', function() {
    const apiKeyInput = document.getElementById('apiKey');
    const saveButton = document.getElementById('save');
    const statusDiv = document.getElementById('status');
    const testButton = document.createElement('button');
    
    // Create test button
    testButton.id = 'test';
    testButton.textContent = 'Test API Key';
    testButton.style.marginLeft = '10px';
    saveButton.parentNode.insertBefore(testButton, saveButton.nextSibling);

    // Load saved API key
    chrome.storage.sync.get(['openaiApiKey'], function(result) {
        if (result.openaiApiKey) {
            // Mask the API key for security, only showing the first 3 and last 4 characters
            const key = result.openaiApiKey;
            if (key.length > 10) {
                apiKeyInput.value = key.substring(0, 3) + '••••••••••••••••' + key.substring(key.length - 4);
                apiKeyInput.dataset.fullKey = key; // Store the full key in a data attribute
            } else {
                apiKeyInput.value = key;
            }
        }
    });
    
    // Handle clicking in the input to show the full key or clear the placeholder
    apiKeyInput.addEventListener('focus', function() {
        if (apiKeyInput.dataset.fullKey) {
            apiKeyInput.value = apiKeyInput.dataset.fullKey;
        }
    });
    
    // Handle clicking away from the input to re-mask the key
    apiKeyInput.addEventListener('blur', function() {
        if (!apiKeyInput.value.trim()) return;
        
        if (apiKeyInput.value !== apiKeyInput.dataset.fullKey) {
            // User changed the key, don't mask it yet
            return;
        }
        
        const key = apiKeyInput.value;
        if (key.length > 10) {
            apiKeyInput.value = key.substring(0, 3) + '••••••••••••••••' + key.substring(key.length - 4);
        }
    });

    // Save API key
    saveButton.addEventListener('click', function() {
        const apiKey = apiKeyInput.value.trim();
        
        if (!apiKey) {
            showStatus('Please enter an API key', 'error');
            return;
        }

        // Check if the key is masked (unchanged)
        if (apiKey.includes('••••') && apiKeyInput.dataset.fullKey) {
            showStatus('API key unchanged', 'info');
            return;
        }

        // Basic validation for OpenAI API key format
        if (!apiKey.startsWith('sk-') || apiKey.length < 20) {
            showStatus('Invalid API key format. OpenAI API keys start with "sk-" and are at least 20 characters long', 'error');
            return;
        }

        chrome.storage.sync.set({ openaiApiKey: apiKey }, function() {
            apiKeyInput.dataset.fullKey = apiKey; // Update the stored full key
            const maskedKey = apiKey.substring(0, 3) + '••••••••••••••••' + apiKey.substring(apiKey.length - 4);
            apiKeyInput.value = maskedKey;
            showStatus('API key saved successfully!', 'success');
        });
    });
    
    // Test API key
    testButton.addEventListener('click', async function() {
        let apiKey = apiKeyInput.value.trim();
        
        // If masked, use the full key from dataset
        if (apiKey.includes('••••') && apiKeyInput.dataset.fullKey) {
            apiKey = apiKeyInput.dataset.fullKey;
        }
        
        if (!apiKey) {
            showStatus('Please enter an API key to test', 'error');
            return;
        }
        
        // Show testing status
        showStatus('Testing API key...', 'info', 30000);
        
        try {
            // Make a small call to the OpenAI API to check if the key is valid
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        { role: 'system', content: 'You are a helpful assistant.' },
                        { role: 'user', content: 'Say "API key is valid" in one short sentence' }
                    ],
                    max_tokens: 10
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showStatus('API key is valid! ✅', 'success');
            } else if (data.error) {
                let errorMessage = data.error.message || 'Unknown error';
                
                // Provide more helpful messages for common errors
                if (data.error.type === 'invalid_request_error') {
                    errorMessage = 'Invalid API key. Please check your API key and try again.';
                } else if (data.error.type === 'insufficient_quota') {
                    errorMessage = 'Your account has insufficient quota. Please check your billing status.';
                }
                
                showStatus(`API Error: ${errorMessage}`, 'error');
            } else {
                showStatus('Unknown error testing API key', 'error');
            }
        } catch (error) {
            showStatus(`Error: ${error.message}`, 'error');
        }
    });

    function showStatus(message, type, duration = 3000) {
        statusDiv.textContent = message;
        statusDiv.className = `status ${type}`;
        statusDiv.style.display = 'block';
        
        // Clear any existing timeout
        if (statusDiv.hideTimeout) {
            clearTimeout(statusDiv.hideTimeout);
        }
        
        // Only auto-hide success and info messages
        if (type === 'success' || type === 'info') {
            statusDiv.hideTimeout = setTimeout(() => {
                statusDiv.style.display = 'none';
            }, duration);
        }
    }
}); 