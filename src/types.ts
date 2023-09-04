import BigNumber from "bignumber.js";
import { FormikProps } from "formik";
import {
  CSSProperties,
  FC,
  FunctionComponent,
  ReactElement,
  ReactNode,
} from "react";
import { Address, Transaction } from "ton";
import {
  DaoRoles,
  MetadataArgs,
  ProposalMetadata,
  Votes,
  VotingPowerStrategy,
} from "ton-vote-contracts-sdk";

export type ProposalResults = { [key: string]: any };

export interface Vote {
  address: string;
  vote: string | string[];
  votingPower: string;
  timestamp: number;
  hash: string;
}

export type VotingPower = { [key: string]: string };

export type RawVote = { timestamp: number; vote: string; hash: string };
export type RawVotes = { [key: string]: RawVote };

export type EndpointsArgs = {
  clientV2Endpoint?: string;
  clientV4Endpoint?: string;
  apiKey?: string;
};

export interface Dao {
  daoAddress: string;
  daoId?: number;
  daoMetadata: {
    metadataAddress: string;
    metadataArgs: MetadataArgs;
  };
  daoRoles: DaoRoles;
  daoProposals: string[];
}

export enum ProposalStatus {
  CLOSED = "ENDED",
  NOT_STARTED = "NOT_STARTED",
  ACTIVE = "ACTIVE",
}

export interface SelectOption {
  text: ReactNode;
  value: string | number;
  data?: any;
}

interface ProposalMetadataLocal extends ProposalMetadata {
  nftMetadata?: any;
  jettonMetadata?: any;
}

export type ValidatorProposalRoundDetailsStatus = 'ongoing' | 'failed' | 'passed'

export interface ValidatorProposalRoundDetails {
  vsetId: string;
  votersList: string[];
  totalWeight: string;
  weightRemaining: string;
  cycleStartTime: number;
  cycleEndTime: number;
  totalValidators: number;
  mainValidators: number;
  status: ValidatorProposalRoundDetailsStatus;
}



export interface Proposal {
  votingPower?: VotingPower;
  votes: Vote[];
  rawVotes: Votes;
  proposalResult: ProposalResults;
  maxLt?: string;
  transactions?: Transaction[];
  metadata?: ProposalMetadataLocal;
  daoAddress?: string;
  hardcoded?: boolean;
  url?: string;
  sumCoins?: { [key: string]: BigNumber | string };
  sumVotes?: { [key: string]: number };
  validatorsVotingData?: {
    roundsDetails: ValidatorProposalRoundDetails[];
  };
}

export interface Result {
  votesAmount: number;
  choice: string;
  percent: number;
  assetAmount?: string;
}

export type InputType =
  | "text"
  | "url"
  | "textarea"
  | "date"
  | "upload"
  | "editor"
  | "checkbox"
  | "address"
  | "image"
  | "radio"
  | "select"
  | "list"
  | "custom"
  | "number"
  | "display-text";

export interface InputArgs<T> {
  label: string;
  type: InputType;
  name?: string;
  defaultValueClick?: string;
  rows?: number;
  min?: number;
  max?: number;
  tooltip?: string;
  required?: boolean;
  listOptions?: string[];
  limit?: number;
  placeholder?: string;
  isMarkdown?: boolean;
  disabled?: boolean;
  default?: any;
  prefix?: string;
  suffix?: string;
  EndAdornment?: FormikInputEndAdorment<T>;
  text?: string;
  style?: CSSProperties;
  selectOptions?: SelectOption[];
  helperText?: string;
}

export type FormikInputEndAdorment<T> = FunctionComponent<{
  name: string;
  formik: FormikProps<T>;
}>;

export interface Endpoints {
  clientV2Endpoint?: string;
  clientV4Endpoint?: string;
  apiKey?: string;
}

export type TooltipPlacement =
  | "bottom"
  | "left"
  | "right"
  | "top"
  | "bottom-end"
  | "bottom-start"
  | "left-end"
  | "left-start"
  | "right-end"
  | "right-start"
  | "top-end"
  | "top-start";

export interface FormArgs<T> {
  title?: string;
  subTitle?: string;
  inputs: InputArgs<T>[];
  inputsInRow?: number;
  warning?: string;
  bottomText?: string;
}

export interface DaoMetadataForm extends MetadataArgs {
  about_en?: string;
  name_en?: string;
}

export interface DaoRolesForm {
  ownerAddress: string;
  proposalOwner: string;
}

export type ThemeType = "light" | "dark";

export type PageProps = {
  children: ReactNode;
  className?: string;
  back?: string;
  headerComponent?: ReactNode;
  hideBack?: boolean;
  isProtected?: boolean;
  backFunc?: () => void;
  title?: string;
  error?: boolean;
  errorText?: string;
};

export interface ProposalForm {
  proposalStartTime?: number;
  proposalEndTime?: number;
  proposalSnapshotTime?: number;
  votingPowerStrategies: VotingPowerStrategy[];
  votingChoices: string[];
  description_en?: string;
  description_ru?: string;
  title_en?: string;
  votingSystemType: number;
  hide: boolean;
}

export type ProposalInputArgs = InputArgs<ProposalForm>;

export interface StrategyOption<T> {
  name: string;
  args?: InputArgs<T>[];
}

export type ProposalHidePopupVariant =
  | "hide"
  | "changed-to-hide"
  | "changed-to-show"
  | undefined;

export interface StepsMenuStep {
  title?: string;
  editable?: boolean;
  component: FC;
}

export enum AppQueryParams {
  PROPOSAL_STATE = "proposal-state",
  SEARCH = "search",
  DEV = "dev",
  MODE = "mode",
  AIRDROP_PROPOSAL = "airdrop_proposal",
}
