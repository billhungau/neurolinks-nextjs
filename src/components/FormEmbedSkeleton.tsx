export function FormEmbedSkeleton() {
  return (
    <div className="form-skel" aria-hidden="true">
      <p className="form-skel-label">Patient information</p>
      <div className="form-skel-grid">
        <span className="form-skel-block form-skel-field" />
        <span className="form-skel-block form-skel-field" />
      </div>
      <p className="form-skel-label">Referring clinician</p>
      <div className="form-skel-grid">
        <span className="form-skel-block form-skel-field" />
        <span className="form-skel-block form-skel-field" />
      </div>
      <p className="form-skel-label">Clinical information</p>
      <span className="form-skel-block form-skel-area-lg" />
      <span className="form-skel-block form-skel-btn" />
    </div>
  );
}
