import { useGameStore } from './stores/gameStore';
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

export default function App() {
  const { currentScreen } = useGameStore();

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
    case 'tutorial': return <TutorialScreen />;
    default:       return <TitleScreen />;
  }
}
