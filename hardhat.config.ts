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
import '@nomiclabs/hardhat-etherscan';
import '@tenderly/hardhat-tenderly';

dotenv.config();

export const BUIDLEREVM_CHAIN_ID = 31337;

const DEFAULT_BLOCK_GAS_LIMIT = 12500000;
const DEFAULT_GAS_PRICE = 100000000;
const HARDFORK = 'istanbul';
const INFURA_KEY = process.env.INFURA_KEY || '';
const ETHERSCAN_KEY = process.env.ETHERSCAN_KEY || '';
const MNEMONIC_PATH = "m/44'/60'/0'/0";
const MNEMONIC = process.env.MNEMONIC || '';
const PRIVATE_KEY = process.env.PRIVATE_KEY || '';
const SKIP_LOAD = process.env.SKIP_LOAD === 'true';
const MAINNET_FORK = process.env.MAINNET_FORK === 'true';
const FORKING_BLOCK = parseInt(process.env.FORKING_BLOCK || '12369243');

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

const mainnetFork = MAINNET_FORK
  ? {
      blockNumber: FORKING_BLOCK,
      url: `https://rpc-tanenbaum.rollux.com`
    }
  : undefined;

// Use of mnemonic over private key if mnemonic is provided
const accountsToUse =
  PRIVATE_KEY == ''
    ? {
        mnemonic: MNEMONIC,
        path: MNEMONIC_PATH,
        initialIndex: 0,
        count: 20,
      }
    : [PRIVATE_KEY];

const getCommonNetworkConfig = (networkName: eEthereumNetwork, networkId: number) => {
  return {
    url: `https://rpc-tanenbaum.rollux.com`, 
    hardfork: HARDFORK,
    blockGasLimit: DEFAULT_BLOCK_GAS_LIMIT,
    chainId: 57000,
    accounts: accountsToUse,
  };
};

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
    apiKey: ETHERSCAN_KEY,
  },
  defaultNetwork: 'main',
  mocha: {
    timeout: 0,
  },
  networks: {
    main: {
      ...getCommonNetworkConfig(eEthereumNetwork.main, 57000),
      gasPrice: DEFAULT_GAS_PRICE,
      url: `https://rpc-tanenbaum.rollux.com`
    }, 
    hardhat: {
      hardfork: 'istanbul',
      blockGasLimit: DEFAULT_BLOCK_GAS_LIMIT,
      gas: DEFAULT_BLOCK_GAS_LIMIT,
      chainId: BUIDLEREVM_CHAIN_ID,
      throwOnTransactionFailures: true,
      throwOnCallFailures: true,
      accounts: accounts.map(({ secretKey, balance }: { secretKey: string; balance: string }) => ({
        privateKey: secretKey,
        balance,
      })),
      forking: mainnetFork,
    },
    coverage: {
      url: 'http://localhost:8555',
    },
  },
};

export default config;
