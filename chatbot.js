const messagesContainer = document.getElementById('messages');
const chatInput = document.getElementById('chat-input');
const chatForm = document.getElementById('chat-form');
const emojiBtn = document.getElementById('emoji-btn');
const imageUpload = document.getElementById('image-upload');
let typingBubble = null; 

const themeToggleBtn = document.getElementById('theme-toggle-btn');
const sunIcon = document.querySelector('.sun-icon');
const moonIcon = document.querySelector('.moon-icon');

function createAvatar(isUser) {
  const div = document.createElement('div');
  div.className = 'avatar';
  div.setAttribute('aria-hidden', 'true');
  div.innerHTML = isUser
    ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>'
    : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>';
  return div;
}

function addMessage(text, fromUser = true, isImage = false) {
  if (!text && !isImage) return; 

  const bubble = document.createElement('div');
  bubble.className = `message-bubble ${fromUser ? 'user' : 'bot'}`;

  const messageContent = document.createElement('div');
  messageContent.className = 'message-content';

  if (isImage) {
    const img = document.createElement('img');
    img.src = text;
    img.alt = 'Uploaded image';
    img.className = 'image-preview';
    messageContent.appendChild(img);
  } else {
    const p = document.createElement('p');
    p.textContent = text;
    messageContent.appendChild(p);
  }

  bubble.appendChild(createAvatar(fromUser));
  bubble.appendChild(messageContent);

  messagesContainer.appendChild(bubble);
  messagesContainer.scrollTo({ top: messagesContainer.scrollHeight, behavior: "smooth" });
}

function showTyping() {
  if (typingBubble) return; 

  typingBubble = document.createElement('div');
  typingBubble.className = 'message-bubble bot typing';
  typingBubble.setAttribute('aria-live', 'polite');
  typingBubble.setAttribute('aria-label', 'Bot is typing');

  typingBubble.appendChild(createAvatar(false));

  for (let i = 0; i < 3; i++) {
    const dot = document.createElement('div');
    dot.className = 'dot';
    typingBubble.appendChild(dot);
  }

  messagesContainer.appendChild(typingBubble);
  messagesContainer.scrollTo({ top: messagesContainer.scrollHeight, behavior: "smooth" });
}

function hideTyping() {
  if (!typingBubble) return;

  typingBubble.remove();
  typingBubble = null;
}

const GEMINI_API_KEY = 'AIzaSyC2d8WwqwpO7gPGrrELI4Gnb0IlMoZMbd8'; 

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + GEMINI_API_KEY;

async function getGeminiResponse(message) {
  try {
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: message,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API error: ${response.status} - ${errorData.error.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const botReply = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text
      ? data.candidates[0].content.parts[0].text
      : 'Sorry, I could not get a response.';

    return botReply;

  } catch (error) {
    console.error('Error fetching from Gemini API:', error);
    return 'Apologies, something went wrong while connecting to the AI. Please try again later.';
  }
}

chatForm.addEventListener('submit', async e => {
  e.preventDefault();
  const message = chatInput.value.trim();
  if (!message) return;

  addMessage(message, true);
  chatInput.value = ''; 

  showTyping(); 

  const botReply = await getGeminiResponse(message);

  hideTyping();
  addMessage(botReply, false); 
});

chatInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    chatForm.dispatchEvent(new Event('submit'));
  }
});

emojiBtn.addEventListener('click', () => {
  const emoji = '😊';
  const start = chatInput.selectionStart;
  const end = chatInput.selectionEnd;
  const text = chatInput.value;
  chatInput.value = text.slice(0, start) + emoji + text.slice(end);
  chatInput.selectionStart = chatInput.selectionEnd = start + emoji.length;
  chatInput.focus();
});

imageUpload.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    alert('Please upload an image file.'); 
    e.target.value = ''; 
    return;
  }

  const reader = new FileReader();
  reader.onload = event => {
    addMessage(event.target.result, true, true);
  };
  reader.readAsDataURL(file);
  e.target.value = ''; 
});

function toggleDarkMode() {
    const body = document.body;
    body.classList.toggle('dark-mode');
    body.classList.toggle('light-mode');


    if (body.classList.contains('dark-mode')) {
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
        localStorage.setItem('theme', 'dark'); 
    } else {
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
        localStorage.setItem('theme', 'light'); 
    }
}


themeToggleBtn.addEventListener('click', toggleDarkMode);

function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
        document.body.classList.remove('light-mode', 'dark-mode'); 
        document.body.classList.add(savedTheme + '-mode');
    } else if (prefersDark) {
        document.body.classList.remove('light-mode'); 
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.add('light-mode'); 
    }

    if (document.body.classList.contains('dark-mode')) {
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
    } else {
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
    }
}

document.addEventListener('DOMContentLoaded', initializeTheme);