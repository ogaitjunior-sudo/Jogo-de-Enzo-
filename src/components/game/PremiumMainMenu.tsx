import { useCallback, useEffect, useRef, useState } from "react";

import { playClick } from "@/game/sounds";

import "./premium-main-menu.css";

const BUTTON_ACTION_DELAY_MS = 170;
const BUTTON_GLOW_RESET_MS = 440;

type MenuAction = "start" | "ranking" | "story" | null;

interface PremiumMainMenuProps {
  onStart: () => void;
  onRanking: () => void;
  onStory: () => void;
}

interface PremiumMainMenuButtonProps {
  label: string;
  onClick: () => void;
  isActivated: boolean;
  variant?: "primary" | "secondary";
}

function PremiumMainMenuButton({
  label,
  onClick,
  isActivated,
  variant = "secondary",
}: PremiumMainMenuButtonProps) {
  const isPrimary = variant === "primary";

  return (
    <button
      type="button"
      className={[
        `premium-main-menu__button premium-main-menu__button--${variant}`,
        isActivated ? "premium-main-menu__button--activated" : "",
      ].join(" ")}
      onClick={onClick}
    >
      <span className="premium-main-menu__button-edge" aria-hidden="true" />
      <span className="premium-main-menu__button-outline" aria-hidden="true" />
      <span className="premium-main-menu__button-surface" aria-hidden="true" />
      <span className="premium-main-menu__button-grid" aria-hidden="true" />
      <span className="premium-main-menu__button-highlight" aria-hidden="true" />
      <span className="premium-main-menu__button-beam" aria-hidden="true" />
      <span className="premium-main-menu__button-spark premium-main-menu__button-spark--left" aria-hidden="true" />
      <span className="premium-main-menu__button-spark premium-main-menu__button-spark--right" aria-hidden="true" />
      {isPrimary ? (
        <span className="premium-main-menu__button-spark premium-main-menu__button-spark--center" aria-hidden="true" />
      ) : null}
      <span className="premium-main-menu__button-label">{label}</span>
    </button>
  );
}

export default function PremiumMainMenu({
  onStart,
  onRanking,
  onStory,
}: PremiumMainMenuProps) {
  const [activatedAction, setActivatedAction] = useState<MenuAction>(null);
  const actionTimeoutRef = useRef<number>();
  const glowTimeoutRef = useRef<number>();

  useEffect(() => {
    return () => {
      window.clearTimeout(actionTimeoutRef.current);
      window.clearTimeout(glowTimeoutRef.current);
    };
  }, []);

  const triggerAction = useCallback((action: Exclude<MenuAction, null>, callback: () => void) => {
    window.clearTimeout(actionTimeoutRef.current);
    window.clearTimeout(glowTimeoutRef.current);

    setActivatedAction(action);
    playClick();

    actionTimeoutRef.current = window.setTimeout(() => {
      callback();
    }, BUTTON_ACTION_DELAY_MS);

    glowTimeoutRef.current = window.setTimeout(() => {
      setActivatedAction((currentAction) => (currentAction === action ? null : currentAction));
    }, BUTTON_GLOW_RESET_MS);
  }, []);

  return (
    <nav className="premium-main-menu" aria-label="Menu principal">
      <span className="premium-main-menu__aura" aria-hidden="true" />
      <span className="premium-main-menu__field" aria-hidden="true" />

      <div className="premium-main-menu__panel">
        <span className="premium-main-menu__frame premium-main-menu__frame--outer" aria-hidden="true" />
        <span className="premium-main-menu__frame premium-main-menu__frame--inner" aria-hidden="true" />
        <span className="premium-main-menu__connector premium-main-menu__connector--left" aria-hidden="true" />
        <span className="premium-main-menu__connector premium-main-menu__connector--right" aria-hidden="true" />

        <div className="premium-main-menu__badge" aria-hidden="true">
          <span className="premium-main-menu__badge-text">MENU PRINCIPAL</span>
        </div>

        <div className="premium-main-menu__body">
          <span className="premium-main-menu__beam premium-main-menu__beam--top" aria-hidden="true" />
          <span className="premium-main-menu__beam premium-main-menu__beam--bottom" aria-hidden="true" />
          <span className="premium-main-menu__mesh" aria-hidden="true" />

          <span className="premium-main-menu__corner premium-main-menu__corner--top-left" aria-hidden="true" />
          <span className="premium-main-menu__corner premium-main-menu__corner--top-right" aria-hidden="true" />
          <span className="premium-main-menu__corner premium-main-menu__corner--bottom-left" aria-hidden="true" />
          <span className="premium-main-menu__corner premium-main-menu__corner--bottom-right" aria-hidden="true" />

          <span className="premium-main-menu__spark premium-main-menu__spark--top-left" aria-hidden="true" />
          <span className="premium-main-menu__spark premium-main-menu__spark--top-right" aria-hidden="true" />
          <span className="premium-main-menu__spark premium-main-menu__spark--bottom-center" aria-hidden="true" />

          <div className="premium-main-menu__actions">
            <PremiumMainMenuButton
              label="JOGAR"
              variant="primary"
              isActivated={activatedAction === "start"}
              onClick={() => triggerAction("start", onStart)}
            />

            <div className="premium-main-menu__secondary-grid">
              <PremiumMainMenuButton
                label="RANKING"
                isActivated={activatedAction === "ranking"}
                onClick={() => triggerAction("ranking", onRanking)}
              />
              <PremiumMainMenuButton
                label={"HIST\u00D3RIA"}
                isActivated={activatedAction === "story"}
                onClick={() => triggerAction("story", onStory)}
              />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
