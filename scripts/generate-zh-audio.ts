/**
 * Generate Mandarin audio files for every word in the HSK curriculum.
 *
 * Reads the word list from scripts/zh-content.ts so it always stays in sync,
 * then writes one MP3 per word to public/zh_{slug}.mp3. Existing files are
 * skipped, so it's safe to re-run after adding new vocabulary.
 *
 * Usage:
 *   # Google Cloud TTS (best Mandarin tones, generous free tier)
 *   GOOGLE_TTS_API_KEY=xxx bun run audio:zh
 *
 *   # ElevenLabs (set provider explicitly)
 *   TTS_PROVIDER=elevenlabs ELEVENLABS_API_KEY=xxx bun run audio:zh
 *
 *   # Re-generate everything, overwriting existing files
 *   FORCE=1 GOOGLE_TTS_API_KEY=xxx bun run audio:zh
 *
 *   # Only one HSK level at a time (1-6) to spread out the work/quota
 *   HSK_LEVEL=2 GOOGLE_TTS_API_KEY=xxx bun run audio:zh
 */
import { existsSync, readFileSync } from "fs";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";

import "dotenv/config";

import { ZH_UNITS, type Word } from "./zh-content";

const PUBLIC_DIR = join(process.cwd(), "public");
const FORCE = process.env.FORCE === "1" || process.env.FORCE === "true";
// Optional: restrict to a single HSK level (1-6). Default: all levels.
const ONLY_LEVEL = process.env.HSK_LEVEL ? Number(process.env.HSK_LEVEL) : null;

const provider =
  process.env.TTS_PROVIDER ??
  (process.env.ELEVENLABS_API_KEY ? "elevenlabs" : "google");

// ─── Collect unique words (dedupe by slug) ──────────────────────────────────

const collectWords = (): Word[] => {
  const seen = new Map<string, Word>();
  const add = (w: Word) => {
    if (!seen.has(w.slug)) seen.set(w.slug, w);
  };

  // HSK 1: hand-curated content.
  if (!ONLY_LEVEL || ONLY_LEVEL === 1)
    for (const unit of ZH_UNITS)
      for (const lesson of unit.lessons) lesson.words.forEach(add);

  // HSK 2-6: generated dataset.
  const zhData = JSON.parse(
    readFileSync(join(__dirname, "zh-hsk-data.json"), "utf-8")
  ) as Record<string, Word[]>;
  for (let lvl = 2; lvl <= 6; lvl++) {
    if (ONLY_LEVEL && ONLY_LEVEL !== lvl) continue;
    (zhData[String(lvl)] ?? []).forEach(add);
  }

  return [...seen.values()];
};

// ─── Providers ──────────────────────────────────────────────────────────────

const synthGoogle = async (text: string): Promise<Buffer> => {
  const apiKey = process.env.GOOGLE_TTS_API_KEY;
  if (!apiKey) throw new Error("Missing GOOGLE_TTS_API_KEY");

  const res = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: { text },
        voice: { languageCode: "zh-CN", name: "zh-CN-Wavenet-A" },
        audioConfig: { audioEncoding: "MP3", speakingRate: 0.9 },
      }),
    }
  );

  if (!res.ok) throw new Error(`Google TTS ${res.status}: ${await res.text()}`);
  const { audioContent } = (await res.json()) as { audioContent: string };
  return Buffer.from(audioContent, "base64");
};

const synthElevenLabs = async (text: string): Promise<Buffer> => {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error("Missing ELEVENLABS_API_KEY");
  // Default multilingual voice "Rachel"; override with ELEVENLABS_VOICE_ID.
  const voiceId = process.env.ELEVENLABS_VOICE_ID ?? "21m00Tcm4TlvDq8ikWAM";

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
      }),
    }
  );

  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`);
  return Buffer.from(await res.arrayBuffer());
};

const synth = provider === "elevenlabs" ? synthElevenLabs : synthGoogle;

// ─── Main ─────────────────────────────────────────────────────────────────

const main = async () => {
  const words = collectWords();
  await mkdir(PUBLIC_DIR, { recursive: true });

  console.log(`Provider: ${provider}`);
  console.log(`${words.length} unique words to process\n`);

  let created = 0;
  let skipped = 0;

  for (const word of words) {
    const filename = `zh_${word.slug}.mp3`;
    const filepath = join(PUBLIC_DIR, filename);

    if (!FORCE && existsSync(filepath)) {
      skipped++;
      continue;
    }

    try {
      const audio = await synth(word.chinese);
      await writeFile(filepath, audio);
      created++;
      console.log(`✓ ${filename}  (${word.chinese} — ${word.english})`);
      // gentle rate limit to stay within free-tier quotas
      await new Promise((r) => setTimeout(r, 150));
    } catch (error) {
      console.error(`✗ ${filename}: ${(error as Error).message}`);
      throw error;
    }
  }

  console.log(`\nDone. ${created} created, ${skipped} skipped.`);
};

void main();
