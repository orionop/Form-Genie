/* ======================
 * content.js
 * ======================
 */
const skipKeywords = ["name", "phone", "email", "contact", "mobile"];
const previousAnswers = {};

function extractQuestions() {
    let questions = [];
    
    // Find all form questions
    document.querySelectorAll('div[role="listitem"]').forEach((item) => {
        // Get the question text
        let questionText = item.querySelector(".M7eMe")?.innerText;
        
        if (questionText) {
            // Skip personal information questions
            let isPersonal = skipKeywords.some(keyword => questionText.toLowerCase().includes(keyword));
            if (!isPersonal) {
                // Find the input field
                let inputField = item.querySelector("input, textarea");
                
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
            }
        }
    });
    
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
            let prompt = "Answer this question: " + q.text;
            if (Object.keys(previousAnswers).length > 0) {
                prompt += "\nConsider previous answers: " + JSON.stringify(previousAnswers);
            }
            
            // Add context about the question type
            prompt += "\nQuestion type: " + q.type;
            
            // For multiple choice questions, get the options
            if (q.type === "radio" || q.type === "select") {
                const options = Array.from(q.element.querySelectorAll("label")).map(label => label.innerText.trim());
                prompt += "\nOptions: " + JSON.stringify(options);
            }

            chrome.runtime.sendMessage({ action: "fetchLlamaResponse", question: prompt }, response => {
                if (response.error) {
                    reject(response.error);
                    return;
                }
                
                if (response.answer) {
                    try {
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
    switch (question.type) {
        case "text":
            if (question.inputField) {
                question.inputField.value = answer;
                question.inputField.dispatchEvent(new Event("input", { bubbles: true }));
            }
            break;
            
        case "radio":
            // Find the radio button with the closest matching label
            const radioLabels = Array.from(question.element.querySelectorAll("label"));
            const bestMatch = findBestMatch(radioLabels, answer);
            if (bestMatch) {
                const radioInput = bestMatch.querySelector("input[type='radio']");
                if (radioInput) {
                    radioInput.checked = true;
                    radioInput.dispatchEvent(new Event("change", { bubbles: true }));
                }
            }
            break;
            
        case "checkbox":
            // For checkboxes, we might want to select multiple options
            const checkboxLabels = Array.from(question.element.querySelectorAll("label"));
            const matches = findMultipleMatches(checkboxLabels, answer);
            matches.forEach(label => {
                const checkboxInput = label.querySelector("input[type='checkbox']");
                if (checkboxInput) {
                    checkboxInput.checked = true;
                    checkboxInput.dispatchEvent(new Event("change", { bubbles: true }));
                }
            });
            break;
            
        case "select":
            // Find the select element and the best matching option
            const selectElement = question.element.querySelector("select");
            if (selectElement) {
                const options = Array.from(selectElement.options);
                const bestMatch = findBestMatch(options, answer);
                if (bestMatch) {
                    selectElement.value = bestMatch.value;
                    selectElement.dispatchEvent(new Event("change", { bubbles: true }));
                }
            }
            break;
    }
}

function findBestMatch(elements, answer) {
    // Simple matching algorithm - can be improved
    const answerLower = answer.toLowerCase();
    return elements.find(element => 
        element.innerText.toLowerCase().includes(answerLower) || 
        answerLower.includes(element.innerText.toLowerCase())
    );
}

function findMultipleMatches(elements, answer) {
    // For checkboxes, we might want to select multiple options
    const answerLower = answer.toLowerCase();
    return elements.filter(element => 
        element.innerText.toLowerCase().includes(answerLower) || 
        answerLower.includes(element.innerText.toLowerCase())
    );
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "startFilling") {
        const questions = extractQuestions();
        if (questions.length > 0) {
            fillForm(questions)
                .then(() => sendResponse({ success: true }))
                .catch(error => sendResponse({ error: error.message }));
            return true; // Required for async sendResponse
        } else {
            sendResponse({ error: "No questions found on this form" });
        }
    }
});