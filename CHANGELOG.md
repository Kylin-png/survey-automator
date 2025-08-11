# Changelog

## Version 2.0.5 - Critical Matrix Mapping and Button Selector Fixes

### Fixed
- **Agent 1 Matrix Mapping**: Made Agent 1 prompt even more explicit about not mapping individual radio groups to matrix selectors
- **Button Selector Error**: Fixed "Failed to execute 'querySelector'" error by adding XPath selector support to clickButton function
- **Third Matrix Question**: Fixed issue where "How often do you engage in the following activities?" wasn't being mapped to matrix_matrix_1

### Enhanced
- **XPath Selector Support**: Added support for both CSS and XPath selectors in button clicking functionality
- **Agent 1 Specificity**: Added more specific rules about when NOT to use matrix selectors
- **Error Handling**: Improved error handling for different selector types

### Technical Changes
- Updated clickButton function to detect and handle XPath selectors (starting with '/')
- Enhanced Agent 1 system prompt with explicit examples of what NOT to map to matrix selectors
- Added automatic selector type detection and appropriate handling

## Version 2.0.4 - Agent 1 Matrix Mapping Fix

### Fixed
- **Agent 1 Matrix Question Mapping**: Fixed incorrect mapping of individual radio button groups to matrix selectors
- **Question Type Distinction**: Enhanced Agent 1 to properly distinguish between matrix questions and individual radio groups
- **Matrix Selector Usage**: Added strict rules for when to use matrix_* selectors vs individual radio button selectors

### Enhanced
- **Agent 1 System Prompt**: Added comprehensive matrix question handling guidelines
- **Mapping Rules**: Clarified when to use matrix selectors vs individual input selectors
- **Question Recognition**: Improved recognition of true matrix questions vs grouped radio buttons

### Technical Changes
- Updated Agent 1 system prompt with detailed matrix question handling instructions
- Added explicit rules for matrix selector usage
- Enhanced distinction between matrix questions and individual radio button groups

## Version 2.0.3 - Enhanced Debugging

### Enhanced
- Added comprehensive debugging throughout matrix processing pipeline
- Improved logging for troubleshooting matrix question issues

## Version 2.0.2 - Radio Button Matching Fix

### Fixed
- **Radio Button Option Matching**: Fixed "Radio option not found" errors for scale-based questions
- **Scale Mapping**: Added comprehensive scale mapping for Likert scales and importance ratings
- **Text-to-Numeric Mapping**: Enhanced radio button matching to map text responses like "Very Important" to numeric values like "4"
- **Reverse Label Mapping**: Added fallback strategy to find radio buttons by matching label text

### Enhanced
- **Radio Button Strategies**: Implemented 5-tier matching strategy for radio buttons:
  1. Exact normalized label text match
  2. Exact normalized value match  
  3. Common value mapping (existing functionality)
  4. Scale-based mapping for survey patterns
  5. Reverse label mapping for partial matches

### Technical Changes
- Added scale mappings for satisfaction, importance, and frequency scales
- Enhanced radio button matching logic in `fillFormField()` function
- Added comprehensive logging for radio button matching debugging
- Improved text normalization for better matching accuracy

## Version 2.0.1 - Matrix Question Bug Fix

### Fixed
- **Matrix Question Processing Error**: Fixed "Cannot read properties of undefined (reading 'length')" error
- **Data Flow Issue**: Corrected pageData passing from popup.js to background.js for matrix processing
- **Matrix Data Structure**: Enhanced error handling and validation for matrix data structures
- **Form Filling Logic**: Improved matrix question form filling with better data validation

### Technical Changes
- Enhanced `processMatrixQuestionWithData()` with comprehensive error handling and logging
- Modified popup.js to pass pageData to Agent 2 for matrix question processing
- Updated `fillMatrixQuestion()` to handle the corrected data structure
- Added validation checks for matrix rows, columns, and answers arrays

## Version 2.0.0 - Matrix Question Support

### Added
- **Matrix Question Detection**: Automatically identifies matrix questions in various HTML formats
- **Individual Question Processing**: Breaks down matrix questions into individual row-based questions
- **Smart Response Mapping**: Maps AI responses back to correct input fields in matrix structures
- **Enhanced Text Extraction**: Improved contextual text extraction for better question understanding
- **Multiple Matrix Formats**: Support for table-based, div-based, and fieldset-based matrix questions

### Enhanced
- **Question-Input Mapping**: Improved algorithm for associating questions with their corresponding input fields
- **Error Handling**: Better error recovery and fallback mechanisms
- **Logging**: Enhanced debugging and monitoring capabilities
- **API Reliability**: Improved retry logic and key rotation for API calls

### Technical Changes
- Added `extractMatrixQuestions()` function in content.js
- Added `processMatrixQuestionWithData()` function in background.js
- Added `fillMatrixQuestion()` function in content.js
- Enhanced `extractPageData()` to include matrix question detection
- Updated Agent 1 prompt to handle matrix question identification
- Modified Agent 2 processing to handle individual matrix row questions

### Functions Added
- `extractTableMatrix()` - Extracts matrix from HTML table structures
- `extractDivMatrix()` - Extracts matrix from div-based grid layouts
- `extractFieldsetMatrix()` - Extracts matrix from fieldset structures
- `findMainQuestionForElement()` - Locates main question text for matrix
- `extractRowText()` - Extracts row label text from matrix rows
- `findLabelForInput()` - Finds associated labels for input elements
- `findMatrixInput()` - Maps answers to correct matrix input fields

### Bug Fixes
- Fixed textarea detection in field type identification
- Improved selector generation for complex form structures
- Enhanced visibility checking for dynamic content
- Better handling of ARIA attributes and accessibility features

## Version 1.0.0 - Initial Release

### Features
- Autonomous survey question answering
- AI-powered response generation using Kylin Spears persona
- Automatic form filling
- Continue button identification and clicking
- Support for various input types (text, radio, checkbox, select, textarea)
- API key rotation for reliability
- Real-time logging and monitoring

