import { VariableSizeList } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { Box, styled } from "@mui/material";
import {  StyledFlexRow } from "styles";
import _ from "lodash";

const Row = ({
  index,
  style,
  data: { RowComponent, displayOnly, onSelect, list, selected, disabledItems },
}: any) => {
  const value = list[index];

  const isSelected = selected.includes(value);
  const disabled = disabledItems?.includes(value);

  return (
    <StyledRow
      className="row"
      style={style}
      onClick={!onSelect || disabled ? () => {} : () => onSelect(value)}
    >
      <StyledRowChildren
        disabled={disabled ? 1 : 0}
        displayOnly={displayOnly ? 1 : 0}
        className="row-children"
        selected={isSelected ? 1 : 0}
      >
        <RowComponent index={index} value={value} onSelect={onSelect} />
      </StyledRowChildren>
    </StyledRow>
  );
};

interface Props {
  data?: string[];
  onSelect?: (value: string) => void;
  itemSize: number;
  disabled?: boolean;
  className?: string;
  RowComponent: (props: any) => JSX.Element | null;
  selected?: string[];
  displayOnly?: boolean;
  disabledItems?: string[];
}

function VirtualList(props: Props) {
  return (
    <>
      <div className={`virtual-list ${props.className || ""}`}>
        <AutoSizer>
          {({ height, width }: { height: number; width: number }) => (
            <VariableSizeList
              height={height}
              width={width}
              itemCount={props.data?.length || 0}
              itemData={{
                list: props.data,
                onSelect: props.onSelect,
                RowComponent: props.RowComponent,
                selected: props.selected || [],
                displayOnly: props.displayOnly,
                disabledItems: props.disabledItems || [],
              }}
              itemSize={(index) => props.itemSize}
              estimatedItemSize={10}
              overscanCount={10}
            >
              {Row}
            </VariableSizeList>
          )}
        </AutoSizer>
      </div>
    </>
  );
}

const StyledRowChildren = styled("div")<{
  selected?: number;
  displayOnly?: number;
  disabled: number;
}>(({ selected, displayOnly, theme, disabled }) => {
  const isDarkMode = theme.palette.mode === "dark";

  const border = isDarkMode
    ? "1px solid rgba(255,255,255, 0.2)"
    : "1px solid rgba(224, 224, 224, 1)";

  const selectedBorder = isDarkMode
    ? "1px solid white"
    : "1px solid rgba(0, 152, 234, 1)";
  const hoverBorder = isDarkMode
    ? "1px solid white"
    : "1px solid rgba(0, 152, 234, 0.5)";

  return {
    boxShadow: "unset",
    transition: "0.2s all",
    display: "flex",
    alignItems: "center",
    gap: 10,
    justifyContent: "flex-start",
    height: "calc(100% - 10px)",
    padding: "0px 15px 0px 5px",
    paddingLeft: 15,
    cursor: disabled || displayOnly ? "auto" : "pointer",
    borderRadius: 30,
    border: selected ? selectedBorder : border,
    opacity: disabled ? 0.5 : 1,
    ".MuiSkeleton-root": {
      width: "100%",
      height: "100%",
      borderRadius: 15,
    },
    "&:hover": {
      border: displayOnly ? border : selected ? selectedBorder : hoverBorder,
    },

    ".overflow-with-tooltip": {
      flex: 1,
    },
    p: {
      fontSize: 14,
      textAlign: "left",
    },
  };
});

const StyledRow = styled("div")({});


const StyledEmptyText = styled(StyledFlexRow)({
  padding: "30px 0px",
  p: {
    fontSize: 17,
    fontWeight: 500,
  },
});

const StyledSelectedList = styled(StyledFlexRow)({
  justifyContent: "flex-start",
  gap: 10,
  flexWrap: "wrap",
  "*": {
    fontSize: 13,
  },
});

VirtualList.Row = Row;

export { VirtualList };
