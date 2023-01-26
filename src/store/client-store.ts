import { create } from "zustand";
import { TonClient, TonClient4 } from "ton";


interface Store {
  client?: TonClient;
  setClient: (client: TonClient) => void;
  client4?: TonClient4;
  setClient4: (client4: TonClient4) => void;
}

const defultState = {
  client: undefined,
  client4: undefined,
};

export const useClientStore = create<Store>((set, get) => ({
  reset: () => set(defultState),
  ...defultState,
  setClient4: (client4) => set({ client4 }),
  setClient: (client) => set({ client }),
}));



export const useClient = () => {
  const client = useClientStore((store) => store.client);
  const setClient = useClientStore((store) => store.setClient);

  return {
    client,
    setClient,
  };
};

export const useClient4 = () => {
  const client4 = useClientStore((store) => store.client4);
  const setClient4 = useClientStore((store) => store.setClient4);

  return {
    client4,
    setClient4,
  };
};
