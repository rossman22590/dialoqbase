-- Make rcohen@mytsi.org an administrator
UPDATE "User"
SET "isAdministrator" = true
WHERE LOWER("email") = 'rcohen@mytsi.org';
