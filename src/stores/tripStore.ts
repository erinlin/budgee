import { create } from 'zustand';
import { db } from '../db';
import type { Trip } from '../types';
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
    // Note: To truly delete a trip, we also need to delete its expenses and collections
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
}));
