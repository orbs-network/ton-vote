


export enum Steps {
  GETTING_STARTED = 0,
  SELECT_ASSET_TYPE = 1,
  SELECT_VOTERS = 2,
  TRANSFER_ASSETS = 3,
  SUCCESS = 4,
}


export enum VoterSelectionMethod  {
    RANDOM = 1,
    MANUALLY = 2,
    ALL=3
}

export enum AirdropStoreKeys {
  daos = "daos",
  proposals = "proposals",
  votersAmount = "votersAmount",
  jettonsAmount = "jettonsAmount",
  jettonAddress = "jettonAddress",
  nftCollection = "nftCollection",
  assetType = "assetType",
  selectionMethod = "selectionMethod",
  manuallySelectedVoters = "manuallySelectedVoters",
  voters = "voters",
  currentWalletIndex = "currentWalletIndex",
  step = "step",
  NFTItemsRecipients = "NFTItemsRecipients",
}
