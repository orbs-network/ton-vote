import { VariableSizeList } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { AppTooltip } from "./Tooltip";
import { styled, Typography } from "@mui/material";
import { Button } from "./Button";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { Popup } from "./Popup";
import _ from "lodash";
import { VscChromeClose } from "react-icons/vsc";

interface SelectPopupProps<T> {
  data?: T[];
  title: string;
  Row: (props: any) => JSX.Element | null;
  selected: string[];
  onlyOne?: boolean;
  onSave: (selected: string[]) => void;
  itemSize: number;
  disabled?: boolean;
  selectButtonText: string;
  className?: string;
}

function SelectPopup<T>(props: SelectPopupProps<T>) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    setSelected(props.selected);
  }, [_.size(props.selected), open]);

  const onSelect = useCallback(
    (value: string) => {
      if (props.onlyOne) {
        setSelected([value]);
        return;
      }
      setSelected((prev) => {
        if (prev.includes(value)) {
          return prev.filter((v) => v !== value);
        }
        return [...prev, value];
      });
    },
    [setSelected, props]
  );

  const onSave = () => {
    props.onSave(selected);
    setOpen(false);
  };

  return (
    <>
      <StyledSelectButton
        disabled={props.disabled}
        onClick={() => setOpen(true)}
      >
        {props.selectButtonText}
      </StyledSelectButton>
      <StyledPopup
        className={props.className || ""}
        open={open}
        onClose={() => setOpen(false)}
        title={props.title}
      >
        <StyledPopupContent>
          <StyledList>
            <AutoSizer>
              {({ height, width }: { height: number; width: number }) => (
                <VariableSizeList
                  height={height}
                  width={width}
                  itemCount={props.data?.length || 0}
                  itemData={{ list: props.data, selected, onSelect }}
                  itemSize={(index) => props.itemSize}
                  estimatedItemSize={10}
                  overscanCount={10}
                >
                  {props.Row}
                </VariableSizeList>
              )}
            </AutoSizer>
          </StyledList>
          <AppTooltip
            text={_.isEmpty(selected) ? "Select at leats 1 option" : undefined}
          >
            <StyledSaveButton disabled={_.isEmpty(selected)} onClick={onSave}>
              Save
            </StyledSaveButton>
          </AppTooltip>
        </StyledPopupContent>
      </StyledPopup>
    </>
  );
}

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
  maxWidth: 500,
  ".title-container-children": {
    display: "flex",
    flexDirection: "column",
  },
});

const StyledRowContent = styled(StyledFlexRow)<{ selected: number }>(
  ({ selected }) => ({
    justifyContent: "flex-start",
    height: "calc(100% - 10px)",
    padding: "0px 15px",
    cursor: "pointer",
    borderRadius: 10,
    background: selected === 1 ? "rgba(255,255,255, 0.1)" : "black",
    ".img": {
      width: 30,
      height: 30,
      borderRadius: "50%",
    },
    ".overflow-with-tooltip": {
      flex: 1,
    },
    p: {
      fontSize: 14,
      textAlign: "left",
    },
  })
);

const StyledNotSelected = styled(Typography)({
  fontWeight: 500,
  fontSize: 17,
});

const StyledSelected = styled(StyledFlexRow)({
  position: "relative",
  justifyContent: "flex-start",
  background: "#606368",
  borderRadius: 20,
  minHeight: 35,
  maxWidth: "calc(100% / 3 - 7px)",
  width: "auto",
  padding: "5px 40px 5px 10px",
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
}: {
  children: ReactNode;
  onDelete: () => void;
}) => {
  return (
    <StyledSelected>
      <DeleteButton onClick={onDelete} />
      {children}
    </StyledSelected>
  );
};

const Row = ({
  children,
  selected,
  onClick,
  className = "",
}: {
  children: ReactNode;
  selected: number;
  onClick: () => void;
  className?: string;
}) => {
  return (
    <StyledRowContent
      className={className}
      onClick={onClick}
      selected={selected}
    >
      {children}
    </StyledRowContent>
  );
};

const List = ({
  children,
  emptyText,
  isEmpty,
}: {
  children: ReactNode;
  emptyText: string;
  isEmpty: boolean;
}) => {
  if (isEmpty) {
    return (
      <StyledEmptyText>
        <Typography>{emptyText}</Typography>
      </StyledEmptyText>
    );
  }

  return <StyledSelectedList>{children}</StyledSelectedList>;
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
  padding: 10,
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
