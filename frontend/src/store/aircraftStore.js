import { create } from "zustand";

export const useAircraftStore = create((set) => ({
  aircrafts: [],
  setAircraft: (aircrafts) => set({ aircrafts }),

  getAircraft: async () => {
    try {
      const res = await fetch("/api/aircraft");

      if (!res.ok) {
        return { success: false, message: "Failed to fetch aircraft data" };
      }

      const data = await res.json();

      set({ aircrafts: data.data });

      return { success: true, data: data.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
}));
