import { readFileSync } from "fs";
import { join } from "path";

import { neon } from "@neondatabase/serverless";
import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "@/db/schema";
import { type Word, ZH_UNITS } from "./zh-content";

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

const shuffle = <T>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const chunk = <T>(arr: T[], size: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

// ─── Scaffold languages (starter placeholder content) ─────────────────────

type Vocab = {
  man: string; woman: string; boy: string;
  girl: string; zombie: string; robot: string;
};

const SCAFFOLD_LANGUAGES = [
  {
    title: "Spanish", imageSrc: "/es.svg", code: "es",
    vocab: { man: "el hombre", woman: "la mujer", boy: "el chico", girl: "la niña", zombie: "el zombie", robot: "el robot" },
  },
  {
    title: "French", imageSrc: "/fr.svg", code: "fr",
    vocab: { man: "l'homme", woman: "la femme", boy: "le garçon", girl: "la fille", zombie: "le zombie", robot: "le robot" },
  },
  {
    title: "Japanese", imageSrc: "/jp.svg", code: "ja",
    vocab: { man: "男の人", woman: "女の人", boy: "男の子", girl: "女の子", zombie: "ゾンビ", robot: "ロボット" },
  },
  {
    title: "English", imageSrc: "/en.svg", code: "en",
    vocab: { man: "the man", woman: "the woman", boy: "the boy", girl: "the girl", zombie: "the zombie", robot: "the robot" },
  },
] satisfies { title: string; imageSrc: string; code: string; vocab: Vocab }[];

const buildScaffoldOptions = (
  vocab: Vocab,
  code: string
): Record<number, { correct: boolean; text: string; imageSrc?: string; audioSrc?: string }[]> => ({
  1: [
    { correct: true,  text: vocab.man,    imageSrc: "/man.svg",    audioSrc: `/${code}_man.mp3` },
    { correct: false, text: vocab.woman,  imageSrc: "/woman.svg",  audioSrc: `/${code}_woman.mp3` },
    { correct: false, text: vocab.boy,    imageSrc: "/boy.svg",    audioSrc: `/${code}_boy.mp3` },
  ],
  2: [
    { correct: true,  text: vocab.woman,  imageSrc: "/woman.svg",  audioSrc: `/${code}_woman.mp3` },
    { correct: false, text: vocab.boy,    imageSrc: "/boy.svg",    audioSrc: `/${code}_boy.mp3` },
    { correct: false, text: vocab.man,    imageSrc: "/man.svg",    audioSrc: `/${code}_man.mp3` },
  ],
  3: [
    { correct: false, text: vocab.woman,  imageSrc: "/woman.svg",  audioSrc: `/${code}_woman.mp3` },
    { correct: false, text: vocab.man,    imageSrc: "/man.svg",    audioSrc: `/${code}_man.mp3` },
    { correct: true,  text: vocab.boy,    imageSrc: "/boy.svg",    audioSrc: `/${code}_boy.mp3` },
  ],
  4: [
    { correct: false, text: vocab.woman,  audioSrc: `/${code}_woman.mp3` },
    { correct: true,  text: vocab.man,    audioSrc: `/${code}_man.mp3` },
    { correct: false, text: vocab.boy,    audioSrc: `/${code}_boy.mp3` },
  ],
  5: [
    { correct: false, text: vocab.man,    imageSrc: "/man.svg",    audioSrc: `/${code}_man.mp3` },
    { correct: false, text: vocab.woman,  imageSrc: "/woman.svg",  audioSrc: `/${code}_woman.mp3` },
    { correct: true,  text: vocab.zombie, imageSrc: "/zombie.svg", audioSrc: `/${code}_zombie.mp3` },
  ],
  6: [
    { correct: true,  text: vocab.robot,  imageSrc: "/robot.svg",  audioSrc: `/${code}_robot.mp3` },
    { correct: false, text: vocab.zombie, imageSrc: "/zombie.svg", audioSrc: `/${code}_zombie.mp3` },
    { correct: false, text: vocab.boy,    imageSrc: "/boy.svg",    audioSrc: `/${code}_boy.mp3` },
  ],
  7: [
    { correct: true,  text: vocab.girl,   imageSrc: "/girl.svg",   audioSrc: `/${code}_girl.mp3` },
    { correct: false, text: vocab.zombie, imageSrc: "/zombie.svg", audioSrc: `/${code}_zombie.mp3` },
    { correct: false, text: vocab.man,    imageSrc: "/man.svg",    audioSrc: `/${code}_man.mp3` },
  ],
  8: [
    { correct: false, text: vocab.woman,  audioSrc: `/${code}_woman.mp3` },
    { correct: true,  text: vocab.zombie, audioSrc: `/${code}_zombie.mp3` },
    { correct: false, text: vocab.boy,    audioSrc: `/${code}_boy.mp3` },
  ],
});

// ─── Chinese (HSK) course builder ──────────────────────────────────────────

type ZWord = Word & { radical?: string };
type ZLesson = { title: string; words: ZWord[] };
type ZUnit = { title: string; description: string; lessons: ZLesson[] };

const OPTIONS_PER_CHALLENGE = 4;

const pinyinInitial = (pinyin: string): string =>
  (pinyin.match(/[a-z]/i)?.[0] ?? "").toLowerCase();

// Smart distractors: prefer words sharing a radical or pinyin initial with the
// target (harder to tell apart), then fall back to random words in the level.
const pickDistractors = (word: ZWord, pool: ZWord[], n: number): ZWord[] => {
  const others = pool.filter(
    (p) => p.chinese !== word.chinese && p.english !== word.english
  );
  const similar = shuffle(
    others.filter(
      (p) =>
        (word.radical && p.radical === word.radical) ||
        pinyinInitial(p.pinyin) === pinyinInitial(word.pinyin)
    )
  );
  const similarSet = new Set(similar);
  const rest = shuffle(others.filter((p) => !similarSet.has(p)));
  return [...similar, ...rest].slice(0, n);
};

type BuiltChallenge = {
  type: "SELECT" | "ASSIST" | "WRITE";
  question: string;
  order: number;
  audioSrc: string | null;
  options: { correct: boolean; text: string; audioSrc?: string }[];
};

// Pattern per word index: 0=SELECT, 1=ASSIST, 2=WRITE, repeating.
const buildChineseChallenges = (
  lessonWords: ZWord[],
  pool: ZWord[],
  showPinyin: boolean
): BuiltChallenge[] => {
  const label = (w: ZWord) => (showPinyin ? `${w.chinese} (${w.pinyin})` : w.chinese);
  const audio = (w: ZWord) => `/zh_${w.slug}.mp3`;

  return lessonWords.map((word, i) => {
    const mod = i % 3;

    if (mod === 0) {
      // SELECT: English prompt → pick the correct Chinese word.
      const distractors = pickDistractors(word, pool, OPTIONS_PER_CHALLENGE - 1);
      const options = shuffle([
        { correct: true, text: label(word), audioSrc: audio(word) },
        ...distractors.map((d) => ({ correct: false, text: label(d), audioSrc: audio(d) })),
      ]);
      return {
        type: "SELECT" as const,
        question: `What is "${word.english}"?`,
        order: i + 1,
        audioSrc: null,
        options,
      };
    }

    if (mod === 1) {
      // ASSIST (listening): Chinese shown → pick the English meaning.
      const distractors = pickDistractors(word, pool, OPTIONS_PER_CHALLENGE - 1);
      const options = shuffle([
        { correct: true, text: word.english },
        ...distractors.map((d) => ({ correct: false, text: d.english })),
      ]);
      return {
        type: "ASSIST" as const,
        question: label(word),
        order: i + 1,
        audioSrc: audio(word),
        options,
      };
    }

    // WRITE: Chinese shown → type the English meaning.
    return {
      type: "WRITE" as const,
      question: label(word),
      order: i + 1,
      audioSrc: audio(word),
      // One correct option — the expected typed answer.
      options: [{ correct: true, text: word.english, audioSrc: audio(word) }],
    };
  });
};

// Split a flat word list into lessons of 7 and units of 6 lessons.
const buildLevelUnits = (words: ZWord[], level: number): ZUnit[] => {
  const lessons = chunk(words, 7);
  return chunk(lessons, 6).map((unitLessons, ui) => ({
    title: `Unit ${ui + 1}`,
    description: `HSK ${level} vocabulary · part ${ui + 1}`,
    lessons: unitLessons.map((w, li) => ({ title: `Lesson ${li + 1}`, words: w })),
  }));
};

// Efficient batched insert of an entire Chinese course.
const seedChineseCourse = async (
  courseId: number,
  units: ZUnit[],
  showPinyin: boolean
) => {
  const CHUNK = 500;

  const unitRows = await db
    .insert(schema.units)
    .values(units.map((u, i) => ({ courseId, title: u.title, description: u.description, order: i + 1 })))
    .returning();

  // Flatten lessons (preserving order) so we can bulk-insert them.
  const lessonValues: { unitId: number; title: string; order: number }[] = [];
  const lessonWords: ZWord[][] = [];
  units.forEach((u, ui) =>
    u.lessons.forEach((l, li) => {
      lessonValues.push({ unitId: unitRows[ui].id, title: l.title, order: li + 1 });
      lessonWords.push(l.words);
    })
  );

  const lessonRows: (typeof schema.lessons.$inferSelect)[] = [];
  for (const c of chunk(lessonValues, CHUNK))
    lessonRows.push(...(await db.insert(schema.lessons).values(c).returning()));

  const pool = units.flatMap((u) => u.lessons.flatMap((l) => l.words));

  // Build challenges with a parallel array of their option sets.
  const challengeValues: {
    lessonId: number; type: "SELECT" | "ASSIST" | "WRITE"; question: string; order: number; audioSrc: string | null;
  }[] = [];
  const optionSets: BuiltChallenge["options"][] = [];

  lessonRows.forEach((lesson, idx) => {
    for (const b of buildChineseChallenges(lessonWords[idx], pool, showPinyin)) {
      challengeValues.push({
        lessonId: lesson.id,
        type: b.type,
        question: b.question,
        order: b.order,
        audioSrc: b.audioSrc,
      });
      optionSets.push(b.options);
    }
  });

  // Insert challenges in chunks; returning order matches insertion order, so we
  // zip each returned id with its pre-built option set.
  const optionValues: { challengeId: number; correct: boolean; text: string; audioSrc?: string }[] = [];
  let gi = 0;
  for (const c of chunk(challengeValues, CHUNK)) {
    const rows = await db.insert(schema.challenges).values(c).returning();
    rows.forEach((row, j) => {
      for (const opt of optionSets[gi + j]) optionValues.push({ challengeId: row.id, ...opt });
    });
    gi += c.length;
  }

  for (const c of chunk(optionValues, CHUNK))
    await db.insert(schema.challengeOptions).values(c);
};

// ─── Main ──────────────────────────────────────────────────────────────────

const main = async () => {
  try {
    console.log("Seeding database…");

    await Promise.all([
      db.delete(schema.userProgress),
      db.delete(schema.challengeProgress),
      db.delete(schema.challengeOptions),
      db.delete(schema.challenges),
      db.delete(schema.lessons),
      db.delete(schema.units),
      db.delete(schema.courses),
      db.delete(schema.userSubscription),
    ]);

    // ── 1. Insert all courses ─────────────────────────────────────────────
    const scaffoldCourses = await db
      .insert(schema.courses)
      .values(SCAFFOLD_LANGUAGES.map(({ title, imageSrc }) => ({ title, imageSrc })))
      .returning();

    const chineseCourses = await db
      .insert(schema.courses)
      .values([1, 2, 3, 4, 5, 6].map((lvl) => ({ title: `Chinese · HSK ${lvl}`, imageSrc: "/zh.svg" })))
      .returning();

    // ── 2. Scaffold languages (Spanish, French, Japanese, English) ────────
    for (const course of scaffoldCourses) {
      const lang = SCAFFOLD_LANGUAGES.find((l) => l.title === course.title)!;
      const optionMap = buildScaffoldOptions(lang.vocab, lang.code);

      const units = await db
        .insert(schema.units)
        .values([
          { courseId: course.id, title: "Unit 1", description: `Learn the basics of ${course.title}`, order: 1 },
          { courseId: course.id, title: "Unit 2", description: `Learn intermediate ${course.title}`,  order: 2 },
        ])
        .returning();

      for (const unit of units) {
        const lessons = await db
          .insert(schema.lessons)
          .values([
            { unitId: unit.id, title: "Nouns",      order: 1 },
            { unitId: unit.id, title: "Verbs",      order: 2 },
            { unitId: unit.id, title: "Adjectives", order: 3 },
            { unitId: unit.id, title: "Phrases",    order: 4 },
            { unitId: unit.id, title: "Sentences",  order: 5 },
          ])
          .returning();

        for (const lesson of lessons) {
          const challenges = await db
            .insert(schema.challenges)
            .values([
              { lessonId: lesson.id, type: "SELECT", question: `Which one of these is "${lang.vocab.man}"?`,    order: 1 },
              { lessonId: lesson.id, type: "SELECT", question: `Which one of these is "${lang.vocab.woman}"?`,  order: 2 },
              { lessonId: lesson.id, type: "SELECT", question: `Which one of these is "${lang.vocab.boy}"?`,    order: 3 },
              { lessonId: lesson.id, type: "ASSIST", question: `"${lang.vocab.man}"`,                           order: 4 },
              { lessonId: lesson.id, type: "SELECT", question: `Which one of these is "${lang.vocab.zombie}"?`, order: 5 },
              { lessonId: lesson.id, type: "SELECT", question: `Which one of these is "${lang.vocab.robot}"?`,  order: 6 },
              { lessonId: lesson.id, type: "SELECT", question: `Which one of these is "${lang.vocab.girl}"?`,   order: 7 },
              { lessonId: lesson.id, type: "ASSIST", question: `"${lang.vocab.zombie}"`,                        order: 8 },
            ])
            .returning();

          for (const challenge of challenges) {
            await db.insert(schema.challengeOptions).values(
              shuffle(optionMap[challenge.order]).map((opt) => ({ challengeId: challenge.id, ...opt }))
            );
          }
        }
      }
    }

    // ── 3. Chinese HSK 1-6 ────────────────────────────────────────────────
    // HSK 1: hand-curated thematic units (pinyin shown).
    const [hsk1] = chineseCourses;
    await seedChineseCourse(hsk1.id, ZH_UNITS as ZUnit[], true);

    // HSK 2-6: generated from the open HSK dataset. Pinyin is shown through
    // HSK 2, then hidden (characters-only) from HSK 3 up to raise difficulty.
    const zhData = JSON.parse(
      readFileSync(join(import.meta.dirname, "zh-hsk-data.json"), "utf-8")
    ) as Record<string, ZWord[]>;

    for (let lvl = 2; lvl <= 6; lvl++) {
      const course = chineseCourses[lvl - 1];
      const units = buildLevelUnits(zhData[String(lvl)], lvl);
      await seedChineseCourse(course.id, units, lvl <= 2);
      console.log(`  Seeded Chinese · HSK ${lvl} (${zhData[String(lvl)].length} words)`);
    }

    console.log("Database seeded successfully");
  } catch (error) {
    console.error(error);
    throw new Error("Failed to seed database");
  }
};

void main();
