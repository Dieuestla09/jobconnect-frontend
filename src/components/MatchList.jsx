import { Link } from 'react-router-dom';
import ScoreRing from './ScoreRing';
import MatchExplain from './MatchExplain';

// Ranked list of { job, match } items, used by alert matches and dashboard recommendations.
const MatchList = ({ items }) => (
  <ul className="list-group list-group-flush">
    {items.map(({ job, match, applied }) => (
      <li className="list-group-item" key={job.id}>
        <div className="d-flex gap-3 align-items-start">
          <ScoreRing score={match.score} size={56} />
          <div className="flex-grow-1">
            <div className="d-flex flex-wrap justify-content-between gap-2">
              <div>
                <Link to={`/jobs/${job.id}`} className="fw-semibold">{job.title}</Link>
                <div className="small text-secondary">
                  {job.company_name || job.employer_name} · {job.location} · {job.job_type}
                </div>
              </div>
              {applied && <span className="badge text-bg-secondary align-self-start">Applied</span>}
            </div>
            <details className="mt-2">
              <summary className="small text-primary">Why this score?</summary>
              <div className="mt-2"><MatchExplain match={match} /></div>
            </details>
          </div>
        </div>
      </li>
    ))}
  </ul>
);

export default MatchList;
