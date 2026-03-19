from fastapi import FastAPI

from model_flow.entity import Entity
from model_flow.models import ner, qa, sentiment

app = FastAPI()


def predict_text_sentiment(text: str):
    result = sentiment.get_text_sentiment(text)
    return {
        "status": "No entities were found, using text sentiment analysis",
        "text": text,
        "result": result,
    }


@app.get("/predict")
async def predict_entity_sentiment(text: str):
    entities = ner.get_entity(text)

    if len(entities) == 0:
        return predict_text_sentiment(text)

    qa.get_description(entities, text)
    sentiment.get_entity_sentiment(entities)
    return {"status": "Entities were found", "entities": entities}
