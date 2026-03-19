from models import ner, qa, sentiment

text = "Boeing stock price target raised to $427 from $406 at CFRA"

entities = ner.get_entity(text)

qa.get_description(entities, text)
sentiment.get_sentiment(entities)

for entity in entities:
    entity.show_self()
