function DialogueBox({ messages }) {
  return (
    <div className="dialogue-box">
      {messages.slice(-6).map((message, index) => (
        <div
          key={index}
          className={
            message.speaker === "Player"
              ? "dialogue-message player-message"
              : "dialogue-message npc-message"
          }
        >
          <div className="message-speaker">
            {message.speaker === "Player"
              ? "YOU"
              : message.speaker.toUpperCase()}
          </div>

          <p>{message.message}</p>
        </div>
      ))}
    </div>
  );
}

export default DialogueBox;