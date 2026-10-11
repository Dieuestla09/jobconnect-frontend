import { Fragment, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import api, { uploadUrl } from '../services/api';
import AlertMessage from '../components/AlertMessage';
import Loading from '../components/Loading';
import StatusBadge from '../components/StatusBadge';
import InterviewPanel from '../components/InterviewPanel';
import ScorecardPanel, { recommendationClass } from '../components/ScorecardPanel';
import { interviewStatusClass } from './MyInterviews';

const ViewApplicants = () => {
  const { id } = useParams();
  const [applications, setApplications] = useState([]);
  const [scorecards, setScorecards] = useState({}); // keyed by application id
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [ranked, setRanked] = useState(false);
  const [open, setOpen] = useState(null); // { id, type: 'interview' | 'scorecard' }

  const loadApplications = () => {
    // The backend checks that this employer owns the job (403 otherwise).
    // Scorecards and interviews are extra data: if they fail, the original applicant list still shows.
    Promise.all([
      api.get(`/applications/job/${id}`),
      api.get(`/scorecards/job/${id}`).catch(() => null),
      api.get(`/interviews?job_id=${id}`).catch(() => null)
    ])
      .then(([apps, cards, ints]) => {
        setApplications(apps.data.applications);
        setScorecards(Object.fromEntries((cards?.data.scorecards || []).map((card) => [card.application_id, card])));
        setInterviews(ints?.data.interviews || []);
      })
      .catch((err) => setError(err.response?.data?.message || 'Could not load applicants'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadApplications();
  }, [id]);

  const updateStatus = async (applicationId, status) => {
    // Employers update candidates through the controlled status list.
    setMessage('');
    setError('');
    try {
      await api.put(`/applications/${applicationId}/status`, { status });
      setMessage('Application status updated');
      loadApplications();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update status');
    }
  };

  // "Rank by scorecard": best overall first, applicants without a scorecard last (original order kept).
  const rows = useMemo(() => {
    if (!ranked) return applications;
    const overall = (app) => (scorecards[app.id] ? Number(scorecards[app.id].overall) : -1);
    return [...applications].sort((a, b) => overall(b) - overall(a));
  }, [applications, scorecards, ranked]);

  const toggle = (applicationId, type) =>
    setOpen((current) => (current && current.id === applicationId && current.type === type ? null : { id: applicationId, type }));

  const done = (text) => {
    setMessage(text);
    setError('');
    loadApplications();
  };

  if (loading) return <Loading />;

  return (
    <div className="card">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <h1 className="h3 mb-0">Applicants</h1>
          <div className="form-check form-switch">
            <input className="form-check-input" type="checkbox" role="switch" id="rankSwitch" checked={ranked} onChange={(e) => setRanked(e.target.checked)} />
            <label className="form-check-label" htmlFor="rankSwitch">Rank by scorecard</label>
          </div>
        </div>
        <AlertMessage type="success" message={message} />
        <AlertMessage message={error} />
        <div className="table-responsive">
          <table className="table align-middle applicants-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Skills</th>
                <th>CV</th>
                <th>Status</th>
                <th>Review</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((app) => {
                const card = scorecards[app.id];
                const appInterviews = interviews.filter((i) => i.application_id === app.id);
                const latest = appInterviews[0];
                return (
                  <Fragment key={app.id}>
                    <tr>
                      <td>
                        <strong>{app.job_seeker_name}</strong>
                        <div className="small text-secondary">{app.experience_level}</div>
                        <div className="small">{app.job_seeker_email}</div>
                        <div className="small text-secondary">{app.phone}</div>
                      </td>
                      <td className="table-text">{app.skills}</td>
                      <td><a href={uploadUrl(app.cv_file)} target="_blank" rel="noreferrer">View CV</a></td>
                      <td><StatusBadge status={app.status} /></td>
                      <td style={{ minWidth: 170 }}>
                        {card ? (
                          <div className="mb-1">
                            <strong>{card.overall}</strong>/5{' '}
                            <span className={`badge text-bg-${recommendationClass[card.recommendation]}`}>{card.recommendation}</span>
                          </div>
                        ) : (
                          <div className="small text-secondary mb-1">No scorecard</div>
                        )}
                        {latest && <div className="mb-1"><span className={`badge text-bg-${interviewStatusClass[latest.status]}`}>Interview {latest.status.toLowerCase()}</span></div>}
                        <div className="d-flex flex-wrap gap-1">
                          <button className="btn btn-sm btn-outline-primary" onClick={() => toggle(app.id, 'scorecard')}>Scorecard</button>
                          <button className="btn btn-sm btn-outline-primary" onClick={() => toggle(app.id, 'interview')}>Interview</button>
                        </div>
                      </td>
                      <td>
                        <select className="form-select form-select-sm" value={app.status} onChange={(e) => updateStatus(app.id, e.target.value)}>
                          <option>Pending</option>
                          <option>Shortlisted</option>
                          <option>Rejected</option>
                          <option>Hired</option>
                        </select>
                      </td>
                    </tr>
                    {open && open.id === app.id && (
                      <tr className="table-light">
                        <td colSpan="6">
                          {open.type === 'scorecard' ? (
                            <ScorecardPanel key={`${app.id}-${card?.updated_at}`} application={app} scorecard={card} onSaved={done} />
                          ) : (
                            <InterviewPanel application={app} interviews={appInterviews} onChanged={done} />
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
              {!applications.length && <tr><td colSpan="6" className="text-secondary">No applicants yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ViewApplicants;
