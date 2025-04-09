/* ======================
 * popup.js
 * ======================
 */
document.addEventListener("DOMContentLoaded", function () {
    console.log("Popup script loaded!");
    const button = document.getElementById("fillForm");
    const statusDiv = document.getElementById("status");
    const optionsLink = document.getElementById("openOptions");
    const toggleDebugBtn = document.getElementById("toggleDebug");
    const debugSection = document.getElementById("debug-section");
    const diagnosticsBtn = document.getElementById("runDiagnostics");
    const diagnosticsInfo = document.getElementById("diagnostics-info");
    const directMethodBtn = document.getElementById("applyDirectMethod");
    const fixRadioBtn = document.getElementById("fixRadioButtons");

    // Debug toggle button
    if (toggleDebugBtn) {
        toggleDebugBtn.addEventListener("click", () => {
            const isVisible = debugSection.style.display === "block";
            debugSection.style.display = isVisible ? "none" : "block";
            toggleDebugBtn.textContent = isVisible ? "Show Debug Info" : "Hide Debug Info";
        });
    }
    
    // Radio button fixing button
    if (fixRadioBtn) {
        fixRadioBtn.addEventListener("click", async () => {
            try {
                fixRadioBtn.disabled = true;
                fixRadioBtn.textContent = "Fixing...";
                statusDiv.textContent = "Fixing radio buttons...";
                statusDiv.className = "status";
                
                // Get the active tab
                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                
                if (!tab.url.includes('docs.google.com/forms')) {
                    throw new Error('Please open a Google Form first');
                }
                
                // Execute a content script to specifically target radio buttons
                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: () => {
                        console.log("Form Genie: Focused radio button fixing");
                        
                        // Look for elements that might be radio buttons or their containers
                        const potentialRadioElements = document.querySelectorAll(
                            'input[type="radio"], .appsMaterialWizToggleRadiogroupEl, ' + 
                            '.docssharedWizToggleLabeledControl, .freebirdThemedRadio, ' + 
                            '.quantumWizTogglePaperradioEl, .exportOuterCircle, .exportInnerCircle, ' +
                            '.freebirdFormviewerViewItemsItemItem:has(input[type="radio"]), ' +
                            'div[role="listitem"]:has(input[type="radio"])'
                        );
                        
                        console.log(`Found ${potentialRadioElements.length} potential radio elements`);
                        
                        // Group by question container
                        const radiosByContainer = {};
                        
                        potentialRadioElements.forEach(el => {
                            // Find the container
                            const container = el.closest('div[role="listitem"], .freebirdFormviewerViewItemsItemItem');
                            if (container) {
                                const containerId = container.id || container.getAttribute('data-item-id') || Math.random().toString(36).substr(2, 9);
                                if (!radiosByContainer[containerId]) {
                                    radiosByContainer[containerId] = [];
                                }
                                radiosByContainer[containerId].push(el);
                            }
                        });
                        
                        console.log(`Grouped into ${Object.keys(radiosByContainer).length} containers`);
                        
                        // For each question container, select the first radio option
                        Object.keys(radiosByContainer).forEach(containerId => {
                            const elements = radiosByContainer[containerId];
                            if (elements.length > 0) {
                                // Find the first actual radio button if possible
                                const radioInput = elements.find(el => el.tagName === 'INPUT' && el.type === 'radio');
                                const elementToClick = radioInput || elements[0];
                                
                                try {
                                    // First try to set the checked property if it's a real radio button
                                    if (elementToClick.tagName === 'INPUT' && elementToClick.type === 'radio') {
                                        elementToClick.checked = true;
                                    }
                                    
                                    // Then try clicking it
                                    elementToClick.click();
                                    
                                    // Also try clicking the label if available
                                    if (elementToClick.id) {
                                        const label = document.querySelector(`label[for="${elementToClick.id}"]`);
                                        if (label) {
                                            label.click();
                                        }
                                    }
                                    
                                    // Try clicking parent elements that might contain the actual click handler
                                    let currentElement = elementToClick;
                                    for (let i = 0; i < 3; i++) {
                                        if (currentElement.parentElement) {
                                            currentElement = currentElement.parentElement;
                                            currentElement.click();
                                        }
                                    }
                                    
                                    // For Google Forms, also try clicking specific parts
                                    const container = elements[0].closest('div[role="listitem"], .freebirdFormviewerViewItemsItemItem');
                                    if (container) {
                                        // Try to find the actual visual radio elements
                                        const radioCircles = container.querySelectorAll('.appsMaterialWizToggleRadiogroupOffRadio, .appsMaterialWizToggleRadiogroupOnRadio, .exportOuterCircle');
                                        if (radioCircles.length > 0) {
                                            radioCircles[0].click();
                                        }
                                    }
                                    
                                } catch (err) {
                                    console.error("Error clicking radio:", err);
                                }
                            }
                        });
                        
                        return {
                            containers: Object.keys(radiosByContainer).length,
                            elements: potentialRadioElements.length
                        };
                    }
                }).then(results => {
                    console.log("Radio fixing results:", results[0].result);
                    return results[0].result;
                });
                
                statusDiv.textContent = "Radio buttons fixed! Check the form.";
                statusDiv.className = "status success";
                
            } catch (error) {
                console.error("Radio fixing error:", error);
                statusDiv.textContent = `Error: ${error.message}`;
                statusDiv.className = "status error";
            } finally {
                fixRadioBtn.disabled = false;
                fixRadioBtn.textContent = "Fix Radio Buttons";
            }
        });
    }
    
    // Direct form manipulation button
    if (directMethodBtn) {
        directMethodBtn.addEventListener("click", async () => {
            try {
                directMethodBtn.disabled = true;
                directMethodBtn.textContent = "Applying...";
                statusDiv.textContent = "Applying direct manipulation...";
                statusDiv.className = "status";
                
                // Get the active tab
                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                
                if (!tab.url.includes('docs.google.com/forms')) {
                    throw new Error('Please open a Google Form first');
                }
                
                // Send message to content script to apply direct manipulation
                console.log("Requesting direct manipulation");
                const response = await chrome.tabs.sendMessage(tab.id, { action: 'applyDirectManipulation' });
                console.log("Direct manipulation response:", response);
                
                if (response && response.success) {
                    statusDiv.textContent = "Direct form manipulation applied!";
                    statusDiv.className = "status success";
                } else {
                    throw new Error("Failed to apply direct manipulation");
                }
            } catch (error) {
                console.error("Direct manipulation error:", error);
                statusDiv.textContent = `Error: ${error.message}`;
                statusDiv.className = "status error";
            } finally {
                directMethodBtn.disabled = false;
                directMethodBtn.textContent = "Try Direct Form Manipulation";
            }
        });
    }

    // Diagnostics button
    if (diagnosticsBtn) {
        diagnosticsBtn.addEventListener("click", async () => {
            try {
                diagnosticsInfo.textContent = "Running diagnostics...";
                
                // Get the active tab
                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                
                if (!tab.url.includes('docs.google.com/forms')) {
                    diagnosticsInfo.textContent = "Not on a Google Form. Please navigate to a Google Form first.";
                    return;
                }
                
                // Try to run diagnostics
                try {
                    const response = await chrome.tabs.sendMessage(tab.id, { action: 'runDiagnostics' });
                    if (response && response.diagnostics) {
                        diagnosticsInfo.textContent = JSON.stringify(response.diagnostics, null, 2);
                    } else {
                        diagnosticsInfo.textContent = "No diagnostic information received. Content script may not be loaded properly.";
                    }
                } catch (error) {
                    diagnosticsInfo.textContent = `Error running diagnostics: ${error.message}\nTry refreshing the page.`;
                }
            } catch (error) {
                diagnosticsInfo.textContent = `Error: ${error.message}`;
            }
        });
    }

    if (button) {
        button.addEventListener("click", async () => {
            try {
                button.disabled = true;
                button.textContent = 'Filling Form...';
                statusDiv.textContent = '';
                statusDiv.className = 'status';

                // Get the active tab
                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                
                // Display the current URL for debugging
                console.log("Current page URL:", tab.url);
                
                if (!tab.url.includes('docs.google.com/forms')) {
                    throw new Error('Please open a Google Form first');
                }

                // Check if API key is set
                const result = await chrome.storage.sync.get(['openaiApiKey']);
                if (!result.openaiApiKey) {
                    throw new Error('OpenAI API key not found. Please set it in the extension options.');
                }
                console.log("API key found, length:", result.openaiApiKey.length);

                // Add debug info to ensure content script is injected
                try {
                    await chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        func: () => {
                            console.log("Form Genie debug: Content script check initiated");
                            return document.body.innerHTML.includes('freebirdFormviewerComponentsQuestionBase');
                        }
                    }).then(results => {
                        console.log("Form elements detected:", results[0].result);
                    });
                } catch (err) {
                    console.error("Script execution error:", err);
                }

                // Send message to content script
                console.log("Sending startFilling message to content script");
                const response = await chrome.tabs.sendMessage(tab.id, { action: 'startFilling' });
                console.log("Response from content script:", response);
                
                if (response.error) {
                    if (response.error === "No questions found on this form") {
                        // Show debug section automatically when no questions found
                        debugSection.style.display = "block";
                        toggleDebugBtn.textContent = "Hide Debug Info";
                        
                        // Show diagnostic information if available
                        if (response.diagnostics) {
                            diagnosticsInfo.textContent = JSON.stringify(response.diagnostics, null, 2);
                        }
                        
                        throw new Error('No form questions detected. Please make sure you are on a Google Form with visible questions. Try refreshing the page.');
                    } else {
                        throw new Error(response.error);
                    }
                }

                // Show debug tools if success but might need direct manipulation
                debugSection.style.display = "block";
                toggleDebugBtn.textContent = "Hide Debug Info";
                statusDiv.innerHTML = 'Form filled successfully!<br><small style="font-size:10px;">If answers are not visible in the form, try "Direct Form Manipulation" button below.</small>';
                statusDiv.className = 'status success';
            } catch (error) {
                console.error("Form filling error:", error);
                
                // Provide more specific error messages
                let errorMessage = error.message;
                if (errorMessage.includes("Cannot read properties of undefined")) {
                    errorMessage = "Communication error with the page. Try refreshing the page and using the extension again.";
                } else if (errorMessage.includes("Could not establish connection")) {
                    errorMessage = "Could not connect to the page. Make sure you're on a Google Form and try refreshing.";
                }
                
                statusDiv.textContent = `Error: ${errorMessage}`;
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

    // Check URL on load to provide guidance
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && !tabs[0].url.includes('docs.google.com/forms')) {
            statusDiv.textContent = 'Please navigate to a Google Form';
            statusDiv.className = 'status warning';
        }
    });
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
