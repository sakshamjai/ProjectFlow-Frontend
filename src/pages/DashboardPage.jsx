import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboard } from '../features/tasks/taskSlice';
import { fetchTasks } from '../features/tasks/taskSlice';
import { PageLoader } from '../components/Spinner';
import { StatusBadge, PriorityBadge } from '../components/Badges';

const STAT_CARDS = [
  {
    key: 'totalTasks',
    label: 'Total Tasks',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    color: '#d4a017',
    bg: 'rgba(212,160,23,0.08)',
  },
  {
    key: 'completedTasks',
    label: 'Completed',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.08)',
  },
  {
    key: 'pendingTasks',
    label: 'Pending',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
  },
  {
    key: 'overdueTasks',
    label: 'Overdue',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.08)',
  },
];

function StatCard({ card, value, loading }) {
  return (
    <div
      className="card flex items-center gap-5 transition-all duration-200"
      style={{ cursor: 'default' }}
    >
      <div
        className="flex items-center justify-center rounded-xl flex-shrink-0"
        style={{ width: 52, height: 52, background: card.bg, color: card.color }}
      >
        {card.icon}
      </div>
      <div>
        <p className="text-sm font-medium mb-1" style={{ color: '#666' }}>{card.label}</p>
        {loading ? (
          <div className="h-8 w-12 rounded animate-pulse" style={{ background: '#1c1c1c' }} />
        ) : (
          <p className="text-3xl font-bold" style={{ color: '#f5f5f5' }}>{value ?? 0}</p>
        )}
      </div>
    </div>
  );
}

function DashboardPage() {
  const dispatch = useDispatch();
  const { dashboard, dashboardLoading, list: tasks, loading: tasksLoading } = useSelector((state) => state.tasks);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchDashboard());
    dispatch(fetchTasks());
  }, [dispatch]);

  const recentTasks = tasks.slice(0, 6);

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#f5f5f5' }}>
          Good morning, <span className="gold-text">{user?.username || 'there'}</span> 👋
        </h1>
        <p className="text-sm" style={{ color: '#666' }}>Here's what's happening across your projects today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
        {STAT_CARDS.map((card) => (
          <StatCard
            key={card.key}
            card={card}
            value={dashboard?.[card.key]}
            loading={dashboardLoading}
          />
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold" style={{ color: '#f5f5f5' }}>Recent Tasks</h2>
          <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(212,160,23,0.1)', color: '#d4a017' }}>
            {tasks.length} total
          </span>
        </div>

        {tasksLoading ? (
          <PageLoader />
        ) : recentTasks.length === 0 ? (
          <div
            className="card flex flex-col items-center justify-center py-16 text-center"
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5" className="mb-4">
              <polyline points="9 11 12 14 22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
            <p className="font-medium" style={{ color: '#444' }}>No tasks yet</p>
            <p className="text-sm mt-1" style={{ color: '#333' }}>Tasks will appear here once created.</p>
          </div>
        ) : (
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid #1e1e1e' }}>
                    {['Task', 'Project', 'Status', 'Priority', 'Due Date'].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold" style={{ color: '#555' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentTasks.map((task, idx) => (
                    <tr
                      key={task._id}
                      style={{
                        borderBottom: idx < recentTasks.length - 1 ? '1px solid #161616' : 'none',
                      }}
                    >
                      <td className="px-5 py-3.5">
                        <p className="font-medium truncate max-w-xs" style={{ color: '#e5e5e5' }}>{task.title}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs" style={{ color: '#666' }}>
                          {task.project?.title || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={task.status} />
                      </td>
                      <td className="px-5 py-3.5">
                        <PriorityBadge priority={task.priority} />
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs" style={{ color: '#666' }}>
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
