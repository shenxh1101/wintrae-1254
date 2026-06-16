import { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { Animal, BeachFind, ExplorationRoute } from '../types/game';
import { BEACH_ROUTES, EXPLORATION_BOOSTS } from '../data/gameData';

export const BeachScene = () => {
  const {
    searchBeach,
    rescueAnimal,
    collectDriftwood,
    addPendingItem,
    collectPendingItem,
    discardPendingItem,
    pendingItems,
    currentWeather,
    setScene,
    getInventoryCount,
    warehouseCapacity,
    canAffordRoute,
    useItem,
    getUpgradeLevel,
  } = useGameStore();

  const [searchResult, setSearchResult] = useState<{
    found: boolean;
    result?: Animal | BeachFind;
    type?: 'animal' | 'driftwood';
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [message, setMessage] = useState('');
  const [showWarehouseFull, setShowWarehouseFull] = useState(false);
  const [pendingItemToCollect, setPendingItemToCollect] = useState<BeachFind | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<ExplorationRoute>('nearshore');

  const currentCount = getInventoryCount();
  const isWarehouseFull = currentCount >= warehouseCapacity;
  const explorationLevel = getUpgradeLevel('exploration');

  const handleSearch = () => {
    if (isSearching) return;

    setIsSearching(true);
    setSearchResult(null);
    setMessage('');
    setShowWarehouseFull(false);

    if (!currentWeather.canGoOut) {
      setMessage('⛈️ 暴风雨天气，不适合出海巡查哦！');
      setIsSearching(false);
      return;
    }

    const routeData = BEACH_ROUTES.find(r => r.id === selectedRoute);
    if (routeData && routeData.costSupplies.length > 0) {
      if (!canAffordRoute(selectedRoute)) {
        setMessage(`⚠️ 物资不足！需要 ${routeData.costLabel} 才能前往此路线`);
        setIsSearching(false);
        return;
      }
      for (const cost of routeData.costSupplies) {
        const success = useItem(cost.id, cost.quantity);
        if (!success) {
          setMessage('⚠️ 物资消耗失败，请重试');
          setIsSearching(false);
          return;
        }
      }
    }

    setTimeout(() => {
      const result = searchBeach(selectedRoute);
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

      if (item.type !== 'trash' && isWarehouseFull) {
        addPendingItem(item);
        setPendingItemToCollect(item);
        setShowWarehouseFull(true);
        setSearchResult(null);
        return;
      }

      const success = collectDriftwood(item);
      if (success) {
        setMessage(`✨ 收集到了 ${item.name}！`);
        setSearchResult(null);
      } else {
        addPendingItem(item);
        setPendingItemToCollect(item);
        setShowWarehouseFull(true);
        setSearchResult(null);
      }
    }
  };

  const handleCollectPending = (pendingId: string) => {
    const success = collectPendingItem(pendingId);
    if (success) {
      setMessage('✅ 收集成功！');
    } else {
      setMessage('⚠️ 仓库还是满的，先去出售或升级吧！');
    }
  };

  const handleDiscardPending = (pendingId: string) => {
    discardPendingItem(pendingId);
    setMessage('🗑️ 已放弃这件物品');
  };

  const explorationBoostPercent = explorationLevel > 0
    ? Math.round((EXPLORATION_BOOSTS.animal[explorationLevel - 1] - 1) * 100)
    : 0;

  return (
    <div className="flex-1 bg-gradient-to-b from-sky-300 via-ocean-200 to-sand-200 p-4 overflow-auto">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-ocean-800 mb-2">🏖️ 海岸巡查</h2>
          <p className="text-ocean-600">在海滩上寻找需要帮助的小动物和漂流物</p>
        </div>

        {isWarehouseFull && (
          <div className="bg-red-100 border-2 border-red-300 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⚠️</span>
                <div>
                  <p className="font-bold text-red-700">仓库已满！</p>
                  <p className="text-sm text-red-600">新收集的物品会进入待处理列表</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setScene('warehouse')}
                  className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-red-600 transition-all"
                >
                  去仓库处理
                </button>
              </div>
            </div>
          </div>
        )}

        {pendingItems.length > 0 && (
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 mb-4">
            <h3 className="font-bold text-yellow-800 mb-3 flex items-center gap-2">
              <span>📦</span> 待处理物品 ({pendingItems.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {pendingItems.map(pending => (
                <div
                  key={pending.id}
                  className="bg-white rounded-lg p-2 flex items-center gap-2 shadow-sm"
                >
                  <span className="text-2xl">{pending.item.emoji}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">{pending.item.name}</p>
                  </div>
                  <button
                    onClick={() => handleCollectPending(pending.id)}
                    className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold hover:bg-green-600"
                  >
                    收集
                  </button>
                  <button
                    onClick={() => handleDiscardPending(pending.id)}
                    className="bg-gray-400 text-white px-2 py-1 rounded text-xs font-bold hover:bg-gray-500"
                  >
                    放弃
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {message && (
          <div className="bg-white/80 backdrop-blur rounded-xl p-4 mb-4 text-center shadow-md">
            <p className="text-gray-700 font-medium">{message}</p>
          </div>
        )}

        <div className="relative bg-gradient-to-b from-ocean-300 to-sand-300 rounded-3xl p-8 mb-6 min-h-[300px] shadow-inner overflow-hidden">
          <div className="absolute top-4 right-8 text-6xl animate-bounce-slow">
            {currentWeather.emoji}
          </div>

          <div className="absolute bottom-20 left-0 right-0">
            <div className="text-4xl text-ocean-500/50">
              🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊
            </div>
          </div>

          <div className="absolute bottom-4 left-8 text-3xl">🐚</div>
          <div className="absolute bottom-8 left-24 text-2xl">🦀</div>
          <div className="absolute bottom-6 right-16 text-3xl">🌴</div>
          <div className="absolute bottom-4 right-32 text-2xl">🪨</div>

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
                <p>选择路线后开始巡查</p>
              </div>
            )}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-bold text-ocean-800 mb-3 text-center">🗺️ 选择巡查路线</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {BEACH_ROUTES.map(route => {
              const isSelected = selectedRoute === route.id;
              const affordable = canAffordRoute(route.id);
              const disabled = !affordable;

              return (
                <button
                  key={route.id}
                  onClick={() => !disabled && setSelectedRoute(route.id)}
                  disabled={disabled}
                  className={`relative text-left rounded-xl p-4 transition-all border-2 ${
                    isSelected
                      ? 'border-ocean-500 bg-ocean-50 shadow-md scale-[1.02]'
                      : disabled
                        ? 'border-gray-200 bg-gray-100 opacity-60 cursor-not-allowed'
                        : 'border-gray-200 bg-white/80 hover:border-ocean-300 hover:bg-ocean-50/50'
                  }`}
                >
                  {explorationLevel > 0 && isSelected && (
                    <span className="absolute -top-2 -right-2 bg-amber-400 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full shadow">
                      探索+{explorationBoostPercent}%
                    </span>
                  )}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{route.emoji}</span>
                    <span className="font-bold text-gray-800">{route.name}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{route.description}</p>
                  <div className="flex gap-3 text-xs text-gray-600 mb-2">
                    <span>🐾 {Math.round(route.animalChance * 100)}%</span>
                    <span>🪵 {Math.round(route.driftwoodChance * 100)}%</span>
                  </div>
                  <div className={`text-xs font-medium ${
                    route.costSupplies.length === 0
                      ? 'text-green-600'
                      : affordable
                        ? 'text-ocean-600'
                        : 'text-red-500'
                  }`}>
                    {route.costSupplies.length === 0 ? '✅ 免费' : `💰 ${route.costLabel}`}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

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
            {isSearching ? '🔍 搜索中...' : '🚶 开始巡查'}
          </button>
          {!currentWeather.canGoOut && (
            <p className="mt-2 text-red-500 font-medium">
              ⚠️ {currentWeather.description}
            </p>
          )}
        </div>

        <div className="mt-6 bg-white/60 backdrop-blur rounded-xl p-4">
          <h3 className="font-bold text-gray-700 mb-2">📌 小提示</h3>
          <p className="text-gray-600 text-sm">{currentWeather.description}</p>
          <div className="mt-2 flex gap-4 text-sm text-gray-600">
            <span>🐾 动物出现: {Math.round(currentWeather.animalSpawnRate * 100)}%</span>
            <span>🪵 漂流物: {Math.round(currentWeather.driftwoodSpawnRate * 100)}%</span>
            <span>📦 仓库: {currentCount}/{warehouseCapacity}</span>
          </div>
        </div>

        {showWarehouseFull && pendingItemToCollect && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
              <div className="text-center">
                <div className="text-6xl mb-3">📦</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">仓库已满！</h3>
                <p className="text-gray-600 mb-4">
                  你发现了 <span className="font-bold">{pendingItemToCollect.emoji} {pendingItemToCollect.name}</span>，
                  但是仓库已经装不下了。这件物品已加入待处理列表，你可以：
                </p>
              </div>
              <div className="space-y-3 mt-6">
                <button
                  onClick={() => {
                    setShowWarehouseFull(false);
                    setScene('warehouse');
                  }}
                  className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold hover:from-green-600 hover:to-emerald-600 transition-all"
                >
                  💰 去仓库出售物品
                </button>
                <button
                  onClick={() => {
                    setShowWarehouseFull(false);
                    setScene('warehouse');
                  }}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-bold hover:from-blue-600 hover:to-indigo-600 transition-all"
                >
                  ⬆️ 去仓库升级容量
                </button>
                <button
                  onClick={() => setShowWarehouseFull(false)}
                  className="w-full py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
                >
                  稍后再说
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
