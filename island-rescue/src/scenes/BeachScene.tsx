import { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { Animal, BeachFind } from '../types/game';

export const BeachScene = () => {
  const { searchBeach, rescueAnimal, collectDriftwood, currentWeather } = useGameStore();
  const [searchResult, setSearchResult] = useState<{
    found: boolean;
    result?: Animal | BeachFind;
    type?: 'animal' | 'driftwood';
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [message, setMessage] = useState('');

  const handleSearch = () => {
    if (isSearching) return;
    
    setIsSearching(true);
    setSearchResult(null);
    setMessage('');

    if (!currentWeather.canGoOut) {
      setMessage('⛈️ 暴风雨天气，不适合出海巡查哦！');
      setIsSearching(false);
      return;
    }

    setTimeout(() => {
      const result = searchBeach();
      setSearchResult(result);
      setIsSearching(false);

      if (!result.found) {
        setMessage('这次什么都没发现... 再试试吧！');
      }
    }, 1500);
  };

  const handleRescue = () => {
    if (searchResult?.type === 'animal' && searchResult.result) {
      const animal = searchResult.result as Animal;
      rescueAnimal(animal.id);
      setMessage(`🎉 成功救助了 ${animal.name}！快带它去诊疗室吧~`);
      setSearchResult(null);
    }
  };

  const handleCollect = () => {
    if (searchResult?.type === 'driftwood' && searchResult.result) {
      const item = searchResult.result as BeachFind;
      collectDriftwood(item);
      setMessage(`✨ 收集到了 ${item.name}！`);
      setSearchResult(null);
    }
  };

  return (
    <div className="flex-1 bg-gradient-to-b from-sky-300 via-ocean-200 to-sand-200 p-4 overflow-auto">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-ocean-800 mb-2">🏖️ 海岸巡查</h2>
          <p className="text-ocean-600">在海滩上寻找需要帮助的小动物和漂流物</p>
        </div>

        {/* 海滩场景展示 */}
        <div className="relative bg-gradient-to-b from-ocean-300 to-sand-300 rounded-3xl p-8 mb-6 min-h-[300px] shadow-inner overflow-hidden">
          {/* 太阳/云 */}
          <div className="absolute top-4 right-8 text-6xl animate-bounce-slow">
            {currentWeather.emoji}
          </div>
          
          {/* 海浪 */}
          <div className="absolute bottom-20 left-0 right-0">
            <div className="text-4xl text-ocean-500/50">
              🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊
            </div>
          </div>

          {/* 沙滩装饰 */}
          <div className="absolute bottom-4 left-8 text-3xl">🐚</div>
          <div className="absolute bottom-8 left-24 text-2xl">🦀</div>
          <div className="absolute bottom-6 right-16 text-3xl">🌴</div>
          <div className="absolute bottom-4 right-32 text-2xl">🪨</div>

          {/* 搜索结果 */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            {isSearching ? (
              <div className="text-center">
                <div className="text-6xl animate-bounce">🔍</div>
                <p className="mt-2 text-ocean-700 font-medium">正在搜索...</p>
              </div>
            ) : searchResult?.found && searchResult.result ? (
              <div className="text-center bg-white/80 backdrop-blur rounded-2xl p-6 shadow-lg animate-float">
                <div className="text-7xl mb-3">{searchResult.result.emoji}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">
                  {(searchResult.result as Animal).name || (searchResult.result as BeachFind).name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {searchResult.type === 'animal' 
                    ? '这只小动物受伤了，需要帮助！' 
                    : (searchResult.result as BeachFind).type === 'trash'
                      ? '清理一下吧~'
                      : '可以收起来哦！'}
                </p>
                {searchResult.type === 'animal' ? (
                  <button
                    onClick={handleRescue}
                    className="bg-island-500 hover:bg-island-600 text-white font-bold px-6 py-2 rounded-full transition-all hover:scale-105 active:scale-95 shadow-md"
                  >
                    🆘 救助它！
                  </button>
                ) : (
                  <button
                    onClick={handleCollect}
                    className="bg-ocean-500 hover:bg-ocean-600 text-white font-bold px-6 py-2 rounded-full transition-all hover:scale-105 active:scale-95 shadow-md"
                  >
                    ✋ 收集
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center text-ocean-600/60">
                <div className="text-5xl mb-2">👀</div>
                <p>点击下方按钮开始巡查</p>
              </div>
            )}
          </div>
        </div>

        {/* 消息提示 */}
        {message && (
          <div className="bg-white/80 backdrop-blur rounded-xl p-4 mb-4 text-center shadow-md">
            <p className="text-gray-700 font-medium">{message}</p>
          </div>
        )}

        {/* 搜索按钮 */}
        <div className="text-center">
          <button
            onClick={handleSearch}
            disabled={isSearching || !currentWeather.canGoOut}
            className={`text-xl font-bold px-12 py-4 rounded-full shadow-lg transition-all transform hover:scale-105 active:scale-95 ${
              currentWeather.canGoOut
                ? 'bg-gradient-to-r from-ocean-500 to-ocean-600 text-white hover:from-ocean-600 hover:to-ocean-700'
                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
            }`}
          >
            {isSearching ? '🔍 搜索中...' : '🚶 开始巡查海滩'}
          </button>
          {!currentWeather.canGoOut && (
            <p className="mt-2 text-red-500 font-medium">
              ⚠️ {currentWeather.description}
            </p>
          )}
        </div>

        {/* 天气提示 */}
        <div className="mt-6 bg-white/60 backdrop-blur rounded-xl p-4">
          <h3 className="font-bold text-gray-700 mb-2">📌 小提示</h3>
          <p className="text-gray-600 text-sm">{currentWeather.description}</p>
          <div className="mt-2 flex gap-4 text-sm text-gray-600">
            <span>🐾 动物出现: {Math.round(currentWeather.animalSpawnRate * 100)}%</span>
            <span>🪵 漂流物: {Math.round(currentWeather.driftwoodSpawnRate * 100)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
