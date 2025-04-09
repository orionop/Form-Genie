/* ======================
 * background.js
 * ======================
 */

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Received message:", request);

    if (request.action === "fetchLlamaResponse") {
        // Get API key from storage
        chrome.storage.sync.get(['openaiApiKey'], async (result) => {
            if (!result.openaiApiKey) {
                sendResponse({ error: "OpenAI API key not found. Please set it in the extension options." });
                return;
            }

            try {
                console.log("Making OpenAI API request for question:", request.question.substring(0, 50) + "...");
                
                const apiRequest = {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${result.openaiApiKey}`
                    },
                    body: JSON.stringify({
                        model: "gpt-3.5-turbo",
                        messages: [
                            {
                                role: "system",
                                content: "You are a helpful assistant that provides concise, relevant answers to form questions. Keep your answers brief and to the point. For multiple choice questions, select the most appropriate option from the given choices."
                            },
                            {
                                role: "user",
                                content: request.question
                            }
                        ],
                        max_tokens: 150,
                        temperature: 0.7
                    })
                };
                
                // First attempt
                let response = await fetch("https://api.openai.com/v1/chat/completions", apiRequest);
                
                // If first attempt fails, retry once
                if (!response.ok && response.status >= 500) {
                    console.log("Server error, retrying request once...");
                    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
                    response = await fetch("https://api.openai.com/v1/chat/completions", apiRequest);
                }

                // Handle response
                if (!response.ok) {
                    const errorData = await response.json();
                    console.error("API error response:", errorData);
                    
                    // Format error message based on OpenAI's error structure
                    let errorMessage = `API error: ${response.status}`;
                    if (errorData.error) {
                        if (errorData.error.message) {
                            errorMessage = errorData.error.message;
                        }
                        if (errorData.error.type === 'invalid_request_error') {
                            errorMessage = "Invalid API key or request. Please check your OpenAI API key in settings.";
                        } else if (errorData.error.type === 'insufficient_quota') {
                            errorMessage = "Your OpenAI account has insufficient quota. Please check your billing status.";
                        }
                    }
                    
                    throw new Error(errorMessage);
                }

                const data = await response.json();
                
                if (data.error) {
                    throw new Error(data.error.message);
                }

                console.log("OpenAI response received successfully");
                sendResponse({ answer: data.choices[0].message.content.trim() });
            } catch (error) {
                console.error("OpenAI API Error:", error);
                sendResponse({ error: "API error: " + error.message });
            }
        });

        return true; // Required for async sendResponse
    }
});

// Show welcome message on extension installation
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install") {
        chrome.tabs.create({
            url: chrome.runtime.getURL("src/html/options.html")
        });
    }
});