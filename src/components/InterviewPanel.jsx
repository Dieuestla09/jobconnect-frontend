import { useState } from 'react';
import api from '../services/api';
import AlertMessage from './AlertMessage';
import { formatSlot, interviewStatusClass } from '../pages/MyInterviews';

const FORMATS = ['Video call', 'Phone', 'On-site'];

// <input type="datetime-local"> wants "YYYY-MM-DDTHH:mm" in local time.
const localInputMin = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
};

// Employer view for ONE applicant: interview history, cancel, and the "propose times" form.
const InterviewPanel = ({ application, interviews, onChanged }) => {
  const active = interviews.find((i) => ['Proposed', 'Confirmed'].includes(i.status));
  const [form, setForm] = useState({ format: 'Video call', venue: '', note: '', slots: [''] });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const setSlot = (index, value) =>
    setForm((f) => ({ ...f, slots: f.slots.map((slot, i) => (i === index ? value : slot)) }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const slots = form.slots.filter(Boolean);
    if (!slots.length) return setError('Propose at least one time slot');
    if (form.venue.trim().length < 3) return setError('Enter a venue or meeting link');
    setBusy(true);
    try {
      await api.post('/interviews', {
        application_id: application.id,
        format: form.format,
        venue: form.venue,
        note: form.note,
        // The browser converts the local time to an exact moment (ISO/UTC) for the API.
        slots: slots.map((value) => new Date(value).toISOString())
      });
      setForm({ format: 'Video call', venue: '', note: '', slots: [''] });
      onChanged('Interview proposed to the candidate');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not schedule the interview');
    } finally {
      setBusy(false);
    }
  };

  const cancel = async (interview) => {
    if (!window.confirm('Cancel this interview?')) return;
    setError('');
    try {
      await api.post(`/interviews/${interview.id}/cancel`);
      onChanged('Interview cancelled');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not cancel the interview');
    }
  };

  return (
    <div>
      <h2 className="h6">Interview with {application.job_seeker_name}</h2>
      <AlertMessage message={error} />

      {interviews.map((interview) => (
        <div className="border rounded p-2 mb-2 bg-white" key={interview.id}>
          <div className="d-flex justify-content-between align-items-start">
            <div className="small">
              <span className={`badge text-bg-${interviewStatusClass[interview.status]} me-2`}>{interview.status}</span>
              {interview.format} · {interview.venue}
              <ul className="mb-0 mt-1">
                {interview.slots.map((slot) => (
                  <li key={slot.id} className={slot.is_selected ? 'fw-semibold text-success' : ''}>
                    {formatSlot(slot.starts_at)} {slot.is_selected && '(confirmed)'}
                  </li>
                ))}
              </ul>
              {interview.decline_reason && <div className="text-danger">Declined: {interview.decline_reason}</div>}
            </div>
            {['Proposed', 'Confirmed'].includes(interview.status) && (
              <button className="btn btn-sm btn-outline-danger" onClick={() => cancel(interview)}>Cancel</button>
            )}
          </div>
        </div>
      ))}

      {application.status !== 'Shortlisted' && !active && (
        <div className="small text-secondary">Shortlist this applicant to schedule an interview.</div>
      )}

      {application.status === 'Shortlisted' && !active && (
        <form onSubmit={submit} className="row g-2">
          <div className="col-md-4">
            <label className="form-label small" htmlFor={`fmt-${application.id}`}>Format</label>
            <select id={`fmt-${application.id}`} className="form-select form-select-sm" value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })}>
              {FORMATS.map((f) => <option key={f}>{f}</option>)}
            </select>
          </div>
          <div className="col-md-8">
            <label className="form-label small" htmlFor={`venue-${application.id}`}>Venue or meeting link</label>
            <input id={`venue-${application.id}`} className="form-control form-control-sm" maxLength={255} value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} />
          </div>
          <div className="col-12">
            <label className="form-label small d-block">Proposed times (1 to 3)</label>
            {form.slots.map((slot, index) => (
              <div className="d-flex gap-2 mb-1" key={index}>
                <input type="datetime-local" aria-label={`Slot ${index + 1}`} className="form-control form-control-sm" min={localInputMin()} value={slot} onChange={(e) => setSlot(index, e.target.value)} />
                {form.slots.length > 1 && (
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setForm({ ...form, slots: form.slots.filter((_, i) => i !== index) })}>Remove</button>
                )}
              </div>
            ))}
            {form.slots.length < 3 && (
              <button type="button" className="btn btn-sm btn-link px-0" onClick={() => setForm({ ...form, slots: [...form.slots, ''] })}>+ Add another time</button>
            )}
          </div>
          <div className="col-12">
            <label className="form-label small" htmlFor={`note-${application.id}`}>Note (optional)</label>
            <textarea id={`note-${application.id}`} rows="2" maxLength={500} className="form-control form-control-sm" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          </div>
          <div className="col-12">
            <button className="btn btn-sm btn-primary" disabled={busy}>{busy ? 'Sending...' : 'Propose interview'}</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default InterviewPanel;
