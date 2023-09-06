import { styled } from "@mui/material";
import { Container, Markdown } from "components";
import { useAppParams } from "hooks/hooks";
import { useDaoQuery } from "query/getters";
import React, { useMemo } from "react";
import { parseLanguage } from "utils";

export function DaoDescription() {
  const {daoAddress} = useAppParams()
  const rawAbout = useDaoQuery(daoAddress).data?.daoMetadata.metadataArgs.about;

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
});
