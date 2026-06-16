import { useState } from 'react';

interface WelcomeModalProps {
  onStart: () => void;
}

export const WelcomeModal = ({ onStart }: WelcomeModalProps) => {
  const [step, setStep] = useState(0);

  const tutorialSteps = [
    {
      emoji: '🏝️',
      title: '欢迎来到海岛救助站！',
      description: '在这里，你将经营一座专门救助海洋动物的小岛。和爸爸妈妈一起，帮助受伤的小动物们恢复健康吧！',
    },
    {
      emoji: '🔍',
      title: '海岸巡查',
      description: '在海滩上巡逻，发现受伤的动物和漂流物。不同的天气会遇到不同的东西哦~',
    },
    {
      emoji: '💊',
      title: '治疗与照护',
      description: '用绷带、药膏和毛巾给小动物治疗，然后安排它们在照护位休息康复。',
    },
    {
      emoji: '🌊',
      title: '放归大海',
      description: '等动物完全康复后，就可以把它们放归大海啦！你会获得声望奖励哦。',
    },
    {
      emoji: '🏆',
      title: '收集与扩建',
      description: '收集漂流物换取金币，升级仓库和照护位，装饰你的救助站，解锁更多动物图鉴！',
    },
  ];

  const handleNext = () => {
    if (step < tutorialSteps.length - 1) {
      setStep(step + 1);
    } else {
      onStart();
    }
  };

  const handleSkip = () => {
    onStart();
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-ocean-400 to-ocean-600 flex items-center justify-center z-50 p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-6xl animate-float">☁️</div>
        <div className="absolute top-20 right-20 text-5xl animate-float" style={{ animationDelay: '1s' }}>☁️</div>
        <div className="absolute bottom-20 left-20 text-4xl animate-wave">🌴</div>
        <div className="absolute bottom-16 right-16 text-5xl animate-wave" style={{ animationDelay: '0.5s' }}>🌴</div>
        <div className="absolute bottom-0 left-0 right-0 text-4xl text-ocean-300/50">
          🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊
        </div>
      </div>

      <div className="relative bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <div className="text-center">
          <div className="text-7xl mb-4 animate-bounce-slow">
            {tutorialSteps[step].emoji}
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            {tutorialSteps[step].title}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {tutorialSteps[step].description}
          </p>
        </div>

        <div className="flex justify-center gap-2 mt-6">
          {tutorialSteps.map((_, index) => (
            <div
              key={index}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                index === step ? 'bg-ocean-500 w-6' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        <div className="mt-8 flex gap-3">
          <button
            onClick={handleSkip}
            className="flex-1 py-3 text-gray-500 font-medium hover:text-gray-700 transition-colors"
          >
            跳过
          </button>
          <button
            onClick={handleNext}
            className="flex-1 py-3 bg-gradient-to-r from-ocean-500 to-ocean-600 text-white font-bold rounded-xl hover:from-ocean-600 hover:to-ocean-700 transition-all transform hover:scale-105 shadow-lg"
          >
            {step < tutorialSteps.length - 1 ? '下一步' : '开始游戏！'}
          </button>
        </div>
      </div>
    </div>
  );
};
