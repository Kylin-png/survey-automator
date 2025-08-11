// Content script to extract text and input fields from the webpage

function extractPageData() {
  const data = {
    textContent: [],
    inputFields: [],
    buttons: [],
    questionContext: [] // Enhanced context mapping
  };

  console.log("extractPageData: Starting data extraction.");

  // Extract all visible text content from a broader range of elements
  const textElements = document.querySelectorAll(
    'p, h1, h2, h3, h4, h5, h6, label, legend, fieldset > span, .question, .form-group label, form label, span, div, a, li, td, th, [aria-label], [aria-labelledby], [aria-describedby], .survey-question, .form-question, .questionnaire, [class*="question"], [class*="prompt"], [data-question]'
  );
  
  console.log(`extractPageData: Found ${textElements.length} potential text elements.`);

  textElements.forEach((element, index) => {
    const text = element.textContent.trim();
    const ariaLabel = element.getAttribute('aria-label');
    const ariaLabelledBy = element.getAttribute('aria-labelledby');
    const ariaDescribedBy = element.getAttribute('aria-describedby');

    let final_text = text;
    if (ariaLabel && ariaLabel.length > text.length) final_text = ariaLabel;
    // Prioritize aria-labelledby content if available and refers to a visible element
    if (ariaLabelledBy) {
      const labelledByElement = document.getElementById(ariaLabelledBy);
      if (labelledByElement && isElementVisible(labelledByElement)) {
        const labelledByText = labelledByElement.textContent.trim();
        if (labelledByText.length > final_text.length) final_text = labelledByText;
      }
    }
    // Prioritize aria-describedby content if available and refers to a visible element
    if (ariaDescribedBy) {
      const describedByElement = document.getElementById(ariaDescribedBy);
      if (describedByElement && isElementVisible(describedByElement)) {
        const describedByText = describedByElement.textContent.trim();
        if (describedByText.length > final_text.length) final_text = describedByText;
      }
    }

    if (final_text && final_text.length > 0 && isElementVisible(element)) {
      const rect = element.getBoundingClientRect();
      data.textContent.push({
        id: `text_${index}`,
        text: final_text,
        originalText: text, // Keep original text for debugging
        ariaLabel: ariaLabel,
        ariaLabelledBy: ariaLabelledBy,
        ariaDescribedBy: ariaDescribedBy,
        tagName: element.tagName.toLowerCase(),
        position: {
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height
        }
      });
      console.log(`extractPageData: Added text element: ${final_text}`);
    }
  });

  // Extract input fields including new types
  const inputElements = document.querySelectorAll('input, textarea, select');
  const inputGroups = new Map(); // Group radio buttons and checkboxes by name
  
  console.log(`extractPageData: Found ${inputElements.length} potential input elements.`);

  inputElements.forEach((element, index) => {
    if (isElementVisible(element)) {
      const rect = element.getBoundingClientRect();
      const fieldData = {
        id: `input_${index}`,
        type: element.type || element.tagName.toLowerCase(), // Correctly get type for textarea
        name: element.name || '',
        id_attr: element.id || '',
        placeholder: element.placeholder || '',
        value: element.value || '',
        required: element.required || false,
        ariaLabel: element.getAttribute('aria-label') || '',
        ariaLabelledBy: element.getAttribute('aria-labelledby') || '',
        ariaDescribedBy: element.getAttribute('aria-describedby') || '',
        selector: generateSelector(element),
        min: element.min || '',
        max: element.max || '',
        step: element.step || '',
        position: {
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height
        },
        contextualText: getContextualText(element) // Add contextual text
      };

      // For select elements, get options
      if (element.tagName.toLowerCase() === 'select') {
        fieldData.options = Array.from(element.options).map(option => ({
          value: option.value,
          text: option.textContent.trim()
        })).filter(opt => opt.value !== '' || opt.text !== 'Select an option');
        console.log(`extractPageData: Added select field: ${fieldData.name} with options: ${JSON.stringify(fieldData.options)}`);
      }

      // Group radio buttons and checkboxes by name for option extraction
      if ((element.type === 'radio' || element.type === 'checkbox') && element.name) {
        const groupKey = `${element.type}_${element.name}`;
        if (!inputGroups.has(groupKey)) {
          inputGroups.set(groupKey, {
            type: element.type,
            name: element.name,
            selector: `input[type="${element.type}"][name="${element.name}"]`,
            options: [],
            position: fieldData.position,
            questionText: '' // Placeholder for the associated question
          });
          console.log(`extractPageData: Created new group for ${groupKey}`);
        }
        
        // Find associated label
        let labelText = "";
        // Try to find label using 'for' attribute
        const labelFor = document.querySelector(`label[for="${element.id}"]`);
        if (labelFor) {
          labelText = labelFor.textContent.trim();
        } else {
          // If not found, check if the input is directly inside a label
          const parentLabel = element.closest("label");
          if (parentLabel) {
            labelText = parentLabel.textContent.trim();
          } else {
            // Fallback: look for text in the immediate parent or next sibling that is not the input itself
            const parentDiv = element.parentElement;
            if (parentDiv) {
              // Look for a text node or a span/div containing text within the parentDiv, excluding the input itself
              const potentialTextElements = Array.from(parentDiv.childNodes).filter(node => 
                (node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0) ||
                (node.nodeType === Node.ELEMENT_NODE && (node.tagName.toLowerCase() === 'span' || node.tagName.toLowerCase() === 'div') && node.textContent.trim().length > 0 && node !== element)
              );
              if (potentialTextElements.length > 0) {
                labelText = potentialTextElements[0].textContent.trim();
              }
            }
          }
        }
        
        inputGroups.get(groupKey).options.push({
          value: element.value,
          text: labelText || element.value || element.getAttribute("aria-label") || element.placeholder || 
                (element.nextElementSibling && element.nextElementSibling.tagName.toLowerCase() === "label" ? element.nextElementSibling.textContent.trim() : "") ||
                (element.nextElementSibling && element.nextElementSibling.tagName.toLowerCase() === "span" ? element.nextElementSibling.textContent.trim() : ""),
          selector: `input[type="${element.type}"][name="${element.name}"][value="${element.value}"]`
        });
        console.log(`extractPageData: Added option to ${groupKey}: value=${element.value}, text=${labelText || element.value}`);

        // Attempt to find the question associated with this group
        if (!inputGroups.get(groupKey).questionText) {
          const parentForm = element.closest('form') || document.body;
          const relevantTextElements = Array.from(parentForm.querySelectorAll('h1, h2, h3, h4, h5, h6, p, label, legend'));
          
          let closestQuestion = '';
          let minDistance = Infinity;

          const elementRect = element.getBoundingClientRect();

          for (const textEl of relevantTextElements) {
            const text = textEl.textContent.trim();
          if (text) {
              const textRect = textEl.getBoundingClientRect();
              // Calculate vertical distance from the bottom of the text element to the top of the input
              const distance = elementRect.top - textRect.bottom;
              
              // Consider elements above the input and reasonably close
              if (distance >= -5 && distance < minDistance) { // -5 to allow slight overlap
                closestQuestion = text;
                minDistance = distance;
              }
            }
          }
          if (closestQuestion) {
            inputGroups.get(groupKey).questionText = closestQuestion;
            console.log(`extractPageData: Found question for ${groupKey}: ${closestQuestion}`);
          }
        }

      } else {
        // For non-grouped inputs (text, email, date, range, etc.), add directly
        data.inputFields.push(fieldData);
        console.log(`extractPageData: Added input field: ${fieldData.name} (type: ${fieldData.type})`);
      }
    }
  });

  // Add grouped inputs (radio/checkbox groups) to the data
  inputGroups.forEach((group) => {
    // If a question was found for the group, add it to textContent as well
    if (group.questionText) {
      data.textContent.push({
        id: `question_for_${group.name}`,
        text: group.questionText,
        tagName: 'inferred-question',
        position: group.position // Use position of the first element in the group
      });
      console.log(`extractPageData: Added inferred question to textContent: ${group.questionText}`);
    }
    data.inputFields.push({
      id: `group_${group.name}`,
      type: group.type,
      name: group.name,
      selector: group.selector,
      options: group.options,
      position: group.position
    });
    console.log(`extractPageData: Added grouped input field: ${group.name} (type: ${group.type}) with options: ${JSON.stringify(group.options)}`);
  });

  // Extract matrix questions with improved detection
  const matrixQuestions = extractMatrixQuestions();
  matrixQuestions.forEach((matrix, index) => {
    // Only add true matrix questions (multiple rows with same column structure)
    if (matrix.rows.length > 1 && matrix.columns.length > 1) {
      data.inputFields.push({
        id: `matrix_${index}`,
        type: 'matrix',
        mainQuestion: matrix.mainQuestion,
        rows: matrix.rows,
        columns: matrix.columns,
        position: matrix.position,
        isMatrixQuestion: true
      });
      console.log(`extractPageData: Added matrix question: ${matrix.mainQuestion} with ${matrix.rows.length} rows and ${matrix.columns.length} columns`);
    } else {
      console.log(`extractPageData: Skipped potential matrix (insufficient structure): ${matrix.mainQuestion}`);
    }
  });

  // Extract buttons
  const buttonElements = document.querySelectorAll(
    'button, input[type="button"], input[type="submit"], input[type="reset"], a[role="button"], .btn, .button'
  );
  console.log(`extractPageData: Found ${buttonElements.length} potential button elements.`);

  buttonElements.forEach((element, index) => {
    if (isElementVisible(element)) {
      const rect = element.getBoundingClientRect();
      const buttonText = element.textContent.trim() || element.value || element.getAttribute('aria-label') || '';
      if (buttonText) {
        data.buttons.push({
          id: `button_${index}`,
          text: buttonText,
          tagName: element.tagName.toLowerCase(),
          selector: generateSelector(element),
          position: {
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height
          }
        });
        console.log(`extractPageData: Added button: ${buttonText}`);
      }
    }
  });

  console.log("extractPageData: Finished data extraction.");
  return data;
}

function isElementVisible(element) {
  const style = window.getComputedStyle(element);
  return style.display !== 'none' && 
         style.visibility !== 'hidden' && 
         style.opacity !== '0' &&
         element.offsetWidth > 0 && 
         element.offsetHeight > 0;
}

function getContextualText(element) {
  const texts = new Set();

  // 1. Check for associated <label> element
  if (element.id) {
    const label = document.querySelector(`label[for="${element.id}"]`);
    if (label && isElementVisible(label)) {
      texts.add(label.textContent.trim());
    }
  }

  // Enhanced: Check for question indicators in parent hierarchy
  let parent = element.parentElement;
  let depth = 0;
  while (parent && depth < 5) {
    // Look for question-like elements in parent
    const questionElements = parent.querySelectorAll(
      '.question, .survey-question, .form-question, [class*="question"], h1, h2, h3, h4, h5, h6, legend, .prompt, [data-question]'
    );
    
    questionElements.forEach(qEl => {
      if (isElementVisible(qEl) && !qEl.contains(element)) {
        const qText = qEl.textContent.trim();
        if (qText.length > 5 && qText.includes('?') || qText.match(/\b(how|what|when|where|why|which|do you|are you|have you|would you|please|rate|select|choose)\b/i)) {
          texts.add(qText);
        }
      }
    });
    
    parent = parent.parentElement;
    depth++;
  }

  // 2. Check parent <label> (for inputs wrapped in labels)
  const parentLabel = element.closest('label');
  if (parentLabel && isElementVisible(parentLabel)) {
    texts.add(parentLabel.textContent.trim());
  }

  // 3. Check for aria-labelledby and aria-describedby
  const ariaLabelledBy = element.getAttribute('aria-labelledby');
  if (ariaLabelledBy) {
    ariaLabelledBy.split(' ').forEach(id => {
      const el = document.getElementById(id);
      if (el && isElementVisible(el)) texts.add(el.textContent.trim());
    });
  }
  const ariaDescribedBy = element.getAttribute('aria-describedby');
  if (ariaDescribedBy) {
    ariaDescribedBy.split(' ').forEach(id => {
      const el = document.getElementById(id);
      if (el && isElementVisible(el)) texts.add(el.textContent.trim());
    });
  }

  // 4. Check for aria-label
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel) texts.add(ariaLabel.trim());

  // 5. Check for placeholder
  if (element.placeholder) texts.add(element.placeholder.trim());

  // 6. Check for text in close proximity (e.g., siblings, parent's siblings)
  const checkProximity = (el, depth = 0) => {
    if (!el || depth > 2) return; // Limit depth to avoid too much irrelevant text

    // Check previous siblings
    let prev = el.previousSibling;
    while (prev) {
      if (prev.nodeType === Node.TEXT_NODE && prev.textContent.trim().length > 0) {
        texts.add(prev.textContent.trim());
      } else if (prev.nodeType === Node.ELEMENT_NODE && isElementVisible(prev)) {
        // Look for text within previous element, e.g., a <span> before an <input>
        const textContent = prev.textContent.trim();
        if (textContent.length > 0) texts.add(textContent);
      }
      prev = prev.previousSibling;
    }

    // Check parent's text content if it's not just whitespace
    if (el.parentElement && el.parentElement.textContent.trim().length > 0) {
      // Only add if it's not just the input's value or placeholder
      const parentText = el.parentElement.textContent.trim();
      if (!parentText.includes(element.value) && !parentText.includes(element.placeholder)) {
        texts.add(parentText);
      }
    }

    // Recursively check parent
    checkProximity(el.parentElement, depth + 1);
  };
  checkProximity(element);

  // Filter out empty strings and duplicates, join with a separator
  return Array.from(texts).filter(t => t.length > 0).join(' | ');
}

function isValidQuestionText(text) {
  // Allow all visible text to be sent to the AI for analysis.
  // The AI will determine what constitutes a question or relevant text.
  // Basic filtering for empty strings can remain.
  return text.length > 0;
}

function generateSelector(element) {
  // Prioritize unique attributes
  const uniqueAttributes = ["data-testid", "data-cy", "data-qa", "name", "id"];
  for (const attr of uniqueAttributes) {
    const value = element.getAttribute(attr);
    if (value) {
      // For id, use CSS selector directly
      if (attr === "id") return `#${value}`;
      // For other unique attributes, use CSS selector
      return `[${attr}="${value}"]`;
    }
  }

  // Fallback to XPath for more robust selection, especially for text content
  // This function will generate a unique XPath for the element
  return generateXPath(element);
}

function generateXPath(element) {
  if (element.id) {
    return `//*[@id="${element.id}"]`;
  }
  if (element === document.body) {
    return "/html/body";
  }

  const siblings = Array.from(element.parentNode.children);
  const sameTagSiblings = siblings.filter(sibling => sibling.tagName === element.tagName);

  if (sameTagSiblings.length > 1) {
    const index = sameTagSiblings.indexOf(element) + 1;
    return generateXPath(element.parentNode) + `/${element.tagName.toLowerCase()}[${index}]`;
  }

  return generateXPath(element.parentNode) + `/${element.tagName.toLowerCase()}`;
}

// Function to find an element by text content (using XPath)
function findElementByText(text) {
  // Escape single quotes in the text for XPath
  const escapedText = text.replace(/'/g, "',\"'\",'");
  const xpath = `//*[contains(text(), '${escapedText}')]`;
  const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
  return result.singleNodeValue;
}

// Enhanced form filling function with support for new input types
function fillFormField(selector, value, fieldType) {
  try {
    console.log(`fillFormField: Attempting to fill field: ${selector} with value: ${value} (type: ${fieldType})`);
    
    // Normalize the AI's value by removing all spaces and replacing various dashes with a standard hyphen
    const normalizedValue = value.toLowerCase().replace(/\s/g, '').replace(/[\u2013\u2014]/g, '-');
    console.log(`fillFormField: Normalized AI value: ${normalizedValue}`);

    switch (fieldType) {
      case 'radio':
        let radioElement = null;
        const allRadios = document.querySelectorAll(selector);
        console.log(`fillFormField: Found ${allRadios.length} radio buttons for selector: ${selector}`);

        // Log all available radio options for debugging and normalize their text
        const normalizedRadioOptions = Array.from(allRadios).map((radio, i) => {
          const label = radio.closest('label') || document.querySelector(`label[for="${radio.id}"]`);
          const labelText = label ? label.textContent.trim() : '';
          const normalizedLabelText = labelText.toLowerCase().replace(/\s/g, '').replace(/[\u2013\u2014]/g, '-');
          const normalizedRadioValue = radio.value.toLowerCase().replace(/\s/g, '').replace(/[\u2013\u2014]/g, '-');
          console.log(`fillFormField: Radio option ${i}: original label='${labelText}', normalized label='${normalizedLabelText}', original value='${radio.value}', normalized value='${normalizedRadioValue}'`);
          return { radio, normalizedLabelText, normalizedRadioValue };
        });

        // Strategy 1: Try exact normalized label text match
        radioElement = normalizedRadioOptions.find(opt => opt.normalizedLabelText === normalizedValue)?.radio;
        if (radioElement) {
          console.log(`fillFormField: Matched by normalized label text.`);
        }

        // Strategy 2: If not found by label, try exact normalized value match
        if (!radioElement) {
          radioElement = normalizedRadioOptions.find(opt => opt.normalizedRadioValue === normalizedValue)?.radio;
          if (radioElement) {
            console.log(`fillFormField: Matched by normalized radio value.`);
          }
        }

        // Strategy 3: Try mapping common values and scale responses
        if (!radioElement) {
          // First try the existing value map
          const valueMap = {
            'male': ['male', 'man', 'm'],
            'female': ['female', 'woman', 'f'],
            'full-time': ['employed full time', 'full time', 'fulltime'],
            'part-time': ['employed part time', 'part time', 'parttime'],
            'high-school': ['high school graduate or equivalent', 'high school', 'hs'],
            'own-house': ['own a house', 'homeowner', 'house owner'],
            'yes': ['yes', 'y', 'true'],
            'no': ['no', 'n', 'false']
          };
          
          radioElement = normalizedRadioOptions.find(opt => {
            const mappedValues = valueMap[opt.radio.value.toLowerCase()] || [];
            const normalizedMappedValues = mappedValues.map(mv => mv.toLowerCase().replace(/\s/g, '').replace(/[\u2013\u2014]/g, '-'));
            console.log(`fillFormField: Checking mapped values for radio '${opt.radio.value}': ${JSON.stringify(normalizedMappedValues)} against normalized AI value '${normalizedValue}'`);
            return normalizedMappedValues.some(mapped => mapped === normalizedValue);
          })?.radio;
          if (radioElement) {
            console.log(`fillFormField: Matched by mapped value.`);
          }
        }
        
        // Strategy 4: Try scale-based mapping for Likert scales and importance ratings
        if (!radioElement) {
          console.log(`fillFormField: Attempting scale-based mapping for value: ${value}`);
          
          // Define scale mappings for common survey patterns
          const scaleMap = {
            // Satisfaction scales (1-5)
            'verydissatisfied': '1',
            'dissatisfied': '2', 
            'neutral': '3',
            'satisfied': '4',
            'verysatisfied': '5',
            
            // Importance scales (1-5)
            'notimportant': '1',
            'slightlyimportant': '2',
            'moderatelyimportant': '3',
            'veryimportant': '4',
            'extremelyimportant': '5',
            
            // Frequency scales
            'never': '1',
            'rarely': '2', 
            'sometimes': '3',
            'often': '4',
            'daily': '5',
            'always': '5'
          };
          
          const mappedValue = scaleMap[normalizedValue];
          if (mappedValue) {
            radioElement = normalizedRadioOptions.find(opt => opt.radio.value === mappedValue)?.radio;
            if (radioElement) {
              console.log(`fillFormField: Matched by scale mapping: ${value} -> ${mappedValue}`);
            }
          }
        }
        
        // Strategy 5: Try reverse mapping - find radio with matching label and use its value
        if (!radioElement) {
          console.log(`fillFormField: Attempting reverse label mapping`);
          
          // Get all labels associated with this radio group
          const radioLabels = Array.from(allRadios).map(radio => {
            const label = radio.closest('label') || document.querySelector(`label[for="${radio.id}"]`);
            const labelText = label ? label.textContent.trim() : '';
            return { radio, labelText };
          });
          
          // Find label that contains the AI response text
          const matchingLabel = radioLabels.find(item => {
            const normalizedLabel = item.labelText.toLowerCase().replace(/\s/g, '').replace(/[\u2013\u2014]/g, '-');
            return normalizedLabel.includes(normalizedValue) || normalizedValue.includes(normalizedLabel);
          });
          
          if (matchingLabel) {
            radioElement = matchingLabel.radio;
            console.log(`fillFormField: Matched by reverse label mapping: ${value} -> ${matchingLabel.labelText}`);
          }
        }
        
        if (radioElement) {
          radioElement.checked = true;
          radioElement.dispatchEvent(new Event('change', { bubbles: true }));
          radioElement.dispatchEvent(new Event('click', { bubbles: true }));
          console.log(`fillFormField: Successfully selected radio: ${radioElement.value}`);
          return { success: true, message: `Selected radio option: ${radioElement.value}` };
        } else {
          console.warn(`fillFormField: Radio option not found for value: ${value}`);
          return { success: false, error: `Radio option not found: ${value}` };
        }

      case 'checkbox':
        // For checkboxes, handle multiple values and try similar matching strategies
        let checkboxValues;
        if (Array.isArray(value)) {
          checkboxValues = value;
        } else if (typeof value === 'string' && value.includes(',')) {
          checkboxValues = value.split(',').map(v => v.trim());
        } else {
          checkboxValues = [value];
        }
        
        let checkedCount = 0;
        const allCheckboxes = document.querySelectorAll(selector); // Ensure this is defined here

        checkboxValues.forEach(val => {
          let checkboxElement = null;
          const normalizedVal = val.toLowerCase().replace(/\s/g, '').replace(/[\u2013\u2014]/g, '-');

          const normalizedCheckboxOptions = Array.from(allCheckboxes).map(checkbox => {
            const label = checkbox.closest('label') || document.querySelector(`label[for="${checkbox.id}"]`);
            const labelText = label ? label.textContent.trim() : '';
            return {
              checkbox,
              normalizedValue: checkbox.value.toLowerCase().replace(/\s/g, '').replace(/[\u2013\u2014]/g, '-'),
              normalizedLabelText: labelText.toLowerCase().replace(/\s/g, '').replace(/[\u2013\u2014]/g, '-')
            };
          });

          // Strategy 1: Try exact normalized label text match
          checkboxElement = normalizedCheckboxOptions.find(opt => opt.normalizedLabelText === normalizedVal)?.checkbox;
          
          // Strategy 2: If not found by label, try exact normalized value match
          if (!checkboxElement) {
            checkboxElement = normalizedCheckboxOptions.find(opt => opt.normalizedValue === normalizedVal)?.checkbox;
          }
          
          // Strategy 3: Try mapping common values (only if direct matches fail)
          if (!checkboxElement) {
            const valueMap = {
              'sports': ['sports'],
              'movies': ['watching movies'],
              'gaming': ['gaming'],
              'music': ['listening to music'],
              'reading': ['reading'],
              'cooking': ['cooking'],
              'travel': ['traveling'],
              'exercise': ['exercise', 'fitness']
            };
            checkboxElement = normalizedCheckboxOptions.find(opt => {
              const mappedValues = valueMap[opt.checkbox.value.toLowerCase()] || [];
              const normalizedMappedValues = mappedValues.map(mv => mv.toLowerCase().replace(/\s/g, '').replace(/[\u2013\u2014]/g, '-'));
              return normalizedMappedValues.some(mapped => mapped === normalizedVal);
            })?.checkbox;
          }
          
          if (checkboxElement) {
            checkboxElement.checked = true;
            checkboxElement.dispatchEvent(new Event('change', { bubbles: true }));
            checkboxElement.dispatchEvent(new Event('click', { bubbles: true }));
            checkedCount++;
            console.log(`fillFormField: Successfully checked checkbox: ${checkboxElement.value}`);
          } else {
            console.warn(`fillFormField: Checkbox option not found for value: ${val}`);
          }
        });
        
        if (checkedCount > 0) {
          return { success: true, message: `Checked ${checkedCount} checkbox(es)` };
        } else {
          return { success: false, error: `No checkbox options found for: ${value}` };
        }

      case 'select-one':
      case 'select':
        const selectElement = document.querySelector(selector);
        if (selectElement && selectElement.tagName.toLowerCase() === 'select') {
          const options = Array.from(selectElement.options);
          
          // Normalize the AI's value
          const normalizedSelectValue = value.toLowerCase().replace(/\s/g, '').replace(/[\u2013\u2014]/g, '-');
          console.log(`fillFormField: Normalized AI select value: ${normalizedSelectValue}`);

          // Log all available select options for debugging and normalize their text
          const normalizedSelectOptions = options.map(opt => ({
            opt,
            normalizedText: opt.text.trim().toLowerCase().replace(/\s/g, '').replace(/[\u2013\u2014]/g, '-'),
            normalizedValue: opt.value.toLowerCase().replace(/\s/g, '').replace(/[\u2013\u2014]/g, '-')
          }));
          normalizedSelectOptions.forEach((opt, i) => {
            console.log(`fillFormField: Select option ${i}: original text='${opt.opt.text}', normalized text='${opt.normalizedText}', original value='${opt.opt.value}', normalized value='${opt.normalizedValue}'`);
          });

          let targetOption = null;
          
          // Strategy 1: Exact normalized text match
          targetOption = normalizedSelectOptions.find(opt => opt.normalizedText === normalizedSelectValue)?.opt;
          if (targetOption) {
            console.log(`fillFormField: Matched select by normalized text.`);
          }
          
          // Strategy 2: Exact normalized value match
          if (!targetOption) {
            targetOption = normalizedSelectOptions.find(opt => opt.normalizedValue === normalizedSelectValue)?.opt;
            if (targetOption) {
              console.log(`fillFormField: Matched select by normalized value.`);
            }
          }
          
          if (targetOption) {
            selectElement.value = targetOption.value;
            selectElement.dispatchEvent(new Event('change', { bubbles: true }));
            console.log(`fillFormField: Successfully selected option: ${targetOption.text}`);
            return { success: true, message: `Selected option: ${targetOption.text}` };
          } else {
            return { success: false, error: `Option not found in select: ${value}` };
          }
        }
        break;

      case 'range':
        // Handle slider/range inputs
        const rangeElement = document.querySelector(selector);
        if (rangeElement) {
          // Convert value to number and ensure it's within range
          let numValue = parseFloat(value);
          const min = parseFloat(rangeElement.min) || 0;
          const max = parseFloat(rangeElement.max) || 100;
          
          // Clamp value to range
          numValue = Math.max(min, Math.min(max, numValue));
          
          rangeElement.value = numValue;
          rangeElement.dispatchEvent(new Event('input', { bubbles: true }));
          rangeElement.dispatchEvent(new Event('change', { bubbles: true }));
          
          // Note: We don't need to manually trigger oninput functions
          // The input and change events we dispatch above are sufficient
          // and avoid CSP violations from eval()
          
          console.log(`fillFormField: Successfully set range value: ${numValue}`);
          return { success: true, message: `Set slider to: ${numValue}` };
        }
        break;

      case 'date':
        // Handle date inputs
        const dateElement = document.querySelector(selector);
        if (dateElement) {
          // Convert various date formats to YYYY-MM-DD
          let dateValue = value;
          
          // If it's a year only (like 2000), convert to birth date
          if (/^\d{4}$/.test(value)) {
            // For birth year, create a date (use June 28th for Kylin)
            dateValue = `${value}-06-28`;
          }
          
          dateElement.value = dateValue;
          dateElement.dispatchEvent(new Event('input', { bubbles: true }));
          dateElement.dispatchEvent(new Event('change', { bubbles: true }));
          console.log(`fillFormField: Successfully set date: ${dateValue}`);
          return { success: true, message: `Set date to: ${dateValue}` };
        }
        break;

      case 'tel':
        // Handle telephone inputs
        const telElement = document.querySelector(selector);
        if (telElement) {
          // Format phone number if needed
          let phoneValue = value;
          
          // If it's just digits, format as (XXX) XXX-XXXX
          if (/^\d{10}$/.test(value)) {
            phoneValue = `(${value.slice(0,3)}) ${value.slice(3,6)}-${value.slice(6)}`;
          }
          
          telElement.value = phoneValue;
          telElement.dispatchEvent(new Event('input', { bubbles: true }));
          telElement.dispatchEvent(new Event('change', { bubbles: true }));
          console.log(`fillFormField: Successfully set phone: ${phoneValue}`);
          return { success: true, message: `Set phone to: ${phoneValue}` };
        }
        break;

      case 'text':
      case 'email':
      case 'number':
      case 'textarea': // Added textarea here
        const inputElement = document.querySelector(selector);
        if (inputElement) {
          inputElement.value = value;
          inputElement.dispatchEvent(new Event('input', { bubbles: true }));
          inputElement.dispatchEvent(new Event('change', { bubbles: true }));
          console.log(`fillFormField: Successfully filled input: ${value}`);
          return { success: true, message: `Filled input with: ${value}` };
        }
        break;

      default:
        return { success: false, error: `Unsupported field type: ${fieldType}` };
    }
  } catch (error) {
    console.error('fillFormField: Error filling form field:', error);
    return { success: false, error: error.message };
  }
  // Ensure a return value even if no element is found or type is unsupported
  return { success: false, error: `Field not found or unsupported type: ${selector} (${fieldType})` };
}

// Function to click a button by selector (supports both CSS and XPath selectors)
function clickButton(selector) {
  try {
    console.log(`clickButton: Attempting to click button with selector: ${selector}`);
    
    let button = null;
    
    // Check if it's an XPath selector (starts with / or //)
    if (selector.startsWith('/')) {
      console.log(`clickButton: Using XPath selector: ${selector}`);
      const result = document.evaluate(selector, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
      button = result.singleNodeValue;
    } else {
      console.log(`clickButton: Using CSS selector: ${selector}`);
      button = document.querySelector(selector);
    }
    
    if (!button) {
      console.error(`clickButton: Button not found with selector: ${selector}`);
      return { success: false, error: `Button not found with selector: ${selector}` };
    }
    
    if (!isElementVisible(button)) {
      console.error(`clickButton: Button is not visible: ${selector}`);
      return { success: false, error: `Button is not visible: ${selector}` };
    }
    
    // Click the button
    button.click();
    console.log(`clickButton: Successfully clicked button: ${selector}`);
    
    return { success: true, message: `Successfully clicked button: ${selector}` };
  } catch (error) {
    console.error('clickButton: Error clicking button:', error);
    return { success: false, error: error.message };
  }
}

// Function to extract matrix questions from the page
function extractMatrixQuestions() {
  const matrixQuestions = [];
  
  console.log("extractMatrixQuestions: Starting matrix question extraction.");
  
  // Enhanced pattern detection for matrix questions
  const matrixPatterns = [
    // Table-based matrices
    'table',
    // Div-based matrices with various naming conventions
    '.matrix, .grid, .question-matrix, .rating-matrix, .survey-matrix',
    '[class*="matrix"], [class*="grid"], [class*="rating-grid"]',
    '[data-matrix], [role="grid"], [role="table"]',
    // Survey-specific patterns
    '.survey-grid, .question-grid, .response-grid, .rating-table',
    '.likert, .likert-scale, .scale-matrix',
    // Form-based patterns
    '.form-matrix, .input-matrix, .choice-matrix'
  ];

  // Look for table-based matrix questions
  const tables = document.querySelectorAll('table');
  tables.forEach((table, tableIndex) => {
    if (isElementVisible(table)) {
      const matrix = extractTableMatrix(table, tableIndex);
      if (matrix && matrix.rows.length > 1) {
        matrixQuestions.push(matrix);
        console.log(`extractMatrixQuestions: Found table-based matrix: ${matrix.mainQuestion}`);
      }
    }
  });
  
  // Look for div-based matrix questions with expanded selectors
  const potentialMatrixContainers = document.querySelectorAll(
    matrixPatterns.join(', ')
  );
  potentialMatrixContainers.forEach((container, containerIndex) => {
    if (isElementVisible(container)) {
      const matrix = extractDivMatrix(container, containerIndex);
      if (matrix && matrix.rows.length > 1) {
        matrixQuestions.push(matrix);
        console.log(`extractMatrixQuestions: Found div-based matrix: ${matrix.mainQuestion}`);
      }
    }
  });
  
  // Look for fieldset-based matrix questions
  const fieldsets = document.querySelectorAll('fieldset');
  fieldsets.forEach((fieldset, fieldsetIndex) => {
    if (isElementVisible(fieldset)) {
      const matrix = extractFieldsetMatrix(fieldset, fieldsetIndex);
      if (matrix && matrix.rows.length > 1) {
        matrixQuestions.push(matrix);
        console.log(`extractMatrixQuestions: Found fieldset-based matrix: ${matrix.mainQuestion}`);
      }
    }
  });

  // Advanced matrix detection: Look for repeated input patterns
  const advancedMatrices = detectAdvancedMatrixPatterns();
  advancedMatrices.forEach(matrix => {
    if (matrix.rows.length > 1) {
      matrixQuestions.push(matrix);
      console.log(`extractMatrixQuestions: Found advanced pattern matrix: ${matrix.mainQuestion}`);
    }
  });
  
  console.log(`extractMatrixQuestions: Found ${matrixQuestions.length} matrix questions.`);
  return matrixQuestions;
}

// New function to detect advanced matrix patterns
function detectAdvancedMatrixPatterns() {
  const matrices = [];
  
  // Look for groups of inputs with similar naming patterns
  const allInputs = document.querySelectorAll('input[type="radio"], input[type="checkbox"]');
  const inputGroups = new Map();
  
  allInputs.forEach(input => {
    if (!input.name || !isElementVisible(input)) return;
    
    // Group inputs by similar naming patterns (e.g., question_1, question_2, etc.)
    const baseName = input.name.replace(/_\d+$/, '').replace(/\d+$/, '');
    if (!inputGroups.has(baseName)) {
      inputGroups.set(baseName, []);
    }
    inputGroups.get(baseName).push(input);
  });
  
  // Check if any group forms a matrix pattern
  inputGroups.forEach((inputs, baseName) => {
    if (inputs.length < 4) return; // Need at least 4 inputs for a 2x2 matrix
    
    // Group by unique names to identify rows
    const nameGroups = new Map();
    inputs.forEach(input => {
      if (!nameGroups.has(input.name)) {
        nameGroups.set(input.name, []);
      }
      nameGroups.get(input.name).push(input);
    });
    
    const uniqueNames = Array.from(nameGroups.keys());
    if (uniqueNames.length < 2) return; // Need at least 2 rows
    
    // Check if each row has the same number of options
    const rowSizes = uniqueNames.map(name => nameGroups.get(name).length);
    const isMatrix = rowSizes.every(size => size === rowSizes[0] && size > 1);
    
    if (isMatrix) {
      const matrix = buildMatrixFromInputGroups(nameGroups, baseName);
      if (matrix) {
        matrices.push(matrix);
      }
    }
  });
  
  return matrices;
}

function buildMatrixFromInputGroups(nameGroups, baseName) {
  const matrix = {
    mainQuestion: findQuestionForInputGroup(Array.from(nameGroups.values())[0]),
    rows: [],
    columns: [],
    position: { x: 0, y: 0, width: 0, height: 0 }
  };
  
  // Build columns from first row
  const firstRowInputs = Array.from(nameGroups.values())[0];
  firstRowInputs.forEach((input, index) => {
    const label = findLabelForInput(input);
    matrix.columns.push({
      id: `col_${baseName}_${index}`,
      text: label || input.value || `Option ${index + 1}`
    });
  });
  
  // Build rows
  let rowIndex = 0;
  nameGroups.forEach((inputs, name) => {
    const rowLabel = extractRowLabelFromName(name) || `Row ${rowIndex + 1}`;
    const rowData = {
      id: `row_${baseName}_${rowIndex}`,
      text: rowLabel,
      inputs: inputs.map((input, colIndex) => ({
        selector: generateSelector(input),
        value: input.value || '',
        type: input.type,
        columnIndex: colIndex
      }))
    };
    matrix.rows.push(rowData);
    rowIndex++;
  });
  
  return matrix.rows.length > 1 ? matrix : null;
}

function extractRowLabelFromName(name) {
  // Try to extract meaningful text from input names
  const parts = name.split(/[_-]/);
  const meaningfulPart = parts.find(part => 
    part.length > 2 && 
    !part.match(/^\d+$/) && 
    !['question', 'input', 'field', 'item'].includes(part.toLowerCase())
  );
  
  if (meaningfulPart) {
    return meaningfulPart.replace(/([A-Z])/g, ' $1').trim();
  }
  
  return null;
}

function findQuestionForInputGroup(inputs) {
  if (!inputs || inputs.length === 0) return 'Matrix Question';
  
  const firstInput = inputs[0];
  let parent = firstInput.closest('form, fieldset, .question, .survey-section, [class*="question"]');
  
  if (parent) {
    const questionElements = parent.querySelectorAll('h1, h2, h3, h4, h5, h6, legend, .question-text, [class*="question"]');
    for (const qEl of questionElements) {
      const text = qEl.textContent.trim();
      if (text.length > 10 && (text.includes('?') || text.match(/\b(rate|select|choose|how|what)\b/i))) {
        return text;
      }
    }
  }
  
  return 'Matrix Question';
}

// Extract matrix from table element
function extractTableMatrix(table, tableIndex) {
  const rows = table.querySelectorAll('tr');
  if (rows.length < 2) return null; // Need at least header and one data row
  
  const matrix = {
    mainQuestion: '',
    rows: [],
    columns: [],
    position: table.getBoundingClientRect()
  };
  
  // Find main question (look for preceding elements)
  matrix.mainQuestion = findMainQuestionForElement(table);
  
  // Extract column headers from first row
  const headerRow = rows[0];
  const headerCells = headerRow.querySelectorAll('th, td');
  headerCells.forEach((cell, index) => {
    if (index > 0) { // Skip first cell (usually empty or row label header)
      const text = cell.textContent.trim();
      if (text) {
        matrix.columns.push({
          id: `col_${tableIndex}_${index}`,
          text: text
        });
      }
    }
  });
  
  // Extract data rows
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const cells = row.querySelectorAll('th, td');
    if (cells.length === 0) continue;
    
    const rowText = cells[0].textContent.trim();
    if (!rowText) continue;
    
    const rowData = {
      id: `row_${tableIndex}_${i}`,
      text: rowText,
      inputs: []
    };
    
    // Extract inputs from this row
    for (let j = 1; j < cells.length; j++) {
      const cell = cells[j];
      const inputs = cell.querySelectorAll('input, select, textarea');
      inputs.forEach(input => {
        if (isElementVisible(input)) {
          rowData.inputs.push({
            selector: generateSelector(input),
            value: input.value || '',
            type: input.type || input.tagName.toLowerCase(),
            columnIndex: j - 1
          });
        }
      });
    }
    
    if (rowData.inputs.length > 0) {
      matrix.rows.push(rowData);
    }
  }
  
  // Only return if we found a valid matrix structure
  if (matrix.columns.length > 0 && matrix.rows.length > 0) {
    return matrix;
  }
  
  return null;
}

// Extract matrix from div-based structure
function extractDivMatrix(container, containerIndex) {
  const matrix = {
    mainQuestion: '',
    rows: [],
    columns: [],
    position: container.getBoundingClientRect()
  };
  
  // Find main question
  matrix.mainQuestion = findMainQuestionForElement(container);
  
  // Look for column headers
  const columnHeaders = container.querySelectorAll(
    '.column-header, .col-header, [class*="column"], [class*="header"], .matrix-header th, .matrix-header td'
  );
  columnHeaders.forEach((header, index) => {
    const text = header.textContent.trim();
    if (text && !text.match(/^(row|question|item)$/i)) {
      matrix.columns.push({
        id: `col_${containerIndex}_${index}`,
        text: text
      });
    }
  });
  
  // If no explicit column headers found, try to infer from input patterns
  if (matrix.columns.length === 0) {
    const firstRowInputs = container.querySelectorAll('input[type="radio"], input[type="checkbox"]');
    const inputNames = new Set();
    firstRowInputs.forEach(input => {
      if (input.name) inputNames.add(input.name);
    });
    
    // For each unique name, find all possible values to determine columns
    inputNames.forEach(name => {
      const inputs = container.querySelectorAll(`input[name="${name}"]`);
      inputs.forEach((input, index) => {
        const label = findLabelForInput(input);
        if (label && !matrix.columns.find(col => col.text === label)) {
          matrix.columns.push({
            id: `col_${containerIndex}_${index}`,
            text: label
          });
        }
      });
    });
  }
  
  // Look for row structures
  const rowElements = container.querySelectorAll(
    '.matrix-row, .question-row, .row, [class*="row"]:not([class*="header"])'
  );
  
  rowElements.forEach((rowElement, rowIndex) => {
    if (!isElementVisible(rowElement)) return;
    
    const rowText = extractRowText(rowElement);
    if (!rowText) return;
    
    const rowData = {
      id: `row_${containerIndex}_${rowIndex}`,
      text: rowText,
      inputs: []
    };
    
    // Extract inputs from this row
    const inputs = rowElement.querySelectorAll('input, select, textarea');
    inputs.forEach((input, inputIndex) => {
      if (isElementVisible(input)) {
        rowData.inputs.push({
          selector: generateSelector(input),
          value: input.value || '',
          type: input.type || input.tagName.toLowerCase(),
          columnIndex: inputIndex
        });
      }
    });
    
    if (rowData.inputs.length > 0) {
      matrix.rows.push(rowData);
    }
  });
  
  // Only return if we found a valid matrix structure
  if (matrix.rows.length > 1 && (matrix.columns.length > 0 || matrix.rows[0].inputs.length > 1)) {
    return matrix;
  }
  
  return null;
}

// Extract matrix from fieldset structure
function extractFieldsetMatrix(fieldset, fieldsetIndex) {
  const legend = fieldset.querySelector('legend');
  if (!legend) return null;
  
  const matrix = {
    mainQuestion: legend.textContent.trim(),
    rows: [],
    columns: [],
    position: fieldset.getBoundingClientRect()
  };
  
  // Look for grouped inputs that suggest a matrix structure
  const inputGroups = new Map();
  const inputs = fieldset.querySelectorAll('input[type="radio"], input[type="checkbox"]');
  
  inputs.forEach(input => {
    if (!isElementVisible(input)) return;
    
    const name = input.name;
    if (!name) return;
    
    if (!inputGroups.has(name)) {
      inputGroups.set(name, []);
    }
    inputGroups.get(name).push(input);
  });
  
  // If we have multiple groups with the same number of options, it might be a matrix
  const groupSizes = Array.from(inputGroups.values()).map(group => group.length);
  const uniqueSizes = [...new Set(groupSizes)];
  
  if (inputGroups.size > 1 && uniqueSizes.length === 1 && uniqueSizes[0] > 1) {
    // Extract columns from the first group
    const firstGroup = Array.from(inputGroups.values())[0];
    firstGroup.forEach((input, index) => {
      const label = findLabelForInput(input);
      if (label) {
        matrix.columns.push({
          id: `col_${fieldsetIndex}_${index}`,
          text: label
        });
      }
    });
    
    // Extract rows
    inputGroups.forEach((inputs, groupName) => {
      const rowText = extractRowTextFromInputGroup(inputs);
      if (rowText) {
        const rowData = {
          id: `row_${fieldsetIndex}_${groupName}`,
          text: rowText,
          inputs: []
        };
        
        inputs.forEach((input, index) => {
          rowData.inputs.push({
            selector: generateSelector(input),
            value: input.value || '',
            type: input.type,
            columnIndex: index
          });
        });
        
        matrix.rows.push(rowData);
      }
    });
    
    if (matrix.rows.length > 0 && matrix.columns.length > 0) {
      return matrix;
    }
  }
  
  return null;
}

// Helper function to find main question for an element
function findMainQuestionForElement(element) {
  // Look for preceding headings or labels
  const precedingElements = [];
  let current = element.previousElementSibling;
  let searchDepth = 0;
  
  while (current && searchDepth < 5) {
    if (isElementVisible(current)) {
      const text = current.textContent.trim();
      if (text && text.length > 10) { // Reasonable question length
        precedingElements.push({ element: current, text: text });
      }
    }
    current = current.previousElementSibling;
    searchDepth++;
  }
  
  // Also check parent elements
  let parent = element.parentElement;
  searchDepth = 0;
  while (parent && searchDepth < 3) {
    const headings = parent.querySelectorAll('h1, h2, h3, h4, h5, h6, .question, .matrix-question');
    headings.forEach(heading => {
      if (isElementVisible(heading) && heading !== element) {
        const text = heading.textContent.trim();
        if (text && text.length > 10) {
          precedingElements.push({ element: heading, text: text });
        }
      }
    });
    parent = parent.parentElement;
    searchDepth++;
  }
  
  // Return the most likely question (closest and most relevant)
  if (precedingElements.length > 0) {
    return precedingElements[0].text;
  }
  
  return 'Matrix Question';
}

// Helper function to extract row text from a row element
function extractRowText(rowElement) {
  // Look for label elements first
  const label = rowElement.querySelector('label, .row-label, .question-text');
  if (label && isElementVisible(label)) {
    return label.textContent.trim();
  }
  
  // Look for text nodes that aren't part of inputs
  const textNodes = [];
  const walker = document.createTreeWalker(
    rowElement,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: function(node) {
        const parent = node.parentElement;
        if (parent && (parent.tagName === 'INPUT' || parent.tagName === 'SELECT' || parent.tagName === 'TEXTAREA')) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );
  
  let node;
  while (node = walker.nextNode()) {
    const text = node.textContent.trim();
    if (text && text.length > 2) {
      textNodes.push(text);
    }
  }
  
  return textNodes.join(' ').trim();
}

// Helper function to find label for an input
function findLabelForInput(input) {
  // Check for explicit label
  if (input.id) {
    const label = document.querySelector(`label[for="${input.id}"]`);
    if (label && isElementVisible(label)) {
      return label.textContent.trim();
    }
  }
  
  // Check for parent label
  const parentLabel = input.closest('label');
  if (parentLabel && isElementVisible(parentLabel)) {
    return parentLabel.textContent.trim();
  }
  
  // Check for adjacent text
  const nextSibling = input.nextElementSibling;
  if (nextSibling && isElementVisible(nextSibling)) {
    const text = nextSibling.textContent.trim();
    if (text && text.length < 50) { // Reasonable label length
      return text;
    }
  }
  
  return input.value || input.getAttribute('aria-label') || '';
}

// Helper function to extract row text from input group
function extractRowTextFromInputGroup(inputs) {
  if (inputs.length === 0) return '';
  
  const firstInput = inputs[0];
  
  // Look for common parent that might contain the row text
  let parent = firstInput.parentElement;
  while (parent) {
    const text = extractRowText(parent);
    if (text && text.length > 2) {
      return text;
    }
    parent = parent.parentElement;
    if (parent && parent.tagName === 'FIELDSET') break; // Don't go beyond fieldset
  }
  
  // Fallback to input name or group identifier
  return firstInput.name || 'Row';
}

// Enhanced function to fill matrix question based on AI responses
function fillMatrixQuestion(matrixData) {
  try {
    console.log(`fillMatrixQuestion: Filling matrix question with data:`, matrixData);
    
    if (!matrixData.answers || !Array.isArray(matrixData.answers)) {
      throw new Error('Matrix answers array is missing or invalid');
    }
    
    if (!matrixData.rows || !Array.isArray(matrixData.rows)) {
      throw new Error('Matrix rows array is missing or invalid');
    }
    
    if (!matrixData.columns || !Array.isArray(matrixData.columns)) {
      throw new Error('Matrix columns array is missing or invalid');
    }
    
    const results = [];
    let successCount = 0;
    
    console.log(`fillMatrixQuestion: Processing ${matrixData.answers.length} answers for matrix`);
    
    matrixData.answers.forEach((answer, index) => {
      console.log(`fillMatrixQuestion: Processing answer ${index + 1}: row="${answer.row}", value="${answer.value}"`);
      
      // Find the corresponding row data
      const rowData = matrixData.rows.find(row => 
        row.text.trim().toLowerCase() === answer.row.trim().toLowerCase()
      );
      
      if (!rowData) {
        console.log(`fillMatrixQuestion: No exact row match for "${answer.row}". Available rows:`, 
          matrixData.rows.map(r => r.text));
        
        // Try partial matching
        const partialMatch = matrixData.rows.find(row => 
          row.text.toLowerCase().includes(answer.row.toLowerCase()) ||
          answer.row.toLowerCase().includes(row.text.toLowerCase())
        );
        
        if (partialMatch) {
          console.log(`fillMatrixQuestion: Found partial match: "${partialMatch.text}"`);
          const result = processMatrixRow(partialMatch, answer, matrixData.columns);
          results.push(result);
          if (result.result.success) successCount++;
        } else {
          results.push({
            row: answer.row,
            answer: answer.value,
            result: { success: false, error: 'Row not found' }
          });
        }
        return;
      }
      
      const result = processMatrixRow(rowData, answer, matrixData.columns);
      results.push(result);
      if (result.result.success) successCount++;
    });
    
    console.log(`fillMatrixQuestion: Completed matrix filling. Success: ${successCount}/${results.length}`);
    
    return { 
      success: successCount > 0, 
      results: results,
      successCount: successCount,
      totalCount: results.length
    };
  } catch (error) {
    console.error('fillMatrixQuestion: Error filling matrix question:', error);
    return { success: false, error: error.message };
  }
}

// Helper function to process individual matrix row
function processMatrixRow(rowData, answer, columns) {
  try {
    console.log(`processMatrixRow: Processing row "${rowData.text}" with answer "${answer.value}"`);
    
    // Find the appropriate input for this answer with multiple strategies
    let targetInput = null;
    
    // Strategy 1: Exact column text match
    const columnIndex = columns.findIndex(col => 
      col.text.trim().toLowerCase() === answer.value.trim().toLowerCase()
    );
    
    if (columnIndex !== -1 && rowData.inputs[columnIndex]) {
      targetInput = rowData.inputs[columnIndex];
      console.log(`processMatrixRow: Found input by exact column match at index ${columnIndex}`);
    }
    
    // Strategy 2: Exact value match
    if (!targetInput) {
      targetInput = rowData.inputs.find(input => 
        input.value.trim().toLowerCase() === answer.value.trim().toLowerCase()
      );
      if (targetInput) {
        console.log(`processMatrixRow: Found input by exact value match`);
      }
    }
    
    // Strategy 3: Partial text matching
    if (!targetInput) {
      for (let i = 0; i < columns.length && i < rowData.inputs.length; i++) {
        const column = columns[i];
        if (column.text.toLowerCase().includes(answer.value.toLowerCase()) ||
            answer.value.toLowerCase().includes(column.text.toLowerCase())) {
          targetInput = rowData.inputs[i];
          console.log(`processMatrixRow: Found input by partial column match: "${column.text}"`);
          break;
        }
      }
    }
    
    // Strategy 4: Smart mapping for common survey responses
    if (!targetInput) {
      targetInput = findSmartMatrixMatch(answer.value, rowData.inputs, columns);
      if (targetInput) {
        console.log(`processMatrixRow: Found input by smart mapping`);
      }
    }
    
    // Strategy 5: Default to middle option if all else fails
    if (!targetInput && rowData.inputs.length > 0) {
      const middleIndex = Math.floor(rowData.inputs.length / 2);
      targetInput = rowData.inputs[middleIndex];
      console.log(`processMatrixRow: Using default middle option at index ${middleIndex}`);
    }
    
    if (targetInput) {
      const result = fillFormField(targetInput.selector, answer.value, targetInput.type);
      console.log(`processMatrixRow: Fill result for row "${rowData.text}":`, result);
      
      return {
        row: rowData.text,
        answer: answer.value,
        result: result,
        inputUsed: targetInput.selector
      };
    } else {
      console.log(`processMatrixRow: No suitable input found for row "${rowData.text}" with value "${answer.value}"`);
      return {
        row: rowData.text,
        answer: answer.value,
        result: { success: false, error: 'No suitable input found' }
      };
    }
    
  } catch (error) {
    console.error(`processMatrixRow: Error processing row "${rowData.text}":`, error);
    return {
      row: rowData.text,
      answer: answer.value,
      result: { success: false, error: error.message }
    };
  }
}

// Smart matching for common survey patterns
function findSmartMatrixMatch(answerValue, inputs, columns) {
  const normalizedAnswer = answerValue.toLowerCase().trim();
  
  // Common survey response mappings
  const responseMap = {
    // Satisfaction scales
    'very satisfied': ['5', 'strongly agree', 'excellent'],
    'satisfied': ['4', 'agree', 'good'],
    'neutral': ['3', 'neither', 'average', 'okay'],
    'dissatisfied': ['2', 'disagree', 'poor'],
    'very dissatisfied': ['1', 'strongly disagree', 'terrible'],
    
    // Importance scales
    'very important': ['5', 'extremely important', 'critical'],
    'important': ['4', 'somewhat important', 'significant'],
    'moderately important': ['3', 'neutral', 'average'],
    'slightly important': ['2', 'not very important', 'minor'],
    'not important': ['1', 'not at all important', 'irrelevant'],
    
    // Frequency scales
    'always': ['5', 'daily', 'very often'],
    'often': ['4', 'frequently', 'usually'],
    'sometimes': ['3', 'occasionally', 'neutral'],
    'rarely': ['2', 'seldom', 'hardly ever'],
    'never': ['1', 'not at all', 'none']
  };
  
  // Check if answer matches any mapping
  for (const [key, variations] of Object.entries(responseMap)) {
    if (normalizedAnswer === key || variations.some(v => normalizedAnswer.includes(v))) {
      // Find input that matches this response pattern
      for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i];
        const column = columns[i];
        
        if (column && (
          column.text.toLowerCase().includes(key) ||
          variations.some(v => column.text.toLowerCase().includes(v)) ||
          input.value === responseMap[key][0] // Check for numeric value
        )) {
          return input;
        }
      }
    }
  }
  
  return null;
}

// Helper function to find the correct input for a matrix answer
function findMatrixInput(rowData, answerValue, columns) {
  // First, try to find by exact column match
  const columnIndex = columns.findIndex(col => 
    col.text.toLowerCase().trim() === answerValue.toLowerCase().trim()
  );
  
  if (columnIndex !== -1 && rowData.inputs[columnIndex]) {
    return rowData.inputs[columnIndex];
  }
  
  // If no exact match, try to find by input value
  const inputByValue = rowData.inputs.find(input => 
    input.value.toLowerCase().trim() === answerValue.toLowerCase().trim()
  );
  
  if (inputByValue) {
    return inputByValue;
  }
  
  // If still no match, try partial matching
  const inputByPartialMatch = rowData.inputs.find(input => {
    const inputLabel = findLabelForInputBySelector(input.selector);
    return inputLabel && inputLabel.toLowerCase().includes(answerValue.toLowerCase());
  });
  
  return inputByPartialMatch || null;
}

// Helper function to find label for input by selector
function findLabelForInputBySelector(selector) {
  try {
    const element = document.querySelector(selector);
    if (element) {
      return findLabelForInput(element);
    }
  } catch (error) {
    console.error('findLabelForInputBySelector: Error finding element:', error);
  }
  return '';
}

// Listen for messages from popup/background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractData') {
    const pageData = extractPageData();
    sendResponse({ success: true, data: pageData });
  } else if (request.action === 'fillForm') {
    // Agent 2 form filling
    const results = [];
    
    request.formData.forEach(item => {
      let result;
      if (item.fieldType === 'matrix' && item.isMatrix) {
        // Handle matrix questions with the full matrix data
        result = fillMatrixQuestion({
          selector: item.selector,
          rows: item.rows,
          columns: item.columns,
          answers: item.answers
        });
      } else {
        result = fillFormField(item.selector, item.value, item.fieldType);
      }
      results.push({
        question: item.question,
        selector: item.selector,
        value: item.value,
        result: result
      });
    });
    
    sendResponse({ success: true, results: results });
  } else if (request.action === 'clickButton') {
    const result = clickButton(request.selector);
    sendResponse(result);
  }
  return true;
});

// Auto-extract data when page loads
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const pageData = extractPageData();
    chrome.runtime.sendMessage({
      action: 'pageDataExtracted',
      data: pageData,
      url: window.location.href
    });
  }, 1000);
});

// Also extract data when page is fully loaded
window.addEventListener('load', () => {
  setTimeout(() => {
    const pageData = extractPageData();
    chrome.runtime.sendMessage({
      action: 'pageDataExtracted',
      data: pageData,
      url: window.location.href
    });
  }, 1000)
});