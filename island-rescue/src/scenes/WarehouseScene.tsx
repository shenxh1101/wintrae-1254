import { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { WAREHOUSE_LEVELS, DECORATIONS, INITIAL_INVENTORY, STATION_LEVELS, UPGRADE_PATHS } from '../data/gameData';

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
  } = useGameStore();
  const [activeTab, setActiveTab] = useState<'items' | 'shop' | 'upgrade' | 'decorate' | 'ledger'>('items');
  const [message, setMessage] = useState('');

  const currentCount = getInventoryCount();
  const nextLevel = WAREHOUSE_LEVELS.find(l => l.level === warehouseLevel + 1);
  const stationLevelData = getStationLevel();
  const nextStationLevel = getNextStationLevel();
  const currentLedger = getCurrentLedger();
  const recentLedgers = getRecentLedgers(7);

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

  const netCoins = currentLedger.coinsEarned - currentLedger.coinsSpent;

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
            {/* 今日账本 */}
            <div className="bg-white rounded-xl p-4 shadow-md">
              <h3 className="font-bold text-lg text-blue-700 mb-4">📊 今日收支 (第 {currentLedger.day} 天)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">收入金币</p>
                  <p className="text-xl font-bold text-green-600">+{currentLedger.coinsEarned}</p>
                </div>
                <div className="bg-red-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">支出金币</p>
                  <p className="text-xl font-bold text-red-600">-{currentLedger.coinsSpent}</p>
                </div>
                <div className={`rounded-lg p-3 text-center ${netCoins >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
                  <p className="text-xs text-gray-500">今日净收入</p>
                  <p className={`text-xl font-bold ${netCoins >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                    {netCoins >= 0 ? '+' : ''}{netCoins}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">获得声望</p>
                  <p className="text-xl font-bold text-purple-600">+{currentLedger.reputationEarned}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="bg-pink-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">救助动物</p>
                  <p className="text-xl font-bold text-pink-600">{currentLedger.animalsRescued}</p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">放归动物</p>
                  <p className="text-xl font-bold text-emerald-600">{currentLedger.animalsReleased}</p>
                </div>
                <div className="bg-cyan-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">收集物品</p>
                  <p className="text-xl font-bold text-cyan-600">{currentLedger.itemsCollected}</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">出售物品</p>
                  <p className="text-xl font-bold text-amber-600">{currentLedger.itemsSold}</p>
                </div>
              </div>
            </div>

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
      </div>
    </div>
  );
};
