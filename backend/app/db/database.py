import logging
from supabase import create_client, Client
from app.core.config import settings

logger = logging.getLogger(__name__)

# Global singleton client
_supabase_client: Client | None = None

def get_supabase_client() -> Client:
    """
    Returns a configured Supabase client instance using the environment credentials.
    Reuses the client instance if already created.
    """
    global _supabase_client
    
    if _supabase_client is None:
        if not settings.supabase_url or not settings.supabase_key:
            logger.warning("SUPABASE_URL and SUPABASE_KEY are not fully set in .env. Database connection will fail.")
            # Returning early or attempting to create client with empty values will likely throw.
            # We raise a ValueError to prevent silent failures during operation.
            raise ValueError("Supabase environment variables (url, key) must be set.")
            
        try:
            _supabase_client = create_client(settings.supabase_url, settings.supabase_key)
        except Exception as e:
            logger.error(f"Failed to initialize Supabase client: {str(e)}")
            raise e
            
    return _supabase_client
