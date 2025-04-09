// This script helps verify that all required files for the Form Genie extension exist
const fs = require('fs');
const path = require('path');

// Required files and directories
const requiredFiles = [
    'manifest.json',
    'src/js/background.js',
    'src/js/content.js',
    'src/js/options.js',
    'src/js/popup.js',
    'src/html/options.html',
    'src/html/popup.html',
    'src/css/options.css',
    'src/css/popup.css',
    'icons/form.png'
];

// Check if each required file exists
let allFilesExist = true;
const missingFiles = [];

requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) {
        allFilesExist = false;
        missingFiles.push(file);
    }
});

// Print the results
console.log('Form Genie Extension Verification');
console.log('================================');
console.log('');

if (allFilesExist) {
    console.log('✅ All required files exist!');
    console.log('');
    console.log('The extension should load correctly in Chrome.');
} else {
    console.log('❌ Some required files are missing:');
    missingFiles.forEach(file => {
        console.log(`   - ${file}`);
    });
    console.log('');
    console.log('Please make sure all the required files exist in the correct locations.');
}

// Check the manifest.json file
try {
    const manifestPath = path.join(__dirname, 'manifest.json');
    const manifestContent = fs.readFileSync(manifestPath, 'utf8');
    const manifest = JSON.parse(manifestContent);
    
    console.log('');
    console.log('Manifest.json Verification:');
    console.log('---------------------------');
    console.log(`✅ Manifest version: ${manifest.manifest_version}`);
    console.log(`✅ Extension name: ${manifest.name}`);
    console.log(`✅ Extension version: ${manifest.version}`);
    
    // Check if the manifest references all the required files
    const referencedFiles = [
        manifest.background.service_worker,
        manifest.action.default_popup,
        manifest.options_page,
        ...manifest.content_scripts[0].js
    ];
    
    const missingReferencedFiles = [];
    referencedFiles.forEach(file => {
        const filePath = path.join(__dirname, file);
        if (!fs.existsSync(filePath)) {
            missingReferencedFiles.push(file);
        }
    });
    
    if (missingReferencedFiles.length > 0) {
        console.log('');
        console.log('❌ The manifest.json references files that do not exist:');
        missingReferencedFiles.forEach(file => {
            console.log(`   - ${file}`);
        });
    } else {
        console.log('');
        console.log('✅ All files referenced in manifest.json exist!');
    }
} catch (error) {
    console.log('');
    console.log('❌ Error parsing manifest.json:');
    console.log(`   ${error.message}`);
}

console.log('');
console.log('To load the extension in Chrome:');
console.log('1. Open Chrome and navigate to chrome://extensions/');
console.log('2. Enable "Developer mode" in the top-right corner');
console.log('3. Click "Load unpacked" and select this directory'); 