use crate::instructions::*;
use anchor_lang::prelude::*;

pub mod states;

declare_id!("DqKkMRaPxD9H6RHucpzjDgwj7FUZXKJXb7xx778TnSM8");

#[program]
pub mod anchor_project {
    use super::*;

    pub fn initialize(ctx: Context<InitializeLottery>) -> Result<()> {
        initialize_lottery(ctx)
    }
}
