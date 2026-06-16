import { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { WAREHOUSE_LEVELS, DECORATIONS, INITIAL_INVENTORY } from '../data/gameData';

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
  } = useGameStore();
  const [activeTab, setActiveTab] = useState<'items' | 'shop' | 'upgrade' | 'decorate'>('items');
  const [message, setMessage] = useState('');

  const currentCount = getInventoryCount();
  const nextLevel = WAREHOUSE_LEVELS.find(l => l.level === warehouseLevel + 1);

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

  const slotCosts: Record<number, number> = { 2: 150, 3: 400, 4: 1000, 5: 2500 };

  const supplyItems = inventory.filter(i => i.type === 'supply');
  const toolItems = inventory.filter(i => i.type === 'tool');
  const materialItems = inventory.filter(i => i.type === 'material');

  const tabs = [
    { id: 'items', label: '📦 物品' },
    { id: 'shop', label: '🛒 商店' },
    { id: 'upgrade', label: '⬆️ 升级' },
    { id: 'decorate', label: '🎨 装饰' },
  ];

  return (
    <div className="flex-1 bg-gradient-to-b from-amber-100 to-orange-100 p-4 overflow-auto">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-amber-700 mb-2">📦 仓库</h2>
          <p className="text-amber-500">管理物资、升级仓库、装饰救助站</p>
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
              className={`px-5 py-2 rounded-full font-medium transition-all ${
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
                return (
                  <div
                    key={dec.id}
                    className={`p-4 rounded-xl text-center transition-all ${
                      owned
                        ? 'bg-pink-100 border-2 border-pink-300'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-4xl">{dec.emoji}</span>
                    <p className="font-medium text-gray-700 mt-2">{dec.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{dec.description}</p>
                    {owned ? (
                      <p className="text-pink-600 font-medium text-sm mt-2">已拥有 ✨</p>
                    ) : (
                      <button
                        onClick={() => handleBuyDecoration(dec.id)}
                        disabled={coins < dec.cost}
                        className={`mt-2 w-full py-1.5 rounded-full text-sm font-bold transition-all ${
                          coins >= dec.cost
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
      </div>
    </div>
  );
};
