export interface Animal {
  id: string;
  name: string;
  emoji: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  recoveryDays: number;
  story: string;
  reputationReward: number;
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

export interface Task {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'special';
  target: number;
  progress: number;
  reward: { type: string; amount: number };
  completed: boolean;
  claimed: boolean;
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
}

export interface Decoration {
  id: string;
  name: string;
  emoji: string;
  cost: number;
  description: string;
}

export type SceneType = 'beach' | 'clinic' | 'warehouse' | 'album' | 'tasks';

export interface GameState {
  day: number;
  reputation: number;
  coins: number;
  currentScene: SceneType;
  currentWeather: Weather;
  rescuedAnimals: RescuedAnimal[];
  careSlots: CareSlot[];
  inventory: InventoryItem[];
  discoveredAnimals: string[];
  tasks: Task[];
  activeFestival?: FestivalEvent;
  decorations: string[];
  warehouseLevel: number;
  warehouseCapacity: number;
  lastBeachSearch?: number;
}
