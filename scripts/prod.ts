import { neon } from "@neondatabase/serverless";
import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "@/db/schema";
import { type Word, ZH_UNITS } from "./zh-content";

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

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

// ─── Chinese challenge builder (HSK curriculum) ────────────────────────────

type ChallengeRow = {
  type: "SELECT" | "ASSIST";
  question: string;
  order: number;
  options: { correct: boolean; text: string; audioSrc?: string }[];
};

const buildZhChallenges = (words: Word[]): ChallengeRow[] => {
  const [w0, w1, w2, w3, w4, w5] = words;
  const opt = (w: Word, correct: boolean) => ({
    correct,
    text: `${w.chinese} (${w.pinyin})`,
    audioSrc: `/zh_${w.slug}.mp3`,
  });
  const eng = (w: Word, correct: boolean) => ({
    correct,
    text: w.english,
    audioSrc: `/zh_${w.slug}.mp3`,
  });

  return [
    // SELECT: English question → pick correct Chinese
    { type: "SELECT", order: 1, question: `Which one means "${w0.english}"?`,   options: [opt(w0, true),  opt(w1, false), opt(w2, false)] },
    { type: "SELECT", order: 2, question: `Which one means "${w1.english}"?`,   options: [opt(w1, true),  opt(w3, false), opt(w4, false)] },
    { type: "SELECT", order: 3, question: `Which one means "${w2.english}"?`,   options: [opt(w2, true),  opt(w0, false), opt(w5, false)] },
    // ASSIST: Chinese shown → pick correct English meaning
    { type: "ASSIST", order: 4, question: w0.chinese,                           options: [eng(w0, true),  eng(w1, false), eng(w3, false)] },
    // SELECT continued
    { type: "SELECT", order: 5, question: `Which one means "${w3.english}"?`,   options: [opt(w3, true),  opt(w4, false), opt(w5, false)] },
    { type: "SELECT", order: 6, question: `Which one means "${w4.english}"?`,   options: [opt(w4, true),  opt(w2, false), opt(w0, false)] },
    { type: "SELECT", order: 7, question: `Which one means "${w5.english}"?`,   options: [opt(w5, true),  opt(w1, false), opt(w3, false)] },
    // ASSIST: Chinese shown → pick correct English meaning
    { type: "ASSIST", order: 8, question: w3.chinese,                           options: [eng(w3, true),  eng(w4, false), eng(w5, false)] },
  ];
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

    const [zhCourse] = await db
      .insert(schema.courses)
      .values([{ title: "Chinese", imageSrc: "/zh.svg" }])
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
              optionMap[challenge.order].map((opt) => ({ challengeId: challenge.id, ...opt }))
            );
          }
        }
      }
    }

    // ── 3. Chinese HSK curriculum ─────────────────────────────────────────
    for (let ui = 0; ui < ZH_UNITS.length; ui++) {
      const unitData = ZH_UNITS[ui];

      const [unit] = await db
        .insert(schema.units)
        .values([{
          courseId: zhCourse.id,
          title: unitData.title,
          description: unitData.description,
          order: ui + 1,
        }])
        .returning();

      for (let li = 0; li < unitData.lessons.length; li++) {
        const lessonData = unitData.lessons[li];

        const [lesson] = await db
          .insert(schema.lessons)
          .values([{ unitId: unit.id, title: lessonData.title, order: li + 1 }])
          .returning();

        const challengeRows = buildZhChallenges(lessonData.words);

        const challenges = await db
          .insert(schema.challenges)
          .values(challengeRows.map(({ type, question, order }) => ({
            lessonId: lesson.id,
            type,
            question,
            order,
          })))
          .returning();

        for (const challenge of challenges) {
          const row = challengeRows.find((r) => r.order === challenge.order)!;
          await db.insert(schema.challengeOptions).values(
            row.options.map((opt) => ({ challengeId: challenge.id, ...opt }))
          );
        }
      }
    }

    console.log("Database seeded successfully");
  } catch (error) {
    console.error(error);
    throw new Error("Failed to seed database");
  }
};

void main();
