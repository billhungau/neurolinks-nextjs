/**
 * Curated static excerpts from published Google reviews.
 * These are not synchronized with Google. Verify before changing.
 *
 * Sources checked 2026-09-01:
 * - https://neurolinks.ca/ homepage “What Our Patients Say”
 * - Requested profile URL https://share.google/zhQv4Wd5lcK4LFLeJ
 */

export const GOOGLE_REVIEWS_URL = "https://share.google/zhQv4Wd5lcK4LFLeJ";

export type HomeReview = {
  initials: string;
  text: string;
  /** Published as a family-member account; do not imply personal treatment. */
  familyMember?: boolean;
  source: "wordpress-homepage";
};

export function reviewRange(page: number, pageSize: number, total: number) {
  const start = page * pageSize + 1;
  const end = Math.min(start + pageSize - 1, total);
  return { start, end };
}

export function reviewStatusText(page: number, pageSize: number, total: number) {
  const { start, end } = reviewRange(page, pageSize, total);
  if (start === end) return `Review ${start} of ${total}`;
  return `Reviews ${start}–${end} of ${total}`;
}

export const HOME_REVIEWS: HomeReview[] = [
  {
    initials: "E. H.",
    text: "Dr Au and his team have been so knowledgeable and supportive throughout this process. I felt safe and cared for.",
    source: "wordpress-homepage",
  },
  {
    initials: "B. J.",
    text: "He was very patient and thorough with diagnosis and my options—plus providing all the information on TMS treatment. You can tell Dr Au and his team were really invested in my outcome.",
    source: "wordpress-homepage",
  },
  {
    initials: "J. A.",
    text: "The Transcranial Magnetic Stimulation took longer than usual to work for me, but I have had depression for 45 years. The treatment and the guidance in adjusting my medication has really made a positive change. I feel much more myself and can feel hopeful again.",
    source: "wordpress-homepage",
  },
  {
    initials: "P. R.",
    text: "We have struggled to find the right help for at least 5 years now and we are so grateful to Dr. Chi Hung and his staff for finally LISTENING and giving us the help and hope we have been so desperately searching for.",
    familyMember: true,
    source: "wordpress-homepage",
  },
  {
    initials: "T. H.",
    text: "Dr Au and his staff are top notch. … Dr. Au is very knowledgeable and it’s all about patient care and not the money.",
    source: "wordpress-homepage",
  },
];
