import axios, { AxiosResponse } from "axios";
import { PollModel } from "../models/PollModel";
import { LoginInput } from "../models/LoginInput";
import { LoginDetails } from "../models/LoginDetails";
import qs from "qs";
import { VoteModel } from "../models/VoteModel";
import { SignupInput } from "../models/SignupInput";

const BASEURL = "https://consensusbackend.w3bber.com/v1";

export const signup = async (signupInput: SignupInput) => {
  const api_call: string = `${BASEURL}/register`;
  const config = {
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
    },
  };
  return axios.post<LoginDetails>(api_call, signupInput, config);
};

export const login = async (loginInput: LoginInput) => {
  const api_call: string = `${BASEURL}/login?wallet_id=${loginInput.username}`;
  const config = {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      accept: "application/json",
    },
  };
  return axios.post<LoginDetails>(api_call, qs.stringify(loginInput), config);
};

export const getUserInfo = async (bearerToken: string) => {
  const api_call: string = `${BASEURL}/user/me`;
  const config = {
    headers: {
      Authorization: `Bearer ${bearerToken}`,
      accept: "application/json",
    },
  };
  console.log(config);
  return axios.get(api_call, config);
};

export const createPoll = async (bearerToken: string, pollModel: PollModel) => {
  const api_call: string = `${BASEURL}/consensus-polls/create_poll`;
  const config = {
    headers: {
      Authorization: `Bearer ${bearerToken}`,
      accept: "application/json",
      "Content-Type": "application/json",
    },
  };

  console.log(qs.stringify(pollModel));
  return axios.post<PollModel>(api_call, pollModel, config);
};

export const createVote = async (bearerToken: string, voteModel: VoteModel) => {
  const api_call: string = `${BASEURL}/consensus-polls/create_vote`;
  const config = {
    headers: {
      Authorization: `Bearer ${bearerToken}`,
      accept: "application/json",
      "Content-Type": "application/json",
    },
  };

  console.log(qs.stringify(voteModel));
  return axios.post<VoteModel>(api_call, voteModel, config);
};

export const updateVote = async (bearerToken: string, voteModel: VoteModel) => {
  const api_call: string = `${BASEURL}/consensus-polls/update_vote`;
  const config = {
    headers: {
      Authorization: `Bearer ${bearerToken}`,
      accept: "application/json",
      "Content-Type": "application/json",
    },
  };

  console.log(qs.stringify(voteModel));
  return axios.post<VoteModel>(api_call, voteModel, config);
};

export const getPollOptionsMetadata = async (bearerToken: string) => {
  const api_call: string = `${BASEURL}/consensus-polls/get_poll_options_metadata`;
  const config = {
    headers: {
      Authorization: `Bearer ${bearerToken}`,
      accept: "application/json",
      "Content-Type": "application/json",
    },
  };
  return axios.post(api_call, {}, config);
};

export const getAllPolls = async () => {
  const api_call: string = `${BASEURL}/consensus-polls/get_all_polls`;
  const config = {
    headers: {
      accept: "application/json",
    },
  };
  return axios.get(api_call, config);
};

export const getActivePolls = async (bearerToken: string) => {
  if (bearerToken === "") {
    return;
  }
  const api_call: string = `${BASEURL}/poll/get_all_active_polls`;
  const config = {
    headers: {
      Authorization: `Bearer ${bearerToken}`,
      accept: "application/json",
    },
  };
  console.log(api_call, config);
  return axios.get(api_call, config);
};

export const getVote = async (bearerToken: string, poll_id: string) => {
  const api_call: string = `${BASEURL}/vote/get_user_vote?poll_id=${poll_id}`;
  const config = {
    headers: {
      Authorization: `Bearer ${bearerToken}`,
      accept: "application/json",
      "Content-Type": "application/json",
    },
  };
  const body = {};
  return axios.post(api_call, body, config);
};

export const getAllVotesForUser = async (bearerToken: string) => {
  const api_call: string = `${BASEURL}/vote/get_all_votes_for_user`;
  const config = {
    headers: {
      Authorization: `Bearer ${bearerToken}`,
      accept: "application/json",
      "Content-Type": "application/json",
    },
  };
  const body = {};
  return axios.post(api_call, body, config);
};
