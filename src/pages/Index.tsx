import { useState } from "react";

import BattleScreen from "@/components/game/BattleScreen";
import CharacterSelect from "@/components/game/CharacterSelect";
import DefeatScreen from "@/components/game/DefeatScreen";
import DifficultySelect from "@/components/game/DifficultySelect";
import RankingScreen from "@/components/game/RankingScreen";
import StoryScreen from "@/components/game/StoryScreen";
import TitleScreen from "@/components/game/TitleScreen";
import VictoryScreen from "@/components/game/VictoryScreen";
import { addToRanking } from "@/game/ranking";
import { getCharacterName } from "@/game/roster";
import { Character, Difficulty, GameScreen } from "@/game/types";

type BattleOutcome = "victory" | "defeat";

export default function Index() {
  const [screen, setScreen] = useState<GameScreen>("title");
  const [character, setCharacter] = useState<Character>("enzo");
  const [difficulty, setDifficulty] = useState<Difficulty>("facil");
  const [finalScore, setFinalScore] = useState(0);
  const [battleRunId, setBattleRunId] = useState(0);
  const [hasSeenIntro, setHasSeenIntro] = useState(false);

  const startBattle = (selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);
    setBattleRunId((currentRunId) => currentRunId + 1);
    setScreen("battle");
  };

  const persistBattleResult = (score: number, outcome: BattleOutcome) => {
    setFinalScore(score);
    addToRanking({
      name: getCharacterName(character),
      character,
      score,
      difficulty,
      date: new Date().toLocaleDateString("pt-BR"),
    });
    setScreen(outcome);
  };

  return (
    <>
      {screen === "title" && (
        <TitleScreen
          onStart={() => setScreen("character-select")}
          onRanking={() => setScreen("ranking")}
          onStory={() => setScreen("story")}
          shouldPlayIntro={!hasSeenIntro}
          onIntroComplete={() => setHasSeenIntro(true)}
        />
      )}

      {screen === "character-select" && (
        <CharacterSelect
          onSelect={(selectedCharacter) => {
            setCharacter(selectedCharacter);
            setScreen("difficulty-select");
          }}
          onBack={() => setScreen("title")}
        />
      )}

      {screen === "difficulty-select" && (
        <DifficultySelect
          onSelect={startBattle}
          onBack={() => setScreen("character-select")}
        />
      )}

      {screen === "ranking" && <RankingScreen onBack={() => setScreen("title")} />}

      {screen === "story" && <StoryScreen onBack={() => setScreen("title")} />}

      {screen === "battle" && (
        <BattleScreen
          key={`${character}-${difficulty}-${battleRunId}`}
          character={character}
          difficulty={difficulty}
          onVictory={(score) => persistBattleResult(score, "victory")}
          onDefeat={(score) => persistBattleResult(score, "defeat")}
        />
      )}

      {screen === "victory" && (
        <VictoryScreen
          score={finalScore}
          onMenu={() => setScreen("title")}
          onRestartAtDifferentLevel={() => setScreen("difficulty-select")}
        />
      )}

      {screen === "defeat" && (
        <DefeatScreen
          score={finalScore}
          onMenu={() => setScreen("title")}
          onRetry={() => startBattle(difficulty)}
        />
      )}
    </>
  );
}
