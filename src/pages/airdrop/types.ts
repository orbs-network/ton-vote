


export enum Steps {
  GETTING_STARTED = 0,
  AIRDROP_TYPE = 1,
  SELECT_DAO = 2,
  SELECT_PROPOSALS = 3,
  SELECT_VOTERS = 4,
  TRANSFER_ASSETS = 5,
  SUCCESS = 6,
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
