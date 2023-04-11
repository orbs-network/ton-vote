import { useMutation } from "@tanstack/react-query";
import { useGetSender } from "hooks";
import _ from "lodash";


export const useVote = (proposalAddress: string) => {
  const getSender = useGetSender();
  return useMutation(
    async (vote: string) => {
      const sender = getSender;
    },
    {
      onError: (error) => console.log(error),
    }
  );
};

export const useJoinDao = () => {
  const getSender = useGetSender();

  return useMutation(async () => {
    const sender = getSender();
    return null;
  });
};
