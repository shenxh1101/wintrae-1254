import { useGameStore } from '../store/useGameStore';

export const TasksScene = () => {
  const { tasks, claimTaskReward, reputation, coins } = useGameStore();

  const dailyTasks = tasks.filter(t => t.type === 'daily');
  const weeklyTasks = tasks.filter(t => t.type === 'weekly');
  const specialTasks = tasks.filter(t => t.type === 'special');

  const handleClaim = (taskId: string) => {
    claimTaskReward(taskId);
  };

  const getTaskTypeLabel = (type: string) => {
    switch (type) {
      case 'daily': return '每日任务';
      case 'weekly': return '每周任务';
      case 'special': return '特殊任务';
      default: return type;
    }
  };

  const getTaskTypeColor = (type: string) => {
    switch (type) {
      case 'daily': return 'bg-blue-500';
      case 'weekly': return 'bg-purple-500';
      case 'special': return 'bg-yellow-500';
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

  return (
    <div className="flex-1 bg-gradient-to-b from-indigo-100 to-blue-100 p-4 overflow-auto">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-indigo-700 mb-2">📋 任务</h2>
          <p className="text-indigo-500">完成任务获得丰厚奖励</p>
        </div>

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
            <li>• 救助更多动物可以获得更多声望</li>
            <li>• 声望越高，解锁的内容越多哦</li>
            <li>• 收集漂流物可以换取金币</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
