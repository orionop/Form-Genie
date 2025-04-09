document.addEventListener('DOMContentLoaded', function() {
    const apiKeyInput = document.getElementById('apiKey');
    const saveButton = document.getElementById('save');
    const statusDiv = document.getElementById('status');

    // Load saved API key
    chrome.storage.sync.get(['openaiApiKey'], function(result) {
        if (result.openaiApiKey) {
            apiKeyInput.value = result.openaiApiKey;
        }
    });

    // Save API key
    saveButton.addEventListener('click', function() {
        const apiKey = apiKeyInput.value.trim();
        
        if (!apiKey) {
            showStatus('Please enter an API key', 'error');
            return;
        }

        // Basic validation for OpenAI API key format
        if (!apiKey.startsWith('sk-') || apiKey.length < 20) {
            showStatus('Invalid API key format. OpenAI API keys start with "sk-"', 'error');
            return;
        }

        chrome.storage.sync.set({ openaiApiKey: apiKey }, function() {
            showStatus('API key saved successfully!', 'success');
        });
    });

    function showStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.className = `status ${type}`;
        statusDiv.style.display = 'block';
        
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 3000);
    }
}); 