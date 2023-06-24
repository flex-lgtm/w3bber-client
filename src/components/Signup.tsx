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

import { Link as RouterLink, useNavigate } from "react-router-dom";

import {
  m_AppBgColor,
  m_CardBgColor,
  m_CardHeadingColor,
  m_NormalTextColor,
  m_SectionHeadingColor,
} from "../Constants";
import { toast } from "react-toastify";
import { LoginInput } from "../models/LoginInput";
import { signup } from "../api/api";
import { useState } from "react";

export const SignupForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

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

  const navigate = useNavigate();

  return (
    <Flex minH={"100vh"} align={"center"} justify={"center"} bg={m_AppBgColor}>
      <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
        <Stack align={"center"}>
          <Heading color={m_SectionHeadingColor} fontSize={"4xl"}>
            Sign Up
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
                  Already a user? &nbsp;
                  <RouterLink to="/login">
                    <Link color={"purple.400"}>Login</Link>
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

                  signup(loginInput)
                    .then((response: any) => {
                      console.log("signup: ", response);
                      if (response.data == null) {
                        notifyFailure("Signup Failed: " + response);
                      } else if (response.data.internalResponseCode == 1) {
                        notifyFailure(
                          "Signup Failed: " + response.data.details
                        );
                      } else if (response.data.internalResponseCode == 0) {
                        notifySuccess("Signup Successful, please Login");
                        navigate("/login", { replace: true });
                      }
                    })
                    .catch((err: any) => {
                      notifyFailure("Signup Failed: " + err);
                    });
                }}
              >
                Sign Up
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
};
