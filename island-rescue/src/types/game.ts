export type PersonalityType = 'timid' | 'greedy' | 'playful' | 'gentle' | 'curious';
export type CareEventType = 'feed' | 'clean' | 'play';

export interface Animal {
  id: string;
  name: string;
  emoji: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  recoveryDays: number;
  story: string;
  reputationReward: number;
  personality: PersonalityType;
  preferredCare: CareEventType;
  personalityLabel: string;
}

export interface CareEvent {
  id: string;
  type: CareEventType;
  title: string;
  description: string;
  emoji: string;
  reward: number;
  completed: boolean;
  dayGenerated: number;
  wasPreferred?: boolean;
}

export interface RecoveryRecord {
  id: string;
  animalId: string;
  animalName: string;
  animalEmoji: string;
  animalPersonality: string;
  preferredCare: string;
  rescueDate: number;
  releaseDate: number;
  careEvents: string[];
  preferredCareMatches: number;
  totalDays: number;
  notes: string;
}

export interface RescuedAnimal {
  id: string;
  animalId: string;
  name: string;
  rescueDate: number;
  health: number;
  maxHealth: number;
  status: 'injured' | 'treating' | 'recovering' | 'ready';
  careSlotId?: string;
  treatmentProgress: number;
  careEvents: CareEvent[];
  recoverySpeedBoost: number;
  preferredCareMatches: number;
}

export interface CareSlot {
  id: string;
  name: string;
  level: number;
  unlocked: boolean;
  occupiedBy?: string;
  recoveryBoost: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  emoji: string;
  description: string;
  type: 'tool' | 'supply' | 'material' | 'special';
  quantity: number;
}

export interface BeachFind {
  id: string;
  name: string;
  emoji: string;
  type: 'animal' | 'driftwood' | 'trash' | 'treasure';
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  value: number;
}

export interface PendingItem {
  id: string;
  item: BeachFind;
  foundAt: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'special' | 'festival';
  target: number;
  progress: number;
  reward: { type: string; amount: number };
  completed: boolean;
  claimed: boolean;
  festivalId?: string;
}

export interface Weather {
  id: string;
  name: string;
  emoji: string;
  description: string;
  animalSpawnRate: number;
  driftwoodSpawnRate: number;
  canGoOut: boolean;
}

export interface FestivalEvent {
  id: string;
  name: string;
  emoji: string;
  description: string;
  duration: number;
  effects: string[];
  startDay: number;
  remainingDays: number;
}

export interface FestivalLog {
  id: string;
  festivalId: string;
  festivalName: string;
  festivalEmoji: string;
  startDay: number;
  endDay: number;
  animalsRescued: number;
  animalsReleased: number;
  coinsEarned: number;
  coinsSpent: number;
  reputationEarned: number;
  tasksCompleted: number;
  tasksClaimed: number;
  rescuedAnimalNames: string[];
  releasedAnimalNames: string[];
}

export interface Decoration {
  id: string;
  name: string;
  emoji: string;
  cost: number;
  description: string;
  unlockLevel: number;
}

export interface StationLevel {
  level: number;
  name: string;
  requiredReputation: number;
  description: string;
  unlocks: string[];
}

export interface DailyLedger {
  day: number;
  coinsEarned: number;
  coinsSpent: number;
  reputationEarned: number;
  animalsRescued: number;
  animalsReleased: number;
  itemsCollected: number;
  itemsSold: number;
}

export interface UpgradePath {
  id: string;
  name: string;
  description: string;
  icon: string;
  maxLevel: number;
  effects: string[];
  costs: { coins: number; reputation?: number }[];
}

export interface UpgradeLevels {
  medical: number;
  recovery: number;
  exploration: number;
}

export type SceneType = 'beach' | 'clinic' | 'warehouse' | 'album' | 'tasks';

export interface FestivalStats {
  animalsRescued: number;
  animalsReleased: number;
  coinsEarned: number;
  coinsSpent: number;
  reputationEarned: number;
  tasksCompleted: number;
  tasksClaimed: number;
  rescuedAnimalNames: string[];
  releasedAnimalNames: string[];
}

export interface GameState {
  day: number;
  reputation: number;
  coins: number;
  stationLevel: number;
  currentScene: SceneType;
  currentWeather: Weather;
  rescuedAnimals: RescuedAnimal[];
  careSlots: CareSlot[];
  inventory: InventoryItem[];
  discoveredAnimals: string[];
  tasks: Task[];
  activeFestival?: FestivalEvent;
  festivalLogs: FestivalLog[];
  recoveryRecords: RecoveryRecord[];
  decorations: string[];
  warehouseLevel: number;
  warehouseCapacity: number;
  lastBeachSearch?: number;
  pendingItems: PendingItem[];
  dailyLedgers: DailyLedger[];
  currentDayLedger: DailyLedger;
  festivalStats: FestivalStats;
  upgradeLevels: UpgradeLevels;
}
