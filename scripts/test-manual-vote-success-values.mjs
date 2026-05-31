import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as esbuild from "esbuild";
import { Address } from "ton";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const require = createRequire(import.meta.url);
const apiBaseUrl = process.env.TON_VOTE_API_URL || "https://api.ton.vote";

const defaultProposalAddresses = [
  "EQAn1suUo4J-6faMy6N5QWGFBkMIrAH7AqSgNz8eLEfGm5NT",
  "EQDWNc4ipRELo2gbQpxmNeSPNZ91eyUOPIAVJxdGWnaEOdYv",
  "EQDtpzGmZJTeZWcBdiD9pg2hSnvwQ_4NDGRRZNeOqG-ZfNlX",
  "EQA4H6EoNwQuKQJjSJLswisdRufwCC9YiReXDBwSjK58wyb4",
];

const proposalAddresses = (
  process.env.TON_VOTE_PROPOSALS?.split(",") || defaultProposalAddresses
)
  .map((address) => address.trim())
  .filter(Boolean);

const casesPerProposal = Number(process.env.TON_VOTE_CASES_PER_PROPOSAL || 3);

const loadAppModules = async () => {
  const tempDir = await mkdtemp(
    path.join(os.tmpdir(), "ton-vote-manual-vote-test-")
  );
  const entry = path.join(tempDir, "entry.ts");
  const outfile = path.join(tempDir, "entry.cjs");

  await writeFile(
    entry,
    [
      `export { getManualVoteSuccessValues, isSameAddress, normalizeTonAddress } from ${JSON.stringify(
        path.join(rootDir, "src/query/manualVoteSuccessValues.ts")
      )};`,
      'export { calcProposalResult } from "ton-vote-contracts-sdk";',
    ].join("\n")
  );

  await esbuild.build({
    entryPoints: [entry],
    outfile,
    bundle: true,
    platform: "node",
    format: "cjs",
    absWorkingDir: rootDir,
    tsconfig: path.join(rootDir, "tsconfig.json"),
    nodePaths: [path.join(rootDir, "node_modules")],
    define: {
      "import.meta.env.DEV": "false",
      "import.meta.env.VITE_STAGING": "false",
    },
    logLevel: "silent",
    treeShaking: true,
  });

  return {
    module: require(outfile),
    cleanup: () => rm(tempDir, { recursive: true, force: true }),
  };
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchJson = async (pathName) => {
  let lastError;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(`${apiBaseUrl}${pathName}`);
      const text = await response.text();

      if (!response.ok) {
        throw new Error(`GET ${pathName} failed with ${response.status}`);
      }

      if (!text.trim()) {
        throw new Error(`GET ${pathName} returned an empty response`);
      }

      return JSON.parse(text);
    } catch (error) {
      lastError = error;
      if (attempt < 3) {
        await delay(250 * attempt);
      }
    }
  }

  throw lastError;
};

const normalizeProposalResult = (result = {}) => {
  const { totalWeight, totalWeights, ...choices } = result;
  const normalized = Object.fromEntries(
    Object.entries(choices).sort(([a], [b]) => a.localeCompare(b))
  );
  const total = totalWeights ?? totalWeight;

  if (total !== undefined) {
    normalized.totalWeights = String(total);
  }

  return normalized;
};

const selectVoters = (rawVotes, votingPower, normalizeTonAddress) => {
  const votersByChoice = new Map();
  const allVoters = [];

  for (const [address, rawVote] of Object.entries(rawVotes || {})) {
    if (!findValueByAddress(votingPower, address, normalizeTonAddress)) {
      continue;
    }

    allVoters.push(address);
    const choice = rawVote.vote?.toLowerCase();
    if (choice && !votersByChoice.has(choice)) {
      votersByChoice.set(choice, address);
    }
  }

  return [...new Set([...votersByChoice.values(), ...allVoters])].slice(
    0,
    casesPerProposal
  );
};

const findValueByAddress = (values, address, normalizeTonAddress) => {
  const normalizedAddress = normalizeTonAddress(address);
  return Object.entries(values || {}).find(
    ([key]) => normalizeTonAddress(key) === normalizedAddress
  )?.[1];
};

const omitAddress = (values, address, normalizeTonAddress) => {
  const normalizedAddress = normalizeTonAddress(address);
  return Object.fromEntries(
    Object.entries(values || {}).filter(
      ([key]) => normalizeTonAddress(key) !== normalizedAddress
    )
  );
};

const normalizeRawVotes = (rawVotes, normalizeTonAddress) =>
  Object.fromEntries(
    Object.entries(rawVotes || {})
      .map(([address, rawVote]) => [
        normalizeTonAddress(address),
        {
          timestamp: rawVote.timestamp,
          vote: rawVote.vote?.toLowerCase(),
        },
      ])
      .sort(([a], [b]) => a.localeCompare(b))
  );

const normalizeVotingPower = (votingPower, normalizeTonAddress) =>
  Object.fromEntries(
    Object.entries(votingPower || {})
      .map(([address, power]) => [normalizeTonAddress(address), String(power)])
      .sort(([a], [b]) => a.localeCompare(b))
  );

const toNonBounceableAddress = (address) => {
  try {
    return Address.parse(address).toString({ bounceable: false });
  } catch {
    return address;
  }
};

const getPreviousLt = (maxLt) => {
  const value = BigInt(maxLt);
  return value > 0n ? (value - 1n).toString() : "0";
};

const testProposal = async (proposalAddress, app) => {
  const proposal = await fetchJson(`/proposal/${proposalAddress}`);
  const maxLt = await fetchJson(`/maxLt/${proposalAddress}`);

  assert.ok(proposal.metadata, `${proposalAddress} has metadata`);
  assert.ok(
    Object.keys(proposal.votes || {}).length,
    `${proposalAddress} has server votes`
  );

  const serverResult = normalizeProposalResult(proposal.proposalResult);
  const recalculatedServerResult = normalizeProposalResult(
    app.calcProposalResult(
      proposal.votes,
      proposal.votingPower,
      proposal.metadata.votingSystem
    )
  );

  if (
    JSON.stringify(serverResult) !== JSON.stringify(recalculatedServerResult)
  ) {
    return {
      checked: 0,
      skipped:
        "server result is a legacy cached shape that does not match current SDK output",
    };
  }

  const voters = selectVoters(
    proposal.votes,
    proposal.votingPower,
    app.normalizeTonAddress
  );

  assert.ok(voters.length, `${proposalAddress} has voters with voting power`);

  for (const voterAddress of voters) {
    const serverRawVote = proposal.votes[voterAddress];
    const serverVotingPower = findValueByAddress(
      proposal.votingPower,
      voterAddress,
      app.normalizeTonAddress
    );

    const beforeProposal = {
      ...proposal,
      maxLt: getPreviousLt(maxLt),
      rawVotes: omitAddress(
        proposal.votes,
        voterAddress,
        app.normalizeTonAddress
      ),
      votingPower: omitAddress(
        proposal.votingPower,
        voterAddress,
        app.normalizeTonAddress
      ),
      votes: [],
    };

    const originalDateNow = Date.now;
    Date.now = () => serverRawVote.timestamp * 1000;

    try {
      const values = app.getManualVoteSuccessValues({
        proposal: beforeProposal,
        proposalAddress,
        walletAddress: toNonBounceableAddress(voterAddress),
        vote: serverRawVote.vote,
        cachedVotingPower: serverVotingPower,
      });

      assert.deepStrictEqual(
        normalizeProposalResult(values.proposalResults),
        serverResult,
        `${proposalAddress} result for ${voterAddress}`
      );
      assert.deepStrictEqual(
        normalizeRawVotes(values.rawVotes, app.normalizeTonAddress),
        normalizeRawVotes(proposal.votes, app.normalizeTonAddress),
        `${proposalAddress} raw votes for ${voterAddress}`
      );
      assert.deepStrictEqual(
        normalizeVotingPower(values.votingPower, app.normalizeTonAddress),
        normalizeVotingPower(proposal.votingPower, app.normalizeTonAddress),
        `${proposalAddress} voting power for ${voterAddress}`
      );
      assert.equal(values.maxLt, maxLt, `${proposalAddress} maxLt`);
      assert.ok(
        app.isSameAddress(values.vote.address, voterAddress),
        `${proposalAddress} parsed vote address`
      );
      assert.equal(
        values.vote.vote,
        serverRawVote.vote.toLowerCase(),
        `${proposalAddress} parsed vote choice`
      );
      assert.equal(
        values.vote.timestamp,
        serverRawVote.timestamp,
        `${proposalAddress} parsed vote timestamp`
      );
    } finally {
      Date.now = originalDateNow;
    }
  }

  return { checked: voters.length };
};

const main = async () => {
  const { module: app, cleanup } = await loadAppModules();

  try {
    let checkedCases = 0;
    let checkedProposals = 0;
    const skipped = [];

    for (const proposalAddress of proposalAddresses) {
      const result = await testProposal(proposalAddress, app);
      checkedCases += result.checked;

      if (result.checked) {
        checkedProposals += 1;
      }

      if (result.skipped) {
        skipped.push(`${proposalAddress}: ${result.skipped}`);
      }
    }

    assert.ok(checkedCases, "at least one live server case was checked");

    console.log(
      `Checked ${checkedCases} manual vote cases across ${checkedProposals} proposals against ${apiBaseUrl}.`
    );

    if (skipped.length) {
      console.log(`Skipped ${skipped.length} proposal(s):`);
      for (const entry of skipped) {
        console.log(`- ${entry}`);
      }
    }
  } finally {
    await cleanup();
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
