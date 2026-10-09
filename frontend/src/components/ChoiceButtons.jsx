function ChoiceButtons({ choices, onChoice, disabled }) {
  return (
    <div className="choice-buttons">
      {choices.map((choice, index) => (
        <button
          key={index}
          onClick={() => onChoice(choice)}
          disabled={disabled}
          className="choice-button"
        >
          <span className="choice-number">
            {String(index + 1).padStart(2, "0")}
          </span>

          <span className="choice-text">
            {choice}
          </span>

          <span className="choice-arrow">›</span>
        </button>
      ))}
    </div>
  );
}

export default ChoiceButtons;