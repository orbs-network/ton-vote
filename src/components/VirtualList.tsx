import { VariableSizeList } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { Box, styled } from "@mui/material";
import { StyledFlexRow } from "styles";
import _ from "lodash";
import { CSSProperties, ReactNode } from "react";

export interface VirtualListRowProps {
  index: number;
  style: CSSProperties;
  data: {
    RowComponent: (props: any) => JSX.Element | null;
    displayOnly?: boolean;
    onSelect?: (value: string) => void;
    list: string[];
    selected: string[];
    disabledItems?: string[];
  };
}

const ListItem = (props: VirtualListRowProps) => {
  return (
    <StyledRow className="row" style={props.style}>
      <props.data.RowComponent {...props} />
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
                list: props.data || [],
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
              {ListItem}
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
      border: displayOnly || disabled ? border : selected ? selectedBorder : hoverBorder,
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

const RowContent = ({
  disabled,
  isSelected,
  displayOnly,
  children,
  onClick,
}: {
  disabled?: boolean;
  isSelected?: boolean;
  displayOnly?: boolean;
  children: ReactNode;
  onClick?: () => void;
}) => {
  return (
    <StyledRowChildren
      onClick={!disabled ? onClick : undefined}
      disabled={disabled ? 1 : 0}
      displayOnly={displayOnly ? 1 : 0}
      className="row-children"
      selected={isSelected ? 1 : 0}
    >
      {children}
    </StyledRowChildren>
  );
};

VirtualList.RowContent = RowContent;

export { VirtualList };
