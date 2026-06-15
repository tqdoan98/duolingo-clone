"use client";

import Image from "next/image";
import { Volume2 } from "lucide-react";
import { useAudio } from "react-use";

type QuestionBubbleProps = {
  question: string;
  audioSrc?: string | null;
};

export const QuestionBubble = ({ question, audioSrc }: QuestionBubbleProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [audio, _, controls] = useAudio({ src: audioSrc || "" });

  return (
    <div className="mb-6 flex items-center gap-x-4">
      {audio}
      <Image
        src="/mascot.svg"
        alt="Mascot"
        height={60}
        width={60}
        className="hidden lg:block"
      />
      <Image
        src="/mascot.svg"
        alt="Mascot"
        height={40}
        width={40}
        className="block lg:hidden"
      />

      <div className="relative flex items-center gap-x-3 rounded-xl border-2 px-4 py-2 text-sm lg:text-base">
        {question}

        {audioSrc && (
          <button
            type="button"
            onClick={() => void controls.play()}
            aria-label="Play pronunciation"
            className="text-sky-500 transition hover:text-sky-600"
          >
            <Volume2 className="h-5 w-5" />
          </button>
        )}

        <div
          className="absolute -left-3 top-1/2 h-0 w-0 -translate-y-1/2 rotate-90 transform border-x-8 border-t-8 border-x-transparent"
          aria-hidden
        />
      </div>
    </div>
  );
};
