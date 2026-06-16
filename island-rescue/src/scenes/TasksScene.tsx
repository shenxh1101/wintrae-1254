import { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { FestivalLog, RecoveryRecord } from '../types/game';

export const TasksScene = () => {
  const { tasks, claimTaskReward, reputation, coins, activeFestival, getFestivalLogs, getRecoveryRecords } = useGameStore();
  const [activeTab, setActiveTab] = useState<'tasks' | 'festival_logs' | 'recovery_records'>('tasks');

  const dailyTasks = tasks.filter(t => t.type === 'daily');
  const weeklyTasks = tasks.filter(t => t.type === 'weekly');
  const specialTasks = tasks.filter(t => t.type === 'special');
  const festivalTasks = tasks.filter(t => t.type === 'festival');
  const festivalLogs = getFestivalLogs();
  const recoveryRecords = getRecoveryRecords();

  const handleClaim = (taskId: string) => {
    claimTaskReward(taskId);
  };

  const getTaskTypeLabel = (type: string) => {
    switch (type) {
      case 'daily': return '每日任务';
      case 'weekly': return '每周任务';
      case 'special': return '特殊任务';
      case 'festival': return '节日任务';
      default: return type;
    }
  };

  const getTaskTypeColor = (type: string) => {
    switch (type) {
      case 'daily': return 'bg-blue-500';
      case 'weekly': return 'bg-purple-500';
      case 'special': return 'bg-yellow-500';
      case 'festival': return 'bg-pink-500';
      default: return 'bg-gray-500';
    }
  };

  const getRewardText = (reward: { type: string; amount: number }) => {
    if (reward.type === 'coins') return `🪙 ${reward.amount}`;
    if (reward.type === 'reputation') return `⭐ ${reward.amount}`;
    return `${reward.amount}`;
  };

  const renderTaskList = (taskList: typeof tasks) => (
    <div className="space-y-3">
      {taskList.map(task => (
        <div
          key={task.id}
          className={`p-4 rounded-xl border-2 transition-all ${
            task.completed
              ? task.claimed
                ? 'border-gray-200 bg-gray-50 opacity-60'
                : 'border-green-400 bg-green-50'
              : 'border-gray-200 bg-white'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-gray-800">{task.title}</h4>
                {task.completed && !task.claimed && (
                  <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full animate-pulse">
                    新!
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">{task.description}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">奖励</p>
              <p className="font-bold text-amber-600">{getRewardText(task.reward)}</p>
            </div>
          </div>

          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>进度</span>
              <span>{task.progress} / {task.target}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full transition-all ${
                  task.completed
                    ? 'bg-green-500'
                    : 'bg-blue-500'
                }`}
                style={{ width: `${(task.progress / task.target) * 100}%` }}
              />
            </div>
          </div>

          {task.completed && !task.claimed && (
            <button
              onClick={() => handleClaim(task.id)}
              className="mt-3 w-full py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-bold hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-[1.02]"
            >
              🎁 领取奖励
            </button>
          )}
          {task.claimed && (
            <p className="mt-3 text-center text-sm text-gray-400">✅ 已领取</p>
          )}
        </div>
      ))}
    </div>
  );

  const renderFestivalLogList = () => (
    <div className="space-y-3">
      {festivalLogs.map((log: FestivalLog) => (
        <div key={log.id} className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 border-2 border-pink-200">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{log.festivalEmoji}</span>
              <div>
                <h4 className="font-bold text-gray-800 text-lg">{log.festivalName}</h4>
                <p className="text-xs text-gray-500">第 {log.startDay} 天 ~ 第 {log.endDay} 天</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <div className="bg-white rounded-lg p-2 text-center">
              <p className="text-xs text-gray-500">救助动物</p>
              <p className="font-bold text-pink-600">🐾 {log.animalsRescued}</p>
            </div>
            <div className="bg-white rounded-lg p-2 text-center">
              <p className="text-xs text-gray-500">放归动物</p>
              <p className="font-bold text-green-600">🌊 {log.animalsReleased}</p>
            </div>
            <div className="bg-white rounded-lg p-2 text-center">
              <p className="text-xs text-gray-500">获得金币</p>
              <p className="font-bold text-amber-600">🪙 {log.coinsEarned}</p>
            </div>
            <div className="bg-white rounded-lg p-2 text-center">
              <p className="text-xs text-gray-500">获得声望</p>
              <p className="font-bold text-purple-600">⭐ {log.reputationEarned}</p>
            </div>
            <div className="bg-white rounded-lg p-2 text-center">
              <p className="text-xs text-gray-500">完成任务</p>
              <p className="font-bold text-blue-600">✅ {log.tasksCompleted}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderRecoveryRecordList = () => (
    <div className="space-y-3">
      {recoveryRecords.map((record: RecoveryRecord) => (
        <div key={record.id} className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border-2 border-green-200">
          <div className="flex items-start gap-3 mb-3">
            <span className="text-4xl">{record.animalEmoji}</span>
            <div className="flex-1">
              <h4 className="font-bold text-gray-800 text-lg">{record.animalName}</h4>
              <p className="text-xs text-gray-500">救助: 第 {record.rescueDate} 天 | 放归: 第 {record.releaseDate} 天 | 共 {record.totalDays} 天</p>
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 mb-3">
            <p className="text-sm text-gray-600 italic">"{record.notes}"</p>
          </div>
          {record.careEvents.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-1">照护互动:</p>
              <div className="flex flex-wrap gap-1">
                {record.careEvents.map((event, idx) => (
                  <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    {event}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const tabs = [
    { id: 'tasks', label: '📋 任务' },
    { id: 'festival_logs', label: '🎉 节日日志' },
    { id: 'recovery_records', label: '💖 康复记录' },
  ];

  return (
    <div className="flex-1 bg-gradient-to-b from-indigo-100 to-blue-100 p-4 overflow-auto">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-indigo-700 mb-2">📋 任务 & 记录</h2>
          <p className="text-indigo-500">完成任务获得奖励，回顾每一次温暖的救助</p>
        </div>

        {/* 活动中的节日 */}
        {activeFestival && (
          <div className="bg-gradient-to-r from-pink-400 to-purple-400 rounded-xl p-4 mb-6 shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-4xl animate-bounce">{activeFestival.emoji}</span>
                <div>
                  <h3 className="font-bold text-lg">{activeFestival.name} 进行中！</h3>
                  <p className="text-sm text-white/80">{activeFestival.description}</p>
                </div>
              </div>
              <div className="text-center bg-white/20 rounded-lg px-4 py-2">
                <p className="text-xs">剩余</p>
                <p className="text-2xl font-bold">{activeFestival.remainingDays} 天</p>
              </div>
            </div>
          </div>
        )}

        {/* 标签切换 */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
              {tab.id === 'festival_logs' && festivalLogs.length > 0 && (
                <span className="ml-1 text-xs bg-pink-500 text-white px-1.5 py-0.5 rounded-full">
                  {festivalLogs.length}
                </span>
              )}
              {tab.id === 'recovery_records' && recoveryRecords.length > 0 && (
                <span className="ml-1 text-xs bg-green-500 text-white px-1.5 py-0.5 rounded-full">
                  {recoveryRecords.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === 'tasks' && (
          <>
            {/* 统计卡片 */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 shadow-md text-center">
                <span className="text-3xl">✅</span>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {tasks.filter(t => t.completed && t.claimed).length}
                </p>
                <p className="text-sm text-gray-500">已完成任务</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-md text-center">
                <span className="text-3xl">📝</span>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {tasks.filter(t => !t.completed).length}
                </p>
                <p className="text-sm text-gray-500">进行中任务</p>
              </div>
            </div>

            {/* 节日任务 */}
            {festivalTasks.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-2 h-6 rounded-full ${getTaskTypeColor('festival')}`}></div>
                  <h3 className="font-bold text-lg text-gray-700">🎉 {getTaskTypeLabel('festival')}</h3>
                </div>
                {renderTaskList(festivalTasks)}
              </div>
            )}

            {/* 每日任务 */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-2 h-6 rounded-full ${getTaskTypeColor('daily')}`}></div>
                <h3 className="font-bold text-lg text-gray-700">{getTaskTypeLabel('daily')}</h3>
              </div>
              {dailyTasks.length > 0 ? (
                renderTaskList(dailyTasks)
              ) : (
                <div className="bg-white rounded-xl p-8 text-center">
                  <p className="text-gray-400">暂无每日任务</p>
                </div>
              )}
            </div>

            {/* 每周任务 */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-2 h-6 rounded-full ${getTaskTypeColor('weekly')}`}></div>
                <h3 className="font-bold text-lg text-gray-700">{getTaskTypeLabel('weekly')}</h3>
              </div>
              {weeklyTasks.length > 0 ? (
                renderTaskList(weeklyTasks)
              ) : (
                <div className="bg-white rounded-xl p-8 text-center">
                  <p className="text-gray-400">暂无每周任务</p>
                </div>
              )}
            </div>

            {/* 特殊任务 */}
            {specialTasks.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-2 h-6 rounded-full ${getTaskTypeColor('special')}`}></div>
                  <h3 className="font-bold text-lg text-gray-700">{getTaskTypeLabel('special')}</h3>
                </div>
                {renderTaskList(specialTasks)}
              </div>
            )}

            {/* 小提示 */}
            <div className="bg-white/60 backdrop-blur rounded-xl p-4">
              <h3 className="font-bold text-gray-700 mb-2">💡 小提示</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 每日任务会在新的一天刷新</li>
                <li>• 节日活动有专属任务和奖励，不要错过哦</li>
                <li>• 救助更多动物可以获得更多声望</li>
                <li>• 收集漂流物可以换取金币</li>
              </ul>
            </div>
          </>
        )}

        {activeTab === 'festival_logs' && (
          <div>
            {festivalLogs.length > 0 ? (
              renderFestivalLogList()
            ) : (
              <div className="bg-white rounded-xl p-12 text-center shadow-md">
                <span className="text-6xl">🎉</span>
                <p className="text-gray-500 mt-4">还没有节日活动记录</p>
                <p className="text-gray-400 text-sm mt-1">耐心等待，节日会随机出现哦~</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'recovery_records' && (
          <div>
            {recoveryRecords.length > 0 ? (
              renderRecoveryRecordList()
            ) : (
              <div className="bg-white rounded-xl p-12 text-center shadow-md">
                <span className="text-6xl">💖</span>
                <p className="text-gray-500 mt-4">还没有康复记录</p>
                <p className="text-gray-400 text-sm mt-1">救助并放归动物后，这里会记录每一次温暖的故事~</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
