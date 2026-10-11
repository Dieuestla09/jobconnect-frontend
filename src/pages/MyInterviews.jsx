import { useEffect, useState } from 'react';
import api from '../services/api';
import AlertMessage from '../components/AlertMessage';
import Loading from '../components/Loading';

export const interviewStatusClass = { Proposed: 'warning', Confirmed: 'success', Declined: 'danger', Cancelled: 'secondary' };
export const formatSlot = (value) =>
  new Date(value).toLocaleString([], { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const InterviewCard = ({ interview, onChanged }) => {
  const [slotId, setSlotId] = useState('');
  const [declining, setDeclining] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const act = async (path, body) => {
    setBusy(true);
    setError('');
    try {
      await api.post(`/interviews/${interview.id}/${path}`, body);
      onChanged(path === 'confirm' ? 'Interview confirmed' : 'Interview declined');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  const selected = interview.slots.find((slot) => slot.is_selected);

  return (
    <div className="card mb-3">
      <div className="card-body">
        <div className="d-flex justify-content-between flex-wrap gap-2">
          <div>
            <h2 className="h6 mb-1">{interview.job_title}</h2>
            <div className="small text-secondary">{interview.company_name} · {interview.format} · {interview.venue}</div>
          </div>
          <span className={`badge text-bg-${interviewStatusClass[interview.status]} align-self-start`}>{interview.status}</span>
        </div>
        {interview.note && <p className="small mt-2 mb-0">Note from the employer: {interview.note}</p>}
        <AlertMessage message={error} />

        {interview.status === 'Proposed' && (
          <div className="mt-3">
            <div className="fw-semibold small mb-1">Choose a time</div>
            {interview.slots.map((slot) => (
              <div className="form-check" key={slot.id}>
                <input className="form-check-input" type="radio" name={`slot-${interview.id}`} id={`slot-${slot.id}`} checked={String(slotId) === String(slot.id)} onChange={() => setSlotId(slot.id)} />
                <label className="form-check-label" htmlFor={`slot-${slot.id}`}>{formatSlot(slot.starts_at)}</label>
              </div>
            ))}
            {declining ? (
              <div className="mt-3">
                <label className="form-label small" htmlFor={`reason-${interview.id}`}>Reason for declining</label>
                <textarea id={`reason-${interview.id}`} className="form-control" rows="2" maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} />
                <div className="d-flex gap-2 mt-2">
                  <button className="btn btn-sm btn-danger" disabled={busy || reason.trim().length < 3} onClick={() => act('decline', { reason })}>Send decline</button>
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => setDeclining(false)}>Back</button>
                </div>
              </div>
            ) : (
              <div className="d-flex gap-2 mt-3">
                <button className="btn btn-sm btn-success" disabled={busy || !slotId} onClick={() => act('confirm', { slot_id: slotId })}>Confirm selected time</button>
                <button className="btn btn-sm btn-outline-danger" disabled={busy} onClick={() => setDeclining(true)}>Decline</button>
              </div>
            )}
          </div>
        )}
        {interview.status === 'Confirmed' && selected && <p className="mt-3 mb-0">Confirmed for <strong>{formatSlot(selected.starts_at)}</strong></p>}
        {interview.status === 'Declined' && <p className="small text-secondary mt-3 mb-0">You declined: {interview.decline_reason}</p>}
        {interview.status === 'Cancelled' && <p className="small text-secondary mt-3 mb-0">The employer cancelled this interview.</p>}
      </div>
    </div>
  );
};

const MyInterviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = () =>
    api
      .get('/interviews')
      .then((res) => setInterviews(res.data.interviews))
      .catch((err) => setError(err.response?.data?.message || 'Could not load interviews'))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  if (loading) return <Loading />;

  return (
    <div>
      <h1 className="h3 mb-3">My Interviews</h1>
      <AlertMessage type="success" message={message} />
      <AlertMessage message={error} />
      {!interviews.length && !error && (
        <div className="card"><div className="card-body text-secondary">
          No interview invitations yet. Employers can invite you once your application is shortlisted.
        </div></div>
      )}
      {interviews.map((interview) => (
        <InterviewCard key={interview.id} interview={interview} onChanged={(text) => { setMessage(text); load(); }} />
      ))}
    </div>
  );
};

export default MyInterviews;
