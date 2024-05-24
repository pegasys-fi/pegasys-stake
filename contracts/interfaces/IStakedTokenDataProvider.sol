// SPDX-License-Identifier: MIT
pragma solidity ^0.7.5;
pragma experimental ABIEncoderV2;

/**
 * @title IStakedTokenDataProvider
 * @notice Basic interface of the Staked Token Data Provider
 */
interface IStakedTokenDataProvider {
  struct StakedTokenData {
    uint256 stakedTokenTotalSupply; // total supply of staked token
    uint256 stakedTokenTotalRedeemableAmount; // total redeemable amount of staked token
    uint256 stakeCooldownSeconds; // cooldown period of staked token denominated in seconds
    uint256 stakeUnstakeWindow; // unstake window of staked token denominated in seconds
    uint256 stakedTokenPriceUsd; // price of staked token denominated in USD
    uint256 rewardTokenPriceUsd; // price of reward token denominated in USD
    uint256 stakeApy; // apy(annual percentage yield) of staked token
    uint128 distributionPerSecond; // distribution of reward tokens per second
    bool inPostSlashingPeriod; // staked token in slashing period or not
    uint256 distributionEnd; // distribution end time
    uint256 maxSlashablePercentage; // max slashable percentage of the total staked amount
  }

  struct StakedTokenUserData {
    uint256 stakedTokenUserBalance; // user balance of staked token
    uint256 stakedTokenRedeemableAmount; // user redeemable amount of staked token
    uint256 underlyingTokenUserBalance; // underlying token balance of user
    uint256 rewardsToClaim; // total rewards balance of user
    uint40 userCooldownTimestamp; // cooldown timestamp of user
    uint216 userCooldownAmount; // amount available to unstake after cooldown timestamp for user
  }

  /**
   * @return The address of the ETH price feed, USD denominated, expressed with 8 decimals
   */
  function ETH_USD_PRICE_FEED() external view returns (address);

  /**
   * @return The address of the AAVE price feed, USD denominated, expressed with 8 decimals
   */
  function PSYS_USD_PRICE_FEED() external view returns (address);

  /**
   * @return The address of the StkAAVE token
   */
  function STAKED_PSYS() external view returns (address);

  /**
   * @notice Returns data of Staked asset
   * @param stakedAsset The address of the staked asset (eg. stkPSYS)
   * @param oracle The address of the oracle for the staked asset, USD denominated with 8 decimals
   * @return stakedAssetData struct with staked asset data
   */
  function getStakedAssetData(
    address stakedAsset,
    address oracle
  ) external view returns (StakedTokenData memory stakedAssetData);

  /**
   * @notice Retrieves staked token data and user-specific data for a given user, staked asset,
   *          and its associated oracle.
   * @param stakedAsset The address of the staked asset (eg. stkPSYS)
   * @param oracle The address of the oracle for the staked asset, USD denominated with 8 decimals
   * @param user The address of the user for whom the data is to be fetched.
   * @return stakedTokenData `StakedTokenData` struct with details about the staked asset.
   * @return stakedUserData `StakedTokenUserData` struct containing user-specific details related to the staked asset
   */
  function getStakedUserData(
    address stakedAsset,
    address oracle,
    address user
  )
    external
    view
    returns (StakedTokenData memory stakedTokenData, StakedTokenUserData memory stakedUserData);

  /**
   * notice Retrieves general data of a batch of staked assets
   * @param stakedAssets An array of addresses of staked assets.
   * @param oracles An array of oracle addresses for the staked assets, USD denominated with 8 decimals.
   * @return stakedData An array containing data about the staked assets.
   * @return ethPrice The price of ETH asset, USD denominated with 8 decimals.
   */
  function getStakedAssetDataBatch(
    address[] calldata stakedAssets,
    address[] calldata oracles
  ) external view returns (StakedTokenData[] memory stakedData, uint256 ethPrice);

  /**
   * @notice Retrieves general and user-specific data for a batch of staked assets.
   * @param stakedAssets An array of addresses of staked assets.
   * @param oracles An array of oracle addresses for the staked assets, USD denominated with 8 decimals.
   * @param user The address of the user to retrieve data from.
   * @return stakedTokenData An array containing data about the staked assets.
   * @return stakedUserData An array containing user-specific data about the staked assets.
   */
  function getStakedUserDataBatch(
    address[] calldata stakedAssets,
    address[] calldata oracles,
    address user
  )
    external
    view
    returns (StakedTokenData[] memory stakedTokenData, StakedTokenUserData[] memory stakedUserData);
}
