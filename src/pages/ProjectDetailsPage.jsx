import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjectById, clearSelectedProject } from '../features/projects/projectSlice';
import { fetchTasksByProject, clearProjectTasks } from '../features/tasks/taskSlice';
import { PageLoader } from '../components/Spinner';
import { StatusBadge, PriorityBadge } from '../components/Badges';

function ProjectDetailsPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { selected: project, selectedLoading, error } = useSelector((state) => state.projects);
  const { projectTasks, projectTasksLoading } = useSelector((state) => state.tasks);

  useEffect(() => {
    dispatch(fetchProjectById(id));
    dispatch(fetchTasksByProject(id));
    return () => {
      dispatch(clearSelectedProject());
      dispatch(clearProjectTasks());
    };
  }, [id, dispatch]);

  if (selectedLoading) return <PageLoader />;

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="font-semibold mb-3" style={{ color: '#ef4444' }}>{error || 'Project not found'}</p>
        <button className="btn-secondary" onClick={() => navigate('/projects')}>← Back to Projects</button>
      </div>
    );
  }

  const taskStats = {
    todo: projectTasks.filter((t) => t.status === 'todo').length,
    'in-progress': projectTasks.filter((t) => t.status === 'in-progress').length,
    done: projectTasks.filter((t) => t.status === 'done').length,
  };

  const completionPct = projectTasks.length > 0
    ? Math.round((taskStats.done / projectTasks.length) * 100)
    : 0;

  return (
    <div className="animate-fade-in max-w-5xl">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/projects')}
          className="flex items-center gap-2 text-sm transition-colors"
          style={{ color: '#666' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Projects
        </button>
        <span style={{ color: '#333' }}>/</span>
        <span className="text-sm font-medium" style={{ color: '#a0a0a0' }}>{project.title}</span>
      </div>

      <div className="card mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: '#f5f5f5' }}>{project.title}</h1>
            <p className="text-sm leading-relaxed max-w-2xl" style={{ color: '#666' }}>
              {project.description || 'No description provided.'}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-xs" style={{ color: '#555' }}>Created by</span>
            <span className="text-sm font-medium" style={{ color: '#a0a0a0' }}>
              {project.createdBy?.username || project.createdBy?.email || 'Unknown'}
            </span>
          </div>
        </div>

        <div className="mt-6 pt-5" style={{ borderTop: '1px solid #1e1e1e' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium" style={{ color: '#666' }}>Completion</span>
            <span className="text-xs font-bold" style={{ color: '#d4a017' }}>{completionPct}%</span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: '#1e1e1e' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${completionPct}%`, background: 'linear-gradient(90deg, #a07810, #d4a017)' }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold" style={{ color: '#f5f5f5' }}>Tasks</h2>
            <div className="flex items-center gap-3">
              {Object.entries(taskStats).map(([status, count]) => (
                <div key={status} className="flex items-center gap-1.5">
                  <StatusBadge status={status} />
                  <span className="text-xs font-bold" style={{ color: '#555' }}>{count}</span>
                </div>
              ))}
            </div>
          </div>

          {projectTasksLoading ? (
            <PageLoader />
          ) : projectTasks.length === 0 ? (
            <div className="card flex flex-col items-center justify-center py-12 text-center">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2a2a2a" strokeWidth="1.5" className="mb-3">
                <polyline points="9 11 12 14 22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
              <p style={{ color: '#444' }} className="text-sm font-medium">No tasks in this project</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {projectTasks.map((task) => (
                <div key={task._id} className="card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-sm mb-1 truncate" style={{ color: '#e5e5e5' }}>{task.title}</h3>
                      {task.description && (
                        <p className="text-xs leading-relaxed line-clamp-2" style={{ color: '#555' }}>{task.description}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5 flex-shrink-0 items-end">
                      <StatusBadge status={task.status} />
                      <PriorityBadge priority={task.priority} />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3 pt-3" style={{ borderTop: '1px solid #1a1a1a' }}>
                    <span className="text-xs" style={{ color: '#555' }}>
                      Assigned: <span style={{ color: '#a0a0a0' }}>{task.assignedTo?.username || task.assignedTo?.email || '—'}</span>
                    </span>
                    {task.dueDate && (
                      <span className="text-xs" style={{ color: '#555' }}>
                        Due: <span style={{ color: '#a0a0a0' }}>{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-base font-semibold mb-4" style={{ color: '#f5f5f5' }}>Members</h2>
          <div className="card p-0 overflow-hidden">
            {project.members?.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-sm" style={{ color: '#444' }}>No members assigned.</p>
              </div>
            ) : (
              <div>
                {project.members?.map((member, i) => {
                  const m = typeof member === 'object' ? member : { _id: member };
                  return (
                    <div
                      key={m._id || i}
                      className="flex items-center gap-3 px-5 py-3.5"
                      style={{ borderBottom: i < project.members.length - 1 ? '1px solid #1a1a1a' : 'none' }}
                    >
                      <div
                        className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold flex-shrink-0"
                        style={{ background: `hsl(${(i * 80 + 200) % 360}, 30%, 20%)`, color: '#a0a0a0' }}
                      >
                        {(m.username || m.email || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: '#e0e0e0' }}>{m.username || 'Member'}</p>
                        <p className="text-xs truncate" style={{ color: '#555' }}>{m.email || ''}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectDetailsPage;
