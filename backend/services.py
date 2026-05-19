import tweepy
from config import my_access_token, consumer_key, consumer_secret
from fastapi import HTTPException
from Scweet import Scweet
from Scweet.exceptions import RateLimitError
import re, emoji, html
from schemas import predict_queries
from load_model import pipeline_models

def preprocessing(text: str):
    text = html.unescape(text)
    text = re.sub(r'^RT\s+', '', text)
    text = re.sub(r'http\S+|www\.\S+', 'HTTPURL', text)
    text = re.sub(r'@\w+', '@USER', text)
    text = emoji.demojize(text, delimiters=(' ', ' '))
    text = re.sub(r'\s+', ' ', text).strip()
    return text

async def check_acc_token(acc_token: str, acc_token_secret: str):
    client = tweepy.Client(
        consumer_key=consumer_key,
        consumer_secret=consumer_secret,
        access_token=acc_token,
        access_token_secret=acc_token_secret
    )

    try:
        client.get_me()
    except tweepy.Unauthorized:
        raise HTTPException(status_code=401, detail="Access token not found, please re-sign-in with your X account")
    except tweepy.Forbidden:
        raise HTTPException(status_code=403, detail="Access token does not have permission to read this account")
    except tweepy.TooManyRequests:
        raise HTTPException(status_code=429, detail="Twitter API rate limit exceeded, please try again later")
    except tweepy.TweepyException:
        raise HTTPException(status_code=502, detail="Unable to reach Twitter API, please try again later")
    
async def get_tweets(query: predict_queries):
    if not my_access_token:
        raise HTTPException(status_code=503, detail="Scraper auth token not configured")

    tweets = {}
    try:
        s = Scweet(auth_token=my_access_token)
        temp_tweets = await s.asearch(query.search_query, limit=query.limit, since=str(query.since), until=str(query.until), lang=query.languange, min_likes=query.min_likes, verified_only=query.verified_only)
    except RateLimitError:
        raise HTTPException(status_code=429, detail="Search limit reached, please try again in 24 hours")
    except Exception:
        raise HTTPException(status_code=502, detail="Failed to fetch tweets, please try again later")

    for t in temp_tweets:
        tweets[t["tweet_url"]] = {"text": t["text"]}

    if len(tweets) <= 10:
        raise HTTPException(status_code=422, detail="Tweets collected less than 10, can't process")

    return tweets

async def predict_tweet(text: str):
    try:
        result = pipeline_models.predict(text)
    except Exception:
        raise HTTPException(status_code=503, detail="Prediction model unavailable, please try again later")
    return result