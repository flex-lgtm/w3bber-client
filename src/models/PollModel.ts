export interface RewardPerOption {
    option: number,
    reward_pct: number,
}

export interface PollModel {
    poll_id: string;
    poll_title: string;
    max_options: number;
    options: string[];
    public_key: string;
    entry_fee_type: string;
    reward_calculation_type: string;
    rewards_structure: RewardPerOption[];
    fixed_entry_fee: number;
    sublinear_weighting_parameter: number;
}
