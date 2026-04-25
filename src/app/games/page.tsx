import { LoveGenerator } from "@/components/games/love-generator";
import { SecretUnlock } from "@/components/games/secret-unlock";
import { DrawBoard } from "@/components/games/draw-board";
import { GamesTitle } from "@/components/games/games-title";

export default function GamesPage() {
  return (
    <div className="space-y-5 animate-fade-up">
      <GamesTitle />
      <LoveGenerator />
      <SecretUnlock />
      <DrawBoard />
    </div>
  );
}
