-- Migration: Add game results tracking and multiple placement rewards
-- Date: 2025-09-21

-- Create game_results table for detailed statistics
create table if not exists game_results (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references games(id) on delete cascade,
  player_id uuid references players(id) on delete cascade,
  user_id uuid references profiles(id) on delete set null,
  placement integer not null, -- 1st, 2nd, 3rd, etc.
  points_awarded integer default 0,
  xp_awarded integer default 0,
  cards_used integer default 1,
  bingo_called_at timestamptz,
  created_at timestamptz default now()
);

-- Add indexes for performance
create index if not exists idx_game_results_game on game_results(game_id);
create index if not exists idx_game_results_player on game_results(player_id);
create index if not exists idx_game_results_user on game_results(user_id);

-- Function to award points and XP for game placement
create or replace function award_game_rewards(game_id uuid, player_id uuid, placement integer)
returns void
language plpgsql
as $$
declare
  points_awarded integer;
  xp_awarded integer;
  user_record record;
begin
  -- Calculate points based on placement
  case placement
    when 1 then points_awarded := 100;
    when 2 then points_awarded := 50;
    when 3 then points_awarded := 25;
    when 4 then points_awarded := 15;
    when 5 then points_awarded := 10;
    else points_awarded := 5; -- 6th place and below
  end case;

  -- Calculate XP based on placement (more XP for better placements)
  xp_awarded := case
    when placement = 1 then 50
    when placement = 2 then 30
    when placement = 3 then 20
    when placement <= 5 then 10
    else 5
  end;

  -- Get user ID from player record
  select user_id into user_record from players where id = player_id;

  -- Update user profile
  if user_record.user_id is not null then
    update profiles
    set points = points + points_awarded,
        experience_points = experience_points + xp_awarded,
        total_games_played = total_games_played + 1,
        total_bingos = case when placement = 1 then total_bingos + 1 else total_bingos end,
        best_placement = case when best_placement is null or placement < best_placement then placement else best_placement end,
        updated_at = now()
    where id = user_record.user_id;

    -- Check for level up
    declare
      user_profile profiles%rowtype;
      new_level integer;
      level_threshold integer;
    begin
      select * into user_profile from profiles where id = user_record.user_id;
      new_level := user_profile.level;
      level_threshold := new_level * 100;

      while user_profile.experience_points >= level_threshold loop
        new_level := new_level + 1;
        level_threshold := new_level * 100;
      end loop;

      if new_level > user_profile.level then
        update profiles set level = new_level, updated_at = now() where id = user_record.user_id;
      end if;
    end;
  end if;

  -- Record the result
  insert into game_results (game_id, player_id, user_id, placement, points_awarded, xp_awarded, bingo_called_at)
  values (game_id, player_id, user_record.user_id, placement, points_awarded, xp_awarded, now());
end;
$$;

-- Function to finalize game and award placements to all players
create or replace function finalize_game_placements(game_id uuid)
returns void
language plpgsql
as $$
declare
  player_record record;
  placement_counter integer := 1;
begin
  -- Award placements to players who called bingo (ordered by who called first)
  for player_record in
    select p.id, bc.created_at as bingo_called_at
    from players p
    join bingo_claims bc on bc.player_id = p.id and bc.game_id = game_id and bc.verified = true
    where p.game_id = game_id
    order by bc.resolved_at asc
    limit 5 -- Top 5 placements
  loop
    perform award_game_rewards(game_id, player_record.id, placement_counter);
    placement_counter := placement_counter + 1;
  end loop;

  -- Mark game as finished
  update games set status = 'finished', updated_at = now() where id = game_id;
end;
$$;