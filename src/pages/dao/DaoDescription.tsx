import { styled } from "@mui/material";
import { Container, Markdown } from "components";
import { useDaoAddress } from "hooks";
import { useDaoQuery } from "query/queries";
import React from "react";

export function DaoDescription() {
  const daoAddress = useDaoAddress();
  const about = useDaoQuery(daoAddress).data?.daoMetadata.about;

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
