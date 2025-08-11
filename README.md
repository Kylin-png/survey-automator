# G.R.I.D. Enhanced - AI-Powered Survey Answerer with Matrix Question Support

## Overview

G.R.I.D. (Generate, Respond, Identify, Dominate) is an enhanced browser extension that autonomously answers survey questions using AI. This version includes advanced support for matrix questions, breaking them down into individual sub-questions for more accurate responses.

## New Features

### Matrix Question Support
- **Automatic Detection**: Identifies matrix questions in various formats (table-based, div-based, fieldset-based)
- **Individual Processing**: Breaks down matrix questions into individual row-by-row questions
- **Smart Mapping**: Maps AI responses back to the correct input fields in the matrix
- **Multiple Formats**: Supports various HTML structures commonly used for matrix questions

### Enhanced Question Detection
- Improved text extraction from complex form structures
- Better contextual understanding of question-input relationships
- Support for ARIA attributes and accessibility features

## How Matrix Questions Work

1. **Detection**: The extension scans for common matrix question patterns:
   - HTML tables with input fields
   - Div-based grids with consistent class naming
   - Fieldset structures with grouped inputs

2. **Parsing**: Extracts the main question, row labels, column headers, and input field mappings

3. **Individual Processing**: For each row in the matrix:
   - Combines the main question with the row text
   - Presents it to the AI as: "Main Question - Row Text"
   - Gets an individual response for that specific combination

4. **Response Mapping**: Maps each AI response back to the correct input field based on:
   - Column text matching
   - Input value matching
   - Label association

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory
5. The extension will appear in your browser toolbar

## Usage

1. Navigate to any survey or form page
2. Click the G.R.I.D. extension icon
3. The extension will automatically:
   - Extract all questions and input fields (including matrix questions)
   - Generate appropriate responses using the Kylin Spears persona
   - Fill in all form fields
   - Identify and click the continue/submit button

## Technical Implementation

### Matrix Question Data Structure
```javascript
{
  type: 'matrix',
  mainQuestion: 'Main matrix question text',
  rows: [
    { id: 'row_id', text: 'Row text', inputs: [...] }
  ],
  columns: [
    { id: 'col_id', text: 'Column text' }
  ]
}
```

### Processing Flow
1. `extractMatrixQuestions()` - Detects and parses matrix structures
2. `processMatrixQuestionWithData()` - Breaks down into individual questions
3. `fillMatrixQuestion()` - Maps responses back to input fields

## Files Modified

- **content.js**: Added matrix question detection and extraction functions
- **background.js**: Enhanced AI processing to handle matrix questions individually
- **manifest.json**: Updated version and permissions (if needed)

## Supported Matrix Formats

- **Table-based**: Traditional HTML tables with `<th>` headers and `<td>` cells
- **Div-based**: Modern CSS grid layouts with consistent class naming
- **Fieldset-based**: Form fieldsets with grouped radio/checkbox inputs
- **ARIA-enhanced**: Forms using ARIA attributes for accessibility

## AI Persona

The extension uses the Kylin Spears persona:
- 24-year-old African American male from Maryland
- McDonald's employee earning ~$49,999/year
- Homeowner with one 16-year-old child
- Drives an Acura sedan
- High school graduate

## API Configuration

The extension uses the Awan LLM API with automatic key rotation for reliability. Multiple API keys are configured to handle rate limiting and ensure continuous operation.

## Error Handling

- Graceful fallback for unrecognized matrix formats
- Retry logic for API failures
- Detailed logging for debugging
- Default responses when AI processing fails

## Future Enhancements

- Support for more complex matrix question types
- Enhanced natural language understanding
- Improved response validation
- Additional persona options
- Better error recovery mechanisms

