import { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { ANIMALS } from '../data/gameData';
import { Animal, RecoveryRecord } from '../types/game';

export const AlbumScene = () => {
  const { discoveredAnimals, reputation, getRecoveryRecords } = useGameStore();
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [activeTab, setActiveTab] = useState<'album' | 'records'>('album');
  const recoveryRecords = getRecoveryRecords();

  const rarityColors: Record<string, string> = {
    common: 'from-gray-400 to-gray-500',
    uncommon: 'from-green-400 to-green-600',
    rare: 'from-blue-400 to-blue-600',
    legendary: 'from-yellow-400 to-orange-500',
  };

  const rarityLabels: Record<string, string> = {
    common: '普通',
    uncommon: '稀有',
    rare: '珍稀',
    legendary: '传说',
  };

  const rarityBadgeColors: Record<string, string> = {
    common: 'bg-gray-100 text-gray-600',
    uncommon: 'bg-green-100 text-green-700',
    rare: 'bg-blue-100 text-blue-700',
    legendary: 'bg-gradient-to-r from-yellow-200 to-orange-200 text-orange-700',
  };

  const sortedAnimals = [...ANIMALS].sort((a, b) => {
    const order = { common: 0, uncommon: 1, rare: 2, legendary: 3 };
    return order[a.rarity] - order[b.rarity];
  });

  const discoveredCount = discoveredAnimals.length;
  const totalCount = ANIMALS.length;

  const tabs = [
    { id: 'album', label: '📖 动物图鉴' },
    { id: 'records', label: '💖 康复故事' },
  ];

  return (
    <div className="flex-1 bg-gradient-to-b from-purple-100 to-indigo-100 p-4 overflow-auto">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-purple-700 mb-2">📖 图鉴 & 故事</h2>
          <p className="text-purple-500">记录你救助过的所有小动物和它们的康复故事</p>
        </div>

        {/* 标签切换 */}
        <div className="flex gap-2 mb-6 flex-wrap justify-center">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
              {tab.id === 'records' && recoveryRecords.length > 0 && (
                <span className="ml-1 text-xs bg-green-500 text-white px-1.5 py-0.5 rounded-full">
                  {recoveryRecords.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === 'album' && (
          <>
            {/* 收集进度 */}
            <div className="bg-white rounded-xl p-4 mb-6 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-700">🏆 收集进度</h3>
                <span className="text-sm text-purple-600 font-bold">
                  {discoveredCount} / {totalCount}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full transition-all"
                  style={{ width: `${(discoveredCount / totalCount) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                总声望: ⭐ {reputation}
              </p>
            </div>

            {/* 动物网格 */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sortedAnimals.map(animal => {
                const discovered = discoveredAnimals.includes(animal.id);
                
                return (
                  <div
                    key={animal.id}
                    onClick={() => discovered && setSelectedAnimal(animal)}
                    className={`relative rounded-2xl p-4 transition-all transform hover:scale-105 cursor-pointer ${
                      discovered
                        ? `bg-gradient-to-br ${rarityColors[animal.rarity]} shadow-lg`
                        : 'bg-gray-300 opacity-60'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-5xl mb-2">
                        {discovered ? animal.emoji : '❓'}
                      </div>
                      <p className={`font-bold ${discovered ? 'text-white' : 'text-gray-500'}`}>
                        {discovered ? animal.name : '???'}
                      </p>
                      {discovered && (
                        <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full ${rarityBadgeColors[animal.rarity]}`}>
                          {rarityLabels[animal.rarity]}
                        </span>
                      )}
                    </div>
                    {discovered && animal.rarity === 'legendary' && (
                      <div className="absolute -top-2 -right-2 text-2xl animate-bounce">
                        ✨
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {activeTab === 'records' && (
          <div>
            {recoveryRecords.length > 0 ? (
              <div className="space-y-4">
                {recoveryRecords.map(record => (
                  <div key={record.id} className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-5 border-2 border-green-200 shadow-md">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="text-6xl">{record.animalEmoji}</div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800">{record.animalName}</h3>
                        <div className="flex gap-3 mt-2 flex-wrap">
                          <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-medium">
                            {record.animalPersonality}
                          </span>
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                            偏爱{record.preferredCare}
                          </span>
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                            📅 第 {record.rescueDate} 天救助
                          </span>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            🌊 第 {record.releaseDate} 天放归
                          </span>
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                            ⏱️ 共 {record.totalDays} 天
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 mb-3">
                      <p className="text-gray-700 italic">"{record.notes}"</p>
                    </div>
                    {record.preferredCareMatches > 0 && (
                      <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl p-3 mb-3 border border-green-300">
                        <p className="text-sm text-green-800 font-medium">
                          💖 康复统计：共完成 {record.careEvents.length} 次照护，其中 <span className="text-green-600 font-bold">{record.preferredCareMatches}</span> 次匹配它的偏好，恢复得特别快！
                        </p>
                      </div>
                    )}
                    {record.careEvents.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-2 font-medium">💝 照护互动:</p>
                        <div className="flex flex-wrap gap-2">
                          {record.careEvents.map((event, idx) => (
                            <span key={idx} className="text-xs bg-pink-100 text-pink-700 px-3 py-1 rounded-full">
                              {event}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-12 text-center shadow-md">
                <span className="text-6xl">💖</span>
                <p className="text-gray-500 mt-4">还没有康复故事</p>
                <p className="text-gray-400 text-sm mt-1">救助并放归动物后，这里会记录每一次温暖的故事~</p>
              </div>
            )}
          </div>
        )}

        {/* 动物详情弹窗 */}
        {selectedAnimal && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedAnimal(null)}
          >
            <div
              className={`bg-gradient-to-br ${rarityColors[selectedAnimal.rarity]} rounded-3xl p-1 max-w-md w-full shadow-2xl`}
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-white rounded-3xl p-6">
                <div className="text-center">
                  <div className="text-7xl mb-3">{selectedAnimal.emoji}</div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {selectedAnimal.name}
                  </h3>
                  <span className={`inline-block mt-2 text-sm px-3 py-1 rounded-full ${rarityBadgeColors[selectedAnimal.rarity]}`}>
                    {rarityLabels[selectedAnimal.rarity]}
                  </span>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-700 mb-2">📝 简介</h4>
                    <p className="text-gray-600">{selectedAnimal.description}</p>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-4">
                    <h4 className="font-bold text-blue-700 mb-2">💖 康复故事</h4>
                    <p className="text-gray-600 text-sm">{selectedAnimal.story}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-green-50 rounded-xl p-3 text-center">
                      <p className="text-sm text-gray-500">恢复天数</p>
                      <p className="text-xl font-bold text-green-600">
                        {selectedAnimal.recoveryDays} 天
                      </p>
                    </div>
                    <div className="bg-yellow-50 rounded-xl p-3 text-center">
                      <p className="text-sm text-gray-500">声望奖励</p>
                      <p className="text-xl font-bold text-yellow-600">
                        ⭐ {selectedAnimal.reputationReward}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedAnimal(null)}
                  className="mt-6 w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
