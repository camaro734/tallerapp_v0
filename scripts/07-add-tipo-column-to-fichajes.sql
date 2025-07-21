-- Add tipo column to fichajes table if it doesn't exist
DO $$ 
BEGIN
    -- Check if the column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'fichajes' 
        AND column_name = 'tipo'
    ) THEN
        -- Add the column
        ALTER TABLE fichajes ADD COLUMN tipo VARCHAR(20) DEFAULT 'presencia';
        
        -- Update existing records
        -- Assume records with parte_trabajo_id are 'trabajo' type
        UPDATE fichajes 
        SET tipo = 'trabajo' 
        WHERE parte_trabajo_id IS NOT NULL;
        
        -- Records without parte_trabajo_id are 'presencia' type
        UPDATE fichajes 
        SET tipo = 'presencia' 
        WHERE parte_trabajo_id IS NULL;
        
        -- Add constraint
        ALTER TABLE fichajes 
        ADD CONSTRAINT fichajes_tipo_check 
        CHECK (tipo IN ('presencia', 'trabajo'));
        
        RAISE NOTICE 'Column tipo added to fichajes table successfully';
    ELSE
        RAISE NOTICE 'Column tipo already exists in fichajes table';
    END IF;
END $$;
