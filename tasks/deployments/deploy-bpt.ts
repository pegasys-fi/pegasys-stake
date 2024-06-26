// import { task } from 'hardhat/config';
// import { parseEther } from 'ethers/lib/utils';

// import { eContractid, eEthereumNetwork, tEthereumAddress } from '../../helpers/types';
// import { StakedTokenV3 } from '../../types/StakedTokenV3';
// import { InitializableAdminUpgradeabilityProxy } from '../../types/InitializableAdminUpgradeabilityProxy';
// import { verifyContract } from '../../helpers/etherscan-verification';
// import {
//   UPGRADABLE_CRP_FACTORY,
//   WETH,
//   PSYS_TOKEN,
//   RESERVE_CONTROLER,
//   REWARDS_VAULT,
//   SHORT_EXECUTOR,
//   ZERO_ADDRESS,
//   BPOOL_FACTORY,
//   CRP_IMPLEMENTATION,
//   LONG_EXECUTOR,
//   MAX_UINT_AMOUNT,
//   PROXY_CRP_ADMIN,
//   PSYS_GOVERNANCE_V2,
// } from '../../helpers/constants';
// import {
//   getCRPFactoryContract,
//   deployStakedTokenV3,
//   getCRPContract,
//   getBpool,
//   getStakedTokenV3,
//   getERC20Contract,
//   getController,
//   deploySelfDestruct,
//   deployInitializableAdminUpgradeabilityProxy,
// } from '../../helpers/contracts-accessors';
// import { waitForTx } from '../../helpers/misc-utils';
// import { checkVerification } from '../../helpers/etherscan-verification';

// const { ICRPFactory } = eContractid;
// const INFINITE_APPROVAL_AMOUNT = MAX_UINT_AMOUNT;
// const RESERVER_ALLOWANCE = parseEther('100000');
// const PSYS_WEIGHT = parseEther('40'); // 80 %
// const WETH_WEIGHT = parseEther('10'); // 20 %
// const INIT_PSYS_PRICE = 502; // 1 ETH = 5.02 PSYS
// const PRICE_PRECISION = 100;
// const INIT_TOKEN_SUPPLY_DIVIDER = 100;

// //
// const COOLDOWN_SECONDS = '864000'; // 10 days
// const UNSTAKE_WINDOW = '172800'; // 2 days
// const DISTRIBUTION_DURATION = '15780000'; // 6 month
// const EMISSION_MANAGER = SHORT_EXECUTOR;

// // INIT PSYS SUPPLY = 40 / 100 = 0.4
// const INIT_PSYS_POOL_SUPPLY = PSYS_WEIGHT.div(INIT_TOKEN_SUPPLY_DIVIDER);
// const INIT_WETH_POOL_SUPPLY = WETH_WEIGHT.div(INIT_TOKEN_SUPPLY_DIVIDER)
//   .div(INIT_PSYS_PRICE)
//   .mul(PRICE_PRECISION);
// // Requirement: 1000 BPT = aprox 1 PSYS. 500 shares for 0.4 PSYS + 0.1 PSYS worth of WETH
// const INIT_SHARE_SUPPLY = INIT_PSYS_POOL_SUPPLY.mul(10).div(8).mul(1000);
// // 0.1 %
// const SWAP_FEE = parseEther('0.04');

// task(`deploy-CRP`, `Deploys the Configurabl Righ Pool PSYS/WETH`)
//   .addFlag('verify', 'Verify StakedPSYS contract via Etherscan API.')
//   .setAction(async ({ verify }, localBRE) => {
//     await localBRE.run('set-dre');

//     if (verify) {
//       checkVerification();
//     }

//     if (!localBRE.network.config.chainId) {
//       throw new Error('INVALID_CHAIN_ID');
//     }

//     const [, , , , signer] = await localBRE.ethers.getSigners();
//     console.log(await signer.getAddress());
//     const network = localBRE.network.name as eEthereumNetwork;

//     console.log(`\n- CRP deployment`);

//     const CRPFactory = await getCRPFactoryContract(UPGRADABLE_CRP_FACTORY);
//     const psys = await getERC20Contract(PSYS_TOKEN);
//     const weth = await getERC20Contract(WETH);

//     await waitForTx(
//       await CRPFactory.connect(signer).newCrp(
//         BPOOL_FACTORY,
//         {
//           poolTokenSymbol: 'ABPT',
//           poolTokenName: 'Pegasys Balance Pool Token',
//           constituentTokens: [PSYS_TOKEN, WETH],
//           tokenBalances: [INIT_PSYS_POOL_SUPPLY, INIT_WETH_POOL_SUPPLY],
//           tokenWeights: [PSYS_WEIGHT, WETH_WEIGHT],
//           swapFee: SWAP_FEE,
//         },
//         {
//           canPauseSwapping: true,
//           canChangeSwapFee: true,
//           canChangeWeights: true,
//           canAddRemoveTokens: true,
//           canWhitelistLPs: false,
//           canChangeCap: true,
//         },
//         CRP_IMPLEMENTATION,
//         PROXY_CRP_ADMIN
//       )
//     );
//     let CRPAddress = ZERO_ADDRESS;
//     CRPFactory.on(
//       CRPFactory.filters.LogNewCrp(await signer.getAddress(), null),
//       async (sender, pool) => {
//         CRPAddress = pool;
//         console.log('ADDRESS CRP DEPLOYED', CRPAddress);
//       }
//     );
//     while (CRPAddress == ZERO_ADDRESS) {
//       await new Promise<void>((res) => {
//         setTimeout(async () => {
//           res();
//         }, 100);
//       });
//     }
//     const CRPool = await getCRPContract(CRPAddress);
//     console.log('APPROVING PSYS', CRPAddress);
//     await waitForTx(await psys.connect(signer).approve(CRPool.address, INFINITE_APPROVAL_AMOUNT));
//     console.log('APPROVING WETH', CRPAddress);
//     await waitForTx(await weth.connect(signer).approve(CRPool.address, INFINITE_APPROVAL_AMOUNT));
//     console.log('CREATING POOL', CRPAddress);
//     await waitForTx(await CRPool.connect(signer).createPool(INIT_SHARE_SUPPLY));
//     console.log('DISABLING SWAPS', CRPAddress);
//     await waitForTx(await CRPool.connect(signer).setPublicSwap(false));
//     const stakedBPS = await deployStakedTokenV3(
//       [
//         CRPool.address,
//         PSYS_TOKEN,
//         COOLDOWN_SECONDS,
//         UNSTAKE_WINDOW,
//         REWARDS_VAULT,
//         EMISSION_MANAGER,
//         DISTRIBUTION_DURATION,
//         'PSYS stakedToken',
//         'stkToken',
//         '18',
//         PSYS_GOVERNANCE_V2,
//       ],
//       true,
//       signer
//     );
//   });
