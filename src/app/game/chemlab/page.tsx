import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chemistry Lab",
  description: "COMET DEVELOPS의 Chemistry Lab 게임",
};

const GAME_URL = "https://chemistry-lab-jet.vercel.app/game/chemlab";

export default function ChemistryLabPage() {
  return (
    <section className="h-svh min-h-[700px] bg-[#f5f4ff]">
      <iframe
        className="h-full w-full border-0"
        src={GAME_URL}
        title="Chemistry Lab"
        allow="fullscreen"
      />
    </section>
  );
}
