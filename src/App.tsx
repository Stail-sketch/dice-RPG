import { useGameStore } from './stores/gameStore';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// デバッグ用: ブラウザコンソールからアクセス可能
(window as any).__store = useGameStore;
import { TitleScreen } from './components/TitleScreen';
import { TownScreen } from './components/town/TownScreen';
import { DungeonScreen } from './components/dungeon/DungeonScreen';
import { BattleScreen } from './components/battle/BattleScreen';
import { DiceEditorScreen } from './components/dice-editor/DiceEditorScreen';
import { ForgeScreen } from './components/forge/ForgeScreen';
import { ShopScreen } from './components/shop/ShopScreen';
import { GachaScreen } from './components/gacha/GachaScreen';
import { CodexScreen } from './components/codex/CodexScreen';
import { TutorialScreen } from './components/tutorial/TutorialScreen';
import { PvpScreen } from './components/pvp/PvpScreen';
import { EventScreen } from './components/event/EventScreen';
import { SettingsScreen } from './components/settings/SettingsScreen';
import { BGMController } from './components/common/BGMController';

function ScreenRouter() {
  const { currentScreen } = useGameStore();

  const screen = (() => {
    switch (currentScreen) {
      case 'title':  return <TitleScreen />;
      case 'town':   return <TownScreen />;
      case 'dungeon': return <DungeonScreen />;
      case 'battle': return <BattleScreen />;
      case 'dice-editor': return <DiceEditorScreen />;
      case 'forge':  return <ForgeScreen />;
      case 'shop':   return <ShopScreen />;
      case 'gacha':  return <GachaScreen />;
      case 'codex':  return <CodexScreen />;
      case 'pvp':    return <PvpScreen />;
      case 'event':  return <EventScreen />;
      case 'settings': return <SettingsScreen />;
      case 'tutorial': return <TutorialScreen />;
      default:       return <TitleScreen />;
    }
  })();

  return (
    <div key={currentScreen} className="screen-enter">
      {screen}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BGMController />
      <ScreenRouter />
    </ErrorBoundary>
  );
}
