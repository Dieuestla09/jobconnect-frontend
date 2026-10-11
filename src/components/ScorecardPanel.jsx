import { useState } from 'react';
import api from '../services/api';
import AlertMessage from './AlertMessage';

const RECOMMENDATIONS = ['Strong yes', 'Yes', 'Maybe', 'No'];
const MAX_NOTES = 2000;
const CRITERIA = [
  ['technical', 'Technical skills'],
  ['communication', 'Communication'],
  ['culture_fit', 'Culture fit']
];

export const recommendationClass = { 'Strong yes': 'success', Yes: 'primary', Maybe: 'warning', No: 'danger' };

// Private employer scorecard for one applicant (1-5 ratings, recommendation, notes).
const ScorecardPanel = ({ application, scorecard, onSaved }) => {
  const [form, setForm] = useState({
    technical: scorecard?.technical || '',
    communication: scorecard?.communication || '',
    culture_fit: scorecard?.culture_fit || '',
    recommendation: scorecard?.recommendation || '',
    notes: scorecard?.notes || ''
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const ratings = CRITERIA.map(([key]) => Number(form[key]));
  const preview = ratings.every(Boolean) ? (ratings.reduce((a, b) => a + b, 0) / 3).toFixed(2) : null;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!preview) return setError('Rate all three criteria from 1 to 5');
    if (!form.recommendation) return setError('Choose a recommendation');
    setBusy(true);
    try {
      await api.put(`/scorecards/application/${application.id}`, {
        technical: Number(form.technical),
        communication: Number(form.communication),
        culture_fit: Number(form.culture_fit),
        recommendation: form.recommendation,
        notes: form.notes
      });
      onSaved('Scorecard saved');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save the scorecard');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <h2 className="h6">Scorecard for {application.job_seeker_name} <span className="badge text-bg-light border">Private to your company</span></h2>
      <AlertMessage message={error} />
      <div className="row g-2">
        {CRITERIA.map(([key, label]) => (
          <div className="col-md-4" key={key}>
            <label className="form-label small" htmlFor={`${key}-${application.id}`}>{label}</label>
            <select id={`${key}-${application.id}`} className="form-select form-select-sm" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}>
              <option value="">Rate 1-5</option>
              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        ))}
        <div className="col-md-6">
          <label className="form-label small" htmlFor={`rec-${application.id}`}>Recommendation</label>
          <select id={`rec-${application.id}`} className="form-select form-select-sm" value={form.recommendation} onChange={(e) => setForm({ ...form, recommendation: e.target.value })}>
            <option value="">Choose...</option>
            {RECOMMENDATIONS.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div className="col-md-6 d-flex align-items-end small text-secondary">
          {scorecard && <>Saved overall: <strong className="ms-1">{scorecard.overall}</strong></>}
          {preview && <span className="ms-3">Preview: {preview} (final value is calculated by the database)</span>}
        </div>
        <div className="col-12">
          <label className="form-label small" htmlFor={`notes-${application.id}`}>Private notes</label>
          <textarea id={`notes-${application.id}`} rows="3" className="form-control form-control-sm" maxLength={MAX_NOTES} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="form-text">{form.notes.length} / {MAX_NOTES}</div>
        </div>
        <div className="col-12">
          <button className="btn btn-sm btn-primary" disabled={busy}>{busy ? 'Saving...' : scorecard ? 'Update scorecard' : 'Save scorecard'}</button>
        </div>
      </div>
    </form>
  );
};

export default ScorecardPanel;
