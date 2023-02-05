export interface TxData {
    tx: [], 
    toLt: undefined | string
};

export interface VotingPower {
    [voter: string]: string
}

export interface Votes {
    [voter: string]: string
}

export interface ProposalResults {
    yes: Number,
    no: Number,
    abstain: Number,
    totalWeight: String,
}

export interface ProposalInfo {
    startDate: Number,
    endDate: Number,
    snapshot: {
        snapshotTime: Number, 
        mcSnapshotBlock: Number
    }
}
