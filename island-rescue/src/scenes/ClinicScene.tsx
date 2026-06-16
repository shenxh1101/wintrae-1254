import { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { ANIMALS } from '../data/gameData';
import { RescuedAnimal, CareEvent } from '../types/game';

export const ClinicScene = () => {
  const {
    rescuedAnimals,
    careSlots,
    treatAnimal,
    assignToCareSlot,
    releaseAnimal,
    inventory,
    completeCareEvent,
  } = useGameStore();
  const [selectedAnimal, setSelectedAnimal] = useState<RescuedAnimal | null>(null);
  const [message, setMessage] = useState('');

  const injuredAnimals = rescuedAnimals.filter(a => a.status === 'injured' || a.status === 'treating');
  const recoveringAnimals = rescuedAnimals.filter(a => a.status === 'recovering');
  const readyAnimals = rescuedAnimals.filter(a => a.status === 'ready');

  const hasSupplies = () => {
    const bandage = inventory.find(i => i.id === 'bandage')?.quantity || 0;
    const medicine = inventory.find(i => i.id === 'medicine')?.quantity || 0;
    const towel = inventory.find(i => i.id === 'towel')?.quantity || 0;
    return bandage > 0 && medicine > 0 && towel > 0;
  };

  const hasFood = () => {
    const food = inventory.find(i => i.id === 'food')?.quantity || 0;
    return food > 0;
  };

  const handleTreat = (animalId: string) => {
    if (!hasSupplies()) {
      setMessage('⚠️ 物资不足！需要绷带、药膏和毛巾各 1 个');
      return;
    }
    treatAnimal(animalId);
    setMessage('✅ 治疗完成！动物感觉好多了~');
    setTimeout(() => setMessage(''), 2000);
  };

  const handleAssignSlot = (animalId: string, slotId: string) => {
    assignToCareSlot(animalId, slotId);
    setMessage('🏠 已安排到照护位，开始康复啦！');
    setTimeout(() => setMessage(''), 2000);
  };

  const handleRelease = (animalId: string) => {
    const animal = rescuedAnimals.find(a => a.id === animalId);
    const animalData = ANIMALS.find(a => a.id === animal?.animalId);
    if (animalData) {
      releaseAnimal(animalId);
      setMessage(`🎉 ${animalData.name} 康复放归啦！获得声望 +${animalData.reputationReward}`);
      setSelectedAnimal(null);
    }
  };

  const handleCareEvent = (rescuedId: string, eventId: string) => {
    if (!hasFood()) {
      setMessage('⚠️ 鱼食不足！去仓库商店购买一些吧~');
      setTimeout(() => setMessage(''), 2000);
      return;
    }
    completeCareEvent(rescuedId, eventId);
    setMessage('💕 照护完成！动物恢复得更快了~');
    setTimeout(() => setMessage(''), 2000);
  };

  const getAnimalData = (animalId: string) => ANIMALS.find(a => a.id === animalId);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'injured': return '受伤中';
      case 'treating': return '治疗中';
      case 'recovering': return '康复中';
      case 'ready': return '可放归';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'injured': return 'bg-red-100 text-red-700';
      case 'treating': return 'bg-yellow-100 text-yellow-700';
      case 'recovering': return 'bg-blue-100 text-blue-700';
      case 'ready': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getCareEventTypeColor = (type: string) => {
    switch (type) {
      case 'feed': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'clean': return 'bg-cyan-100 text-cyan-700 border-cyan-300';
      case 'play': return 'bg-purple-100 text-purple-700 border-purple-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const availableSlots = careSlots.filter(s => s.unlocked && !s.occupiedBy);

  const renderCareEvents = (animal: RescuedAnimal) => {
    const pendingEvents = animal.careEvents.filter(e => !e.completed);
    const completedEvents = animal.careEvents.filter(e => e.completed);

    if (pendingEvents.length === 0 && completedEvents.length === 0) return null;

    return (
      <div className="mt-3 space-y-2">
      {pendingEvents.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-1 font-medium">📋 需要照护:</p>
          <div className="space-y-2">
            {pendingEvents.map(event => (
              <div
                key={event.id}
                className={`p-2 rounded-lg border-2 flex items-center justify-between bg-white ${getCareEventTypeColor(event.type)}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{event.emoji}</span>
                  <div>
                    <p className="text-sm font-medium">{event.title}</p>
                    <p className="text-xs opacity-80">{event.description}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCareEvent(animal.id, event.id);
                  }}
                  disabled={!hasFood()}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    hasFood()
                      ? 'bg-white hover:bg-gray-50 shadow-sm'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                    🐟 完成
                  </button>
                </div>
              ))}
            </div>
          </div>
          )}
          {completedEvents.length > 0 && (
            <div className="pt-1">
              <p className="text-xs text-gray-400">
                ✅ 已完成: {completedEvents.map(e => e.title).join('、')}
              </p>
            </div>
          )}
        </div>
      );
  };

  return (
    <div className="flex-1 bg-gradient-to-b from-pink-100 to-blue-100 p-4 overflow-auto">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-pink-700 mb-2">🏥 诊疗室</h2>
          <p className="text-pink-500">给受伤的小动物们治疗和照护</p>
        </div>

        {/* 消息提示 */}
        {message && (
          <div className="bg-white rounded-xl p-4 mb-4 text-center shadow-md">
            <p className="text-gray-700 font-medium">{message}</p>
          </div>
        )}

        {/* 物资展示 */}
        <div className="bg-white rounded-xl p-4 mb-6 shadow-md">
          <h3 className="font-bold text-gray-700 mb-3">📦 医疗物资</h3>
          <div className="flex gap-4 flex-wrap">
            {inventory.filter(i => i.type === 'supply').map(item => (
            <div key={item.id} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
              <span className="text-2xl">{item.emoji}</span>
              <div>
                <p className="text-sm font-medium text-gray-700">{item.name}</p>
                <p className="text-xs text-gray-500">× {item.quantity}</p>
              </div>
            </div>
          ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 待治疗动物 */}
          <div className="bg-white rounded-xl p-4 shadow-md">
            <h3 className="font-bold text-lg text-red-600 mb-3 flex items-center gap-2">
              <span>🩹</span> 待治疗 ({injuredAnimals.length})
            </h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {injuredAnimals.length === 0 ? (
                <p className="text-gray-400 text-center py-8">没有需要治疗的动物</p>
              ) : (
                injuredAnimals.map(animal => {
                  const data = getAnimalData(animal.animalId);
                  return (
                    <div
                      key={animal.id}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedAnimal?.id === animal.id
                          ? 'border-pink-400 bg-pink-50'
                          : 'border-gray-200 hover:border-pink-300'
                      }`}
                      onClick={() => setSelectedAnimal(animal)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{data?.emoji}</span>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{data?.name}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(animal.status)}`}>
                            {getStatusText(animal.status)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>治疗进度</span>
                          <span>{Math.round(animal.treatmentProgress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-400 h-2 rounded-full transition-all"
                            style={{ width: `${animal.treatmentProgress}%` }}
                          />
                        </div>
                      </div>
                      {animal.treatmentProgress < 100 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTreat(animal.id);
                          }}
                          disabled={!hasSupplies()}
                          className={`mt-2 w-full py-1.5 rounded-lg text-sm font-medium transition-all ${
                            hasSupplies()
                              ? 'bg-pink-500 text-white hover:bg-pink-600'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          💊 治疗
                        </button>
                      )}
                      {animal.treatmentProgress >= 100 && !animal.careSlotId && availableSlots.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 mb-1">安排照护位:</p>
                          <div className="flex gap-1 flex-wrap">
                            {availableSlots.slice(0, 2).map(slot => (
                              <button
                                key={slot.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAssignSlot(animal.id, slot.id);
                                }}
                                className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
                              >
                                {slot.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 照护位 */}
          <div className="bg-white rounded-xl p-4 shadow-md">
            <h3 className="font-bold text-lg text-blue-600 mb-3 flex items-center gap-2">
              <span>🛏️</span> 照护位
            </h3>
            <div className="space-y-3">
              {careSlots.map(slot => {
                const animalInSlot = rescuedAnimals.find(a => a.id === slot.occupiedBy);
                const animalData = animalInSlot ? getAnimalData(animalInSlot.animalId) : null;

                return (
                  <div
                    key={slot.id}
                    className={`p-3 rounded-lg border-2 ${
                      slot.unlocked
                        ? slot.occupiedBy
                          ? 'border-green-300 bg-green-50'
                          : 'border-gray-200 bg-gray-50'
                        : 'border-gray-200 bg-gray-100 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">
                          {slot.unlocked ? (slot.occupiedBy ? animalData?.emoji : '🏠') : '🔒'}
                        </span>
                        <div>
                          <p className="font-medium text-sm text-gray-700">{slot.name}</p>
                          <p className="text-xs text-gray-500">
                            {slot.unlocked
                              ? slot.occupiedBy
                                ? '已占用'
                                : '空闲中'
                              : '未解锁'}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        ×{slot.recoveryBoost} 速度
                      </span>
                    </div>
                    {animalInSlot && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>康复进度</span>
                          <span>{Math.round(animalInSlot.health)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-400 h-2 rounded-full transition-all"
                            style={{ width: `${animalInSlot.health}%` }}
                          />
                        </div>
                        {animalInSlot.recoverySpeedBoost > 0 && (
                          <p className="text-xs text-green-600 mt-1">
                            ⚡ 恢复加速 +{animalInSlot.recoverySpeedBoost}%
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 康复中 / 可放归 */}
          <div className="bg-white rounded-xl p-4 shadow-md">
            <h3 className="font-bold text-lg text-green-600 mb-3 flex items-center gap-2">
              <span>🌿</span> 康复中 / 可放归
            </h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {[...recoveringAnimals, ...readyAnimals].length === 0 ? (
                <p className="text-gray-400 text-center py-8">没有康复中的动物</p>
              ) : (
                [...recoveringAnimals, ...readyAnimals].map(animal => {
                  const data = getAnimalData(animal.animalId);
                  return (
                    <div
                      key={animal.id}
                      className={`p-3 rounded-lg border-2 ${
                        animal.status === 'ready'
                          ? 'border-green-400 bg-green-50'
                          : 'border-blue-200 bg-blue-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{data?.emoji}</span>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{data?.name}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(animal.status)}`}>
                            {getStatusText(animal.status)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>健康值</span>
                          <span>{Math.round(animal.health)}/{animal.maxHealth}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all"
                            style={{ width: `${animal.health}%` }}
                          />
                        </div>
                      </div>
                      {animal.recoverySpeedBoost > 0 && (
                        <p className="text-xs text-green-600 mt-1">⚡ 恢复加速 +{animal.recoverySpeedBoost}%</p>
                      )}
                      {renderCareEvents(animal)}
                      {animal.status === 'ready' && (
                        <button
                          onClick={() => handleRelease(animal.id)}
                          className="mt-2 w-full py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all"
                        >
                          🌊 放归大海
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* 选中动物详情 */}
        {selectedAnimal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
              <div className="text-center">
                <span className="text-6xl">
                  {getAnimalData(selectedAnimal.animalId)?.emoji}
                </span>
                <h3 className="text-2xl font-bold text-gray-800 mt-2">
                  {getAnimalData(selectedAnimal.animalId)?.name}
                </h3>
                <span className={`inline-block mt-2 text-sm px-3 py-1 rounded-full ${getStatusColor(selectedAnimal.status)}`}>
                  {getStatusText(selectedAnimal.status)}
                </span>
              </div>
              <p className="text-gray-600 mt-4 text-center">
                {getAnimalData(selectedAnimal.animalId)?.description}
              </p>
              <div className="mt-4 space-y-2">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>健康值</span>
                    <span>{Math.round(selectedAnimal.health)}/{selectedAnimal.maxHealth}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-green-500 h-3 rounded-full transition-all"
                      style={{ width: `${selectedAnimal.health}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>治疗进度</span>
                    <span>{Math.round(selectedAnimal.treatmentProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-yellow-500 h-3 rounded-full transition-all"
                      style={{ width: `${selectedAnimal.treatmentProgress}%` }}
                    />
                  </div>
                </div>
                {selectedAnimal.recoverySpeedBoost > 0 && (
                  <p className="text-sm text-green-600 text-center">⚡ 当前恢复加速 +{selectedAnimal.recoverySpeedBoost}%</p>
                )}
              </div>
              {selectedAnimal.careEvents.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-bold text-gray-700 mb-2">📋 照护记录</h4>
                  {selectedAnimal.careEvents.map(event => (
                    <div key={event.id} className={`p-2 rounded-lg mb-1 flex items-center gap-2 ${
                      event.completed ? 'bg-green-50' : 'bg-yellow-50'}`}>
                      <span className="text-xl">{event.emoji}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{event.title}</p>
                        <p className="text-xs text-gray-500">{event.description}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${event.completed ? 'bg-green-200 text-green-700' : 'bg-yellow-200 text-yellow-700'}`}>
                        {event.completed ? '已完成' : '待处理'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setSelectedAnimal(null)}
                  className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
                >
                  关闭
                </button>
                {selectedAnimal.status === 'ready' ? (
                  <button
                    onClick={() => {
                      handleRelease(selectedAnimal.id);
                    }}
                    className="flex-1 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600"
                  >
                    🌊 放归
                  </button>
                ) : selectedAnimal.treatmentProgress < 100 ? (
                  <button
                    onClick={() => handleTreat(selectedAnimal.id)}
                    disabled={!hasSupplies()}
                    className={`flex-1 py-2 rounded-lg font-medium ${
                      hasSupplies()
                        ? 'bg-pink-500 text-white hover:bg-pink-600'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    💊 治疗
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
