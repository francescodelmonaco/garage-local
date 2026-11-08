-- Veicolo finanziato: purchase_date obbligatoria e non successiva alla prima rata.
-- Vincolo tra due tabelle: serve un trigger per lato. Il messaggio è una chiave letta dall'API.
create function check_financing_purchase_date() returns trigger language plpgsql as $$
declare v_purchase_date date;
begin
    select purchase_date into v_purchase_date from vehicles where id = new.vehicle_id;
    if v_purchase_date is null or new.first_installment_date < v_purchase_date then
        raise exception 'financing_purchase_date';
    end if;
    return new;
end;
$$;
--> statement-breakpoint
create trigger vehicle_financings_purchase_date
    before insert or update on vehicle_financings
    for each row execute function check_financing_purchase_date();
--> statement-breakpoint
create function check_vehicle_financing_purchase_date() returns trigger language plpgsql as $$
begin
    if exists (
        select 1 from vehicle_financings f
        where f.vehicle_id = new.id
          and (new.purchase_date is null or f.first_installment_date < new.purchase_date)
    ) then
        raise exception 'financing_purchase_date';
    end if;
    return new;
end;
$$;
--> statement-breakpoint
create trigger vehicles_financing_purchase_date
    before update of purchase_date on vehicles
    for each row
    when (new.purchase_date is distinct from old.purchase_date)
    execute function check_vehicle_financing_purchase_date();
