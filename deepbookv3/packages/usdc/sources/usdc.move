// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

module usdc::usdc {
    public struct USDC has drop {}

    public struct ProtectedTreasury has key {
        id: UID,
    }

    public struct TreasuryCapKey has copy, drop, store {}

    public fun burn(arg0: &mut ProtectedTreasury, arg1: sui::coin::Coin<USDC>) {
        sui::coin::burn<USDC>(borrow_cap_mut(arg0), arg1);
    }

    public fun total_supply(arg0: &ProtectedTreasury): u64 {
        sui::coin::total_supply<USDC>(borrow_cap(arg0))
    }

    fun borrow_cap(arg0: &ProtectedTreasury): &sui::coin::TreasuryCap<USDC> {
        let v0 = TreasuryCapKey {};
        sui::dynamic_object_field::borrow<TreasuryCapKey, sui::coin::TreasuryCap<USDC>>(
            &arg0.id,
            v0,
        )
    }

    fun borrow_cap_mut(arg0: &mut ProtectedTreasury): &mut sui::coin::TreasuryCap<USDC> {
        let v0 = TreasuryCapKey {};
        sui::dynamic_object_field::borrow_mut<TreasuryCapKey, sui::coin::TreasuryCap<USDC>>(
            &mut arg0.id,
            v0,
        )
    }

    fun create_coin(
        arg0: USDC,
        arg1: u64,
        arg2: &mut sui::tx_context::TxContext,
    ): (ProtectedTreasury, sui::coin::Coin<USDC>) {
        let (v0, v1) = sui::coin::create_currency<USDC>(
            arg0,
            6,
            b"",
            b"",
            b"",
            std::option::none(),
            arg2,
        );
        let mut cap = v0;
        sui::transfer::public_freeze_object<sui::coin::CoinMetadata<USDC>>(v1);
        let mut protected_treasury = ProtectedTreasury { id: sui::object::new(arg2) };

        let coin = sui::coin::mint<USDC>(&mut cap, arg1, arg2);
        sui::dynamic_object_field::add<TreasuryCapKey, sui::coin::TreasuryCap<USDC>>(
            &mut protected_treasury.id,
            TreasuryCapKey {},
            cap,
        );

        (protected_treasury, coin)
    }

    #[allow(lint(share_owned))]
    fun init(arg0: USDC, arg1: &mut TxContext) {
        let (v0, v1) = create_coin(arg0, 10000000000000000, arg1);
        sui::transfer::share_object<ProtectedTreasury>(v0);
        sui::transfer::public_transfer<sui::coin::Coin<USDC>>(v1, sui::tx_context::sender(arg1));
    }

}
