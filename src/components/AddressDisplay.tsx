import { styled, Typography, useTheme } from "@mui/material";
import { useCopyToClipboard } from "hooks";
import React, { ReactNode } from "react";
import { StyledFlexRow } from "styles";
import { IoCopyOutline } from "react-icons/io5";
import { getTonScanContractUrl, makeElipsisAddress } from "utils";

export function AddressDisplay({
  text,
  address,
  className = "",
  padding = 7,
}: {
  text?: string;
  address?: string;
  className?: string;
  padding?: number;
}) {
  const [_, copy] = useCopyToClipboard();
  const theme = useTheme();

  const onCopy = (e: any) => {
    e.stopPropagation();
    copy(text || "");
  };

  const onLinkClick = (e: any) => {
    e.stopPropagation();
    window.open(getTonScanContractUrl(address || ""), "_blank");
  };

  return (
    <StyledFlexRow className={className} justifyContent="flex-start">
      <StyledButton onClick={onLinkClick} className="address">
        <Typography>{makeElipsisAddress(address, padding)}</Typography>
      </StyledButton>
      <StyledButton>
        <IoCopyOutline
          style={{ color: theme.palette.text.primary }}
          onClick={onCopy}
        />
      </StyledButton>
    </StyledFlexRow>
  );
}

const StyledLink = styled("a")({});

const StyledButton = styled("button")(({ theme }) => ({
  padding: 0,
  background: "none",
  border: "none",
  cursor: "pointer",
  svg: {
    width: 18,
    height: 18,
  },
}));
