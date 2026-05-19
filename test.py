# from Scweet import Scweet
# import re, emoji, html

# def preprocessing(text: str):
#     text = html.unescape(text)
#     text = re.sub(r'^RT\s+', '', text)
#     text = re.sub(r'http\S+|www\.\S+', 'HTTPURL', text)
#     text = re.sub(r'@\w+', '@USER', text)
#     text = emoji.demojize(text, delimiters=(' ', ' '))
#     text = re.sub(r'\s+', ' ', text).strip()
#     return text

# s = Scweet(auth_token="c5e0832fe6ec948a7a56c5bb4441d7c34e3f2cb3")
# tweets = s.search("donald trump", since="2026-01-01", limit=10)

# for t in tweets:
#     print("="*50)
#     print(preprocessing(t["text"]))
#     print()
from datetime import date, datetime

this_year = date.today().year
early_this_year = "01-01-" + str(this_year)
date_object = datetime.strptime(early_this_year, "%d-%m-%Y").date()
# print(early_this_year)
print(date_object)