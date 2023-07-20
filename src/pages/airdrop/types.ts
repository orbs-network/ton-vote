export interface AirdropForm {
  walletsAmount?: number;
  assetAmount?: number;
  address?: string;
  type?: "nft" | "jetton";
  votersSelectionMethod?: number;
  manualVoters: string[];
}
