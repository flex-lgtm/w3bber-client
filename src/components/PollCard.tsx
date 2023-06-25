import React, { useEffect, useRef, useState } from "react";
import * as anchor from "@project-serum/anchor";
import {
  chakra,
  Card,
  CardFooter,
  Text,
  Button,
  Center,
  Select,
  FormControl,
  FormLabel,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  VStack,
  Input,
  HStack,
  Divider,
  Tooltip,
} from "@chakra-ui/react";
import { ToastContainer, toast } from "react-toastify";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import {
  m_CardBgColor,
  m_CardHeadingColor,
  m_SectionHeadingColor,
} from "../Constants";
import { PollModel } from "../models/PollModel";
import {
  createVoteOnChain,
  getVoteFromChain,
  updateVoteOnChain,
} from "../api/solana_api";
import { encryptRSA } from "../encryption/encryption";
import NodeRSA from "node-rsa";
import { InfoIcon } from "@chakra-ui/icons";
import { AnchorWallet } from "@solana/wallet-adapter-react";

const TextWithTooltip = ({ text, tooltipText }: any) => {
  return (
    <Tooltip label={tooltipText} placement="top-start">
      <HStack>
        <Text
          justifyContent={"left"}
          color={m_CardHeadingColor}
          fontWeight={500}
        >
          {text}
        </Text>
        <InfoIcon />
      </HStack>
    </Tooltip>
  );
};

export interface PollCardProps {
  bearer: string;
  anchorProgram: anchor.Program<any> | undefined;
  anchorWallet: AnchorWallet | undefined;
  poll: PollModel;
}

const PollCard = ({
  bearer,
  anchorProgram,
  anchorWallet,
  poll,
}: PollCardProps) => {
  const [onChainVote, setOnChainVote] = useState("");
  const [onChainStake, setOnChainStake] = useState(0);
  const [voteAccount, setVoteAccount] = useState("");

  const notifyFailure = (message: string) => {
    toast.error(message, {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
  };

  const notifySuccess = (message: string) => {
    toast.success(message, {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
  };

  useEffect(() => {
    if (anchorProgram === undefined || anchorWallet === undefined) {
      return;
    }

    const pollPublicKey = new anchor.web3.PublicKey(poll.poll_id);
    const [individualVotePDA, bumpVote] = PublicKey.findProgramAddressSync(
      [pollPublicKey.toBuffer(), anchorWallet.publicKey.toBuffer()],
      anchorProgram.programId
    );

    setVoteAccount(individualVotePDA.toBase58());

    anchorProgram.account.individualVote
      .fetch(individualVotePDA)
      .then((response: any) => {
        console.log(poll.poll_id, response);
        setOnChainVote(response.vote);
        setOnChainStake(response.tokensStaked.toNumber() / LAMPORTS_PER_SOL);
        console.log(onChainVote);
        console.log(onChainStake);
      })
      .catch((err: any) => {
        console.error(err);
      });
  }, [anchorProgram, anchorWallet, poll.poll_id]);

  const [randomizedVote, setRandomizedVote] = useState<number>();
  const [encryptedVote, setEncryptedVote] = useState<string>("");
  const [stakingAmount, setStakingAmount] = useState<number>(0);

  function randomIntFromInterval(min: number, max: number) {
    // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  const getRandomizedVote = (vote: number) => {
    const maxOptions = poll.max_options;
    const randomizedVote =
      randomIntFromInterval(0, 10000000) * (maxOptions + 1) + vote;
    return randomizedVote;
  };

  const getEncryptedVote = (randomizedVote: number) => {
    const message = randomizedVote.toString();
    const encryptedMessage = encryptRSA(
      message,
      poll.public_key as unknown as NodeRSA.Key
    );
    return encryptedMessage;
  };

  const onSelectVote = (event: any) => {
    console.log(event.target.value);
    console.log(event.target);
    const value = Number.parseInt(event.target.value);

    if (Number.isNaN(value)) {
      setRandomizedVote(NaN);
      setEncryptedVote("");
      return;
    }

    const rv = getRandomizedVote(value);
    const ev = getEncryptedVote(rv);
    setRandomizedVote(rv);
    setEncryptedVote(ev);
  };

  const pollPublickey = new anchor.web3.PublicKey(poll.poll_id);
  const invalidAnchorProgram = "Invalid Anchor Program";
  const invalidAnchorWallet = "Connect your wallet first";

  return (
    <Card
      variant="elevated"
      w={{ base: "350px", md: "350px" }}
      bgColor={m_CardBgColor}
      p={4}
      // _hover={{
      //   transform: "scale(1.05)",
      // }}
    >
      <chakra.h2
        color={m_SectionHeadingColor}
        fontSize={{ base: "lg", sm: "2xl" }}
        verticalAlign={"center"}
        fontWeight="bold"
        lineHeight="1.2"
        my={2}
        py={4}
      >
        {poll.poll_title}
      </chakra.h2>

      {/* <TextWithTooltip
        text="Poll Id"
        tooltipText="Unique id for the poll as well as public key for the Poll Account on Solana blockchain. Please save the corresponding secret key because you'd need it to end the poll and distribute rewards"
      /> */}
      <Tooltip
        label="Unique id for the poll as well as public key for the Poll Account on Solana blockchain"
        placement="top-start"
      >
        <Text color={m_CardHeadingColor}>{poll.poll_id}</Text>
      </Tooltip>

      <VStack p={4} spacing={4}>
        <Select
          placeholder="Your Vote"
          onChange={onSelectVote}
          color={m_SectionHeadingColor}
          bg={m_CardBgColor}
        >
          {poll.options.map((x: string, i: number) => (
            <option value={(i + 1).toString()} color={m_SectionHeadingColor}>
              {i + 1}: {x}
            </option>
          ))}
        </Select>

        <FormControl id="staking_amount">
          <Tooltip
            label="Amount of SOL you want to stake, this will be added to your existing stake if you have already voted for this poll"
            placement="top-start"
          >
            <FormLabel color={m_SectionHeadingColor}>
              Staking Amount (SOL)
            </FormLabel>
          </Tooltip>

          <NumberInput
            min={0}
            defaultValue={0.1}
            precision={6}
            step={0.1}
            color={m_SectionHeadingColor}
            onChange={(x) => setStakingAmount(Number.parseFloat(x))}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>

        <FormControl id="max_options">
          {/* <Tooltip
            label="Max options as specified by the poll creator"
            placement="top-start"
          >
            <FormLabel color={m_CardHeadingColor}>Max Options</FormLabel>
          </Tooltip> */}
          <TextWithTooltip
            text="Max Options"
            tooltipText="Max options as specified by the poll creator"
          />
          <Input
            type="text"
            value={poll.max_options.toString()}
            readOnly={true}
            disabled={true}
            color={"gray.300"}
          />
        </FormControl>

        <FormControl id="randomized_vote">
          {/* <FormLabel color={m_CardHeadingColor}>Randomized Vote</FormLabel> */}
          <TextWithTooltip
            text="Randomized Vote"
            tooltipText="Your actual vote is: randomized_vote % (max_options + 1), where randomized_vote is a random number between 1 and 10000000. This is to prevent sanctity of encryption"
          />
          <Input
            type="text"
            value={Number.isNaN(randomizedVote) ? "" : randomizedVote}
            readOnly={true}
            disabled={true}
            color={"gray.300"}
          />
        </FormControl>

        <FormControl id="encrypted_vote">
          {/* <FormLabel color={m_CardHeadingColor}>Encrypted Vote</FormLabel> */}
          <TextWithTooltip
            text="Encrypted Vote"
            tooltipText="This is the encrypted version of your randomized vote which is stored on-chain. Encryption is done using the RSA public key specified by the poll creator"
          />
          <Input
            type="text"
            value={encryptedVote}
            readOnly={true}
            disabled={true}
            color={"gray.300"}
          />
        </FormControl>

        <Divider pt={2} />

        <FormControl id="on_chain_vote">
          <TextWithTooltip
            text="Current On-Chain Vote"
            tooltipText="Current on-chain vote from your wallet for this poll, if any"
          />
          <Input
            type="text"
            value={onChainVote.toString()}
            readOnly={true}
            disabled={true}
            color={"gray.300"}
          />
        </FormControl>

        <FormControl id="on_chain_stake">
          <TextWithTooltip
            text="Current On-Chain Stake (SOL)"
            tooltipText="Total amount staked by you on-chain for this poll"
          />
          <Input
            type="text"
            value={onChainStake.toString()}
            readOnly={true}
            disabled={true}
            color={"gray.300"}
          />
        </FormControl>
      </VStack>

      <Tooltip
        label="PDA for the Poll Account on Solana blockchain"
        placement="top-start"
      >
        <Text p={2} color={m_CardHeadingColor}>
          Voting Account: {voteAccount}
        </Text>
      </Tooltip>
      <CardFooter
        justify="space-between"
        p={2}
        flexWrap="wrap"
        sx={{
          "& > button": {
            minW: "136px",
          },
        }}
      >
        <Center flex={1}>
          <Button
            mt={4}
            mx={2}
            colorScheme="purple"
            isDisabled={onChainVote !== "" || onChainStake !== 0}
            onClick={() => {
              if (anchorWallet === undefined) {
                notifyFailure(invalidAnchorWallet);
                return;
              }

              if (anchorProgram === undefined) {
                notifyFailure(invalidAnchorProgram);
                return;
              }

              createVoteOnChain(
                anchorProgram,
                anchorWallet,
                pollPublickey,
                encryptedVote,
                stakingAmount
              )
                .then((response: any) => {
                  console.log(response);
                  setOnChainVote(encryptedVote);
                  setOnChainStake(stakingAmount + onChainStake);
                  notifySuccess("Voted successfully: " + response);
                })
                .catch((err: any) => {
                  console.error(err);
                  notifyFailure(err.message);
                  return;
                });
            }}
          >
            Vote & Stake
          </Button>

          <Button
            mt={4}
            mx={2}
            colorScheme="gray"
            isDisabled={onChainVote === "" && onChainStake === 0}
            onClick={() => {
              if (anchorWallet === undefined) {
                notifyFailure(invalidAnchorWallet);
                return;
              }

              if (anchorProgram === undefined) {
                notifyFailure(invalidAnchorProgram);
                return;
              }

              updateVoteOnChain(
                anchorProgram,
                anchorWallet,
                pollPublickey,
                encryptedVote,
                stakingAmount
              )
                .then((response: any) => {
                  console.log(response);
                  setOnChainVote(encryptedVote);
                  setOnChainStake(stakingAmount + onChainStake);
                  notifySuccess("Updated successfully: " + response);
                })
                .catch((err: any) => {
                  console.error(err);
                  notifyFailure(err.message);
                  return;
                });
            }}
          >
            Update & Stake
          </Button>
        </Center>
      </CardFooter>
    </Card>
  );
};

export default PollCard;
