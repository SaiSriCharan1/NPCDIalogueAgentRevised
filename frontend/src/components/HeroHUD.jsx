export default function HeroHUD({
  currentLocation = "Queens Midtown Central Plaza",
  focus = 100,
  health = 100
}) {
  return (
    <header className="hero-hud">
      <div className="hero-status-card">
        <div className="hero-emblem">
          <div className="spider-emblem-core">🕷️</div>
        </div>

        <div className="hero-bars">
          <div className="hero-identity">
            <span className="hero-title">THE SPIDER VIGILANTE</span>
            <span className="hero-sector">{currentLocation}</span>
          </div>

          <div className="meter-group">
            <div className="meter-row">
              <span className="meter-label">SUIT</span>
              <div className="meter-bar suit-bar">
                <div
                  className="meter-fill suit-fill"
                  style={{ width: `${health}%` }}
                />
              </div>
              <span className="meter-val">{health}%</span>
            </div>

            <div className="meter-row">
              <span className="meter-label">FOCUS</span>
              <div className="meter-bar focus-bar">
                <div
                  className="meter-fill focus-fill"
                  style={{ width: `${focus}%` }}
                />
              </div>
              <span className="meter-val">{focus}%</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
