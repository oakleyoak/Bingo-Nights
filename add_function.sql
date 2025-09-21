create or replace function public.get_random_unused_number(game_id_param uuid)
returns integer
language plpgsql
as \$\$
declare
  called_nums integer[];
  available_nums integer[];
  result integer;
begin
  select array_agg(number) into called_nums
  from called_numbers
  where game_id = game_id_param;

  select array_agg(generate_series) into available_nums
  from generate_series(1, 75);

  if called_nums is not null then
    select array_agg(num) into available_nums
    from unnest(available_nums) as num
    where num not in (select unnest(called_nums));
  end if;

  if array_length(available_nums, 1) > 0 then
    select available_nums[1 + floor(random() * array_length(available_nums, 1))::int] into result;
    return result;
  else
    return null;
  end if;
end;
\$\$
