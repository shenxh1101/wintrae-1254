import {
  Animal,
  Weather,
  InventoryItem,
  BeachFind,
  Task,
  FestivalEvent,
  Decoration,
  CareSlot,
  StationLevel,
  UpgradePath,
  DailyLedger,
  BeachRoute,
} from '../types/game';

export const PERSONALITY_LABELS: Record<string, string> = {
  timid: '胆小',
  greedy: '贪吃',
  playful: '爱玩',
  gentle: '温顺',
  curious: '好奇',
};

export const CARE_TYPE_LABELS: Record<string, string> = {
  feed: '喂食',
  clean: '清洁',
  play: '玩耍',
};

export const ANIMALS: Animal[] = [
  {
    id: 'seagull',
    name: '海鸥',
    emoji: '🕊️',
    description: '常见的海鸟，翅膀受伤后无法飞行',
    rarity: 'common',
    recoveryDays: 2,
    story: '小海鸥在暴风雨中迷失了方向，撞到了礁石上。在救助站的悉心照料下，它终于能够再次展翅高飞了！',
    reputationReward: 10,
    personality: 'curious',
    preferredCare: 'feed',
    personalityLabel: '好奇',
  },
  {
    id: 'turtle',
    name: '小海龟',
    emoji: '🐢',
    description: '可爱的海龟宝宝，龟壳有轻微裂纹',
    rarity: 'common',
    recoveryDays: 3,
    story: '这只小海龟被渔网缠住了，幸好被及时发现。康复后，它慢悠悠地爬回了大海的怀抱。',
    reputationReward: 15,
    personality: 'gentle',
    preferredCare: 'clean',
    personalityLabel: '温顺',
  },
  {
    id: 'seal',
    name: '海豹',
    emoji: '🦭',
    description: '胖乎乎的海豹，鳍部受伤了',
    rarity: 'uncommon',
    recoveryDays: 5,
    story: '海豹宝宝和妈妈走散了，还不小心被石头划伤了鳍。经过精心照料，它终于恢复健康，回到了海豹群中。',
    reputationReward: 30,
    personality: 'greedy',
    preferredCare: 'feed',
    personalityLabel: '贪吃',
  },
  {
    id: 'penguin',
    name: '小企鹅',
    emoji: '🐧',
    description: '迷路的企鹅，又冷又饿',
    rarity: 'uncommon',
    recoveryDays: 4,
    story: '这只小企鹅随着洋流漂到了温暖的海域，又累又饿。在救助站吃饱喝足后，被送回了它的家乡。',
    reputationReward: 25,
    personality: 'timid',
    preferredCare: 'play',
    personalityLabel: '胆小',
  },
  {
    id: 'dolphin',
    name: '海豚',
    emoji: '🐬',
    description: '聪明的海豚，尾巴被渔网割伤',
    rarity: 'rare',
    recoveryDays: 7,
    story: '海豚被废弃的渔网缠住了尾巴，挣扎了很久才被发现。康复后的它欢快地跃出水面，好像在说谢谢呢！',
    reputationReward: 50,
    personality: 'playful',
    preferredCare: 'play',
    personalityLabel: '爱玩',
  },
  {
    id: 'octopus',
    name: '章鱼宝宝',
    emoji: '🐙',
    description: '八爪的小章鱼，触手受伤了',
    rarity: 'rare',
    recoveryDays: 6,
    story: '小章鱼在探索沉船时不小心被锋利的金属划伤了触手。在救助站的悉心照料下，它的触手慢慢长好了。',
    reputationReward: 45,
    personality: 'curious',
    preferredCare: 'clean',
    personalityLabel: '好奇',
  },
  {
    id: 'whale',
    name: '小白鲸',
    emoji: '🐋',
    description: '珍贵的白鲸，身体虚弱需要调养',
    rarity: 'legendary',
    recoveryDays: 14,
    story: '小白鲸在迁徙途中与族群走散了，因为体力不支搁浅在海滩上。经过漫长的康复期，它终于回到了大海，与家人团聚。',
    reputationReward: 100,
    personality: 'gentle',
    preferredCare: 'feed',
    personalityLabel: '温顺',
  },
  {
    id: 'crab',
    name: '小螃蟹',
    emoji: '🦀',
    description: '横着走的小螃蟹，壳受伤了',
    rarity: 'common',
    recoveryDays: 2,
    story: '小螃蟹在和小伙伴打架时弄伤了壳。在救助站养了几天，它就挥舞着大钳子横着走回沙滩了。',
    reputationReward: 8,
    personality: 'playful',
    preferredCare: 'feed',
    personalityLabel: '爱玩',
  },
  {
    id: 'jellyfish',
    name: '水母',
    emoji: '🪼',
    description: '透明的小水母，需要特殊照顾',
    rarity: 'uncommon',
    recoveryDays: 4,
    story: '这只美丽的水母被冲到了浅水区，差点被太阳晒干。救助站把它放回了特制的水箱里，等它恢复后送回了深海。',
    reputationReward: 20,
    personality: 'timid',
    preferredCare: 'clean',
    personalityLabel: '胆小',
  },
  {
    id: 'starfish',
    name: '海星',
    emoji: '⭐',
    description: '五角的小海星，断了一只腕',
    rarity: 'common',
    recoveryDays: 3,
    story: '小海星在躲避捕食者时断掉了一只腕。不过别担心，海星的腕是可以再生的！在救助站的照顾下，它很快就长出了新的腕。',
    reputationReward: 12,
    personality: 'gentle',
    preferredCare: 'clean',
    personalityLabel: '温顺',
  },
  {
    id: 'shrimp',
    name: '小虾',
    emoji: '🦐',
    description: '透明的小虾，需要细心呵护',
    rarity: 'common',
    recoveryDays: 1,
    story: '这只小虾被海浪冲到了礁石缝里，差点被困住。获救后，它欢快地游回了珊瑚礁。',
    reputationReward: 5,
    personality: 'timid',
    preferredCare: 'feed',
    personalityLabel: '胆小',
  },
  {
    id: 'swordfish',
    name: '剑鱼',
    emoji: '🐟',
    description: '长着长嘴的剑鱼，受伤了',
    rarity: 'rare',
    recoveryDays: 8,
    story: '剑鱼在追逐猎物时不小心撞上了船舷，撞晕了过去。在救助站的精心照料下，它慢慢恢复了活力。',
    reputationReward: 60,
    personality: 'greedy',
    preferredCare: 'play',
    personalityLabel: '贪吃',
  },
];

export const STATION_LEVELS: StationLevel[] = [
  {
    level: 1,
    name: '初创救助站',
    requiredReputation: 0,
    description: '刚起步的小型救助站，只能救助最常见的动物',
    unlocks: ['基础照护位 x2', '基础医疗物资'],
  },
  {
    level: 2,
    name: '成长救助站',
    requiredReputation: 100,
    description: '初具规模，可以救助更多种类的动物',
    unlocks: ['高级照护位解锁', '更多装饰可购买', '每周任务开启'],
  },
  {
    level: 3,
    name: '知名救助站',
    requiredReputation: 300,
    description: '小有名气的救助站，志愿者纷纷前来帮忙',
    unlocks: ['特级照护位解锁', '稀有动物出现率提升', '每日奖励翻倍'],
  },
  {
    level: 4,
    name: '模范救助站',
    requiredReputation: 600,
    description: '成为区域模范，获得政府资助',
    unlocks: ['豪华照护位解锁', '传说动物出现率提升', '特殊任务开启'],
  },
  {
    level: 5,
    name: '国家级救助站',
    requiredReputation: 1000,
    description: '全国知名的海洋动物救助中心',
    unlocks: ['所有照护位可用', '所有装饰可购买', '节日活动概率提升'],
  },
];

export const UPGRADE_PATHS: UpgradePath[] = [
  {
    id: 'medical',
    name: '医疗升级',
    description: '提升治疗效果，减少治疗次数',
    icon: '💊',
    maxLevel: 3,
    effects: ['治疗效果 +20%', '治疗效果 +40%', '治疗效果 +60%'],
    costs: [
      { coins: 200, reputation: 30 },
      { coins: 500, reputation: 80 },
      { coins: 1200, reputation: 150 },
    ],
  },
  {
    id: 'recovery',
    name: '康复升级',
    description: '提升所有照护位的恢复速度',
    icon: '💚',
    maxLevel: 3,
    effects: ['恢复速度 +10%', '恢复速度 +25%', '恢复速度 +50%'],
    costs: [
      { coins: 250, reputation: 40 },
      { coins: 600, reputation: 100 },
      { coins: 1500, reputation: 200 },
    ],
  },
  {
    id: 'exploration',
    name: '探索升级',
    description: '提升海岸巡查的发现率',
    icon: '🔍',
    maxLevel: 3,
    effects: ['动物发现率 +15%', '漂流物发现率 +20%', '稀有发现率 +10%'],
    costs: [
      { coins: 150, reputation: 20 },
      { coins: 400, reputation: 60 },
      { coins: 1000, reputation: 120 },
    ],
  },
];

export const MEDICAL_BOOSTS = [1.2, 1.4, 1.6];
export const RECOVERY_BOOSTS = [1.1, 1.25, 1.5];
export const EXPLORATION_BOOSTS = {
  animal: [1.15, 1.3, 1.5],
  driftwood: [1.2, 1.4, 1.6],
  rare: [1.1, 1.2, 1.35],
};

export const WEATHERS: Weather[] = [
  {
    id: 'sunny',
    name: '晴天',
    emoji: '☀️',
    description: '阳光明媚，适合出海',
    animalSpawnRate: 1.0,
    driftwoodSpawnRate: 1.0,
    canGoOut: true,
  },
  {
    id: 'cloudy',
    name: '多云',
    emoji: '⛅',
    description: '多云天气，动物更多了',
    animalSpawnRate: 1.2,
    driftwoodSpawnRate: 1.0,
    canGoOut: true,
  },
  {
    id: 'rainy',
    name: '雨天',
    emoji: '🌧️',
    description: '下雨了，漂流物更多',
    animalSpawnRate: 0.8,
    driftwoodSpawnRate: 1.5,
    canGoOut: true,
  },
  {
    id: 'storm',
    name: '暴风雨',
    emoji: '⛈️',
    description: '暴风雨来了，不要出海哦',
    animalSpawnRate: 1.5,
    driftwoodSpawnRate: 2.0,
    canGoOut: false,
  },
  {
    id: 'foggy',
    name: '雾天',
    emoji: '🌫️',
    description: '大雾弥漫，视线不好',
    animalSpawnRate: 0.6,
    driftwoodSpawnRate: 0.8,
    canGoOut: true,
  },
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 'bandage', name: '绷带', emoji: '🩹', description: '用于包扎伤口', type: 'supply', quantity: 10 },
  { id: 'medicine', name: '药膏', emoji: '🧴', description: '帮助伤口愈合', type: 'supply', quantity: 5 },
  { id: 'towel', name: '毛巾', emoji: '🧻', description: '清洁动物身体', type: 'supply', quantity: 8 },
  { id: 'food', name: '鱼食', emoji: '🐟', description: '给动物们的食物', type: 'supply', quantity: 20 },
  { id: 'net', name: '打捞网', emoji: '🥅', description: '打捞漂流物', type: 'tool', quantity: 1 },
  { id: 'brush', name: '刷子', emoji: '🪥', description: '清洁动物毛发', type: 'tool', quantity: 1 },
];

export const DRIFTWOOD_ITEMS: BeachFind[] = [
  { id: 'wood', name: '浮木', emoji: '🪵', type: 'driftwood', rarity: 'common', value: 5 },
  { id: 'shell', name: '贝壳', emoji: '🐚', type: 'driftwood', rarity: 'common', value: 8 },
  { id: 'bottle', name: '漂流瓶', emoji: '🍾', type: 'driftwood', rarity: 'uncommon', value: 15 },
  { id: 'chest', name: '宝箱', emoji: '📦', type: 'treasure', rarity: 'rare', value: 50 },
  { id: 'pearl', name: '珍珠', emoji: '🫧', type: 'treasure', rarity: 'rare', value: 40 },
  { id: 'coral', name: '珊瑚', emoji: '🪸', type: 'driftwood', rarity: 'uncommon', value: 20 },
  { id: 'trash_bag', name: '垃圾袋', emoji: '🗑️', type: 'trash', rarity: 'common', value: 2 },
  { id: 'can', name: '易拉罐', emoji: '🥫', type: 'trash', rarity: 'common', value: 1 },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'rescue_3',
    title: '小小救助员',
    description: '救助 3 只受伤的动物',
    type: 'daily',
    target: 3,
    progress: 0,
    reward: { type: 'coins', amount: 50 },
    completed: false,
    claimed: false,
  },
  {
    id: 'release_1',
    title: '重返大海',
    description: '放归 1 只康复的动物',
    type: 'daily',
    target: 1,
    progress: 0,
    reward: { type: 'reputation', amount: 20 },
    completed: false,
    claimed: false,
  },
  {
    id: 'collect_5',
    title: '海岸清洁工',
    description: '收集 5 件漂流物',
    type: 'daily',
    target: 5,
    progress: 0,
    reward: { type: 'coins', amount: 30 },
    completed: false,
    claimed: false,
  },
  {
    id: 'rescue_10',
    title: '救助达人',
    description: '累计救助 10 只动物',
    type: 'weekly',
    target: 10,
    progress: 0,
    reward: { type: 'coins', amount: 200 },
    completed: false,
    claimed: false,
  },
];

export const FESTIVALS: FestivalEvent[] = [
  {
    id: 'sea_festival',
    name: '海洋节',
    emoji: '🌊',
    description: '一年一度的海洋节！救助动物获得双倍声望',
    duration: 3,
    effects: ['double_reputation'],
    startDay: 0,
    remainingDays: 3,
  },
  {
    id: 'gift_day',
    name: '礼物日',
    emoji: '🎁',
    description: '神秘的礼物日！每天登录获得额外奖励',
    duration: 1,
    effects: ['daily_gift'],
    startDay: 0,
    remainingDays: 1,
  },
  {
    id: 'migration',
    name: '迁徙季',
    emoji: '🦅',
    description: '动物迁徙的季节！遇到珍稀动物的概率提升',
    duration: 5,
    effects: ['rare_animal_boost'],
    startDay: 0,
    remainingDays: 5,
  },
];

export const FESTIVAL_TASKS: Record<string, Task[]> = {
  sea_festival: [
    {
      id: 'festival_sea_rescue',
      title: '海洋节救助先锋',
      description: '海洋节期间救助 5 只受伤动物',
      type: 'festival',
      target: 5,
      progress: 0,
      reward: { type: 'coins', amount: 200 },
      completed: false,
      claimed: false,
      festivalId: 'sea_festival',
    },
    {
      id: 'festival_sea_release',
      title: '海洋节放归大使',
      description: '海洋节期间放归 3 只康复动物',
      type: 'festival',
      target: 3,
      progress: 0,
      reward: { type: 'reputation', amount: 100 },
      completed: false,
      claimed: false,
      festivalId: 'sea_festival',
    },
  ],
  gift_day: [
    {
      id: 'festival_gift_collect',
      title: '礼物日大丰收',
      description: '礼物日当天收集 10 件漂流物',
      type: 'festival',
      target: 10,
      progress: 0,
      reward: { type: 'coins', amount: 150 },
      completed: false,
      claimed: false,
      festivalId: 'gift_day',
    },
  ],
  migration: [
    {
      id: 'festival_migration_rare',
      title: '迁徙季珍稀守护者',
      description: '迁徙季期间救助 2 只稀有或以上动物',
      type: 'festival',
      target: 2,
      progress: 0,
      reward: { type: 'coins', amount: 300 },
      completed: false,
      claimed: false,
      festivalId: 'migration',
    },
    {
      id: 'festival_migration_rescue',
      title: '迁徙季救助能手',
      description: '迁徙季期间救助 8 只动物',
      type: 'festival',
      target: 8,
      progress: 0,
      reward: { type: 'reputation', amount: 80 },
      completed: false,
      claimed: false,
      festivalId: 'migration',
    },
  ],
};

export const CARE_EVENT_TEMPLATES = [
  {
    type: 'feed' as const,
    title: '肚子饿了',
    description: '小动物肚子饿了，喂它吃点东西吧！',
    emoji: '🍖',
    reward: 10,
  },
  {
    type: 'feed' as const,
    title: '想要零食',
    description: '小动物眼巴巴地看着你，好像想要好吃的~',
    emoji: '🐟',
    reward: 8,
  },
  {
    type: 'clean' as const,
    title: '需要洗澡',
    description: '小动物身上有点脏，给它清洁一下吧！',
    emoji: '🛁',
    reward: 10,
  },
  {
    type: 'clean' as const,
    title: '整理毛发',
    description: '小动物的毛发乱糟糟的，帮它梳理一下吧！',
    emoji: '✨',
    reward: 8,
  },
  {
    type: 'play' as const,
    title: '想要玩耍',
    description: '小动物看起来很无聊，陪它玩一会儿吧！',
    emoji: '🎾',
    reward: 12,
  },
  {
    type: 'play' as const,
    title: '需要陪伴',
    description: '小动物有点孤单，坐在它旁边陪陪它吧~',
    emoji: '🤗',
    reward: 10,
  },
];

export const RECOVERY_NOTES = [
  '康复过程非常顺利，小家伙每天都很精神！',
  '刚来时很虚弱，在大家的照顾下慢慢恢复了活力。',
  '是个很贪吃的小家伙，每次喂食都特别积极！',
  '喜欢和救助站的其他小伙伴一起玩耍。',
  '一开始有点怕人，后来变得特别亲人。',
  '恢复速度比预期的还要快，体质很棒！',
  '特别喜欢被人抚摸，每次都会舒服地眯起眼睛。',
  '康复期间最喜欢晒太阳，总是趴在温暖的地方。',
];

export const DECORATIONS: Decoration[] = [
  { id: 'flag', name: '彩旗', emoji: '🚩', cost: 50, description: '让救助站更有节日气氛', unlockLevel: 1 },
  { id: 'flower', name: '花朵', emoji: '🌸', cost: 30, description: '美丽的热带花朵', unlockLevel: 1 },
  { id: 'palm', name: '棕榈树', emoji: '🌴', cost: 100, description: '海岛标志性的棕榈树', unlockLevel: 1 },
  { id: 'umbrella', name: '遮阳伞', emoji: '⛱️', cost: 80, description: '休息时的好伙伴', unlockLevel: 1 },
  { id: 'bench', name: '长椅', emoji: '🪑', cost: 60, description: '休息用的长椅', unlockLevel: 1 },
  { id: 'boat', name: '小木船', emoji: '🛶', cost: 200, description: '装饰用的小木船', unlockLevel: 2 },
  { id: 'fountain', name: '喷泉', emoji: '⛲', cost: 300, description: '清凉的小喷泉', unlockLevel: 2 },
  { id: 'lighthouse', name: '灯塔模型', emoji: '🗼', cost: 500, description: '迷你版的灯塔', unlockLevel: 3 },
];

export const INITIAL_CARE_SLOTS: CareSlot[] = [
  { id: 'slot_1', name: '普通照护位 A', level: 1, unlocked: true, recoveryBoost: 1.0 },
  { id: 'slot_2', name: '普通照护位 B', level: 1, unlocked: true, recoveryBoost: 1.0 },
  { id: 'slot_3', name: '高级照护位', level: 2, unlocked: false, recoveryBoost: 1.5 },
  { id: 'slot_4', name: '特级照护位', level: 3, unlocked: false, recoveryBoost: 2.0 },
  { id: 'slot_5', name: '豪华照护位', level: 4, unlocked: false, recoveryBoost: 3.0 },
];

export const WAREHOUSE_LEVELS = [
  { level: 1, capacity: 50, upgradeCost: 0 },
  { level: 2, capacity: 100, upgradeCost: 100 },
  { level: 3, capacity: 200, upgradeCost: 300 },
  { level: 4, capacity: 500, upgradeCost: 800 },
  { level: 5, capacity: 1000, upgradeCost: 2000 },
];

export const createEmptyLedger = (day: number): DailyLedger => ({
  day,
  coinsEarned: 0,
  coinsSpent: 0,
  reputationEarned: 0,
  animalsRescued: 0,
  animalsReleased: 0,
  itemsCollected: 0,
  itemsSold: 0,
});

export const BEACH_ROUTES: BeachRoute[] = [
  {
    id: 'nearshore',
    name: '近岸浅滩',
    emoji: '🏖️',
    description: '安全温和的浅水区，适合新手探索',
    animalChance: 0.45,
    driftwoodChance: 0.4,
    rareBoost: 0.8,
    costSupplies: [],
    costLabel: '免费',
  },
  {
    id: 'reef',
    name: '珊瑚礁石',
    emoji: '🪸',
    description: '礁石区域，常见珍稀物种但需要消耗毛巾',
    animalChance: 0.55,
    driftwoodChance: 0.3,
    rareBoost: 1.5,
    costSupplies: [{ id: 'towel', quantity: 1 }],
    costLabel: '毛巾×1',
  },
  {
    id: 'deepbeach',
    name: '远滩深水',
    emoji: '🌊',
    description: '深海区域，稀有动物出没但需要鱼食引诱',
    animalChance: 0.35,
    driftwoodChance: 0.25,
    rareBoost: 2.5,
    costSupplies: [{ id: 'food', quantity: 1 }],
    costLabel: '鱼食×1',
  },
];

export const ANIMAL_CATEGORIES: Record<string, string> = {
  seagull: '鸟类', turtle: '爬行类', seal: '哺乳类', penguin: '鸟类',
  dolphin: '哺乳类', octopus: '软体类', whale: '哺乳类', crab: '甲壳类',
  jellyfish: '腔肠类', starfish: '棘皮类', shrimp: '甲壳类', seahorse: '鱼类',
};

export const generateRecoveryStory = (
  animalName: string,
  personality: string,
  preferredCare: string,
  treatmentCount: number,
  totalDays: number,
  preferredMatches: number,
  coinReward: number,
  reputationReward: number,
): string => {
  const parts: string[] = [];

  if (totalDays <= 2) {
    parts.push(`${animalName}来得急去得也快，短短${totalDays}天就恢复了健康。`);
  } else if (totalDays <= 5) {
    parts.push(`${animalName}在救助站住了${totalDays}天，每一天都在慢慢好转。`);
  } else if (totalDays <= 10) {
    parts.push(`${animalName}的康复之路走了${totalDays}天，过程虽然漫长但从未放弃。`);
  } else {
    parts.push(`${animalName}经历了漫长的${totalDays}天康复，终于重新回到了大海的怀抱。`);
  }

  if (personality === '胆小') {
    parts.push('刚来的时候总是躲在角落里，但随着照护越来越贴心，它慢慢敞开了心扉。');
  } else if (personality === '贪吃') {
    parts.push('每次喂食的时候都是最开心的，吃饱了就有力气恢复啦！');
  } else if (personality === '爱玩') {
    parts.push('最喜欢有人陪着玩耍，一玩起来就忘了伤痛。');
  } else if (personality === '温顺') {
    parts.push('特别乖巧听话，每次照护都非常配合。');
  } else if (personality === '好奇') {
    parts.push('对救助站的一切都充满好奇，东看看西摸摸，恢复得也特别快。');
  }

  if (treatmentCount === 1) {
    parts.push('经过一次仔细的治疗，伤势就有了明显好转。');
  } else if (treatmentCount >= 3) {
    parts.push(`经过${treatmentCount}次耐心的治疗，终于看到了康复的曙光。`);
  }

  if (preferredMatches >= 3) {
    parts.push(`照护时${preferredMatches}次匹配了它的${preferredCare}偏好，每次都让它精神焕发！`);
  } else if (preferredMatches >= 1) {
    parts.push(`${preferredMatches}次偏好照护让恢复事半功倍。`);
  }

  if (coinReward >= 30) {
    parts.push(`放归时获得了${coinReward}金币和${reputationReward}声望的丰厚回报！`);
  }

  return parts.join('');
};

export const getWeekReport = (ledgers: DailyLedger[], currentDay: number, currentLedger: DailyLedger) => {
  const startDay = Math.max(1, currentDay - 6);
  const weekLedgers = [
    ...ledgers.filter(l => l.day >= startDay),
    { ...currentLedger, day: currentDay },
  ];
  return {
    days: weekLedgers.length,
    coinsEarned: weekLedgers.reduce((s, l) => s + l.coinsEarned, 0),
    coinsSpent: weekLedgers.reduce((s, l) => s + l.coinsSpent, 0),
    reputationEarned: weekLedgers.reduce((s, l) => s + l.reputationEarned, 0),
    animalsRescued: weekLedgers.reduce((s, l) => s + l.animalsRescued, 0),
    animalsReleased: weekLedgers.reduce((s, l) => s + l.animalsReleased, 0),
    itemsCollected: weekLedgers.reduce((s, l) => s + l.itemsCollected, 0),
    itemsSold: weekLedgers.reduce((s, l) => s + l.itemsSold, 0),
  };
};

export const getMonthReport = (ledgers: DailyLedger[], currentDay: number, currentLedger: DailyLedger) => {
  const startDay = Math.max(1, currentDay - 29);
  const monthLedgers = [
    ...ledgers.filter(l => l.day >= startDay),
    { ...currentLedger, day: currentDay },
  ];
  return {
    days: monthLedgers.length,
    coinsEarned: monthLedgers.reduce((s, l) => s + l.coinsEarned, 0),
    coinsSpent: monthLedgers.reduce((s, l) => s + l.coinsSpent, 0),
    reputationEarned: monthLedgers.reduce((s, l) => s + l.reputationEarned, 0),
    animalsRescued: monthLedgers.reduce((s, l) => s + l.animalsRescued, 0),
    animalsReleased: monthLedgers.reduce((s, l) => s + l.animalsReleased, 0),
    itemsCollected: monthLedgers.reduce((s, l) => s + l.itemsCollected, 0),
    itemsSold: monthLedgers.reduce((s, l) => s + l.itemsSold, 0),
  };
};
