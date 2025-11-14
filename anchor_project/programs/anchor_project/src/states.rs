use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Lottery {
    creator: Pubkey,
    lottery_id: u8,
    max_prize: u64,
    entry_price: u64,
    max_entries: u64,
    total_entries: u64,
    entries: Vec<Pubkey>,
    winner_chosen: bool,
    bump: u8,
}
