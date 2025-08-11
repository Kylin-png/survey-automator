// Background script for handling API calls and communication for G.R.I.D.
// (Generate, Respond, Identify, Dominate)

// API configuration
const AWANN_API_URL = 'https://api.awanllm.com/v1/chat/completions';
const API_KEYS = [
  '09b6d472-da1b-4ed8-8c0f-e000e0b656a0',  
  '0f5b4749-2233-40ce-8814-5bcd1042c706',
  '317cc1fb-9329-447c-b663-c6753f5c9de2',
  'dccb673a-3f45-4683-8034-3db59dc3eecc',
  'dec11c73-e002-4c12-a477-789c979ba5ef',
  '3c2bb822-bc90-4e55-bee3-6b901ac7c58c',
  'e9900794-e95d-4f2f-8e58-1c1116ed553c',
  'bdf7b9bc-b349-4de6-a0ac-0251a90b9aae',
  'a967f28e-4b10-4de7-a0cd-f1c7596e349c',
  'f096ce57-67b4-40c4-a57d-77d310f50056',
  'fc1416c3-45f5-4b25-b7d2-f15a4677f6da',
  '39739035-7f22-4e4e-bd5b-28e500cb8134',
  '5ac00b36-4c72-4e30-b7ea-c191dbc4974f',
  'ce8f4eca-0e86-4baf-9c3d-d90e433a49f1',
  '0290da89-53cf-4858-83f5-46a046996233',
  '29bf646f-809c-4dee-886e-b0e705350ce4',
  '9cdb5cc8-1bdd-4745-bdff-c68c7fb931d7',
  '5de2158f-c5f0-4c40-a03d-f40a5d6b216b',
  '571e7509-b312-41eb-b974-1f9671299257',
  '87028781-389e-4a6a-8b94-3b6239db6b61',
  '59366919-02fc-479f-b4d3-93e56e4254c2',
  '4b32bceb-129e-4873-8685-2087741e929f',
  '3ed87590-16ab-4a2e-a260-8541a20337d7',
  'd02e29b5-3622-4227-bf6b-3cca074ae2aa',
  'ee431bcf-9cca-4d0a-9524-5459b6247ed6',
  'c5a6baf5-9dfb-493f-b37e-7763f54e8ad3',
  '1cb5e960-ddcc-468a-ae3c-9415265cd967',
  'f8e1412a-0bde-4158-a391-50d949484940',
  '5e9cd0b4-f46f-4105-a55d-5d28776272fa',
  '7181cc55-ef64-4f69-be03-9f2f327e6371',
  'cba21b38-deca-4b12-a88b-5e8bf554e42e',
  '4f5bc4e8-a041-43d3-99d1-8abecb0d9fce',
  '90ac5367-fd58-4e3d-a402-5395ec14b8eb',
  'c1a81aee-0547-48aa-a278-a1e3ecfc9829',
  'f03fa985-c2ff-40f1-a86b-cfcb90bd027a',
  '22842002-daf7-4d89-a533-e5195ee238de',
  'd4a3943c-f57a-470e-bda0-ae7cc221632e',
  'ab0b3736-3dd4-47d9-8599-f5ad091af709',
  '8b7ad6b9-aa79-4a58-a00d-0632bf5bf298',
  '266b26e6-cd3d-4840-b521-39c661ec4ec9',
  '54bb3b10-8f38-4f4c-ae8e-b5e3816e1913',
  'e3c3f1f2-3e5c-494c-8a90-f21371bf1d77',
  'b1c3d490-6ae3-4c88-8a8b-b0c8e2a2dae7',
  '4048eb55-8ba4-4646-a7ec-d0e584ad1b23',
  '4ba4d3cf-70e2-4e6e-a1c6-0eeb40041b68',
  'a2d31f70-04d9-4cb3-9100-596aefb0e545',
  'c64ec9c9-6e1c-43c3-a0ee-cf06a9e0a8e8',
  'ef9d0700-c011-46d5-846e-9ea47aa28b22',
  '4e3efab1-2155-46fd-9f06-546e682a80f5',
  '02dc8e25-b110-40fb-a8e2-3a483a0d1ad4',
  '891a2aab-0043-4c3a-9089-a78d13539f89',
  '91e73465-df10-4541-aee2-b7c186f0828e',
  '7ccfbdd9-c5dc-4631-93d3-43e6e7054611',
  '3490243c-e389-4613-9e78-70d39bd971e4',
  'c417a592-b9b3-483a-84e2-9acee4d28109',
  'c7354b75-32c0-405b-86e3-8d9ae2fd0a25',
  'd8cdcb15-38b3-4ff2-9c70-e985026f295b',
  '0c194522-7959-4568-a716-cc8f85d6c17f',
  '30f28074-e513-4834-8ec7-e1d5b932d72e',
  'd4bedf8d-5974-481b-8f66-ef69013bfa14',
  'a1944237-416d-4b13-9f68-a03e4cb19f95',
  '4b58d697-1822-435c-9aad-8c7b64fa2cca',
  '33e621ad-955f-4c7c-91dd-5cddbdf1ef3c',
  'b82ec120-a3ce-4692-9ad9-816e560fb6aa',
  '2503ea39-77a0-412e-a06f-0911caab5d8b',
  'a6b92912-820f-4493-80b2-3d707a4cc8a9',
  'ad9adb2c-d439-4471-9e08-475f7e80d0fa',
  'ce8d4c9f-5721-4ffa-84a0-a11e04f1ca8a',
  '5e397817-3054-4dc0-b15a-43e6b8a3da0b',
  '7bf10b01-abdb-4cf5-9007-c6dee8d322a9',
  '700367ee-82af-42e4-b4bd-4735929ff826',
  'd4ee9a12-1d8e-46f1-90f8-9231f039ff29',
  'f960927c-af33-4999-bca8-f8700b712d88',
  '137e9ddc-4e0d-4d43-ae5e-a76c623ff434',
  '8cfaf796-6b16-43e5-80ac-30d7143f6795',
  'fb23a5a1-a2e5-4f8c-8fe1-46a12c9ccaa3',
  '29b6ca8c-2a49-45b0-9d49-05fa236b2ff1',
  'ff7cd9de-0a45-4525-8ada-e32bd31acbea',
  'd09ea1c3-8d43-477d-8cce-37698fc86b82',
  '1ef0c287-294d-4f4b-bee3-a01b7beb03fb',
  'adea05bb-80ce-47de-8207-7eafb027edf8',
  'b985f622-62c0-4c77-a8f0-c9e98c6250a7',
  '3c0f020c-f541-4b3d-be2c-b5ad5ae3c4d1',
  '0a6fe3e7-dbe7-4117-96de-5db45f59a2b7',
  '77f243e2-a8cd-48fb-a759-1a40f0aef44d',
  '13ee3352-5bec-4b6f-be86-6be0b35d92c2',
  '18ba0748-69d4-44a3-95e3-bfa42f5bd009',
  '58f0daa7-c93a-44af-99ac-c397ef0c301d',
  'c7b09410-ed93-41bd-a129-a0a0621ee753',
  'ba8e8cf9-8e34-462c-89b8-ccc601c37a82',
  '6f8708b6-8464-477d-9b1b-d155c2859634',
  'b223e874-00fe-4fee-b7c5-b2b2933daa3e',
  '945b4321-1e05-4c6b-90c7-7ebc439002f0',
  '7a1d8c78-e348-4a84-b676-fb64730eec1c',
  '44d39888-088a-4d34-acff-9d6aabba57c2',
  'eda28eb1-cf90-478a-af9e-b698b0ba436a',
  'bc0d59fd-a374-4a5f-b9f1-80dbbd2fa8cf',
  'ca43c7a7-acae-49ae-89be-f7be5abe6360',
  '00fecf5d-597a-44af-941a-a5d9fe8ab0de',
  '63512f8e-ea2a-4e2a-b76b-8f3fa16ee82b',
  '9cc5f8ef-3350-4af2-8ee8-93d1319cd2f7',
  '87d974d4-874e-47be-b083-5e093dcb7814',
  'e3c93009-2b1a-4926-9c1f-312b71aafbe1',
  '5420b408-8d69-4484-a885-57b99808e3be',
  '67d92b4c-90a5-4bb7-98cf-b3ee1a609783',
  '63418dca-556a-4ca4-b5c0-9e8341941b5d',
  'c95bc5f0-f550-4134-8b8a-a39ca24d3367',
  'd58853e6-8f3b-4d28-9d46-011942be51c1',
  '6dedb681-232f-4372-b2c8-4e68785c1496',
  '32e3e879-d7e1-45e8-b44e-28f054efb223',
  '24d7b75f-0abb-41c7-83cb-bc5ecd2ac749',
  '73d438c3-480d-4397-8269-1e92429b731b',
  '9443580e-6610-4b80-9608-c40bc5580845',
  'bfa2c7b2-5569-4885-bb7e-ec52d69277ee',
  '853d812d-8512-4455-9a89-f417cb6e3ca2',
  '3555d883-ed0b-4462-98bb-2b84901be730',
  '5057693f-20c4-4e1b-8c8d-e332019ae672',
  'b809c480-1a31-4bab-a9f2-317abd124c51',
  '4e5fab04-b305-4e3d-b4b3-af6409b7ff9f',
  '14cc173e-7e46-40b9-8e04-b1454149c54d',
  '69a65366-5f7b-4669-a350-36d4003f3112',
  'de23f563-7aa7-431c-bf86-86b1856de440',
  '5156d4e0-f3ca-45fb-99d9-9c795df7296c',
  'f7b1e0bc-47ff-4814-a260-290a09ea2224',
  '37e36db8-7e11-44e2-b346-a23e75b86f3c',
  'd979aeb5-d076-44df-8235-54d4f5c6e066',
  '406e32d7-65d1-4d22-b274-7a2718528952',
  '2f8f38db-510b-44b8-9450-46d57f4c10a1',
  '451d6fa7-0fb6-4281-acc9-4842a46eed1b',
  '261c2189-5d85-48c6-8360-6ff7ecf8a5e5',
  '0e36f577-e041-4f86-aad5-8bf2b1b6196c',
  'd644d396-84b5-44da-8bc5-a41bb4bbb8c8',
  'eeefeb75-3a80-420d-a1c5-d9d327185eb6',
  '64f533ff-d2a9-4016-9bec-9582eba5663d',
  'ab102fed-1d7c-46c6-a2fc-0d6e5683836c',
  'de0b1412-0cc6-4967-bec3-45795ee7dac0',
  'fc88fe9a-2a61-43b3-8837-9f813906c491',
  '319816a6-de68-4be7-b0ca-8127eac5a1ac',
  '020a8183-1add-40f0-8d6a-01dd79acf392',
  '0cac702a-f944-44a7-8817-3b7b0884bf98',
  '96f7522a-da38-4872-b84d-ee5676d7c081',
  'f21917dc-d4a7-46b8-9925-1a76545ac452',
  'bc970b7a-3b3d-46f9-8efa-47af548aed58',
  '9cf6f635-fd58-4505-abda-2d8d29b89703',
  'e7864b6f-701a-4f38-aa9b-d77cbfa4e38e',
  '4ce43a18-62bd-4615-86f2-4a2fbf2b4f7f',
  'ed83eeef-41d7-4ea6-8fba-f64ce3be3701',
  '15d7c3db-f5f3-48ac-9166-8167a59f24eb',
  'd2e0100f-b99b-46af-a0ab-fc97eee6831f',
  '919713af-2412-4879-9d48-1e0287117d9e',
  '89435257-b52c-4eda-9be7-3a1224e13c0d',
  '7c055f71-b861-4323-9328-ff30224a43cf',
  'b0fdce48-32a3-42bd-93f1-bb5c91e43ef4',
  'e9f4ab1a-d90d-4221-b3e4-1b22d94ef1c0',
  'f8c8d0a3-f676-4e72-a732-ad5761d9d2bf',
  'e81dd7aa-6204-4507-8f3b-b2b245bf2782',
  '05c9a744-0ca4-4b7d-be45-5192f61a4b85',
  'e0496e1e-39c4-4a45-a255-4d413034fbdd',
  '523eb277-b8fd-44fa-b951-cd788f6faed4',
  '8d05703b-1669-432b-8401-aa1e56cf3f5d',
  'd03de176-a4d3-4a9c-a041-93ce931dad95',
  '96b1a380-9725-441d-be82-040c81778c67',
  '1362e1a5-e12a-40c7-91a6-fcb4cd85e99f',
  '31bc2280-e577-40e4-bf47-9d1db2c03b6e',
  '6b7f2a18-0f94-4fd6-9552-a89fd7cd58d8',
  '5943498b-8d6f-47b0-996f-362f4e66494a',
  '009b8720-3677-4267-bc26-2a7b9764a1dc',
  'a8865b4e-77a1-4ae8-ab9f-acbbbf3e2db7',
  '84fbb740-b2f5-4ebb-b28d-76d5bd260792',
  '23b521b7-d83c-4866-9d3b-b11d1a81dd36',
  '7c7648c3-ec17-4863-a524-d02b37831c4e',
  'e12763fb-3da0-4580-b1e2-b1a0d1e85e0a',
  '677f80eb-e8a3-4ac9-a30d-db3a3a02ed99',
  '9e270747-0dc2-424c-a2c8-d22c0b57172c',
  '60b409f4-4a3a-422a-8d63-a1bbb344367d',
  '74882d3d-3b02-434a-a24f-bbde2b6f5acf',
  '8ee8d5b9-71eb-4dbf-b949-280012928374',
  '82e4c868-0b0d-455a-9b52-c1b689b43dfc',
  '82d20491-be07-49a6-913d-8e3e1bfcb46c',
  '03957e74-5e18-4ffb-a52e-870186e0281b',
  'ebd7b759-418c-4308-aa5c-92ac6077fca3',
  'ace0929d-e3c1-47db-a05f-5c3e7c0bc655',
  '83cfc377-a47f-4628-89ac-1ca2fd49a032',
  '5274c3fc-a443-46ff-aa66-66eee54a7a2d',
  'f111bdff-6238-4e27-b9b3-4b9b8a518f54',
  '2b434f3b-9898-47a5-9eac-0e56a819539c',
  '41028f76-704c-4bbd-af09-3d96249a54e8',
  'a313022d-8f1e-4964-849b-42b538f7fcd5',
  'b2629f95-4151-4dfb-9f7b-f7d4ba52361c',
  '76b943e5-3677-4ca7-928f-912a9b271bc7',
  'b4af15f8-7ca4-4609-9e9b-71d20ca374aa',
  'a60ed618-aac6-4b46-9916-d433cb30230f',
  '616f06f9-6281-4874-85b3-8a28c15427b6',
  '063d7bea-69a0-4d2d-879f-d6ab33d9d05c',
  'd3a4962d-8727-4c05-9883-5ce77d28aa74',
  '9104edf2-d36b-423d-886e-629c4d692568',
  '447e8f21-a3b8-4eb8-8826-31b3402a728a',
  '90324d47-960e-41cf-88e9-75566a74eadc',
  // Add more keys as needed for rotation
];

let currentKeyIndex = 0;
let currentRetryCount = 0;
const MAX_RETRY_ATTEMPTS = 5; // Maximum number of retry attempts
const INITIAL_RETRY_DELAY = 1000; // Initial retry delay in milliseconds

// Get the next API key and log the switch
function getNextApiKey() {
  const previousKey = currentKeyIndex;
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  
  // Log API key switch
  chrome.runtime.sendMessage({ 
    action: "logApiCall", 
    message: `API Key Switch: Rotating from key index ${previousKey} to ${currentKeyIndex}`
  });
  
  return API_KEYS[currentKeyIndex];
}

// Retry wrapper for API calls with exponential backoff
async function retryApiCall(apiCallFunction, agentName, ...args) {
  let retryCount = 0;
  let lastError = null;
  
  while (retryCount < MAX_RETRY_ATTEMPTS) {
    try {
      // If this is a retry attempt, log it
      if (retryCount > 0) {
        chrome.runtime.sendMessage({ 
          action: "logApiCall", 
          message: `${agentName}: Retry attempt ${retryCount}/${MAX_RETRY_ATTEMPTS} with new API key`
        });
      }
      
      // Call the API function with the provided arguments
      return await apiCallFunction(...args);
    } catch (error) {
      lastError = error;
      
      // Check if error is rate limiting (429) or quota exceeded
      const isRateLimitError = 
        error.message.includes('429') || 
        error.message.includes('rate limit') || 
        error.message.includes('quota exceeded') ||
        error.message.includes('too many requests');
      
      if (isRateLimitError) {
        // Log rate limit error
        chrome.runtime.sendMessage({ 
          action: "logApiCall", 
          message: `${agentName}: Rate limit exceeded. Switching API key and retrying.`
        });
        
        // Get a new API key for the next attempt
        getNextApiKey();
        retryCount++;
        
        // No need for delay on rate limit errors, just switch keys and retry immediately
      } else {
        // For other errors, use exponential backoff
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
        
        chrome.runtime.sendMessage({ 
          action: "logApiCall", 
          message: `${agentName}: API error: ${error.message}. Retrying in ${delay}ms...`
        });
        
        retryCount++;
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // If we've exhausted all retry attempts, throw the last error
  chrome.runtime.sendMessage({ 
    action: "logApiCall", 
    message: `${agentName}: All retry attempts failed. Last error: ${lastError.message}`
  });
  
  throw new Error(`${agentName}: Maximum retry attempts reached. Last error: ${lastError.message}`);
}

// Function to calculate age dynamically
function calculateAge(birthDate) {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

// Kylin Spears's actual birthdate
const KYLIN_BIRTH_DATE = '2000-06-28';
const KYLIN_AGE = calculateAge(KYLIN_BIRTH_DATE);
const CURRENT_DATE = new Date().toISOString().slice(0, 10);

// Enhanced system prompt for Agent 1 - improved question detection and matrix handling
const SYSTEM_PROMPT = `YOU MUST RESPOND WITH ONLY VALID JSON. NO OTHER TEXT WHATSOEVER.

TASK OVERVIEW:
You are an advanced survey analysis AI that must identify ALL questions on a webpage and map them to their corresponding input fields with 100% accuracy. You will receive comprehensive webpage data and must create a complete question-to-input mapping.

ENHANCED QUESTION DETECTION RULES:
1. IDENTIFY ALL QUESTION TYPES:
   - Direct questions (ending with ?)
   - Implicit questions (e.g., "Your name", "Date of birth", "Please select")
   - Instructions that require input (e.g., "Rate the following", "Choose all that apply")
   - Label text that indicates required information
   - Contextual prompts near input fields

2. ADVANCED PATTERN RECOGNITION:
   - Look for question keywords: how, what, when, where, why, which, do you, are you, have you, would you, please, rate, select, choose, indicate, provide, enter
   - Identify form sections and group related inputs
   - Recognize survey patterns and rating scales
   - Detect multi-part questions and sub-questions

MATRIX QUESTION HANDLING - CRITICAL RULES:
- Matrix questions have selectors starting with "matrix_" AND explicitly mention "Matrix Question" with multiple rows
- TRUE matrix indicators: "Matrix Question: [main question] with X rows and Y columns"
- NEVER use matrix selectors for individual radio/checkbox groups, even if they seem related
- Individual questions with names like "satisfaction_1", "satisfaction_2" are SEPARATE questions, NOT matrix
- Matrix questions require identical response options across multiple sub-items

MAPPING PRECISION REQUIREMENTS:
- Match question text EXACTLY as it appears on the page
- Use the EXACT selector provided in the input field data
- Include ALL available options for radio/checkbox/select fields
- Group related inputs only when they share the same name attribute
- Preserve the original question phrasing and context

QUALITY ASSURANCE:
- Every visible question must be mapped to an input field
- No input field should be left without a corresponding question
- Questions near input fields take priority over distant text
- Form labels and legends are primary question sources

REQUIRED FORMAT:
[{"question":"exact question text from page","input_field_selector":"exact selector from input data","options":["option1","option2"]}]

EXAMPLE RESPONSES:
[{"question":"What is your gender?","input_field_selector":"input[type=\"radio\"][name=\"gender\"]","options":["Male","Female","Other"]}]
[{"question":"Please rate your satisfaction","input_field_selector":"matrix_0","options":[]}]

ABSOLUTELY FORBIDDEN:
- Any text outside the JSON array
- Explanations, comments, or descriptions
- Modified or interpreted question text
- Incorrect selector usage
- Missing or incomplete mappings

RESPOND WITH ONLY THE COMPLETE JSON ARRAY.`;
// Enhanced Agent 2 System Prompt with Kylin Spears persona and new question types
const AGENT2_SYSTEM_PROMPT_BASE = `You are Kylin Spears, a ${KYLIN_AGE}-year-old African American male from District Heights, Prince George\\\"s County, Maryland (Zip 20747). You work at McDonald\\\"s making approximately $49,999/year, own an Acura sedan, own a home, have no college degree, and have one 16-year-old child.\n\nPERSONALITY PROFILE:\n- Name: Kylin Spears\n-- Age: ${KYLIN_AGE} (calculated dynamically based on current date: ${CURRENT_DATE})\n- Gender: Male (Straight)\n- Ethnicity: African American\n- Location: District Heights, Prince George\\\"s County, Maryland (Zip 20747)\n- Employment: McDonald\\\"s employee\n- Income: ~$49,999/year\n- Education: No college degree (high school graduate)\n- Family: 1 child (age 16)\n- Vehicle: Acura sedan\n- Housing: Homeowner\n\nCRITICAL INSTRUCTIONS:\n1. Answer the single question provided as Kylin Spears would naturally answer it.\n2. Provide your answer in curly brackets: {answer}\n3. For questions with multiple choices (e.g., checkboxes), provide ALL applicable answers separated by commas within a single set of curly brackets: {answer1, answer2, answer3}\n4. Use EXACT option text as provided when selecting from multiple choice.\n5. Answer naturally as a typical ${KYLIN_AGE}-year-old male would.\n6. Stay fully in character at all times.\n7. For text fields, provide realistic information consistent with Kylin\\\"s profile.\n8. NO explanations, just the answer in curly brackets.\n\nSPECIFIC ANSWER GUIDELINES:\n- Full Name: "Kylin Spears"\n- Email: "kylin.spears@gmail.com"\n- Phone Number: "(951) 570-5086" \n- Date of Birth: "${KYLIN_BIRTH_DATE}"\n- Gender: "Male"\n- City: "District Heights"\n- State: "MD" (Maryland)"\n- Housing Situation: "Own a house"\n- Household Size: "2" (Kylin + 1 child = 2 total people in household)"\n- Employment Status: "Employed full time"\n- Job Title: "Crew Member" or "Shift Manager"\n- Work Hours: "40"\n- Highest Education: "High school graduate or equivalent"\n- Annual Household Income: "$25,000 - $49,999"\n- Activities: "Sports, Watching movies, Gaming" (select multiple if applicable)"\n- Exercise Frequency: "3" (times per week)"\n- Overall Health Rating: "4" (Very Good)"\n- Job Satisfaction: "3" (Neutral/Satisfied)"\n- Vehicle Type: "Sedan"\n- Vehicle Year: "2015" (realistic for an Acura sedan owned by a ${KYLIN_AGE}-year-old)"\n- Technology Importance: "7" (Important)"\n- Has Children: "Yes"\n- Number of Children: "1"\n- Comments: "No comments at this time."
\nEXAMPLES:\nQuestion: "What is your gender?" Options: [Male, Female, Other]\nAnswer: {Male}\n\nQuestion: "What year were you born?"\nAnswer: {2000}\n
Kylin spears is the head of household and is responsible for 100% of everything and makes 100% of all decisions.
When a question ask which of these would you not / never purpose you put I would purchase all or none meaning there is none you wouldnt consider purchasing but if it ask which you would consider purchasing select all of them.
Some questions may have the specific answer for questions different than others, for example some might say "$25,000 - $49,999" while others might say "$40,000 - $59,999" you know you make $49,999 a year though so make sure you pick the option that fits best thats SPECIFICALLY LISTED IN OPTIONS IT MUST BE LISTED IN THE OPTIONS EXACTLY. Do not say anything extra like "49,999 is not available so I'll click the closest one" DO NOT SAY ANYTHING LIKE THAT ONLY PUT THE OPTION IN THE CURLY BRACKETS THATS **IT** NO EXTRA TEXT AT ALL WHATS SO EVER. NO EXPLANATION. NO REASONING. NO THOUGHT PROCESS. AND NO COMMENTARY AT ALL. JUST PICK THE ONE THAT FITS BEST
Question: "Which activities do you enjoy?" Options: [Reading, Sports, Watching movies, Listening to music, Traveling, Cooking]\nAnswer: {Sports, Watching movies, Gaming}\n\nRemember: ONLY provide answers in {curly brackets}, nothing else. Answer as Kylin Spears would.`;

// Core API call function for Agent 1
async function _callAwannLLM(pageData) {
  const apiKey = API_KEYS[currentKeyIndex];
  
  // Filter and prepare the data more carefully to avoid sending code snippets
  const validQuestions = pageData.textContent.filter(item => {
    const text = item.text.trim();

    // Basic length guard – skip extremely short/long strings.
    if (text.length < 3 || text.length > 300) return false;

    // Skip obvious code-like content.
    const codeIndicators = [
      'function', 'var ', 'const ', 'let ', 'document.', 'window.',
      'console.', 'Error', 'undefined', 'null', '=>', '();', '{', '}', '<script'
    ];
    return !codeIndicators.some(kw => text.includes(kw));
  });

  // Prepare the data for the LLM with better selector generation
  const prompt = `QUESTIONS:\n${validQuestions.map(item => `"${item.text}"`).join('\n')}\n\nINPUT FIELDS:\n${pageData.inputFields.map(field => {
    // Handle matrix questions differently
    if (field.type === 'matrix') {
      return `"matrix_${field.id}" - Matrix Question: "${field.mainQuestion}" with ${field.rows.length} rows and ${field.columns.length} columns`;
    }
    
    // Generate more complete selector - FIX TEXTAREA ISSUE
    let selector;
    
    if (field.type === 'textarea') {
      // Handle textarea properly
      selector = 'textarea';
      if (field.name) selector += `[name="${field.name}"]`;
    } else if (field.type === 'select-one') {
      selector = 'select';
      if (field.name) selector += `[name="${field.name}"]`;
    } else {
      selector = 'input';
      if (field.type && field.type !== 'select-one') selector += `[type="${field.type}"]`;
      if (field.name) selector += `[name="${field.name}"]`;
      if (field.value && (field.type === 'radio' || field.type === 'checkbox')) {
        selector += `[value="${field.value}"]`;
      }
    }
    
    let fieldInfo = `"${selector}"`;
    
    // Add options information for radio, checkbox, and select fields
    if (field.options && field.options.length > 0) {
      const optionTexts = field.options.map(opt => opt.text || opt.value).join(', ');
      fieldInfo += ` - Options: [${optionTexts}]`;
    }
    
    return fieldInfo;
  }).join('\n')}`;

  const requestBody = {
    model: "Meta-Llama-3.1-8B-Instruct",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt }
    ],
    temperature: 0.05, // Lower temperature for more consistent JSON output
    max_tokens: 1024,
    top_p: 0.8,
    stop: ["Let me know", "Here is", "The provided", "\n\nNote:", "\n\nExplanation:", "```"]
  };

  chrome.runtime.sendMessage({ action: "logApiCall", message: "Agent 1: Sending request to Awan LLM API..." });
  chrome.runtime.sendMessage({ action: "logApiCall", message: `Agent 1: SYSTEM PROMPT:\n${SYSTEM_PROMPT}` });
  chrome.runtime.sendMessage({ action: "logApiCall", message: `Agent 1: USER PROMPT:\n${prompt}` });
  const startTime = performance.now();

  const response = await fetch(AWANN_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(requestBody)
  });

  const endTime = performance.now();
  const duration = (endTime - startTime).toFixed(2);

  if (!response.ok) {
    const errorText = await response.text();
    chrome.runtime.sendMessage({ action: "logApiCall", message: `Agent 1: API request failed (${response.status} ${response.statusText}) in ${duration}ms. Response: ${errorText}` });
    
    // Check for rate limiting errors and throw specific error
    if (response.status === 429 || errorText.includes('rate limit') || errorText.includes('quota exceeded')) {
      throw new Error(`Rate limit exceeded: ${response.status} ${response.statusText}`);
    }
    
    throw new Error(`API request failed: ${response.status} ${response.statusText}. Details: ${errorText}`);
  }

  const data = await response.json();
  const aiResponse = data.choices[0].message.content;
  chrome.runtime.sendMessage({ action: "logApiCall", message: `Agent 1: Received response from Awan LLM API in ${duration}ms. Raw AI Response:\n${aiResponse}` });
  
  // Enhanced JSON parsing with multiple strategies
  const parseResult = parseJSONResponse(aiResponse);
  
  if (parseResult.success) {
    chrome.runtime.sendMessage({ action: "logApiCall", message: `Agent 1: Successfully parsed AI response.` });
    return { success: true, matches: parseResult.data };
  } else {
    console.error('Failed to parse AI response:', aiResponse);
    console.error('Parse error:', parseResult.error);
    chrome.runtime.sendMessage({ action: "logApiCall", message: `Agent 1: Failed to parse AI response. Error: ${parseResult.error}` });
    throw new Error(`Failed to parse AI response: ${parseResult.error}`);
  }
}

// Retry wrapper for Agent 1
async function callAwannLLM(pageData) {
  try {
    return await retryApiCall(_callAwannLLM, "Agent 1", pageData);
  } catch (error) {
    console.error('Agent 1 API call failed after retries:', error);
    return { success: false, error: error.message };
  }
}

function parseJSONResponse(response) {
  try {
    let cleanResponse = response.trim();
    
    // Strategy 1: Try direct JSON parsing
    try {
      const parsed = JSON.parse(cleanResponse);
      if (Array.isArray(parsed)) {
        return { success: true, data: validateMatches(parsed) };
      }
    } catch (e) {
      // Continue to next strategy
    }
    
    // Strategy 2: Extract JSON from mixed content
    const jsonStart = cleanResponse.indexOf('[');
    const jsonEnd = cleanResponse.lastIndexOf(']');
    
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      const extractedJSON = cleanResponse.substring(jsonStart, jsonEnd + 1);
      try {
        const parsed = JSON.parse(extractedJSON);
        if (Array.isArray(parsed)) {
          return { success: true, data: validateMatches(parsed) };
        }
      } catch (e) {
        // Continue to next strategy
      }
    }
    
    // Strategy 3: Try to fix common JSON issues
    let fixedResponse = cleanResponse
      .replace(/^[^[]*/, '') // Remove everything before first [
      .replace(/[^]]*$/, '') // Remove everything after last ]
      .replace(/,\s*\]/, ']') // Fix trailing commas
      .replace(/,\s*\}/, '}') // Fix trailing commas in objects
      .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // Quote unquoted keys
      .replace(/:\s*([^",\[\]{}]+)([,}])/g, ':\"$1\"$2'); // Quote unquoted string values
    
    if (fixedResponse.startsWith('[') && fixedResponse.endsWith(']')) {
      try {
        const parsed = JSON.parse(fixedResponse);
        if (Array.isArray(parsed)) {
          return { success: true, data: validateMatches(parsed) };
        }
      } catch (e) {
        // Continue to next strategy
      }
    }
    
    // Strategy 4: Manual parsing for simple cases
    if (cleanResponse.includes('"question"') && cleanResponse.includes('"input_field_selector"')) {
      try {
        const manualParsed = manualJSONParse(cleanResponse);
        if (manualParsed.length > 0) {
          return { success: true, data: validateMatches(manualParsed) };
        }
      } catch (e) {
        // Continue to failure
      }
    }
    
    return { success: false, error: 'Could not parse JSON from response', response: cleanResponse };
    
  } catch (error) {
    return { success: false, error: error.message, response: response };
  }
}

function manualJSONParse(text) {
  const matches = [];
  const questionRegex = /"question"\s*:\s*"([^"]+)"/g;
  const selectorRegex = /"input_field_selector"\s*:\s*"([^"]+)"/g;
  const optionsRegex = /"options"\s*:\s*\[([^\]]+)\]/g;
  
  let questionMatch, selectorMatch, optionsMatch;
  const questions = [];
  const selectors = [];
  const options = [];
  
  while ((questionMatch = questionRegex.exec(text)) !== null) {
    questions.push(questionMatch[1]);
  }
  
  while ((selectorMatch = selectorRegex.exec(text)) !== null) {
    selectors.push(selectorMatch[1]);
  }
  
  while ((optionsMatch = optionsRegex.exec(text)) !== null) {
    const optionList = optionsMatch[1].split(',').map(opt => opt.trim().replace(/"/g, ''));
    options.push(optionList);
  }
  
  for (let i = 0; i < Math.min(questions.length, selectors.length); i++) {
    const match = {
      question: questions[i],
      input_field_selector: selectors[i]
    };
    
    if (i < options.length && options[i].length > 0) {
      match.options = options[i];
    }
    
    matches.push(match);
  }
  
  return matches;
}

function validateMatches(matches) {
  if (!Array.isArray(matches)) {
    return [];
  }
  
  return matches.filter(match => 
    match && 
    typeof match.question === 'string' && 
    typeof match.input_field_selector === 'string' &&
    match.question.trim() !== '' &&
    match.input_field_selector.trim() !== '' &&
    match.question.length < 500 && // Reasonable question length
    !match.question.includes('function') && // Filter out code
    !match.question.includes('var ') &&
    !match.question.includes('const ') &&
    !match.question.includes('document.') &&
    !match.question.includes('window.') &&
    !match.question.includes('console.') &&
    !match.question.includes('Error')
  );
}

// Core API call function for Agent 2
async function _callAgent2LLM(matchedData) {
  const apiKey = API_KEYS[currentKeyIndex];
  const allAnswers = [];

  for (const match of matchedData) {
    // Handle matrix questions differently
    if (match.input_field_selector && match.input_field_selector.startsWith('matrix_')) {
      const matrixAnswers = await processMatrixQuestion(match, apiKey);
      allAnswers.push(matrixAnswers);
      continue;
    }
    
    let questionText = `Question: "${match.question}"`;
    if (match.options && match.options.length > 0) {
      questionText += ` Options: [${match.options.join(', ')}]`;
    }

    const prompt = `Please answer the following question as Kylin Spears. Provide your answer in curly brackets {answer}.\n\n${questionText}\n\nAnswer as Kylin Spears:`;

    const requestBody = {
      model: "Meta-Llama-3.1-8B-Instruct",
      messages: [
        { role: "system", content: AGENT2_SYSTEM_PROMPT_BASE },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 1024,
      top_p: 0.9
    };

    chrome.runtime.sendMessage({ action: "logApiCall", message: "Agent 2: Sending request to Awan LLM API for single question..." });
    chrome.runtime.sendMessage({ action: "logApiCall", message: `Agent 2: SYSTEM PROMPT:\n${AGENT2_SYSTEM_PROMPT_BASE}` });
    chrome.runtime.sendMessage({ action: "logApiCall", message: `Agent 2: USER PROMPT:\n${prompt}` });
    const startTime = performance.now();

    const response = await fetch(AWANN_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    const endTime = performance.now();
    const duration = (endTime - startTime).toFixed(2);

    if (!response.ok) {
      const errorText = await response.text();
      chrome.runtime.sendMessage({ action: "logApiCall", message: `Agent 2: API request failed (${response.status} ${response.statusText}) in ${duration}ms. Response: ${errorText}` });
      
      // Check for rate limiting errors and throw specific error
      if (response.status === 429 || errorText.includes('rate limit') || errorText.includes('quota exceeded')) {
        throw new Error(`Rate limit exceeded: ${response.status} ${response.statusText}`);
      }
      
      throw new Error(`API request failed: ${response.status} ${response.statusText}. Details: ${errorText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    chrome.runtime.sendMessage({ action: "logApiCall", message: `Agent 2: Received response from Awan LLM API in ${duration}ms. Raw AI Response:\n${aiResponse}` });
    
    // Parse Agent 2 responses for a single question
    const answers = parseAgent2Response(aiResponse, [match]); // Pass only the current match
    if (answers.length > 0) {
      allAnswers.push(answers[0]); // Add the single answer
    }
  }
  
  return { success: true, answers: allAnswers };
}

// Function to process matrix questions by breaking them into individual questions
async function processMatrixQuestion(match, apiKey) {
  try {
    console.log('processMatrixQuestion: Processing matrix question:', match);
    
    // Extract matrix ID from selector
    const matrixId = match.input_field_selector.replace('matrix_', '');
    console.log('processMatrixQuestion: Matrix ID:', matrixId);
    
    // Get the matrix data from the stored page data (we'll need to access this)
    // For now, we'll create individual questions for each row
    const mainQuestion = match.question;
    console.log('processMatrixQuestion: Main question:', mainQuestion);
    
    // We need to get the actual matrix data from the page
    // This is a simplified approach - in practice, we'd need to pass the full matrix data
    const individualAnswers = [];
    
    // Since we don't have direct access to the matrix structure here,
    // we'll return a placeholder that indicates this needs matrix processing
    const result = {
      question: mainQuestion,
      selector: match.input_field_selector,
      fieldType: 'matrix',
      originalAnswer: '',
      validatedAnswer: '',
      options: [],
      isMatrix: true,
      needsMatrixProcessing: true
    };
    
    console.log('processMatrixQuestion: Returning placeholder result:', result);
    return result;
    
  } catch (error) {
    console.error('processMatrixQuestion: Error processing matrix question:', error);
    return {
      question: match.question,
      selector: match.input_field_selector,
      fieldType: 'matrix',
      originalAnswer: '',
      validatedAnswer: '',
      options: [],
      error: error.message
    };
  }
}

// Retry wrapper for Agent 2
async function callAgent2LLM(matchedData) {
  try {
    return await retryApiCall(_callAgent2LLM, "Agent 2", matchedData);
  } catch (error) {
    console.error('Agent 2 API call failed after retries:', error);
    
    // Create empty answers for each question if we completely failed
    const emptyAnswers = matchedData.map(match => ({
      question: match.question,
      selector: match.input_field_selector,
      fieldType: getFieldTypeFromSelector(match.input_field_selector),
      originalAnswer: '',
      validatedAnswer: '',
      options: match.options || [],
      error: error.message
    }));
    
    return { success: false, error: error.message, answers: emptyAnswers };
  }
}

function parseAgent2Response(response, matchedData) {
  const answers = [];
  const lines = response.split('\n');
  
  // Extract answers in curly brackets
  const bracketRegex = /\{([^}]+)\}/g;
  const extractedAnswers = [];
  
  lines.forEach(line => {
    const matches = line.match(bracketRegex);
    if (matches) {
      matches.forEach(match => {
        const answer = match.replace(/[{}]/g, '').trim();
        if (answer) {
          extractedAnswers.push(answer);
        }
      });
    }
  });
  
  // Match answers to questions
  matchedData.forEach((match, index) => {
    if (index < extractedAnswers.length) {
      const answer = extractedAnswers[index];
      
      // Enhanced validation and mapping for Kylin Spears persona
      let validatedAnswer = validateAndMapAnswer(answer, match);
      
      answers.push({
        question: match.question,
        selector: match.input_field_selector,
        fieldType: getFieldTypeFromSelector(match.input_field_selector),
        originalAnswer: answer,
        validatedAnswer: validatedAnswer,
        options: match.options || []
      });
    }
  });
  
  return answers;
}

function validateAndMapAnswer(answer, match) {
  const questionLower = match.question.toLowerCase();
  const options = match.options || [];
  
  // If the answer contains commas, it's likely multiple selections for checkboxes
  if (answer.includes(",")) {
    const answersArray = answer.split(",").map(a => a.trim().toLowerCase());
    const validatedAnswers = [];
    answersArray.forEach(ans => {
      const exactMatch = options.find(opt => opt.toLowerCase() === ans);
      if (exactMatch) {
        validatedAnswers.push(exactMatch);
      } else {
        validatedAnswers.push(ans); // Keep original if no match found
      }
    });
    return validatedAnswers.join(", ");
  } else {
    // Single answer case
    const exactMatch = options.find(opt => opt.toLowerCase() === answer.toLowerCase());
    if (exactMatch) return exactMatch;
    
    // Return original answer if no mapping found
    return answer;
  }
}

function getFieldTypeFromSelector(selector) {
  if (selector.includes('type="radio"')) return 'radio';
  if (selector.includes('type="checkbox"')) return 'checkbox';
  if (selector.includes('type="text"')) return 'text';
  if (selector.includes('type="number"')) return 'number';
  if (selector.includes('type="email"')) return 'email';
  if (selector.includes('type="date"')) return 'date';
  if (selector.includes('type="range"')) return 'range';
  if (selector.includes('type="tel"')) return 'tel';
  if (selector.startsWith('select')) return 'select';
  if (selector.startsWith('textarea')) return 'textarea'; // Fixed textarea detection
  return 'text'; // default
}

// Agent 3 System Prompt for identifying the continue button
const AGENT3_SYSTEM_PROMPT = `You will be given a list of buttons from a webpage. Your task is to identify the single button that means "continue", "next", "proceed", "submit", or a similar forward action. Respond with ONLY the JSON for the chosen button. NO OTHER TEXT.

CRITICAL RULES:
- RESPOND WITH ONLY JSON - NO explanations, NO "here is", NO other text.
- Your response must be a single JSON object, not an array.
- Use the EXACT selector from the input data.

REQUIRED FORMAT:
{"selector":"exact selector for the continue button"}

EXAMPLE RESPONSE:
{"selector":"#submit-button"}

FORBIDDEN:
- Any text before or after the JSON object.
- Explanations about the code or webpage.
- Comments about the task.
- "Here is the JSON" or similar phrases.
- Any non-JSON content.

RESPOND WITH ONLY THE JSON OBJECT.`;

// Core API call function for Agent 3
async function _callAgent3LLM(buttonsData) {
  const apiKey = API_KEYS[currentKeyIndex];

  const prompt = `BUTTONS:\n${buttonsData.map(button => `"${button.text}" (Selector: ${button.selector})`).join("\n")}`;

  const requestBody = {
    model: "Meta-Llama-3.1-8B-Instruct",
    messages: [
      { role: "system", content: AGENT3_SYSTEM_PROMPT },
      { role: "user", content: prompt }
    ],
    temperature: 0.05, // Very low temperature for precise selection
    max_tokens: 100, // Expect a very short JSON response
    top_p: 0.8,
    stop: ["Let me know", "Here is", "The provided", "\n\nNote:", "\n\nExplanation:", "```"]
  };

  chrome.runtime.sendMessage({ action: "logApiCall", message: "Agent 3: Sending request to Awan LLM API for button analysis..." });
  chrome.runtime.sendMessage({ action: "logApiCall", message: `Agent 3: SYSTEM PROMPT:\n${AGENT3_SYSTEM_PROMPT}` });
  chrome.runtime.sendMessage({ action: "logApiCall", message: `Agent 3: USER PROMPT:\n${prompt}` });
  const startTime = performance.now();

  const response = await fetch(AWANN_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify(requestBody)
  });

  const endTime = performance.now();
  const duration = (endTime - startTime).toFixed(2);

  if (!response.ok) {
    const errorText = await response.text();
    chrome.runtime.sendMessage({ action: "logApiCall", message: `Agent 3: API request failed (${response.status} ${response.statusText}) in ${duration}ms. Response: ${errorText}` });
    
    // Check for rate limiting errors and throw specific error
    if (response.status === 429 || errorText.includes('rate limit') || errorText.includes('quota exceeded')) {
      throw new Error(`Rate limit exceeded: ${response.status} ${response.statusText}`);
    }
    
    throw new Error(`API request failed: ${response.status} ${response.statusText}. Details: ${errorText}`);
  }

  const data = await response.json();
  const aiResponse = data.choices[0].message.content;
  chrome.runtime.sendMessage({ action: "logApiCall", message: `Agent 3: Received response from Awan LLM API in ${duration}ms. Raw AI Response:\n${aiResponse}` });

  // Agent 3 expects a single JSON object: {"selector":"..."}
  try {
    const parsedResponse = JSON.parse(aiResponse);
    if (parsedResponse && typeof parsedResponse.selector === "string") {
      chrome.runtime.sendMessage({ action: "logApiCall", message: `Agent 3: Successfully parsed AI response. Selected selector: ${parsedResponse.selector}` });
      return { success: true, selector: parsedResponse.selector };
    } else {
      throw new Error("Invalid JSON response format from Agent 3");
    }
  } catch (parseError) {
    console.error("Agent 3: Failed to parse AI response:", aiResponse, parseError);
    chrome.runtime.sendMessage({ action: "logApiCall", message: `Agent 3: Failed to parse AI response. Error: ${parseError.message}` });
    throw new Error(`Failed to parse AI response: ${parseError.message}`);
  }
}

// Retry wrapper for Agent 3
async function callAgent3LLM(buttonsData) {
  try {
    return await retryApiCall(_callAgent3LLM, "Agent 3", buttonsData);
  } catch (error) {
    console.error('Agent 3 API call failed after retries:', error);
    return { success: false, error: error.message };
  }
}

// Listen for messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'pageDataExtracted') {
    // Store the extracted data
    chrome.storage.local.set({
      [`pageData_${sender.tab.id}`]: {
        data: request.data,
        url: request.url,
        timestamp: Date.now()
      }
    });
  } else if (request.action === 'analyzeWithAI') {
    // Agent 1 - Call the AI to analyze the data
    callAwannLLM(request.data).then(result => {
      sendResponse(result);
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true; // Keep the message channel open for async response
  } else if (request.action === 'runAgent2') {
    // Agent 2 - Generate answers using Kylin Spears persona and fill form
    callAgent2LLM(request.matchedData).then(async result => {
    // Handle matrix questions that need special processing
    if (result.success && result.answers) {
      console.log('Agent 2 message listener: Processing answers for matrix questions');
      const processedAnswers = [];
      
      for (const answer of result.answers) {
        console.log('Agent 2 message listener: Processing answer:', answer);
        if (answer.needsMatrixProcessing) {
          console.log('Agent 2 message listener: Answer needs matrix processing, calling processMatrixQuestionWithData');
          // Process matrix question by getting the actual matrix data
          const matrixData = await processMatrixQuestionWithData(answer, request.pageData);
          console.log('Agent 2 message listener: Matrix processing result:', matrixData);
          processedAnswers.push(matrixData);
        } else {
          processedAnswers.push(answer);
        }
      }
      
      result.answers = processedAnswers;
      console.log('Agent 2 message listener: Final processed answers:', result.answers);
    }
      
      sendResponse(result);
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true;
  } else if (request.action === 'getPageData') {
    // Get stored page data
    chrome.storage.local.get([`pageData_${request.tabId}`]).then(result => {
      const pageData = result[`pageData_${request.tabId}`];
      sendResponse({ success: true, data: pageData });
    });
    return true;
  } else if (request.action === 'runAgent3') {
    // Agent 3 - Identify and click continue button
    callAgent3LLM(request.buttonsData).then(result => {
      sendResponse(result);
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true;
  }
});

// Enhanced function to process matrix questions with complete row handling
async function processMatrixQuestionWithData(answer, pageData) {
  try {
    console.log('processMatrixQuestionWithData: Processing matrix answer:', answer);
    console.log('processMatrixQuestionWithData: PageData inputFields:', pageData?.inputFields?.length);
    
    // Find the matrix data from pageData
    const matrixId = answer.selector.replace('matrix_', '');
    console.log('processMatrixQuestionWithData: Looking for matrix ID:', matrixId);
    
    const matrixField = pageData?.inputFields?.find(field => 
      field.type === 'matrix' && field.id === matrixId
    );
    
    console.log('processMatrixQuestionWithData: Found matrix field:', matrixField);
    
    if (!matrixField) {
      console.error('processMatrixQuestionWithData: Matrix field not found. Available fields:', 
        pageData?.inputFields?.map(f => ({ id: f.id, type: f.type })));
      throw new Error(`Matrix field with ID ${matrixId} not found`);
    }
    
    if (!matrixField.rows || !Array.isArray(matrixField.rows)) {
      console.error('processMatrixQuestionWithData: Matrix field rows is invalid:', matrixField.rows);
      throw new Error(`Matrix field rows is undefined or not an array`);
    }
    
    if (!matrixField.columns || !Array.isArray(matrixField.columns)) {
      console.error('processMatrixQuestionWithData: Matrix field columns is invalid:', matrixField.columns);
      throw new Error(`Matrix field columns is undefined or not an array`);
    }
    
    // Process ALL rows as individual questions (this was the key missing piece)
    const rowAnswers = [];
    console.log(`processMatrixQuestionWithData: Processing ${matrixField.rows.length} rows`);
    
    // Process rows in batches to avoid rate limiting
    const batchSize = 3;
    for (let i = 0; i < matrixField.rows.length; i += batchSize) {
      const batch = matrixField.rows.slice(i, i + batchSize);
      const batchPromises = batch.map(async (row, batchIndex) => {
        const rowIndex = i + batchIndex;
        const individualQuestion = `${matrixField.mainQuestion} - ${row.text}`;
        const columnOptions = matrixField.columns.map(col => col.text);
        
        console.log(`processMatrixQuestionWithData: Processing row ${rowIndex + 1}: "${row.text}"`);
        
        // Create a more specific prompt for this row
        let questionText = `Answer as Kylin Spears. Question: "${individualQuestion}"`;
        if (columnOptions.length > 0) {
          questionText += ` Options: [${columnOptions.join(', ')}]`;
        }
        questionText += '\n\nProvide your answer in curly brackets {answer}:';
        
        // Call Agent 2 for this individual question with retry logic
        const requestBody = {
          model: "Meta-Llama-3.1-8B-Instruct",
          messages: [
            { role: "system", content: AGENT2_SYSTEM_PROMPT_BASE },
            { role: "user", content: questionText }
          ],
          temperature: 0.3,
          max_tokens: 150,
          top_p: 0.9
        };
        
        let attempts = 0;
        const maxAttempts = 3;
        
        while (attempts < maxAttempts) {
          try {
            const response = await fetch(AWANN_API_URL, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEYS[currentKeyIndex]}`
              },
              body: JSON.stringify(requestBody)
            });
            
            if (!response.ok) {
              if (response.status === 429) {
                // Rate limited, switch key and retry
                getNextApiKey();
                attempts++;
                await new Promise(resolve => setTimeout(resolve, 1000));
                continue;
              }
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            const aiResponse = data.choices[0].message.content.trim();
            
            // Parse the response to extract the answer
            const bracketRegex = /\{([^}]+)\}/;
            const match = aiResponse.match(bracketRegex);
            const extractedAnswer = match ? match[1].trim() : '';
            
            console.log(`processMatrixQuestionWithData: Row ${rowIndex + 1} answer: "${extractedAnswer}"`);
            
            return {
              row: row.text,
              value: extractedAnswer || columnOptions[0] || 'Neutral',
              rowIndex: rowIndex
            };
            
          } catch (error) {
            console.error(`Error processing matrix row "${row.text}" (attempt ${attempts + 1}):`, error);
            attempts++;
            
            if (attempts >= maxAttempts) {
              // Use a smart default based on Kylin's persona
              const defaultAnswer = getDefaultMatrixAnswer(individualQuestion, columnOptions);
              console.log(`processMatrixQuestionWithData: Using default answer for row ${rowIndex + 1}: "${defaultAnswer}"`);
              
              return {
                row: row.text,
                value: defaultAnswer,
                rowIndex: rowIndex
              };
            }
            
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 500 * attempts));
          }
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      rowAnswers.push(...batchResults);
      
      // Small delay between batches to avoid rate limiting
      if (i + batchSize < matrixField.rows.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Sort answers by rowIndex to maintain order
    rowAnswers.sort((a, b) => a.rowIndex - b.rowIndex);
    
    console.log(`processMatrixQuestionWithData: Completed processing ${rowAnswers.length} rows`);
    
    // Return the complete matrix answer structure
    return {
      question: matrixField.mainQuestion,
      selector: answer.selector,
      fieldType: 'matrix',
      originalAnswer: '',
      validatedAnswer: '',
      options: [],
      isMatrix: true,
      rows: matrixField.rows,
      columns: matrixField.columns,
      answers: rowAnswers.map(({ row, value }) => ({ row, value })) // Clean up for return
    };
    
  } catch (error) {
    console.error('processMatrixQuestionWithData: Error:', error);
    return {
      question: answer.question,
      selector: answer.selector,
      fieldType: 'matrix',
      originalAnswer: '',
      validatedAnswer: '',
      options: [],
      error: error.message
    };
  }
}

// Helper function to provide smart defaults for matrix questions
function getDefaultMatrixAnswer(question, options) {
  const questionLower = question.toLowerCase();
  
  // Satisfaction-related defaults
  if (questionLower.includes('satisfied') || questionLower.includes('satisfaction')) {
    return options.find(opt => opt.toLowerCase().includes('satisfied')) || 
           options.find(opt => opt.includes('4')) || 
           options[Math.floor(options.length * 0.7)] || options[0];
  }
  
  // Importance-related defaults
  if (questionLower.includes('important') || questionLower.includes('importance')) {
    return options.find(opt => opt.toLowerCase().includes('important')) || 
           options.find(opt => opt.includes('4')) || 
           options[Math.floor(options.length * 0.8)] || options[0];
  }
  
  // Frequency-related defaults
  if (questionLower.includes('often') || questionLower.includes('frequency')) {
    return options.find(opt => opt.toLowerCase().includes('sometimes')) || 
           options.find(opt => opt.includes('3')) || 
           options[Math.floor(options.length * 0.6)] || options[0];
  }
  
  // Agreement-related defaults
  if (questionLower.includes('agree') || questionLower.includes('agreement')) {
    return options.find(opt => opt.toLowerCase().includes('agree')) || 
           options.find(opt => opt.includes('4')) || 
           options[Math.floor(options.length * 0.7)] || options[0];
  }
  
  // Default to a middle-positive option
  return options[Math.floor(options.length * 0.6)] || options[0];
}

// Clean up old data periodically
setInterval(() => {
  chrome.storage.local.get(null).then(items => {
    const now = Date.now();
    const keysToRemove = [];
    
    for (const [key, value] of Object.entries(items)) {
      if (key.startsWith('pageData_') && value.timestamp && (now - value.timestamp) > 3600000) { // 1 hour
        keysToRemove.push(key);
      }
    }
    
    if (keysToRemove.length > 0) {
      chrome.storage.local.remove(keysToRemove);
    }
  });
}, 300000); // Run every 5 minutes
