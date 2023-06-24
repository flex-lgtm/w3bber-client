import {
  Box,
  ButtonGroup,
  Radio,
  Heading,
  VStack,
  Stack,
  InputLeftElement,
  Text,
  useColorModeValue,
  Flex,
  Button,
  Code,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useClipboard,
  useDisclosure,
  HStack,
  Container,
  Tooltip,
} from "@chakra-ui/react";
import {
  InputControl,
  RadioGroupControl,
  ResetButton,
  SubmitButton,
  TextareaControl,
} from "react-hook-form-chakra";
import { InfoIcon, InfoOutlineIcon, PhoneIcon } from "@chakra-ui/icons";
import * as Yup from "yup";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Program, web3 } from "@project-serum/anchor";
import { useState } from "react";
import NodeRSA from "node-rsa";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { PollModel, RewardPerOption } from "../models/PollModel";
import { createPollOnChain } from "../api/solana_api";
import { createPoll } from "../api/api";
import {
  m_CardBgColor,
  m_CardHeadingColor,
  m_HeaderBgColor,
  m_NormalTextColor,
  m_SectionHeadingColor,
} from "../Constants";
import { toast } from "react-toastify";

const pollKeyPair = web3.Keypair.generate();
const encryptionKey = new NodeRSA({ b: 2048 });

const defaultValues = {
  poll_id: pollKeyPair.publicKey.toString(),
  public_key: encryptionKey.exportKey("pkcs8-public"),
  poll_title: "",
  max_options: "10",
  options: "Yes;No",
  reward_calculation_type: "linear",
  sublinear_weighting_parameter: "2",
  rewards_structure: "1:80;2:20",
  entry_fee_type: "variable",
  fixed_entry_fee: 0,
  amount_token: "SOL",
};

// We're using yup validation for this demo but you can choose any other react hook form supported validation provider
const validationSchema = Yup.object({
  poll_id: Yup.string().required("Poll id is required"),
  public_key: Yup.string().required("Public key is required"),
  poll_title: Yup.string().required("Poll Title is required"),
  max_options: Yup.string().required("Max options are required"),
  options: Yup.string().required("Options are required"),
  reward_calculation_type: Yup.string().required(
    "Reward calculation logic is required"
  ),
  sublinear_weighting_parameter: Yup.string().required(
    "Sublinear weighting parameter is required"
  ),
  rewards_structure: Yup.string().required(
    "Rewards structure per position is required"
  ),
  entry_fee_type: Yup.string().required("Entry fee type is required"),
  fixed_entry_fee: Yup.number().required("Required").min(0),
  amount_token: Yup.string().required("Amount token is required"),
});

interface ModalProps {
  buttonText: string;
  title: string;
  body: string;
}

const BasicModal = ({ buttonText, title, body }: ModalProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { onCopy, value, setValue, hasCopied } = useClipboard(body);

  //   setValue(body);

  return (
    <>
      <Button onClick={onOpen}>{buttonText}</Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg={m_HeaderBgColor}>
          <ModalHeader color={m_SectionHeadingColor}>{title}</ModalHeader>
          <ModalCloseButton />
          <Button mx={4} onClick={onCopy} colorScheme={"gray"}>
            {hasCopied ? "Copied!" : "Copy"}
          </Button>
          <Code m={4} color={m_SectionHeadingColor} bg={m_HeaderBgColor}>
            {body}
          </Code>
        </ModalContent>
      </Modal>
    </>
  );
};

const TextWithTooltip = ({ text, tooltipText }: any) => {
  return (
    <Tooltip label={tooltipText} placement="right-start">
      <HStack>
        <Text
          justifyContent={"left"}
          color={m_SectionHeadingColor}
          fontWeight={500}
        >
          {text}
        </Text>
        <InfoIcon />
      </HStack>
    </Tooltip>
  );
};

export interface PollCreatorProps {
  bearer: string;
  anchorProgram: Program<any> | undefined;
  anchorWallet: AnchorWallet | undefined;
}

export const PollCreator = ({
  bearer,
  anchorProgram,
  anchorWallet,
}: PollCreatorProps) => {
  const methods = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues,
    mode: "onBlur",
  });
  const values = useWatch({ control: methods.control });
  const invalidBearerToken = "Invalid Bearer Token";
  const invalidAnchorProgram = "Invalid Anchor Program";
  const invalidAnchorWallet = "Connect your wallet first";

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

  const onSubmit = (data: any) => {
    if (bearer === "") {
      notifyFailure(invalidBearerToken);
      return;
    }

    if (anchorWallet === undefined) {
      notifyFailure(invalidAnchorWallet);
      return;
    }

    if (anchorProgram === undefined) {
      notifyFailure(invalidAnchorProgram);
      return;
    }

    // Check if the data is well formed
    const isValidPollData = (data: any) => {
      if (data.options == undefined || data.options == "") {
        notifyFailure("Options are required");
        return false;
      }

      if (data.options.split(";").length > data.max_options) {
        notifyFailure(
          "Max options should be greater than or equal to number of options"
        );
        return false;
      }

      if (data.rewards_structure == undefined || data.rewards_structure == "") {
        notifyFailure("Rewards structure is required");
        return false;
      }

      const rewards_structure = data.rewards_structure
        .split(";")
        .map((x: string) => {
          const vals = x.split(":");
          return {
            option: Number.parseInt(vals[0]),
            reward_pct: Number.parseInt(vals[1]),
          } as RewardPerOption;
        });

      console.log(rewards_structure);
      if (rewards_structure.length === 0) {
        notifyFailure(
          "Incorrect format for Rewards structure, use option:reward_pct;option:reward_pct;..."
        );
        return false;
      }

      const reward_options = rewards_structure.map((x: RewardPerOption) => {
        return x.option;
      });

      if (new Set(reward_options).size !== reward_options.length) {
        notifyFailure("Reward options should be unique");
        return false;
      }

      for (let i = 0; i < rewards_structure.length; i++) {
        if (
          rewards_structure[i].option < 1 ||
          rewards_structure[i].option === undefined
        ) {
          notifyFailure(
            "Option in rewards structure should be greater than or equal to 1 and numeric"
          );
          return false;
        }

        if (rewards_structure[i].option > data.max_options) {
          notifyFailure(
            "Option in rewards structure should be less than or equal to number of options"
          );
          return false;
        }

        if (rewards_structure[i].reward_pct > 100) {
          notifyFailure(
            "Reward percentage should be less than or equal to 100"
          );
          return false;
        }
      }

      const sum_rewards = rewards_structure.reduce(
        (a: number, b: RewardPerOption) => a + b.reward_pct,
        0
      );
      if (sum_rewards != 100) {
        notifyFailure("Sum of rewards should be 100");
        return false;
      }
      return true;
    };

    if (!isValidPollData(data)) {
      return;
    }

    const pollModel = {
      poll_id: data.poll_id,
      poll_title: data.poll_title,
      max_options: Number.parseInt(data.max_options),
      options: data.options.split(";"),
      public_key: data.public_key,
      entry_fee_type: data.entry_fee_type,
      reward_calculation_type: data.reward_calculation_type,
      amount_token: data.amount_token,
      rewards_structure: data.rewards_structure.split(";").map((x: string) => {
        const vals = x.split(":");
        console.log(x, vals);
        return {
          option: Number.parseInt(vals[0]),
          reward_pct: Number.parseInt(vals[1]),
        } as RewardPerOption;
      }),
      fixed_entry_fee: Number.parseInt(data.fixed_entry_fee),
      sublinear_weighting_parameter: Number.parseInt(
        data.sublinear_weighting_parameter
      ),
    } as PollModel;

    console.log(pollModel);

    // First create the poll on the backend
    createPoll(bearer, pollModel)
      .then((response: any) => {
        console.log(response);
        if (response.data.InternalResponseCode == 1) {
          notifyFailure(response.data.Message + ": Check Poll Metadata");
          return;
        }

        // Then create the poll on the chain
        createPollOnChain(anchorProgram, anchorWallet, pollKeyPair, pollModel)
          .then((response: any) => {
            console.log(response);
            notifySuccess("Poll Created Successfully: " + response);
          })
          .catch((err: any) => {
            console.error(err);
            notifyFailure(err.message);
          });
      })
      .catch((err: any) => {
        console.error(err);
        notifyFailure(err.message);
        return;
      });
  };

  const isSublinearWeighing = () => {
    if (values.reward_calculation_type === "sublinear") {
      return true;
    } else {
      return false;
    }
  };

  const pollKeyPairModalProps = {
    buttonText: "Show Secret",
    title: "Poll Keypair Secret",
    body: pollKeyPair.secretKey.toString(),
  } as ModalProps;

  const encryptionKeyModalProps = {
    buttonText: "Show Secret",
    title: "Encryption Secret",
    body: encryptionKey.exportKey("pkcs8-private"),
  } as ModalProps;

  return (
    <Container maxW={"5xl"} p={4}>
      <FormProvider {...methods}>
        <Box
          rounded={"lg"}
          minW={"350px"}
          bg={m_CardBgColor}
          boxShadow={"lg"}
          p={8}
        >
          <VStack
            as="form"
            onSubmit={methods.handleSubmit(onSubmit)}
            spacing={5}
          >
            <Heading marginY={5} color={m_SectionHeadingColor}>
              Create a Poll
            </Heading>

            <TextWithTooltip
              text="Poll Id"
              tooltipText="Unique id for the poll as well as public key for the Poll Account on Solana blockchain. Please save the corresponding secret key because you'd need it to end the poll and distribute rewards"
            />

            <InputControl
              name="poll_id"
              // label="Poll Id"
              isReadOnly={true}
              color={m_CardHeadingColor}
            />
            <BasicModal {...pollKeyPairModalProps} />

            <TextWithTooltip
              text="Encryption Public Key"
              tooltipText="RSA public key used by voters to encrypt their votes. Please save the corresponding secret key because you'd need it to decrypt votes"
            />
            <TextareaControl
              name="public_key"
              // label="Public Key"
              isReadOnly={true}
              color={m_CardHeadingColor}
            />
            <BasicModal {...encryptionKeyModalProps} />

            <TextWithTooltip
              text="Poll Title"
              tooltipText="Just what the name says"
            />
            <InputControl
              name="poll_title"
              // label="Poll Title"
              color={m_SectionHeadingColor}
            />

            <TextWithTooltip
              text="Max Options"
              tooltipText="Max number of options you think this poll would have over its lifetime. Please select a larger number for this if you think the number of options would increase over time."
            />
            <RadioGroupControl
              name="max_options"
              // label="Max Options"
              color={m_SectionHeadingColor}
            >
              <Radio value="10">10</Radio>
              <Radio value="100">100</Radio>
              <Radio value="1000">1000</Radio>
            </RadioGroupControl>

            <TextWithTooltip
              text="Options"
              tooltipText="Options for the poll separated by semicolon. For example: Option 1; Option 2; Option 3. Should be less than equal to max options."
            />
            <InputControl
              name="options"
              // label="Options"
              color={m_SectionHeadingColor}
            />

            <TextWithTooltip
              text="Reward Calculation Type"
              tooltipText="This is to define whether a vote is to be counted singular, as a linear function of staked tokens or as a sublinear function of staked tokens. Please read the documentation for more details."
            />
            <RadioGroupControl
              name="reward_calculation_type"
              // label="Reward Calculation Type"
              color={m_SectionHeadingColor}
            >
              <Radio value="singular">Singular</Radio>
              <Radio value="linear">Linear</Radio>
              <Radio value="sublinear">Sublinear</Radio>
            </RadioGroupControl>

            {isSublinearWeighing() ? (
              <Box>
                <TextWithTooltip
                  text="Sublinear Weighing Parameter"
                  tooltipText="A parameter to define the sublinear weighing function. Please read the documentation for more details."
                />
                <RadioGroupControl
                  name="sublinear_weighing_parameter"
                  // label="Sublinear Weighing Parameter"
                  color={m_CardHeadingColor}
                  pt={4}
                  pl={10}
                >
                  <Radio value="2">2</Radio>
                  <Radio value="100">100</Radio>
                  <Radio value="200">200</Radio>
                </RadioGroupControl>
              </Box>
            ) : null}

            <TextWithTooltip
              text="Rewards Structure"
              tooltipText="Specify what percentage of total pool would be distributed to each ranked option. For eg. if you want 80% of the pool to go to the first ranked option, 20% to the second and 0% to the rest, you'd specify 1:80;2:20;. Please note that the sum of all percentages should be 100."
            />
            <InputControl
              name="rewards_structure"
              // label="Rewards Structure"
              color={m_SectionHeadingColor}
            />
            {/* <InputControl name="entry_fee_type" label="Entry Fee Type" isReadOnly={true}/>
        <InputControl name="fixed_entry_fee" label="Fixed Entry Fee" isReadOnly={true}/> */}

            <TextWithTooltip
              text="Amount Token"
              tooltipText="Can only use SOL for now. Rest coming soon..."
            />
            <InputControl
              name="amount_token"
              // label="Amount Token"
              isReadOnly={true}
              color={m_SectionHeadingColor}
            />

            <Text fontSize="xl" color="tomato">
              Note: Please save the secret key for the poll id as well the one
              corresponding to RSA encryption, otherwise you won't be able to
              decrypt votes or send rewards from your account 🙄
            </Text>
            <ButtonGroup>
              <SubmitButton colorScheme="purple">Submit</SubmitButton>
              <ResetButton>Reset</ResetButton>
            </ButtonGroup>

            {/* <Stack marginY={10} direction="column" spacing={5}>
            <Box>
              <Text fontWeight="bold">Values:</Text>
              <Box as="pre">{JSON.stringify(values, null, 2)}</Box>
            </Box>
            <Box>
              <Text fontWeight="bold">Errors:</Text>
              <Box as="pre">
                {JSON.stringify(methods.formState.errors, null, 2)}
              </Box>
            </Box>
            <Box>
              <Text fontWeight="bold">Touched:</Text>
              <Box as="pre">
                {JSON.stringify(methods.formState.touchedFields, null, 2)}
              </Box>
            </Box>
          </Stack> */}
          </VStack>
        </Box>
      </FormProvider>
    </Container>
  );
};
