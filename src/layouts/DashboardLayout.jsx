import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Each role gets a different sidebar menu.
const navItems = {
  job_seeker: [
    ['Overview', '/job-seeker'],
    ['Profile', '/job-seeker/profile'],
    ['Applications', '/job-seeker/applications'],
    ['Interviews', '/job-seeker/interviews'],
    ['Job Alerts', '/job-seeker/alerts'],
    ['Browse Jobs', '/jobs']
  ],
  employer: [
    ['Overview', '/employer'],
    ['Company Profile', '/employer/profile'],
    ['Post Job', '/employer/jobs/new'],
    ['My Jobs', '/employer/jobs']
  ],
  admin: [
    ['Overview', '/admin'],
    ['Users', '/admin/users'],
    ['Jobs', '/admin/jobs'],
    ['Applications', '/admin/applications']
  ]
};

const DashboardLayout = () => {
  const { user } = useAuth();
  // ProtectedRoute guarantees a user exists before this layout renders.
  const items = navItems[user.role] || [];

  return (
    <main className="dashboard-shell">
      <div className="container py-4">
        <div className="row g-4">
          <aside className="col-lg-3">
            <div className="list-group dashboard-nav">
              {items.map(([label, to]) => (
                // NavLink automatically adds an active class when the URL matches.
                <NavLink key={to} className="list-group-item list-group-item-action" to={to} end>
                  {label}
                </NavLink>
              ))}
            </div>
          </aside>
          <section className="col-lg-9">
            <Outlet />
          </section>
        </div>
      </div>
    </main>
  );
};

export default DashboardLayout;
