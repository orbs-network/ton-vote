import { Webapp } from "WebApp";
import { useShowComponents } from "../hooks";
import { VoteContextProvider } from "./context";
import { NormalVote } from "./NormalVote";
import { WebappVote } from "./WebappVote";

function Vote() {
  const show = useShowComponents().vote;

  if (!show) return null;
    
  return (
    <VoteContextProvider>
      {Webapp.isEnabled ? <WebappVote /> : <NormalVote />}
    </VoteContextProvider>
  );
}

export default Vote;
