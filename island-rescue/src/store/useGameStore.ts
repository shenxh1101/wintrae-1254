import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  GameState,
  SceneType,
  RescuedAnimal,
  Animal,
  BeachFind,
  CareEvent,
  RecoveryRecord,
  FestivalLog,
  PendingItem,
} from '../types/game';
import {
  ANIMALS,
  WEATHERS,
  INITIAL_INVENTORY,
  INITIAL_TASKS,
  INITIAL_CARE_SLOTS,
  WAREHOUSE_LEVELS,
  DRIFTWOOD_ITEMS,
  FESTIVALS,
  DECORATIONS,
  FESTIVAL_TASKS,
  CARE_EVENT_TEMPLATES,
  RECOVERY_NOTES,
} from '../data/gameData';

interface FestivalStats {
  animalsRescued: number;
  animalsReleased: number;
  coinsEarned: number;
  reputationEarned: number;
  tasksCompleted: number;
}

interface GameStore extends GameState {
  setScene: (scene: SceneType) => void;
  searchBeach: () => { found: boolean; result?: BeachFind | Animal; type?: 'animal' | 'driftwood' };
  rescueAnimal: (animalId: string) => void;
  treatAnimal: (rescuedId: string) => void;
  assignToCareSlot: (rescuedId: string, slotId: string) => void;
  releaseAnimal: (rescuedId: string) => void;
  collectDriftwood: (item: BeachFind) => boolean;
  upgradeWarehouse: () => boolean;
  unlockCareSlot: (slotId: string) => boolean;
  buyDecoration: (decorationId: string) => boolean;
  claimTaskReward: (taskId: string) => void;
  nextDay: () => void;
  addCoins: (amount: number) => void;
  addItem: (itemId: string, quantity: number) => void;
  useItem: (itemId: string, quantity: number) => boolean;
  getInventoryCount: () => number;
  buySupply: (itemId: string, quantity: number) => boolean;
  sellItem: (itemId: string, quantity: number) => boolean;
  addPendingItem: (item: BeachFind) => void;
  collectPendingItem: (pendingId: string) => boolean;
  discardPendingItem: (pendingId: string) => void;
  clearPendingItems: () => void;
  completeCareEvent: (rescuedId: string, eventId: string) => void;
  getRecoveryRecords: () => RecoveryRecord[];
  getFestivalLogs: () => FestivalLog[];
}

const getRandomWeather = () => {
  const weights = [40, 25, 15, 10, 10];
  const total = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * total;
  for (let i = 0; i < WEATHERS.length; i++) {
    random -= weights[i];
    if (random <= 0) return WEATHERS[i];
  }
  return WEATHERS[0];
};

const getRandomAnimal = (boostRare = false): Animal => {
  const common = ANIMALS.filter(a => a.rarity === 'common');
  const uncommon = ANIMALS.filter(a => a.rarity === 'uncommon');
  const rare = ANIMALS.filter(a => a.rarity === 'rare');
  const legendary = ANIMALS.filter(a => a.rarity === 'legendary');
  let rareBoost = boostRare ? 2 : 1;
  const weights = { common: 60, uncommon: 25, rare: 12 * rareBoost, legendary: 3 * rareBoost };
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  let random = Math.random() * total;
  if (random < weights.common) return common[Math.floor(Math.random() * common.length)];
  else if (random < weights.common + weights.uncommon) return uncommon[Math.floor(Math.random() * uncommon.length)];
  else if (random < weights.common + weights.uncommon + weights.rare) return rare[Math.floor(Math.random() * rare.length)];
  else return legendary[Math.floor(Math.random() * legendary.length)];
};

const getRandomDriftwood = (): BeachFind => {
  const common = DRIFTWOOD_ITEMS.filter(i => i.rarity === 'common');
  const uncommon = DRIFTWOOD_ITEMS.filter(i => i.rarity === 'uncommon');
  const rare = DRIFTWOOD_ITEMS.filter(i => i.rarity === 'rare');
  const weights = { common: 70, uncommon: 22, rare: 8 };
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  let random = Math.random() * total;
  if (random < weights.common) return common[Math.floor(Math.random() * common.length)];
  else if (random < weights.common + weights.uncommon) return uncommon[Math.floor(Math.random() * uncommon.length)];
  else return rare[Math.floor(Math.random() * rare.length)];
};

const generateId = () => Math.random().toString(36).substring(2, 9);

const generateCareEvent = (day: number): CareEvent => {
  const template = CARE_EVENT_TEMPLATES[Math.floor(Math.random() * CARE_EVENT_TEMPLATES.length)];
  return {
    id: generateId(),
    type: template.type,
    title: template.title,
    description: template.description,
    emoji: template.emoji,
    reward: template.reward,
    completed: false,
    dayGenerated: day,
  };
};

const initialFestivalStats: FestivalStats = {
  animalsRescued: 0,
  animalsReleased: 0,
  coinsEarned: 0,
  reputationEarned: 0,
  tasksCompleted: 0,
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      day: 1,
      reputation: 0,
      coins: 100,
      currentScene: 'beach',
      currentWeather: WEATHERS[0],
      rescuedAnimals: [],
      careSlots: INITIAL_CARE_SLOTS,
      inventory: INITIAL_INVENTORY,
      discoveredAnimals: [],
      tasks: INITIAL_TASKS,
      festivalLogs: [],
      recoveryRecords: [],
      decorations: [],
      warehouseLevel: 1,
      warehouseCapacity: 50,
      pendingItems: [],

      setScene: (scene) => set({ currentScene: scene }),

      searchBeach: () => {
        const state = get();
        const weather = state.currentWeather;
        const hasRareBoost = state.activeFestival?.effects.includes('rare_animal_boost');
        const animalChance = 0.4 * weather.animalSpawnRate;
        const driftwoodChance = 0.4 * weather.driftwoodSpawnRate;
        const random = Math.random();
        if (random < animalChance) {
          const animal = getRandomAnimal(hasRareBoost);
          return { found: true, result: animal, type: 'animal' as const };
        } else if (random < animalChance + driftwoodChance) {
          const item = getRandomDriftwood();
          return { found: true, result: item, type: 'driftwood' as const };
        } else {
          return { found: false };
        }
      },

      rescueAnimal: (animalId) => {
        const state = get();
        const animal = ANIMALS.find(a => a.id === animalId);
        if (!animal) return;

        const newRescued: RescuedAnimal = {
          id: generateId(),
          animalId: animal.id,
          name: animal.name,
          rescueDate: state.day,
          health: 30,
          maxHealth: 100,
          status: 'injured',
          treatmentProgress: 0,
          careEvents: [],
          recoverySpeedBoost: 0,
        };

        const newDiscovered = state.discoveredAnimals.includes(animalId)
          ? state.discoveredAnimals
          : [...state.discoveredAnimals, animalId];

        const newTasks = state.tasks.map(t => {
          if ((t.id === 'rescue_3' || t.id === 'rescue_10') && !t.completed) {
            const newProgress = Math.min(t.progress + 1, t.target);
            return { ...t, progress: newProgress, completed: newProgress >= t.target };
          }
          if (t.type === 'festival' && t.festivalId === state.activeFestival?.id && !t.completed) {
            if (t.id === 'festival_sea_rescue' || t.id === 'festival_migration_rescue') {
              const newProgress = Math.min(t.progress + 1, t.target);
              return { ...t, progress: newProgress, completed: newProgress >= t.target };
            }
            if (t.id === 'festival_migration_rare' && (animal.rarity === 'rare' || animal.rarity === 'legendary')) {
              const newProgress = Math.min(t.progress + 1, t.target);
              return { ...t, progress: newProgress, completed: newProgress >= t.target };
            }
          }
          return t;
        });

        set({
          rescuedAnimals: [...state.rescuedAnimals, newRescued],
          discoveredAnimals: newDiscovered,
          tasks: newTasks,
          lastBeachSearch: Date.now(),
        });
      },

      treatAnimal: (rescuedId) => {
        const state = get();
        const animal = state.rescuedAnimals.find(a => a.id === rescuedId);
        if (!animal || animal.status === 'ready') return;
        const bandage = state.inventory.find(i => i.id === 'bandage');
        const medicine = state.inventory.find(i => i.id === 'medicine');
        const towel = state.inventory.find(i => i.id === 'towel');
        if (!bandage || bandage.quantity < 1 || !medicine || medicine.quantity < 1 || !towel || towel.quantity < 1) return;

        const newInventory = state.inventory.map(item => {
          if (item.id === 'bandage') return { ...item, quantity: item.quantity - 1 };
          if (item.id === 'medicine') return { ...item, quantity: item.quantity - 1 };
          if (item.id === 'towel') return { ...item, quantity: item.quantity - 1 };
          return item;
        });

        const newAnimals = state.rescuedAnimals.map(a => {
          if (a.id === rescuedId) {
            const newProgress = Math.min(a.treatmentProgress + 34, 100);
            const newHealth = Math.min(a.health + 25, a.maxHealth);
            let newStatus = a.status;
            if (newProgress >= 100 && a.careSlotId) newStatus = 'recovering';
            else if (newProgress >= 100) newStatus = 'treating';
            return { ...a, treatmentProgress: newProgress, health: newHealth, status: newStatus };
          }
          return a;
        });

        set({ rescuedAnimals: newAnimals, inventory: newInventory });
      },

      assignToCareSlot: (rescuedId, slotId) => {
        const state = get();
        const slot = state.careSlots.find(s => s.id === slotId);
        const animal = state.rescuedAnimals.find(a => a.id === rescuedId);
        if (!slot || !slot.unlocked || slot.occupiedBy || !animal) return;

        const newSlots = state.careSlots.map(s => {
          if (s.id === slotId) return { ...s, occupiedBy: rescuedId };
          if (s.occupiedBy === rescuedId) return { ...s, occupiedBy: undefined };
          return s;
        });

        const newAnimals = state.rescuedAnimals.map(a => {
          if (a.id === rescuedId) {
            return {
              ...a,
              careSlotId: slotId,
              status: a.treatmentProgress >= 100 ? 'recovering' : a.status,
              careEvents: a.status === 'recovering' || a.treatmentProgress >= 100 ? [generateCareEvent(state.day)] : a.careEvents,
            };
          }
          return a;
        });

        set({ careSlots: newSlots, rescuedAnimals: newAnimals });
      },

      releaseAnimal: (rescuedId) => {
        const state = get();
        const animal = state.rescuedAnimals.find(a => a.id === rescuedId);
        const animalData = ANIMALS.find(a => a.id === animal?.animalId);
        if (!animal || animal.status !== 'ready' || !animalData) return;

        const hasDoubleRep = state.activeFestival?.effects.includes('double_reputation');
        const repGain = animalData.reputationReward * (hasDoubleRep ? 2 : 1);
        const coinGain = Math.floor(animalData.reputationReward * 0.5);

        const completedCareEvents = animal.careEvents.filter(e => e.completed).map(e => e.title);
        const recoveryRecord: RecoveryRecord = {
          id: generateId(),
          animalId: animalData.id,
          animalName: animalData.name,
          animalEmoji: animalData.emoji,
          rescueDate: animal.rescueDate,
          releaseDate: state.day,
          careEvents: completedCareEvents,
          totalDays: state.day - animal.rescueDate,
          notes: RECOVERY_NOTES[Math.floor(Math.random() * RECOVERY_NOTES.length)],
        };

        const newSlots = state.careSlots.map(s => {
          if (s.occupiedBy === rescuedId) return { ...s, occupiedBy: undefined };
          return s;
        });

        const newTasks = state.tasks.map(t => {
          if (t.id === 'release_1' && !t.completed) {
            const newProgress = Math.min(t.progress + 1, t.target);
            return { ...t, progress: newProgress, completed: newProgress >= t.target };
          }
          if (t.type === 'festival' && t.festivalId === state.activeFestival?.id && t.id === 'festival_sea_release' && !t.completed) {
            const newProgress = Math.min(t.progress + 1, t.target);
            return { ...t, progress: newProgress, completed: newProgress >= t.target };
          }
          return t;
        });

        set({
          rescuedAnimals: state.rescuedAnimals.filter(a => a.id !== rescuedId),
          careSlots: newSlots,
          reputation: state.reputation + repGain,
          coins: state.coins + coinGain,
          tasks: newTasks,
          recoveryRecords: [...state.recoveryRecords, recoveryRecord],
        });
      },

      collectDriftwood: (item) => {
        const state = get();
        const currentCount = state.inventory.reduce((sum, i) => sum + i.quantity, 0);

        if (item.type === 'trash') {
          set(state => ({
            coins: state.coins + item.value,
            tasks: state.tasks.map(t => {
              if (t.id === 'collect_5' && !t.completed) {
                const newProgress = Math.min(t.progress + 1, t.target);
                return { ...t, progress: newProgress, completed: newProgress >= t.target };
              }
              if (t.type === 'festival' && t.festivalId === state.activeFestival?.id && t.id === 'festival_gift_collect' && !t.completed) {
                const newProgress = Math.min(t.progress + 1, t.target);
                return { ...t, progress: newProgress, completed: newProgress >= t.target };
              }
              return t;
            }),
          }));
          return true;
        }

        if (currentCount >= state.warehouseCapacity) {
          return false;
        }

        const existingItem = state.inventory.find(i => i.id === item.id);
        let newInventory;
        if (existingItem) {
          newInventory = state.inventory.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
        } else {
          newInventory = [
            ...state.inventory,
            { id: item.id, name: item.name, emoji: item.emoji, description: item.name, type: 'material' as const, quantity: 1 },
          ];
        }

        set(state => ({
          inventory: newInventory,
          tasks: state.tasks.map(t => {
            if (t.id === 'collect_5' && !t.completed) {
              const newProgress = Math.min(t.progress + 1, t.target);
              return { ...t, progress: newProgress, completed: newProgress >= t.target };
            }
            if (t.type === 'festival' && t.festivalId === state.activeFestival?.id && t.id === 'festival_gift_collect' && !t.completed) {
              const newProgress = Math.min(t.progress + 1, t.target);
              return { ...t, progress: newProgress, completed: newProgress >= t.target };
            }
            return t;
          }),
        }));
        return true;
      },

      addPendingItem: (item) => {
        const state = get();
        const pending: PendingItem = {
          id: generateId(),
          item,
          foundAt: state.day,
        };
        set({ pendingItems: [...state.pendingItems, pending] });
      },

      collectPendingItem: (pendingId) => {
        const state = get();
        const pending = state.pendingItems.find(p => p.id === pendingId);
        if (!pending) return false;
        const success = get().collectDriftwood(pending.item);
        if (success) {
          set({ pendingItems: state.pendingItems.filter(p => p.id !== pendingId) });
        }
        return success;
      },

      discardPendingItem: (pendingId) => {
        const state = get();
        set({ pendingItems: state.pendingItems.filter(p => p.id !== pendingId) });
      },

      clearPendingItems: () => set({ pendingItems: [] }),

      upgradeWarehouse: () => {
        const state = get();
        const nextLevel = WAREHOUSE_LEVELS.find(l => l.level === state.warehouseLevel + 1);
        if (!nextLevel || state.coins < nextLevel.upgradeCost) return false;
        set({
          warehouseLevel: nextLevel.level,
          warehouseCapacity: nextLevel.capacity,
          coins: state.coins - nextLevel.upgradeCost,
        });
        return true;
      },

      unlockCareSlot: (slotId) => {
        const state = get();
        const slot = state.careSlots.find(s => s.id === slotId);
        if (!slot || slot.unlocked) return false;
        const costs: Record<number, number> = { 2: 150, 3: 400, 4: 1000, 5: 2500 };
        const cost = costs[slot.level] || 9999;
        if (state.coins < cost) return false;
        set({
          careSlots: state.careSlots.map(s => s.id === slotId ? { ...s, unlocked: true } : s),
          coins: state.coins - cost,
        });
        return true;
      },

      buyDecoration: (decorationId) => {
        const state = get();
        const decoration = DECORATIONS.find(d => d.id === decorationId);
        if (!decoration || state.decorations.includes(decorationId)) return false;
        if (state.coins < decoration.cost) return false;
        set({
          decorations: [...state.decorations, decorationId],
          coins: state.coins - decoration.cost,
        });
        return true;
      },

      claimTaskReward: (taskId) => {
        const state = get();
        const task = state.tasks.find(t => t.id === taskId);
        if (!task || !task.completed || task.claimed) return;
        let newState: Partial<GameState> = {};
        if (task.reward.type === 'coins') newState.coins = state.coins + task.reward.amount;
        else if (task.reward.type === 'reputation') newState.reputation = state.reputation + task.reward.amount;
        newState.tasks = state.tasks.map(t => t.id === taskId ? { ...t, claimed: true } : t);
        set(newState);
      },

      nextDay: () => {
        const state = get();
        const newDay = state.day + 1;
        const newWeather = getRandomWeather();
        let festivalStats: FestivalStats = initialFestivalStats;

        const newAnimals = state.rescuedAnimals.map(animal => {
          if (animal.status === 'recovering' && animal.careSlotId) {
            const slot = state.careSlots.find(s => s.id === animal.careSlotId);
            const animalData = ANIMALS.find(a => a.id === animal.animalId);
            if (slot && animalData) {
              const baseRecovery = 100 / animalData.recoveryDays;
              const slotBoost = slot.recoveryBoost;
              const careBoost = 1 + (animal.recoverySpeedBoost / 100);
              const recoveryPerDay = baseRecovery * slotBoost * careBoost;
              const newHealth = Math.min(animal.health + recoveryPerDay, animal.maxHealth);
              const pendingEvents = animal.careEvents.filter(e => !e.completed && e.dayGenerated < newDay);
              const activeEvents = pendingEvents.length > 0 ? pendingEvents : [generateCareEvent(newDay)];
              return {
                ...animal,
                health: newHealth,
                status: newHealth >= 100 ? 'ready' as const : 'recovering' as const,
                careEvents: [...animal.careEvents.filter(e => e.completed), ...activeEvents],
                recoverySpeedBoost: Math.max(0, animal.recoverySpeedBoost - 5),
              };
            }
          }
          return animal;
        });

        let newFestival = state.activeFestival;
        let newFestivalLogs = state.festivalLogs;

        if (newFestival) {
          const remaining = newFestival.remainingDays - 1;
          if (remaining <= 0) {
            const log: FestivalLog = {
              id: generateId(),
              festivalId: newFestival.id,
              festivalName: newFestival.name,
              festivalEmoji: newFestival.emoji,
              startDay: newFestival.startDay,
              endDay: state.day,
              ...festivalStats,
            };
            newFestivalLogs = [...state.festivalLogs, log];
            newFestival = undefined;
          } else {
            newFestival = { ...newFestival, remainingDays: remaining };
          }
        } else if (Math.random() < 0.12) {
          const festivalTemplate = FESTIVALS[Math.floor(Math.random() * FESTIVALS.length)];
          newFestival = {
            ...festivalTemplate,
            startDay: newDay,
            remainingDays: festivalTemplate.duration,
          };
        }

        let newTasks = state.tasks.map(t => {
          if (t.type === 'daily') return { ...t, progress: 0, completed: false, claimed: false };
          return t;
        });

        if (state.activeFestival && !newFestival) {
          newTasks = newTasks.filter(t => t.type !== 'festival');
        }
        if (newFestival && !state.activeFestival) {
          const festivalTasks = FESTIVAL_TASKS[newFestival.id] || [];
          newTasks = [...newTasks, ...festivalTasks.map(t => ({ ...t }))];
        }

        const giftCoins = newFestival?.effects.includes('daily_gift') ? 50 : 0;

        set({
          day: newDay,
          currentWeather: newWeather,
          rescuedAnimals: newAnimals,
          tasks: newTasks,
          activeFestival: newFestival,
          festivalLogs: newFestivalLogs,
          coins: state.coins + giftCoins,
          lastBeachSearch: undefined,
          pendingItems: [],
        });
      },

      addCoins: (amount) => set(state => ({ coins: state.coins + amount })),

      addItem: (itemId, quantity) => {
        const state = get();
        const existingItem = state.inventory.find(i => i.id === itemId);
        if (existingItem) {
          set({ inventory: state.inventory.map(i => i.id === itemId ? { ...i, quantity: i.quantity + quantity } : i) });
        }
      },

      useItem: (itemId, quantity) => {
        const state = get();
        const item = state.inventory.find(i => i.id === itemId);
        if (!item || item.quantity < quantity) return false;
        set({ inventory: state.inventory.map(i => i.id === itemId ? { ...i, quantity: i.quantity - quantity } : i) });
        return true;
      },

      getInventoryCount: () => {
        const state = get();
        return state.inventory.reduce((sum, i) => sum + i.quantity, 0);
      },

      buySupply: (itemId, quantity) => {
        const state = get();
        const prices: Record<string, number> = { bandage: 10, medicine: 20, towel: 8, food: 5 };
        const price = prices[itemId];
        if (!price) return false;
        const totalCost = price * quantity;
        if (state.coins < totalCost) return false;
        const currentCount = state.inventory.reduce((sum, i) => sum + i.quantity, 0);
        if (currentCount + quantity > state.warehouseCapacity) return false;
        const existingItem = state.inventory.find(i => i.id === itemId);
        let newInventory;
        if (existingItem) {
          newInventory = state.inventory.map(i => i.id === itemId ? { ...i, quantity: i.quantity + quantity } : i);
        } else {
          const itemData = INITIAL_INVENTORY.find(i => i.id === itemId);
          if (!itemData) return false;
          newInventory = [...state.inventory, { ...itemData, quantity }];
        }
        set({ inventory: newInventory, coins: state.coins - totalCost });
        return true;
      },

      sellItem: (itemId, quantity) => {
        const state = get();
        const item = state.inventory.find(i => i.id === itemId);
        if (!item || item.quantity < quantity) return false;
        const sellPrices: Record<string, number> = {
          wood: 5, shell: 8, bottle: 15, chest: 50, pearl: 40, coral: 20,
        };
        const price = sellPrices[itemId] || 1;
        const totalPrice = price * quantity;
        set({
          inventory: state.inventory.map(i => i.id === itemId ? { ...i, quantity: i.quantity - quantity } : i).filter(i => i.quantity > 0),
          coins: state.coins + totalPrice,
        });
        return true;
      },

      completeCareEvent: (rescuedId, eventId) => {
        const state = get();
        const food = state.inventory.find(i => i.id === 'food');
        if (!food || food.quantity < 1) return;

        set({
          inventory: state.inventory.map(i => i.id === 'food' ? { ...i, quantity: i.quantity - 1 } : i),
          rescuedAnimals: state.rescuedAnimals.map(a => {
            if (a.id === rescuedId) {
              const newEvents = a.careEvents.map(e => {
                if (e.id === eventId && !e.completed) {
                  return { ...e, completed: true };
                }
                return e;
              });
              const completedEvent = a.careEvents.find(e => e.id === eventId);
              return {
                ...a,
                careEvents: newEvents,
                recoverySpeedBoost: a.recoverySpeedBoost + (completedEvent?.reward || 5),
                health: Math.min(a.health + 3, a.maxHealth),
              };
            }
            return a;
          }),
        });
      },

      getRecoveryRecords: () => get().recoveryRecords,
      getFestivalLogs: () => get().festivalLogs,
    }),
    { name: 'island-rescue-game-v2' }
  )
);
