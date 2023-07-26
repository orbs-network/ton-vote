import { styled } from "@mui/material";
import {
  Button,
  Container,
  Img,
  OverflowWithTooltip,
  Search,
} from "components";
import { useDaosQuery } from "query/getters";
import { useCallback, useMemo, useState } from "react";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { useAirdropStore } from "../store";
import _ from "lodash";
import { parseLanguage } from "utils";

import { VirtualList } from "components";
import { SubmitButtonContainer } from "./SubmitButton";
import {
  StyledAirdropSearch,
  StyledAirdropTitleContainer,
} from "../Components";
import { Dao } from "types";
import { StyledAirdropList } from "../styles";
import { errorToast } from "toasts";

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
      </StyledFlexColumn>
    </StyledDaoRowContent>
  );
}

export const SelectDao = () => {
  const { data: allDaos, dataUpdatedAt } = useDaosQuery();
  const { daos, setDao, nextStep } = useAirdropStore();
  const [filterValue, setFilterValue] = useState("");

  const filteredDaos = useMemo(() => {
    let result = allDaos;
    if (filterValue) {
      result = _.filter(allDaos, (dao) => {
        const name = parseLanguage(
          dao.daoMetadata.metadataArgs.name
        ).toLowerCase();
        return (
          name.includes(filterValue.toLowerCase()) ||
          dao.daoAddress.includes(filterValue)
        );
      }) as Dao[];
    }
    return _.map(result, (it) => it.daoAddress);
  }, [dataUpdatedAt, filterValue]);

    const onNextClick = () => {
      if (_.isEmpty(daos)) {
        errorToast("Please select a DAO space");
      } else {
        nextStep();
      }
    };

    

  return (
    <StyledFlexColumn alignItems="flex-start">
      <StyledAirdropTitleContainer
        subtitle="Some text"
        title="Select a DAO space"
        headerComponent={<StyledAirdropSearch onChange={setFilterValue} />}
      >
        <StyledList
          RowComponent={DaoRowContent}
          data={filteredDaos || []}
          itemSize={56}
          selected={daos}
          onSelect={setDao}
        />
        <SubmitButtonContainer>
          <Button onClick={onNextClick}>Next</Button>
        </SubmitButtonContainer>
      </StyledAirdropTitleContainer>
    </StyledFlexColumn>
  );
};

const StyledList = styled(VirtualList)({
  height: 400,
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

const StyledSection = styled(StyledFlexColumn)({
  alignItems: "center",
  gap: 30,
  ".title": {
    fontSize: 14,
    fontWeight: 600,
  },
});
