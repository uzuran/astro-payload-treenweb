-- Runs once, only on first cluster initialisation (empty data volume).

-- Throwaway database for integration tests (see backend/vitest.config.ts).
SELECT 'CREATE DATABASE treenweb_test'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'treenweb_test')\gexec

\connect treenweb
-- Extensions commonly wanted for search / text handling later on.
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

\connect treenweb_test
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;
