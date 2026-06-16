import { useGameStore } from '../store/useGameStore';

export const TopBar = () => {
  const { day, reputation, coins, currentWeather, activeFestival, nextDay, pendingItems, getStationLevel, getNextStationLevel } = useGameStore();
  const stationLevel = getStationLevel();
  const nextLevel = getNextStationLevel();

  return (
    <div className="bg-gradient-to-r from-ocean-600 to-ocean-500 text-white p-3 shadow-lg">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
            <span>📅</span>
            <span className="font-bold">第 {day} 天</span>
          </div>
          <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
            <span className="text-2xl">{currentWeather.emoji}</span>
            <span className="font-medium">{currentWeather.name}</span>
          </div>
          {activeFestival && (
            <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-yellow-900 rounded-full px-3 py-1 shadow-md">
              <span className="text-xl">{activeFestival.emoji}</span>
              <span className="font-bold">{activeFestival.name}</span>
              <span className="bg-white/50 px-2 py-0.5 rounded-full text-xs font-bold">
                剩余 {activeFestival.remainingDays} 天
              </span>
            </div>
          )}
          {pendingItems.length > 0 && (
            <div className="flex items-center gap-2 bg-red-500/90 rounded-full px-3 py-1 animate-pulse">
              <span className="text-xl">📦</span>
              <span className="font-bold text-sm">
                {pendingItems.length} 件待处理
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full px-3 py-1 shadow-md">
            <span className="text-xl">🏛️</span>
            <div>
              <span className="font-bold text-sm">Lv.{stationLevel.level} {stationLevel.name}</span>
              {nextLevel && (
                <span className="text-xs block opacity-90">
                  还差 {nextLevel.requiredReputation - reputation} 声望升级
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-yellow-400/90 text-yellow-900 rounded-full px-4 py-1.5 shadow">
            <span className="text-xl">🪙</span>
            <span className="font-bold">{coins}</span>
          </div>
          <div className="flex items-center gap-2 bg-pink-400/90 text-pink-900 rounded-full px-4 py-1.5 shadow">
            <span className="text-xl">⭐</span>
            <span className="font-bold">{reputation}</span>
          </div>
          <button
            onClick={nextDay}
            className="bg-island-500 hover:bg-island-600 text-white font-bold px-4 py-2 rounded-full shadow-md transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <span>🌙</span>
            <span>下一天</span>
          </button>
        </div>
      </div>
    </div>
  );
};
