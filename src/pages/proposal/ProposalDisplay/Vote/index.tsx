import { Webapp } from "WebApp";
import { useShowComponents } from "../hooks";
import { VoteContextProvider } from "./context";
import { NormalVote } from "./Normal";
import { TWAVote } from "./TWA";

function Vote() {
  const show = useShowComponents().vote;

  if (!show) return null;
    
  return (
    <VoteContextProvider>
      {Webapp.isEnabled ? <TWAVote /> : <NormalVote />}
    </VoteContextProvider>
  );
}

export default Vote;
