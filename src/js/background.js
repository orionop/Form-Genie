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
                const response = await fetch("https://api.openai.com/v1/chat/completions", {
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
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error?.message || `API error: ${response.status}`);
                }

                const data = await response.json();
                
                if (data.error) {
                    throw new Error(data.error.message);
                }

                console.log("OpenAI response:", data);
                sendResponse({ answer: data.choices[0].message.content.trim() });
            } catch (error) {
                console.error("OpenAI API Error:", error);
                sendResponse({ error: error.message });
            }
        });

        return true; // Required for async sendResponse
    }
});