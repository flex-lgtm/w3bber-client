import {
    Flex,
    Box,
    FormControl,
    FormLabel,
    Input,
    Checkbox,
    Stack,
    Link,
    Button,
    Heading,
    Text,
    Textarea,
    useColorModeValue,
  } from '@chakra-ui/react';
  
  export default function HookFormCard() {
    return (
      <Flex
        minH={'100vh'}
        align={'center'}
        justify={'center'}
        bg={useColorModeValue('gray.50', 'gray.800')}>
        <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
          <Stack align={'center'}>
            <Heading fontSize={'4xl'}>Create a Poll</Heading>
            {/* <Text fontSize={'lg'} color={'gray.600'}>
              to enjoy all of our cool <Link color={'purple.400'}>features</Link> ✌️
            </Text> */}
          </Stack>
          <Box
            rounded={'lg'}
            bg={useColorModeValue('white', 'gray.700')}
            boxShadow={'lg'}
            p={8}>
            <Stack spacing={4}>
              <FormControl id="title">
                <FormLabel>Title</FormLabel>
                <Input type="text" />
              </FormControl>
              <FormControl id="description">
                <FormLabel>Description</FormLabel>
                <Textarea/>
              </FormControl>
              <FormControl id="option-1">
                <FormLabel>Option-1</FormLabel>
                <Input type="text" />
              </FormControl>
              <FormControl id="option-2">
                <FormLabel>Option-2</FormLabel>
                <Input type="text" />
              </FormControl>
              <Stack py={10}>
                <Button
                  bg={'purple.400'}
                  color={'white'}
                  _hover={{
                    bg: 'purple.500',
                  }}>
                  Create
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </Flex>
    );
  }