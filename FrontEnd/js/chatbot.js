(function () {
  let chatOpen = false;
  let chatHistory = [];
  let isSending = false;

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function renderMessages() {
    const box = document.getElementById("chatMessages");
    if (!box) return;
    if (chatHistory.length === 0) {
      box.innerHTML = `
                <div class="chat-msg chat-msg-bot">
                    <div class="chat-bubble">Halo! Saya asisten Toko Sembako. Tanya produk, rekomendasi, atau cara belanja ya.</div>
                </div>`;
      return;
    }
    box.innerHTML = chatHistory
      .map(
        (m) => `
            <div class="chat-msg chat-msg-${m.role === "user" ? "user" : "bot"}">
                <div class="chat-bubble">${escapeHtml(m.content)}</div>
            </div>
        `,
      )
      .join("");
    box.scrollTop = box.scrollHeight;
  }

  function updateLockUI() {
    const locked = typeof isLoggedIn === "function" && !isLoggedIn();
    const overlay = document.getElementById("chatLockOverlay");
    const input = document.getElementById("chatInput");
    const sendBtn = document.getElementById("chatSendBtn");
    if (overlay) overlay.classList.toggle("hidden", !locked);
    if (input) input.disabled = locked || isSending;
    if (sendBtn) sendBtn.disabled = locked || isSending;
  }

  function toggleChatPanel() {
    chatOpen = !chatOpen;
    const panel = document.getElementById("chatPanel");
    const fab = document.getElementById("chatFab");
    if (panel) panel.classList.toggle("open", chatOpen);
    if (fab) fab.classList.toggle("open", chatOpen);
    if (chatOpen) {
      updateLockUI();
      document.getElementById("chatInput")?.focus();
    }
  }

  async function sendChatMessage() {
    if (typeof isLoggedIn === "function" && !isLoggedIn()) {
      window.location.href =
        "login.html?return=" +
        encodeURIComponent(window.location.pathname.split("/").pop());
      return;
    }
    const input = document.getElementById("chatInput");
    const text = input?.value.trim();
    if (!text || isSending) return;

    chatHistory.push({ role: "user", content: text });
    input.value = "";
    renderMessages();
    isSending = true;
    updateLockUI();

    const typing = document.createElement("div");
    typing.className = "chat-msg chat-msg-bot chat-typing";
    typing.innerHTML = `<div class="chat-bubble">Mengetik...</div>`;
    document.getElementById("chatMessages")?.appendChild(typing);

    const res = await apiFetch("/chat", {
      method: "POST",
      body: JSON.stringify({ messages: chatHistory }),
    });

    typing.remove();
    isSending = false;
    updateLockUI();

    if (res.ok && res.data.reply) {
      chatHistory.push({ role: "assistant", content: res.data.reply });
      renderMessages();
      return;
    }

    const errMsg =
      res.data?.error || "Gagal membalas. Periksa Flask & konfigurasi 9Router.";
    chatHistory.push({
      role: "assistant",
      content: "Maaf, terjadi gangguan: " + errMsg,
    });
    renderMessages();
  }

  async function loadProviderLabel() {
    const el = document.getElementById("chatProviderLabel");
    if (!el || typeof apiFetch !== "function") return;
    const res = await apiFetch("/chat/status");
    if (!res.ok || !res.data.provider) return;
    const names = {
      nvidia: "NVIDIA NIM",
      openrouter: "OpenRouter",
      "9router": "9Router",
    };
    el.textContent =
      "Powered by " + (names[res.data.provider] || res.data.provider);
  }

  function buildChatWidget() {
    if (document.getElementById("sembako-chat-root")) return;

    const root = document.createElement("div");
    root.id = "sembako-chat-root";
    root.innerHTML = `
            <div id="chatPanel" class="chat-panel">
                <div class="chat-header">
                    <div>
                        <strong>Asisten Sembako</strong>
                        <small id="chatProviderLabel">Powered by AI</small>
                    </div>
                    <button type="button" class="chat-close-btn" id="chatCloseBtn" aria-label="Tutup">×</button>
                </div>
                <div id="chatMessages" class="chat-messages"></div>
                <div id="chatLockOverlay" class="chat-lock-overlay">
                    <div class="chat-lock-box">
                        <span class="chat-lock-icon">🔒</span>
                        <p><strong>Login diperlukan</strong></p>
                        <p>Masuk ke akun untuk menggunakan chatbot.</p>
                        <a href="login.html" class="btn-primary chat-lock-btn">Masuk Sekarang</a>
                    </div>
                </div>
                <div class="chat-input-row">
                    <input type="text" id="chatInput" placeholder="Tanya produk atau belanja..." maxlength="500" autocomplete="off">
                    <button type="button" id="chatSendBtn" class="chat-send-btn" aria-label="Kirim">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                    </button>
                </div>
            </div>
            <button type="button" id="chatFab" class="chat-fab" aria-label="Buka chat">
                <svg class="chat-fab-icon chat-fab-open" viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <svg class="chat-fab-icon chat-fab-close" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>`;
    document.body.appendChild(root);

    document
      .getElementById("chatFab")
      ?.addEventListener("click", toggleChatPanel);
    document
      .getElementById("chatCloseBtn")
      ?.addEventListener("click", toggleChatPanel);
    document
      .getElementById("chatSendBtn")
      ?.addEventListener("click", sendChatMessage);
    document.getElementById("chatInput")?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") sendChatMessage();
    });

    renderMessages();
    updateLockUI();
    loadProviderLabel();
  }

  window.initChatbot = function () {
    buildChatWidget();
  };

  window.updateChatbotLock = function () {
    updateLockUI();
  };
})();
