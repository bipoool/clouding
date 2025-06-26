CREATE TABLE IF NOT EXISTS hosts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    ip TEXT NOT NULL,
    os TEXT NOT NULL,
    meta_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updatedAt before update
CREATE OR REPLACE FUNCTION updateUpdatedAt()
RETURNS TRIGGER AS $$
BEGIN
   NEW."updated_at" = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER setUpdatedAt
BEFORE UPDATE ON hosts
FOR EACH ROW
EXECUTE FUNCTION updateUpdatedAt();