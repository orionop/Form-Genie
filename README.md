# Form Genie

A Chrome extension that uses OpenAI's GPT-3.5 to automatically fill Google Forms with intelligent responses.

![Form Genie Logo](icons/form.png)

## Features

- 🤖 AI-powered form filling using OpenAI's GPT-3.5
- 📝 Automatically detects and fills text fields, multiple choice questions, and checkboxes
- 🔒 Skips personal information fields (name, email, phone, etc.)
- ⚡ One-click form filling
- 🎨 Beautiful, modern UI

## Installation

### From Chrome Web Store (Recommended)

1. Visit the [Chrome Web Store](https://chrome.google.com/webstore/detail/form-genie/your-extension-id) (coming soon)
2. Click "Add to Chrome"
3. Follow the on-screen instructions

### Manual Installation (Developer Mode)

1. Download or clone this repository:
   ```
   git clone https://github.com/orionop/Form-Genie.git
   ```

2. Run the verification script to ensure all files are present:
   ```
   node verify_extension.js
   ```

3. Open Chrome and navigate to `chrome://extensions/`
4. Enable "Developer mode" in the top-right corner
5. Click "Load unpacked" and select the Form Genie directory
6. The extension should now be installed and visible in your Chrome toolbar

For detailed installation instructions with screenshots, open the `load_extension.html` file in your browser.

## Configuration

Before using Form Genie, you need to set up your OpenAI API key:

1. Click on the Form Genie icon in your Chrome toolbar
2. Click "Open Settings"
3. Enter your OpenAI API key (get one from [OpenAI's website](https://platform.openai.com/api-keys))
4. Click "Save"

## Usage

1. Navigate to a Google Form
2. Click the Form Genie icon in your Chrome toolbar
3. Click "Start Auto-Fill"
4. Watch as Form Genie intelligently fills out the form for you!

## How It Works

Form Genie uses a combination of web scraping and AI to fill out forms:

1. The extension scans the Google Form to identify questions and their types
2. It skips personal information fields to protect your privacy
3. For each question, it sends a request to OpenAI's API with context about the question and previous answers
4. The AI generates an appropriate response based on the question
5. The extension fills in the form field with the AI-generated response

## Supported Question Types

- Text fields
- Multiple choice questions (radio buttons)
- Checkboxes
- Dropdown menus

## Privacy

Form Genie:
- Does not collect or store any personal information
- Only sends form questions to OpenAI's API
- Does not track your browsing history
- Does not require any permissions beyond what's necessary to function

## Troubleshooting

If you're experiencing issues with the extension, try these steps:

1. Verify all required files are present by running `node verify_extension.js`
2. Check that your OpenAI API key is valid and has sufficient credits
3. Make sure you're on a Google Form page (`docs.google.com/forms/*`)
4. Refresh the page and try again
5. Consult the `TROUBLESHOOTING.md` file for more detailed solutions

If problems persist, open an issue on the GitHub repository.

## Project Structure

```
Form Genie/
├── icons/                  # Extension icons
├── src/
│   ├── css/                # Stylesheets
│   │   ├── options.css     # Settings page styles
│   │   └── popup.css       # Popup styles
│   ├── html/               # HTML files
│   │   ├── options.html    # Settings page HTML
│   │   └── popup.html      # Popup HTML
│   └── js/                 # JavaScript files
│       ├── background.js   # Background service worker
│       ├── content.js      # Content script for form interaction
│       ├── options.js      # Settings page logic
│       └── popup.js        # Popup logic
├── manifest.json           # Extension manifest
├── README.md               # This file
├── LICENSE                 # MIT License
├── load_extension.html     # Detailed loading instructions
├── verify_extension.js     # Verification script
└── TROUBLESHOOTING.md      # Troubleshooting guide
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for providing the GPT-3.5 API
- Google Forms for the platform this extension enhances 