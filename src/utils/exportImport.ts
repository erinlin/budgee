import type { Trip, Expense, Collection } from '../types';
import { db } from '../db';
import { v4 as uuidv4 } from 'uuid';

export interface BudgeeExportData {
  version: 1;
  exportedAt: number;
  trip: Trip;
  expenses: Expense[];
  collections: Collection[];
}

// --- JSON 匯出 ---
export async function exportTripAsJson(tripId: string): Promise<void> {
  const trip = await db.trips.get(tripId);
  if (!trip) throw new Error('找不到旅行資料');

  const expenses = await db.expenses.where({ tripId }).toArray();
  const collections = await db.collections.where({ tripId }).toArray();

  const data: BudgeeExportData = {
    version: 1,
    exportedAt: Date.now(),
    trip,
    expenses,
    collections,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `budgee-${trip.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '-')}-${dateStr}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// --- JSON 匯入 ---
export type ImportConflictAction = 'overwrite' | 'coexist';

export interface ImportResult {
  trip: Trip;
  conflictExists: boolean;
}

export async function importTripFromJson(
  file: File,
  conflictAction?: ImportConflictAction
): Promise<ImportResult> {
  const text = await file.text();
  const data: BudgeeExportData = JSON.parse(text);

  if (data.version !== 1 || !data.trip) {
    throw new Error('無效的 Budgee 匯出檔案格式');
  }

  const existingTrip = await db.trips.get(data.trip.id);
  const conflictExists = !!existingTrip;

  if (conflictExists && !conflictAction) {
    // 回傳衝突資訊，讓呼叫端決定
    return { trip: data.trip, conflictExists: true };
  }

  if (conflictExists && conflictAction === 'coexist') {
    // 並存：為所有資料重新分配新 id
    const idMap: Record<string, string> = {};
    const newTripId = uuidv4();
    idMap[data.trip.id] = newTripId;

    const newTrip: Trip = {
      ...data.trip,
      id: newTripId,
      title: `${data.trip.title}（匯入副本）`,
    };

    const newExpenses: Expense[] = data.expenses.map(e => {
      const newId = uuidv4();
      return { ...e, id: newId, tripId: newTripId };
    });

    const newCollections: Collection[] = data.collections.map(c => {
      const newId = uuidv4();
      return { ...c, id: newId, tripId: newTripId };
    });

    await db.transaction('rw', db.trips, db.expenses, db.collections, async () => {
      await db.trips.add(newTrip);
      await db.expenses.bulkAdd(newExpenses);
      await db.collections.bulkAdd(newCollections);
    });

    return { trip: newTrip, conflictExists: false };
  }

  // 覆蓋或無衝突：直接寫入
  await db.transaction('rw', db.trips, db.expenses, db.collections, async () => {
    await db.trips.put(data.trip);
    await db.expenses.where({ tripId: data.trip.id }).delete();
    await db.expenses.bulkAdd(data.expenses);
    await db.collections.where({ tripId: data.trip.id }).delete();
    await db.collections.bulkAdd(data.collections);
  });

  return { trip: data.trip, conflictExists: false };
}
