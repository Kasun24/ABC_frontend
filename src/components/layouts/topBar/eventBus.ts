import { reactive } from "vue";

type EventPayloads = {
  branchChanged?: { value: number; label: string };
  languageAdded?: string;
  languageChanged?: string;
  branchName?: any;
  currencyChanged?: { currency: string; currencyPosition: string };
  newCartItemsLength?: number;
  onSendToKitchen?: any;
  onTableSelected?: any;
  onCompleteOrder?: any;
};

class EventBus {
  private listeners: {
    [K in keyof EventPayloads]?: Array<(...args: any[]) => void>;
  } = {};

  emit<K extends keyof EventPayloads>(event: K, payload?: EventPayloads[K]) {
    this.listeners[event]?.forEach((listener) => listener(payload));
  }

  on<K extends keyof EventPayloads>(
    event: K,
    listener: (...args: any[]) => void
  ) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]?.push(listener);
  }

  off<K extends keyof EventPayloads>(event: K, payload?: EventPayloads[K]) {
    this.listeners[event]?.forEach((listener) => listener(payload));
  }
}

const eventBus = reactive(new EventBus());
export default eventBus;
