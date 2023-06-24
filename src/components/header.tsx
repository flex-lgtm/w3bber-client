import {
  Avatar,
  Box,
  Flex,
  Text,
  Button,
  useDisclosure,
  Badge,
  MenuButton,
  Center,
  Menu,
  MenuList,
} from "@chakra-ui/react";

import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";

import {
  m_CardBgColor,
  m_HeaderBgColor,
  m_NormalTextColor,
  m_SectionHeadingColor,
} from "../Constants";
import { Link as RouterLink } from "react-router-dom";

interface NavProps {
  globalUsername: string;
  setGlobalUsername: React.Dispatch<React.SetStateAction<string>>;
}

export default function WithSubnavigation({
  globalUsername,
  setGlobalUsername,
}: NavProps) {
  return (
    // <Box bgColor='transparent'>
    <Box bgColor={m_HeaderBgColor}>
      <Flex
        minH={"60px"}
        py={{ base: 2 }}
        px={{ base: 5, md: 36 }}
        align={"center"}
      >
        <Flex flex={{ base: 1 }} justify={{ base: "center", md: "start" }}>
          <Avatar size="md" name="W3bber Logo" src="w3bber_logo.png" />
          <RouterLink to="/">
            <Box ml="1">
              <Text
                pt={3}
                pr={2}
                fontSize={{ base: "2xl", sm: "2xl", md: "2xl" }}
                fontWeight="bold"
                fontFamily={"Century Gothic"}
                textColor={"gray.200"}
              >
                w3bber
                <Badge ml="1" colorScheme="green">
                  beta
                </Badge>
              </Text>
            </Box>
          </RouterLink>
        </Flex>
        <WalletMultiButton />
        &nbsp;
        <Menu>
          <MenuButton
            as={Button}
            rounded={"full"}
            variant={"link"}
            cursor={"pointer"}
            minW={0}
          >
            <Avatar
              size={"sm"}
              src={"https://avatars.dicebear.com/api/male/username.svg"}
            />
          </MenuButton>
          <MenuList alignItems={"center"} bg={m_CardBgColor}>
            <br />
            <Center>
              <Avatar
                size={"2xl"}
                src={"https://avatars.dicebear.com/api/male/username.svg"}
              />
            </Center>
            <br />
            <Center>
              {globalUsername === "" ? (
                <Text color={m_SectionHeadingColor}>Logged Out</Text>
              ) : (
                <Text color={m_SectionHeadingColor}>{globalUsername}</Text>
              )}
            </Center>
            <br />
            {/* <Button>Logout</Button> */}
          </MenuList>
        </Menu>
      </Flex>
    </Box>
  );
}
