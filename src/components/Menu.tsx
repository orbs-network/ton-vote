import { ListItem, Menu as MuiMenu, PopoverOrigin, styled, useTheme } from "@mui/material";
import { FC, ReactNode, useState } from "react";
export function Menu({
  Button,
  listItems,
  className = "",
  anchorOrigin = {
    vertical: "bottom",
    horizontal: "center",
  },
  transformOrigin = {
    vertical: "top",
    horizontal: "center",
  },
}: {
  listItems: JSX.Element[];
  Button: FC<{ onClick: (e: any) => void; open: boolean }>;
  className?: string;
  anchorOrigin?: PopoverOrigin;
  transformOrigin?: PopoverOrigin;
}) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const close = () => setAnchorEl(null);

  const theme = useTheme();
  const open = Boolean(anchorEl);

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button onClick={handleClick} open={open} />
      <MuiMenu
        className={className}
        PaperProps={{
          style: {
            marginTop: 6,
            borderRadius: 10,
            border:
              theme.palette.mode === "light"
                ? "1px solid #e0e0e0"
                : "1px solid rgba(255,255,255, 0.2)",
            boxShadow:
              theme.palette.mode === "light"
                ? "rgb(114 138 150 / 8%) 0px 2px 16px"
                : "unset",
          },
        }}
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={anchorOrigin}
        transformOrigin={transformOrigin}
      >
        {listItems.map((it, index) => {
          return (
            <StyledMenuItem key={index} onClick={close}>
              {it}
            </StyledMenuItem>
          );
        })}
      </MuiMenu>
    </>
  );
}

const StyledMenuItem = styled(ListItem)(({ theme }) => ({
 padding: 0,
  height: 35,
  ".menu-item": {
    padding: '0px 16px',
  },
  "&:hover": {
    background:
      theme.palette.mode === "light"
        ? "rgba(0,0,0, 0.05)"
        : "rgba(255,255,255, 0.05)",
  },
}));
