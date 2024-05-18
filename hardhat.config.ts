import { eEthereumNetwork } from './helpers/types';
// @ts-ignore
import { accounts } from './test-wallets';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { HardhatUserConfig } from 'hardhat/types';

import '@typechain/hardhat';
import 'solidity-coverage';
import '@nomiclabs/hardhat-waffle';
import '@nomicfoundation/hardhat-verify';

dotenv.config();

export const BUIDLEREVM_CHAIN_ID = 31337;

const DEFAULT_BLOCK_GAS_LIMIT = 12500000;
const ETHERSCAN_KEY = process.env.ETHERSCAN_KEY || '';
const PRIVATE_KEY = process.env.PRIVATE_KEY || '';
const SKIP_LOAD = process.env.SKIP_LOAD === 'true';

// Prevent to load scripts before compilation and typechain
if (!SKIP_LOAD) {
  ['misc', 'migrations', 'deployments', 'proposals'].forEach((folder) => {
    const tasksPath = path.join(__dirname, 'tasks', folder);
    fs.readdirSync(tasksPath)
      .filter((pth) => pth.includes('.ts'))
      .forEach((task) => {
        require(`${tasksPath}/${task}`);
      });
  });
}

require(`${path.join(__dirname, 'tasks/misc')}/set-dre.ts`);

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: '0.6.12',
        settings: {
          optimizer: { enabled: true, runs: 200 },
          evmVersion: 'istanbul',
        },
      },
      {
        version: '0.7.5',
        settings: {
          optimizer: { enabled: true, runs: 200 },
          evmVersion: 'istanbul',
        },
      },
    ],
  },
  typechain: {
    outDir: 'types',
  },
  etherscan: {
    apiKey: {
      main: "abc" // Set to an empty string or some placeholder
    },
    customChains: [
      {
        network: "main",
        chainId: 570,
        urls: {
          apiURL: "https://explorer.rollux.com/api",
          browserURL: "https://explorer.rollux.com/"
        }
      }
    ]
  },
  defaultNetwork: 'hardhat',
  mocha: {
    timeout: 0,
  },
  networks: {
    main: {
      chainId: 570,
      url: "https://rpc.rollux.com",
      accounts: [PRIVATE_KEY]
    }, 
    // Hardhat config for testing purposes
    hardhat: {
      hardfork: 'london',
      blockGasLimit: DEFAULT_BLOCK_GAS_LIMIT,
      gas: DEFAULT_BLOCK_GAS_LIMIT,
      chainId: BUIDLEREVM_CHAIN_ID,
      throwOnTransactionFailures: true,
      throwOnCallFailures: true,
      accounts: accounts.map(({ secretKey, balance }: { secretKey: string; balance: string }) => ({
        privateKey: secretKey,
        balance,
      })),
    },
  },
};

export default config;
