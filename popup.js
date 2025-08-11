// Popup script for G.R.I.D. (Generate, Respond, Identify, Dominate)
// Handles the extension interface with automatic sequential execution

document.addEventListener("DOMContentLoaded", function() {
  const startBtn = document.getElementById("startBtn");
  const pauseResumeBtn = document.getElementById("pauseResumeBtn");
  const statusDiv = document.getElementById("status");
  const resultsDiv = document.getElementById("results");
  const statsDiv = document.getElementById("stats");
  const apiLogDiv = document.getElementById("apiLog");
  const cycleInfoDiv = document.getElementById("cycleInfo");
  const cycleCountSpan = document.getElementById("cycleCount");
  const currentAgentSpan = document.getElementById("currentAgent");

  let isRunning = false;
  let isPaused = false;
  let currentCycle = 0;
  let currentMatches = null;
  let cycleTimeout = null;
  let currentTab = null;
  let lastUrl = null;

  function updateStatus(message, type = "info") {
    let icon = "";
    switch(type) {
      case "success":
        icon = '<i class="fas fa-check-circle"></i> ';
        break;
      case "error":
        icon = '<i class="fas fa-exclamation-triangle"></i> ';
        break;
      case "running":
        icon = '<i class="fas fa-spinner"></i> ';
        break;
      default:
        icon = '<i class="fas fa-info-circle"></i> ';
    }
    
    statusDiv.innerHTML = icon + message;
    statusDiv.className = `status ${type}`;
  }

  function updateCycleInfo(agent = "None") {
    cycleCountSpan.textContent = currentCycle;
    currentAgentSpan.textContent = agent;
    cycleInfoDiv.style.display = isRunning ? "flex" : "none";
  }

  function appendApiLog(message) {
    const timestamp = new Date().toLocaleTimeString();
    apiLogDiv.textContent += `[${timestamp}] ${message}\n`;
    apiLogDiv.scrollTop = apiLogDiv.scrollHeight;
  }

  function clearApiLog() {
    apiLogDiv.textContent = "System initialized. Ready for operation.\n";
  }

  function showResults(matches, pageData, agent) {
    statsDiv.style.display = "block";
    statsDiv.innerHTML = `<i class="fas fa-chart-bar"></i> Agent ${agent} - Identified ${pageData.textContent.length} text elements and ${pageData.inputFields.length} input fields. Mapped ${matches.length} targets.`;
    
    resultsDiv.style.display = "block";
    resultsDiv.innerHTML = "";
    
    if (matches.length === 0) {
      resultsDiv.innerHTML = "<p>No targets identified for elimination.</p>";
      return;
    }
    
    matches.forEach((match, index) => {
      const matchDiv = document.createElement("div");
      matchDiv.className = "match-item";
      
      const questionDiv = document.createElement("div");
      questionDiv.className = "question";
      questionDiv.textContent = `${index + 1}. ${match.question}`;
      
      const selectorDiv = document.createElement("div");
      selectorDiv.className = "selector";
      selectorDiv.textContent = `→ ${match.input_field_selector}`;
      
      matchDiv.appendChild(questionDiv);
      matchDiv.appendChild(selectorDiv);
      
      if (match.options && match.options.length > 0) {
        const optionsDiv = document.createElement("div");
        optionsDiv.style.marginTop = "5px";
        optionsDiv.style.fontSize = "12px";
        optionsDiv.style.color = "var(--muted-text)";
        optionsDiv.innerHTML = `<strong>Options:</strong> ${match.options.join(", ")}`;
        matchDiv.appendChild(optionsDiv);
      }
      
      resultsDiv.appendChild(matchDiv);
    });
  }

  function showAgent2Results(answers, fillResults) {
    resultsDiv.style.display = "block";
    resultsDiv.innerHTML = "";
    
    const headerDiv = document.createElement("div");
    headerDiv.innerHTML = "<h3>Kylin Spears Persona Deployment</h3>";
    headerDiv.style.marginBottom = "15px";
    headerDiv.style.borderBottom = "2px solid var(--success)";
    headerDiv.style.paddingBottom = "10px";
    resultsDiv.appendChild(headerDiv);
    
    const personaDiv = document.createElement("div");
    personaDiv.className = "match-item";
    personaDiv.style.backgroundColor = "rgba(56, 239, 125, 0.1)";
    personaDiv.style.borderLeft = "4px solid var(--success)";
    personaDiv.innerHTML = `
      <strong>Persona: Kylin Spears</strong><br>
      <small>25-year-old African American male from District Heights, MD<br>
      McDonald's employee, $49,999/year, High school graduate, 1 child (16)</small>
    `;
    resultsDiv.appendChild(personaDiv);
    
    fillResults.forEach((result, index) => {
      const resultDiv = document.createElement("div");
      resultDiv.className = "match-item";
      
      const questionDiv = document.createElement("div");
      questionDiv.className = "question";
      questionDiv.textContent = `${index + 1}. ${result.question}`;
      
      const answerDiv = document.createElement("div");
      answerDiv.style.marginTop = "5px";
      answerDiv.style.fontSize = "14px";
      
      if (result.result.success) {
        answerDiv.style.color = "var(--success)";
        answerDiv.innerHTML = `✓ <strong>Response:</strong> ${result.value}`;
      } else {
        answerDiv.style.color = "var(--error)";
        answerDiv.innerHTML = `✗ <strong>Error:</strong> ${result.result.error}`;
      }
      
      const selectorDiv = document.createElement("div");
      selectorDiv.className = "selector";
      selectorDiv.textContent = `→ ${result.selector}`;
      
      resultDiv.appendChild(questionDiv);
      resultDiv.appendChild(answerDiv);
      resultDiv.appendChild(selectorDiv);
      resultsDiv.appendChild(resultDiv);
    });
  }

  async function runAgent1() {
    try {
      updateCycleInfo("Agent 1");
      updateStatus("Initializing target acquisition...", "running");
      
      const response = await chrome.tabs.sendMessage(currentTab.id, { action: "extractData" });
      
      if (!response.success) {
        throw new Error("Failed to extract page data");
      }
      
      updateStatus("Analyzing form structure with AI...", "running");
      
      const aiResponse = await chrome.runtime.sendMessage({
        action: "analyzeWithAI",
        data: response.data
      });
      
      if (!aiResponse.success) {
        throw new Error(aiResponse.error || "AI analysis failed");
      }
      
      currentMatches = aiResponse.matches;
      updateStatus(`Target acquisition complete. ${aiResponse.matches.length} form elements identified.`, "success");
      showResults(aiResponse.matches, response.data, 1);
      
      console.log("G.R.I.D. Agent 1 Analysis Results:", aiResponse.matches);
      return true;
      
    } catch (error) {
      console.error("G.R.I.D. Agent 1 error:", error);
      updateStatus(`Target acquisition failed: ${error.message}`, "error");
      return false;
    }
  }

  async function runAgent2() {
    if (!currentMatches || currentMatches.length === 0) {
      updateStatus("No targets available for Kylin Spears persona", "error");
      return false;
    }

    try {
      updateCycleInfo("Agent 2");
      updateStatus("Deploying Kylin Spears persona...", "running");
      
      // Get current page data to pass to Agent 2 for matrix processing
      const pageDataResponse = await chrome.tabs.sendMessage(currentTab.id, { action: "extractData" });
      if (!pageDataResponse.success) {
        throw new Error("Failed to extract current page data");
      }
      
      const agent2Response = await chrome.runtime.sendMessage({
        action: "runAgent2",
        matchedData: currentMatches,
        pageData: pageDataResponse.data  // Add pageData for matrix processing
      });
      
      if (!agent2Response.success) {
        throw new Error(agent2Response.error || "Persona deployment failed");
      }
      
      updateStatus("Executing form domination sequence...", "running");
      
      const formData = agent2Response.answers.map(answer => ({
        question: answer.question,
        selector: answer.selector,
        value: answer.validatedAnswer,
        fieldType: answer.fieldType,
        // Pass matrix-specific data if available
        ...(answer.isMatrix && {
          isMatrix: true,
          rows: answer.rows,
          columns: answer.columns,
          answers: answer.answers
        })
      }));
      
      const fillResponse = await chrome.tabs.sendMessage(currentTab.id, {
        action: "fillForm",
        formData: formData
      });
      
      if (!fillResponse.success) {
        throw new Error("Form domination sequence failed");
      }
      
      const successCount = fillResponse.results.filter(r => r.result.success).length;
      const totalCount = fillResponse.results.length;
      
      updateStatus(`Form domination ${successCount === totalCount ? "complete" : "partially complete"}: ${successCount}/${totalCount} fields conquered.`, 
                   successCount === totalCount ? "success" : "info");
      
      showAgent2Results(agent2Response.answers, fillResponse.results);
      
      console.log("G.R.I.D. Agent 2 Results:", {
        answers: agent2Response.answers,
        fillResults: fillResponse.results
      });
      
      return true;
      
    } catch (error) {
      console.error("G.R.I.D. Agent 2 error:", error);
      updateStatus(`Persona deployment error: ${error.message}`, "error");
      return false;
    }
  }

  async function runAgent3() {
    try {
      updateCycleInfo("Agent 3");
      updateStatus("Identifying submission pathway...", "running");

      const response = await chrome.tabs.sendMessage(currentTab.id, { action: "extractData" });
      if (!response.success || !response.data.buttons || response.data.buttons.length === 0) {
        throw new Error("No submission pathways detected.");
      }

      updateStatus("Analyzing submission options...", "running");
      const agent3Response = await chrome.runtime.sendMessage({
        action: "runAgent3",
        buttonsData: response.data.buttons
      });

      if (!agent3Response.success) {
        throw new Error(agent3Response.error || "Failed to identify submission pathway.");
      }

      const continueButtonSelector = agent3Response.selector;
      if (!continueButtonSelector) {
        throw new Error("No valid submission pathway identified.");
      }

      updateStatus(`Submission pathway identified. Executing final sequence...`, "running");
      const clickResponse = await chrome.tabs.sendMessage(currentTab.id, {
        action: "clickButton",
        selector: continueButtonSelector
      });

      if (clickResponse.success) {
        updateStatus(`Survey successfully dominated. Advancing to next target.`, "success");
        
        // Store current URL to detect changes
        lastUrl = currentTab.url;
        
        console.log("G.R.I.D. Agent 3 Results:", { selectedSelector: continueButtonSelector, clickResult: clickResponse });
        return true;
      } else {
        throw new Error(clickResponse.error || "Failed to execute final submission sequence.");
      }

    } catch (error) {
      console.error("G.R.I.D. Agent 3 error:", error);
      updateStatus(`Submission error: ${error.message}`, "error");
      return false;
    }
  }

  async function runSingleCycle() {
    if (!isRunning || isPaused) return;

    currentCycle++;
    updateCycleInfo("Initializing");
    
    console.log(`G.R.I.D.: Starting operational cycle ${currentCycle}`);
    
    // Run Agent 1
    const agent1Success = await runAgent1();
    if (!agent1Success || !isRunning || isPaused) return;
    
    // Small delay between agents
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (!isRunning || isPaused) return;
    
    // Run Agent 2
    const agent2Success = await runAgent2();
    if (!agent2Success || !isRunning || isPaused) return;
    
    // Small delay between agents
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (!isRunning || isPaused) return;
    
    // Run Agent 3
    const agent3Success = await runAgent3();
    if (!agent3Success || !isRunning || isPaused) return;
    
    // Cycle complete
    updateCycleInfo("Standby");
    updateStatus(`Cycle ${currentCycle} complete. Preparing for next target...`, "info");
    
    // Schedule next cycle
    scheduleNextCycle();
  }

  function scheduleNextCycle() {
    if (!isRunning || isPaused) return;
    
    // Wait 2 seconds, then check for URL change or start next cycle
    cycleTimeout = setTimeout(async () => {
      if (!isRunning || isPaused) return;
      
      try {
        // Get current tab info
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        currentTab = tab;
        
        // Check if URL changed (indicating page navigation)
        if (lastUrl && tab.url !== lastUrl) {
          console.log(`G.R.I.D.: Target changed from ${lastUrl} to ${tab.url}, initiating new cycle`);
          lastUrl = tab.url;
          // Reset matches for new page
          currentMatches = null;
        }
        
        // Start next cycle
        runSingleCycle();
        
      } catch (error) {
        console.error("Error checking for URL change:", error);
        // Continue with next cycle anyway
        runSingleCycle();
      }
    }, 2000);
  }

  function startAutomaticProcessing() {
    isRunning = true;
    isPaused = false;
    currentCycle = 0;
    
    startBtn.disabled = true;
    pauseResumeBtn.disabled = false;
    pauseResumeBtn.textContent = "Pause";
    pauseResumeBtn.className = "button pause";
    pauseResumeBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
    
    clearApiLog();
    updateStatus("G.R.I.D. system activated. Commencing survey domination...", "running");
    updateCycleInfo("Initializing");
    
    // Get current tab and start first cycle
    chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
      currentTab = tab;
      lastUrl = tab.url;
      runSingleCycle();
    });
  }

  function pauseProcessing() {
    isPaused = true;
    
    if (cycleTimeout) {
      clearTimeout(cycleTimeout);
      cycleTimeout = null;
    }
    
    pauseResumeBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
    pauseResumeBtn.className = "button resume";
    
    updateStatus("G.R.I.D. operation temporarily suspended", "info");
    updateCycleInfo("Paused");
  }

  function resumeProcessing() {
    isPaused = false;
    
    pauseResumeBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
    pauseResumeBtn.className = "button pause";
    
    updateStatus("G.R.I.D. operation resumed. Continuing survey domination...", "running");
    
    // Resume with next cycle
    scheduleNextCycle();
  }

  function stopProcessing() {
    isRunning = false;
    isPaused = false;
    
    if (cycleTimeout) {
      clearTimeout(cycleTimeout);
      cycleTimeout = null;
    }
    
    startBtn.disabled = false;
    pauseResumeBtn.disabled = true;
    pauseResumeBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
    pauseResumeBtn.className = "button pause";
    
    updateStatus("G.R.I.D. system deactivated", "info");
    updateCycleInfo("Standby");
  }

  // Event Listeners
  startBtn.addEventListener("click", startAutomaticProcessing);

  pauseResumeBtn.addEventListener("click", function() {
    if (isPaused) {
      resumeProcessing();
    } else {
      pauseProcessing();
    }
  });

  // Listen for API log messages from background.js
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "logApiCall") {
      appendApiLog(request.message);
    }
  });

  // Initialize UI
  updateCycleInfo();
  updateStatus("G.R.I.D. system ready. Awaiting deployment command.", "info");
});
