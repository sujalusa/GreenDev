-- Create rate_limits table
CREATE TABLE IF NOT EXISTS public.rate_limits (
    ip TEXT PRIMARY KEY,
    count INTEGER NOT NULL DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create scans table
CREATE TABLE IF NOT EXISTS public.scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repo_url TEXT NOT NULL,
    repo_name TEXT,
    deployment_config JSONB NOT NULL,
    result JSONB NOT NULL,
    score INTEGER NOT NULL,
    score_label TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security) if you want it (usually good practice)
-- ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- If using service role key, RLS is bypassed. 
