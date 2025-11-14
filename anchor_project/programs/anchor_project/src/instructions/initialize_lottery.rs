use crate::states::*;
use anchor_lang::prelude::*;

pub fn initialize_lottery(ctx) -> Result<()> {
    Ok(())
}

#[derive(Accounts)]
pub struct InitializeLottery<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,
    #[account(
        init,
        payer = creator
    )]
    pub lottery: Account<'info, Lottery>,
    pub system_program: Program<'info, System>,
}
