import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
  useWallet,
  useAnchorWallet,
  AnchorWallet,
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { UnsafeBurnerWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import React, { FC, ReactNode, useMemo, useState, useEffect } from "react";
import CallToActionWithAnnotation from "./components/Hero";
import Nav from "./components/Header";
import PollCardGrid from "./components/PollCardGrid";
import { getAllPolls } from "./api/api";
import { PollModel } from "./models/PollModel";
import { AnchorProvider, BN, Program, web3 } from "@project-serum/anchor";
import idl from "./idl/staking.json";
import { PollCreator } from "./components/PollCreator";
import { Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";
import { LoginForm } from "./components/Login";
import { SignupForm } from "./components/Signup";

require("./App.css");
require("@solana/wallet-adapter-react-ui/styles.css");

const App: FC = () => {
  return (
    <Context>
      <Content />
    </Context>
  );
};
export default App;

const Context: FC<{ children: ReactNode }> = ({ children }) => {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
  const network = WalletAdapterNetwork.Devnet;

  // You can also provide a custom RPC endpoint.
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [
      /**
       * Wallets that implement either of these standards will be available automatically.
       *
       *   - Solana Mobile Stack Mobile Wallet Adapter Protocol
       *     (https://github.com/solana-mobile/mobile-wallet-adapter)
       *   - Solana Wallet Standard
       *     (https://github.com/solana-labs/wallet-standard)
       *
       * If you wish to support a wallet that supports neither of those standards,
       * instantiate its legacy wallet adapter here. Common legacy adapters can be found
       * in the npm package `@solana/wallet-adapter-wallets`.
       */
      new UnsafeBurnerWalletAdapter(),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

const Content: FC = () => {
  const connection = new Connection("https://api.devnet.solana.com/");
  const anchorWallet: AnchorWallet | undefined = useAnchorWallet();

  const anchorProvider: AnchorProvider | undefined = useMemo(() => {
    if (anchorWallet) {
      return new AnchorProvider(connection, anchorWallet, {
        commitment: "confirmed",
      });
    } else {
      return undefined;
    }
  }, [connection, anchorWallet]);

  // Make sure you use your program ID!
  const programId = new PublicKey(
    "Dvufj2n9dYtimtH8su9ZNHoJ33Yd9a49KAtn5PoJGh2c"
  );

  const a = JSON.stringify(idl);
  const b = JSON.parse(a);

  const anchorProgram = useMemo(() => {
    if (anchorProvider) {
      return new Program(b, programId, anchorProvider);
    } else {
      return undefined;
    }
  }, [anchorProvider]);

  const isLoggedIn = () => {
    return bearer !== "";
  };

  const [bearer, setBearer] = useState("");
  const [globalUsername, setGlobalUsername] = useState("");
  const [polls, setPolls] = useState<PollModel[]>();

  // Method to get all polls from the database
  useEffect(() => {
    if (bearer === "") {
      return;
    }
    getAllPolls(bearer)
      .then((response: any) => {
        const pollsFromApi = response.data.data;
        const updatedPolls = pollsFromApi.map((x: Object) => {
          return x as PollModel;
        });
        setPolls(updatedPolls);
        console.log(updatedPolls);
      })
      .catch((err: any) => {
        console.error(err);
      });
  }, [bearer]);

  return (
    <div className="App">
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <Nav
        globalUsername={globalUsername}
        setGlobalUsername={setGlobalUsername}
      ></Nav>
      <Routes>
        <Route path="/" element={<CallToActionWithAnnotation />} />
        <Route
          path="create_poll"
          element={
            isLoggedIn() ? (
              <PollCreator
                bearer={bearer}
                anchorProgram={anchorProgram}
                anchorWallet={anchorWallet}
              />
            ) : (
              <Navigate replace to="/login" />
            )
          }
        />
        <Route
          path="vote_and_stake"
          element={
            <PollCardGrid
              bearer={bearer}
              anchorProgram={anchorProgram}
              anchorWallet={anchorWallet}
              polls={polls}
            />
          }
        />

        <Route path="signup" element={<SignupForm />} />
        <Route
          path="login"
          element={
            <LoginForm
              setBearer={setBearer}
              setGlobalUsername={setGlobalUsername}
            />
          }
        />
        {/* <Route path="*" element={<NoPage />} /> */}
      </Routes>
    </div>
  );
};
