import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchProjects,
  createProject,
  updateProject,
  deleteProject,
  clearProjectError,
} from '../features/projects/projectSlice';
import { fetchUsers } from '../features/auth/authSlice';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { PageLoader, Spinner } from '../components/Spinner';

function MemberSelect({ selectedIds, onChange, users, loading }) {
  const toggleMember = (id) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((m) => m !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-2">
        <Spinner size={14} />
        <span className="text-xs" style={{ color: '#666' }}>Loading members...</span>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <p className="text-xs py-2" style={{ color: '#555' }}>
        No members found. Create members first via the sidebar.
      </p>
    );
  }

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ border: '1px solid #2a2a2a', background: '#1c1c1c', maxHeight: 180, overflowY: 'auto' }}
    >
      {users.map((u) => {
        const selected = selectedIds.includes(u._id);
        return (
          <label
            key={u._id}
            className="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors"
            style={{
              background: selected ? 'rgba(212,160,23,0.07)' : 'transparent',
              borderBottom: '1px solid #252525',
            }}
          >
            <div
              className="flex items-center justify-center rounded flex-shrink-0 transition-all"
              style={{
                width: 16,
                height: 16,
                background: selected ? '#d4a017' : 'transparent',
                border: `2px solid ${selected ? '#d4a017' : '#444'}`,
                borderRadius: 4,
              }}
            >
              {selected && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="3.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
            <input
              type="checkbox"
              className="hidden"
              checked={selected}
              onChange={() => toggleMember(u._id)}
            />
            <div className="min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: '#e0e0e0' }}>{u.username}</p>
              <p className="text-xs truncate" style={{ color: '#555' }}>{u.email}</p>
            </div>
            <span
              className="ml-auto text-xs px-2 py-0.5 rounded-full flex-shrink-0"
              style={{ background: '#222', color: '#666' }}
            >
              {u.role}
            </span>
          </label>
        );
      })}
    </div>
  );
}

function ProjectFormModal({ title, initialData, onSubmit, onClose, loading, error }) {
  const { users, usersLoading } = useSelector((state) => state.auth);

  const getInitialMembers = () => {
    if (!initialData?.members) return [];
    return initialData.members.map((m) => (typeof m === 'object' ? m._id : m));
  };

  const [form, setForm] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
  });
  const [selectedMembers, setSelectedMembers] = useState(getInitialMembers);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, members: selectedMembers });
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
          <label className="label">Project Title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Website Redesign"
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
            placeholder="Brief project description..."
            rows={3}
            className="input-field resize-none"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="label" style={{ marginBottom: 0 }}>Members</label>
            {selectedMembers.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(212,160,23,0.1)', color: '#d4a017' }}>
                {selectedMembers.length} selected
              </span>
            )}
          </div>
          <MemberSelect
            selectedIds={selectedMembers}
            onChange={setSelectedMembers}
            users={users}
            loading={usersLoading}
          />
        </div>
        <div className="flex gap-3 justify-end mt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <><Spinner size={16} /> Saving...</> : 'Save Project'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ProjectCard({ project, isAdmin, onEdit, onDelete }) {
  const navigate = useNavigate();
  const memberCount = project.members?.length || 0;

  return (
    <div
      className="card group cursor-pointer transition-all duration-200"
      style={{ borderColor: '#2a2a2a' }}
      onClick={() => navigate(`/projects/${project._id}`)}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0"
          style={{ background: 'rgba(212,160,23,0.1)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d4a017" strokeWidth="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(project); }}
              className="p-2 rounded-lg transition-colors"
              style={{ color: '#666', background: '#1c1c1c' }}
              title="Edit project"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(project); }}
              className="p-2 rounded-lg transition-colors"
              style={{ color: '#666', background: '#1c1c1c' }}
              title="Delete project"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <h3 className="font-semibold mb-2 leading-snug" style={{ color: '#f0f0f0' }}>{project.title}</h3>
      <p className="text-xs leading-relaxed mb-5 line-clamp-2" style={{ color: '#666' }}>
        {project.description || 'No description provided.'}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="flex -space-x-2">
            {Array.from({ length: Math.min(memberCount, 3) }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold border-2"
                style={{
                  background: `hsl(${(i * 60 + 200) % 360}, 40%, 25%)`,
                  borderColor: '#161616',
                  color: '#a0a0a0',
                }}
              >
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
          <span className="text-xs" style={{ color: '#555' }}>
            {memberCount} member{memberCount !== 1 ? 's' : ''}
          </span>
        </div>
        <span className="text-xs" style={{ color: '#555' }}>
          {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </div>
    </div>
  );
}

function ProjectsPage() {
  const dispatch = useDispatch();
  const { list: projects, loading, mutating, mutationError } = useSelector((state) => state.projects);
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';

  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    dispatch(fetchProjects());
    if (isAdmin) dispatch(fetchUsers());
    return () => dispatch(clearProjectError());
  }, [dispatch, isAdmin]);

  const handleCreate = async (data) => {
    const res = await dispatch(createProject(data));
    if (createProject.fulfilled.match(res)) setShowCreate(false);
  };

  const handleUpdate = async (data) => {
    const res = await dispatch(updateProject({ id: editTarget._id, data }));
    if (updateProject.fulfilled.match(res)) setEditTarget(null);
  };

  const handleDelete = async () => {
    const res = await dispatch(deleteProject(deleteTarget._id));
    if (deleteProject.fulfilled.match(res)) setDeleteTarget(null);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#f5f5f5' }}>Projects</h1>
          <p className="text-sm mt-1" style={{ color: '#666' }}>
            {isAdmin ? 'Manage all projects in your workspace.' : 'Your assigned projects.'}
          </p>
        </div>
        {isAdmin && (
          <button id="create-project-btn" className="btn-primary" onClick={() => setShowCreate(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Project
          </button>
        )}
      </div>

      {loading ? (
        <PageLoader />
      ) : projects.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 text-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#2a2a2a" strokeWidth="1.5" className="mb-4">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          <p className="font-medium" style={{ color: '#444' }}>No projects found</p>
          {isAdmin && (
            <button className="btn-primary mt-4" onClick={() => setShowCreate(true)}>
              Create your first project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              isAdmin={isAdmin}
              onEdit={setEditTarget}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {showCreate && (
        <ProjectFormModal
          title="Create New Project"
          onSubmit={handleCreate}
          onClose={() => { setShowCreate(false); dispatch(clearProjectError()); }}
          loading={mutating}
          error={mutationError}
        />
      )}

      {editTarget && (
        <ProjectFormModal
          title="Edit Project"
          initialData={editTarget}
          onSubmit={handleUpdate}
          onClose={() => { setEditTarget(null); dispatch(clearProjectError()); }}
          loading={mutating}
          error={mutationError}
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

export default ProjectsPage;
