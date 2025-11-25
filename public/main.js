
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENTS ---
    const loginView = document.getElementById('login-view');
    const chatView = document.getElementById('chat-view');
    const usernameInput = document.getElementById('username-input');
    const loginButton = document.getElementById('login-button');

    const messageContainer = document.getElementById('message-container');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const userListPanel = document.getElementById('user-list-panel');
    const userList = document.getElementById('user-list');
    const userListHeader = document.getElementById('user-list-header');
    const statusTime = document.getElementById('status-time');
    const scrollOnCheckbox = document.getElementById('scroll-on-checkbox');

    // Modals
    const modals = document.querySelectorAll('.modal-overlay');
    const openJoinModalBtn = document.getElementById('join-room-btn-open');
    const openEmoteModalBtn = document.getElementById('emote-picker-btn');
    const closeButtons = document.querySelectorAll('.modal-close-btn');

    // Context Menu
    const userContextMenu = document.getElementById('user-context-menu');
    
    // Style buttons
    const boldBtn = document.getElementById('bold-btn');
    const italicBtn = document.getElementById('italic-btn');
    const underlineBtn = document.getElementById('underline-btn');

    // --- STATE ---
    let isScrollOn = true;
    let username = '';
    let currentUserStyle = {
        fontFamily: 'var(--font-ui)',
        fontSize: '1em',
        fontWeight: 'normal',
        fontStyle: 'normal',
        textDecoration: 'none'
    };

    // --- LOCAL STORAGE ---
    const loadState = () => {
        const savedScroll = localStorage.getItem('mooncafe_scrollOn');
        isScrollOn = savedScroll !== null ? JSON.parse(savedScroll) : true;
        scrollOnCheckbox.checked = isScrollOn;

        const savedFont = localStorage.getItem('mooncafe_fontFamily');
        if (savedFont) {
            currentUserStyle.fontFamily = savedFont;
            document.getElementById('font-family-select').value = savedFont;
            messageInput.style.fontFamily = savedFont;
        }
    };

    const saveState = () => {
        localStorage.setItem('mooncafe_scrollOn', JSON.stringify(isScrollOn));
        localStorage.setItem('mooncafe_fontFamily', currentUserStyle.fontFamily);
    };
    
    // --- FUNCTIONS ---

    const updateUserTime = () => {
        const now = new Date();
        statusTime.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const updateUserList = (users) => {
        userList.innerHTML = '';
        users.forEach(user => {
            const userEl = document.createElement('div');
            userEl.className = 'user-item';
            // NOTE: 'status' and 'avatar' would come from the server user object
            userEl.innerHTML = `
                <div class="status"></div>
                <div class="avatar">${user.avatar || '👤'}</div>
                <span>${user.username}</span>
            `;
            userList.appendChild(userEl);
        });
        userListHeader.textContent = `${users.length} Users >> 0 Ignored`;
    };

    const appendMessage = (msg) => {
        const msgRow = document.createElement('div');
        if (msg.system) {
            msgRow.className = 'system-message';
            msgRow.textContent = msg.text;
        } else {
            msgRow.className = 'message-row';
            const s = msg.style || {};
            const textStyle = `font-family: ${s.fontFamily || 'var(--font-ui)'}; color: ${s.color || '#333'}; font-weight: ${s.fontWeight || 'normal'}; font-style: ${s.fontStyle || 'normal'}; text-decoration: ${s.textDecoration || 'none'}; font-size: ${s.fontSize || '1em'};`;

            msgRow.innerHTML = `
                <div class="avatar" style="background-color: ${generateAvatarColor(msg.username)}">${msg.avatar || '👤'}</div>
                <div class="message-content">
                    <span class="message-username" style="color: ${s.color || '#333'}" data-username="${msg.username}">${msg.username}</span>
                    <span class="message-text" style="${textStyle}">${msg.text}</span>
                </div>
            `;
        }
        messageContainer.appendChild(msgRow);

        if (isScrollOn) {
            messageContainer.scrollTop = messageContainer.scrollHeight;
        }
    };
    
    const generateAvatarColor = (username) => {
        let hash = 0;
        for (let i = 0; i < username.length; i++) {
            hash = username.charCodeAt(i) + ((hash << 5) - hash);
        }
        let color = '#';
        for (let i = 0; i < 3; i++) {
            let value = (hash >> (i * 8)) & 0xFF;
            color += ('00' + value.toString(16)).substr(-2);
        }
        return color;
    }

    const handleSendMessage = () => {
        const text = messageInput.value.trim();
        if (text) {
            const message = {
                text: text,
                style: { ...currentUserStyle }
            };
            
            // INTEGRATION: Emit message to server
            socket.emit('chatMessage', message);

            messageInput.value = '';
            messageInput.focus();
        }
    };

    const handleLogin = () => {
        const name = usernameInput.value.trim();
        if (name) {
            username = name;
            // INTEGRATION: Emit new user to server
            socket.emit('newUser', { username: name, avatar: '☕️' }); // Example avatar

            loginView.classList.add('hidden');
            chatView.classList.remove('hidden');
            messageInput.focus();
        }
    };
    
    const applyInputStyles = () => {
        messageInput.style.fontWeight = currentUserStyle.fontWeight;
        messageInput.style.fontStyle = currentUserStyle.fontStyle;
        messageInput.style.textDecoration = currentUserStyle.textDecoration;
    };

    const createResponsiveToggle = () => {
        const toggle = document.createElement('div');
        toggle.className = 'user-list-toggle';
        toggle.innerHTML = '&#9776;';
        toggle.addEventListener('click', () => userListPanel.classList.toggle('open'));
        document.body.appendChild(toggle);
    };

    // --- EVENT LISTENERS ---
    sendButton.addEventListener('click', handleSendMessage);
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });

    loginButton.addEventListener('click', handleLogin);
    usernameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleLogin();
    });

    scrollOnCheckbox.addEventListener('change', (e) => {
        isScrollOn = e.target.checked;
        saveState();
    });
    
    // Font style controls
    document.getElementById('font-family-select').addEventListener('change', (e) => {
        currentUserStyle.fontFamily = e.target.value;
        messageInput.style.fontFamily = e.target.value;
        saveState();
    });
    document.getElementById('font-size-select').addEventListener('change', (e) => {
        currentUserStyle.fontSize = e.target.value;
        messageInput.style.fontSize = e.target.value;
    });
    
    boldBtn.addEventListener('click', () => {
        boldBtn.classList.toggle('active');
        currentUserStyle.fontWeight = currentUserStyle.fontWeight === 'bold' ? 'normal' : 'bold';
        applyInputStyles();
    });
    italicBtn.addEventListener('click', () => {
        italicBtn.classList.toggle('active');
        currentUserStyle.fontStyle = currentUserStyle.fontStyle === 'italic' ? 'normal' : 'italic';
        applyInputStyles();
    });
    underlineBtn.addEventListener('click', () => {
        underlineBtn.classList.toggle('active');
        currentUserStyle.textDecoration = currentUserStyle.textDecoration === 'underline' ? 'none' : 'underline';
        applyInputStyles();
    });

    // Modals
    const showModal = (id) => document.getElementById(id).style.display = 'flex';
    const hideModal = (id) => document.getElementById(id).style.display = 'none';

    openJoinModalBtn.addEventListener('click', () => showModal('join-room-modal'));
    openEmoteModalBtn.addEventListener('click', () => showModal('emote-picker-modal'));

    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.getAttribute('data-target-modal');
            hideModal(modalId);
        });
    });
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            e.target.style.display = 'none';
        }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            modals.forEach(modal => modal.style.display = 'none');
        }
    });

    // Emote Picker
    const emotes = ['😊', '😂', '😍', '🤔', '😢', '😎', '👍', '❤️', '🎉', '☕', '✨', '💾'];
    const emoteGrid = document.getElementById('emote-grid');
emotes.forEach(emote => {
        const emoteEl = document.createElement('div');
        emoteEl.className = 'emote-item';
        emoteEl.textContent = emote;
        emoteEl.addEventListener('click', () => {
            messageInput.value += emote;
            messageInput.focus();
            hideModal('emote-picker-modal');
        });
        emoteGrid.appendChild(emoteEl);
    });

    // Context Menu
    messageContainer.addEventListener('click', (e) => {
        const usernameEl = e.target.closest('.message-username');
        if (usernameEl) {
            e.preventDefault();
            userContextMenu.style.display = 'block';
            userContextMenu.style.top = `${e.pageY}px`;
            userContextMenu.style.left = `${e.pageX}px`;
            userContextMenu.setAttribute('data-target-user', usernameEl.dataset.username);
        }
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.message-username')) {
            userContextMenu.style.display = 'none';
        }
    });


    // --- SOCKET.IO INTEGRATION ---
    const socket = io();

    socket.on('connect', () => {
        console.log('Connected to server!');
        // Show login view on connect
        loginView.classList.remove('hidden');
        chatView.classList.add('hidden');
    });

    socket.on('userList', (userArray) => {
        updateUserList(userArray);
    });

    socket.on('message', (messageData) => {
        appendMessage(messageData);
    });
    
    socket.on('systemMessage', (text) => {
        appendMessage({ system: true, text: text });
    });


    // --- INITIALIZATION ---
    const init = () => {
        loadState();
        updateUserTime();
        setInterval(updateUserTime, 60000); // Update every minute
        createResponsiveToggle();
    };

    init();
});
