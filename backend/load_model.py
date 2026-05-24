from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline
import torch

class sentiment_model:
    def __init__(self):
        self.path = "torbob69/bertweet-sentiment-classifier"
        self.tokenizer = AutoTokenizer.from_pretrained(self.path)
        self.model = AutoModelForSequenceClassification.from_pretrained(self.path)

    def predict(self, text: str):
        inputs = self.tokenizer(text, return_tensors="pt", truncation=True, max_length=128)

        with torch.no_grad():
            logits = self.model(**inputs).logits

        predicted_class = torch.argmax(logits, dim=-1).item()
        label = self.model.config.id2label[predicted_class]
        return "POSITIVE" if label == "LABEL_1" else "NEGATIVE"


class ner_model:
    def __init__(self):
        self.pipe = pipeline(
            "ner",
            model="tner/roberta-large-ontonotes5",
            aggregation_strategy="simple"
        )

    def predict(self, text: str):
        return self.pipe(text)


class qa_model:
    def __init__(self):
        self.pipe = pipeline(
            "question-answering",
            model="deepset/roberta-base-squad2"
        )

    def predict(self, entity: str, context: str):
        result = self.pipe({
            "question": f"What did {entity} do?",
            "context": context
        })
        return result["answer"]


class entity_sentiment_pipeline:
    def __init__(self):
        self.ner = ner_model()
        self.qa = qa_model()
        self.sentiment = sentiment_model()

    def predict(self, tweet: str):
        overall_sentiment = self.sentiment.predict(tweet)
        ner_results = self.ner.predict(tweet)
        entities = []
        keep = {"PERSON", "ORG", "GPE", "LOC", "MONEY"}

        for entity in ner_results:
            if entity["entity_group"] not in keep:
                continue
            name = entity["word"]
            action = self.qa.predict(name, tweet)
            sentiment = self.sentiment.predict(action)
            entities.append({
                "entity": name,
                "action": action,
                "sentiment": sentiment
            })

        return {"overall_sentiment" : overall_sentiment, "entities" : entities}

pipeline_models = entity_sentiment_pipeline()