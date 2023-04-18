import { useConnection } from "ConnectionProvider";
import { useMemo } from "react";
import { Address } from "ton-core";
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
        tooltip: "Name of the DAO",
      },
      {
        label: "Owner",
        type: "address",
        name: "ownerAddress",
        defaultValue: address,
      },
      {
        label: "Proposal Owner",
        type: "address",
        name: "proposalOwner",
        defaultValue: address,
      },
      {
        label: "Jetton Address",
        type: "address",
        name: "jettonAddress",
      },
      {
        label: "TON DNS",
        type: "text",
        name: "tonDns",
      },
      {
        label: "Description",
        type: "textarea",
        name: "description",
        rows: 5,
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
      {
        label: "Hide Dao",
        type: "checkbox",
        name: "hide",
      },
    ];
  }, [address]);
};

const testAddress = (value?: string) => {
  if(!value) {
    return true
  }
 try {
   return Address.isAddress(Address.parse(value));
 } catch (error) {
   return false;
 }
};

export const FormSchema = Yup.object().shape({
  avatar: Yup.string().url("invalid URL"),
  name: Yup.string().required("Required"),
  github: Yup.string().url("invalid URL").required("Required"),
  website: Yup.string().url("invalid URL").required("Required"),
  twitter: Yup.string().url("invalid URL").required("Required"),
  about: Yup.string().url("invalid URL").required("Required"),
  terms: Yup.string().url("invalid URL").required("Required"),
  // tonDns: Yup.string().required("Required"),
  ownerAddress: Yup.string()
    .test("address", "Invalid address", testAddress)
    .required("Required"),
  proposalOwner: Yup.string()
    .test("address", "Invalid address", testAddress)
    .required("Required"),
  jettonAddress: Yup.string().test("address", "Invalid address", testAddress),
});
