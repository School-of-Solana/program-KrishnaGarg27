use crate::states::*;
use anchor_lang::prelude::*;

pub fn initialize_lottery(ctx: Context<InitializeLottery>, lottery_id: u8, entry_price: u64, max_entries: u64) -> Result<()> {
    let creator = &mut ctx.accounts.creator;
    let lottery = &mut ctx.accounts.lottery;

    lottery.creator = creator.key();
    lottery.lottery_id = lottery_id;
    lottery.prize = 0;
    lottery.entry_price = entry_price;
    lottery.max_entries = max_entries;
    lottery.total_entries  =  0;
    lottery.winner_chosen = false;
    lottery.bump = ctx.bumps.lottery;

    Ok(())
}

#[derive(Accounts)]
#[instruction(lottery_id: u8)]
pub struct InitializeLottery<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,
    #[account(
        init,
        payer = creator,
        space = 8 + Lottery::INIT_SPACE,
        seeds = [b"lottery", creator.key().as_ref(), lottery_id.to_le_bytes().as_ref()],
        bump 
    )]
    pub lottery: Account<'info, Lottery>,
    pub system_program: Program<'info, System>,
}
