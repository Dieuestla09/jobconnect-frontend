import { useEffect, useState } from 'react';
import api from '../services/api';
import AlertMessage from '../components/AlertMessage';
import Loading from '../components/Loading';
import MatchList from '../components/MatchList';

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];
const emptyForm = { name: '', keywords: '', location: '', job_type: '', min_match: 50, is_active: true };

const JobAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [max, setMax] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState(null); // null = hidden, otherwise the alert being created/edited
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [openId, setOpenId] = useState(null);
  const [matches, setMatches] = useState({ loading: false, error: '', data: null });

  const load = () =>
    api
      .get('/alerts')
      .then((res) => {
        setAlerts(res.data.alerts);
        setMax(res.data.max_alerts);
      })
      .catch((err) => setError(err.response?.data?.message || 'Could not load your alerts'))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const openForm = (alert) => {
    setFormError('');
    setMessage('');
    setEditingId(alert ? alert.id : null);
    setForm(
      alert
        ? { name: alert.name, keywords: alert.keywords, location: alert.location, job_type: alert.job_type || '', min_match: alert.min_match, is_active: alert.is_active }
        : { ...emptyForm }
    );
  };

  const change = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setFormError('');
    // Same rules as the API, so the user gets instant feedback.
    if (!form.keywords.trim() && !form.location.trim() && !form.job_type) {
      return setFormError('Add at least one keyword, a location or a job type');
    }
    setSaving(true);
    try {
      const payload = { ...form, min_match: Number(form.min_match), job_type: form.job_type || null };
      if (editingId) await api.put(`/alerts/${editingId}`, payload);
      else await api.post('/alerts', payload);
      setMessage(editingId ? 'Alert updated' : 'Alert saved');
      setForm(null);
      setOpenId(null);
      await load();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Could not save the alert');
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (alert) => {
    setError('');
    try {
      await api.patch(`/alerts/${alert.id}/status`, { is_active: !alert.is_active });
      setMessage(alert.is_active ? 'Alert paused' : 'Alert resumed');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not change the alert');
    }
  };

  const remove = async (alert) => {
    if (!window.confirm(`Delete the alert "${alert.name}"?`)) return;
    setError('');
    try {
      await api.delete(`/alerts/${alert.id}`);
      setMessage('Alert deleted');
      if (openId === alert.id) setOpenId(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete the alert');
    }
  };

  const showMatches = (alert) => {
    if (openId === alert.id) return setOpenId(null);
    setOpenId(alert.id);
    setMatches({ loading: true, error: '', data: null });
    api
      .get(`/alerts/${alert.id}/matches`)
      .then((res) => setMatches({ loading: false, error: '', data: res.data }))
      .catch((err) => setMatches({ loading: false, error: err.response?.data?.message || 'Could not load matches', data: null }));
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h1 className="h3 mb-0">Job Alerts</h1>
          <div className="small text-secondary">{alerts.length} of {max} alerts used</div>
        </div>
        <button className="btn btn-primary" onClick={() => openForm(null)} disabled={alerts.length >= max}>
          New alert
        </button>
      </div>
      <AlertMessage type="success" message={message} />
      <AlertMessage message={error} />

      {form && (
        <form className="card mb-3" onSubmit={submit}>
          <div className="card-body">
            <h2 className="h5">{editingId ? 'Edit alert' : 'New alert'}</h2>
            <AlertMessage message={formError} />
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label" htmlFor="name">Alert name (optional)</label>
                <input id="name" name="name" className="form-control" maxLength={100} value={form.name} onChange={change} />
              </div>
              <div className="col-md-6">
                <label className="form-label" htmlFor="keywords">Keywords (comma separated)</label>
                <input id="keywords" name="keywords" className="form-control" maxLength={200} placeholder="react, frontend" value={form.keywords} onChange={change} />
              </div>
              <div className="col-md-4">
                <label className="form-label" htmlFor="location">Location</label>
                <input id="location" name="location" className="form-control" maxLength={160} placeholder="Kampala" value={form.location} onChange={change} />
              </div>
              <div className="col-md-4">
                <label className="form-label" htmlFor="job_type">Job type</label>
                <select id="job_type" name="job_type" className="form-select" value={form.job_type} onChange={change}>
                  <option value="">Any</option>
                  {JOB_TYPES.map((type) => <option key={type}>{type}</option>)}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label" htmlFor="min_match">Minimum match: {form.min_match}%</label>
                <input id="min_match" name="min_match" type="range" min="0" max="100" step="5" className="form-range" value={form.min_match} onChange={change} />
              </div>
              <div className="col-12 form-check ms-2">
                <input id="is_active" name="is_active" type="checkbox" className="form-check-input" checked={form.is_active} onChange={change} />
                <label className="form-check-label" htmlFor="is_active">Active</label>
              </div>
            </div>
            <div className="d-flex gap-2 mt-3">
              <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save alert'}</button>
              <button type="button" className="btn btn-outline-secondary" onClick={() => setForm(null)}>Cancel</button>
            </div>
          </div>
        </form>
      )}

      {!alerts.length && !error && (
        <div className="card"><div className="card-body text-secondary">
          You have no alerts yet. Create one to see jobs ranked by how well they match your profile.
        </div></div>
      )}

      {alerts.map((alert) => (
        <div className="card mb-3" key={alert.id}>
          <div className="card-body">
            <div className="d-flex flex-wrap justify-content-between gap-2">
              <div>
                <h2 className="h6 mb-1">
                  {alert.name} {!alert.is_active && <span className="badge text-bg-secondary ms-1">Paused</span>}
                </h2>
                <div className="small text-secondary">
                  {[alert.keywords && `Keywords: ${alert.keywords}`, alert.location && `Location: ${alert.location}`, alert.job_type && `Type: ${alert.job_type}`, `Min match: ${alert.min_match}%`].filter(Boolean).join(' · ')}
                </div>
              </div>
              <div className="text-end">
                <strong>{alert.match_count}</strong> <span className="small text-secondary">matching job{alert.match_count === 1 ? '' : 's'}</span>
              </div>
            </div>
            <div className="d-flex flex-wrap gap-2 mt-3">
              <button className="btn btn-sm btn-primary" onClick={() => showMatches(alert)}>
                {openId === alert.id ? 'Hide matches' : 'View matches'}
              </button>
              <button className="btn btn-sm btn-outline-primary" onClick={() => openForm(alert)}>Edit</button>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => toggle(alert)}>{alert.is_active ? 'Pause' : 'Resume'}</button>
              <button className="btn btn-sm btn-outline-danger" onClick={() => remove(alert)}>Delete</button>
            </div>
          </div>
          {openId === alert.id && (
            <div className="border-top">
              {matches.loading && <Loading label="Calculating matches..." />}
              {matches.error && <div className="p-3"><AlertMessage message={matches.error} /></div>}
              {matches.data && !matches.data.profile_has_skills && (
                <div className="p-3 pb-0"><AlertMessage type="warning" message="Add skills to your profile so skill scores can be calculated." /></div>
              )}
              {matches.data && !matches.data.matches.length && (
                <div className="p-3 text-secondary">No open jobs match this alert at {alert.min_match}% or above. Try lowering the minimum match.</div>
              )}
              {matches.data && matches.data.matches.length > 0 && <MatchList items={matches.data.matches} />}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default JobAlerts;
