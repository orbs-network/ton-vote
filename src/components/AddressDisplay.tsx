import { styled, Typography, useTheme } from "@mui/material";
import { useCopyToClipboard } from "hooks";
import { StyledFlexRow } from "styles";
import { IoCopyOutline } from "react-icons/io5";
import { getTonScanContractUrl, makeElipsisAddress } from "utils";
import TextOverflow from "react-text-overflow";

export function AddressDisplay({
  displayText,
  address,
  className = "",
  padding = 7,
}: {
  displayText?: string;
  address?: string;
  className?: string;
  padding?: number;
}) {
  const [_, copy] = useCopyToClipboard();
  const theme = useTheme();

  const onCopy = (e: any) => {
    e.stopPropagation();
    copy(address || "");
  };

  const onLinkClick = (e: any) => {
    e.stopPropagation();
    window.open(getTonScanContractUrl(address || ""), "_blank");
  };

  return (
    <StyledContainer className={className} justifyContent="flex-start">
      <StyledButton onClick={onLinkClick} className="address-display-btn">
        <Typography>
          <TextOverflow
            text={displayText || makeElipsisAddress(address, padding)}
          />

        </Typography>
      </StyledButton>
      <StyledButton onClick={onCopy}>
        <IoCopyOutline style={{ color: theme.palette.text.primary }} />
      </StyledButton>
    </StyledContainer>
  );
}

const StyledContainer = styled(StyledFlexRow)(({ theme }) => ({
  width: "auto",
  ".address-display-btn": {
    "&:hover": {
      textDecoration: "underline",
      textDecorationColor: theme.palette.text.primary,
    },
  },
}));

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
