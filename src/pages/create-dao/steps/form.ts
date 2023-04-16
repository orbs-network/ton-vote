import { useConnection } from "ConnectionProvider";
import { useMemo } from "react";
import { InputInterface } from "types";
import * as Yup from "yup";

export const useInputs = (): InputInterface[] => {
  const address = useConnection().address;
  return useMemo(() => {
    return [
      {
        label: "Name",
        type: "text",
        name: "name",
      },
      {
        label: "Owner Address",
        type: "text",
        name: "ownerAddress",
        defaultValue: address,
      },
      {
        label: "Proposal Owner Address",
        type: "text",
        name: "proposalOwner",
        defaultValue: address,
      },
      {
        label: "Avatar",
        type: "text",
        name: "avatar",
      },
      {
        label: "Github",
        type: "url",
        name: "github",
      },
      {
        label: "Twitter",
        type: "url",
        name: "twitter",
      },
      {
        label: "Website",
        type: "url",
        name: "website",
      },
      {
        label: "About",
        type: "text",
        name: "about",
      },
      {
        label: "Terms",
        type: "url",
        name: "terms",
      },
    ];
  }, [address]);
};

export const FormSchema = Yup.object().shape({
  avatar: Yup.string().url("invalid URL"),
  name: Yup.string().required("Required"),
  github: Yup.string().url("invalid URL").required("Required"),
  website: Yup.string().url("invalid URL").required("Required"),
  twitter: Yup.string().url("invalid URL").required("Required"),
  about: Yup.string().url("invalid URL").required("Required"),
  terms: Yup.string().url("invalid URL").required("Required"),
  ownerAddress: Yup.string().required("Required"),
  proposalOwner: Yup.string().required("Required"),
});
