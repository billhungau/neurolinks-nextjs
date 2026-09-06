import Image from "next/image";
import { IMG_SIZES } from "@/lib/image-sizes";
import type { InsightsPerson } from "@/lib/payload/types";

function Clinician({ person, role }: { person: NonNullable<InsightsPerson>; role: string }) {
  const name = [person.name, person.credentials].filter(Boolean).join(", ");
  return (
    <div className="insights-clinician">
      {person.photo ? (
        <Image
          className="insights-clinician-photo"
          src={person.photo.url}
          alt={person.photo.alt}
          width={person.photo.width || 240}
          height={person.photo.height || 240}
          sizes={IMG_SIZES.staff}
        />
      ) : null}
      <div>
        <p className="insights-box-label">{role}</p>
        <p className="insights-clinician-name">{name}</p>
        {person.role ? <p className="insights-clinician-role">{person.role}</p> : null}
        {person.bio ? <p className="insights-clinician-bio">{person.bio}</p> : null}
      </div>
    </div>
  );
}

/**
 * Who wrote the article and who checked the medicine. Rendered only when a
 * clinician record carries a biography or photograph, so short reference
 * pieces keep the restrained layout they have today.
 */
export function AuthorshipPanel({
  author,
  reviewer,
}: {
  author: InsightsPerson;
  reviewer: InsightsPerson;
}) {
  const people: { person: NonNullable<InsightsPerson>; role: string }[] = [];
  if (author && (author.bio || author.photo)) {
    people.push({ person: author, role: "Written by" });
  }
  if (reviewer && reviewer.id !== author?.id && (reviewer.bio || reviewer.photo)) {
    people.push({ person: reviewer, role: "Medically reviewed by" });
  }
  if (!people.length) return null;

  return (
    <section className="insights-authorship-card" aria-labelledby="insights-authorship-heading">
      <h2 id="insights-authorship-heading" className="insights-h2">
        Medical authorship
      </h2>
      {people.map((entry) => (
        <Clinician key={`${entry.role}-${entry.person.id}`} {...entry} />
      ))}
    </section>
  );
}
