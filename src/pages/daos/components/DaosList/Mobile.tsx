import { FixedSizeList } from "react-window";
import React, { CSSProperties } from "react";
import { useDaosQuery } from "query/getters";
import AutoSizer from "react-virtualized-auto-sizer";
import { styled } from "@mui/material";
import { StyledFlexColumn } from "styles";
import { Dao as DaoType } from "types";
import { Dao } from "../Dao";
import _ from "lodash";
import { useFilteredDaos, useIsWebappSelect } from "../../hooks";

const Row = (props: {
  index: number;
  style: CSSProperties;
  data: DaoType[];
}) => {
  const { index, style, data } = props;
  const dao = data[index];
    return (
      <StyledListItem style={style}>
        <Dao dao={dao} onSelect={() => {}} isSelected={false} />
      </StyledListItem>
    );
};

const StyledListItem = styled('div')({
    paddingBottom: 5
})

export const Mobile = () => {
  const filteredDaos = useFilteredDaos();
  const isWebappSelect = useIsWebappSelect();
  return (
    <StyledContainer>
      <AutoSizer style={{ width: "100%", height: "100%" }}>
        {({ height, width }: { width: number; height: number }) => {
          console.log(width, height);

          return (
            <FixedSizeList
              height={height}
              width={width}
              itemCount={_.size(filteredDaos)}
              itemSize={90}
              itemData={filteredDaos}
            >
              {Row}
            </FixedSizeList>
          );
        }}
      </AutoSizer>
    </StyledContainer>
  );
};

const StyledContainer = styled(StyledFlexColumn)({
  flex: 1,
  width: "100%",
});
