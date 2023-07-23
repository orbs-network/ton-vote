import { styled, Typography } from "@mui/material";
import { Img, OverflowWithTooltip, TitleContainer } from "components";
import { useDaosQuery } from "query/getters";
import { CSSProperties, useCallback, useMemo } from "react";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { useAirdropStore } from "store";
import _ from "lodash";
import { parseLanguage } from "utils";

import SelectPopup from "components/SelectPopup";

interface DaoRowProps {
  value: string;
}
function DaoRowContent({ value }: DaoRowProps) {
  const { data: daos, dataUpdatedAt } = useDaosQuery();

  const dao = useMemo(() => {
    return _.find(daos, { daoAddress: value });
  }, [dataUpdatedAt, value]);

  if (!dao) return null;

  return (
    <StyledDaoRowContent>
      <Img src={dao.daoMetadata.metadataArgs.avatar} />
      <StyledFlexColumn
        style={{ width: "auto", alignItems: "flex-start" }}
        gap={0}
        justifyContent="flex-start"
      >
        <OverflowWithTooltip
          hideTooltip
          text={parseLanguage(dao.daoMetadata.metadataArgs.name)}
          className="title"
        />
        <Typography>
          <small>{`(${_.size(dao.daoProposals)} proposals)`}</small>
        </Typography>
      </StyledFlexColumn>
    </StyledDaoRowContent>
  );
}

export const SelectDaos = () => {
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
                isLoading={!daos}
                key={dao.daoAddress}
                onDelete={() => setDaos([])}
              >
                <Img src={dao.daoMetadata.metadataArgs.avatar} />
                <Typography>{name}</Typography>
              </SelectPopup.SelectedChip>
            );
          })}
        </SelectPopup.List>
      </StyledSection>
    </TitleContainer>
  );
};

const DaosSelect = () => {
  const { data: allDaos, dataUpdatedAt } = useDaosQuery();
  const { daos, setDaos } = useAirdropStore();

  const data = useMemo(() => {
    return allDaos?.map((dao) => dao.daoAddress);
  }, [dataUpdatedAt]);

  const filterFn = useCallback(
    (address: string, search: string) => {
      const dao = _.find(allDaos, { daoAddress: address });
      const name = parseLanguage(
        dao?.daoMetadata.metadataArgs.name
      ).toLowerCase();
      return name.includes(search.toLowerCase()) || address.includes(search);
    },
    [_.size(allDaos)]
  );

  return (
    <SelectPopup
      RowComponent={DaoRowContent}
      buttonText={_.isEmpty(daos) ? "Select dao" : "Change dao"}
      title="Select 1 dao"
      data={data || []}
      selected={daos || []}
      onlyOne={true}
      onSave={setDaos}
      itemSize={70}
      filterFn={filterFn}
    />
  );
};

const StyledDaoRowContent = styled(StyledFlexRow)({
  justifyContent: "flex-start",
  ".title": {
    fontWeight: 600,
  },
  ".img": {
    width: 37,
    height: 37,
    borderRadius: "50%",
  },
  ".overflow-with-tooltip": {
    flex: 1,
  },
});

const StyledSection = styled(StyledFlexColumn)({
  alignItems: "center",
  gap: 30,
  ".title": {
    fontSize: 14,
    fontWeight: 600,
  },
});
