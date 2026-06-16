import { useState, useMemo } from 'react';
import { useGameStore } from '../store/useGameStore';
import {
  WAREHOUSE_LEVELS,
  DECORATIONS,
  INITIAL_INVENTORY,
  STATION_LEVELS,
  UPGRADE_PATHS,
  ANIMAL_CATEGORIES,
  getWeekReport,
  getMonthReport,
} from '../data/gameData';

const SHOP_ITEMS = [
  { id: 'bandage', name: '绷带', emoji: '🩹', price: 10, description: '用于包扎伤口' },
  { id: 'medicine', name: '药膏', emoji: '🧴', price: 20, description: '帮助伤口愈合' },
  { id: 'towel', name: '毛巾', emoji: '🧻', price: 8, description: '清洁动物身体' },
  { id: 'food', name: '鱼食', emoji: '🐟', price: 5, description: '给动物们的食物' },
];

const SELLABLE_ITEMS = [
  { id: 'wood', name: '浮木', emoji: '🪵', price: 5 },
  { id: 'shell', name: '贝壳', emoji: '🐚', price: 8 },
  { id: 'bottle', name: '漂流瓶', emoji: '🍾', price: 15 },
  { id: 'chest', name: '宝箱', emoji: '📦', price: 50 },
  { id: 'pearl', name: '珍珠', emoji: '🫧', price: 40 },
  { id: 'coral', name: '珊瑚', emoji: '🪸', price: 20 },
];

export const WarehouseScene = () => {
  const {
    inventory,
    warehouseLevel,
    warehouseCapacity,
    upgradeWarehouse,
    coins,
    decorations,
    buyDecoration,
    careSlots,
    unlockCareSlot,
    getInventoryCount,
    buySupply,
    sellItem,
    getStationLevel,
    getNextStationLevel,
    getCurrentLedger,
    getRecentLedgers,
    stationLevel,
    reputation,
    upgradePath,
    getUpgradeLevel,
    day,
    dailyLedgers,
    recoveryRecords,
  } = useGameStore();
  const [activeTab, setActiveTab] = useState<'items' | 'shop' | 'upgrade' | 'decorate' | 'ledger'>('items');
  const [message, setMessage] = useState('');
  const [reportPeriod, setReportPeriod] = useState<'today' | 'week' | 'month'>('today');

  const currentCount = getInventoryCount();
  const nextLevel = WAREHOUSE_LEVELS.find(l => l.level === warehouseLevel + 1);
  const stationLevelData = getStationLevel();
  const nextStationLevel = getNextStationLevel();
  const currentLedger = getCurrentLedger();
  const recentLedgers = getRecentLedgers(7);

  const reportData = useMemo(() => {
    if (reportPeriod === 'week') return getWeekReport(dailyLedgers, day, currentLedger);
    if (reportPeriod === 'month') return getMonthReport(dailyLedgers, day, currentLedger);
    return {
      days: 1,
      coinsEarned: currentLedger.coinsEarned,
      coinsSpent: currentLedger.coinsSpent,
      reputationEarned: currentLedger.reputationEarned,
      animalsRescued: currentLedger.animalsRescued,
      animalsReleased: currentLedger.animalsReleased,
      itemsCollected: currentLedger.itemsCollected,
      itemsSold: currentLedger.itemsSold,
    };
  }, [reportPeriod, dailyLedgers, day, currentLedger]);

  const trendData = useMemo(() => {
    const allLedgers = [...dailyLedgers].slice(-7);
    if (allLedgers.length === 0) return [];
    return allLedgers.map(l => ({
      day: l.day,
      net: l.coinsEarned - l.coinsSpent,
    }));
  }, [dailyLedgers]);

  const categoryStats = useMemo(() => {
    const stats: Record<string, { count: number; coins: number; reputation: number }> = {};
    for (const record of recoveryRecords) {
      const cat = ANIMAL_CATEGORIES[record.animalId] || '其他';
      if (!stats[cat]) stats[cat] = { count: 0, coins: 0, reputation: 0 };
      stats[cat].count += 1;
      stats[cat].coins += record.coinReward;
      stats[cat].reputation += record.reputationReward;
    }
    return stats;
  }, [recoveryRecords]);

  const topCategory = useMemo(() => {
    let max = 0;
    let top = '';
    for (const [cat, s] of Object.entries(categoryStats)) {
      if (s.count > max) { max = s.count; top = cat; }
    }
    return top;
  }, [categoryStats]);

  const upgradeCostBenefit = useMemo(() => {
    const result: Record<string, { totalCoinsSpent: number; totalRepSpent: number; benefitText: string; rating: number }> = {};
    for (const upgrade of UPGRADE_PATHS) {
      const pathId = upgrade.id as 'medical' | 'recovery' | 'exploration';
      const currentLevel = getUpgradeLevel(pathId);
      let totalCoins = 0;
      let totalRep = 0;
      for (let i = 0; i < currentLevel; i++) {
        const cost = upgrade.costs[i];
        if (cost) {
          totalCoins += cost.coins;
          if (cost.reputation) totalRep += cost.reputation;
        }
      }

      let benefitText = '';
      let rating = 0;

      if (pathId === 'medical') {
        const totalTreatments = Object.values(useGameStore.getState().treatmentCounts).reduce((s: number, v) => s + (v as number), 0);
        const savedTreatments = currentLevel > 0 ? Math.floor(totalTreatments * (currentLevel * 0.2) / (1 + currentLevel * 0.2)) : 0;
        benefitText = savedTreatments > 0 ? `已节省 ${savedTreatments} 次治疗` : '尚无节省记录';
        rating = totalTreatments > 0 ? Math.min(5, Math.ceil((savedTreatments / Math.max(totalTreatments, 1)) * 5)) : (currentLevel > 0 ? 2 : 0);
      } else if (pathId === 'recovery') {
        const totalDaysSaved = recoveryRecords.reduce((sum, r) => {
          const baseDays = r.totalDays / (1 + currentLevel * 0.15);
          return sum + Math.max(0, Math.round(r.totalDays - baseDays));
        }, 0);
        benefitText = totalDaysSaved > 0 ? `已加速 ${totalDaysSaved} 天康复` : '尚无加速记录';
        rating = recoveryRecords.length > 0 ? Math.min(5, Math.ceil((totalDaysSaved / Math.max(recoveryRecords.length, 1)) * 3)) : (currentLevel > 0 ? 2 : 0);
      } else if (pathId === 'exploration') {
        const boostPct = currentLevel > 0 ? [15, 35, 50][currentLevel - 1] : 0;
        benefitText = boostPct > 0 ? `已提升 ${boostPct}% 发现率` : '尚无提升';
        const foundCount = recoveryRecords.length;
        rating = foundCount > 3 ? Math.min(5, currentLevel + 1) : (currentLevel > 0 ? 2 : 0);
      }

      result[upgrade.id] = {
        totalCoinsSpent: totalCoins,
        totalRepSpent: totalRep,
        benefitText,
        rating: Math.max(1, Math.min(5, rating)),
      };
    }
    return result;
  }, [recoveryRecords, getUpgradeLevel]);

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 2000);
  };

  const handleUpgrade = () => {
    if (upgradeWarehouse()) {
      showMessage(`🎉 仓库升级到 ${warehouseLevel + 1} 级！容量提升！`);
    } else {
      showMessage('💰 金币不足，无法升级');
    }
  };

  const handleBuyDecoration = (decId: string) => {
    const dec = DECORATIONS.find(d => d.id === decId);
    if (dec && stationLevel < dec.unlockLevel) {
      showMessage(`🏛️ 需要救助站等级 ${dec.unlockLevel} 才能购买`);
      return;
    }
    if (buyDecoration(decId)) {
      showMessage('✨ 购买成功！救助站更漂亮了~');
    } else {
      showMessage('💰 金币不足或已经拥有');
    }
  };

  const handleUnlockSlot = (slotId: string) => {
    if (unlockCareSlot(slotId)) {
      showMessage('🔓 解锁成功！新的照护位可以使用了~');
    } else {
      showMessage('💰 金币不足，无法解锁');
    }
  };

  const handleBuySupply = (itemId: string) => {
    if (buySupply(itemId, 1)) {
      showMessage('🛒 购买成功！');
    } else {
      showMessage('💰 金币不足或仓库已满');
    }
  };

  const handleSellItem = (itemId: string) => {
    if (sellItem(itemId, 1)) {
      showMessage('💰 出售成功！');
    } else {
      showMessage('❌ 物品不足');
    }
  };

  const handleUpgradePath = (pathId: 'medical' | 'recovery' | 'exploration') => {
    const pathData = UPGRADE_PATHS.find(p => p.id === pathId);
    if (!pathData) return;
    const currentLevel = getUpgradeLevel(pathId);
    if (currentLevel >= pathData.maxLevel) {
      showMessage('✨ 已经是最高级了！');
      return;
    }
    const cost = pathData.costs[currentLevel];
    if (coins < cost.coins) {
      showMessage(`💰 金币不足！需要 ${cost.coins} 金币`);
      return;
    }
    if (cost.reputation && reputation < cost.reputation) {
      showMessage(`⭐ 声望不足！需要 ${cost.reputation} 声望`);
      return;
    }
    if (upgradePath(pathId)) {
      showMessage(`🚀 ${pathData.name}升级成功！已达到 ${currentLevel + 1} 级`);
    } else {
      showMessage('❌ 升级失败，请稍后重试');
    }
  };

  const slotCosts: Record<number, number> = { 2: 150, 3: 400, 4: 1000, 5: 2500 };

  const supplyItems = inventory.filter(i => i.type === 'supply');
  const toolItems = inventory.filter(i => i.type === 'tool');
  const materialItems = inventory.filter(i => i.type === 'material');

  const tabs = [
    { id: 'items', label: '📦 物品' },
    { id: 'shop', label: '🛒 商店' },
    { id: 'upgrade', label: '⬆️ 升级' },
    { id: 'decorate', label: '🎨 装饰' },
    { id: 'ledger', label: '📊 账本' },
  ];

  const reportNetCoins = reportData.coinsEarned - reportData.coinsSpent;
  const periodLabel = reportPeriod === 'today' ? '今日' : reportPeriod === 'week' ? '近7天' : '近30天';

  return (
    <div className="flex-1 bg-gradient-to-b from-amber-100 to-orange-100 p-4 overflow-auto">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-amber-700 mb-2">📦 仓库</h2>
          <p className="text-amber-500">管理物资、升级仓库、装饰救助站</p>
        </div>

        {/* 救助站等级卡片 */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-4 mb-6 shadow-lg text-white">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="text-5xl">🏛️</div>
              <div>
                <h3 className="text-xl font-bold">Lv.{stationLevelData.level} {stationLevelData.name}</h3>
                <p className="text-sm opacity-90">{stationLevelData.description}</p>
              </div>
            </div>
            {nextStationLevel && (
              <div className="text-right">
                <p className="text-sm opacity-90">下一等级: {nextStationLevel.name}</p>
                <p className="text-sm">
                  声望: {reputation} / {nextStationLevel.requiredReputation}
                </p>
                <div className="w-40 bg-white/30 rounded-full h-2 mt-1">
                  <div
                    className="bg-white h-2 rounded-full transition-all"
                    style={{ width: `${Math.min((reputation / nextStationLevel.requiredReputation) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-white/20">
            <p className="text-sm opacity-90 mb-1">🏆 当前解锁内容：</p>
            <div className="flex flex-wrap gap-2">
              {stationLevelData.unlocks.map((unlock, idx) => (
                <span key={idx} className="text-xs bg-white/20 px-2 py-1 rounded-full">
                  {unlock}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 消息提示 */}
        {message && (
          <div className="bg-white rounded-xl p-4 mb-4 text-center shadow-md animate-pulse">
            <p className="text-gray-700 font-medium">{message}</p>
          </div>
        )}

        {/* 仓库容量条 */}
        <div className="bg-white rounded-xl p-4 mb-6 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-gray-700">📦 仓库容量</h3>
            <span className="text-sm text-gray-500">
              {currentCount} / {warehouseCapacity}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className={`h-4 rounded-full transition-all ${
                currentCount / warehouseCapacity > 0.8
                  ? 'bg-red-500'
                  : currentCount / warehouseCapacity > 0.5
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
              }`}
              style={{ width: `${(currentCount / warehouseCapacity) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">等级 {warehouseLevel}</p>
        </div>

        {/* 标签切换 */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-full font-medium transition-all text-sm ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 物品列表 */}
        {activeTab === 'items' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-md">
              <h3 className="font-bold text-gray-700 mb-3">🧴 医疗用品</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {supplyItems.map(item => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-3 text-center">
                    <span className="text-3xl">{item.emoji}</span>
                    <p className="font-medium text-gray-700 mt-1">{item.name}</p>
                    <p className="text-lg font-bold text-amber-600">× {item.quantity}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-md">
              <h3 className="font-bold text-gray-700 mb-3">🛠️ 工具</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {toolItems.map(item => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-3 text-center">
                    <span className="text-3xl">{item.emoji}</span>
                    <p className="font-medium text-gray-700 mt-1">{item.name}</p>
                    <p className="text-lg font-bold text-blue-600">× {item.quantity}</p>
                  </div>
                ))}
              </div>
            </div>

            {materialItems.length > 0 && (
              <div className="bg-white rounded-xl p-4 shadow-md">
                <h3 className="font-bold text-gray-700 mb-3">🪵 收集材料</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {materialItems.map(item => (
                    <div key={item.id} className="bg-gray-50 rounded-lg p-3 text-center">
                      <span className="text-3xl">{item.emoji}</span>
                      <p className="font-medium text-gray-700 mt-1">{item.name}</p>
                      <p className="text-lg font-bold text-green-600">× {item.quantity}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {materialItems.length === 0 && supplyItems.length === 0 && toolItems.length === 0 && (
              <div className="bg-white rounded-xl p-8 text-center shadow-md">
                <p className="text-gray-400">仓库空空如也~</p>
              </div>
            )}
          </div>
        )}

        {/* 商店面板 */}
        {activeTab === 'shop' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-md">
              <h3 className="font-bold text-lg text-green-700 mb-4">🛒 购买物资</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {SHOP_ITEMS.map(item => {
                  const owned = inventory.find(i => i.id === item.id);
                  return (
                    <div key={item.id} className="bg-green-50 rounded-xl p-3 text-center">
                      <span className="text-3xl">{item.emoji}</span>
                      <p className="font-medium text-gray-700 mt-1">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.description}</p>
                      {owned && (
                        <p className="text-xs text-gray-400 mt-1">已有: {owned.quantity}</p>
                      )}
                      <button
                        onClick={() => handleBuySupply(item.id)}
                        disabled={coins < item.price}
                        className={`mt-2 w-full py-1.5 rounded-full text-sm font-bold transition-all ${
                          coins >= item.price
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        🪙 {item.price}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-md">
              <h3 className="font-bold text-lg text-amber-700 mb-4">💰 出售材料</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {SELLABLE_ITEMS.map(item => {
                  const owned = inventory.find(i => i.id === item.id);
                  const quantity = owned?.quantity || 0;
                  return (
                    <div
                      key={item.id}
                      className={`rounded-xl p-3 text-center ${
                        quantity > 0 ? 'bg-amber-50' : 'bg-gray-100 opacity-60'
                      }`}
                    >
                      <span className="text-3xl">{item.emoji}</span>
                      <p className="font-medium text-gray-700 mt-1">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        拥有: {quantity} | 单价: 🪙 {item.price}
                      </p>
                      <button
                        onClick={() => handleSellItem(item.id)}
                        disabled={quantity === 0}
                        className={`mt-2 w-full py-1.5 rounded-full text-sm font-bold transition-all ${
                          quantity > 0
                            ? 'bg-amber-500 text-white hover:bg-amber-600'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        出售 1 个
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 升级面板 */}
        {activeTab === 'upgrade' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-md">
              <h3 className="font-bold text-lg text-green-700 mb-4">🏗️ 仓库升级</h3>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                <div>
                  <p className="font-bold text-gray-800">
                    当前: 等级 {warehouseLevel} ({warehouseCapacity} 容量)
                  </p>
                  {nextLevel && (
                    <p className="text-sm text-gray-500 mt-1">
                      下一级: 等级 {nextLevel.level} ({nextLevel.capacity} 容量)
                    </p>
                  )}
                </div>
                {nextLevel ? (
                  <button
                    onClick={handleUpgrade}
                    disabled={coins < nextLevel.upgradeCost}
                    className={`px-6 py-2 rounded-full font-bold transition-all ${
                      coins >= nextLevel.upgradeCost
                        ? 'bg-green-500 text-white hover:bg-green-600 hover:scale-105'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    🪙 {nextLevel.upgradeCost} 升级
                  </button>
                ) : (
                  <span className="text-green-600 font-bold">已满级 ✨</span>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-md">
              <h3 className="font-bold text-lg text-blue-700 mb-4">🛏️ 照护位</h3>
              <div className="space-y-3">
                {careSlots.map(slot => (
                  <div
                    key={slot.id}
                    className={`p-4 rounded-xl flex items-center justify-between ${
                      slot.unlocked ? 'bg-blue-50' : 'bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{slot.unlocked ? '🏠' : '🔒'}</span>
                      <div>
                        <p className="font-medium text-gray-800">{slot.name}</p>
                        <p className="text-xs text-gray-500">
                          恢复速度 ×{slot.recoveryBoost}
                        </p>
                      </div>
                    </div>
                    {slot.unlocked ? (
                      <span className="text-green-600 font-medium text-sm">已解锁 ✅</span>
                    ) : (
                      <button
                        onClick={() => handleUnlockSlot(slot.id)}
                        disabled={coins < slotCosts[slot.level]}
                        className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
                          coins >= slotCosts[slot.level]
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        🪙 {slotCosts[slot.level]} 解锁
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-md">
              <h3 className="font-bold text-lg text-purple-700 mb-4">🚀 升级路线</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {UPGRADE_PATHS.map(upgrade => {
                  const pathId = upgrade.id as 'medical' | 'recovery' | 'exploration';
                  const currentLevel = getUpgradeLevel(pathId);
                  const isMaxLevel = currentLevel >= upgrade.maxLevel;
                  const nextCost = !isMaxLevel ? upgrade.costs[currentLevel] : null;
                  const canAfford = nextCost ? coins >= nextCost.coins && (!nextCost.reputation || reputation >= nextCost.reputation) : false;
                  const cb = upgradeCostBenefit[upgrade.id];
                  return (
                    <div key={upgrade.id} className={`rounded-xl p-4 border transition-all ${
                      currentLevel > 0 
                        ? 'bg-gradient-to-br from-purple-100 to-pink-100 border-purple-400 shadow-md' 
                        : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200'
                    }`}>
                      <div className="text-center mb-3">
                        <span className="text-4xl">{upgrade.icon}</span>
                        <h4 className="font-bold text-gray-800 mt-2">{upgrade.name}</h4>
                        <p className="text-xs text-gray-500 mt-1">{upgrade.description}</p>
                        <div className="mt-2 flex items-center justify-center gap-1">
                          {Array.from({ length: upgrade.maxLevel }).map((_, idx) => (
                            <span
                              key={idx}
                              className={`w-3 h-3 rounded-full ${
                                idx < currentLevel ? 'bg-purple-500' : 'bg-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-sm font-bold text-purple-700 mt-1">
                          Lv.{currentLevel} / {upgrade.maxLevel}
                        </p>
                      </div>
                      <div className="space-y-1 mb-3">
                        {upgrade.effects.map((effect, idx) => (
                          <div key={idx} className={`flex items-center gap-2 text-xs ${
                            idx < currentLevel ? 'text-purple-700 font-medium' : 'text-gray-400'
                          }`}>
                            <span>{idx < currentLevel ? '✅' : '✨'}</span>
                            <span>Lv.{idx + 1}: {effect}</span>
                          </div>
                        ))}
                      </div>

                      {/* 成本效益分析 */}
                      {currentLevel > 0 && cb && (
                        <div className="bg-white/60 rounded-lg p-2 mb-3 text-xs space-y-1">
                          <div className="flex justify-between text-gray-600">
                            <span>累计投入</span>
                            <span className="font-bold">🪙{cb.totalCoinsSpent} {cb.totalRepSpent > 0 ? `⭐${cb.totalRepSpent}` : ''}</span>
                          </div>
                          <div className="flex justify-between text-gray-600">
                            <span>效果</span>
                            <span className="font-bold text-emerald-600">{cb.benefitText}</span>
                          </div>
                          <div className="flex justify-between text-gray-600">
                            <span>性价比</span>
                            <span>{'⭐'.repeat(cb.rating)}{'☆'.repeat(5 - cb.rating)}</span>
                          </div>
                        </div>
                      )}

                      {isMaxLevel ? (
                        <div className="text-center py-2 bg-purple-200 rounded-lg">
                          <span className="text-sm font-bold text-purple-700">✨ 已满级</span>
                        </div>
                      ) : (
                        <div>
                          <div className="text-center text-xs text-gray-600 mb-2">
                            升级消耗：
                            <span className="font-bold text-amber-600 ml-1">🪙 {nextCost?.coins}</span>
                            {nextCost?.reputation && (
                              <span className="font-bold text-purple-600 ml-1">⭐ {nextCost.reputation}</span>
                            )}
                          </div>
                          <button
                            onClick={() => handleUpgradePath(pathId)}
                            disabled={!canAfford}
                            className={`w-full py-2 rounded-lg text-sm font-bold transition-all ${
                              canAfford
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-md'
                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            升级到 Lv.{currentLevel + 1}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 装饰面板 */}
        {activeTab === 'decorate' && (
          <div className="bg-white rounded-xl p-4 shadow-md">
            <h3 className="font-bold text-lg text-pink-700 mb-4">🎨 装饰救助站</h3>
            <p className="text-sm text-gray-500 mb-4">
              已拥有 {decorations.length} / {DECORATIONS.length} 件装饰
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {DECORATIONS.map(dec => {
                const owned = decorations.includes(dec.id);
                const locked = stationLevel < dec.unlockLevel;
                return (
                  <div
                    key={dec.id}
                    className={`p-4 rounded-xl text-center transition-all ${
                      owned
                        ? 'bg-pink-100 border-2 border-pink-300'
                        : locked
                          ? 'bg-gray-200 opacity-60'
                          : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-4xl">{dec.emoji}</span>
                    <p className="font-medium text-gray-700 mt-2">{dec.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{dec.description}</p>
                    {locked && !owned && (
                      <p className="text-xs text-orange-600 mt-1">🔒 需要等级 {dec.unlockLevel}</p>
                    )}
                    {owned ? (
                      <p className="text-pink-600 font-medium text-sm mt-2">已拥有 ✨</p>
                    ) : (
                      <button
                        onClick={() => handleBuyDecoration(dec.id)}
                        disabled={coins < dec.cost || locked}
                        className={`mt-2 w-full py-1.5 rounded-full text-sm font-bold transition-all ${
                          coins >= dec.cost && !locked
                            ? 'bg-pink-500 text-white hover:bg-pink-600'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        🪙 {dec.cost}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 账本面板 */}
        {activeTab === 'ledger' && (
          <div className="space-y-4">
            {/* 报告周期切换 */}
            <div className="flex gap-2 justify-center">
              {([
                { id: 'today', label: '今日' },
                { id: 'week', label: '周报' },
                { id: 'month', label: '月报' },
              ] as const).map(p => (
                <button
                  key={p.id}
                  onClick={() => setReportPeriod(p.id)}
                  className={`px-5 py-2 rounded-full font-medium transition-all text-sm ${
                    reportPeriod === p.id
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* 报告统计 */}
            <div className="bg-white rounded-xl p-4 shadow-md">
              <h3 className="font-bold text-lg text-blue-700 mb-4">📊 {periodLabel}收支{reportPeriod !== 'today' ? ` (近 ${reportData.days} 天)` : ` (第 ${day} 天)`}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">收入金币</p>
                  <p className="text-xl font-bold text-green-600">+{reportData.coinsEarned}</p>
                </div>
                <div className="bg-red-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">支出金币</p>
                  <p className="text-xl font-bold text-red-600">-{reportData.coinsSpent}</p>
                </div>
                <div className={`rounded-lg p-3 text-center ${reportNetCoins >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
                  <p className="text-xs text-gray-500">{periodLabel}净收入</p>
                  <p className={`text-xl font-bold ${reportNetCoins >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                    {reportNetCoins >= 0 ? '+' : ''}{reportNetCoins}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">获得声望</p>
                  <p className="text-xl font-bold text-purple-600">+{reportData.reputationEarned}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="bg-pink-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">救助动物</p>
                  <p className="text-xl font-bold text-pink-600">{reportData.animalsRescued}</p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">放归动物</p>
                  <p className="text-xl font-bold text-emerald-600">{reportData.animalsReleased}</p>
                </div>
                <div className="bg-cyan-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">收集物品</p>
                  <p className="text-xl font-bold text-cyan-600">{reportData.itemsCollected}</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">出售物品</p>
                  <p className="text-xl font-bold text-amber-600">{reportData.itemsSold}</p>
                </div>
              </div>
            </div>

            {/* 净收入趋势图 */}
            {trendData.length > 0 && (
              <div className="bg-white rounded-xl p-4 shadow-md">
                <h3 className="font-bold text-lg text-gray-700 mb-4">📈 净收入趋势 (近7天)</h3>
                <div className="flex items-end justify-around gap-2" style={{ height: 120 }}>
                  {trendData.map(t => {
                    const maxAbs = Math.max(...trendData.map(d => Math.abs(d.net)), 1);
                    const barHeight = Math.max(Math.abs(t.net) / maxAbs * 100, 2);
                    return (
                      <div key={t.day} className="flex flex-col items-center flex-1">
                        <span className={`text-xs font-bold mb-1 ${t.net >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                          {t.net >= 0 ? '+' : ''}{t.net}
                        </span>
                        <div
                          className={`w-full max-w-[40px] rounded-t-sm ${t.net >= 0 ? 'bg-green-400' : 'bg-red-400'}`}
                          style={{ height: barHeight }}
                        />
                        <span className="text-xs text-gray-500 mt-1">D{t.day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 历史账本 */}
            {recentLedgers.length > 0 && (
              <div className="bg-white rounded-xl p-4 shadow-md">
                <h3 className="font-bold text-lg text-gray-700 mb-4">📅 最近 7 天</h3>
                <div className="space-y-2">
                  {recentLedgers.map(ledger => {
                    const net = ledger.coinsEarned - ledger.coinsSpent;
                    return (
                      <div key={ledger.day} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-gray-700">第 {ledger.day} 天</span>
                          <div className="flex gap-3 text-xs">
                            <span className="text-pink-600">🐾 {ledger.animalsRescued}</span>
                            <span className="text-emerald-600">🌊 {ledger.animalsReleased}</span>
                            <span className="text-cyan-600">📦 {ledger.itemsCollected}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`font-bold ${net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {net >= 0 ? '+' : ''}{net} 🪙
                          </span>
                          <span className="text-purple-600 text-sm">+{ledger.reputationEarned} ⭐</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {recentLedgers.length === 0 && (
              <div className="bg-white rounded-xl p-8 text-center shadow-md">
                <span className="text-5xl">📊</span>
                <p className="text-gray-500 mt-4">还没有历史记录</p>
                <p className="text-gray-400 text-sm mt-1">多玩几天，这里会显示你的经营记录~</p>
              </div>
            )}
          </div>
        )}

        {/* 动物类别统计 */}
        {activeTab === 'ledger' && (
          <div className="mt-4 bg-white rounded-xl p-4 shadow-md">
            <h3 className="font-bold text-lg text-teal-700 mb-4">🐾 动物类别统计</h3>
            {Object.keys(categoryStats).length === 0 ? (
              <p className="text-gray-400 text-center py-4">暂无救助记录</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(categoryStats).map(([cat, stats]) => (
                  <div
                    key={cat}
                    className={`p-3 rounded-lg flex items-center justify-between ${
                      cat === topCategory ? 'bg-teal-50 border-2 border-teal-300' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {cat === topCategory && <span className="text-sm">👑</span>}
                      <span className="font-bold text-gray-700">{cat}</span>
                      <span className="text-xs text-gray-500">救助 {stats.count} 只</span>
                    </div>
                    <div className="flex gap-4 text-xs">
                      <span className="text-amber-600 font-bold">🪙 {stats.coins}</span>
                      <span className="text-purple-600 font-bold">⭐ {stats.reputation}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
