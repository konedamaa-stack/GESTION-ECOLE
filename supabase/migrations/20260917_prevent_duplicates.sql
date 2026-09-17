-- Migration : Empêcher les doublons d'identifiants et de comptes collaborateurs
CREATE UNIQUE INDEX IF NOT EXISTS idx_employees_unique_school_email 
ON employees (school_id, lower(trim(email))) 
WHERE email IS NOT NULL AND trim(email) != '';

CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_invites_unique_school_email 
ON admin_invitations (school_id, lower(trim(email))) 
WHERE email IS NOT NULL AND trim(email) != '';
