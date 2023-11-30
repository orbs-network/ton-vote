import { Box, styled, Typography } from "@mui/material";
import {
  AddressDisplay,
  Button,
  Img,
  Link,
  Markdown,
  TitleContainer,
} from "components";
import { StyledFlexColumn } from "styles";
import { useCreatDaoStore } from "../store";
import { Submit } from "./Submit";
import { MetadataArgs } from "ton-vote-contracts-sdk";
import { DaoRolesForm, InputArgs } from "types";
import _ from "lodash";
import { useCreateDaoTranslations } from "i18n/hooks/useCreateDaoTranslations";
import { useCommonTranslations } from "i18n/hooks/useCommonTranslations";
import { useDaoMetadataForm, useDaoRolesForm } from "../form";
import { useCreateDaoQuery } from "query/setters";
import { useRegistryStateQuery } from "query/getters";
import { isZeroAddress } from "utils";
import { getBorderColor } from "theme";
import { CheckboxInput } from "components";
import { Webapp, WebappButton } from "WebApp";

const useCreateDao = () => {
  const { rolesForm, metadataAddress, reset, createOnDev } = useCreatDaoStore();

  const { mutate, isLoading } = useCreateDaoQuery();

  const createDao = () => {
    mutate({
      metadataAddress: metadataAddress!,
      ownerAddress: rolesForm.ownerAddress,
      proposalOwner: rolesForm.proposalOwner,
      dev: createOnDev,
      onSuccess: reset,
    });
  };

  return {
    createDao,
    isLoading,
  };
};

export function CreateDaoStep() {
  const translations = useCreateDaoTranslations();
  const commonTranslations = useCommonTranslations();
  const { daoMetadataForm, rolesForm, createOnDev, setCreateOnDev } =
    useCreatDaoStore();
  const registryState = useRegistryStateQuery().data;
  const { createDao, isLoading } = useCreateDao();

  const metadata = useDaoMetadataForm();
  const roles = useDaoRolesForm();

  const _isLoading =
    isLoading || registryState?.deployAndInitDaoFee === undefined;

  return (
    <TitleContainer title={translations.createSpace}>
      <StyledFlexColumn>
        <StyledInputs>
          <>
            {roles.map((section) => {
              return section.inputs.map((input) => {
                const name = input.name as keyof DaoRolesForm;

                return (
                  <InputPreview
                    key={input.name}
                    input={input}
                    value={rolesForm[name]}
                  />
                );
              });
            })}
            {metadata.map((section) => {
              return section.inputs.map((input) => {
                const name = input.name as keyof MetadataArgs;

                return (
                  <InputPreview
                    key={input.name}
                    input={input}
                    value={daoMetadataForm[name]}
                  />
                );
              });
            })}
          </>
        </StyledInputs>
        <StyledCheckboxInput
          title="Create DAO space also on dev.ton.vote. [Read mode](https://github.com/orbs-network/ton-vote/blob/main/README.md)"
          value={createOnDev}
          onChange={(value) => setCreateOnDev(value)}
        />
        <Submit
          text={commonTranslations.create}
          onClick={createDao}
          isLoading={_isLoading}
        />
      </StyledFlexColumn>
    </TitleContainer>
  );
}

const StyledCheckboxInput = styled(CheckboxInput)({
  marginTop: 10,
});

const StyledInputs = styled(StyledFlexColumn)({
  gap: 20,
});

const InputPreview = ({
  input,
  value,
}: {
  input: InputArgs<any>;
  value: any;
}) => {
  const getValue = () => {
    if (input.name === "dev") return;
    if (input.type === "address" && isZeroAddress(value)) {
      return null;
    }
    if (input.type === "checkbox") {
      return <Typography>{value ? "Yes" : "No"}</Typography>;
    }
    if (!value) return null;
    if (input.type === "url") {
      return <StyledLink href={value}>{value}</StyledLink>;
    }
    if (input.type === "image") {
      return <StyledImage src={value} />;
    }
    if (input.type === "address") {
      return <AddressDisplay padding={10} address={value} />;
    }

    if (input.type === "textarea") {
      return <StyledMd>{value}</StyledMd>;
    }
    return <Typography>{value}</Typography>;
  };

  const component = getValue();
  if (!component) return null;
  return (
    <StyledInputPreview>
      <Markdown className="label">{input.label}</Markdown>
      <StyledInputPreviewComponent>{component}</StyledInputPreviewComponent>
    </StyledInputPreview>
  );
};

const StyledInputPreviewComponent = styled(Box)(({ theme }) => ({
  borderRadius: 10,
  border: `1px solid ${getBorderColor(theme.palette.mode)}`,
  width: "100%",
  padding: 10,
}));

const StyledImage = styled(Img)({
  width: 45,
  height: 45,
  borderRadius: "50%",
  overflow: "hidden",
});

const StyledLink = styled(Link)({
  width: "auto",
});

const StyledMd = styled(Markdown)({
  width: "100%",
});

const StyledInputPreview = styled(StyledFlexColumn)(({ theme }) => ({
  flexWrap: "wrap",
  alignItems: "flex-start",
  justifyContent: "flex-start",
  gap: 5,
  fontSize: 16,
  color: theme.palette.text.primary,
  ".label": {
    fontSize: 14,
    fontWeight: 600,
  },
}));
