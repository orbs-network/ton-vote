import { styled } from "@mui/material";
import { Container, Markdown } from "components";
import { useDaoAddress } from "hooks";
import { useDaoQuery } from "query/queries";
import React, { useMemo } from "react";
import { parseLanguage } from "utils";

export function DaoDescription() {
  const daoAddress = useDaoAddress();
  const rawAbout = useDaoQuery(daoAddress).data?.daoMetadata.about;

    const about = useMemo(() => parseLanguage(rawAbout, 'en'), [rawAbout]);
  
    if (!about) return null
      return (
        <StyledDescription>
          <Markdown>{about}</Markdown>
        </StyledDescription>
      );
}


const StyledDescription = styled(Container)({
  width: "100%",
  padding: '15px 20px'
});
