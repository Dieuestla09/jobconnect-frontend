// Explains WHY a job got its score: the 70/30 split plus matched and missing requirements.
const MatchExplain = ({ match }) => {
  const { skills, location, breakdown } = match;
  return (
    <div className="small">
      <div className="d-flex flex-wrap gap-3 mb-2 text-secondary">
        <span>
          Skills: <strong>{breakdown.skillsPoints}</strong> / 70 ({skills.matched.length} of {skills.total} requirements)
        </span>
        <span>
          Location: <strong>{breakdown.locationPoints}</strong> / 30
        </span>
      </div>
      <div className="text-secondary mb-2">{location.reason}</div>
      {skills.note && <div className="text-secondary mb-2">{skills.note}</div>}
      {skills.matched.length > 0 && (
        <div className="mb-1">
          <span className="me-2 fw-semibold text-success">You match:</span>
          {skills.matched.map((item) => (
            <span key={item} className="badge text-bg-success me-1">{item}</span>
          ))}
        </div>
      )}
      {skills.missing.length > 0 && (
        <div>
          <span className="me-2 fw-semibold text-danger">Missing:</span>
          {skills.missing.map((item) => (
            <span key={item} className="badge text-bg-light border text-danger me-1">{item}</span>
          ))}
        </div>
      )}
    </div>
  );
};

export default MatchExplain;
