import { styled, Typography } from "@mui/material";
import {
  AppTooltip,
  Button,
  Img,
  OverflowWithTooltip,
  TitleContainer,
} from "components";
import { useDaosQuery, useProposalQuery } from "query/getters";
import { CSSProperties, useMemo } from "react";
import { StyledFlexColumn, StyledFlexRow, StyledSkeletonLoader } from "styles";
import { Dao } from "types";
import { useAirdropStore } from "store";
import _ from "lodash";
import { parseLanguage } from "utils";
import { SubmitButtonContainer } from "./SubmitButton";
import { errorToast } from "toasts";
import SelectPopup from "components/SelectPopup";

function SelectVoters() {
  return (
    <TitleContainer title="Select voters">
      <StyledFlexColumn gap={30}>
        <Daos />
        <Proposals />
        <Submit />
      </StyledFlexColumn>
    </TitleContainer>
  );
}

const Submit = () => {
  const { proposals, nextStep } = useAirdropStore();

  const onSubmit = () => {
    if (_.isEmpty(proposals)) {
      errorToast("Select at least one proposal");
    } else {
      nextStep();
    }
  };

  return (
    <SubmitButtonContainer>
      <Button onClick={onSubmit}>Next</Button>
    </SubmitButtonContainer>
  );
};

interface DaoRowProps {
  index: number;
  style: CSSProperties;
  data: {
    list: Dao[];
    selected: string[];
    onSelect: (address: string) => void;
  };
}
function DaoRow(props: DaoRowProps) {
  const dao = props.data.list ? props.data.list[props.index] : undefined;

  if (!dao) return null;

  const name = parseLanguage(dao.daoMetadata.metadataArgs.name);
  return (
    <div style={props.style}>
      <StyledDaoRow
        selected={props.data.selected.includes(dao?.daoAddress || "") ? 1 : 0}
        onClick={() => props.data.onSelect(dao.daoAddress)}
      >
        <Img src={dao.daoMetadata.metadataArgs.avatar} />
        <StyledFlexRow style={{ width: "auto" }} justifyContent="flex-start">
          <OverflowWithTooltip hideTooltip text={name} className="address" />
          <Typography>
            <small>{`(${_.size(dao.daoProposals)} proposals)`}</small>
          </Typography>
        </StyledFlexRow>
      </StyledDaoRow>
    </div>
  );
}

const Daos = () => {
  const { daos, setDaos } = useAirdropStore();
  const { data, dataUpdatedAt } = useDaosQuery();

  const selectedDaos = useMemo(() => {
    if (!daos) return undefined;
    return _.filter(data, (dao) => daos.includes(dao.daoAddress));
  }, [dataUpdatedAt, daos]);

  return (
    <TitleContainer title="Selected dao" headerComponent={<DaosSelect />}>
      <StyledSection>
        <SelectPopup.List
          emptyText="Dao not selected"
          isEmpty={_.isEmpty(daos)}
        >
          {selectedDaos?.map((dao) => {
            const name = parseLanguage(dao.daoMetadata.metadataArgs.name);

            return (
              <SelectPopup.SelectedChip
                key={dao.daoAddress}
                onDelete={() => setDaos([])}
              >
                <Img src={dao.daoMetadata.metadataArgs.avatar} />
                <OverflowWithTooltip text={name} className="title" />
              </SelectPopup.SelectedChip>
            );
          })}
        </SelectPopup.List>
      </StyledSection>
    </TitleContainer>
  );
};

const Proposals = () => {
  const { proposals } = useAirdropStore();

  return (
    <TitleContainer
      title="Selected proposals"
      headerComponent={<ProposalsSelect />}
    >
      <StyledSection>
        <SelectPopup.List
          emptyText="Proposals not selected"
          isEmpty={_.isEmpty(proposals)}
        >
          {proposals?.map((proposalAddress) => {
            return <Proposal key={proposalAddress} address={proposalAddress} />;
          })}
        </SelectPopup.List>
      </StyledSection>
    </TitleContainer>
  );
};

const Proposal = ({ address }: { address: string }) => {
  const { data, isLoading } = useProposalQuery(address);
  const { deleteProposal } = useAirdropStore();

  if (isLoading) {
    return (
      <StyledSkeletonLoader
        style={{ width: 200, height: 40, borderRadius: 30 }}
      />
    );
  }
  return (
    <SelectPopup.SelectedChip onDelete={() => deleteProposal(address)}>
      <OverflowWithTooltip
        className="title"
        text={parseLanguage(data?.metadata?.title)}
      />
    </SelectPopup.SelectedChip>
  );
};

const DaosSelect = () => {
  const { data } = useDaosQuery();
  const { daos, setDaos } = useAirdropStore();

  return (
    <SelectPopup<Dao>
      Row={DaoRow}
      selectButtonText={_.isEmpty(daos) ? "Select dao" : "Change dao"}
      title="Select daos"
      data={data}
      selected={daos || []}
      onlyOne={true}
      onSave={setDaos}
      itemSize={50}
    />
  );
};

interface ProposalRowProps {
  index: number;
  style: CSSProperties;
  data: {
    list: string[];
    selected: string[];
    onSelect: (address: string) => void;
  };
}

function ProposalRow(props: ProposalRowProps) {
  const list = props.data?.list;

  const proposalAddress = list ? list[props.index] : undefined;

  const { data: proposal, isLoading } = useProposalQuery(proposalAddress);

  if (isLoading || !proposal) {
    return (
      <div style={props.style}>
        <StyledRowLoader />
      </div>
    );
  }

  const title = parseLanguage(proposal?.metadata?.title);
  return (
    <div style={props.style}>
      <SelectPopup.Row
        selected={props.data.selected.includes(proposalAddress!) ? 1 : 0}
        onClick={() => props.data.onSelect(proposalAddress!)}
      >
        <StyledFlexColumn alignItems="flex-start">
          <StyledFlexRow style={{ width: "auto" }}>
            <OverflowWithTooltip text={title} />
            <Typography>
              <small>{`(${_.size(proposal.rawVotes)} voters)`}</small>
            </Typography>
          </StyledFlexRow>
          <OverflowWithTooltip
            hideTooltip
            text={`Address: ${proposalAddress}`}
          />
        </StyledFlexColumn>
      </SelectPopup.Row>
    </div>
  );
}

const ProposalsSelect = () => {
  const { dataUpdatedAt, data } = useDaosQuery();
  const { daos, proposals, setProposals } = useAirdropStore();

  const daoAddress = daos?.[0];

  const dao = useMemo(() => {
    return _.find(data, { daoAddress });
  }, [dataUpdatedAt, daoAddress]);

  return (
    <AppTooltip text={_.isEmpty(daos) ? "Select dao first" : undefined}>
      <SelectPopup<string>
        disabled={_.isEmpty(daos)}
        Row={ProposalRow}
        title="Select Proposals"
        data={dao?.daoProposals || []}
        selected={proposals || []}
        onSave={setProposals}
        itemSize={90}
        selectButtonText="Select Proposals"
      />
    </AppTooltip>
  );
};

export default SelectVoters;

const StyledDaoRow = styled(SelectPopup.Row)({
  ".img": {
    width: 30,
    height: 30,
    borderRadius: "50%",
  },
  ".overflow-with-tooltip": {
    flex: 1,
  },
});

const StyledRowLoader = styled(StyledSkeletonLoader)({
  width: "100%",
  height: "100%",
  borderRadius: 15,
});

const StyledSection = styled(StyledFlexColumn)({
  alignItems: "center",
  gap: 30,
  ".title": {
    fontSize: 14,
    fontWeight: 600,
  },
});

const StyledSectionList = styled(StyledFlexRow)({
  justifyContent: "flex-start",
  gap: 10,
  flexWrap: "wrap",
});
