import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Loading from '../components/Loading';
import StatusBadge from '../components/StatusBadge';
import MatchList from '../components/MatchList';

const JobSeekerDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recs, setRecs] = useState({ loading: true, error: '', items: [], hasSkills: true });

  useEffect(() => {
    // Dashboard stats are calculated from the user's own applications.
    api
      .get('/applications/my-applications')
      .then((res) => setApplications(res.data.applications))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // Recommendations come from the profile skills/location, ranked by the explainable match score.
    api
      .get('/alerts/match/recommendations?limit=5')
      .then((res) => setRecs({ loading: false, error: '', items: res.data.recommendations, hasSkills: res.data.profile_has_skills }))
      .catch((err) => setRecs({ loading: false, error: err.response?.data?.message || 'Could not load recommendations', items: [], hasSkills: true }));
  }, []);

  // Count applications by status for the summary cards.
  const counts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 mb-0">Job Seeker Dashboard</h1>
        <Link className="btn btn-primary" to="/jobs">
          Browse Jobs
        </Link>
      </div>
      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="row g-3 mb-4">
            {['Pending', 'Shortlisted', 'Rejected', 'Hired'].map((status) => (
              <div className="col-6 col-xl-3" key={status}>
                <div className="stat-card">
                  <span>{status}</span>
                  <strong>{counts[status] || 0}</strong>
                </div>
              </div>
            ))}
          </div>
          <div className="card mb-4">
            <div className="card-header bg-white fw-semibold d-flex justify-content-between">
              Recommended for you <Link to="/job-seeker/alerts" className="small fw-normal">Manage alerts</Link>
            </div>
            {recs.loading && <Loading label="Finding matches..." />}
            {recs.error && <div className="p-3 text-danger">{recs.error}</div>}
            {!recs.loading && !recs.hasSkills && (
              <div className="p-3 text-secondary">Add your skills in <Link to="/job-seeker/profile">your profile</Link> to get recommendations.</div>
            )}
            {!recs.loading && recs.hasSkills && !recs.error && !recs.items.length && (
              <div className="p-3 text-secondary">No recommendations right now. New open jobs will appear here.</div>
            )}
            {recs.items.length > 0 && <MatchList items={recs.items} />}
          </div>
          <div className="card">
            <div className="card-header bg-white fw-semibold">Recent Applications</div>
            <div className="table-responsive">
              <table className="table mb-0 align-middle">
                <tbody>
                  {applications.slice(0, 5).map((app) => (
                    <tr key={app.id}>
                      <td>{app.job_title}</td>
                      <td>{app.company_name}</td>
                      <td><StatusBadge status={app.status} /></td>
                    </tr>
                  ))}
                  {!applications.length && (
                    <tr><td className="text-secondary">No applications submitted yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default JobSeekerDashboard;
