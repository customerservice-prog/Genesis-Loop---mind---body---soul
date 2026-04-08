// Genesis Loop - Frontend App
const socket = io();
let currentSessionId = null;
let isRunning = false;

const chatArea = document.getElementById('chatArea');
const promptInput = document.getElementById('promptInput');
const sendBtn = document.getElementById('sendBtn');
const pipelineStatus = document.getElementById('pipelineStatus');
const btnText = document.getElementById('btnText');

// Pipeline step mapping
const stepMap = {
    chatgpt: 'step-chatgpt',
    claude: 'step-claude',
    github: 'step-github',
    cursor: 'step-cursor',
    railway: 'step-railway'
};

function useExample(el) {
    promptInput.value = el.textContent;
    promptInput.focus();
}

function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendPrompt();
    }
}

function addMessage(content, isUser = false) {
    const msg = document.createElement('div');
    msg.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    msg.innerHTML = `
        <div class="avatar">${isUser ? 'YOU' : 'GL'}</div>
            <div class="bubble">${content}</div>
              `;
    chatArea.appendChild(msg);
    chatArea.scrollTop = chatArea.scrollHeight;
    return msg;
}

function updatePipelineStep(step, status, statusText) {
    const stepEl = document.getElementById(stepMap[step] || stepMap.chatgpt);
    if (!stepEl) return;
    stepEl.className = `pipeline-step ${status}`;
    const statusEl = stepEl.querySelector('.step-status');
    if (statusEl) statusEl.textContent = statusText;
}

function resetPipeline() {
    Object.values(stepMap).forEach(id => {
          const el = document.getElementById(id);
          if (el) {
                  el.className = 'pipeline-step';
                  const statusEl = el.querySelector('.step-status');
                  if (statusEl) statusEl.textContent = 'Waiting...';
          }
    });
}

async function sendPrompt() {
    const prompt = promptInput.value.trim();
    if (!prompt || isRunning) return;

  isRunning = true;
    sendBtn.disabled = true;
    btnText.innerHTML = '<span class="spinner"></span> Running...';
    promptInput.value = '';

  // Add user message
  addMessage(prompt, true);

  // Show pipeline
  pipelineStatus.style.display = 'flex';
    resetPipeline();

  // Add bot thinking message
  const thinkingMsg = addMessage('<span class="spinner"></span> Genesis Loop is starting your pipeline...');

  try {
        const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
        });

      const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Server error');

      currentSessionId = data.sessionId;
        socket.emit('join', currentSessionId);

      thinkingMsg.querySelector('.bubble').innerHTML =
              '<span class="spinner"></span> Pipeline running — watch the status bar above...';

  } catch (err) {
        thinkingMsg.querySelector('.bubble').innerHTML = `Error: ${err.message}`;
        resetState();
  }
}

// Socket events
socket.on('progress', (data) => {
    const { step, message, status, repoUrl, deployUrl, cursorLink } = data;

            if (step === 'start') {
                  addMessage(`Starting pipeline for: <strong>${message.split('"')[1]}</strong>`);
                  return;
            }

            if (stepMap[step]) {
                  updatePipelineStep(step, status === 'running' ? 'running' : 'done', status === 'running' ? 'Working...' : 'Done');
                  if (status === 'running') {
            addMessage(`<span class="spinner"></span> ${message}`);
                  } else {
                          const lastMsg = chatArea.lastElementChild;
                          if (lastMsg) {
                                    lastMsg.querySelector('.bubble').innerHTML = `&#10003; ${message}`;
                          }
                  }
            }

            if (step === 'complete') {
                  // Remove the thinking message
      const spinnerMsgs = chatArea.querySelectorAll('.spinner');
                  spinnerMsgs.forEach(s => s.closest('.message')?.remove());

      const resultHtml = `
            <p><strong>&#127775; Genesis Loop Complete!</strong> Your app is built and deployed.</p>
                  <div class="result-card">
                          <h4>&#10003; Outputs</h4>
                                  <div class="result-link">&#128196; GitHub: <a href="${repoUrl}" target="_blank">${repoUrl}</a></div>
                                          <div class="result-link">&#128640; Live App: <a href="${deployUrl}" target="_blank">${deployUrl}</a></div>
                                                  <a href="${cursorLink}" class="cursor-btn">&#9999; Open in Cursor IDE</a>
                                                        </div>
                                                            `;
                  addMessage(resultHtml);
                  resetState();
            }
});

socket.on('error', (data) => {
    addMessage(`Error: ${data.message}`);
    resetState();
});

function resetState() {
    isRunning = false;
    sendBtn.disabled = false;
    btnText.innerHTML = '&#9654; Generate';
}

// Auto-focus input
promptInput.focus();
