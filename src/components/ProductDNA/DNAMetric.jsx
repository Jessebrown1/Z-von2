export default function DNAMetric({ label, value }) {
  return (
    <div className="dna-metric">
      <span className="dna-metric-label">{label}</span>
      <span className="dna-metric-value">{value}</span>
      <span className="dna-metric-line" aria-hidden="true" />
    </div>
  );
}
