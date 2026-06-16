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
  DailyLedger,
  StationLevel,
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
  STATION_LEVELS,
  createEmptyLedger,
  CARE_TYPE_LABELS,
} from '../data/gameData';

interface FestivalStats {
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
  getStationLevel: () => StationLevel;
  getNextStationLevel: () => StationLevel | null;
  getCurrentLedger: () => DailyLedger;
  getRecentLedgers: (days: number) => DailyLedger[];
  spendCoins: (amount: number) => void;
  earnCoins: (amount: number) => void;
  earnReputation: (amount: number) => void;
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
    wasPreferred: false,
  };
};

const initialFestivalStats: FestivalStats = {
  animalsRescued: 0,
  animalsReleased: 0,
  coinsEarned: 0,
  coinsSpent: 0,
  reputationEarned: 0,
  tasksCompleted: 0,
  tasksClaimed: 0,
  rescuedAnimalNames: [],
  releasedAnimalNames: [],
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      day: 1,
      reputation: 0,
      coins: 100,
      stationLevel: 1,
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
      dailyLedgers: [],
      currentDayLedger: createEmptyLedger(1),
      festivalStats: initialFestivalStats,

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

      earnCoins: (amount) => {
        const state = get();
        set({
          coins: state.coins + amount,
          currentDayLedger: {
            ...state.currentDayLedger,
            coinsEarned: state.currentDayLedger.coinsEarned + amount,
          },
          festivalStats: state.activeFestival
            ? {
                ...state.festivalStats,
                coinsEarned: state.festivalStats.coinsEarned + amount,
              }
            : state.festivalStats,
        });
      },

      spendCoins: (amount) => {
        const state = get();
        set({
          coins: state.coins - amount,
          currentDayLedger: {
            ...state.currentDayLedger,
            coinsSpent: state.currentDayLedger.coinsSpent + amount,
          },
          festivalStats: state.activeFestival
            ? {
                ...state.festivalStats,
                coinsSpent: state.festivalStats.coinsSpent + amount,
              }
            : state.festivalStats,
        });
      },

      earnReputation: (amount) => {
        const state = get();
        const newRep = state.reputation + amount;
        const newLevel = STATION_LEVELS.filter(l => l.requiredReputation <= newRep).pop()?.level || 1;
        set({
          reputation: newRep,
          stationLevel: newLevel,
          currentDayLedger: {
            ...state.currentDayLedger,
            reputationEarned: state.currentDayLedger.reputationEarned + amount,
          },
          festivalStats: state.activeFestival
            ? {
                ...state.festivalStats,
                reputationEarned: state.festivalStats.reputationEarned + amount,
              }
            : state.festivalStats,
        });
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
          preferredCareMatches: 0,
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
          currentDayLedger: {
            ...state.currentDayLedger,
            animalsRescued: state.currentDayLedger.animalsRescued + 1,
          },
          festivalStats: state.activeFestival
            ? {
                ...state.festivalStats,
                animalsRescued: state.festivalStats.animalsRescued + 1,
                rescuedAnimalNames: [...state.festivalStats.rescuedAnimalNames, animal.name],
              }
            : state.festivalStats,
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

        const completedCareEvents = animal.careEvents.filter(e => e.completed);
        const preferredMatches = completedCareEvents.filter(e => e.wasPreferred).length;

        const recoveryRecord: RecoveryRecord = {
          id: generateId(),
          animalId: animalData.id,
          animalName: animalData.name,
          animalEmoji: animalData.emoji,
          animalPersonality: animalData.personalityLabel,
          preferredCare: CARE_TYPE_LABELS[animalData.preferredCare],
          rescueDate: animal.rescueDate,
          releaseDate: state.day,
          careEvents: completedCareEvents.map(e => e.title),
          preferredCareMatches: preferredMatches,
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

        get().earnReputation(repGain);
        get().earnCoins(coinGain);

        set({
          rescuedAnimals: state.rescuedAnimals.filter(a => a.id !== rescuedId),
          careSlots: newSlots,
          tasks: newTasks,
          recoveryRecords: [...state.recoveryRecords, recoveryRecord],
          currentDayLedger: {
            ...state.currentDayLedger,
            animalsReleased: state.currentDayLedger.animalsReleased + 1,
          },
          festivalStats: state.activeFestival
            ? {
                ...state.festivalStats,
                animalsReleased: state.festivalStats.animalsReleased + 1,
                releasedAnimalNames: [...state.festivalStats.releasedAnimalNames, animalData.name],
              }
            : state.festivalStats,
        });
      },

      collectDriftwood: (item) => {
        const state = get();
        const currentCount = state.inventory.reduce((sum, i) => sum + i.quantity, 0);

        if (item.type === 'trash') {
          get().earnCoins(item.value);
          set(state => ({
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
            currentDayLedger: {
              ...state.currentDayLedger,
              itemsCollected: state.currentDayLedger.itemsCollected + 1,
            },
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
          currentDayLedger: {
            ...state.currentDayLedger,
            itemsCollected: state.currentDayLedger.itemsCollected + 1,
          },
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
        get().spendCoins(nextLevel.upgradeCost);
        set({
          warehouseLevel: nextLevel.level,
          warehouseCapacity: nextLevel.capacity,
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
        get().spendCoins(cost);
        set({
          careSlots: state.careSlots.map(s => s.id === slotId ? { ...s, unlocked: true } : s),
        });
        return true;
      },

      buyDecoration: (decorationId) => {
        const state = get();
        const decoration = DECORATIONS.find(d => d.id === decorationId);
        if (!decoration || state.decorations.includes(decorationId)) return false;
        if (state.coins < decoration.cost) return false;
        if (state.stationLevel < decoration.unlockLevel) return false;
        get().spendCoins(decoration.cost);
        set({
          decorations: [...state.decorations, decorationId],
        });
        return true;
      },

      claimTaskReward: (taskId) => {
        const state = get();
        const task = state.tasks.find(t => t.id === taskId);
        if (!task || !task.completed || task.claimed) return;
        if (task.reward.type === 'coins') {
          get().earnCoins(task.reward.amount);
        } else if (task.reward.type === 'reputation') {
          get().earnReputation(task.reward.amount);
        }
        set({
          tasks: state.tasks.map(t => t.id === taskId ? { ...t, claimed: true } : t),
          festivalStats: state.activeFestival && task.type === 'festival'
            ? {
                ...state.festivalStats,
                tasksClaimed: state.festivalStats.tasksClaimed + 1,
              }
            : state.festivalStats,
        });
      },

      nextDay: () => {
        const state = get();
        const newDay = state.day + 1;
        const newWeather = getRandomWeather();

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
        let festivalStats = state.festivalStats;

        if (newFestival) {
          const currentFestival = newFestival;
          const remaining = currentFestival.remainingDays - 1;
          if (remaining <= 0) {
            const completedTasks = state.tasks.filter(
              t => t.type === 'festival' && t.festivalId === currentFestival.id && t.completed
            ).length;
            const log: FestivalLog = {
              id: generateId(),
              festivalId: currentFestival.id,
              festivalName: currentFestival.name,
              festivalEmoji: currentFestival.emoji,
              startDay: currentFestival.startDay,
              endDay: state.day,
              animalsRescued: festivalStats.animalsRescued,
              animalsReleased: festivalStats.animalsReleased,
              coinsEarned: festivalStats.coinsEarned,
              coinsSpent: festivalStats.coinsSpent,
              reputationEarned: festivalStats.reputationEarned,
              tasksCompleted: completedTasks,
              tasksClaimed: festivalStats.tasksClaimed,
              rescuedAnimalNames: festivalStats.rescuedAnimalNames,
              releasedAnimalNames: festivalStats.releasedAnimalNames,
            };
            newFestivalLogs = [...state.festivalLogs, log];
            newFestival = undefined;
            festivalStats = initialFestivalStats;
          } else {
            newFestival = { ...currentFestival, remainingDays: remaining };
          }
        } else if (Math.random() < 0.12) {
          const festivalTemplate = FESTIVALS[Math.floor(Math.random() * FESTIVALS.length)];
          newFestival = {
            ...festivalTemplate,
            startDay: newDay,
            remainingDays: festivalTemplate.duration,
          };
          festivalStats = initialFestivalStats;
        }

        let newTasks = state.tasks.map(t => {
          if (t.type === 'daily') return { ...t, progress: 0, completed: false, claimed: false };
          return t;
        });

        const newCompletedTasks = newTasks.map(t => {
          if (t.type === 'festival' && t.festivalId === state.activeFestival?.id && !t.completed) {
            return { ...t };
          }
          return t;
        });
        const festivalCompletedNow = newCompletedTasks.filter(t => t.completed).length;
        if (state.activeFestival && !newFestival) {
          newTasks = newTasks.filter(t => t.type !== 'festival');
          festivalStats.tasksCompleted = festivalCompletedNow;
        }
        if (newFestival && !state.activeFestival) {
          const festivalTasks = FESTIVAL_TASKS[newFestival.id] || [];
          newTasks = [...newTasks, ...festivalTasks.map(t => ({ ...t }))];
        }

        const giftCoins = newFestival?.effects.includes('daily_gift') ? 50 : 0;
        if (giftCoins > 0) {
          get().earnCoins(giftCoins);
        }

        const completedLedger = { ...state.currentDayLedger };
        const newLedger = createEmptyLedger(newDay);

        set({
          day: newDay,
          currentWeather: newWeather,
          rescuedAnimals: newAnimals,
          tasks: newTasks,
          activeFestival: newFestival,
          festivalLogs: newFestivalLogs,
          lastBeachSearch: undefined,
          dailyLedgers: [...state.dailyLedgers, completedLedger],
          currentDayLedger: newLedger,
          festivalStats: festivalStats,
        });
      },

      addCoins: (amount) => get().earnCoins(amount),

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
        get().spendCoins(totalCost);
        set({ inventory: newInventory });
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
        get().earnCoins(totalPrice);
        set({
          inventory: state.inventory.map(i => i.id === itemId ? { ...i, quantity: i.quantity - quantity } : i).filter(i => i.quantity > 0),
          currentDayLedger: {
            ...state.currentDayLedger,
            itemsSold: state.currentDayLedger.itemsSold + quantity,
          },
        });
        return true;
      },

      completeCareEvent: (rescuedId, eventId) => {
        const state = get();
        const food = state.inventory.find(i => i.id === 'food');
        if (!food || food.quantity < 1) return;

        const animal = state.rescuedAnimals.find(a => a.id === rescuedId);
        const animalData = ANIMALS.find(a => a.id === animal?.animalId);
        if (!animal || !animalData) return;

        set({
          inventory: state.inventory.map(i => i.id === 'food' ? { ...i, quantity: i.quantity - 1 } : i),
          rescuedAnimals: state.rescuedAnimals.map(a => {
            if (a.id === rescuedId) {
              const completedEvent = a.careEvents.find(e => e.id === eventId);
              if (!completedEvent || completedEvent.completed) return a;
              const isPreferred = animalData.preferredCare === completedEvent.type;
              const baseReward = completedEvent.reward;
              const boostReward = isPreferred ? Math.floor(baseReward * 1.5) : baseReward;
              const healthBoost = isPreferred ? 5 : 3;
              const newEvents = a.careEvents.map(e => {
                if (e.id === eventId && !e.completed) {
                  return { ...e, completed: true, wasPreferred: isPreferred };
                }
                return e;
              });
              return {
                ...a,
                careEvents: newEvents,
                recoverySpeedBoost: a.recoverySpeedBoost + boostReward,
                health: Math.min(a.health + healthBoost, a.maxHealth),
                preferredCareMatches: a.preferredCareMatches + (isPreferred ? 1 : 0),
              };
            }
            return a;
          }),
        });
      },

      getRecoveryRecords: () => get().recoveryRecords,
      getFestivalLogs: () => get().festivalLogs,

      getStationLevel: () => {
        const state = get();
        return STATION_LEVELS.find(l => l.level === state.stationLevel) || STATION_LEVELS[0];
      },

      getNextStationLevel: () => {
        const state = get();
        return STATION_LEVELS.find(l => l.level === state.stationLevel + 1) || null;
      },

      getCurrentLedger: () => get().currentDayLedger,

      getRecentLedgers: (days) => {
        const state = get();
        return [...state.dailyLedgers].slice(-days).reverse();
      },
    }),
    { name: 'island-rescue-game-v3' }
  )
);
