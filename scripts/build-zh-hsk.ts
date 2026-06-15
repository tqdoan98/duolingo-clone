/**
 * One-off generator: turns the open "complete-hsk-vocabulary" dataset into a
 * trimmed, committed data file (`scripts/zh-hsk-data.json`) used by the seed.
 *
 * Source: https://github.com/drkameleon/complete-hsk-vocabulary (classic HSK
 * levels old-1 … old-6 ≈ 5,000 words). Run with:
 *
 *   bunx tsx scripts/build-zh-hsk.ts
 *
 * It is intentionally NOT part of the normal seed flow — the JSON it produces
 * is committed so seeding is reproducible without network access.
 */
import { writeFileSync } from "fs";
import { join } from "path";

const SOURCE =
  "https://raw.githubusercontent.com/drkameleon/complete-hsk-vocabulary/main/complete.json";

type RawWord = {
  simplified: string;
  radical?: string;
  level: string[];
  frequency: number;
  forms: {
    transcriptions: { pinyin: string; numeric: string };
    meanings: string[];
  }[];
};

export type HskWord = {
  chinese: string;
  pinyin: string;
  english: string;
  slug: string;
  radical: string;
};

// Levels to emit (HSK 1 is hand-curated elsewhere; we generate 2-6 here).
const LEVELS = [2, 3, 4, 5, 6] as const;

const SKIP = /^(surname |abbr\.|variant of|\(onom\)|\(onom\.\)|used in|see )/i;

const tidy = (m: string): string =>
  m
    .split(/[;/]/)[0] // first sense only
    .replace(/\([^)]*\)/g, "") // drop parentheticals
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

// Across all readings (forms), pick the most "learnable" gloss — skipping
// proper-noun / abbreviation / onomatopoeia readings when a plainer one
// exists — and return its matching pinyin so the two stay consistent.
const pickGloss = (
  forms: RawWord["forms"]
): { english: string; pinyin: string; numeric: string } | null => {
  const candidates = forms.flatMap((f) =>
    f.meanings.map((m) => ({
      raw: m,
      pinyin: f.transcriptions.pinyin,
      numeric: f.transcriptions.numeric,
    }))
  );
  if (!candidates.length) return null;
  const best = candidates.find((c) => !SKIP.test(c.raw.trim())) ?? candidates[0];
  return {
    english: tidy(best.raw),
    pinyin: best.pinyin.toLowerCase(),
    numeric: best.numeric,
  };
};

const toSlug = (numeric: string): string =>
  numeric
    .toLowerCase()
    .replace(/[0-9]/g, "") // drop tone digits
    .replace(/[^a-z]+/g, "_") // spaces/punct → underscore
    .replace(/^_+|_+$/g, "");

const main = async () => {
  console.log("Fetching source dataset…");
  const res = await fetch(SOURCE);
  if (!res.ok) throw new Error(`Source fetch failed: ${res.status}`);
  const data = (await res.json()) as RawWord[];

  const seen = new Set<string>(); // simplified chars already assigned to a level
  const out: Record<string, HskWord[]> = {};
  const slugCounts: Record<string, number> = {};

  for (const level of LEVELS) {
    const tag = `old-${level}`;
    const words = data
      .filter((w) => (w.level || []).includes(tag))
      .filter((w) => !seen.has(w.simplified))
      .sort((a, b) => a.frequency - b.frequency); // lower rank = more common

    const list: HskWord[] = [];
    for (const w of words) {
      seen.add(w.simplified);
      const gloss = pickGloss(w.forms);
      if (!gloss || !gloss.english) continue; // skip if no usable gloss remains

      let slug = toSlug(gloss.numeric) || "word";
      const n = (slugCounts[slug] = (slugCounts[slug] ?? 0) + 1);
      if (n > 1) slug = `${slug}_${n}`;

      list.push({
        chinese: w.simplified,
        pinyin: gloss.pinyin,
        english: gloss.english,
        slug,
        radical: w.radical ?? "",
      });
    }
    out[level] = list;
    console.log(`HSK ${level}: ${list.length} words`);
  }

  const dest = join(import.meta.dirname, "zh-hsk-data.json");
  writeFileSync(dest, JSON.stringify(out));
  console.log(`Wrote ${dest}`);
};

void main();
