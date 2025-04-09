/* ======================
 * content.js
 * ======================
 */
const skipKeywords = ["name", "phone", "email", "contact", "mobile"];
const previousAnswers = {};

function extractQuestions() {
    let questions = [];
    console.log("Extracting questions from form...");
    
    // First approach - try the standard Google Forms question containers
    const questionContainers = document.querySelectorAll('.freebirdFormviewerComponentsQuestionBaseRoot');
    
    if (questionContainers.length > 0) {
        console.log(`Found ${questionContainers.length} questions using primary selector`);
        
        questionContainers.forEach((item) => {
            // Get the question text (try multiple possible selectors)
            let questionText = 
                item.querySelector('.freebirdFormviewerComponentsQuestionBaseHeader')?.innerText || 
                item.querySelector('.freebirdFormviewerViewItemsItemItemTitle')?.innerText || 
                item.querySelector('[data-params*="Question"]')?.innerText;
            
            if (questionText) {
                // Skip personal information questions
                let isPersonal = skipKeywords.some(keyword => questionText.toLowerCase().includes(keyword));
                if (!isPersonal) {
                    // Find the input field
                    let inputField = item.querySelector("input[type='text'], textarea");
                    
                    // Find the question type
                    let questionType = "text";
                    if (item.querySelector("input[type='radio']")) {
                        questionType = "radio";
                    } else if (item.querySelector("input[type='checkbox']")) {
                        questionType = "checkbox";
                    } else if (item.querySelector("select")) {
                        questionType = "select";
                    }
                    
                    questions.push({ 
                        element: item, 
                        text: questionText,
                        inputField: inputField,
                        type: questionType
                    });
                    console.log(`Added question: ${questionText} (${questionType})`);
                }
            }
        });
    }
    
    // If no questions found with the first approach, try alternate selectors
    if (questions.length === 0) {
        console.log("No questions found with primary selector, trying alternative selectors...");
        
        // Try alternative selectors (older Google Forms format)
        const alternativeContainers = document.querySelectorAll('.freebirdFormviewerViewItemsItemItem, .quantumWizTextinputPaperinputInput, .quantumWizTextinputPapertextareaInput');
        
        if (alternativeContainers.length > 0) {
            console.log(`Found ${alternativeContainers.length} potential elements using alternative selector`);
            
            alternativeContainers.forEach((item) => {
                // Find the closest question container
                const questionContainer = item.closest('.freebirdFormviewerViewItemsItemItemHeader, .freebirdCustomFooterWrapper')?.parentElement;
                if (!questionContainer) return;
                
                // Get the question text
                let questionText = questionContainer.querySelector('*[role="heading"]')?.innerText || 
                                 questionContainer.querySelector('.freebirdFormviewerViewItemsItemItemTitle')?.innerText;
                
                if (questionText) {
                    // Skip personal information questions
                    let isPersonal = skipKeywords.some(keyword => questionText.toLowerCase().includes(keyword));
                    if (!isPersonal) {
                        // Find the input field
                        let inputField = questionContainer.querySelector("input[type='text'], textarea");
                        
                        // Find the question type
                        let questionType = "text";
                        if (questionContainer.querySelector("input[type='radio']")) {
                            questionType = "radio";
                        } else if (questionContainer.querySelector("input[type='checkbox']")) {
                            questionType = "checkbox";
                        } else if (questionContainer.querySelector("select")) {
                            questionType = "select";
                        }
                        
                        // Only add if not already added
                        if (!questions.some(q => q.text === questionText)) {
                            questions.push({ 
                                element: questionContainer, 
                                text: questionText,
                                inputField: inputField,
                                type: questionType
                            });
                            console.log(`Added question (alt): ${questionText} (${questionType})`);
                        }
                    }
                }
            });
        }
    }
    
    // If still no questions found, try div[role="listitem"] approach (matches your form structure)
    if (questions.length === 0) {
        console.log("Trying div[role='listitem'] selector, which was detected in the form...");
        
        const listItems = document.querySelectorAll('div[role="listitem"]');
        console.log(`Found ${listItems.length} list items`);
        
        listItems.forEach((item, index) => {
            // Find the question text - look for heading elements first
            let questionText = item.querySelector('[role="heading"]')?.innerText;
            
            // If no heading found, look for any text-containing elements that could be questions
            if (!questionText) {
                const possibleQuestionElements = Array.from(item.querySelectorAll('div, span, label'))
                    .filter(el => el.innerText?.trim() && el.children.length < 3);
                
                // Use the first non-empty text element as the question
                if (possibleQuestionElements.length > 0) {
                    questionText = possibleQuestionElements[0].innerText;
                }
            }
            
            // If still no question text, use a placeholder
            if (!questionText) {
                questionText = `Question ${index + 1}`;
            }
            
            // Skip personal information questions
            let isPersonal = skipKeywords.some(keyword => questionText.toLowerCase().includes(keyword));
            if (!isPersonal) {
                // Find all inputs in this list item
                const inputs = item.querySelectorAll('input, textarea, select');
                
                if (inputs.length > 0) {
                    // Determine question type
                    let questionType = "text";
                    let inputField = null;
                    
                    // Check for radio buttons
                    if (item.querySelector('input[type="radio"]')) {
                        questionType = "radio";
                    } 
                    // Check for checkboxes
                    else if (item.querySelector('input[type="checkbox"]')) {
                        questionType = "checkbox";
                    } 
                    // Check for select/dropdown
                    else if (item.querySelector('select')) {
                        questionType = "select";
                        inputField = item.querySelector('select');
                    } 
                    // Default to text input
                    else {
                        const textInputs = item.querySelectorAll('input[type="text"], input:not([type]), textarea');
                        if (textInputs.length > 0) {
                            inputField = textInputs[0];
                        }
                    }
                    
                    // Only add if not already added
                    if (!questions.some(q => q.text === questionText)) {
                        questions.push({ 
                            element: item, 
                            text: questionText,
                            inputField: inputField,
                            type: questionType
                        });
                        console.log(`Added question (listitem): ${questionText} (${questionType})`);
                    }
                }
            }
        });
    }
    
    // If still no questions found, try a very generic approach
    if (questions.length === 0) {
        console.log("No questions found with alternative selectors, trying generic approach...");
        
        // Find all form elements that could be inputs
        const formElements = document.querySelectorAll('input, textarea, select');
        
        formElements.forEach((input) => {
            // Get the closest parent that might contain the question text
            const container = input.closest('div[role="listitem"], .freebirdFormviewerViewItemsItemItem, form > div');
            if (!container) return;
            
            // Try to find any text that could be a question
            let questionText = "";
            container.querySelectorAll('div, span, label').forEach(element => {
                if (element.innerText && element.innerText.trim().length > 10 && 
                    !element.querySelector('input, textarea, select')) {
                    questionText = element.innerText;
                }
            });
            
            if (questionText) {
                // Skip personal information questions
                let isPersonal = skipKeywords.some(keyword => questionText.toLowerCase().includes(keyword));
                if (!isPersonal) {
                    // Determine question type
                    let questionType = "text";
                    if (input.type === "radio") {
                        questionType = "radio";
                    } else if (input.type === "checkbox") {
                        questionType = "checkbox";
                    } else if (input.tagName.toLowerCase() === "select") {
                        questionType = "select";
                    }
                    
                    // Only add if not already added
                    if (!questions.some(q => q.text === questionText)) {
                        questions.push({ 
                            element: container, 
                            text: questionText,
                            inputField: input.type === "radio" || input.type === "checkbox" ? null : input,
                            type: questionType
                        });
                        console.log(`Added question (generic): ${questionText} (${questionType})`);
                    }
                }
            }
        });
    }
    
    console.log(`Total questions found: ${questions.length}`);
    return questions;
}

function fillForm(questions) {
    return new Promise((resolve, reject) => {
        let completed = 0;
        let totalQuestions = questions.length;
        
        if (totalQuestions === 0) {
            resolve();
            return;
        }
        
        questions.forEach((q, index) => {
            let prompt = "";
            
            // Create different prompts based on question type
            switch (q.type) {
                case "text":
                    prompt = `Answer this question with a detailed paragraph (2-3 sentences): ${q.text}`;
                    break;
                case "radio":
                    // For multiple choice, instruct to pick exactly one option
                    const radioOptions = Array.from(q.element.querySelectorAll("label")).map(label => label.innerText.trim());
                    prompt = `Question: ${q.text}\n\nThis is a multiple choice question. Please select EXACTLY ONE of the following options (respond with just the letter or the exact option text):\n`;
                    radioOptions.forEach((opt, i) => {
                        const letter = String.fromCharCode(65 + i); // A, B, C, etc.
                        prompt += `${letter}) ${opt}\n`;
                    });
                    break;
                case "checkbox":
                    // For checkboxes, allow multiple selections
                    const checkboxOptions = Array.from(q.element.querySelectorAll("label")).map(label => label.innerText.trim());
                    prompt = `Question: ${q.text}\n\nThis is a checkbox question. You may select MULTIPLE options. Please respond with a comma-separated list of the letters or exact text of options you want to select:\n`;
                    checkboxOptions.forEach((opt, i) => {
                        const letter = String.fromCharCode(65 + i); // A, B, C, etc.
                        prompt += `${letter}) ${opt}\n`;
                    });
                    break;
                case "select":
                    // For dropdown, instruct to pick one option
                    const selectOptions = Array.from(q.element.querySelectorAll("option")).map(option => option.innerText.trim());
                    prompt = `Question: ${q.text}\n\nThis is a dropdown selection. Please select EXACTLY ONE of the following options (respond with just the letter or the exact option text):\n`;
                    selectOptions.forEach((opt, i) => {
                        const letter = String.fromCharCode(65 + i); // A, B, C, etc.
                        prompt += `${letter}) ${opt}\n`;
                    });
                    break;
                default:
                    prompt = `Answer this question: ${q.text}`;
            }
            
            // Add context from previous answers if available
            if (Object.keys(previousAnswers).length > 0) {
                prompt += "\n\nConsider these previous answers when responding:";
                Object.entries(previousAnswers).forEach(([key, value]) => {
                    prompt += `\n- Question: ${key}\n  Answer: ${value}`;
                });
            }

            chrome.runtime.sendMessage({ action: "fetchLlamaResponse", question: prompt }, response => {
                if (response.error) {
                    reject(response.error);
                    return;
                }
                
                if (response.answer) {
                    try {
                        console.log(`Received AI response for "${q.text.substring(0, 30)}...": "${response.answer.substring(0, 50)}..."`);
                        fillQuestion(q, response.answer);
                        previousAnswers[q.text] = response.answer;
                    } catch (error) {
                        console.error("Error filling question:", error);
                    }
                }
                
                completed++;
                if (completed === totalQuestions) {
                    resolve();
                }
            });
        });
    });
}

function fillQuestion(question, answer) {
    console.log(`Filling question: "${question.text}" with answer: "${answer}"`);
    
    switch (question.type) {
        case "text":
            if (question.inputField) {
                console.log("Filling text input");
                // Set value
                question.inputField.value = answer;
                
                // Trigger multiple events to ensure Google Forms recognizes the change
                // Create and dispatch input event
                question.inputField.dispatchEvent(new Event("input", { bubbles: true }));
                
                // Create and dispatch change event
                question.inputField.dispatchEvent(new Event("change", { bubbles: true }));
                
                // Also try using direct focus/blur to trigger validation
                question.inputField.focus();
                setTimeout(() => {
                    question.inputField.blur();
                }, 100);
                
                console.log("Text input filled and events triggered");
            } else {
                console.warn("No input field found for text question:", question.text);
            }
            break;
            
        case "radio":
            // Find the radio button with the closest matching label
            console.log("Handling radio button question");
            const radioLabels = Array.from(question.element.querySelectorAll("label"));
            console.log(`Found ${radioLabels.length} radio options`);
            
            const bestMatch = findBestMatch(radioLabels, answer);
            if (bestMatch) {
                console.log(`Best match found: "${bestMatch.innerText}"`);
                const radioInput = bestMatch.querySelector("input[type='radio']") || 
                                  bestMatch.parentElement.querySelector("input[type='radio']");
                
                if (radioInput) {
                    // Check the radio button
                    radioInput.checked = true;
                    
                    // Trigger events
                    radioInput.dispatchEvent(new Event("click", { bubbles: true }));
                    radioInput.dispatchEvent(new Event("change", { bubbles: true }));
                    
                    // Try clicking the label too
                    bestMatch.click();
                    
                    console.log("Radio input selected and events triggered");
                } else {
                    console.warn("No radio input found in the matched label");
                }
            } else {
                console.warn("No matching label found for radio question");
            }
            break;
            
        case "checkbox":
            // For checkboxes, we might want to select multiple options
            console.log("Handling checkbox question");
            const checkboxLabels = Array.from(question.element.querySelectorAll("label"));
            console.log(`Found ${checkboxLabels.length} checkbox options`);
            
            const matches = findMultipleMatches(checkboxLabels, answer);
            console.log(`Found ${matches.length} matches for the answer`);
            
            matches.forEach(label => {
                const checkboxInput = label.querySelector("input[type='checkbox']") || 
                                     label.parentElement.querySelector("input[type='checkbox']");
                
                if (checkboxInput) {
                    // Check the checkbox
                    checkboxInput.checked = true;
                    
                    // Trigger events
                    checkboxInput.dispatchEvent(new Event("click", { bubbles: true }));
                    checkboxInput.dispatchEvent(new Event("change", { bubbles: true }));
                    
                    // Try clicking the label too
                    label.click();
                    
                    console.log(`Checkbox for "${label.innerText}" selected and events triggered`);
                } else {
                    console.warn("No checkbox input found in the matched label");
                }
            });
            
            if (matches.length === 0) {
                console.warn("No matching labels found for checkbox question");
            }
            break;
            
        case "select":
            // Find the select element and the best matching option
            console.log("Handling select dropdown question");
            const selectElement = question.element.querySelector("select");
            
            if (selectElement) {
                console.log(`Found select element with ${selectElement.options.length} options`);
                const options = Array.from(selectElement.options);
                const bestMatch = findBestMatchOption(options, answer);
                
                if (bestMatch) {
                    console.log(`Best match found: "${bestMatch.text}"`);
                    selectElement.value = bestMatch.value;
                    
                    // Trigger events
                    selectElement.dispatchEvent(new Event("change", { bubbles: true }));
                    
                    console.log("Select option selected and events triggered");
                } else {
                    console.warn("No matching option found for select question");
                }
            } else {
                console.warn("No select element found for select question");
            }
            break;
    }
}

// Improved matching for select options
function findBestMatchOption(options, answer) {
    if (!options || options.length === 0) return null;
    const answerLower = answer.toLowerCase();
    
    // Try exact match first
    for (const option of options) {
        if (option.text.toLowerCase() === answerLower) {
            return option;
        }
    }
    
    // Then try contains
    for (const option of options) {
        if (option.text.toLowerCase().includes(answerLower) || 
            answerLower.includes(option.text.toLowerCase())) {
            return option;
        }
    }
    
    // Return first non-empty option as fallback
    for (const option of options) {
        if (option.text.trim() !== "" && option.value !== "") {
            return option;
        }
    }
    
    return null;
}

// Improved matching for radio and checkbox labels
function findBestMatch(elements, answer) {
    if (!elements || elements.length === 0) return null;
    const answerLower = answer.toLowerCase();
    
    // Extract the letter if the AI responded with a lettered option (e.g., "A)" or "A.")
    const letterMatch = answerLower.match(/^([a-z])[).]/i);
    if (letterMatch && elements.length > 0) {
        const letterIndex = letterMatch[1].toUpperCase().charCodeAt(0) - 65; // Convert A->0, B->1, etc.
        if (letterIndex >= 0 && letterIndex < elements.length) {
            console.log(`Letter match found: "${letterMatch[1]}" maps to option ${letterIndex}`);
            return elements[letterIndex]; 
        }
    }
    
    // Try exact match first
    for (const element of elements) {
        if (element.innerText.toLowerCase() === answerLower) {
            return element;
        }
    }
    
    // Then try contains, but use a more precise approach
    // Split the AI response into words and find the option with the most matching words
    const answerWords = answerLower.split(/\s+/).filter(word => word.length > 2);
    let bestElement = null;
    let bestMatchCount = 0;
    
    for (const element of elements) {
        const elementText = element.innerText.toLowerCase();
        let matchCount = 0;
        
        // Count matching words
        for (const word of answerWords) {
            if (elementText.includes(word)) {
                matchCount++;
            }
        }
        
        // Also check if the element text is contained in the answer
        if (answerLower.includes(elementText) && elementText.length > 3) {
            matchCount += 3; // Bonus for substantial inclusion
        }
        
        if (matchCount > bestMatchCount) {
            bestMatchCount = matchCount;
            bestElement = element;
        }
    }
    
    if (bestElement && bestMatchCount > 0) {
        console.log(`Word match found with score ${bestMatchCount}: "${bestElement.innerText}"`);
        return bestElement;
    }
    
    // Return first non-empty element as fallback
    for (const element of elements) {
        if (element.innerText.trim() !== "") {
            console.log(`No match found, using first non-empty option: "${element.innerText}"`);
            return element;
        }
    }
    
    return null;
}

function findMultipleMatches(elements, answer) {
    if (!elements || elements.length === 0) return [];
    const answerLower = answer.toLowerCase();
    const matches = [];
    
    // Check for letter-based selections (A,B,C or A, B, C)
    const letterPattern = /\b([A-Za-z])\b/g;
    const letterMatches = Array.from(answerLower.matchAll(letterPattern));
    
    if (letterMatches.length > 0) {
        console.log(`Found letter-based selections: ${letterMatches.map(m => m[1]).join(', ')}`);
        letterMatches.forEach(match => {
            const letterIndex = match[1].toUpperCase().charCodeAt(0) - 65; // Convert A->0, B->1, etc.
            if (letterIndex >= 0 && letterIndex < elements.length) {
                if (!matches.includes(elements[letterIndex])) {
                    matches.push(elements[letterIndex]);
                }
            }
        });
        
        if (matches.length > 0) {
            return matches;
        }
    }
    
    // Look for elements containing parts of the answer
    for (const element of elements) {
        const elementText = element.innerText.toLowerCase();
        if (elementText.length > 3 && (
            elementText.includes(answerLower) || 
            answerLower.includes(elementText)
        )) {
            matches.push(element);
        }
    }
    
    // If no matches found, try to select all that seem reasonable
    if (matches.length === 0) {
        // Split answer into words
        const answerWords = answerLower.split(/\s+|,/).filter(word => word.length > 3);
        
        for (const element of elements) {
            const elementText = element.innerText.toLowerCase();
            for (const word of answerWords) {
                if (elementText.includes(word)) {
                    matches.push(element);
                    break;
                }
            }
        }
    }
    
    // If still no matches, return first element as fallback
    if (matches.length === 0 && elements.length > 0) {
        matches.push(elements[0]);
    }
    
    // Limit to at most 3 checkboxes to avoid checking too many
    return matches.slice(0, 3);
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "startFilling") {
        console.log("Form Genie: Starting form fill process");
        const questions = extractQuestions();
        if (questions.length > 0) {
            fillForm(questions)
                .then(() => {
                    // After filling the form with standard methods, try direct manipulation as a fallback
                    setTimeout(() => {
                        applyDirectInputManipulation();
                    }, 500);
                    sendResponse({ success: true });
                })
                .catch(error => sendResponse({ error: error.message }));
            return true; // Required for async sendResponse
        } else {
            console.log("Form Genie: No questions found, running diagnostics");
            const diagnosticInfo = runDiagnostics();
            sendResponse({ 
                error: "No questions found on this form",
                diagnostics: diagnosticInfo 
            });
        }
    } else if (request.action === "runDiagnostics") {
        // New action to run diagnostics on demand
        const diagnosticInfo = runDiagnostics();
        sendResponse({ diagnostics: diagnosticInfo });
    } else if (request.action === "applyDirectManipulation") {
        // Force direct manipulation method
        applyDirectInputManipulation();
        sendResponse({ success: true });
    } else if (request.action === "diagnoseRadioButtons") {
        // Special diagnostic for radio buttons
        const radioInfo = diagnoseRadioButtons();
        sendResponse({ radioInfo: radioInfo });
    }
    return true; // Required for async sendResponse
});

// Add a function to run diagnostics on the form page
function runDiagnostics() {
    console.log("Form Genie: Running diagnostics...");
    
    // Check if we're actually on a Google Form
    const isGoogleForm = window.location.href.includes('docs.google.com/forms');
    
    // Try to detect form elements with various selectors
    const diagnostics = {
        url: window.location.href,
        isGoogleForm: isGoogleForm,
        formElements: {
            'divRoleListitem': document.querySelectorAll('div[role="listitem"]').length,
            'freebirdFormviewerComponentsQuestionBaseRoot': document.querySelectorAll('.freebirdFormviewerComponentsQuestionBaseRoot').length,
            'freebirdFormviewerViewItemsItemItem': document.querySelectorAll('.freebirdFormviewerViewItemsItemItem').length,
            'inputs': document.querySelectorAll('input').length,
            'textareas': document.querySelectorAll('textarea').length,
            'formTags': document.querySelectorAll('form').length,
            'headingElements': document.querySelectorAll('[role="heading"]').length
        },
        htmlSample: document.body.innerHTML.substring(0, 500) + '...'
    };
    
    console.log("Form Genie diagnostics:", diagnostics);
    
    // Check if page is fully loaded
    if (document.readyState !== 'complete') {
        console.log("Warning: Page is not fully loaded yet!");
    }
    
    // Check if there's a form tag in iframes (Google Forms sometimes use iframes)
    const iframes = document.querySelectorAll('iframe');
    console.log(`Found ${iframes.length} iframes on the page`);
    
    return diagnostics;
}

// Additional fallback method for direct form manipulation
function applyDirectInputManipulation() {
    console.log("Form Genie: Applying direct input manipulation as fallback");
    
    // Sample realistic answers for text fields
    const sampleAnswers = [
        "This is a comprehensive response that addresses the question in detail while providing relevant context and information.",
        "I believe this is the correct approach to solving this problem efficiently.",
        "Based on my understanding, the answer is that we should consider multiple perspectives before making a decision.",
        "The most important factor to consider is how this will impact all stakeholders involved.",
        "There are several ways to address this, but the most effective would be to start with a clear plan.",
        "I would recommend focusing on the core issues first before expanding to secondary concerns.",
        "My experience suggests that the best solution involves careful analysis of all available data.",
        "This requires thoughtful consideration of both short-term benefits and long-term consequences.",
        "The key insight here is that we need to balance multiple competing priorities.",
        "From my perspective, this approach offers the greatest likelihood of success."
    ];
    
    // Handle text inputs directly
    const textInputs = document.querySelectorAll('input[type="text"], input:not([type]), textarea');
    textInputs.forEach((input, index) => {
        try {
            if (!skipKeywords.some(keyword => input.name?.toLowerCase()?.includes(keyword) || 
                                           input.id?.toLowerCase()?.includes(keyword) ||
                                           input.placeholder?.toLowerCase()?.includes(keyword))) {
                
                // Select a sample answer with some randomness
                const answerIndex = (index + Math.floor(Math.random() * 3)) % sampleAnswers.length;
                const value = sampleAnswers[answerIndex];
                console.log(`Direct manipulation: Setting value "${value.substring(0, 30)}..." for input:`, input);
                
                // Try multiple methods to set the value
                try {
                    // Method 1: Direct value assignment
                    input.value = value;
                    
                    // Method 2: Using Object.defineProperty to intercept value setters
                    Object.defineProperty(input, 'value', {
                        writable: true,
                        configurable: true,
                        value: value
                    });
                    
                    // Method 3: Execute script in page context to set value directly
                    const inputId = input.id || `input_${Math.random().toString(36).substr(2, 9)}`;
                    if (!input.id) input.id = inputId;
                    
                    const script = document.createElement('script');
                    script.textContent = `
                        (function() {
                            const input = document.getElementById('${inputId}');
                            if (input) {
                                input.value = ${JSON.stringify(value)};
                                input.dispatchEvent(new Event('input', { bubbles: true }));
                                input.dispatchEvent(new Event('change', { bubbles: true }));
                            }
                        })();
                    `;
                    document.body.appendChild(script);
                    document.body.removeChild(script);
                } catch (err) {
                    console.warn("Error in direct value setting:", err);
                }
                
                // Dispatch events to notify the form
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
                input.dispatchEvent(new KeyboardEvent('keyup', { key: 'a' }));
                input.focus();
                setTimeout(() => {
                    input.blur();
                }, 100);
            }
        } catch (err) {
            console.error("Error manipulating input:", err);
        }
    });
    
    // Handle radio buttons and checkboxes
    const clickableInputs = document.querySelectorAll('input[type="radio"], input[type="checkbox"]');
    const processedGroups = new Set();
    
    // For radio buttons, we should select only one per group
    const radioGroups = {};
    clickableInputs.forEach(input => {
        if (input.type === 'radio' && input.name) {
            if (!radioGroups[input.name]) {
                radioGroups[input.name] = [];
            }
            radioGroups[input.name].push(input);
        }
    });
    
    // Select one radio button per group
    Object.keys(radioGroups).forEach(groupName => {
        const group = radioGroups[groupName];
        if (group.length > 0) {
            // Select just one radio button from each group (the first one)
            const selectedInput = group[0];
            try {
                console.log(`Direct manipulation: Selecting radio button from group ${groupName}:`, selectedInput);
                
                // Method 1: Set checked property directly
                selectedInput.checked = true;
                
                // Method 2: Try simulating an actual click
                selectedInput.dispatchEvent(new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                }));
                
                // Method 3: Click any associated label
                const labels = document.querySelectorAll(`label[for="${selectedInput.id}"]`);
                if (labels.length > 0) {
                    labels[0].click();
                } else {
                    // Look for parent label
                    const parentLabel = selectedInput.closest('label');
                    if (parentLabel) {
                        parentLabel.click();
                    }
                }
                
                // Method 4: Try more aggressive approaches for Google Forms
                
                // Find any containing element that might have a click handler
                const radioContainer = selectedInput.closest('.freebirdFormviewerViewItemsItemItem, .docssharedWizToggleLabeledControl, div[role="listitem"]');
                if (radioContainer) {
                    // Try clicking the entire container
                    radioContainer.click();
                    
                    // Find any clickable elements inside
                    const clickTargets = radioContainer.querySelectorAll('.exportOuterCircle, .exportInnerCircle, .freebirdThemedRadio, .quantumWizTogglePaperradioEl, .exportLabel');
                    clickTargets.forEach(target => {
                        console.log("Clicking potential radio button target:", target);
                        target.click();
                    });
                }
                
                // Method 5: Execute in page context
                const inputId = selectedInput.id || `input_${Math.random().toString(36).substr(2, 9)}`;
                if (!selectedInput.id) selectedInput.id = inputId;
                
                const script = document.createElement('script');
                script.textContent = `
                    (function() {
                        const input = document.getElementById('${inputId}');
                        if (input) {
                            input.checked = true;
                            input.dispatchEvent(new Event('click', { bubbles: true }));
                            input.dispatchEvent(new Event('change', { bubbles: true }));
                            
                            // More aggressive Google Forms-specific approach
                            const container = input.closest('[role="listitem"], .freebirdFormviewerViewItemsItemItem, .docssharedWizToggleLabeledControl');
                            if (container) {
                                // Simulate clicks on all possible targets
                                container.querySelectorAll('.exportOuterCircle, .exportInnerCircle, .freebirdThemedRadio, .quantumWizTogglePaperradioEl, .exportLabel').forEach(el => {
                                    el.click();
                                });
                                
                                // Find all span and div elements that could be part of the radio UI
                                container.querySelectorAll('span, div').forEach(el => {
                                    if (el.offsetWidth > 0 && el.offsetHeight > 0 && window.getComputedStyle(el).cursor === 'pointer') {
                                        el.click();
                                    }
                                });
                                
                                // Final fallback - click the container itself
                                container.click();
                            }
                        }
                    })();
                `;
                document.body.appendChild(script);
                document.body.removeChild(script);
                
            } catch (err) {
                console.error("Error manipulating radio button:", err);
            }
        }
    });
    
    // Handle checkboxes (we can select multiple)
    clickableInputs.forEach(input => {
        try {
            // Skip radio buttons, we already handled them
            if (input.type === 'radio') return;
            
            // Only handle checkboxes
            if (input.type === 'checkbox') {
                console.log(`Direct manipulation: Clicking checkbox input:`, input);
                
                // Method 1: Set checked property directly
                input.checked = true;
                
                // Method 2: Try simulating an actual click
                input.dispatchEvent(new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                }));
                
                // Method 3: Click any associated label
                const labels = document.querySelectorAll(`label[for="${input.id}"]`);
                if (labels.length > 0) {
                    labels[0].click();
                } else {
                    // Look for parent label
                    const parentLabel = input.closest('label');
                    if (parentLabel) {
                        parentLabel.click();
                    }
                }
                
                // Method 4: Execute in page context
                const inputId = input.id || `input_${Math.random().toString(36).substr(2, 9)}`;
                if (!input.id) input.id = inputId;
                
                const script = document.createElement('script');
                script.textContent = `
                    (function() {
                        const input = document.getElementById('${inputId}');
                        if (input) {
                            input.checked = true;
                            input.dispatchEvent(new Event('click', { bubbles: true }));
                            input.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                    })();
                `;
                document.body.appendChild(script);
                document.body.removeChild(script);
            }
        } catch (err) {
            console.error("Error manipulating checkbox:", err);
        }
    });
    
    // Handle select/dropdown elements
    const selects = document.querySelectorAll('select');
    selects.forEach(select => {
        try {
            if (select.options.length > 0) {
                // Select the first non-default option if available
                for (let i = 0; i < select.options.length; i++) {
                    if (i > 0 || (select.options[i].value && select.options[i].text)) {
                        console.log(`Direct manipulation: Selecting option ${i} in select:`, select);
                        select.selectedIndex = i;
                        select.dispatchEvent(new Event('change', { bubbles: true }));
                        break;
                    }
                }
            }
        } catch (err) {
            console.error("Error manipulating select:", err);
        }
    });
    
    console.log("Form Genie: Direct input manipulation completed");
    
    // Special handling for Google Forms radio buttons as a final attempt
    setTimeout(() => {
        console.log("Applying Google Forms specific radio button targeting");
        
        // Look for elements that visually look like radio buttons
        const radioCircles = document.querySelectorAll('.appsMaterialWizToggleRadiogroupEl, .appsMaterialWizToggleRadiogroupOffRadio, .appsMaterialWizToggleRadiogroupOnRadio, .exportOuterCircle, .docssharedWizToggleLabeledLabelWrapper');
        
        if (radioCircles.length > 0) {
            console.log(`Found ${radioCircles.length} Google Forms radio button elements`);
            
            // Group by question containers to only select one per question
            const radioByContainer = {};
            
            radioCircles.forEach(radio => {
                // Find the container (question)
                const container = radio.closest('div[role="listitem"], .freebirdFormviewerViewItemsItemItem');
                if (container) {
                    const containerId = container.id || container.getAttribute('data-item-id') || Math.random().toString(36).substr(2, 9);
                    if (!radioByContainer[containerId]) {
                        radioByContainer[containerId] = [];
                    }
                    radioByContainer[containerId].push(radio);
                }
            });
            
            // For each question, select the first radio button
            Object.keys(radioByContainer).forEach(containerId => {
                const radios = radioByContainer[containerId];
                if (radios.length > 0) {
                    try {
                        // Just click the first option
                        const radioToClick = radios[0];
                        console.log("Clicking Google Forms radio element:", radioToClick);
                        radioToClick.click();
                        
                        // Also try clicking parent elements up to 3 levels
                        let currentElement = radioToClick;
                        for (let i = 0; i < 3; i++) {
                            if (currentElement.parentElement) {
                                currentElement = currentElement.parentElement;
                                currentElement.click();
                            }
                        }
                    } catch (err) {
                        console.error("Error clicking Google Forms radio:", err);
                    }
                }
            });
        } else {
            console.log("No Google Forms specific radio elements found");
        }
    }, 1500);
    
    // Final attempt: Try to click any submit/next buttons after a delay
    setTimeout(() => {
        const nextButtons = Array.from(document.querySelectorAll('button, input[type="submit"], div[role="button"]'))
            .filter(el => {
                const text = el.innerText?.toLowerCase() || el.value?.toLowerCase() || '';
                return text.includes('next') || text.includes('submit') || text.includes('continue');
            });
        
        if (nextButtons.length > 0) {
            console.log("Form Genie: Found next/submit button, will click it:", nextButtons[0]);
            // Don't actually click it, just log that we found it
        }
    }, 2000);
}

// Function to specifically diagnose radio button issues
function diagnoseRadioButtons() {
    console.log("Form Genie: Diagnosing radio button issues");
    
    // Look for all potential radio button elements
    const radioInputs = document.querySelectorAll('input[type="radio"]');
    const googleFormsRadioElements = document.querySelectorAll(
        '.appsMaterialWizToggleRadiogroupEl, .docssharedWizToggleLabeledControl, ' + 
        '.freebirdThemedRadio, .quantumWizTogglePaperradioEl, .exportOuterCircle, ' +
        '.exportInnerCircle'
    );
    
    console.log(`Found ${radioInputs.length} standard radio inputs and ${googleFormsRadioElements.length} Google Forms radio elements`);
    
    // Check if any radio buttons are already checked
    const checkedRadios = document.querySelectorAll('input[type="radio"]:checked');
    
    // Find all containers that might contain radio buttons
    const radioContainers = document.querySelectorAll('div[role="listitem"]:has(input[type="radio"]), .freebirdFormviewerViewItemsItemItem:has(input[type="radio"])');
    
    const analysis = {
        standardRadioInputs: radioInputs.length,
        googleFormsRadioElements: googleFormsRadioElements.length,
        checkedRadios: checkedRadios.length,
        radioContainers: radioContainers.length,
        radioGroups: {},
        formStructure: 'unknown'
    };
    
    // Determine form structure type
    if (document.querySelector('.freebirdFormviewerViewItemsItemItem')) {
        analysis.formStructure = 'freebirdFormviewerViewItemsItemItem';
    } else if (document.querySelector('div[role="listitem"]')) {
        analysis.formStructure = 'div[role="listitem"]';
    } else if (document.querySelector('.freebirdFormviewerComponentsQuestionBaseRoot')) {
        analysis.formStructure = 'freebirdFormviewerComponentsQuestionBaseRoot';
    }
    
    // Analyze radio groups
    const radioGroups = {};
    radioInputs.forEach(radio => {
        if (radio.name) {
            if (!radioGroups[radio.name]) {
                radioGroups[radio.name] = {
                    total: 0,
                    checked: 0
                };
            }
            radioGroups[radio.name].total++;
            if (radio.checked) {
                radioGroups[radio.name].checked++;
            }
        }
    });
    
    analysis.radioGroups = radioGroups;
    
    // Test clicking the first radio in each container
    if (radioContainers.length > 0) {
        // Just for diagnostic - don't actually click in this function
        const firstContainer = radioContainers[0];
        const clickableElements = firstContainer.querySelectorAll('input[type="radio"], .exportOuterCircle, .exportInnerCircle');
        analysis.clickableElementsInFirstContainer = clickableElements.length;
    }
    
    console.log("Radio diagnostics:", analysis);
    return analysis;
}