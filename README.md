# mooncafé.space

[![Open Source Love](httpshttps://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://github.com/ellerbrock/open-source-badges/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](code_of_conduct.md)

![mooncafé.space Screenshot](https://raw.githubusercontent.com/ayahack89/mooncafe.space/main/chat-room-previews/chat-room-pic-one.jpg)

**mooncafé.space** is a nostalgic, ephemeral chat application inspired by the simple, anonymous chatrooms of the early 2000s. No accounts, no profiles, no history. Just a quiet corner of the web for transient conversations.

> "A small, old-school café on the internet where conversations come and go like passing clouds."

## The Story

I built mooncafé.space because I missed the simplicity of the early internet those small, no-pressure chatrooms from the 2000s where anyone could drop in, choose a nickname, talk for a while, and disappear again without leaving a trail behind. No accounts, no profiles, no algorithms watching over you. Just a quiet corner of the web where people could speak freely.

This project is a love letter to that era. It's intentionally lightweight, with a focus on ephemerality and user privacy.

## Features

*   **Anonymous & Ephemeral:** No accounts required. Chat history is not stored on the server. All data is held in memory and is gone forever once you leave.
*   **Circles (Chat Rooms):** Users can create their own private "circles" and share a link to chat with friends.
*   **Real-Time Communication:** Live messaging powered by WebSockets.
*   **Rich Text Formatting:** Style your messages with bold, italics, underline, and different fonts.
*   **Message Replies:** Easily reply to specific messages.
*   **User Presence:** See who's currently in your circle.
*   **Sound Notifications:** Get audible alerts for new messages, and when users join or leave.
*   **Retro UI:** A user interface designed to evoke the feeling of old desktop chat applications.
*   **Self-Hostable:** The entire application can be easily run on your own machine for maximum privacy.

## Tech Stack

*   **Backend:** Node.js, Express.js, Socket.IO
*   **Frontend:** Vanilla JavaScript (ES6+), HTML5, CSS3
*   **No Database:** All chat data is stored in-memory on the server.
*   **For Hosting:** Render

## Getting Started

You can run mooncafé.space on your local machine. This is the recommended approach for the best privacy.

### Prerequisites

*   Node.js (version 18 or higher)
*   npm (comes with Node.js)

### Installation & Running

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/ayahack89/mooncafe.space.git
    cd mooncafe.space
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the server:**
    ```bash
    npm start
    ```

4.  **Open in your browser:**
    Navigate to `http://localhost:3000`

The application will be running. You can create a new circle by clicking "Create/Share Circle" and sending the generated link to your friends.

## Privacy & Security

From a technical side, things are kept as lightweight and open as possible. There is no database, no message history saved to disk, and nothing stored permanently. Everything you see here exists only in the server's memory while you're connected. Once you leave and the circle is empty, it's gone.

The public version runs on a hosting platform where standard access logs may still exist on their end, but the chat application itself doesn't keep anything.

### For Maximum Privacy (Running over Tor)

For users who require a higher level of anonymity, you can run mooncafé.space as a Tor onion service. This will make your chat accessible only through the Tor network, providing a strong layer of privacy for you and your users.

1.  **Install Tor:** Follow the official instructions to install Tor on your system.
2.  **Configure a Tor Onion Service:**
    *   Find your `torrc` file (usually in `/etc/tor/torrc` on Linux or `C:\Users\<user>\AppData\Roaming\tor\torrc` on Windows).
    *   Add the following lines to your `torrc` file:
        ```
        HiddenServiceDir /var/lib/tor/hidden_service/
        HiddenServicePort 80 127.0.0.1:3000
        ```
    *   Restart the Tor service.
3.  **Get your Onion Address:**
    *   After restarting, Tor will create a `hostname` file in the `HiddenServiceDir` you specified.
    *   The contents of this file is your `.onion` address (e.g., `your-random-onion-address.onion`).
4.  **Run the application:**
    *   Start the mooncafé.space server as described in the "Getting Started" section.
5.  **Access your chat:**
    *   Using the Tor Browser, navigate to your `.onion` address. Your chat is now running as a Tor hidden service.

## Disclaimer

**Friendly reminder:** please don't use this chat for illegal or harmful content. Each person is responsible for what they post here, and this platform cannot take responsibility for anyone's actions. mooncafé.space is not meant to be a secure or end-to-end encrypted messaging service.

## Contributing

We welcome contributions! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for more details on how to get started.

---

Now grab a cup of coffee and enjoy :)