import { MODULE_ADDRESS } from "@/constants";
export const NFTCollectionABI = {
    address: `${MODULE_ADDRESS}`, // Replace with your MODULE_ADDRESS
    name: "nftcollection",
    friends: [],
    exposed_functions: [
      {
        name: "create_collection",
        visibility: "public",
        is_entry: true,
        is_view: false,
        generic_type_params: [],
        params: ["&signer", "string", "string", "string", "u64"], // signer, name, description, uri, max_supply
        return: [],
      },
      {
        name: "mint_nft",
        visibility: "public",
        is_entry: true,
        is_view: false,
        generic_type_params: [],
        params: ["address", "object"], // Replace "object" with the correct object type (Collection object)
        return: ["object"], // Returns the minted Token object
      },
      {
        name: "batch_mint_nfts",
        visibility: "public",
        is_entry: true,
        is_view: false,
        generic_type_params: [],
        params: ["address", "object", "u64"], // sender address, collection object, amount
        return: ["vector<object>"], // Returns a vector of minted Token objects
      },
      // Add more functions as per your module
    ],
    structs: [
      {
        name: "Collection",
        is_native: false,
        abilities: ["store"],
        fields: [
          { name: "creator_addr", type: "address" },
          { name: "name", type: "string" },
          { name: "description", type: "string" },
          { name: "uri", type: "string" },
          { name: "max_supply", type: "u64" },
        ],
      },
      {
        name: "Token",
        is_native: false,
        abilities: ["store"],
        fields: [
          { name: "id", type: "u64" },
          { name: "uri", type: "string" },
          // Add more fields for your NFT metadata
        ],
      },
    ],
  } as const;
  