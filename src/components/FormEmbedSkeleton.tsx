type Props = {
  variant: "contact" | "referral";
};

export function FormEmbedSkeleton({ variant }: Props) {
  const referral = variant === "referral";
  return (
    <div className="form-skel" aria-hidden="true">
      {referral ? <p className="form-skel-label">Patient information</p> : null}
      <div className="form-skel-grid">
        <span className="form-skel-block form-skel-field" />
        <span className="form-skel-block form-skel-field" />
      </div>
      {referral ? <p className="form-skel-label">Referring clinician</p> : null}
      <div className="form-skel-grid">
        <span className="form-skel-block form-skel-field" />
        <span className="form-skel-block form-skel-field" />
      </div>
      {referral ? <p className="form-skel-label">Clinical information</p> : null}
      <span className={`form-skel-block ${referral ? "form-skel-area-lg" : "form-skel-area"}`} />
      <span className="form-skel-block form-skel-btn" />
    </div>
  );
}
