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

1. Clone this repository:
   ```
   git clone https://github.com/orionop/Form-Genie.git
   ```

2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the Form Genie directory
5. The extension should now be installed and visible in your Chrome toolbar

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

- **Extension not working?** Make sure you're on a Google Form page and have set up your OpenAI API key.
- **API errors?** Check that your OpenAI API key is valid and has sufficient credits.
- **Form not being filled correctly?** Some complex forms may not be fully compatible. Try refreshing the page and trying again.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for providing the GPT-3.5 API
- Google Forms for the platform this extension enhances 