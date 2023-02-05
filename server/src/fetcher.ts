import {getClientV2, getClientV4, getProposalInfo, getTransactions, getAllVotes, getVotingPower, getCurrentResults} from "./logic";
import { TonClient, TonClient4 } from "ton";
import {State} from "./state";
import {TxData, VotingPower, Votes, ProposalResults, ProposalInfo} from "./types";


export class Fetcher {

    private client: TonClient | undefined;
    private client4: TonClient4 | undefined;
    private state: State;
    private lastFetchUpdate: Number = Date.now();

    constructor(state: State) {
        this.state = state;
    }

    async init() {
        
        this.client = await getClientV2();
        this.client4 = await getClientV4();

        const proposalInfo = await getProposalInfo(this.client, this.client4);
        this.state.setProposalInfo(proposalInfo);
    }

    async run() {

        const {txData, votingPower, proposalInfo} = this.state.getState();

        let newTxData = await this.getTransactions(txData);
        
        this.lastFetchUpdate = Date.now();

        if (newTxData.toLt == txData.toLt) {
            console.log(`Nothing to fetch`);
            return;
        }

        if (proposalInfo == undefined) throw Error('proposalInfo was not updated');

        let newVotes = this.getAllVotes(proposalInfo, newTxData.tx);
        
        let newVotingPower = await this.getVotingPower(proposalInfo, newTxData.tx, votingPower);
        let newProposalResults = await this.getCurrentResults(proposalInfo, newTxData.tx, newVotingPower);

        this.state.setState(newTxData, newVotingPower, newVotes, newProposalResults);
    }

    getLastFetchUpdate() {
        return this.lastFetchUpdate;
    }

    async getTransactions(txData: TxData) : Promise<{ tx: any; toLt: string; }> {
        let res = await getTransactions(this.client, txData.toLt);
        return {
            tx: [...res.allTxns, ...txData.tx], 
            toLt: res.maxLt
        } ;
    }
   
    getAllVotes(proposalInfo: ProposalInfo, transactions: []): Votes {
        return getAllVotes(transactions, proposalInfo) as Votes;
    }
    
    async getVotingPower(proposalInfo: ProposalInfo, transactions: [], votingPower: VotingPower): Promise<VotingPower> {
        return getVotingPower(this.client4, proposalInfo, transactions, votingPower);
    }
    
    async getCurrentResults(proposalInfo: ProposalInfo, transactions: [], votingPower: VotingPower) : Promise<ProposalResults>{
        return getCurrentResults(transactions, votingPower, proposalInfo)
    }
}