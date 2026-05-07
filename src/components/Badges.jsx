function StatusBadge({ status }) {
  const map = {
    todo: { label: 'To Do', cls: 'badge-todo' },
    'in-progress': { label: 'In Progress', cls: 'badge-in-progress' },
    done: { label: 'Done', cls: 'badge-done' },
  };
  const { label, cls } = map[status] || { label: status, cls: 'badge-todo' };
  return <span className={`badge ${cls}`}>{label}</span>;
}

function PriorityBadge({ priority }) {
  const map = {
    high: { label: 'High', cls: 'badge-high' },
    medium: { label: 'Medium', cls: 'badge-medium' },
    low: { label: 'Low', cls: 'badge-low' },
  };
  const { label, cls } = map[priority] || { label: priority, cls: 'badge-medium' };
  return <span className={`badge ${cls}`}>{label}</span>;
}

export { StatusBadge, PriorityBadge };
