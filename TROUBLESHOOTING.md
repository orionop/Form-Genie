# Form Genie Troubleshooting Guide

This guide will help you resolve common issues with the Form Genie extension.

## Extension Not Loading

If you see an error like "Manifest file is missing or unreadable" when trying to load the extension:

1. **Check the Directory Structure**
   - Make sure you're selecting the correct directory when loading the extension
   - The directory should contain the `manifest.json` file
   - Run the verification script to check if all required files exist:
     - On Windows: Double-click `verify_extension.bat`
     - On macOS/Linux: Run `./verify_extension.sh` in the terminal

2. **Check the Manifest File**
   - Open `manifest.json` in a text editor
   - Make sure it's a valid JSON file (no syntax errors)
   - Verify that all file paths are correct

3. **Check File Permissions**
   - Make sure all files have the correct read permissions
   - On macOS/Linux, you can run `chmod -R 644 *` to set read permissions for all files

## Extension Not Working on Google Forms

If the extension loads but doesn't work on Google Forms:

1. **Check Console for Errors**
   - Right-click on the Google Form page
   - Select "Inspect" to open the Developer Tools
   - Go to the "Console" tab
   - Look for any error messages related to the extension

2. **Verify API Key**
   - Click on the Form Genie icon in your Chrome toolbar
   - Click "Open Settings"
   - Make sure you've entered a valid OpenAI API key
   - The API key should start with "sk-" and be at least 20 characters long

3. **Check Network Requests**
   - In the Developer Tools, go to the "Network" tab
   - Try using the extension on a Google Form
   - Look for requests to the OpenAI API
   - Check if there are any errors in the responses

## Extension UI Issues

If the extension's popup or options page doesn't look right:

1. **Check CSS Files**
   - Make sure `src/css/popup.css` and `src/css/options.css` exist
   - Verify that they're being loaded correctly in the HTML files

2. **Check HTML Files**
   - Open `src/html/popup.html` and `src/html/options.html` in a text editor
   - Make sure they're valid HTML files
   - Verify that they're referencing the correct CSS and JavaScript files

## Still Having Issues?

If you're still experiencing problems after trying the above solutions:

1. **Check for Updates**
   - Make sure you're using the latest version of Chrome
   - Check if there's a newer version of the extension available

2. **Reinstall the Extension**
   - Go to `chrome://extensions/`
   - Find Form Genie and click "Remove"
   - Reload the extension using "Load unpacked"

3. **Contact Support**
   - If you're still having issues, please open an issue on the [GitHub repository](https://github.com/orionop/Form-Genie)
   - Include as much information as possible about the issue 