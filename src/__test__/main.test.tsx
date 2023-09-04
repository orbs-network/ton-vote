import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, renderHook, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { lib } from "lib";
import { mockProposal } from "./mock";
import { ThemeProvider } from "@emotion/react";
import { lightTheme } from "theme";
import { api } from "api";
import { contract } from "contract";
import _ from "lodash";

jest.mock("../consts", () => ({
  ENV: {
    DEV: true,
    VITE_STAGING: "1",
  },
}));

const queryClient = new QueryClient({
  logger: undefined,
  defaultOptions: {
    queries: {
      // ✅ turns retries off
      retry: false,
    },
  },
});

const wrapper = ({ children }: any) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>
    </QueryClientProvider>
  );
};
const proposalAddress = "EQBedsSXcLX1sH8yAI_MeqRcyiTBV6vW-YM1My573VIqRWGX";

describe("e2e tests", () => {
  it("get proposal", async () => {
    const proposal = await lib.getProposal(proposalAddress);

    expect(proposal).toBeTruthy();
    expect(_.isEmpty(proposal?.proposalResult)).toBeFalsy();
    expect(_.isEmpty(proposal?.metadata)).toBeFalsy();
  });

  it("get dao", async () => {
    const dao = await lib.getDao(
      "EQAaVBW9FUcZm9Oyb1U883AB8-DAu4wLpBPaXQuNPm5RXsR7"
    );

    expect(dao).toBeTruthy();
    expect(_.isEmpty(dao?.daoMetadata)).toBeFalsy();
    expect(_.isEmpty(dao?.daoRoles)).toBeFalsy();
  });

  it("Compare proposal Results with contract", async () => {
    const proposal = await api.getProposal(proposalAddress);
    const res = await lib.compareProposalResults({
      proposalAddress,
      proposal,
    });
    expect(res).toBe(true);
  });

  it("Api failed, get proposal from contract", async () => {
    api.getProposal = jest.fn(() => Promise.reject("error"));
    contract.getProposal = jest.fn(contract.getProposal);
    await lib.getProposal(proposalAddress);
    expect(contract.getProposal).toBeCalled();
  });

  const walletAddress = "EQDehfd8rzzlqsQlVNPf9_svoBcWJ3eRbz-eqgswjNEKRIwo";

  it("wallet voting power", async () => {
    const proposal = await lib.getProposal(proposalAddress);
    const result = await lib.getWalletVotingPower({
      connectedWallet: walletAddress,
      proposalAddress,
      proposal,
    });

    expect(result).toEqual({ votingPower: "1", votingPowerText: "1 TON" });
  });

  it("get nft holders", async () => {
    const _proposalAddress = "EQBGfnl_h9M56TYHvzNqIGusOlBSqkJjQMBiUXMQkZs8bm3O";
    const proposal = await lib.getProposal(_proposalAddress);
    const result = await lib.getAllNFTHolders(
      _proposalAddress,
      proposal!.metadata!
    );

    expect(result).toHaveProperty(walletAddress);
  });

  it("Read jetton metadata", async () => {
    const proposal = await lib.getProposal(proposalAddress);
  });
});
