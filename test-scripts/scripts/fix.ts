import { Transaction, UpgradePolicy } from "@mysten/sui/transactions";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { execSync } from "child_process";
import { Constants } from "./helper/constants";
import { normalizeSuiObjectId } from "@mysten/sui/utils";
import { Utils } from "./helper/utils";
import { writeToml} from "./helper/toml";
import {GetTransactionBlockParams} from "@mysten/sui/client"
import path from "path";

const deepbookSourcesPath = path.join(__dirname, "../../deepbookv3/packages/deepbook");
const tokenSourcesPath = path.join(__dirname, "../../deepbookv3/packages/token");
const usdcSourcesPath = path.join(__dirname, "../../deepbookv3/packages/usdc");
const spamSourcesPath = path.join(__dirname, "../../deepbookv3/packages/spam");
const suiiSourcesPath = path.join(__dirname, "../../deepbookv3/packages/suii");

const POOL_CREATION_FEE= 10000 * 1_000_000; // 10000 DEEP
const FLOAT_SCALING = 1_000_000_000;
const HALF = 500_000_000;
const DEEP_UNIT = 1_000_000;
const MAKER_FEE = 500000;
const TAKER_FEE = 1000000;
const STABLE_MAKER_FEE = 50000;
const STABLE_TAKER_FEE = 100000;
const TICK_SIZE = 1000;
const LOT_SIZE = 1000;
const MIN_SIZE = 10000;
const STARTING_BALANCE = 10000 * FLOAT_SCALING;

const MAX_U64 = 9223372036854775808;

const NO_RESTRICTION = 0;
const IMMEDIATE_OR_CANCEL = 1;
const FILL_OR_KILL = 2;
const POST_ONLY = 3;
const MAX_RESTRICTION = 3;

const SELF_MATCHING_ALLOWED = 0;
const CANCEL_TAKER = 1;
const CANCEL_MAKER = 2;

const client = Utils.provider;

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const deepbookDeploy = async (signer: Ed25519Keypair) => {
    const signerAddress = signer.toSuiAddress();
    const compiledModulesAndDependencies = JSON.parse(
        execSync(Constants.getBuildCommand() + " --path " + deepbookSourcesPath, {
            encoding: "utf-8",
        })
    );

    const tx = new Transaction();

    tx.setGasBudget(Constants.GAS_BUDGET);

    const res = tx.publish({
        modules: compiledModulesAndDependencies.modules.map((m) =>
            Array.from(Buffer.from(m, "base64"))
        ),
        dependencies: compiledModulesAndDependencies.dependencies.map((addr) =>
            normalizeSuiObjectId(addr)
        ),
    });

    tx.transferObjects([res], tx.pure.address(signerAddress));

    const provider = Utils.provider;

    const result = await provider.signAndExecuteTransaction({
        transaction: tx,
        signer: signer,
        options: { showObjectChanges: true },
    });

    // console.log(result);

    const packageId = result.objectChanges?.find((change) => {
        return change.type === "published";
    })?.["packageId"];

    const upgradeCap = result.objectChanges?.find((change) => {
        return change.type === "created" && change.objectType.includes("UpgradeCap") ;
    })?.["objectId"];

    const registry = result.objectChanges?.find((change) => {
        return change.type === "created" && change.objectType.includes("Registry") && !change.objectType.includes("Inner");
    })?.["objectId"];

    const deepbookAdminCap = result.objectChanges?.find((change) => {
        return change.type === "created" && change.objectType.includes("DeepbookAdminCap") ;
    })?.["objectId"];

    return [packageId, upgradeCap, registry, deepbookAdminCap];
};

const tokenDeploy = async (signer: Ed25519Keypair) => {
    const signerAddress = signer.toSuiAddress();
    const compiledModulesAndDependencies = JSON.parse(
        execSync(Constants.getBuildCommand() + " --path " + tokenSourcesPath, {
            encoding: "utf-8",
        })
    );

    const tx = new Transaction();

    tx.setGasBudget(Constants.GAS_BUDGET);

    const res = tx.publish({
        modules: compiledModulesAndDependencies.modules.map((m) =>
            Array.from(Buffer.from(m, "base64"))
        ),
        dependencies: compiledModulesAndDependencies.dependencies.map((addr) =>
            normalizeSuiObjectId(addr)
        ),
    });

    tx.transferObjects([res], tx.pure.address(signerAddress));

    const provider = Utils.provider;

    const result = await provider.signAndExecuteTransaction({
        transaction: tx,
        signer: signer,
        options: { showObjectChanges: true },
    });

    // console.log(result);

    const packageId = result.objectChanges?.find((change) => {
        return change.type === "published";
    })?.["packageId"];

    const upgradeCap = result.objectChanges?.find((change) => {
        return change.type === "created" && change.objectType.includes("UpgradeCap") ;
    })?.["objectId"];

    const protectedTreasury = result.objectChanges?.find((change) => {
        return change.type === "created" && change.objectType.includes("ProtectedTreasury") ;
    })?.["objectId"];

    const deepCoin = result.objectChanges?.find((change) => {
        return change.type === "created" && change.objectType.includes("Coin") && change.objectType.includes("DEEP") && !change.objectType.includes("Meta");
    })?.["objectId"];


    return [packageId, upgradeCap, protectedTreasury, deepCoin];
};

const usdcDeploy = async (signer: Ed25519Keypair) => {
    const signerAddress = signer.toSuiAddress();
    const compiledModulesAndDependencies = JSON.parse(
        execSync(Constants.getBuildCommand() + " --path " + usdcSourcesPath, {
            encoding: "utf-8",
        })
    );

    const tx = new Transaction();

    tx.setGasBudget(Constants.GAS_BUDGET);

    const res = tx.publish({
        modules: compiledModulesAndDependencies.modules.map((m) =>
            Array.from(Buffer.from(m, "base64"))
        ),
        dependencies: compiledModulesAndDependencies.dependencies.map((addr) =>
            normalizeSuiObjectId(addr)
        ),
    });

    tx.transferObjects([res], tx.pure.address(signerAddress));

    const provider = Utils.provider;

    const result = await provider.signAndExecuteTransaction({
        transaction: tx,
        signer: signer,
        options: { showObjectChanges: true },
    });

    // console.log(result);

    const packageId = result.objectChanges?.find((change) => {
        return change.type === "published";
    })?.["packageId"];

    const upgradeCap = result.objectChanges?.find((change) => {
        return change.type === "created" && change.objectType.includes("UpgradeCap") ;
    })?.["objectId"];

    const protectedTreasury = result.objectChanges?.find((change) => {
        return change.type === "created" && change.objectType.includes("ProtectedTreasury") ;
    })?.["objectId"];

    const usdcCoin = result.objectChanges?.find((change) => {
        return change.type === "created" && change.objectType.includes("Coin") && change.objectType.includes("USDC") && !change.objectType.includes("Meta");
    })?.["objectId"];

    return [packageId, upgradeCap, protectedTreasury, usdcCoin];
};

const spamDeploy = async (signer: Ed25519Keypair) => {
    const signerAddress = signer.toSuiAddress();
    const compiledModulesAndDependencies = JSON.parse(
        execSync(Constants.getBuildCommand() + " --path " + spamSourcesPath, {
            encoding: "utf-8",
        })
    );

    const tx = new Transaction();

    tx.setGasBudget(Constants.GAS_BUDGET);

    const res = tx.publish({
        modules: compiledModulesAndDependencies.modules.map((m) =>
            Array.from(Buffer.from(m, "base64"))
        ),
        dependencies: compiledModulesAndDependencies.dependencies.map((addr) =>
            normalizeSuiObjectId(addr)
        ),
    });

    tx.transferObjects([res], tx.pure.address(signerAddress));

    const provider = Utils.provider;

    const result = await provider.signAndExecuteTransaction({
        transaction: tx,
        signer: signer,
        options: { showObjectChanges: true },
    });

    // console.log(result);

    const packageId = result.objectChanges?.find((change) => {
        return change.type === "published";
    })?.["packageId"];

    const upgradeCap = result.objectChanges?.find((change) => {
        return change.type === "created" && change.objectType.includes("UpgradeCap") ;
    })?.["objectId"];

    const protectedTreasury = result.objectChanges?.find((change) => {
        return change.type === "created" && change.objectType.includes("ProtectedTreasury") ;
    })?.["objectId"];

    const spamCoin = result.objectChanges?.find((change) => {
        return change.type === "created" && change.objectType.includes("Coin") && change.objectType.includes("SPAM") && !change.objectType.includes("Meta");
    })?.["objectId"];

    return [packageId, upgradeCap, protectedTreasury, spamCoin];
};

const suiiDeploy = async (signer: Ed25519Keypair) => {
    const signerAddress = signer.toSuiAddress();
    const compiledModulesAndDependencies = JSON.parse(
        execSync(Constants.getBuildCommand() + " --path " + suiiSourcesPath, {
            encoding: "utf-8",
        })
    );

    const tx = new Transaction();

    tx.setGasBudget(Constants.GAS_BUDGET);

    const res = tx.publish({
        modules: compiledModulesAndDependencies.modules.map((m) =>
            Array.from(Buffer.from(m, "base64"))
        ),
        dependencies: compiledModulesAndDependencies.dependencies.map((addr) =>
            normalizeSuiObjectId(addr)
        ),
    });

    tx.transferObjects([res], tx.pure.address(signerAddress));

    const provider = Utils.provider;

    const result = await provider.signAndExecuteTransaction({
        transaction: tx,
        signer: signer,
        options: { showObjectChanges: true },
    });

    // console.log(result);

    const packageId = result.objectChanges?.find((change) => {
        return change.type === "published";
    })?.["packageId"];

    const upgradeCap = result.objectChanges?.find((change) => {
        return change.type === "created" && change.objectType.includes("UpgradeCap") ;
    })?.["objectId"];

    const protectedTreasury = result.objectChanges?.find((change) => {
        return change.type === "created" && change.objectType.includes("ProtectedTreasury") ;
    })?.["objectId"];

    const suiiCoin = result.objectChanges?.find((change) => {
        return change.type === "created" && change.objectType.includes("Coin") && change.objectType.includes("SUII") && !change.objectType.includes("Meta");
    })?.["objectId"];

    return [packageId, upgradeCap, protectedTreasury, suiiCoin];
};


const create_pool_admin = async (signer: Ed25519Keypair, baseType: string, quoteType: string, deepbookPackageId: string, registry: string, deepCoin: string, deepbookAdminCap: string, whitelisted: boolean) => {
    const tx = new Transaction();

    const [creation_fee] = tx.splitCoins(
        tx.object(deepCoin),
        [POOL_CREATION_FEE]
    )

    tx.moveCall({
        target: `${deepbookPackageId}::pool::create_pool_admin`,
        typeArguments: [
            baseType, quoteType,
        ],
        arguments: [
            tx.object(registry),
            tx.pure.u64(TICK_SIZE),
            tx.pure.u64(LOT_SIZE),
            tx.pure.u64(MIN_SIZE),  
            creation_fee,
            tx.pure.bool(whitelisted),
            tx.pure.bool(false),
            tx.object(deepbookAdminCap),
        ],
    });

    const result = await client.signAndExecuteTransaction({
        transaction: tx,
        signer,
        options: { showObjectChanges: true },
    });
    // console.log(result);

    const pool = result.objectChanges?.find((change) => {
        return change.type === "created" && change.objectType.includes("Pool") && !change.objectType.includes("Inner") && !change.objectType.includes("Key");
    })?.["objectId"];

    return [pool];
};


const create_balance_manager = async (signer: Ed25519Keypair, deepbookPackageId: string, coinTypes: string[], coins: string[]) => {
    const tx = new Transaction();


    const [balance_manager] = tx.moveCall({
        target: `${deepbookPackageId}::balance_manager::new`,
        typeArguments: [
        ],
        arguments: [
        ],
    });

    for (let i = 0; i < coinTypes.length; i++) {
        const [splited_coin] = tx.splitCoins(
            tx.object(coins[i]),
            [STARTING_BALANCE]
        )

        tx.moveCall({
            target: `${deepbookPackageId}::balance_manager::deposit`,
            typeArguments: [
                coinTypes[i]
            ],
            arguments: [
                balance_manager,
                splited_coin
            ],
        });
    }
    
    tx.moveCall({
        target: `${deepbookPackageId}::balance_manager::share`,
        typeArguments: [
        ],
        arguments: [
            balance_manager
        ],
    });

    const result = await client.signAndExecuteTransaction({
        transaction: tx,
        signer,
        options: { showObjectChanges: true },
    });
    // console.log(result);

    const balanceManager = result.objectChanges?.find((change) => {
        return change.type === "created" && change.objectType.includes("BalanceManager");
    })?.["objectId"];

    return [balanceManager];
};

const setup_ref_pool = async (signer: Ed25519Keypair, baseType: string, quoteType: string, deepbookPackageId: string, poolId: string, balanceManagerId: string, midPrice: number,) => {
    const tx = new Transaction();
    const is_bid = true;

    const trade_proof = tx.moveCall({
        target: `${deepbookPackageId}::balance_manager::generate_proof_as_owner`,
        typeArguments: [
        ],
        arguments: [
            tx.object(balanceManagerId),
        ],
    });

    tx.moveCall({
        target: `${deepbookPackageId}::pool::place_limit_order`,
        typeArguments: [
            baseType, quoteType,
        ],
        arguments: [
            tx.object(poolId),
            tx.object(balanceManagerId),
            trade_proof,
            tx.pure.u64(1),
            tx.pure.u8(NO_RESTRICTION),
            tx.pure.u8(SELF_MATCHING_ALLOWED),
            tx.pure.u64(midPrice - 8 * FLOAT_SCALING),
            tx.pure.u64(FLOAT_SCALING),
            tx.pure.bool(is_bid),
            tx.pure.bool(true),
            tx.pure.u64(MAX_U64),
            tx.object(normalizeSuiObjectId("0x6")),
        ],
    });

    tx.moveCall({
        target: `${deepbookPackageId}::pool::place_limit_order`,
        typeArguments: [
            baseType, quoteType,
        ],
        arguments: [
            tx.object(poolId),
            tx.object(balanceManagerId),
            trade_proof,
            tx.pure.u64(1),
            tx.pure.u8(NO_RESTRICTION),
            tx.pure.u8(SELF_MATCHING_ALLOWED),
            tx.pure.u64(midPrice + 8 * FLOAT_SCALING),
            tx.pure.u64(FLOAT_SCALING),
            tx.pure.bool(!is_bid),
            tx.pure.bool(true),
            tx.pure.u64(MAX_U64),
            tx.object(normalizeSuiObjectId("0x6")),
        ],
    });

    const result = await client.signAndExecuteTransaction({
        transaction: tx,
        signer,
        options: { showObjectChanges: true },
    });
    // console.log(result);
};


const add_deep_price_point = async (signer: Ed25519Keypair, baseType: string, quoteType: string, refBaseType: string, refQuoteType: string, deepbookPackageId: string, targetPool: string,  refPool) => {
    const tx = new Transaction();
    const is_bid = true;

    tx.moveCall({
        target: `${deepbookPackageId}::pool::add_deep_price_point`,
        typeArguments: [
            baseType, quoteType, refBaseType, refQuoteType
        ],
        arguments: [
            tx.object(targetPool),
            tx.object(refPool),
            tx.object(normalizeSuiObjectId("0x6")),
        ],
    });

    const result = await client.signAndExecuteTransaction({
        transaction: tx,
        signer,
        options: { showObjectChanges: true },
    });
    // console.log(result);
};

const place_limit_order = async (signer: Ed25519Keypair, baseType: string, quoteType: string, deepbookPackageId: string, poolId: string, balanceManagerId: string, price: number, quantity: number, is_bid: boolean, count: number, debug: boolean) => {
    const tx = new Transaction();

    tx.setGasBudget(Constants.GAS_BUDGET);

    const trade_proof = tx.moveCall({
        target: `${deepbookPackageId}::balance_manager::generate_proof_as_owner`,
        typeArguments: [
        ],
        arguments: [
            tx.object(balanceManagerId),
        ],
    });


    for(let i = 0; i < count; i++) {
        tx.moveCall({
            target: `${deepbookPackageId}::pool::place_limit_order`,
            typeArguments: [
                baseType, quoteType,
            ],
            arguments: [
                tx.object(poolId),
                tx.object(balanceManagerId),
                trade_proof,
                tx.pure.u64(1),
                tx.pure.u8(NO_RESTRICTION),
                tx.pure.u8(SELF_MATCHING_ALLOWED),
                tx.pure.u64(price),
                tx.pure.u64(quantity),
                tx.pure.bool(is_bid),
                tx.pure.bool(true),
                tx.pure.u64(MAX_U64),
                tx.object(normalizeSuiObjectId("0x6")),
            ],
        });
    
    }

    const result = await client.signAndExecuteTransaction({
        transaction: tx,
        signer,
        options: { showObjectChanges: true },
    });

    await sleep(500);


    if (debug) {
        // console.log(result['digest']);
        const paramsWithoutOptions: GetTransactionBlockParams = {
            digest: result['digest'],
            options: {
                showEffects: true,
                showInput: false,
                showEvents: false,
                showObjectChanges: false,
                showBalanceChanges: false,
            },
        };
    
        const res2 = await client.getTransactionBlock(
            paramsWithoutOptions
        );
        console.log(res2['effects']['status']);
        console.log(res2['effects']['gasUsed']);
    }
};

const create_balance_managers = async (signer: Ed25519Keypair, deepbookPackageId: string, coinTypes: string[], coins: string[], num: number) => {
    const tx = new Transaction();
    tx.setGasBudget(Constants.GAS_BUDGET);

    for (let j = 0; j < num; j++) {
        const [balance_manager] = tx.moveCall({
            target: `${deepbookPackageId}::balance_manager::new`,
            typeArguments: [
            ],
            arguments: [
            ],
        });
    
        for (let i = 0; i < coinTypes.length; i++) {
            const [splited_coin] = tx.splitCoins(
                tx.object(coins[i]),
                [STARTING_BALANCE]
            )
    
            tx.moveCall({
                target: `${deepbookPackageId}::balance_manager::deposit`,
                typeArguments: [
                    coinTypes[i]
                ],
                arguments: [
                    balance_manager,
                    splited_coin
                ],
            });
        }
        
        tx.moveCall({
            target: `${deepbookPackageId}::balance_manager::share`,
            typeArguments: [
            ],
            arguments: [
                balance_manager
            ],
        });
    }

    const result = await client.signAndExecuteTransaction({
        transaction: tx,
        signer,
        options: { showObjectChanges: true },
    });

    const balanceManagers = result.objectChanges?.filter((change) => {
        return change.type === "created" && change.objectType.includes("BalanceManager");
    })?.map(change => change["objectId"]);
    console.log(balanceManagers.length);

    return [balanceManagers];
};

const place_limit_orders = async (signer: Ed25519Keypair, baseType: string, quoteType: string, deepbookPackageId: string, poolId: string, balanceManagerIds: string[], price: number, quantity: number, is_bid: boolean, count: number, debug: boolean) => {
    const tx = new Transaction();

    tx.setGasBudget(Constants.GAS_BUDGET);

    for(let j = 0; j < count; j++) {
        const trade_proof = tx.moveCall({
            target: `${deepbookPackageId}::balance_manager::generate_proof_as_owner`,
            typeArguments: [
            ],
            arguments: [
                tx.object(balanceManagerIds[j]),
            ],
        });
        tx.moveCall({
            target: `${deepbookPackageId}::pool::place_limit_order`,
            typeArguments: [
                baseType, quoteType,
            ],
            arguments: [
                tx.object(poolId),
                tx.object(balanceManagerIds[j]),
                trade_proof,
                tx.pure.u64(1),
                tx.pure.u8(NO_RESTRICTION),
                tx.pure.u8(SELF_MATCHING_ALLOWED),
                tx.pure.u64(price),
                tx.pure.u64(quantity),
                tx.pure.bool(is_bid),
                tx.pure.bool(true),
                tx.pure.u64(MAX_U64),
                tx.object(normalizeSuiObjectId("0x6")),
            ],
        });
    }

    const result = await client.signAndExecuteTransaction({
        transaction: tx,
        signer,
        options: { showObjectChanges: true },
    });
};


export const main = async () => {
    let signer = await Utils.getDeployer();
    await Utils.getFaucet(signer.toSuiAddress());
    await Utils.getFaucet(signer.toSuiAddress());
    writeToml(tokenSourcesPath, "0x0", "token");
    const [tokenPackageId, tokenUpgradeCap, protectedTreasury, deepCoin] = await tokenDeploy(signer);
    console.log("tokenPackageId: " + tokenPackageId);
    console.log("tokenUpgraceCap: " + tokenUpgradeCap);
    console.log("protectedTreasury: " + protectedTreasury);
    console.log("deepCoin: " + deepCoin);
    writeToml(tokenSourcesPath, tokenPackageId, "token");

    const [usdcPackageId, usdcUpgradeCap, usdcProtectedTreasury, usdcCoin] = await usdcDeploy(signer);
    console.log("usdcPackageId: " + usdcPackageId);
    console.log("usdcCoin: " + usdcCoin);
    const [spamPackageId, spamUpgradeCap, spamProtectedTreasury, spamCoin] = await spamDeploy(signer);
    console.log("spamPackageId: " + spamPackageId);
    console.log("spamCoin: " + spamCoin);
    const [suiiPackageId, suiiUpgradeCap, suiiProtectedTreasury, suiiCoin] = await suiiDeploy(signer);
    console.log("suiiPackageId: " + suiiPackageId);
    console.log("suiiCoin: " + suiiCoin);


    const [deepbookPackageId, deepbookUpgradeCap, registry, deepbookAdminCap] = await deepbookDeploy(signer);
    console.log("deepbookPackageId: " + deepbookPackageId);
    console.log("deepbookUpgradeCap: " + deepbookUpgradeCap);
    console.log("registry: " + registry);
    console.log("deepbookAdminCap: " + deepbookAdminCap);

    const deepType = `${tokenPackageId}::deep::DEEP`;
    const usdcType = `${usdcPackageId}::usdc::USDC`;
    const spamType = `${spamPackageId}::spam::SPAM`;
    const suiiType = `${suiiPackageId}::suii::SUII`;
    const suiType = `${normalizeSuiObjectId("0x2")}::sui::SUI`;

    const whitelisted = true;
    
    const [pool_sui_deep] = await create_pool_admin(signer, suiiType, deepType, deepbookPackageId, registry, deepCoin, deepbookAdminCap, whitelisted);
    console.log("pool_sui_deep: " + pool_sui_deep);
    const [pool_spam_deep] = await create_pool_admin(signer, spamType, deepType, deepbookPackageId, registry, deepCoin, deepbookAdminCap, whitelisted);
    console.log("pool_spam_deep: " + pool_spam_deep);


    const [pool_sui_usdc] = await create_pool_admin(signer, suiiType, usdcType, deepbookPackageId, registry, deepCoin, deepbookAdminCap, !whitelisted);
    console.log("pool_sui_usdc: " + pool_sui_usdc);
    const [pool_spam_usdc] = await create_pool_admin(signer, spamType, usdcType, deepbookPackageId, registry, deepCoin, deepbookAdminCap, !whitelisted);
    console.log("pool_spam_usdc: " + pool_spam_usdc);
    
    const [balance_managers] = await create_balance_managers(signer, deepbookPackageId, [deepType, usdcType, spamType, suiiType], [deepCoin, usdcCoin, spamCoin, suiiCoin], 100);


    const [balance_manager] = await create_balance_manager(signer, deepbookPackageId, [deepType, usdcType, spamType, suiiType], [deepCoin, usdcCoin, spamCoin, suiiCoin]);
    console.log("balance_manager: " + balance_manager);

    const [balance_manager2] = await create_balance_manager(signer, deepbookPackageId, [deepType, usdcType, spamType, suiiType], [deepCoin, usdcCoin, spamCoin, suiiCoin]);
    console.log("balance_manager2: " + balance_manager2);

    await sleep(500);
    
    await setup_ref_pool(signer, suiiType, deepType, deepbookPackageId, pool_sui_deep, balance_manager, 100 * FLOAT_SCALING);
    await setup_ref_pool(signer, spamType, deepType, deepbookPackageId, pool_spam_deep, balance_manager, 100 * FLOAT_SCALING);
    console.log("setup_ref_pool");



    await add_deep_price_point(signer, suiiType, usdcType, suiiType, deepType, deepbookPackageId, pool_sui_usdc, pool_sui_deep);
    await add_deep_price_point(signer, spamType, usdcType, spamType, deepType, deepbookPackageId, pool_spam_usdc, pool_spam_deep);
    console.log("add_deep_price_point");

    
    console.log("start place limit order");
    for(let i = 0; i < 100; i++) {
        await place_limit_orders(signer, suiiType, usdcType, deepbookPackageId, pool_sui_usdc, balance_managers, 100 * FLOAT_SCALING, MIN_SIZE, true, 100, false);
        console.log(i);
    }

    console.log("end place limit order");

    console.log("try filling 100 orders within single tx");
    await place_limit_order(signer, suiiType, usdcType, deepbookPackageId, pool_sui_usdc, balance_manager2, 100 * FLOAT_SCALING, 100 * MIN_SIZE, false, 1, true);
};

main();
