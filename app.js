// Инициализация Telegram WebApp (если открыто внутри Telegram)
const tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand(); // Развернуть на весь экран
    // Применяем тему Telegram (цвета фона и текста)
    document.body.style.backgroundColor = tg.backgroundColor || '#ffffff';
}

const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');

// Авто-увеличение высоты текстового поля
messageInput.addEventListener('input', () => {
    messageInput.style.height = 'auto';
    messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
});

// Отправка по Enter (без Shift)
messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

sendBtn.addEventListener('click', sendMessage);

// === ГЛАВНАЯ ФУНКЦИЯ ОТПРАВКИ ===
async function sendMessage() {
    const text = messageInput.value.trim();
    if (!text) return;

    // 1. Добавляем сообщение пользователя в чат
    addMessage(text, 'user');
    messageInput.value = '';
    messageInput.style.height = 'auto';
    sendBtn.disabled = true;

    // 2. Показываем индикатор "печатает..."
    const typingEl = showTypingIndicator();

    try {
        // 3. ОТПРАВЛЯЕМ ЗАПРОС НА БЭКЕНД (пока заглушка)
        const reply = await sendToBackend(text);
        
        // 4. Убираем индикатор и добавляем ответ бота
        typingEl.remove();
        addMessage(reply, 'bot');
    } catch (error) {
        typingEl.remove();
        addMessage('Ошибка: не удалось получить ответ. Попробуйте позже.', 'bot');
        console.error(error);
    } finally {
        sendBtn.disabled = false;
        messageInput.focus();
    }
}

// === ЗАГЛУШКА ДЛЯ БУДУЩЕГО API ===
// Позже вы замените тело этой функции на реальный fetch-запрос к вашему серверу
async function sendToBackend(userText) {
    // Имитация задержки сети (1-2 секунды)
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    // Демо-ответы
    const demoReplies = [
        `Ты написал: "${userText}". Это демо-ответ. Скоро здесь будет реальный ChatGPT.`,
        `Интересный вопрос! Но я пока всего лишь тестовая заглушка.`,
        `Я работаю в демо-режиме. Подключи API на бэкенде, и я стану умнее!`,
        `Принято! Твой текст: "${userText}". Ждем подключения нейросети.`
    ];
    return demoReplies[Math.floor(Math.random() * demoReplies.length)];

    /* 
    // ПРИМЕР БУДУЩЕГО РЕАЛЬНОГО ЗАПРОСА:
    const response = await fetch('https://ваш-сервер.com/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            message: userText,
            // Если нужно передать данные пользователя Telegram:
            // initData: tg?.initData 
        })
    });
    const data = await response.json();
    return data.reply;
    */
}

// === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===

function addMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', `${sender}-message`);
    
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('message-content');
    contentDiv.textContent = text; // textContent безопаснее, чем innerHTML
    
    msgDiv.appendChild(contentDiv);
    chatMessages.appendChild(msgDiv);
    
    // Прокрутка вниз
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