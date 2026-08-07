/** A single prominent CTA that kicks off the guided occasion → mood → look flow, driven by the same aiEngine outfit-builder state machine as typing "build me a fit." */
export default function AIOutfitBuilder({ onStart }) {
  return (
    <button type="button" className="ai-outfit-builder-cta" onClick={() => onStart('Build me a fit')}>
      <span className="ai-outfit-builder-cta-label">Build My Look</span>
      <span className="ai-outfit-builder-cta-sub">Two questions, one complete outfit</span>
    </button>
  );
}
