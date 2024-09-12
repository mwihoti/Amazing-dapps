module nftCollection_addr::nftcollection {
    use std::option::{Self, Option};
    use std::signer;
    use std::string::{Self, String};
    use std::vector;

    use aptos_std::simple_map::{Self, SimpleMap};
    use aptos_std::string_utils;

    use aptos_framework::aptos_account;
    use aptos_framework::event;
    use aptos_framework::object::{Self, Object};
    use aptos_framework::timestamp;
    use aptos_token_objects::royalty::{Self, Royalty};
    use aptos_token_objects::token::{Self, Token};

    // Constants for error codes
    const ENO_ACTIVE_STAGES: u64 = 6;
    const EAT_LEAST_ONE_STAGE_IS_REQUIRED: u64 = 7;
    const ECOLLECTION_ALREADY_EXISTS: u64 = 1;
    const EMINT_IS_DISABLED: u64 = 12;
    const ECANNOT_MINT_ZERO: u64 = 13;

    #[event]
    struct CreateCollectionEvent {
        creator_addr: address,
        collection_owner_obj: Object<Collection>,
        collection_obj: Object<Collection>,
        max_supply: u64,
        name: String,
        description: String,
        uri: String,
    }

    #[event]
    struct BatchMintNftsEvent has store, drop {
        collection_obj: Object<Collection>,
        nft_objs: vector<Object<Token>>,
        recipient_addr: address,
        total_mint_fee: u64,
    }

    struct CollectionConfig has key {
        creator: address,
        name: String,
        description: String,
        mint_enabled: bool,
        total_supply: u64,
    }

    /// Token structure represents the Token object that will be minted
    struct Token has store {}

    /// Initialize the module
    public entry fun init_module(sender: &signer) {
        move_to(sender, Registry {
            collection_objects: vector::empty()
        });
        move_to(sender, Config {
            creator_addr: signer::address_of(sender),
            admin_addr: signer::address_of(sender),
            pending_admin_addr: option::none(),
            mint_fee_collector_addr: signer::address_of(sender),
        });
    }

    /// Create a new collection
    public entry fun create_collection(
        creator: &signer, 
        name: String, 
        description: String
    ) acquires CollectionConfig {
        // Check if collection already exists
        if (exists<CollectionConfig>(signer::address_of(creator))) {
            abort ECOLLECTION_ALREADY_EXISTS;
        }

        // Create new collection config
        let collection_config = CollectionConfig {
            creator: signer::address_of(creator),
            name: name,
            description: description,
            mint_enabled: true,  // Minting enabled by default
            total_supply: 0,     // Starting with zero NFTs minted
        };

        // Store the CollectionConfig in the global storage
        move_to(creator, collection_config);
    }

    /// Mint a new NFT
    fun mint_nft_internal(
        sender_addr: address,
        collection_obj: Object<Collection>,
    ): Object<Token> acquires CollectionConfig {
        let collection_config = borrow_global<CollectionConfig>(object::object_address(&collection_obj));

        // Ensure minting is enabled for this collection
        if (!collection_config.mint_enabled) {
            abort EMINT_IS_DISABLED;
        }

        // Calculate the next NFT ID
        let next_nft_id = collection_config.total_supply + 1;

        // Construct metadata URI for the NFT
        let nft_metadata_uri = construct_nft_metadata_uri(&collection_config.name, next_nft_id);

        // Create the NFT object with appropriate metadata
        let nft_obj_constructor_ref = &token::create(
            collection_obj,
            collection_config.name,
            string_utils::to_string(&next_nft_id),  // Use next_nft_id as simple name
            string_utils::to_string(&next_nft_id),  // Use next_nft_id as description
            royalty::get(collection_obj),           // Set royalty
            nft_metadata_uri                        // Set metadata URI
        );

        token_components::create_refs(nft_obj_constructor_ref);

        let nft_obj = object::object_from_constructor_ref(nft_obj_constructor_ref);

        // Transfer the NFT to the minter's address
        object::transfer(&collection_obj, nft_obj, sender_addr);

        // Return the newly minted NFT
        nft_obj
    }

    /// Utility function to construct the metadata URI for the NFT
    fun construct_nft_metadata_uri(collection_uri: &String, nft_id: u64): String {
        string_utils::concat(collection_uri, &string_utils::to_string(&nft_id))
    }

    
    /// Update creator address
    public entry fun update_creator(_sender: &signer, _new_creator: address) acquires Config {
        let config = borrow_global_mut<Config>(signer::address_of(sender));
        config.creator_addr = new_creator;
    }
}
