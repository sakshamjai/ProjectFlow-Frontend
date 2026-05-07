import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  clearTaskError,
} from '../features/tasks/taskSlice';
import { fetchProjects } from '../features/projects/projectSlice';
import { fetchUsers } from '../features/auth/authSlice';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { PageLoader, Spinner } from '../components/Spinner';
import { StatusBadge, PriorityBadge } from '../components/Badges';

const STATUS_OPTIONS = ['todo', 'in-progress', 'done'];
const PRIORITY_OPTIONS = ['low', 'medium', 'high'];

function TaskFormModal({ title, initialData, projects, users, usersLoading, onSubmit, onClose, loading, error }) {
  const [form, setForm] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    status: initialData?.status || 'todo',
    priority: initialData?.priority || 'medium',
    dueDate: initialData?.dueDate ? initialData.dueDate.substring(0, 10) : '',
    project: initialData?.project?._id || initialData?.project || '',
    assignedTo: initialData?.assignedTo?._id || initialData?.assignedTo || '',
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Modal title={title} onClose={onClose}>
      {error && (
        <div
          className="px-4 py-3 rounded-lg mb-4 text-sm"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}
        >
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="label">Task Title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Design landing page"
            className="input-field"
            required
          />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Task details..."
            rows={2}
            className="input-field resize-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Status</label>
            <select name="status" value={form.status} onChange={handleChange} className="input-field">
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s === 'in-progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Priority</label>
            <select name="priority" value={form.priority} onChange={handleChange} className="input-field">
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="label">Due Date</label>
          <input
            name="dueDate"
            type="date"
            value={form.dueDate}
            onChange={handleChange}
            className="input-field"
          />
        </div>
        <div>
          <label className="label">Project</label>
          <select name="project" value={form.project} onChange={handleChange} className="input-field" required>
            <option value="">Select a project...</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>{p.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Assign To</label>
          <select name="assignedTo" value={form.assignedTo} onChange={handleChange} className="input-field" required>
            <option value="">
              {usersLoading ? 'Loading members...' : 'Select a member...'}
            </option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.username} — {u.email}
              </option>
            ))}
          </select>
          {users.length === 0 && !usersLoading && (
            <p className="text-xs mt-1.5" style={{ color: '#555' }}>
              No members found. Create members first via the sidebar.
            </p>
          )}
        </div>
        <div className="flex gap-3 justify-end mt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <><Spinner size={16} /> Saving...</> : 'Save Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function StatusUpdateModal({ task, onSubmit, onClose, loading }) {
  const [status, setStatus] = useState(task.status);
  return (
    <Modal title="Update Task Status" onClose={onClose}>
      <div className="mb-5">
        <p className="text-sm font-medium mb-3 truncate" style={{ color: '#a0a0a0' }}>{task.title}</p>
        <div className="flex flex-col gap-2">
          {STATUS_OPTIONS.map((s) => (
            <label
              key={s}
              className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all"
              style={{
                background: status === s ? 'rgba(212,160,23,0.08)' : '#1c1c1c',
                border: `1px solid ${status === s ? '#d4a017' : '#2a2a2a'}`,
              }}
            >
              <input
                type="radio"
                name="status"
                value={s}
                checked={status === s}
                onChange={() => setStatus(s)}
                className="accent-yellow-600"
              />
              <StatusBadge status={s} />
            </label>
          ))}
        </div>
      </div>
      <div className="flex gap-3 justify-end">
        <button className="btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn-primary" onClick={() => onSubmit(status)} disabled={loading}>
          {loading ? <><Spinner size={16} /> Updating...</> : 'Update Status'}
        </button>
      </div>
    </Modal>
  );
}

function TasksPage() {
  const dispatch = useDispatch();
  const { list: tasks, loading, mutating, mutationError } = useSelector((state) => state.tasks);
  const { list: projects } = useSelector((state) => state.projects);
  const { user, users, usersLoading } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';

  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    dispatch(fetchTasks());
    dispatch(fetchProjects());
    if (isAdmin) dispatch(fetchUsers());
    return () => dispatch(clearTaskError());
  }, [dispatch, isAdmin]);

  const handleCreate = async (data) => {
    const res = await dispatch(createTask(data));
    if (createTask.fulfilled.match(res)) setShowCreate(false);
  };

  const handleUpdate = async (data) => {
    const res = await dispatch(updateTask({ id: editTarget._id, data }));
    if (updateTask.fulfilled.match(res)) setEditTarget(null);
  };

  const handleStatusUpdate = async (status) => {
    const res = await dispatch(updateTask({ id: statusTarget._id, data: { status } }));
    if (updateTask.fulfilled.match(res)) setStatusTarget(null);
  };

  const handleDelete = async () => {
    const res = await dispatch(deleteTask(deleteTarget._id));
    if (deleteTask.fulfilled.match(res)) setDeleteTarget(null);
  };

  const filtered = filterStatus === 'all' ? tasks : tasks.filter((t) => t.status === filterStatus);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#f5f5f5' }}>Tasks</h1>
          <p className="text-sm mt-1" style={{ color: '#666' }}>
            {isAdmin ? 'Manage all tasks across projects.' : 'Your assigned tasks.'}
          </p>
        </div>
        {isAdmin && (
          <button id="create-task-btn" className="btn-primary" onClick={() => setShowCreate(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Task
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {['all', ...STATUS_OPTIONS].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className="px-4 py-2 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: filterStatus === s ? 'rgba(212,160,23,0.12)' : '#161616',
              color: filterStatus === s ? '#d4a017' : '#666',
              border: `1px solid ${filterStatus === s ? '#d4a017' : '#2a2a2a'}`,
            }}
          >
            {s === 'all' ? 'All' : s === 'in-progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
            <span
              className="ml-2 px-1.5 py-0.5 rounded text-xs"
              style={{ background: filterStatus === s ? 'rgba(212,160,23,0.2)' : '#1c1c1c' }}
            >
              {s === 'all' ? tasks.length : tasks.filter((t) => t.status === s).length}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <PageLoader />
      ) : filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 text-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#2a2a2a" strokeWidth="1.5" className="mb-4">
            <polyline points="9 11 12 14 22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
          <p className="font-medium" style={{ color: '#444' }}>No tasks found</p>
          {isAdmin && filterStatus === 'all' && (
            <button className="btn-primary mt-4" onClick={() => setShowCreate(true)}>
              Create your first task
            </button>
          )}
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid #1e1e1e' }}>
                  {['Task', 'Project', 'Assigned To', 'Status', 'Priority', 'Due Date', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold" style={{ color: '#555' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((task, idx) => (
                  <tr
                    key={task._id}
                    style={{ borderBottom: idx < filtered.length - 1 ? '1px solid #161616' : 'none' }}
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium max-w-xs truncate" style={{ color: '#e5e5e5' }}>{task.title}</p>
                      {task.description && (
                        <p className="text-xs mt-0.5 max-w-xs truncate" style={{ color: '#555' }}>{task.description}</p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs" style={{ color: '#666' }}>{task.project?.title || '—'}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs" style={{ color: '#666' }}>
                        {task.assignedTo?.username || task.assignedTo?.email || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-4"><StatusBadge status={task.status} /></td>
                    <td className="px-5 py-4"><PriorityBadge priority={task.priority} /></td>
                    <td className="px-5 py-4">
                      <span className="text-xs" style={{ color: '#666' }}>
                        {task.dueDate
                          ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : '—'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setStatusTarget(task)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
                          style={{ background: '#1c1c1c', color: '#a0a0a0', border: '1px solid #2a2a2a' }}
                          title="Update status"
                        >
                          Status
                        </button>
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => setEditTarget(task)}
                              className="p-1.5 rounded-lg transition-colors"
                              style={{ color: '#666', background: '#1c1c1c' }}
                              title="Edit task"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setDeleteTarget(task)}
                              className="p-1.5 rounded-lg transition-colors"
                              style={{ color: '#ef4444', background: '#1c1c1c' }}
                              title="Delete task"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                <path d="M10 11v6M14 11v6" />
                                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showCreate && (
        <TaskFormModal
          title="Create New Task"
          projects={projects}
          users={users}
          usersLoading={usersLoading}
          onSubmit={handleCreate}
          onClose={() => { setShowCreate(false); dispatch(clearTaskError()); }}
          loading={mutating}
          error={mutationError}
        />
      )}

      {editTarget && (
        <TaskFormModal
          title="Edit Task"
          initialData={editTarget}
          projects={projects}
          users={users}
          usersLoading={usersLoading}
          onSubmit={handleUpdate}
          onClose={() => { setEditTarget(null); dispatch(clearTaskError()); }}
          loading={mutating}
          error={mutationError}
        />
      )}

      {statusTarget && (
        <StatusUpdateModal
          task={statusTarget}
          onSubmit={handleStatusUpdate}
          onClose={() => setStatusTarget(null)}
          loading={mutating}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`Delete "${deleteTarget.title}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={mutating}
        />
      )}
    </div>
  );
}

export default TasksPage;
