import { styled } from "@mui/material";
import { Container, Markdown } from "components";
import { useDaoFromQueryParam } from "query/getters";
import React, { useMemo } from "react";
import { parseLanguage } from "utils";

export function DaoDescription() {
  const rawAbout = useDaoFromQueryParam().data?.daoMetadata.metadataArgs.about;

  const about = useMemo(() => parseLanguage(rawAbout, "en"), [rawAbout]);

  if (!about) return null;
  return (
    <StyledDescription>
      <Markdown>{about}</Markdown>
    </StyledDescription>
  );
}

const StyledDescription = styled(Container)({
  width: "100%",
  padding: "30px",
});
