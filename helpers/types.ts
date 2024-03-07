import BigNumber from 'bignumber.js';

export enum eEthereumNetwork {
  coverage = 'coverage',
  hardhat = 'hardhat',
  kovan = 'kovan',
  ropsten = 'ropsten',
  main = 'main',
  goerli = 'goerli',
}

export enum eContractid {
  DistributionManager = 'DistributionManager',
  StakedPSYS = 'StakedPSYS',
  StakedPSYSImpl = 'StakedPSYSImpl',
  PegasysIncentivesController = 'PegasysIncentivesController',
  IERC20Detailed = 'IERC20Detailed',
  AdminUpgradeabilityProxy = 'AdminUpgradeabilityProxy',
  InitializableAdminUpgradeabilityProxy = 'InitializableAdminUpgradeabilityProxy',
  MintableErc20 = 'MintableErc20',
  LendingPoolMock = 'LendingPoolMock',
  MockTransferHook = 'MockTransferHook',
  ATokenMock = 'ATokenMock',
  StakedPSYSV2 = 'StakedPSYSV2',
  DoubleTransferHelper = 'DoubleTransferHelper',
  ICRPFactory = 'ICRPFactory',
  StakedTokenV2 = 'StakedTokenV2',
  StakedTokenV3 = 'StakedTokenV3',
  IConfigurableRightsPool = 'IConfigurableRightsPool',
  IBPool = 'IBPool',
  IControllerPegasysEcosystemReserve = 'IControllerPegasysEcosystemReserve',
  MockSelfDestruct = 'SelfdestructTransfer',
  StakedTokenV2Rev3 = 'StakedTokenV2Rev3',
  StakedTokenBptRev2 = 'StakedTokenBptRev2',
  PegasysStakingHelper = 'PegasysStakingHelper',
  StakeUIHelper = 'StakeUIHelper',
}

export type tEthereumAddress = string;
export type tStringTokenBigUnits = string; // 1 ETH, or 10e6 USDC or 10e18 DAI
export type tBigNumberTokenBigUnits = BigNumber;
// 1 wei, or 1 basic unit of USDC, or 1 basic unit of DAI
export type tStringTokenSmallUnits = string;
export type tBigNumberTokenSmallUnits = BigNumber;

export interface iParamsPerNetwork<T> {
  [eEthereumNetwork.coverage]: T;
  [eEthereumNetwork.hardhat]: T;
  [eEthereumNetwork.kovan]: T;
  [eEthereumNetwork.goerli]: T;
  [eEthereumNetwork.ropsten]: T;
  [eEthereumNetwork.main]: T;
  [eEthereumNetwork.goerli]: T;
}
