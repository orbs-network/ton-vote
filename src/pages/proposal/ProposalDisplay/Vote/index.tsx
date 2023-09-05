import { isTwaApp } from "consts";
import { useShowComponents } from "../hooks";
import { VoteContextProvider } from "./context";
import { NormalVote } from "./Normal";
import { TWAVote } from "./TWA";

function Vote() {
  const show = useShowComponents().vote;

  if (!show) return null;
    
  return (
    <VoteContextProvider>
      {isTwaApp ? <TWAVote /> : <NormalVote />}
    </VoteContextProvider>
  );
}

export default Vote;
