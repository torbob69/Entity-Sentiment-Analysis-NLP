from fastapi import FastAPI, HTTPException, Cookie
from fastapi.responses import RedirectResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import tweepy, logging
from config import consumer_key, consumer_secret, my_access_token
from services import get_tweets, predict_tweet, check_acc_token
from schemas import predict_queries

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Temp store for request token secrets between /login and /callback
# Use Redis or a DB in production
request_token_store: dict[str, str] = {}

@app.get("/test")
def test():
    return "hi"

@app.get("/debug-config")
def debug_config():
    return {
        "consumer_key_loaded": bool(consumer_key),
        "consumer_key_prefix": consumer_key[:6] + "..." if consumer_key else None,
        "consumer_secret_loaded": bool(consumer_secret),
        "callback_url": "http://localhost:8000/callback",
    }

@app.get("/debug-sentiment")
def debug_sentiment():
    from load_model import pipeline_models
    model = pipeline_models.sentiment
    samples = [
        "I love this so much, it's amazing!",
        "This is terrible and I hate it.",
        "Wemby is the best player in the NBA.",
    ]
    return {
        "id2label": model.model.config.id2label,
        "samples": [{"text": t, "result": model.predict(t)} for t in samples],
    }

@app.post("/debug-predict")
async def debug_predict(body: dict):
    text = body.get("text", "")
    if not text:
        raise HTTPException(status_code=400, detail="'text' field is required")
    from services import predict_tweet
    return await predict_tweet(text)

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
    except tweepy.TweepyException as e:
        logger.exception("OAuth init failed: %s", e)
        raise HTTPException(status_code=502, detail=f"Failed to reach Twitter API: {e}")

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

    # return {"access_token": access_token, "access_token_secret": access_token_secret}
    
    res = RedirectResponse("http://127.0.0.1:5173/dashboard")
    res.set_cookie(key="access_token", value=access_token, httponly=True, samesite="lax")
    res.set_cookie(key="access_token_secret", value=access_token_secret, httponly=True, samesite="lax")
    
    return res
    

@app.post("/predict")
async def predict(search_query: predict_queries, access_token: str | None = Cookie(default=None), access_token_secret: str | None = Cookie(default=None)):
    if not access_token or not access_token_secret:
        raise HTTPException(status_code=401, detail="Not authenticated, please sign in with your X account")
    await check_acc_token(access_token, access_token_secret)
    tweets: dict[dict] = await get_tweets(search_query)
    for t in tweets:
        tweets[t]["result"] = await predict_tweet(tweets[t]["text"])
    return tweets

@app.post("/logout")
async def logout():
    res = JSONResponse({"message": "Logged out"})
    res.delete_cookie("access_token", samesite="lax")
    res.delete_cookie("access_token_secret", samesite="lax")
    return res