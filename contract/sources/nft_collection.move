module nftCollection_addr:: nftcollection {
    use std::option::{Self, Option};
    use std::signer;
    use std::string::{Self, String};
    use std::vector;

    use aptos_std::simple_map::{Self, SimpleMap};
    use aptos_std:: string_utils;

    use aptos_framework::aptos_account;
    use aptos_framework::event;
    use aptos_framework::object::{Self, Object};
    use aptos_framework::timestamp

    use aptos_token_objects::collection::{Self, Collection};
    use aptos_token_objects::royalty::{Self, Royalty};
    use aptos_token_objects::token::{Self, Token};

    use minter::token_components;
    ///  use minter::mint_stage;
    ///  use minter::collection_components;

    

    /// No active mint stages
    const ENO_ACTIVE_STAGES: u64 = 6;

    /// Creator must set at least one mint stage
    const EAT_LEAST_ONE_STAGE_IS_REQUIRED: u64 = 7;


    /// Mint is disabled
    const EMINT_IS_DISABLED: u64 = 12;
    /// Cannot mint 0 amount
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

    struct CollectionConfig has store {
        // Configuration fields for the collection
        mint_fee_per_nft: u64,
        mint_enabled: bool,
        collection_owner_obj: address,
    }
    /// Token structure represents the Token object that will be minted
    struct Token has store {}
    
    /// Initialize the modle, setting up basic config and registry
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

    /// Function to mint a new nft
    fun mint_nft_internal(
        sender_addr: address,
        collection_obj: object<collection>,
    ): Object<Token> acquires CollectionConfig {
        // Get the collection for current collection
        let collection_config  = borrow_global<CollectionConfig>(object::object_address(&collection_obj));

        // Ensure minting is enabled for this collection
        if (!collection_config.mint_enabled) {
            abort EMINT_IS_DISABLED;
        }

        // calculate the next NFT ID
        let next_nft_id = *option::borrow(&collection::count(collection)) + 1;

        // Construct metadata URI for the NFT (can link to IPFS or off-chain storage)
        let collection_uri = collection::uri(collection_obj);
        let nft_metadata_uri = construct_nft_metadata_uri(&collection_uri, next_nft_id);

        // Create the NFT object with appropriate metadata
        let nft_obj_constructor_ref = &token::create(
            collection_config.collection_owner_obj,
            collection::name(collection_obj),
            string_utils::to_string(&next_nft_id),  // Use next_nft_id for a simple name
            string_utils::to_string(&next_nft_id),  // Use next_nft_id for a description
            royalty::get(collection_obj),           // Set the royalty
            nft_metadata_uri,                       // Set the metadata URI
        );
         // Initialize any additional components needed for the NFT
        token_components::create_refs(nft_obj_constructor_ref);
        
        // Finalize the creation of the NFT object
        let nft_obj = object::object_from_constructor_ref(nft_obj_constructor_ref);

        // Transfer the NFT to the sender address (the minter)
        object::transfer(&collection_config.collection_owner_obj, nft_obj, sender_addr);

        nft_obj  // Return the newly minted NFT

    }
    /// Utility function to construct the metadata URI for the NFT
    fun construct_nft_metadata_uri(collection_uri: &String, nft_id: u64): String {
        // Append the nft_id to the collection's URI to form a unique URI for the NFT
        string_utils::concat(collection_uri, &string_utils::to_string(&nft_id))
    }

    // ==== Entry Functions ====//

    /// Update creator address (example functionality)
    public entry fun update_creator(sender: &signer, new_creator: address) acquires Config {
        let config = borrow_global_mut<Config>(signer::address_of(sender));
        config.creator_addr = new_creator;
    }

    /// Batch mint multiple NFTs at once (extension of mint_nft_internal)
    public fun batch_mint_nfts(
        sender_addr: address,
        collection_obj: Object<Collection>,
        amount: u64
    ) acquires CollectionConfig {
        // Ensure the minting amount is greater than zero
        if (amount == 0) {
            abort ECANNOT_MINT_ZERO;
        }

        let mut nft_objs = vector::empty<Object<Token>>();
        let total_mint_fee = 0;

        // Mint the specified number of NFTs
        let i = 0;
        while (i < amount) {
            let nft_obj = mint_nft_internal(sender_addr, collection_obj);
            vector::push_back(&mut nft_objs, nft_obj);
            i = i + 1;
        }

        // Emit an event after minting the batch of NFTs
        event::emit_event(BatchMintNftsEvent {
            collection_obj: collection_obj,
            nft_objs: nft_objs,
            recipient_addr: sender_addr,
            total_mint_fee: total_mint_fee,
        });
    }
}