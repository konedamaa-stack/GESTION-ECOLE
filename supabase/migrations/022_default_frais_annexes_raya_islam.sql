-- Configuration des frais annexes par defaut pour l'etablissement Raya Islam
DO $$
DECLARE
  sid uuid := '7821f66d-e98f-433d-9b6c-25810ee866e0';
  cls RECORD;
  fa RECORD;
BEGIN
  -- 1. Inserer les 8 frais annexes pour l'etablissement s'ils n'existent pas deja
  IF NOT EXISTS (SELECT 1 FROM frais_annexes WHERE school_id = sid) THEN
    INSERT INTO frais_annexes (school_id, name, amount, display_order, is_mandatory, description)
    VALUES 
      (sid, 'Relevè', 1000, 1, true, 'Impression et gestion des bulletins scolaires'),
      (sid, 'Entretien', 2000, 2, true, 'Tenue et tricot officiel de l''établissement'),
      (sid, 'Ceremonie', 1000, 3, false, 'Badge d''accès et macaron de tenue'),
      (sid, 'Macaron', 1000, 4, true, 'Assurance individuelle accident de l''élève'),
      (sid, 'Compo', 1000, 5, false, null),
      (sid, 'Carte Scolaire', 1000, 6, false, null),
      (sid, 'Droit Exa', 2000, 7, false, null),
      (sid, 'Inscription', 2000, 8, false, null);

    -- 2. Pour chaque classe de l'etablissement, associer chaque frais annexe
    FOR cls IN SELECT id FROM classes WHERE school_id = sid LOOP
      FOR fa IN SELECT id, name, amount FROM frais_annexes WHERE school_id = sid LOOP
        INSERT INTO class_frais_annexes (school_id, class_id, frais_annexe_id, amount, is_active)
        VALUES (
          sid, 
          cls.id, 
          fa.id, 
          fa.amount, 
          CASE WHEN fa.name = 'Droit Exa' THEN false ELSE true END
        ) ON CONFLICT DO NOTHING;
      END LOOP;
    END LOOP;
  END IF;
END $$;
