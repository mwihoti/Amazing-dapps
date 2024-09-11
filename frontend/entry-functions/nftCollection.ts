import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import { MODULE_ADDRESS } from "@/constants";

export type MintNftArguments = {
    collectionId: string;
    amount: number;
}

export type CreateCollectionArguments = {
    description: string; // The collection description
    name: string; // The collection name
    uri: string; // The project URI (i.e https://mydomain.com)
    maxSupply: number,
    creator_addr: string,
}

export const mintNFT = (args: MintNftArguments): InputTransactionData => {
    const { collectionId, amount } = args;
    return {
        data: {
            function: `${MODULE_ADDRESS}::nftcollection:: mint_nft`,
            typeArguments: [],
            functionArguments: [collectionId, amount]
        },
    };
};

export const batchMintNFTS = (args: MintNftArguments): InputTransactionData => {
    const { collectionId, amount} = args;
    return {
        data: {
            function: `${MODULE_ADDRESS}::nftcollecion::batch_mint_nfts`,
            typeArguments: [],
            functionArguments: [collectionId, amount],
        },
    };
}

export const createCollection = (args: CreateCollectionArguments): InputTransactionData => {
    const { creator_addr, name, description, uri, maxSupply } = args;
    return {
        data: {
            function: `${MODULE_ADDRESS}::nftcollection::create_collection`,
            typeArguments: [],
            functionArguments: [creator_addr, name, description, uri, maxSupply],
        },
    };
};