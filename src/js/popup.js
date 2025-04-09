/* ======================
 * popup.js
 * ======================
 */
document.addEventListener("DOMContentLoaded", function () {
    console.log("Popup script loaded!");
    const button = document.getElementById("fillForm");
    const statusDiv = document.getElementById("status");
    const optionsLink = document.getElementById("openOptions");

    if (button) {
        button.addEventListener("click", async () => {
            try {
                button.disabled = true;
                button.textContent = 'Filling Form...';
                statusDiv.textContent = '';
                statusDiv.className = 'status';

                // Get the active tab
                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                
                if (!tab.url.includes('docs.google.com/forms')) {
                    throw new Error('Please open a Google Form first');
                }

                // Check if API key is set
                const result = await chrome.storage.sync.get(['openaiApiKey']);
                if (!result.openaiApiKey) {
                    throw new Error('OpenAI API key not found. Please set it in the extension options.');
                }

                // Send message to content script
                const response = await chrome.tabs.sendMessage(tab.id, { action: 'startFilling' });
                
                if (response.error) {
                    throw new Error(response.error);
                }

                statusDiv.textContent = 'Form filled successfully!';
                statusDiv.className = 'status success';
            } catch (error) {
                statusDiv.textContent = `Error: ${error.message}`;
                statusDiv.className = 'status error';
            } finally {
                button.disabled = false;
                button.textContent = 'Start Auto-Fill';
            }
        });
    } else {
        console.error("Button not found!");
    }

    if (optionsLink) {
        optionsLink.addEventListener("click", () => {
            chrome.runtime.openOptionsPage();
        });
    }
});

async function autoFillForm() {
    console.log("Form Genie AI Auto-Fill Started!");

    const formFields = document.querySelectorAll('input[type="text"], textarea');
    const skipKeywords = ["name", "phone", "email", "contact", "mobile"];

    for (let input of formFields) {
        const questionText = input.closest('.Qr7Oae')?.innerText || "default question";
        let isPersonal = skipKeywords.some(keyword => questionText.toLowerCase().includes(keyword));
        
        if (!isPersonal) {
            let aiResponse = await getLlamaResponse(questionText);
            if (!aiResponse || aiResponse.length === 0) {
                aiResponse = "Generated Answer";
                console.warn(`Llama failed for: ${questionText}, using fallback.`);
            }
            input.value = aiResponse;
            input.dispatchEvent(new Event("input", { bubbles: true }));
        }
    }

    console.log("Form Genie AI Auto-Fill Completed!");
}

async function getLlamaResponse(question) {
    try {
        const response = await fetch("http://127.0.0.1:11434/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "llama2",
                prompt: `Provide a short answer for: ${question}`,
                stream: false
            })
        });
        
        const data = await response.json();
        return data.response ? data.response.trim() : "";
    } catch (error) {
        console.error("Llama API Error:", error);
        return "";
    }
}
