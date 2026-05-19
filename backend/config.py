import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

consumer_key = os.getenv("X_CONSUMER_KEY")
consumer_secret = os.getenv("X_CONSUMER_SECRET")
my_access_token = os.getenv("ACC_TOKEN")
