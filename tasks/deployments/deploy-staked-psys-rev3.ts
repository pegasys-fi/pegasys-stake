import { Signer } from 'ethers';
import { task } from 'hardhat/config';
import { deployStakedTokenV3Revision3 } from '../../helpers/contracts-accessors';
import { getDefenderRelaySigner } from '../../helpers/defender-utils';
import { DRE } from '../../helpers/misc-utils';

task('deploy-staked-psys-rev3', 'Deploy implementation')
  .addFlag('defender')
  .setAction(async ({ defender }, localBRE: any) => {
    await localBRE.run('set-dre');

    let deployer: Signer;

    [deployer] = await DRE.ethers.getSigners();

    if (defender) {
      const { signer } = await getDefenderRelaySigner();
      deployer = signer;
    }

    // Deploy stkPSYS V2 Revision 3 implementation
    const StakedPSYSV3Revision3Implementation = await deployStakedTokenV3Revision3(
      [
        '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
        '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
        '864000',
        '172800',
        '0x25F2226B597E8F9514B3F68F00f494cF4f286491',
        '0xEE56e2B3D491590B5b31738cC34d5232F378a8D5',
        '3153600000', // 100 years from now
        'Staked PSYS',
        'stkPSYS',
        '18',
        '0x0000000000000000000000000000000000000000',
      ],
      true,
      deployer
    );

    return StakedPSYSV3Revision3Implementation.address;
  });
