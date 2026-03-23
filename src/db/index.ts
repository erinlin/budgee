import Dexie, { type Table } from 'dexie';
import type { Trip, Expense, Collection } from '../types';

export class BudgeeDatabase extends Dexie {
  trips!: Table<Trip, string>;
  expenses!: Table<Expense, string>;
  collections!: Table<Collection, string>;

  constructor() {
    super('BudgeeDB');
    
    // Define tables and indexes
    this.version(1).stores({
      trips: 'id, createdAt, archived',
      expenses: 'id, tripId, date, paidBy',
      collections: 'id, tripId, memberId, collectedAt'
    });
  }
}

export const db = new BudgeeDatabase();
