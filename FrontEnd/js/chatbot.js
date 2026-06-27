(function () {
  let chatOpen = false;
  let chatHistory = [];
  let isSending = false;
  let currentSessionId = null;
  let currentView = "chat"; // "chat" or "history"

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function formatChatDate(isoString) {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return isoString;

      const now = new Date();
      const diffMs = now - date;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const timeStr = `${hours}:${minutes}`;

      if (diffDays === 0 && date.getDate() === now.getDate()) {
        return `Hari ini, ${timeStr}`;
      } else if (diffDays === 1 || (diffDays === 0 && date.getDate() !== now.getDate())) {
        return `Kemarin, ${timeStr}`;
      } else {
        const options = { day: "numeric", month: "short" };
        return `${date.toLocaleDateString("id-ID", options)}, ${timeStr}`;
      }
    } catch (e) {
      return isoString;
    }
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

  function setView(view) {
    currentView = view;
    const messagesBox = document.getElementById("chatMessages");
    const inputRow = document.getElementById("chatInputRow");
    const historyContainer = document.getElementById("chatHistoryContainer");
    const backBtn = document.getElementById("chatBackBtn");
    const titleEl = document.getElementById("chatPanelTitle");
    const newBtn = document.getElementById("chatNewBtn");
    const historyBtn = document.getElementById("chatHistoryBtn");

    if (view === "history") {
      messagesBox?.classList.add("hidden");
      if (inputRow) inputRow.style.display = "none";
      historyContainer?.classList.remove("hidden");
      backBtn?.classList.remove("hidden");
      if (titleEl) titleEl.textContent = "Riwayat Chat";
      if (newBtn) newBtn.classList.add("hidden");
      if (historyBtn) historyBtn.classList.add("hidden");
      loadHistoryList();
    } else {
      messagesBox?.classList.remove("hidden");
      if (inputRow) inputRow.style.display = "flex";
      historyContainer?.classList.add("hidden");
      backBtn?.classList.add("hidden");
      if (titleEl) titleEl.textContent = "Asisten Sembako";
      updateLockUI(); // updates lock state and buttons visibility
      renderMessages();
    }
  }

  function updateLockUI() {
    const locked = typeof isLoggedIn === "function" && !isLoggedIn();
    const overlay = document.getElementById("chatLockOverlay");
    const input = document.getElementById("chatInput");
    const sendBtn = document.getElementById("chatSendBtn");
    if (overlay) overlay.classList.toggle("hidden", !locked);
    if (input) input.disabled = locked || isSending;
    if (sendBtn) sendBtn.disabled = locked || isSending;

    // Toggle header actions based on login state
    const newBtn = document.getElementById("chatNewBtn");
    const historyBtn = document.getElementById("chatHistoryBtn");
    if (newBtn) {
      if (locked || currentView !== "chat") newBtn.classList.add("hidden");
      else newBtn.classList.remove("hidden");
    }
    if (historyBtn) {
      if (locked || currentView !== "chat") historyBtn.classList.add("hidden");
      else historyBtn.classList.remove("hidden");
    }
  }

  function toggleChatPanel() {
    chatOpen = !chatOpen;
    const panel = document.getElementById("chatPanel");
    const fab = document.getElementById("chatFab");
    if (panel) panel.classList.toggle("open", chatOpen);
    if (fab) fab.classList.toggle("open", chatOpen);
    if (chatOpen) {
      setView("chat"); // Always reset to chat view on open
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
      body: JSON.stringify({ messages: chatHistory, session_id: currentSessionId }),
    });

    typing.remove();
    isSending = false;
    updateLockUI();

    if (res.ok && res.data.reply) {
      if (res.data.session_id) {
        currentSessionId = res.data.session_id;
      }
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

  async function loadHistoryList() {
    const container = document.getElementById("chatHistoryContainer");
    if (!container) return;

    container.innerHTML = `<div class="chat-history-empty">Memuat riwayat...</div>`;

    const res = await apiFetch("/chat/history");
    if (!res.ok) {
      container.innerHTML = `<div class="chat-history-empty" style="color: #ef4444;">Gagal memuat riwayat.</div>`;
      return;
    }

    const sessions = res.data.sessions || [];
    if (sessions.length === 0) {
      container.innerHTML = `
        <div class="chat-history-empty">
          <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <p>Belum ada riwayat percakapan.</p>
        </div>`;
      return;
    }

    let html = `
      <button type="button" class="chat-history-clear-all" id="chatClearAllBtn">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
        Hapus Semua Riwayat
      </button>
      <div class="chat-history-list">`;

    sessions.forEach((s) => {
      const dateStr = formatChatDate(s.updated_at || s.created_at);
      html += `
        <div class="chat-history-item" data-session-id="${s.session_id}">
          <div class="chat-history-item-content">
            <div class="chat-history-item-title">${escapeHtml(s.title || "Chat Tanpa Judul")}</div>
            <div class="chat-history-item-time">${dateStr}</div>
          </div>
          <button type="button" class="chat-history-delete-btn" data-session-id="${s.session_id}" title="Hapus sesi ini" aria-label="Hapus">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>`;
    });

    html += `</div>`;
    container.innerHTML = html;

    // Click to open session
    container.querySelectorAll(".chat-history-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        if (e.target.closest(".chat-history-delete-btn")) return;
        const sessionId = item.dataset.sessionId;
        loadSession(sessionId);
      });
    });

    // Delete single session
    container.querySelectorAll(".chat-history-delete-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const sessionId = btn.dataset.sessionId;
        if (confirm("Apakah Anda yakin ingin menghapus riwayat percakapan ini?")) {
          const delRes = await apiFetch(`/chat/history/${sessionId}`, { method: "DELETE" });
          if (delRes.ok) {
            if (currentSessionId === sessionId) {
              currentSessionId = null;
              chatHistory = [];
            }
            loadHistoryList();
          } else {
            alert("Gagal menghapus riwayat.");
          }
        }
      });
    });

    // Clear all history
    document.getElementById("chatClearAllBtn")?.addEventListener("click", async () => {
      if (confirm("Apakah Anda yakin ingin menghapus SEMUA riwayat percakapan Anda? Tindakan ini tidak dapat dibatalkan.")) {
        const delRes = await apiFetch("/chat/history", { method: "DELETE" });
        if (delRes.ok) {
          currentSessionId = null;
          chatHistory = [];
          loadHistoryList();
        } else {
          alert("Gagal menghapus semua riwayat.");
        }
      }
    });
  }

  async function loadSession(sessionId) {
    const box = document.getElementById("chatMessages");
    if (box) {
      box.innerHTML = `<div class="chat-msg chat-msg-bot"><div class="chat-bubble">Memuat percakapan...</div></div>`;
    }

    setView("chat");

    const res = await apiFetch(`/chat/history/${sessionId}`);
    if (res.ok && res.data.session) {
      currentSessionId = sessionId;
      const msgs = res.data.session.messages || [];
      chatHistory = msgs.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      renderMessages();
    } else {
      chatHistory = [];
      renderMessages();
      const errMsg = res.data?.error || "Gagal memuat detail percakapan.";
      const box = document.getElementById("chatMessages");
      if (box) {
        box.innerHTML += `
          <div class="chat-msg chat-msg-bot">
            <div class="chat-bubble" style="color: #ef4444;">Maaf, terjadi kesalahan: ${escapeHtml(errMsg)}</div>
          </div>`;
      }
    }
  }

  function startNewChat() {
    currentSessionId = null;
    chatHistory = [];
    setView("chat");
  }

  function buildChatWidget() {
    if (document.getElementById("sembako-chat-root")) return;

    const root = document.createElement("div");
    root.id = "sembako-chat-root";
    root.innerHTML = `
            <div id="chatPanel" class="chat-panel">
                <div class="chat-header">
                    <div class="chat-header-left">
                        <button type="button" class="chat-back-btn hidden" id="chatBackBtn" aria-label="Kembali">
                           <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                        </button>
                        <div>
                            <strong id="chatPanelTitle">Asisten Sembako</strong>
                            <small id="chatProviderLabel">Powered by AI</small>
                        </div>
                    </div>
                    <div class="chat-header-actions">
                        <button type="button" class="chat-header-btn" id="chatNewBtn" title="Chat Baru" aria-label="Chat Baru">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
                        </button>
                        <button type="button" class="chat-header-btn" id="chatHistoryBtn" title="Riwayat Chat" aria-label="Riwayat Chat">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        </button>
                        <button type="button" class="chat-close-btn" id="chatCloseBtn" aria-label="Tutup">×</button>
                    </div>
                </div>
                <div id="chatMessages" class="chat-messages"></div>
                <div id="chatHistoryContainer" class="chat-history-container hidden"></div>
                <div id="chatLockOverlay" class="chat-lock-overlay">
                    <div class="chat-lock-box">
                        <span class="chat-lock-icon">🔒</span>
                        <p><strong>Login diperlukan</strong></p>
                        <p>Masuk ke akun untuk menggunakan chatbot.</p>
                        <a href="login.html" class="btn-primary chat-lock-btn">Masuk Sekarang</a>
                    </div>
                </div>
                <div id="chatInputRow" class="chat-input-row">
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

    document.getElementById("chatFab")?.addEventListener("click", toggleChatPanel);
    document.getElementById("chatCloseBtn")?.addEventListener("click", toggleChatPanel);
    document.getElementById("chatSendBtn")?.addEventListener("click", sendChatMessage);
    document.getElementById("chatInput")?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") sendChatMessage();
    });

    document.getElementById("chatBackBtn")?.addEventListener("click", () => setView("chat"));
    document.getElementById("chatNewBtn")?.addEventListener("click", startNewChat);
    document.getElementById("chatHistoryBtn")?.addEventListener("click", () => setView("history"));

    setView("chat");
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
