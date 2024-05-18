import { Signer } from 'ethers';
import {
  PSM_STAKER_PREMIUM,
  COOLDOWN_SECONDS,
  UNSTAKE_WINDOW,
  STAKED_PSYS_NAME,
  STAKED_PSYS_SYMBOL,
  STAKED_PSYS_DECIMALS,
  MAX_UINT_AMOUNT,
  ZERO_ADDRESS,
} from '../../helpers/constants';
import {
  deployInitializableAdminUpgradeabilityProxy,
  deployPegasysIncentivesController,
  deployStakedPSYS,
  deployMockTransferHook,
  deployStakedPSYSV3,
} from '../../helpers/contracts-accessors';
import { insertContractAddressInDb } from '../../helpers/contracts-helpers';
import { waitForTx } from '../../helpers/misc-utils';
import { eContractid } from '../../helpers/types';
import { MintableErc20 } from '../../types/MintableErc20';

export const testDeploypsysStakeV1 = async (
  psysToken: MintableErc20,
  deployer: Signer,
  vaultOfRewards: Signer,
  restWallets: Signer[]
) => {
  const proxyAdmin = await restWallets[0].getAddress();
  const emissionManager = await deployer.getAddress();

  const stakedToken = psysToken.address;
  const rewardsToken = psysToken.address;

  const vaultOfRewardsAddress = await vaultOfRewards.getAddress();

  const pegasysIncentivesControllerProxy = await deployInitializableAdminUpgradeabilityProxy();
  const StakedPSYSProxy = await deployInitializableAdminUpgradeabilityProxy();

  const pegasysIncentivesControllerImplementation = await deployPegasysIncentivesController([
    psysToken.address,
    vaultOfRewardsAddress,
    StakedPSYSProxy.address,
    PSM_STAKER_PREMIUM,
    emissionManager,
    (1000 * 60 * 60).toString(),
  ]);

  const StakedPSYSImpl = await deployStakedPSYS([
    stakedToken,
    rewardsToken,
    COOLDOWN_SECONDS,
    UNSTAKE_WINDOW,
    vaultOfRewardsAddress,
    emissionManager,
    (1000 * 60 * 60).toString(),
  ]);

  const mockTransferHook = await deployMockTransferHook();

  const StakedPSYSEncodedInitialize = StakedPSYSImpl.interface.encodeFunctionData('initialize', [
    mockTransferHook.address,
    STAKED_PSYS_NAME,
    STAKED_PSYS_SYMBOL,
    STAKED_PSYS_DECIMALS,
  ]);
  await StakedPSYSProxy['initialize(address,address,bytes)'](
    StakedPSYSImpl.address,
    proxyAdmin,
    StakedPSYSEncodedInitialize
  );
  await waitForTx(
    await psysToken.connect(vaultOfRewards).approve(StakedPSYSProxy.address, MAX_UINT_AMOUNT)
  );
  await insertContractAddressInDb(eContractid.StakedPSYS, StakedPSYSProxy.address);

  const peiEncodedInitialize =
    pegasysIncentivesControllerImplementation.interface.encodeFunctionData('initialize');
  await pegasysIncentivesControllerProxy['initialize(address,address,bytes)'](
    pegasysIncentivesControllerImplementation.address,
    proxyAdmin,
    peiEncodedInitialize
  );
  await waitForTx(
    await psysToken
      .connect(vaultOfRewards)
      .approve(pegasysIncentivesControllerProxy.address, MAX_UINT_AMOUNT)
  );
  await insertContractAddressInDb(
    eContractid.PegasysIncentivesController,
    pegasysIncentivesControllerProxy.address
  );

  return {
    pegasysIncentivesControllerProxy,
    StakedPSYSProxy,
  };
};

export const testDeploypsysStakeV2 = async (
  psysToken: MintableErc20,
  deployer: Signer,
  vaultOfRewards: Signer,
  restWallets: Signer[]
) => {
  const stakedToken = psysToken.address;
  const rewardsToken = psysToken.address;
  const emissionManager = await deployer.getAddress();
  const vaultOfRewardsAddress = await vaultOfRewards.getAddress();

  const { StakedPSYSProxy } = await testDeploypsysStakeV1(
    psysToken,
    deployer,
    vaultOfRewards,
    restWallets
  );

  const StakedPSYSImpl = await deployStakedPSYSV3([
    stakedToken,
    rewardsToken,
    COOLDOWN_SECONDS,
    UNSTAKE_WINDOW,
    vaultOfRewardsAddress,
    emissionManager,
    (1000 * 60 * 60).toString(),
    ZERO_ADDRESS,
  ]);

  const StakedPSYSEncodedInitialize = StakedPSYSImpl.interface.encodeFunctionData('initialize');

  await StakedPSYSProxy.connect(restWallets[0]).upgradeToAndCall(
    StakedPSYSImpl.address,
    StakedPSYSEncodedInitialize
  );

  await insertContractAddressInDb(eContractid.StakedPSYSV3, StakedPSYSProxy.address);

  return {
    StakedPSYSProxy,
  };
};
