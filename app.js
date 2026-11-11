// --- Инициализация Telegram ---
const tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand();
}

// --- DOM Элементы ---
const mainMenu = document.getElementById('main-menu');
const chatScreen = document.getElementById('chat-screen');
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const modelButtons = document.querySelectorAll('.model-btn');
const currentModelName = document.getElementById('current-model-name');
const greetingModel = document.getElementById('greeting-model');

const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('sidebar-overlay');
const openSidebarBtn = document.getElementById('open-sidebar');
const closeSidebarBtn = document.getElementById('close-sidebar');
const backToMenuBtn = document.getElementById('back-to-menu');

const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');

// Новые элементы для работы с фото
const fileInput = document.getElementById('file-input');
const attachBtn = document.getElementById('attach-btn');
const imagePreview = document.getElementById('image-preview');
const previewImg = document.getElementById('preview-img');
const removePreviewBtn = document.getElementById('remove-preview');

// Храним выбранный файл
let selectedFile = null;

// --- Тема ---
const savedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (savedTheme === 'light' || (!savedTheme && !prefersDark)) {
    document.body.classList.add('light-theme');
    themeIcon.textContent = '☀️';
} else {
    themeIcon.textContent = '🌙';
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    themeIcon.textContent = isLight ? '☀️' : '🌙';
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    if (tg) tg.setHeaderColor(isLight ? '#f4f7f9' : '#0b1219');
});

// --- Навигация ---
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

modelButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const model = btn.getAttribute('data-model');
        currentModelName.textContent = `GPT ${model}`;
        greetingModel.textContent = model;
        
        const messages = chatMessages.querySelectorAll('.message');
        messages.forEach((msg, index) => { if (index > 0) msg.remove(); });
        
        clearPreview();
        showScreen('chat-screen');
    });
});

backToMenuBtn.addEventListener('click', () => {
    closeSidebar();
    showScreen('main-menu');
});

// --- Сайдбар ---
function openSidebar() {
    sidebar.classList.add('open');
    overlay.classList.add('active');
}
function closeSidebar() {
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
}
openSidebarBtn.addEventListener('click', openSidebar);
closeSidebarBtn.addEventListener('click', closeSidebar);
overlay.addEventListener('click', closeSidebar);

// --- Логика выбора фото ---
attachBtn.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        alert('Пожалуйста, выберите изображение.');
        return;
    }

    selectedFile = file;

    const reader = new FileReader();
    reader.onload = (event) => {
        previewImg.src = event.target.result;
        imagePreview.classList.remove('hidden');
        updateSendButtonState();
    };
    reader.readAsDataURL(file);
});

removePreviewBtn.addEventListener('click', () => {
    clearPreview();
});

function clearPreview() {
    selectedFile = null;
    fileInput.value = '';
    previewImg.src = '';
    imagePreview.classList.add('hidden');
    updateSendButtonState();
}

// --- Логика чата ---
messageInput.addEventListener('input', () => {
    messageInput.style.height = 'auto';
    messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
    updateSendButtonState();
});

messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

sendBtn.addEventListener('click', sendMessage);

function updateSendButtonState() {
    const hasText = messageInput.value.trim().length > 0;
    const hasImage = selectedFile !== null;
    sendBtn.disabled = !(hasText || hasImage);
}

async function sendMessage() {
    const text = messageInput.value.trim();
    const imageFile = selectedFile;

    if (!text && !imageFile) return;

    let imageDataUrl = null;
    if (imageFile) {
        imageDataUrl = await fileToDataURL(imageFile);
    }
    addMessage(text, 'user', imageDataUrl);

    messageInput.value = '';
    messageInput.style.height = 'auto';
    clearPreview();
    updateSendButtonState();

    const typingEl = showTypingIndicator();

    try {
        const reply = await sendToBackend(text, imageFile);
        typingEl.remove();
        addMessage(reply, 'bot');
    } catch (error) {
        typingEl.remove();
        addMessage('Ошибка сети. Попробуйте позже.', 'bot');
    } finally {
        messageInput.focus();
    }
}

function fileToDataURL(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
    });
}

// ЗАГЛУШКА (замените позже на реальный API)
async function sendToBackend(userText, imageFile) {
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    const model = currentModelName.textContent;
    
    if (imageFile) {
        return `[${model}] Фото получено! (${imageFile.name}, ${(imageFile.size / 1024).toFixed(1)} КБ). В будущем здесь будет анализ изображения нейросетью.`;
    }
    
    return `[${model}] Демо-ответ на: "${userText}". Подключите API позже.`;
}

function addMessage(text, sender, imageDataUrl = null) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', `${sender}-message`);
    
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('message-content');
    
    if (imageDataUrl) {
        const img = document.createElement('img');
        img.src = imageDataUrl;
        img.classList.add('message-image');
        contentDiv.appendChild(img);
    }
    
    if (text) {
        const textNode = document.createElement('div');
        textNode.textContent = text;
        contentDiv.appendChild(textNode);
    }
    
    msgDiv.appendChild(contentDiv);
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.classList.add('message', 'bot-message');
    
    const content = document.createElement('div');
    content.classList.add('typing-indicator');
    content.innerHTML = '<span></span><span></span><span></span>';
    
    indicator.appendChild(content);
    chatMessages.appendChild(indicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return indicator;
}

// Инициализация кнопки отправки при загрузке
updateSendButtonState();