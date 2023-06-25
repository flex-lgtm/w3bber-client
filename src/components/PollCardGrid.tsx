import { Box, SimpleGrid, Stack, Text, Wrap, WrapItem } from "@chakra-ui/react";
import PollCard from "./PollCard";
import { m_SectionHeadingColor } from "../Constants";
import { PollModel } from "../models/PollModel";
import { Program } from "@project-serum/anchor";
import { AnchorWallet } from "@solana/wallet-adapter-react";

interface PollCardGridProps {
  bearer: string;
  anchorProgram: Program<any> | undefined;
  anchorWallet: AnchorWallet | undefined;
  polls: PollModel[] | undefined;
}

const PollCardGrid = ({
  bearer,
  anchorProgram,
  anchorWallet,
  polls,
}: PollCardGridProps) => {
  return (
    <Box pt={10}>
      <Text fontSize="2xl" color={m_SectionHeadingColor} fontWeight={500}>
        Your Polls
      </Text>

      <Text fontSize="xl" color="tomato" p={2}>
        Note: You cannot withdraw your tokens once staked, however you can
        change your vote at any time with or without adding more tokens. In
        short, only your final vote is counted against all the tokens you stake.
      </Text>
      <SimpleGrid
        columns={{ base: 1, md: 2, lg: 4 }}
        pt={10}
        pb={4}
        px={4}
        spacing={10}
        // mx={4}
        justifyContent={"center"}
        textAlign={"center"}
      >
        {polls !== undefined
          ? polls!.map((poll) => (
              <PollCard
                bearer={bearer}
                anchorProgram={anchorProgram}
                anchorWallet={anchorWallet}
                poll={poll}
              />
            ))
          : null}
      </SimpleGrid>
    </Box>
  );
};

export default PollCardGrid;
