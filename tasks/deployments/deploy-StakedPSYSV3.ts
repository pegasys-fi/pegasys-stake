import { task } from 'hardhat/config';

import { eContractid, eEthereumNetwork, tEthereumAddress } from '../../helpers/types';
import { registerContractInJsonDb } from '../../helpers/contracts-helpers';
import {
  getPSYStokenPerNetwork,
  getCooldownSecondsPerNetwork,
  getUnstakeWindowPerNetwork,
  getPegasysAdminPerNetwork,
  getDistributionDurationPerNetwork,
  getPegasysIncentivesVaultPerNetwork,
  PSYS_GOVERNANCE_V2,
} from '../../helpers/constants';
import {
  deployStakedPSYSV3,
  deployInitializableAdminUpgradeabilityProxy,
} from '../../helpers/contracts-accessors';
import { checkVerification } from '../../helpers/etherscan-verification';
import { constants } from 'buffer';
const { StakedPSYSV3 } = eContractid;

task(`deploy-${StakedPSYSV3}`, `Deploys the ${StakedPSYSV3} contract`)
  .addFlag('verify', 'Verify StakedPSYS contract via Etherscan API.')
  .addOptionalParam(
    'vaultAddress',
    'Use PegasysIncentivesVault address by param instead of configuration.'
  )
  .addOptionalParam('psysAddress', 'Use psysToken address by param instead of configuration.')
  .setAction(async ({ verify, vaultAddress, psysAddress }, localBRE) => {
    await localBRE.run('set-dre');

    // If Etherscan verification is enabled, check needed enviroments to prevent loss of gas in failed deployments.
    if (verify) {
      checkVerification();
    }

    if (!localBRE.network.config.chainId) {
      throw new Error('INVALID_CHAIN_ID');
    }

    const network = localBRE.network.name as eEthereumNetwork;

    console.log(`\n- ${network} network`);
    console.log(`\n- ${StakedPSYSV3} deployment`);

    console.log(`\tDeploying ${StakedPSYSV3} implementation ...`);
    const StakedPSYSImpl = await deployStakedPSYSV3(
      [
        psysAddress || getPSYStokenPerNetwork(network),
        psysAddress || getPSYStokenPerNetwork(network),
        getCooldownSecondsPerNetwork(network),
        getUnstakeWindowPerNetwork(network),
        vaultAddress || getPegasysIncentivesVaultPerNetwork(network),
        getPegasysAdminPerNetwork(network),
        getDistributionDurationPerNetwork(network),
        PSYS_GOVERNANCE_V2,
      ],
      false // disable verify due not supported by current buidler etherscan plugin
    );
    await StakedPSYSImpl.deployTransaction.wait();
    await registerContractInJsonDb(await StakedPSYSImpl.name(), StakedPSYSImpl);
    console.log(`\tDeploying ${StakedPSYSV3} Transparent Proxy ...`);

    const StakedPSYSProxy = await deployInitializableAdminUpgradeabilityProxy(verify);
    await registerContractInJsonDb(StakedPSYSV3, StakedPSYSProxy);

    console.log(`\tFinished ${StakedPSYSV3} proxy and implementation deployment`);
    console.log('StakePSYSProxy deployed to', StakedPSYSProxy.address);
  });
