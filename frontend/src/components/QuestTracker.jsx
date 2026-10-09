export default function QuestTracker({
  quests,
  activeTaskId,
  completedTasks = [],
  cluesFound = []
}) {
  const activeTask = quests.tasks.find((t) => t.id === activeTaskId) || quests.tasks[0];

  return (
    <aside className="quest-tracker-widget" aria-label="Current Mission Objective">
      <div className="quest-card-header">
        <span className="quest-tag">CURRENT OBJECTIVE</span>
        <span className="quest-chapter-pill">{quests.chapter.split(":")[0]}</span>
      </div>

      <div className="quest-body">
        <div className="quest-task-headline">
          <span className="quest-bullet">◈</span>
          <h3 className="quest-task-title">{activeTask.title}</h3>
        </div>
        <p className="quest-task-desc">{activeTask.desc}</p>
      </div>

      <div className="quest-footer">
        <div className="clues-counter">
          <span className="clues-title">CLUES</span>
          <span className="clues-val">{cluesFound.length}/5</span>
        </div>
        <div className="progress-counter">
          <span className="progress-title">TASKS</span>
          <span className="progress-val">{completedTasks.length}/{quests.tasks.length}</span>
        </div>
      </div>
    </aside>
  );
}
