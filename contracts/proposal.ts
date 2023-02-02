import {Address, Cell, Contract, contractAddress, ContractSource} from "ton";
import {compileFuncToB64} from "./helpers";


export class Proposal implements Contract {

    readonly address: Address;
    readonly source: ContractSource;
    
    constructor(initialCode: Cell, initialData: Cell, workchain = 0) {
        this.source = {initialCode: initialCode, initialData: initialData, workchain: 0} as ContractSource;
        this.address = contractAddress({initialCode: initialCode, initialData: initialData, workchain: workchain});
    }

    static create(start_time: number, end_time: number, snapshot_time: number, inactive_addresses: string [], workchain = 0) {
        console.log(start_time, end_time, snapshot_time);
        
        // Build initial code and data
        let initialCode = this.getCode()[0];
        let initialData = new Cell();
        initialData.bits.writeUint(start_time, 64);
        initialData.bits.writeUint(end_time, 64);
        initialData.bits.writeUint(snapshot_time, 64);
        // for (const addr of inactive_addresses) {
        //     initialData.bits.writeAddress(Address.parse(addr));
        // }
        return new Proposal(initialCode, initialData, workchain);
    }

    static getCode(): Cell[] {
        const vote: string = compileFuncToB64(["imports/stdlib.fc", "proposal.fc"]);
        return Cell.fromBoc(vote);
    }
}
