import { MenuItem, styled, Typography } from "@mui/material";
import { useCopyToClipboard } from "hooks/hooks";
import { BsReddit, BsTwitter } from "react-icons/bs";
import { FaTelegramPlane } from "react-icons/fa";
import { IoCopyOutline } from "react-icons/io5";
import { RxShare2 } from "react-icons/rx";
import { ReactNode } from "react-markdown/lib/react-markdown";

import {
  RedditShareButton,
  TelegramShareButton,
  TwitterShareButton,
} from "react-share";
import { StyledFlexRow } from "styles";
import { Button } from "./Button";
import { Menu } from "./Menu";

const CopyBtn = ({ url, children }: { url: string; children: ReactNode }) => {
  const [_, copy] = useCopyToClipboard();

  return (
    <ListItem onClick={() => copy(url)}>
      <StyledFlexRow justifyContent='flex-start' gap={6} style={{padding:'0px 16px'}}>{children}</StyledFlexRow>
    </ListItem>
  );
};

const items = [
  {
    button: RedditShareButton,
    icon: BsReddit,
    text: "Reddit",
  },
  {
    button: TelegramShareButton,
    icon: FaTelegramPlane,
    text: "Telegram",
  },
  {
    button: TwitterShareButton,
    icon: BsTwitter,
    text: "Twitter",
  },
  {
    button: CopyBtn,
    icon: IoCopyOutline,
    text: "Copy Link",
  },
];

const ListItem = ({ children, onClick }: { children: ReactNode; onClick?: () => void }) => {
  return (
    <StyledListItem onClick={onClick}>
      {children}
    </StyledListItem>
  );
};

const StyledListItem = styled(StyledFlexRow)({
  height: "100%",
  cursor: "pointer",
  justifyContent: "flex-start!important",
  button:{
    width:'100%',
    height:'100%',
    display:'flex',
    alignItems:'center',
    justifyContent:'flex-start',
    padding:'0px 16px!important',
    gap: 10,
    minWidth: 140,
  }
});

export function ShareButton({
  url,
  className = " ",
}: {
  url: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <StyledMenu
        listItems={items.map((it, index) => {
          return (
            <ListItem key={index}>
              <it.button url={url}>
                <it.icon />
                <Typography>{it.text}</Typography>
              </it.button>
            </ListItem>
          );
        })}
        Button={MenuButton}
      />
    </div>
  );
}

const StyledMenu = styled(Menu)({
  ".MuiListItem-root": {
    svg: {
      width: 16,
      height: 16,
    },
    p: {
      fontSize: 14,
      fontWeight: 600,
    },
  },
});

const MenuButton = ({
  onClick,
  open,
}: {
  onClick: (e: any) => void;
  open: boolean;
}) => {
  return (
    <StyledShareButton onClick={onClick} variant="text">
      <StyledFlexRow gap={6}>
        <RxShare2 />
        <Typography>Share</Typography>
      </StyledFlexRow>
    </StyledShareButton>
  );
};

const StyledShareButton = styled(Button)({
  height: "unset",
  p: {
    fontSize: 14,
    fontWeight: 600,
  },
  svg: {
    width: 16,
    height: 16,
  },
});

