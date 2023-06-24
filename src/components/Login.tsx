import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Link,
  Button,
  Heading,
  Text,
} from "@chakra-ui/react";
import {
  m_AppBgColor,
  m_CardBgColor,
  m_CardHeadingColor,
  m_NormalTextColor,
  m_SectionHeadingColor,
} from "../Constants";
import { useState } from "react";
import { LoginInput } from "../models/LoginInput";
import { getUserInfo, login } from "../api/api";
import { toast } from "react-toastify";
import { Link as RouterLink, useNavigate } from "react-router-dom";

interface LoginFormProps {
  setBearer: React.Dispatch<React.SetStateAction<string>>;
  setGlobalUsername: React.Dispatch<React.SetStateAction<string>>;
}

export const LoginForm = ({ setBearer, setGlobalUsername }: LoginFormProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

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

  return (
    <Flex minH={"100vh"} align={"center"} justify={"center"} bg={m_AppBgColor}>
      <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
        <Stack align={"center"}>
          <Heading color={m_SectionHeadingColor} fontSize={"4xl"}>
            Login
          </Heading>
          <Text fontSize={"lg"} color={m_NormalTextColor}>
            to create <Link color={"purple.400"}>Polls</Link> ✌️
          </Text>
        </Stack>
        <Box rounded={"lg"} bg={m_CardBgColor} boxShadow={"lg"} p={8}>
          <Stack spacing={4}>
            <FormControl id="username">
              <FormLabel color={m_SectionHeadingColor}>Username</FormLabel>
              <Input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                }}
                color={m_CardHeadingColor}
              />
            </FormControl>
            <FormControl id="password">
              <FormLabel color={m_SectionHeadingColor}>Password</FormLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                color={m_CardHeadingColor}
              />
            </FormControl>
            <Stack spacing={10}>
              <Stack
                direction={{ base: "column", sm: "row" }}
                align={"start"}
                justify={"space-between"}
              >
                {/* <Checkbox>Remember me</Checkbox> */}
                <Text fontSize={"lg"} color={m_NormalTextColor}>
                  New User? &nbsp;
                  <RouterLink to="/signup">
                    <Link color={"purple.400"}>Sign Up</Link>
                  </RouterLink>
                </Text>
              </Stack>
              <Button
                // mt={4}
                bg={"purple.400"}
                color={"white"}
                _hover={{
                  bg: "purple.500",
                }}
                onClick={() => {
                  const loginInput: LoginInput = {
                    username: username,
                    password: password,
                  };

                  login(loginInput)
                    .then((response: any) => {
                      console.log("login: ", response);
                      if (response.data == null) {
                        notifyFailure("Login Failed: " + response);
                      } else if (response.data.internalResponseCode == 1) {
                        notifyFailure("Login Failed: " + response.data.details);
                      } else if (response.data.internalResponseCode == 0) {
                        setBearer(response.data.access_token);
                        setGlobalUsername(username);
                        notifySuccess("Login successful!!");
                        navigate("/create_poll", { replace: true });
                      }
                    })
                    .catch((err: any) => {
                      notifyFailure("Login Failed: " + err);
                    });
                }}
              >
                Login
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
};
