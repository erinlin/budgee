import { create } from 'zustand';
import { db } from '../db';
import type { Trip, Member, Role } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface TripState {
  trips: Trip[];
  activeTrip: Trip | null;
  isLoading: boolean;
  loadTrips: () => Promise<void>;
  getTrip: (id: string) => Promise<Trip | undefined>;
  createTrip: (tripData: Omit<Trip, 'id' | 'createdAt' | 'updatedAt' | 'archived'>) => Promise<string>;
  updateTrip: (id: string, updates: Partial<Trip>) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;
  setArchived: (id: string, archived: boolean) => Promise<void>;
  
  // Member operations
  addMember: (tripId: string, nickname: string, role: Role) => Promise<void>;
  updateMember: (tripId: string, memberId: string, updates: Partial<Member>) => Promise<void>;
  deleteMember: (tripId: string, memberId: string) => Promise<void>;
  checkMemberHasExpenses: (tripId: string, memberId: string) => Promise<boolean>;
}

export const useTripStore = create<TripState>((set, get) => ({
  trips: [],
  activeTrip: null,
  isLoading: false,

  loadTrips: async () => {
    set({ isLoading: true });
    try {
      const trips = await db.trips.orderBy('createdAt').reverse().toArray();
      set({ trips, isLoading: false });
    } catch (error) {
      console.error('Failed to load trips', error);
      set({ isLoading: false });
    }
  },

  getTrip: async (id: string) => {
    const trip = await db.trips.get(id);
    if (trip) {
      set({ activeTrip: trip });
    }
    return trip;
  },

  createTrip: async (tripData) => {
    const newTrip: Trip = {
      ...tripData,
      id: uuidv4(),
      archived: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await db.trips.add(newTrip);
    await get().loadTrips();
    return newTrip.id;
  },

  updateTrip: async (id, updates) => {
    await db.trips.update(id, { ...updates, updatedAt: Date.now() });
    await get().loadTrips();
    const { activeTrip } = get();
    if (activeTrip?.id === id) {
      await get().getTrip(id);
    }
  },

  deleteTrip: async (id) => {
    await db.transaction('rw', db.trips, db.expenses, db.collections, async () => {
      await db.trips.delete(id);
      await db.expenses.where({ tripId: id }).delete();
      await db.collections.where({ tripId: id }).delete();
    });
    await get().loadTrips();
    const { activeTrip } = get();
    if (activeTrip?.id === id) {
      set({ activeTrip: null });
    }
  },

  setArchived: async (id, archived) => {
    await get().updateTrip(id, { archived });
  },

  // Member operations
  addMember: async (tripId, nickname, role) => {
    const trip = await db.trips.get(tripId);
    if (!trip) return;
    const newMember: Member = { id: uuidv4(), nickname, role };
    const members = [...trip.members, newMember];
    await get().updateTrip(tripId, { members });
  },

  updateMember: async (tripId, memberId, updates) => {
    const trip = await db.trips.get(tripId);
    if (!trip) return;
    const members = trip.members.map((m) =>
      m.id === memberId ? { ...m, ...updates } : m
    );
    await get().updateTrip(tripId, { members });
  },

  deleteMember: async (tripId, memberId) => {
    const trip = await db.trips.get(tripId);
    if (!trip) return;
    const members = trip.members.filter((m) => m.id !== memberId);
    await get().updateTrip(tripId, { members });
  },

  checkMemberHasExpenses: async (tripId, memberId) => {
    const expenses = await db.expenses.where({ tripId }).toArray();
    // check if this member is paidBy or in splits
    for (const exp of expenses) {
      if (exp.paidBy === memberId) return true;
      if (exp.splits.some((s) => s.memberId === memberId)) return true;
    }
    const collections = await db.collections.where({ tripId }).toArray();
    for (const coll of collections) {
      if (coll.memberId === memberId) return true;
    }
    return false;
  },
}));
