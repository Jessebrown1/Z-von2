export default function StyleProfile({ moodProfile, signature }) {
  return (
    <div className="style-profile">
      <div className="style-profile-bars">
        {moodProfile.map((entry) => (
          <div className="style-profile-bar-row" key={entry.mood}>
            <span className="style-profile-bar-label">
              {entry.percent}% {entry.label}
            </span>
            <div className="style-profile-bar-track">
              <div className="style-profile-bar-fill" style={{ width: `${entry.percent}%` }} />
            </div>
          </div>
        ))}
      </div>

      {signature.length > 0 && (
        <div className="style-signature">
          <p className="style-signature-heading">Your Signature</p>
          <ul>
            {signature.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
