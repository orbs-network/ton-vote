import { styled, Typography } from "@mui/material";
import { Button, Menu } from "components";
import { useAppParams, useDevFeatures, useRole } from "hooks/hooks";
import { useDaoQuery } from "query/getters";
import { useMemo } from "react";
import { RxDotsHorizontal } from "react-icons/rx";
import { Link } from "react-router-dom";

const Edit = () => {
  return <Option text="Edit Proposal" path="edit" />;
};
const Airdrop = () => {
  return <Option text="Airdrop" path="airdrop" />;
};

const Option = ({ text, path }: { text: string; path: string }) => {
  return (
    <StyledOption to={path} className="menu-item">
      <Typography>{text}</Typography>
    </StyledOption>
  );
};

const useListItems = () => {
  const { daoAddress } = useAppParams();

  const devFeatures = useDevFeatures();
  const { data: dao } = useDaoQuery(daoAddress);

  const { isOwner, isProposalPublisher } = useRole(dao?.daoRoles);

  return useMemo(() => {
    let options = [<Airdrop />];

    const addEdit = !devFeatures ? false : isOwner || isProposalPublisher;
    if (addEdit) {
      options.push(<Edit />);
    }
    return options;
  }, [devFeatures, isProposalPublisher, isOwner]);
};

function ProposalMenu() {
  const listItems = useListItems();
  return (
    <Menu
      Button={MenuButton}
      listItems={listItems}
    />
  );
}

const StyledOption = styled(Link)({
  textDecoration: "unset",
  height: "100%",
  display: "flex",
  alignItems: "center",
  width: "100%!important",
  p: {
    fontSize: 15,
  },
});

const MenuButton = ({
  onClick,
}: {
  onClick: (e: any) => void;
  open: boolean;
}) => {
  return (
    <StyledMenuButton onClick={onClick}>
      <RxDotsHorizontal />
    </StyledMenuButton>
  );
};

const StyledMenuButton = styled(Button)({
  height: 40,
  width: 40,
  padding: 0,
  svg: {
    width: 23,
    height: 23,
  },
});

export default ProposalMenu;
