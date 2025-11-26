
/*
- BUG REPORT -
Title: Username displays as ‘undefined’ in message list
Environment: mooncafe.space chat room, current web app
Steps to reproduce:
  1. Open mooncafe.space.
  2. Enter a nickname in the login form and join the room.
  3. Send a message in the main chat area.
  4. Observe the message header/username line.
Actual result: Username label appears as “undefined”.
Expected result: It should display the user’s chosen nickname.
Suspected area: The client-side message rendering function (`appendMessage`) is expecting a `nickname` property on the message object, but the server is sending a `username` property.
*/
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENTS ---
    const landingView = document.getElementById('landing-view');
    const chatView = document.getElementById('chat-view');
    const nicknameInput = document.getElementById('nickname-input');
    const flairInput = document.getElementById('flair-input');
    const enterButton = document.getElementById('enter-button');

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
    const aboutBtn = document.getElementById('about-btn');
    const collaborateBtn = document.getElementById('collaborate-btn');
    const shareCircleModal = document.getElementById('share-circle-modal');
    const closeButtons = document.querySelectorAll('.modal-close-btn');

    // Circle Elements
    const createCircleBtn = document.getElementById('create-circle-btn');
    const shareLinkInput = document.getElementById('share-link-input');
    const copyLinkBtn = document.getElementById('copy-link-btn');
    const newCircleBtn = document.getElementById('new-circle-btn');

    const userListToggleBtn = document.getElementById('user-list-toggle-btn');
    const contentArea = document.querySelector('.content-area');

    // Nickname change
    const changeNicknameBtn = document.getElementById('change-nickname-btn');

    // Context Menu
    const userContextMenu = document.getElementById('user-context-menu');
    
    // Style buttons
    const boldBtn = document.getElementById('bold-btn');
    const italicBtn = document.getElementById('italic-btn');
    const underlineBtn = document.getElementById('underline-btn');

    // --- STATE ---
    let isScrollOn = true;
    let identity = null;
    let circleId = 'main-cafe';
    let currentUserStyle = {
        fontFamily: 'var(--font-ui)',
        fontSize: '1em',
        fontWeight: 'normal',
        fontStyle: 'normal',
        textDecoration: 'none'
    };

    // --- IDENTITY & LOCAL STORAGE ---
    const getIdentity = () => {
        try {
            const storedIdentity = localStorage.getItem('mooncafeIdentity');
            if (storedIdentity) {
                return JSON.parse(storedIdentity);
            }
        } catch (e) {
            console.error("Could not parse identity from localStorage", e);
            localStorage.removeItem('mooncafeIdentity');
        }
        return null;
    };

    const saveIdentity = (newIdentity) => {
        try {
            localStorage.setItem('mooncafeIdentity', JSON.stringify(newIdentity));
            identity = newIdentity;
        } catch (e) {
            console.error("Could not save identity to localStorage", e);
        }
    };
    
    const clearIdentity = () => {
        localStorage.removeItem('mooncafeIdentity');
        identity = null;
        window.location.reload();
    };

    const generateClientToken = () => {
        return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    };
    
    const getCircleIdFromUrl = () => {
        const params = new URLSearchParams(window.location.search);
        return params.get('circle') || 'main-cafe';
    };


    // --- UI FUNCTIONS ---
    const updateUserTime = () => {
        const now = new Date();
        statusTime.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const updateUserList = (users) => {
        userList.innerHTML = '';
        users.forEach(user => {
            const userEl = document.createElement('div');
            userEl.className = 'user-item';
            const flairEl = user.flair ? `<div class="user-flair">${user.flair}</div>` : '';
            userEl.innerHTML = `
                <div class="avatar">${user.avatar || '👤'}</div>
                <div class="user-info">
<span>${user.nickname}</span>
                    ${flairEl}
                </div>
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
            // BUG FIX: The server sends 'username', but client was expecting 'nickname'.
            const nickname = msg.username || 'Guest';
            msgRow.className = 'message-row';
            const s = msg.style || {};
            const flairEl = msg.flair ? `<div class="message-flair">${msg.flair}</div>` : '';
            const textStyle = `font-family: ${s.fontFamily || 'var(--font-ui)'}; color: ${s.color || '#333'}; font-weight: ${s.fontWeight || 'normal'}; font-style: ${s.fontStyle || 'normal'}; text-decoration: ${s.textDecoration || 'none'}; font-size: ${s.fontSize || '1em'};`;

            msgRow.innerHTML = `
                <div class="avatar" style="background-color: ${generateAvatarColor(nickname)}">${msg.avatar || '👤'}</div>
                <div class="message-content">
                    <span class="message-username" style="color: ${s.color || '#333'}" data-username="${nickname}">${nickname}</span>
                    ${flairEl}
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
        if (!username) return '#ccc';
        for (let i = 0; i < username.length; i++) {
            hash = username.charCodeAt(i) + ((hash << 5) - hash);
        }
        let color = '#';
        for (let i = 0; i < 3; i++) {
            let value = (hash >> (i * 8)) & 0xFF;
            color += ('00' + value.toString(16)).substr(-2);
        }
        return color;
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

    // --- EVENT HANDLERS ---
    const handleSendMessage = () => {
        const text = messageInput.value.trim();
        if (text && identity) {
            const message = {
                text: text,
                style: { ...currentUserStyle }
            };
            socket.emit('chatMessage', message);
            messageInput.value = '';
            messageInput.focus();
        }
    };

    const handleEnterChat = () => {
        const nickname = nicknameInput.value.trim();
        if (nickname) {
            const newIdentity = {
                nickname: nickname,
                flair: flairInput.value.trim(),
                clientToken: generateClientToken()
            };
            saveIdentity(newIdentity);
            connectToChat();
        } else {
            alert('Please enter a nickname.');
        }
    };

    // --- MODAL & UI LISTENERS ---
    sendButton.addEventListener('click', handleSendMessage);
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });

    enterButton.addEventListener('click', handleEnterChat);
    nicknameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleEnterChat();
    });
    flairInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleEnterChat();
    });

    changeNicknameBtn.addEventListener('click', clearIdentity);

    scrollOnCheckbox.addEventListener('change', (e) => {
        isScrollOn = e.target.checked;
        localStorage.setItem('mooncafe_scrollOn', JSON.stringify(isScrollOn));
    });
    
    // Font style controls
    document.getElementById('font-family-select').addEventListener('change', (e) => {
        currentUserStyle.fontFamily = e.target.value;
        messageInput.style.fontFamily = e.target.value;
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

    const showModal = (id) => document.getElementById(id).style.display = 'flex';
    const hideModal = (id) => document.getElementById(id).style.display = 'none';

    openJoinModalBtn.addEventListener('click', () => showModal('join-room-modal'));
    openEmoteModalBtn.addEventListener('click', () => showModal('emote-picker-modal'));
    aboutBtn.addEventListener('click', () => showModal('about-modal'));
    collaborateBtn.addEventListener('click', () => showModal('collaborate-modal'));

    createCircleBtn.addEventListener('click', () => {
        shareLinkInput.value = window.location.href;
        showModal('share-circle-modal');
    });
    copyLinkBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(shareLinkInput.value).then(() => {
            copyLinkBtn.textContent = 'Copied!';
            setTimeout(() => { copyLinkBtn.textContent = 'Copy Link'; }, 2000);
        });
    });
    newCircleBtn.addEventListener('click', () => {
        const newCircle = 'circle-' + Math.random().toString(36).substr(2, 9);
        window.location.search = `?circle=${newCircle}`;
    });

    closeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modalId = e.currentTarget.getAttribute('data-target-modal');
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

    
    userListToggleBtn.addEventListener('click', () => {
        contentArea.classList.toggle('user-list-closed');
        if (contentArea.classList.contains('user-list-closed')) {
            userListToggleBtn.textContent = '<<';
        } else {
            userListToggleBtn.textContent = '>>';
        }
    });
    
    // --- SOCKET.IO ---
    const socket = io({ autoConnect: false });

    const connectToChat = () => {
        if (!identity) return;
        
        landingView.classList.add('hidden');
        chatView.classList.remove('hidden');

        if (!socket.connected) {
            socket.connect();
        }
        
        const payload = {
            ...identity,
            circle: circleId
        };
        socket.emit('newUser', payload);
    };

    socket.on('connect', () => {
        console.log('Connected to server!');
    });

    socket.on('userList', (userArray) => {
        updateUserList(userArray);
    });
    
    socket.on('messageHistory', (messages) => {
        messageContainer.innerHTML = ''; // Clear previous messages
        messages.forEach(msg => appendMessage(msg));
    });

    socket.on('message', (messageData) => {
        appendMessage(messageData);
    });
    
    socket.on('systemMessage', (text) => {
        appendMessage({ system: true, text: text });
    });
    
    socket.on('nicknameError', (error) => {
        alert(error.message);
        clearIdentity();
    });


    // --- INITIALIZATION ---
    const init = () => {
        circleId = getCircleIdFromUrl();
        identity = getIdentity();

        if (identity) {
            connectToChat();
        } else {
            landingView.classList.remove('hidden');
            chatView.classList.add('hidden');
        }

        updateUserTime();
        setInterval(updateUserTime, 60000);
        createResponsiveToggle();
    };

    init();
});
