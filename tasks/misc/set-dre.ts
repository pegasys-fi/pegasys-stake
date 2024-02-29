import { formatEther } from 'ethers/lib/utils';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DRE, setDRE } from '../../helpers/misc-utils';

task(`set-dre`, `Inits the DRE, to have access to all the plugins' objects`).setAction(
  async (_, _DRE) => {
    if (DRE.config) {
      return;
    }

    await setDRE(_DRE);
    return _DRE;
  }
);
