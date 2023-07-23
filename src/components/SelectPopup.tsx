import { VariableSizeGrid, VariableSizeList } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import {
  CSSProperties,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AppTooltip } from "./Tooltip";
import { Checkbox, styled, Typography } from "@mui/material";
import { Button } from "./Button";
import {
  StyledContainer,
  StyledFlexColumn,
  StyledFlexRow,
  StyledSkeletonLoader,
} from "styles";
import { Popup } from "./Popup";
import _ from "lodash";
import { VscChromeClose } from "react-icons/vsc";
import { TextInput } from "./inputs/Inputs";
import { Search } from "./Search";

interface SelectPopupProps {
  data?: string[];
  title: string;
  selected: string[];
  onlyOne?: boolean;
  onSave?: (selected: string[]) => void;
  itemSize: number;
  disabled?: boolean;
  buttonText: string;
  className?: string;
  RowComponent: (props: any) => JSX.Element | null;
  filterFn?: (value: string, search: string) => boolean;
}

const Row = ({
  index,
  style,
  data: { RowComponent, onSelect, list, selected, displayOnly },
}: any) => {
  const value = list[index];

  const isSelected = selected.includes(value);

  return (
    <StyledRow
      style={style}
      onClick={displayOnly ? () => {} : () => onSelect(value)}
    >
      <StyledRowChildren selected={isSelected ? 1 : 0}>
        {!displayOnly && <Checkbox checked={isSelected} />}
        <RowComponent index={index} value={value} onSelect={onSelect} />
      </StyledRowChildren>
    </StyledRow>
  );
};

function SelectPopup<T>(props: SelectPopupProps) {
  const { filterFn } = props;
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setSelected(props.selected);
  }, [_.size(props.selected), open]);

  const onSelect = useCallback(
    (value: string) => {
      setSelected((prev) => {
        if (prev.includes(value)) {
          return prev.filter((v) => v !== value);
        }

        return props.onlyOne ? [value] : [...prev, value];
      });
    },
    [setSelected, props]
  );

  const onSave = () => {
    props.onSave?.(selected);
    setOpen(false);
  };

  const filteredData = useMemo(() => {
    if (!filterFn) return props.data;
    return _.filter(props.data, (value) => {
      return filterFn(value, search);
    });
  }, [search, _.size(props.data)]);

  return (
    <>
      <StyledSelectButton
        className="select-btn"
        disabled={props.disabled}
        onClick={() => setOpen(true)}
      >
        {props.buttonText}
      </StyledSelectButton>
      <StyledPopup
        className={props.className || ""}
        open={open}
        onClose={() => setOpen(false)}
        title={props.title}
      >
        <StyledPopupContent>
         {filterFn &&  <StyledSearch onChange={setSearch} />}
          <StyledList>
            <AutoSizer>
              {({ height, width }: { height: number; width: number }) => (
                <VariableSizeList
                  height={height}
                  width={width}
                  itemCount={filteredData?.length || 0}
                  itemData={{
                    list: filteredData,
                    selected,
                    onSelect,
                    RowComponent: props.RowComponent,
                    displayOnly: !props.onSave,
                  }}
                  itemSize={(index) => props.itemSize}
                  estimatedItemSize={10}
                  overscanCount={10}
                >
                  {Row}
                </VariableSizeList>
              )}
            </AutoSizer>
          </StyledList>

          {props.onSave && (
            <StyledSaveButton onClick={onSave}>Save</StyledSaveButton>
          )}
        </StyledPopupContent>
      </StyledPopup>
    </>
  );
}

const StyledSearch = styled(Search)({
  width:'100%'
});

const StyledSaveButton = styled(Button)({
  minWidth: 200,
});

const StyledSelectButton = styled(Button)({
  height: "unset",
  padding: "5px 10px",
  "*": {
    fontSize: 14,
  },
});

const StyledList = styled("div")({
  height: "80vh",
  maxHeight: 500,
  width: "100%",
});

const StyledPopupContent = styled(StyledFlexColumn)({});

const StyledPopup = styled(Popup)({
  maxWidth: 600,
  ".title-container-children": {
    display: "flex",
    flexDirection: "column",
  },
});

const StyledSelected = styled(StyledFlexRow)({
  position: "relative",
  justifyContent: "flex-start",
  background: "#606368",
  borderRadius: 20,
  minHeight: 40,
  width: "100%s",
  padding: "10px 40px 10px 15px",
  p: {
    fontSize: 14,
    fontWeight: 500,
  },
  ".img": {
    width: 25,
    height: 25,
    borderRadius: "50%",
  },
});

const StyledSelectedLoading = styled(StyledSkeletonLoader)({
  width: "30%",
  maxWidth: 200,
  borderRadius: 15,
  height: 32,
});

const DeleteButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <StyledDeleteButton onClick={onClick}>
      <AppTooltip text="Delete">
        <VscChromeClose />
      </AppTooltip>
    </StyledDeleteButton>
  );
};

const SelectedChip = ({
  children,
  onDelete,
  isLoading,
}: {
  children: ReactNode;
  onDelete: () => void;
  isLoading?: boolean;
}) => {
  if (isLoading) {
    return <StyledSelectedLoading />;
  }

  return (
    <StyledSelected>
      <DeleteButton onClick={onDelete} />
      {children}
    </StyledSelected>
  );
};

const StyledRowChildren = styled(StyledContainer)<{ selected?: number }>(
  ({ selected }) => {
    return {
      display: "flex",
      alignItems: "center",
      gap: 10,
      justifyContent: "flex-start",
      height: "calc(100% - 10px)",
      padding: "0px 15px 0px 5px",
      cursor: "pointer",
      borderRadius: 10,
      background: !selected ? "transparent" : "rgba(0, 136, 204, 0.08)",
      ".MuiSkeleton-root": {
        width: "100%",
        height: "100%",
        borderRadius: 15,
      },

      ".overflow-with-tooltip": {
        flex: 1,
      },
      p: {
        fontSize: 14,
        textAlign: "left",
      },
    };
  }
);

const StyledRowLoading = styled("div")({
  width: "100%",
  height: "100%",
  padding: "0px 0px 12px 0px",
  overflow: "hidden",
  ".MuiSkeleton-root": {
    width: "100%",
    height: "100%",
  },
});

const StyledRow = styled("div")<{ selected?: number }>({});

const List = ({
  children,
  emptyText,
  isEmpty,
  className = "",
}: {
  children: ReactNode;
  emptyText: string;
  isEmpty: boolean;
  className?: string;
}) => {
  if (isEmpty) {
    return (
      <StyledEmptyText>
        <Typography>{emptyText}</Typography>
      </StyledEmptyText>
    );
  }

  return (
    <StyledSelectedList className={className}>{children}</StyledSelectedList>
  );
};

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

SelectPopup.SelectedChip = SelectedChip;
SelectPopup.Row = Row;
SelectPopup.List = List;

export default SelectPopup;

const StyledDeleteButton = styled("button")({
  position: "absolute",
  cursor: "pointer",
  background: "transparent",
  border: "none",
  right: 5,
  top: 8,
  svg: {
    width: 16,
    height: 16,
  },
});
