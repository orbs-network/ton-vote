import { useDevFeatures } from "hooks";
import { PageProps } from "types";
import { Page } from "./Page";

export function DevPage(props: PageProps) {
  const devFeatures = useDevFeatures();

  if (!devFeatures) {
    return null;
  }
  return <Page {...props}>{props.children}</Page>;
}
