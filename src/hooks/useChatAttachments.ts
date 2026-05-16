import { useSyncExternalStore } from 'react';
import type { ExplorerApartment } from '@/data/explorer';

type State = {
  attachments: ExplorerApartment[];
  open: boolean;
};

let state: State = { attachments: [], open: false };
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());
const setState = (next: Partial<State>) => {
  state = { ...state, ...next };
  emit();
};

export const chatStore = {
  subscribe(cb: () => void) {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },
  get() {
    return state;
  },
  addApartment(apt: ExplorerApartment) {
    if (state.attachments.some((a) => a.id === apt.id)) {
      setState({ open: true });
      return;
    }
    setState({ attachments: [...state.attachments, apt], open: true });
  },
  removeApartment(id: string) {
    setState({ attachments: state.attachments.filter((a) => a.id !== id) });
  },
  clearAttachments() {
    setState({ attachments: [] });
  },
  setOpen(open: boolean) {
    setState({ open });
  },
};

export const useChatStore = () => useSyncExternalStore(chatStore.subscribe, chatStore.get, chatStore.get);
