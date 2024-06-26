import { task } from 'hardhat/config';
import { IPegasysGovernanceV2__factory } from '../../types';
import { Signer } from 'ethers';
import { getDefenderRelaySigner } from '../../helpers/defender-utils';
import { DRE } from '../../helpers/misc-utils';
import { MAX_UINT_AMOUNT } from '../../helpers/constants';

task('propose-vault-approval', 'Create some proposals and votes')
  .addParam('rewardsVaultController')
  .addParam('psysProxy')
  .addParam('stkPSYSProxy')
  .addParam('stkBptProxy')
  .addParam('pegasysGovernance')
  .addParam('shortExecutor')
  .addParam('ipfsHash')
  .addFlag('defender')
  .setAction(
    async (
      {
        rewardsVaultController,
        pegasysGovernance,
        shortExecutor,
        defender,
        stkPSYSProxy,
        stkBptProxy,
        psysProxy,
        ipfsHash,
      },
      localBRE: any
    ) => {
      await localBRE.run('set-dre');

      let proposer: Signer;
      [proposer] = await DRE.ethers.getSigners();

      if (defender) {
        const { signer } = await getDefenderRelaySigner();
        proposer = signer;
      }

      // Calldata for stkPSYS approval
      const payloadForstkPSYSApproval = DRE.ethers.utils.defaultAbiCoder.encode(
        ['address', 'address', 'uint256'],
        [psysProxy, stkPSYSProxy, MAX_UINT_AMOUNT]
      );
      // Calldata for StkBpt approval
      const payloadForStkBPTApproval = DRE.ethers.utils.defaultAbiCoder.encode(
        ['address', 'address', 'uint256'],
        [psysProxy, stkBptProxy, MAX_UINT_AMOUNT]
      );

      const executeSignature = 'approve(address,address,uint256)';
      const gov = await IPegasysGovernanceV2__factory.connect(pegasysGovernance, proposer);

      try {
        const tx = await gov.create(
          shortExecutor,
          [rewardsVaultController, rewardsVaultController],
          ['0', '0'],
          [executeSignature, executeSignature],
          [payloadForstkPSYSApproval, payloadForStkBPTApproval],
          [false, false],
          ipfsHash,
          { gasLimit: 1000000 }
        );
        await tx.wait();
        console.log('- Proposal submitted to Governance');
      } catch (error) {
        throw error;
      }
    }
  );
