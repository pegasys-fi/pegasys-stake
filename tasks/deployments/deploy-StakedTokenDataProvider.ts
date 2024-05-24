import { task } from 'hardhat/config';
import { eContractid } from '../../helpers/types';
import { getAddress } from 'ethers/lib/utils';
import { ZERO_ADDRESS } from '../../helpers/constants';
import { deployStakedTokenDataProvider } from '../../helpers/contracts-accessors';
import { checkVerification } from '../../helpers/etherscan-verification';
import { registerContractInJsonDb } from '../../helpers/contracts-helpers';

const { StakedTokenDataProvider, StakedPSYSV3 } = eContractid;

task(`deploy-${StakedTokenDataProvider}`, `Deploys the ${StakedTokenDataProvider} contract`)
  .addParam('stkPSYS', `The address of the ${StakedPSYSV3} contract`)
  .addParam('ethOracle', 'The address of the eth price feed contract')
  .addParam('psysOracle', 'The address of the psys price feed contract')
  .addFlag('verify', 'Verify StakedPSYSV3 contract via Etherscan API.')
  .setAction(
    async (
      {
        stkAave: stkAaveAddress,
        ethOracle: ethOracleAddress,
        psysOracle: psysOracleAddress,
        verify,
      },
      localBRE
    ) => {
      await localBRE.run('set-dre');
      if (verify) {
        checkVerification();
      }
      if (!stkAaveAddress || getAddress(stkAaveAddress) === ZERO_ADDRESS) {
        throw `address of stkAave contract is invalid`;
      }
      if (!ethOracleAddress || getAddress(ethOracleAddress) === ZERO_ADDRESS) {
        throw `address of ethOracle contract is invalid`;
      }
      if (!psysOracleAddress || getAddress(psysOracleAddress) === ZERO_ADDRESS) {
        throw `address of psysOracle contract is invalid`;
      }

      const stakedTokenDataProvider = await deployStakedTokenDataProvider(
        [stkAaveAddress, ethOracleAddress, psysOracleAddress],
        verify
      );

      await stakedTokenDataProvider.deployTransaction.wait();
      await registerContractInJsonDb(StakedTokenDataProvider, stakedTokenDataProvider);

      console.log('StakedTokenDataProvider deployed to ', stakedTokenDataProvider.address);
    }
  );
