import { neon } from "@neondatabase/serverless";
import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "@/db/schema";

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

// Vocabulary items per language: [man, woman, boy, girl, zombie, robot]
type Vocab = {
  man: string;
  woman: string;
  boy: string;
  girl: string;
  zombie: string;
  robot: string;
};

const LANGUAGES: { title: string; imageSrc: string; code: string; vocab: Vocab }[] = [
  {
    title: "Spanish",
    imageSrc: "/es.svg",
    code: "es",
    vocab: {
      man: "el hombre",
      woman: "la mujer",
      boy: "el chico",
      girl: "la niña",
      zombie: "el zombie",
      robot: "el robot",
    },
  },
  {
    title: "French",
    imageSrc: "/fr.svg",
    code: "fr",
    vocab: {
      man: "l'homme",
      woman: "la femme",
      boy: "le garçon",
      girl: "la fille",
      zombie: "le zombie",
      robot: "le robot",
    },
  },
  {
    title: "Japanese",
    imageSrc: "/jp.svg",
    code: "ja",
    vocab: {
      man: "男の人",
      woman: "女の人",
      boy: "男の子",
      girl: "女の子",
      zombie: "ゾンビ",
      robot: "ロボット",
    },
  },
  {
    title: "Chinese",
    imageSrc: "/zh.svg",
    code: "zh",
    vocab: {
      man: "男人 (nán rén)",
      woman: "女人 (nǚ rén)",
      boy: "男孩 (nán hái)",
      girl: "女孩 (nǚ hái)",
      zombie: "僵尸 (jiāng shī)",
      robot: "机器人 (jī qì rén)",
    },
  },
  {
    title: "English",
    imageSrc: "/en.svg",
    code: "en",
    vocab: {
      man: "the man",
      woman: "the woman",
      boy: "the boy",
      girl: "the girl",
      zombie: "the zombie",
      robot: "the robot",
    },
  },
];

const buildOptions = (
  vocab: Vocab,
  code: string
): Record<
  number,
  { correct: boolean; text: string; imageSrc?: string; audioSrc?: string }[]
> => ({
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
  // ASSIST — no images
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
  // ASSIST — no images
  8: [
    { correct: false, text: vocab.woman,  audioSrc: `/${code}_woman.mp3` },
    { correct: true,  text: vocab.zombie, audioSrc: `/${code}_zombie.mp3` },
    { correct: false, text: vocab.boy,    audioSrc: `/${code}_boy.mp3` },
  ],
});

const main = async () => {
  try {
    console.log("Seeding database");

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

    const courses = await db
      .insert(schema.courses)
      .values(LANGUAGES.map(({ title, imageSrc }) => ({ title, imageSrc })))
      .returning();

    for (const course of courses) {
      const lang = LANGUAGES.find((l) => l.title === course.title)!;
      const optionMap = buildOptions(lang.vocab, lang.code);

      const units = await db
        .insert(schema.units)
        .values([
          { courseId: course.id, title: "Unit 1", description: `Learn the basics of ${course.title}`, order: 1 },
          { courseId: course.id, title: "Unit 2", description: `Learn intermediate ${course.title}`, order: 2 },
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
            await db
              .insert(schema.challengeOptions)
              .values(
                optionMap[challenge.order].map((opt) => ({
                  challengeId: challenge.id,
                  ...opt,
                }))
              );
          }
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
