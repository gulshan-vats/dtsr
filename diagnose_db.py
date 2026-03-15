
import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv(".env")

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_ANON_KEY")

if not url or not key:
    print("❌ Error: SUPABASE_URL or SUPABASE_ANON_KEY not found in environment.")
    exit(1)

supabase: Client = create_client(url, key)

def check_table(table_name):
    try:
        # Simple select to see if table exists
        res = supabase.table(table_name).select("count", count="exact").limit(1).execute()
        print(f"✅ Table '{table_name}' exists.")
        return True
    except Exception as e:
        if "PGRST205" in str(e) or "does not exist" in str(e):
            print(f"❌ Table '{table_name}' DOES NOT EXIST.")
        else:
            print(f"❓ Table '{table_name}' check failed: {e}")
        return False

print(f"Connecting to: {url}")
tables = ["chat_messages", "sessions", "projects"]
results = {t: check_table(t) for t in tables}

if all(results.values()):
    print("\n🚀 Database is READY. If things are still not working, please check the console for frontend errors.")
else:
    print("\n⚠️  Action Required: Please run the SQL provided in walkthrough.md to create the missing tables.")
