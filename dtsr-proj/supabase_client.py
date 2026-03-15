from supabase import create_client, Client
from config import Config

def get_supabase_client() -> Client:
    """Initializes and returns a Supabase client."""
    url: str = Config.SUPABASE_URL
    key: str = Config.SUPABASE_SERVICE_ROLE_KEY # Use service role key for backend operations
    return create_client(url, key)

# Reusable client instance
supabase: Client = get_supabase_client()
