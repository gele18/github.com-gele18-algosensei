-- Create transfers table for peer-to-peer transactions
CREATE TABLE IF NOT EXISTS public.transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  to_wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  amount DECIMAL(20, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  crypto_symbol TEXT,
  crypto_amount DECIMAL(20, 8),
  status TEXT NOT NULL DEFAULT 'completed',
  description TEXT,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;

-- Transfers policies - users can see transfers they sent or received
CREATE POLICY "Users can view their transfers"
  ON public.transfers FOR SELECT
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can insert their own transfers"
  ON public.transfers FOR INSERT
  WITH CHECK (auth.uid() = from_user_id);

-- Create index for faster lookups
CREATE INDEX idx_transfers_from_user ON public.transfers(from_user_id);
CREATE INDEX idx_transfers_to_user ON public.transfers(to_user_id);
CREATE INDEX idx_transfers_created_at ON public.transfers(created_at DESC);

-- Update wallets table to allow reading other users' wallet addresses for transfers
CREATE POLICY "Users can view wallet addresses for transfers"
  ON public.wallets FOR SELECT
  USING (true);
