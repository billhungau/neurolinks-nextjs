export type SignaturePoint = { x: number; y: number };

export type SignatureStrokeData = {
  format: "strokes-v1";
  width: number;
  height: number;
  strokes: SignaturePoint[][];
};

const MAX_STROKES = 64;
const MAX_POINTS = 12000;

export function isSignatureStrokeData(value: unknown): value is SignatureStrokeData {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<SignatureStrokeData>;
  if (candidate.format !== "strokes-v1") return false;
  if (!Number.isFinite(candidate.width) || !Number.isFinite(candidate.height)) return false;
  if ((candidate.width ?? 0) <= 0 || (candidate.height ?? 0) <= 0) return false;
  if (!Array.isArray(candidate.strokes) || candidate.strokes.length > MAX_STROKES) return false;
  let pointCount = 0;
  for (const stroke of candidate.strokes) {
    if (!Array.isArray(stroke)) return false;
    pointCount += stroke.length;
    if (pointCount > MAX_POINTS) return false;
    for (const point of stroke) {
      if (!point || typeof point !== "object") return false;
      const { x, y } = point as SignaturePoint;
      if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || x > 1 || y < 0 || y > 1) return false;
    }
  }
  return true;
}

export function signaturePointCount(value: SignatureStrokeData) {
  return value.strokes.reduce((sum, stroke) => sum + stroke.length, 0);
}

export function signaturePathLength(value: SignatureStrokeData) {
  let length = 0;
  for (const stroke of value.strokes) {
    for (let index = 1; index < stroke.length; index += 1) {
      const previous = stroke[index - 1];
      const current = stroke[index];
      length += Math.hypot(current.x - previous.x, current.y - previous.y);
    }
  }
  return length;
}

export function hasMeaningfulSignature(value: unknown): value is SignatureStrokeData {
  return isSignatureStrokeData(value) && signaturePointCount(value) >= 3 && signaturePathLength(value) >= 0.02;
}

export function signatureSvgPolylines(value: SignatureStrokeData, width = 800, height = 180) {
  return value.strokes
    .filter((stroke) => stroke.length > 0)
    .map((stroke) => stroke.map((point) => `${(point.x * width).toFixed(2)},${(point.y * height).toFixed(2)}`).join(" "));
}
