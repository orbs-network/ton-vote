import { styled, Typography } from "@mui/material";
import {
  AppTooltip,
  Button,
  Img,
  OverflowWithTooltip,
  Search,
  SelectedChip,
} from "components";
import { useDaosQuery } from "query/getters";
import { useMemo, useState } from "react";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import _ from "lodash";
import { parseLanguage } from "utils";
import { VirtualList } from "components";
import {
  StyledListTitleContainer,
  StyledSelectedList,
  StyledSelectPopup,
} from "../../styles";
import { useAirdropTranslations } from "i18n/hooks/useAirdropTranslations";
import { useVotersSelectStore } from "pages/airdrop/store";
import { useDisabledDaos, useFilteredDaos } from "./hooks";

interface DaoRowProps {
  value: string;
}
function DaoRowContent({ value }: DaoRowProps) {
  const { data: daos, dataUpdatedAt } = useDaosQuery();
  const t = useAirdropTranslations();
  const dao = useMemo(() => {
    return _.find(daos, { daoAddress: value });
  }, [dataUpdatedAt, value]);

  if (!dao) return null;

  return (
    <AppTooltip
      placement="right"
      text={_.isEmpty(dao.daoProposals) ? t.disabledSpace : undefined}
    >
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
        </StyledFlexColumn>
      </StyledDaoRowContent>
    </AppTooltip>
  );
}

export const SelectDao = () => {
  const [filterValue, setFilterValue] = useState("");
  const [open, setOpen] = useState(false);
  const filteredDaos = useFilteredDaos(filterValue);
  const votersSelectStore = useVotersSelectStore();
  const disabledDaos = useDisabledDaos();

  return (
    <StyledListTitleContainer
      title="Select a DAO space"
      headerComponent={
        <Button variant="text" onClick={() => setOpen(true)}>
          Select
        </Button>
      }
    >
      {_.isEmpty(votersSelectStore.daos) ? (
        <StyledFlexColumn className="not-selected">
          <Typography>Dao space not selected</Typography>
        </StyledFlexColumn>
      ) : (
        <StyledFlexColumn>
          <StyledSelectedList>
            {votersSelectStore.daos?.map((dao) => {
              return <SelectedDao address={dao} key={dao} />;
            })}
          </StyledSelectedList>
        </StyledFlexColumn>
      )}

      <StyledSelectPopup
        title="Select a DAO space"
        open={open}
        onClose={() => setOpen(false)}
      >
        <>
          <Search onChange={setFilterValue} />
          <StyledList
            RowComponent={DaoRowContent}
            data={filteredDaos || []}
            itemSize={56}
            selected={votersSelectStore.daos}
            disabledItems={disabledDaos}
            onSelect={(dao) => {
              votersSelectStore.setDao(dao);
              setOpen(false);
            }}
          />
          <Button onClick={() => setOpen(false)}>Close</Button>
        </>
      </StyledSelectPopup>
    </StyledListTitleContainer>
  );
};

const SelectedDao = ({ address }: { address: string }) => {
  const { data, dataUpdatedAt } = useDaosQuery();
  const { setDao } = useVotersSelectStore();

  const dao = useMemo(() => {
    return _.find(data, { daoAddress: address });
  }, [dataUpdatedAt, address]);

  if (!dao) return null;
  return (
    <StyledSelectedDao onDelete={() => setDao(address)}>
      <StyledFlexRow gap={10}>
        <Img src={dao.daoMetadata.metadataArgs.avatar} />
        <Typography className="name">
          {parseLanguage(dao.daoMetadata.metadataArgs.name)}
        </Typography>
      </StyledFlexRow>
    </StyledSelectedDao>
  );
};

const StyledSelectedDao = styled(SelectedChip)({
  width: "auto!important",
  ".img": {
    width: 30,
    height: 30,
    borderRadius: "50%",
  },
  ".name": {
    fontWeight: 600,
    fontSize: 13,
  },
});

const StyledList = styled(VirtualList)({
  flex: 1,
  ".row-children": {
    paddingLeft: 10,
  },
});

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
