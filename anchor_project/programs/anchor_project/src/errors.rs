use anchor_lang::prelude::*;

#[error_code]
pub enum LotteryErrors {
    #[msg("Entry Price cannot be zero")]
    ZeroEntryPrice,
    #[msg("Max Entries cannot be zero")]
    ZeroMaxEntries,
    #[msg("Insufficient Balance")]
    InsufficientBalance,
    #[msg("Max Entries has been reached")]
    MaxEntriesReached,
    #[msg("Winner has already been chosen")]
    WinnerChosen,
}
