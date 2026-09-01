const form = document.getElementById("chat-form");
const input = document.getElementById("message-input");
const messages = document.getElementById("messages");
const sendButton = document.getElementById("send-button");

const API_URL = "http://localhost:3000/chat";

function addMessage(content, role) {
    const message = document.createElement("div");
    message.className = `message ${role}`;

    const messageContent = document.createElement("div");
    messageContent.className = "message-content";
    messageContent.textContent = content;

    message.appendChild(messageContent);
    messages.appendChild(message);

    messages.scrollTop = messages.scrollHeight;

    return messageContent;
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const message = input.value.trim();

    if (!message) {
        return;
    }

    // Show user's message
    addMessage(message, "user");

    // Clear input
    input.value = "";

    // Disable input while waiting
    input.disabled = true;
    sendButton.disabled = true;
    sendButton.textContent = "Sending...";

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: message
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const data = await response.json();

        addMessage(data.response, "assistant");

    } catch (error) {
        console.error(error);

        addMessage(
            "Sorry, something went wrong while contacting the server.",
            "assistant"
        );
    } finally {
        input.disabled = false;
        sendButton.disabled = false;
        sendButton.textContent = "Send";
        input.focus();
    }
});

// Enter = send
// Shift + Enter = new line
input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        form.requestSubmit();
    }
});

// Automatically increase textarea height
input.addEventListener("input", () => {
    input.style.height = "auto";
    input.style.height = `${input.scrollHeight}px`;
});
