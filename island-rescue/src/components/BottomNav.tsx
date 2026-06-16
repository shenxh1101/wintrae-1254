import { useGameStore } from '../store/useGameStore';
import { SceneType } from '../types/game';

const NAV_ITEMS: { id: SceneType; label: string; emoji: string }[] = [
  { id: 'beach', label: '海岸', emoji: '🏖️' },
  { id: 'clinic', label: '诊疗室', emoji: '🏥' },
  { id: 'warehouse', label: '仓库', emoji: '📦' },
  { id: 'album', label: '图鉴', emoji: '📖' },
  { id: 'tasks', label: '任务', emoji: '📋' },
];

export const BottomNav = () => {
  const { currentScene, setScene } = useGameStore();

  return (
    <div className="bg-white border-t-2 border-ocean-200 shadow-lg">
      <div className="flex justify-around py-2">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setScene(item.id)}
            className={`flex flex-col items-center px-6 py-2 rounded-xl transition-all ${
              currentScene === item.id
                ? 'bg-ocean-100 text-ocean-700 scale-110'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <span className="text-2xl mb-1">{item.emoji}</span>
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
