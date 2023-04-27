import { Menu as MuiMenu } from "@mui/material";
export function Menu({
  anchorEl,
  setAnchorEl,
  children,
}: {
  anchorEl: HTMLButtonElement | null;
  setAnchorEl: (value: HTMLButtonElement | null) => void;
  children: React.ReactNode;
}) {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const open = Boolean(anchorEl);

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <MuiMenu
      PaperProps={{
        style: {
          borderRadius: 10,
          border: "1px solid #e0e0e0",
          boxShadow: "rgb(114 138 150 / 8%) 0px 2px 16px",
        },
      }}
      id="basic-menu"
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
    >
      {children}
    </MuiMenu>
  );
}

