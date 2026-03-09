import { create } from "zustand";

type StoreItem = {
  id?: string | number;
  [key: string]: unknown;
};

type AppStore = {
  items: StoreItem[];
  addItem: (item: StoreItem) => void;
};

const useStore = create<AppStore>((set) => ({
  items: [],
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
}));

export default useStore;
