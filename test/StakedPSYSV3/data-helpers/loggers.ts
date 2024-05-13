import { tEthereumAddress } from '../../../helpers/types';
import { MintableErc20 } from '../../../types/MintableErc20';
import { StakedPSYS } from '../../../types/StakedPSYS';

export const logPSYStokenBalanceOf = async (
  account: tEthereumAddress,
  psysToken: MintableErc20
) => {
  console.log(
    `[psysToken.balanceOf(${account})]: ${(await psysToken.balanceOf(account)).toString()}`
  );
};

export const logStakedPSYSBalanceOf = async (
  staker: tEthereumAddress,
  StakedPSYSV3: StakedPSYS
) => {
  console.log(
    `[StakedPSYSV3.balanceOf(${staker})]: ${(await StakedPSYSV3.balanceOf(staker)).toString()}`
  );
};

export const logGetStakeTotalRewardsBalance = async (
  staker: tEthereumAddress,
  StakedPSYSV3: StakedPSYS
) => {
  console.log(
    `[StakedPSYSV3.getTotalRewardsBalance(${staker})]: ${(
      await StakedPSYSV3.getTotalRewardsBalance(staker)
    ).toString()}`
  );
};

export const logRewardPerStakedPSYS = async (StakedPSYSV3: StakedPSYS) => {
  console.log(
    `[StakedPSYSV3.getRewardPerStakedPSYS()]: ${(
      await StakedPSYSV3.getRewardPerStakedPSYS()
    ).toString()}`
  );
};
