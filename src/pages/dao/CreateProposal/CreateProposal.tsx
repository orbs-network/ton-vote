import { useAppParams } from "hooks/hooks";
import { useCreateProposalStore } from "./store";
import _ from "lodash";
import { useAppNavigation } from "router/navigation";
import { useCreateProposalQuery } from "query/setters";
import { useNewDataStore } from "store";
import { LayoutSection } from "../components";
import { ProposalForm } from "forms/proposal-form/ProposalForm";
import { ProposalForm as ProposalFormType, ProposalHidePopupVariant } from "types";
import { prepareMetadata } from "forms/proposal-form/utils";
import { useDaoQuery } from "query/getters";


export const CreateProposal = () => {
  const { daoAddress } = useAppParams();

  const { data: dao, isLoading: daoLoading } = useDaoQuery(daoAddress);
  
  const { setFormData, formData } = useCreateProposalStore();
  const appNavigation = useAppNavigation();
  const { mutate: createProposal, isLoading } = useCreateProposalQuery();
  const { addProposal } = useNewDataStore();

  const onSubmit = (formValues: ProposalFormType) => {
    const metadata = prepareMetadata(formValues);
          
    createProposal({
      metadata,
      onSuccess: (proposalAddress: string) => {
        appNavigation.proposalPage.root(dao!.daoAddress, proposalAddress);
        setFormData({} as ProposalFormType);
        addProposal(dao!.daoAddress, proposalAddress);
      },
    });
  };

  return (
    <LayoutSection title="Create proposal" isLoading={daoLoading}>
      <ProposalForm
        submitText="Create"
        initialFormData={formData}
        persistForm={setFormData}
        onSubmit={onSubmit}
        isLoading={isLoading}
        dao={dao!}
      />
    </LayoutSection>
  );
};

export default CreateProposal;
