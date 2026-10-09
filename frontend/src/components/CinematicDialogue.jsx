import { useState, useEffect, useRef } from "react";
import { sounds } from "../game/audio";

export default function CinematicDialogue({
  npc,
  messages = [],
  trust = 50,
  relationship = "Neutral",
  suggestedChoices = [],
  loading = false,
  onSendMessage,
  onClose
}) {
  const [inputText, setInputText] = useState("");
  const [displayedMessage, setDisplayedMessage] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-focus input on open
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, displayedMessage]);

  // Typewriter effect for latest NPC message
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];

    if (lastMsg.speaker !== "Player") {
      let index = 0;
      setDisplayedMessage("");
      const fullText = lastMsg.message;

      const interval = setInterval(() => {
        index += 1;
        setDisplayedMessage(fullText.slice(0, index));
        if (index % 4 === 0) {
          sounds.playTypewriter();
        }

        if (index >= fullText.length) {
          clearInterval(interval);
        }
      }, 14);

      return () => clearInterval(interval);
    } else {
      setDisplayedMessage("");
    }
  }, [messages]);

  // Keyboard shortcut: ESC to close
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;
    sounds.playClick();
    onSendMessage(inputText.trim());
    setInputText("");
  };

  const handleChoiceClick = (choice) => {
    if (loading) return;
    sounds.playClick();
    onSendMessage(choice);
  };

  // Trust color styling
  let trustColor = "#22c55e"; // Green
  if (trust < 20) trustColor = "#ef4444"; // Red
  else if (trust < 50) trustColor = "#f59e0b"; // Amber

  return (
    <div className="dialogue-backdrop">
      <div className="dialogue-cinematic-modal">
        {/* Modal Top Bar */}
        <div className="dialogue-top-bar">
          <div className="cinematic-title-group">
            <span className="comm-pulse-dot" />
            <span className="comm-label">COMM LINK ACTIVE // ENCRYPTED</span>
          </div>

          <button
            className="dialogue-exit-btn"
            onClick={onClose}
            title="Press ESC to walk away"
          >
            <span>[ESC] WALK AWAY</span>
            <span className="exit-icon">✕</span>
          </button>
        </div>

        <div className="dialogue-stage-split">
          {/* LEFT: NPC Character Dossier Card */}
          <aside className="npc-dossier-panel">
            <div
              className="dossier-avatar-frame"
              style={{ borderColor: npc.color }}
            >
              <div
                className="dossier-glow"
                style={{ background: `radial-gradient(circle, ${npc.color}33, transparent)` }}
              />
              <span className="dossier-avatar-symbol">{npc.avatar}</span>
            </div>

            <div className="dossier-info">
              <span
                className={`dossier-align-badge ${npc.alignment.toLowerCase()}`}
              >
                {npc.badge || npc.alignment.toUpperCase()}
              </span>
              <h2 className="dossier-name">{npc.name}</h2>
              <p className="dossier-role">{npc.role}</p>
              <span className="dossier-zone">📍 {npc.zone}</span>
            </div>

            <div className="dossier-stats-box">
              <div className="stat-row">
                <span className="stat-label">RELATIONSHIP</span>
                <span className={`stat-val status-${relationship.toLowerCase()}`}>
                  {relationship}
                </span>
              </div>

              <div className="stat-row">
                <span className="stat-label">TRUST LEVEL</span>
                <span className="stat-val" style={{ color: trustColor }}>
                  {trust}%
                </span>
              </div>

              <div className="trust-meter-track">
                <div
                  className="trust-meter-fill"
                  style={{
                    width: `${trust}%`,
                    backgroundColor: trustColor
                  }}
                />
              </div>
            </div>

            <div className="dossier-lore">
              <p>{npc.lore}</p>
            </div>
          </aside>

          {/* RIGHT: Dialogue Stream & Interaction Deck */}
          <section className="dialogue-deck-panel">
            {/* Message Stream */}
            <div className="dialogue-stream-scroll">
              {messages.map((msg, idx) => {
                const isLast = idx === messages.length - 1;
                const isPlayer = msg.speaker === "Player";
                const isTypewriting = isLast && !isPlayer && displayedMessage.length > 0;

                return (
                  <div
                    key={idx}
                    className={`dialogue-bubble-row ${isPlayer ? "player-row" : "npc-row"}`}
                  >
                    <div className="bubble-speaker-header">
                      <span className="speaker-tag">
                        {isPlayer ? "🕷️ YOU (THE HERO)" : `${npc.avatar} ${npc.name.toUpperCase()}`}
                      </span>
                    </div>
                    <div className="bubble-content">
                      <p>{isTypewriting ? displayedMessage : msg.message}</p>
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className="dialogue-thinking-bubble">
                  <div className="thinking-pulser" style={{ borderColor: npc.color }} />
                  <span>{npc.name} is assessing your words...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Contextual Choices Deck */}
            {suggestedChoices.length > 0 && !loading && (
              <div className="quick-choices-deck">
                <span className="choices-deck-label">SUGGESTED RESPONSES</span>
                <div className="choices-pill-row">
                  {suggestedChoices.map((choice, i) => (
                    <button
                      key={i}
                      className="quick-choice-pill"
                      onClick={() => handleChoiceClick(choice)}
                      disabled={loading}
                    >
                      <span className="choice-number">{i + 1}</span>
                      <span className="choice-text">{choice}</span>
                      <span className="choice-arrow">›</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Freeform Question / Input Deck */}
            <form className="dialogue-input-deck" onSubmit={handleSubmit}>
              <div className="input-glow-wrapper">
                <input
                  ref={inputRef}
                  type="text"
                  className="dialogue-text-input"
                  placeholder={`Speak or ask anything to ${npc.name}...`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="submit"
                  className="dialogue-send-btn"
                  disabled={!inputText.trim() || loading}
                >
                  TRANSMIT ↵
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
