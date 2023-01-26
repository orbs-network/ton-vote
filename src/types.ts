export enum Provider {
  TONKEEPER = "TONKEEPER",
  TONHUB = "TONHUB",
  EXTENSION = "EXTENSION",
}

export interface WalletProvider {
  type: Provider;
  icon: string;
  title: string;
  description: string;
  mobileDisabled?: boolean;
  reminder?: boolean;
}
