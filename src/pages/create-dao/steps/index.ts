import { CreateDaoStep } from "./CreateDaoStep";
import { CreateMetadataStep } from "./CreateMetadataStep";
import { GettingStartedStep } from "./GettingStartedStep";
import { SetRolesStep } from "./SetRolesStep";


export const steps = [
  {
    title: "Getting Started",
    component: GettingStartedStep,
  },
  {
    title: "Create Metadata",
    component: CreateMetadataStep,
  },
  {
    title: "Set Dao Roles",
    component: SetRolesStep,
  },
  {
    title: "Create Dao",
    component: CreateDaoStep,
  },
];



