import Dexie, { type Table } from 'dexie';
import type { Trip, Expense, Collection, AppSettings } from '../types';
import { createDefaultExpenseTypes } from '../data/defaultExpenseTypes';

export class BudgeeDatabase extends Dexie {
  trips!: Table<Trip, string>;
  expenses!: Table<Expense, string>;
  collections!: Table<Collection, string>;
  appSettings!: Table<AppSettings, string>;

  constructor() {
    super('BudgeeDB');

    this.version(1).stores({
      trips: 'id, createdAt, archived',
      expenses: 'id, tripId, date, paidBy',
      collections: 'id, tripId, memberId, collectedAt',
    });

    this.version(2).stores({
      trips: 'id, createdAt, archived',
      expenses: 'id, tripId, date, paidBy',
      collections: 'id, tripId, memberId, collectedAt',
      appSettings: 'id',
    }).upgrade(async (tx) => {
      const existing = await tx.table('appSettings').get('global');
      if (!existing) {
        await tx.table('appSettings').add({
          id: 'global',
          defaultExpenseTypes: createDefaultExpenseTypes(),
        });
      }
    });
  }
}

export const db = new BudgeeDatabase();
