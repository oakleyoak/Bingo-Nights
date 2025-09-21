-- Migration: Add achievements system
-- Date: 2025-09-21

-- achievements: available achievements in the game
create table if not exists achievements (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  icon text, -- icon identifier or emoji
  category text not null, -- 'gameplay', 'social', 'progression', 'special'
  requirement_type text not null, -- 'total_games', 'total_bingos', 'level', 'consecutive_logins', 'best_placement'
  requirement_value integer not null,
  reward_points integer default 0,
  reward_xp integer default 0,
  is_hidden boolean default false,
  created_at timestamptz default now()
);

-- user_achievements: achievements earned by users
create table if not exists user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  achievement_id uuid references achievements(id) on delete cascade,
  earned_at timestamptz default now(),
  unique(user_id, achievement_id)
);

-- Insert default achievements
insert into achievements (name, description, icon, category, requirement_type, requirement_value, reward_points, reward_xp) values
('First Bingo!', 'Get your first bingo', '🎯', 'gameplay', 'total_bingos', 1, 25, 10),
('Bingo Beginner', 'Play your first game', '🎲', 'gameplay', 'total_games', 1, 10, 5),
('Bingo Enthusiast', 'Play 10 games', '🎳', 'gameplay', 'total_games', 10, 50, 25),
('Bingo Master', 'Play 50 games', '🏆', 'gameplay', 'total_games', 50, 200, 100),
('Speed Demon', 'Get bingo in under 10 numbers called', '⚡', 'gameplay', 'total_bingos', 1, 100, 50),
('Lucky Winner', 'Win 1st place', '🥇', 'gameplay', 'best_placement', 1, 150, 75),
('Consistent Player', 'Login for 7 consecutive days', '📅', 'progression', 'consecutive_logins', 7, 75, 40),
('Level Up!', 'Reach level 5', '⬆️', 'progression', 'level', 5, 100, 50),
('High Roller', 'Reach level 10', '💎', 'progression', 'level', 10, 250, 125),
('Bingo Champion', 'Get 25 bingos', '👑', 'gameplay', 'total_bingos', 25, 500, 250);

-- Function to check and award achievements
create or replace function check_and_award_achievements(user_id uuid)
returns void
language plpgsql
as $$
declare
  user_profile profiles%rowtype;
  achievement_record achievements%rowtype;
begin
  -- Get user profile
  select * into user_profile from profiles where id = user_id;
  if not found then
    return;
  end if;

  -- Check each achievement
  for achievement_record in select * from achievements loop
    -- Skip if user already has this achievement
    if exists (select 1 from user_achievements where user_id = user_id and achievement_id = achievement_record.id) then
      continue;
    end if;

    -- Check if requirement is met
    if (achievement_record.requirement_type = 'total_games' and user_profile.total_games_played >= achievement_record.requirement_value) or
       (achievement_record.requirement_type = 'total_bingos' and user_profile.total_bingos >= achievement_record.requirement_value) or
       (achievement_record.requirement_type = 'level' and user_profile.level >= achievement_record.requirement_value) or
       (achievement_record.requirement_type = 'consecutive_logins' and user_profile.consecutive_login_days >= achievement_record.requirement_value) or
       (achievement_record.requirement_type = 'best_placement' and user_profile.best_placement <= achievement_record.requirement_value) then

      -- Award achievement
      insert into user_achievements (user_id, achievement_id) values (user_id, achievement_record.id);

      -- Award rewards
      update profiles
      set points = points + achievement_record.reward_points,
          experience_points = experience_points + achievement_record.reward_xp,
          updated_at = now()
      where id = user_id;
    end if;
  end loop;
end;
$$;