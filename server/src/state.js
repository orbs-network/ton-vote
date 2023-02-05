"use strict";
exports.__esModule = true;
exports.State = void 0;
var State = /** @class */ (function () {
    function State() {
        this.txData = { tx: [], toLt: undefined };
        this.votingPower = {};
        this.votes = {};
    }
    State.prototype.getState = function () {
        return {
            txData: this.txData,
            votingPower: this.votingPower,
            votes: this.votes,
            proposalResults: this.proposalResults,
            proposalInfo: this.proposalInfo
        };
    };
    State.prototype.setStates = function (txData, votingPower, votes, proposalResults) {
        this.txData = txData;
        this.votingPower = votingPower;
        this.votes = votes;
        this.proposalResults = proposalResults;
    };
    State.prototype.setProposalInfo = function (proposalInfo) {
        this.proposalInfo = proposalInfo;
    };
    return State;
}());
exports.State = State;
