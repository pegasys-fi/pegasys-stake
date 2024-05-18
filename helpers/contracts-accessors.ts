import { deployContract, getContractFactory, getContract } from './contracts-helpers';
import { eContractid, tEthereumAddress } from './types';
import { MintableErc20 } from '../types/MintableErc20';
import { StakedPSYS } from '../types/StakedPSYS';
import { StakedPSYSV3 } from '../types/StakedPSYSV3';
import { ICRPFactory } from '../types/ICRPFactory'; // Configurable right pool factory
import { IConfigurableRightsPool } from '../types/IConfigurableRightsPool';
import { IControllerPegasysEcosystemReserve } from '../types/IControllerPegasysEcosystemReserve';
import { SelfdestructTransfer } from '../types/SelfdestructTransfer';
import { IBPool } from '../types/IBPool'; // Balance pool
import { PegasysStakingHelper } from '../types/PegasysStakingHelper';
import { StakeUIHelper } from '../types/StakeUIHelper';
import { IERC20Detailed } from '../types/IERC20Detailed';
import { InitializableAdminUpgradeabilityProxy } from '../types/InitializableAdminUpgradeabilityProxy';
import { PegasysIncentivesController } from '../types/PegasysIncentivesController';
import { MockTransferHook } from '../types/MockTransferHook';
import { verifyContract } from './etherscan-verification';
import { ATokenMock } from '../types/ATokenMock';
import { getDb, DRE } from './misc-utils';
import { DoubleTransferHelper } from '../types/DoubleTransferHelper';
import { zeroAddress } from 'ethereumjs-util';
import { ZERO_ADDRESS } from './constants';
import { Signer } from 'ethers';
import {
  GovernancePowerWithSnapshot,
  StakedTokenBptRev2,
  StakedTokenDataProvider,
  StakedTokenV3Rev3,
} from '../types';

export const deployStakedPSYS = async (
  [
    stakedToken,
    rewardsToken,
    cooldownSeconds,
    unstakeWindow,
    rewardsVault,
    emissionManager,
    distributionDuration,
  ]: [
    tEthereumAddress,
    tEthereumAddress,
    string,
    string,
    tEthereumAddress,
    tEthereumAddress,
    string
  ],
  verify?: boolean
) => {
  const id = eContractid.StakedPSYS;
  const args: string[] = [
    stakedToken,
    rewardsToken,
    cooldownSeconds,
    unstakeWindow,
    rewardsVault,
    emissionManager,
    distributionDuration,
  ];

  const instance = await deployContract<StakedPSYS>(id, args);
  if (verify) {
    await verifyContract(instance.address, args);
  }
  return instance;
};

export const deployStakedPSYSV3 = async (
  [
    stakedToken,
    rewardsToken,
    cooldownSeconds,
    unstakeWindow,
    rewardsVault,
    emissionManager,
    distributionDuration,
    governance,
  ]: [
    tEthereumAddress,
    tEthereumAddress,
    string,
    string,
    tEthereumAddress,
    tEthereumAddress,
    string,
    string
  ],
  verify?: boolean
) => {
  const id = eContractid.StakedPSYSV3;
  const args: string[] = [
    stakedToken,
    rewardsToken,
    cooldownSeconds,
    unstakeWindow,
    rewardsVault,
    emissionManager,
    distributionDuration,
    governance, // gov address
  ];
  const instance = await deployContract<StakedPSYSV3>(id, args);
  if (verify) {
    await verifyContract(instance.address, args);
  }
  return instance;
};

export const deployStakedTokenV3Revision3 = async (
  [
    stakedToken,
    rewardsToken,
    cooldownSeconds,
    unstakeWindow,
    rewardsVault,
    emissionManager,
    distributionDuration,
    name,
    symbol,
    decimals,
    governance,
  ]: [
    tEthereumAddress,
    tEthereumAddress,
    string,
    string,
    tEthereumAddress,
    tEthereumAddress,
    string,
    string,
    string,
    string,
    tEthereumAddress
  ],
  verify?: boolean,
  signer?: Signer
) => {
  const id = eContractid.StakedTokenV3Rev3;
  const args: string[] = [
    stakedToken,
    rewardsToken,
    cooldownSeconds,
    unstakeWindow,
    rewardsVault,
    emissionManager,
    distributionDuration,
    name,
    symbol,
    decimals,
    governance,
  ];
  const instance = await deployContract<StakedTokenV3Rev3>(id, args, '', signer);
  if (verify) {
    await verifyContract(instance.address, args);
  }
  return instance;
};

export const deployStakedTokenBptRevision2 = async (
  [
    stakedToken,
    rewardsToken,
    cooldownSeconds,
    unstakeWindow,
    rewardsVault,
    emissionManager,
    distributionDuration,
    name,
    symbol,
    decimals,
    governance,
  ]: [
    tEthereumAddress,
    tEthereumAddress,
    string,
    string,
    tEthereumAddress,
    tEthereumAddress,
    string,
    string,
    string,
    string,
    tEthereumAddress
  ],
  verify?: boolean,
  signer?: Signer
) => {
  const id = eContractid.StakedTokenBptRev2;
  const args: string[] = [
    stakedToken,
    rewardsToken,
    cooldownSeconds,
    unstakeWindow,
    rewardsVault,
    emissionManager,
    distributionDuration,
    name,
    symbol,
    decimals,
    governance,
  ];
  const instance = await deployContract<StakedTokenBptRev2>(id, args, '', signer);
  if (verify) {
    await verifyContract(instance.address, args);
  }
  return instance;
};

export const deployPegasysIncentivesController = async (
  [rewardToken, rewardsVault, pegasyspsm, extraPsmReward, emissionManager, distributionDuration]: [
    tEthereumAddress,
    tEthereumAddress,
    tEthereumAddress,
    string,
    tEthereumAddress,
    string
  ],
  verify?: boolean
) => {
  const id = eContractid.PegasysIncentivesController;
  const args: string[] = [
    rewardToken,
    rewardsVault,
    pegasyspsm,
    extraPsmReward,
    emissionManager,
    distributionDuration,
  ];
  const instance = await deployContract<PegasysIncentivesController>(id, args);
  await instance.deployTransaction.wait();
  if (verify) {
    await verifyContract(instance.address, args);
  }
  return instance;
};

export const deployMintableErc20 = async ([name, symbol, decimals]: [string, string, number]) =>
  await deployContract<MintableErc20>(eContractid.MintableErc20, [name, symbol, decimals]);

export const deployInitializableAdminUpgradeabilityProxy = async (
  verify?: boolean,
  signer?: Signer
) => {
  const id = eContractid.InitializableAdminUpgradeabilityProxy;
  const args: string[] = [];
  const instance = await deployContract<InitializableAdminUpgradeabilityProxy>(
    id,
    args,
    '',
    signer
  );
  await instance.deployTransaction.wait();
  if (verify) {
    await verifyContract(instance.address, args);
  }
  return instance;
};

export const deployMockTransferHook = async () =>
  await deployContract<MockTransferHook>(eContractid.MockTransferHook, []);

export const deployATokenMock = async (aicAddress: tEthereumAddress, slug: string) =>
  await deployContract<ATokenMock>(eContractid.ATokenMock, [aicAddress], slug);

export const deployDoubleTransferHelper = async (psysToken: tEthereumAddress, verify?: boolean) => {
  const id = eContractid.DoubleTransferHelper;
  const args = [psysToken];
  const instance = await deployContract<DoubleTransferHelper>(id, args);
  await instance.deployTransaction.wait();
  if (verify) {
    await verifyContract(instance.address, args);
  }
  return instance;
};

export const getMintableErc20 = getContractFactory<MintableErc20>(eContractid.MintableErc20);

export const getStakedPSYS = getContractFactory<StakedPSYS>(eContractid.StakedPSYS);
export const getStakedPSYSV3 = getContractFactory<StakedPSYSV3>(eContractid.StakedPSYSV3);

export const getStakedPSYSProxy = async (address?: tEthereumAddress) => {
  return await getContract<InitializableAdminUpgradeabilityProxy>(
    eContractid.InitializableAdminUpgradeabilityProxy,
    address ||
      (
        await getDb().get(`${eContractid.StakedPSYSV3}.${DRE.network.name}`).value()
      ).address
  );
};

export const getStakedPSYSImpl = async (address?: tEthereumAddress) => {
  return await getContract<StakedPSYSV3>(
    eContractid.StakedPSYSV3,
    address ||
      (
        await getDb().get(`${eContractid.StakedPSYSImpl}.${DRE.network.name}`).value()
      ).address
  );
};

export const getStakedTokenV3 = async (address?: tEthereumAddress) => {
  return await getContract<StakedPSYSV3>(
    eContractid.StakedTokenV3,
    address ||
      (
        await getDb().get(`${eContractid.StakedTokenV3}.${DRE.network.name}`).value()
      ).address
  );
};

export const getPegasysIncentivesController = getContractFactory<PegasysIncentivesController>(
  eContractid.PegasysIncentivesController
);

export const getIErc20Detailed = getContractFactory<IERC20Detailed>(eContractid.IERC20Detailed);

export const getATokenMock = getContractFactory<ATokenMock>(eContractid.ATokenMock);

export const getCRPFactoryContract = (address: tEthereumAddress) =>
  getContract<ICRPFactory>(eContractid.ICRPFactory, address);

export const getCRPContract = (address: tEthereumAddress) =>
  getContract<IConfigurableRightsPool>(eContractid.IConfigurableRightsPool, address);

export const getBpool = (address: tEthereumAddress) =>
  getContract<IBPool>(eContractid.IBPool, address);

export const getERC20Contract = (address: tEthereumAddress) =>
  getContract<MintableErc20>(eContractid.MintableErc20, address);

export const getController = (address: tEthereumAddress) =>
  getContract<IControllerPegasysEcosystemReserve>(
    eContractid.IControllerPegasysEcosystemReserve,
    address
  );

export const deploySelfDestruct = async () => {
  const id = eContractid.MockSelfDestruct;
  const instance = await deployContract<SelfdestructTransfer>(id, []);
  await instance.deployTransaction.wait();
  return instance;
};

export const deployPegasysStakingHelper = async (
  [addressStake, addressPegasys]: [tEthereumAddress, tEthereumAddress],
  verify?: boolean
) => {
  const id = eContractid.PegasysStakingHelper;
  const args: string[] = [addressStake, addressPegasys];

  const instance = await deployContract<PegasysStakingHelper>(id, args);
  if (verify) {
    await verifyContract(instance.address, args);
  }
  return instance;
};

export const deployStakeUIHelper = async (
  [priceOracle, bptPriceFeed, psys, stkPSYS, bpt, stkBpt]: [
    tEthereumAddress,
    tEthereumAddress,
    tEthereumAddress,
    tEthereumAddress,
    tEthereumAddress,
    tEthereumAddress
  ],
  verify?: boolean
) => {
  const id = eContractid.StakeUIHelper;
  const args: string[] = [priceOracle, bptPriceFeed, psys, stkPSYS, bpt, stkBpt];

  const instance = await deployContract<StakeUIHelper>(id, args);
  if (verify) {
    await verifyContract(instance.address, args);
  }
  return instance;
};

export const deployStakedTokenDataProvider = async (
  [stkAave, ethPriceFeed, aavePriceFeed]: [tEthereumAddress, tEthereumAddress, tEthereumAddress],
  verify?: boolean
) => {
  const id = eContractid.StakedTokenDataProvider;
  const args: string[] = [stkAave, ethPriceFeed, aavePriceFeed];

  const instance = await deployContract<StakedTokenDataProvider>(id, args);
  if (verify) {
    await verifyContract(instance.address, args);
  }
  return instance;
};
