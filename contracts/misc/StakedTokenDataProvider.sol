// SPDX-License-Identifier: MIT
pragma solidity ^0.7.5;
pragma experimental ABIEncoderV2;

import {IERC20} from '../interfaces/IERC20.sol';
import {IAggregatedStakeToken} from '../interfaces/IAggregatedStakeToken.sol';
import {AggregatorInterface} from '../interfaces/AggregatorInterface.sol';
import {IStakedTokenDataProvider} from '../interfaces/IStakedTokenDataProvider.sol';
import {AggregatedStakedTokenV3} from '../interfaces/AggregatedStakedTokenV3.sol';

/**
 * @title StakedTokenDataProvider
 * @notice Data provider contract for Staked Tokens of the Safety Module (such as stkPSYS for staked PSYS in the safety module)
 */
contract StakedTokenDataProvider is IStakedTokenDataProvider {
  /// @inheritdoc IStakedTokenDataProvider
  address public immutable override ETH_USD_PRICE_FEED;

  /// @inheritdoc IStakedTokenDataProvider
  address public immutable override PSYS_USD_PRICE_FEED;

  /// @inheritdoc IStakedTokenDataProvider
  address public immutable override STAKED_PSYS;

  uint256 private constant SECONDS_PER_YEAR = 365 days;

  uint256 private constant APY_PRECISION = 10000;

  /**
   * @dev Constructor
   * @param stkPsys The address of the StkPSYS token
   * @param ethUsdPriceFeed The address of ETH price feed (USD denominated, with 8 decimals)
   * @param pegasysUsdPriceFeed The address of PSYS price feed (USD denominated, with 8 decimals)
   */
  constructor(address stkPsys, address ethUsdPriceFeed, address pegasysUsdPriceFeed) {
    STAKED_PSYS = stkPsys;
    ETH_USD_PRICE_FEED = ethUsdPriceFeed;
    PSYS_USD_PRICE_FEED = pegasysUsdPriceFeed;
  }

  /// @inheritdoc IStakedTokenDataProvider
  function getStakedAssetData(
    address stakedAsset,
    address oracle
  ) external view override returns (StakedTokenData memory) {
    return _getStakedTokenData(stakedAsset, oracle);
  }

  /// @inheritdoc IStakedTokenDataProvider
  function getStakedUserData(
    address stakedAsset,
    address oracle,
    address user
  ) external view override returns (StakedTokenData memory, StakedTokenUserData memory) {
    return (_getStakedTokenData(stakedAsset, oracle), _getStakedTokenUserData(stakedAsset, user));
  }

  /// @inheritdoc IStakedTokenDataProvider
  function getStakedAssetDataBatch(
    address[] calldata stakedAssets,
    address[] calldata oracles
  ) external view override returns (StakedTokenData[] memory, uint256) {
    require(stakedAssets.length == oracles.length, 'Arrays must be of the same length');

    StakedTokenData[] memory stakedData = new StakedTokenData[](stakedAssets.length);
    uint256 ethPrice = uint256(AggregatorInterface(ETH_USD_PRICE_FEED).latestAnswer());
    for (uint256 i = 0; i < stakedAssets.length; i++) {
      stakedData[i] = _getStakedTokenData(stakedAssets[i], oracles[i]);
    }
    return (stakedData, ethPrice);
  }

  /// @inheritdoc IStakedTokenDataProvider
  function getStakedUserDataBatch(
    address[] calldata stakedAssets,
    address[] calldata oracles,
    address user
  ) external view override returns (StakedTokenData[] memory, StakedTokenUserData[] memory) {
    require(stakedAssets.length == oracles.length, 'All arrays must be of the same length');
    StakedTokenData[] memory stakedData = new StakedTokenData[](stakedAssets.length);
    StakedTokenUserData[] memory userData = new StakedTokenUserData[](stakedAssets.length);

    for (uint256 i = 0; i < stakedAssets.length; i++) {
      stakedData[i] = _getStakedTokenData(stakedAssets[i], oracles[i]);
      userData[i] = _getStakedTokenUserData(stakedAssets[i], user);
    }
    return (stakedData, userData);
  }

  /**
   * @notice Returns data of the Staked Token passed as parameter
   * @param stakedToken The address of the StakedToken (eg. stkPsys)
   * @param oracle The address of the oracle associated of the staked token, USD denominated with 8 decimals
   * @return data An object with general data of the StakedToken
   */
  function _getStakedTokenData(
    address stakedToken,
    address oracle
  ) internal view returns (StakedTokenData memory data) {
    IAggregatedStakeToken stkToken = IAggregatedStakeToken(stakedToken);
    data.stakedTokenTotalSupply = stkToken.totalSupply();
    data.stakedTokenTotalRedeemableAmount = stkToken.previewRedeem(data.stakedTokenTotalSupply);
    data.stakeCooldownSeconds = stkToken.getCooldownSeconds();
    data.stakeUnstakeWindow = stkToken.UNSTAKE_WINDOW();
    data.rewardTokenPriceUsd = uint256(AggregatorInterface(PSYS_USD_PRICE_FEED).latestAnswer());
    // TODO: data.maxSlashablePercentage = stkToken.getMaxSlashablePercentage();
    try AggregatedStakedTokenV3(stakedToken).DISTRIBUTION_END() returns (uint256 distributionEnd) {
      data.distributionEnd = distributionEnd;
    } catch {
      try stkToken.distributionEnd() returns (uint256 distributionEnd) {
        data.distributionEnd = distributionEnd;
      } catch {}
    }
    // TODO: data.inPostSlashingPeriod = stkToken.inPostSlashingPeriod();
    (uint128 emissionPerSecond, , ) = stkToken.assets(address(stakedToken));
    data.distributionPerSecond = block.timestamp < data.distributionEnd ? emissionPerSecond : 0;

    // stkPsys
    if (address(stakedToken) == STAKED_PSYS) {
      data.stakedTokenPriceUsd = data.rewardTokenPriceUsd;
      // assumes PSYS and stkPSYS have the same value
      data.stakeApy = _calculateApy(data.distributionPerSecond, data.stakedTokenTotalSupply);
    } else {
      // other wrapped assets
      data.stakedTokenPriceUsd = uint256(AggregatorInterface(oracle).latestAnswer());
      data.stakeApy = _calculateApy(
        data.distributionPerSecond * data.rewardTokenPriceUsd,
        data.stakedTokenTotalSupply * data.stakedTokenPriceUsd
      );
    }
  }

  /**
   * @notice Returns user data of the Staked Token
   * @param stakedToken The address of the StakedToken asset
   * @param user The address of the user
   * @return data struct containing user-specific details related to the staked asset
   */
  function _getStakedTokenUserData(
    address stakedToken,
    address user
  ) internal view returns (StakedTokenUserData memory data) {
    IAggregatedStakeToken stkToken = IAggregatedStakeToken(stakedToken);
    data.stakedTokenUserBalance = stkToken.balanceOf(user);
    data.rewardsToClaim = stkToken.getTotalRewardsBalance(user);
    data.underlyingTokenUserBalance = IERC20(stkToken.STAKED_TOKEN()).balanceOf(user);
    data.stakedTokenRedeemableAmount = stkToken.previewRedeem(data.stakedTokenUserBalance);
    data.userCooldownTimestamp = stkToken.stakersCooldowns(user);
  }

  /**
   * @notice Calculates the APY of the reward distribution among StakedToken holders
   * @dev It uses the value of the reward and StakedToken asset
   * @param distributionPerSecond The value of the rewards being distributed per second
   * @param stakedTokenTotalSupply The value of the total supply of StakedToken asset
   * @return the APY of the reward distribution among StakedToken holders
   */
  function _calculateApy(
    uint256 distributionPerSecond,
    uint256 stakedTokenTotalSupply
  ) internal pure returns (uint256) {
    if (stakedTokenTotalSupply == 0) return 0;
    return (distributionPerSecond * SECONDS_PER_YEAR * APY_PRECISION) / stakedTokenTotalSupply;
  }
}
