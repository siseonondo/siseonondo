import { TASK_BUCKETS } from '../data/mockData'

function TaskCard({ task, onToggleTask, onSetDate, onNoteChange }) {
  return (
    <div className="task-detail-card">
      <div className="task-detail-top">
        <span
          className={`checkbox${task.done ? ' checked' : ''}`}
          onClick={() => onToggleTask(task.id)}
        >
          {task.done && '✓'}
        </span>
        <span className={`task-title${task.done ? ' done' : ''}`}>{task.title}</span>
      </div>
      <div className="task-detail-meta-row">
        {task.dateLabel && <span className="meta-mono">{task.dateLabel}</span>}
        <input
          type="date"
          className="task-date-input"
          value={task.date || ''}
          onChange={(e) => onSetDate(task.id, e.target.value)}
        />
      </div>
      <input
        className="task-note-input"
        placeholder="메모"
        defaultValue={task.note || ''}
        onBlur={(e) => onNoteChange(task.id, e.target.value)}
      />
    </div>
  )
}

export default function TasksPage({ tasks, onToggleTask, onSetDate, onNoteChange }) {
  const columns = TASK_BUCKETS.map((b) => ({
    ...b,
    items: tasks.filter((t) => t.bucket === b.key && !t.done),
  }))
  const done = tasks.filter((t) => t.done)

  return (
    <div className="tasks-grid">
      {columns.map((col) => (
        <div className="task-column" key={col.key}>
          <div className="task-column-head">
            <span className="section-title">{col.label}</span>
            <span className="section-meta">{col.items.length}</span>
          </div>
          {col.items.map((t) => (
            <TaskCard
              key={t.id}
              task={t}
              onToggleTask={onToggleTask}
              onSetDate={onSetDate}
              onNoteChange={onNoteChange}
            />
          ))}
          <div className="task-add">＋ 태스크 추가</div>
        </div>
      ))}

      <div className="task-column-group">
        <div className="task-column">
          <div className="task-column-head">
            <span className="section-title">완료 · {done.length}</span>
          </div>
          {done.map((t) => (
            <div className="task-done-card" key={t.id}>
              <span className="checkbox checked" onClick={() => onToggleTask(t.id)}>
                ✓
              </span>
              <span className="task-title done">{t.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
