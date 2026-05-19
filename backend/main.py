from fastapi import FastAPI, HTTPException
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
import tweepy
from config import consumer_key, consumer_secret, my_access_token
from services import get_tweets, predict_tweet, check_acc_token
from schemas import predict_queries

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Temp store for request token secrets between /login and /callback
# Use Redis or a DB in production
request_token_store: dict[str, str] = {}

@app.get("/test")
def test():
    return "hi"

@app.get("/login")
async def login():
    if not consumer_key or not consumer_secret:
        raise HTTPException(status_code=503, detail="Twitter API credentials not configured")

    try:
        oauth = tweepy.OAuth1UserHandler(
            consumer_key=consumer_key,
            consumer_secret=consumer_secret,
            callback="http://127.0.0.1:8000/callback"
        )
        auth_url = oauth.get_authorization_url()
    except tweepy.TweepyException:
        raise HTTPException(status_code=502, detail="Failed to reach Twitter API, please try again later")

    request_token_store[oauth.request_token["oauth_token"]] = oauth.request_token["oauth_token_secret"]
    return RedirectResponse(auth_url)

@app.get("/callback")
async def callback(oauth_token: str, oauth_verifier: str):
    oauth_token_secret = request_token_store.pop(oauth_token, None)
    if not oauth_token_secret:
        raise HTTPException(status_code=400, detail="Invalid or expired oauth_token")

    oauth = tweepy.OAuth1UserHandler(
        consumer_key=consumer_key,
        consumer_secret=consumer_secret,
    )
    oauth.request_token = {
        "oauth_token": oauth_token,
        "oauth_token_secret": oauth_token_secret,
    }

    try:
        access_token, access_token_secret = oauth.get_access_token(oauth_verifier)
    except tweepy.Unauthorized:
        raise HTTPException(status_code=401, detail="Invalid OAuth verifier, please restart the login flow")
    except tweepy.TweepyException:
        raise HTTPException(status_code=502, detail="Failed to complete OAuth with Twitter, please try again later")

    return {"access_token": access_token, "access_token_secret": access_token_secret}

@app.post("/predict")
async def predict(acc_token: str, acc_token_secret: str, search_query: predict_queries):
    if not acc_token or not acc_token_secret:
        raise HTTPException(status_code=400, detail="Access token and secret are required")

    await check_acc_token(acc_token, acc_token_secret)
    tweets: dict[dict] = await get_tweets(search_query)
    for t in tweets:
        tweets[t]["result"] = await predict_tweet(tweets[t]["text"])

    return tweets