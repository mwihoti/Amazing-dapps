#[test_only]
module nftCollection_addr::test_nftcollection {
    use std::option::{Self, Option};
    use std::signer;
    use std::string::{Self, String};
    use std::vector;

    use aptos_std::string_utils;
    use aptos_framework::aptos_account;
    use aptos_framework::event;
    use aptos_framework::object::{Self, Object};
    use aptos_framework::timestamp;

    use aptos_token_objects::collection::{Self, Collection};
    use aptos_token_objects::royalty::{Self, Royalty};
    use aptos_token_objects::token::{Self, Token};

    use nftCollection_addr::nftcollection;

    #[test(aptos_framework = @0x1, sender = @nftCollection_addr, user1 = @0x200)]
    fun test_create_collection(
        aptos_framework: &signer,
        sender: &signer,
        user1: &signer,
    ) {
        let user1_addr = signer::address_of(user1);

        // Initialize the module
        nftcollection::init_module(sender);

        // Create a new collection
        nftcollection::create_collection(
            sender,
            string::utf8(b"description"),
            string::utf8(b"name"),
            string::utf8(b"https://gateway.example.com/collection.json"),
            10,
            option::some(10),
            option::some(3),
            option::some(user1_addr),
            option::some(timestamp::now_seconds()),
            option::some(timestamp::now_seconds() + 100),
            option::some(3),
            option::some(5),
            option::some(timestamp::now_seconds() + 200),
            option::some(timestamp::now_seconds() + 300),
            option::some(2),
            option::some(10),
        );

        // Fetch the collection from registry
        let registry = nftcollection::get_registry();
        let collection_1 = *vector::borrow(&registry, vector::length(&registry) - 1);

        // Verify the collection creation
        assert!(collection::name(collection_1) == string::utf8(b"name"), 1);
        assert!(collection::description(collection_1) == string::utf8(b"description"), 2);
        assert!(collection::uri(collection_1) == string::utf8(b"https://gateway.example.com/collection.json"), 3);
    }

    #[test(aptos_framework = @0x1, sender = @nftCollection_addr, user1 = @0x200)]
    #[expected_failure(abort_code = 13, location = nftcollection)]
    fun test_batch_mint_nfts(
        aptos_framework: &signer,
        sender: &signer,
        user1: &signer,
    ) {
        let user1_addr = signer::address_of(user1);

        // Initialize the module
        nftcollection::init_module(sender);

        // Create a new collection
        nftcollection::create_collection(
            sender,
            string::utf8(b"description"),
            string::utf8(b"name"),
            string::utf8(b"https://gateway.example.com/collection.json"),
            10,
            option::some(10),
            option::some(3),
            option::some(user1_addr),
            option::some(timestamp::now_seconds()),
            option::some(timestamp::now_seconds() + 100),
            option::some(3),
            option::some(5),
            option::some(timestamp::now_seconds() + 200),
            option::some(timestamp::now_seconds() + 300),
            option::some(2),
            option::some(10),
        );

        // Fetch the collection from registry
        let registry = nftcollection::get_registry();
        let collection_1 = *vector::borrow(&registry, vector::length(&registry) - 1);

        // Attempt to batch mint NFTs
        nftcollection::batch_mint_nfts(user1_addr, collection_1, 3);

        // Verify NFTs are minted and transferred
        let nfts = vector::empty<Object<Token>>();
        assert!(vector::length(&nfts) == 3, 1);

        // Check the event emitted for batch minting
        let events = event::get_emitted_events();
        assert!(vector::length(&events) > 0, 2);
        let batch_mint_event = *vector::borrow(&events, 0);
        assert!(batch_mint_event.collection_obj == collection_1, 3);
        assert!(vector::length(batch_mint_event.nft_objs) == 3, 4);
        assert!(batch_mint_event.recipient_addr == user1_addr, 5);
    }

    #[test(aptos_framework = @0x1, sender = @nftCollection_addr, user1 = @0x200)]
    #[expected_failure(abort_code = 12, location = nftcollection)]
    fun test_mint_nft_internal_disabled(
        aptos_framework: &signer,
        sender: &signer,
        user1: &signer,
    ) {
        let user1_addr = signer::address_of(user1);

        // Initialize the module
        nftcollection::init_module(sender);

        // Create a new collection with minting disabled
        nftcollection::create_collection(
            sender,
            string::utf8(b"description"),
            string::utf8(b"name"),
            string::utf8(b"https://gateway.example.com/collection.json"),
            10,
            option::some(10),
            option::some(3),
            option::some(user1_addr),
            option::some(timestamp::now_seconds()),
            option::some(timestamp::now_seconds() + 100),
            option::some(3),
            option::some(5),
            option::some(timestamp::now_seconds() + 200),
            option::some(timestamp::now_seconds() + 300),
            option::some(2),
            option::some(10),
        );

        // Fetch the collection from registry
        let registry = nftcollection::get_registry();
        let collection_1 = *vector::borrow(&registry, vector::length(&registry) - 1);

        // Disable minting
        nftcollection::update_mint_enabled(sender, collection_1, false);

        // Attempt to mint an NFT
        nftcollection::mint_nft_internal(user1_addr, collection_1);

        // Verify the minting was aborted
    }

    #[test(aptos_framework = @0x1, sender = @nftCollection_addr, user1 = @0x200)]
    #[expected_failure(abort_code = 13, location = nftcollection)]
    fun test_mint_nft_zero_amount(
        aptos_framework: &signer,
        sender: &signer,
        user1: &signer,
    ) {
        let user1_addr = signer::address_of(user1);

        // Initialize the module
        nftcollection::init_module(sender);

        // Create a new collection
        nftcollection::create_collection(
            sender,
            string::utf8(b"description"),
            string::utf8(b"name"),
            string::utf8(b"https://gateway.example.com/collection.json"),
            10,
            option::some(10),
            option::some(3),
            option::some(user1_addr),
            option::some(timestamp::now_seconds()),
            option::some(timestamp::now_seconds() + 100),
            option::some(3),
            option::some(5),
            option::some(timestamp::now_seconds() + 200),
            option::some(timestamp::now_seconds() + 300),
            option::some(2),
            option::some(10),
        );

        // Fetch the collection from registry
        let registry = nftcollection::get_registry();
        let collection_1 = *vector::borrow(&registry, vector::length(&registry) - 1);

        // Attempt to batch mint zero NFTs
        nftcollection::batch_mint_nfts(user1_addr, collection_1, 0);

        // Verify the minting was aborted
    }
}
