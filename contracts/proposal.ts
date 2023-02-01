import {Address, Cell, Contract, contractAddress, ContractSource, InternalMessage, Message, TonClient, serializeDict} from "ton";
import {sign} from "ton-crypto";
import {compileFuncToB64} from "./helpers";

export type Maybe<T> = T | null | undefined;


export class Proposal implements Contract {

    readonly address: Address;
    readonly source: ContractSource;
    
    constructor(initialCode: Cell, initialData: Cell, workchain = 0) {
        this.source = {initialCode: initialCode, initialData: initialData, workchain: 0} as ContractSource;
        this.address = contractAddress({initialCode: initialCode, initialData: initialData, workchain: workchain});
    }

    static create(start_time: number, end_time: number, snapshot_block: number, inactive_addresses: string []) {
        // Build initial code and data
        let initialCode = this.getCode()[0];
        let initialData = new Cell();
        initialData.bits.writeUint(start_time, 64);
        initialData.bits.writeUint(end_time, 64);
        initialData.bits.writeUint(snapshot_block, 64);
        // for (const addr of inactive_addresses) {
        //     initialData.bits.writeAddress(Address.parse(addr));
        // }
        return new Proposal(initialCode, initialData, -1);
    }

    static getCode(): Cell[] {
        const vote: string = compileFuncToB64(["contracts/imports/stdlib.fc", "contracts/proposal.fc"]);
        return Cell.fromBoc(vote);
    }
}
