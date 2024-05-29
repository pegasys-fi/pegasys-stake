// SPDX-License-Identifier: MIT
pragma solidity 0.7.5;
pragma experimental ABIEncoderV2;

/**
 * @title IStakedTokenDataProvider
 * @notice It defines the basic interface of the Staked Token Data Provider
 */
interface IStakedTokenDataProvider {
  struct StakedTokenData {
    uint256 stakedTokenTotalSupply;
    uint256 stakedTokenTotalRedeemableAmount;
    uint256 stakeCooldownSeconds;
    uint256 stakeUnstakeWindow;
    uint256 stakedTokenPriceEth;
    uint256 rewardTokenPriceEth;
    uint256 stakeApy;
    uint128 distributionPerSecond;
    uint256 distributionEnd;
  }

  struct StakedTokenUserData {
    uint256 stakedTokenUserBalance;
    uint256 stakedTokenRedeemableAmount;
    uint256 underlyingTokenUserBalance;
    uint256 rewardsToClaim;
    uint40 userCooldownTimestamp;
    uint216 userCooldownAmount;
  }

  /**
   * @notice Return the address of the ETH price feed, USD denominated
   * @return The address of the ETH price feed, USD denominated, expressed with 8 decimals
   */
  function ETH_USD_PRICE_FEED() external returns (address);

  /**
   * @notice Return the address of the PSYS price feed, ETH denominated
   * @return The address of the PSYS price feed, ETH denominated, expressed with 18 decimals
   */
  function PSYS_USD_PRICE_FEED() external view returns (address);

  /**
   * @notice Return the address of the Staked PSYS token
   * @return The address of the StkPSYS token
   */
  function STAKED_PSYS() external returns (address);

  /**
   * @notice Returns data of all Staked Tokens
   * @return stkPSYSData An object with stkPSYS data
   * @return stkBptData An object with StkBpt data
   * @return ethPrice The price of ETH, USD denominated (expressed with 8 decimals)
   */
  function getAllStakedTokenData()
    external
    view
    returns (
      StakedTokenData memory stkPSYSData,
      StakedTokenData memory stkBptData,
      uint256 ethPrice
    );

  /**
   * @notice Returns data of Staked PSYS
   * @return stakedAssetData An object with stkPSYS data
   */
  function getStakedAssetData(
    address stakedAsset,
    address oracle
  ) external view returns (StakedTokenData memory stakedAssetData);

  /**
   * @notice Returns user data of all Staked Tokens
   * @param user The address of the user
   * @return stkPSYSData An object with stkPSYS data
   * @return stkPSYSUserData An object with user data of stkPSYS
   * @return stkBptData An object with StkBpt data
   * @return stkBptUserData An object with user data of StkBpt
   * @return ethPrice The price of ETH, USD denominated (expressed with 8 decimals)
   */
  function getAllStakedTokenUserData(
    address user
  )
    external
    view
    returns (
      StakedTokenData memory stkPSYSData,
      StakedTokenUserData memory stkPSYSUserData,
      StakedTokenData memory stkBptData,
      StakedTokenUserData memory stkBptUserData,
      uint256 ethPrice
    );

  /**
   * @notice Returns user data of Staked PSYS
   * @param user The address of the user
   * @return stkPSYSData An object with stkPSYS data
   * @return stkPSYSUserData An object with user data of stkPSYS
   */
  function getstkPSYSUserData(
    address user
  )
    external
    view
    returns (StakedTokenData memory stkPSYSData, StakedTokenUserData memory stkPSYSUserData);
}
