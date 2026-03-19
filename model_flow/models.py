import re

from gliner import GLiNER
from transformers import pipeline

from .entity import Entity
from .labels import possible_entities


class ner_model:
    def __init__(self):
        # tokenizer = AutoTokenizer.from_pretrained("dslim/bert-base-NER-uncased")
        # model = AutoModelForTokenClassification.from_pretrained("dslim/bert-base-NER-uncased")
        # self.pipe = pipeline("ner", model=model, tokenizer=tokenizer, aggregation_strategy="simple")
        self.pipe = GLiNER.from_pretrained("urchade/gliner_medium-v2.1")
        self.labels = possible_entities

    def get_entity(self, text: str):
        # entities = []
        # result : list[dict] = self.pipe(text)

        # for curr in result:
        #     word = curr['word']

        #     if word.startswith("##") and len(entities) > 0:
        #         entities[-1] = entities[-1] + word.replace("##", "")
        #     else:
        #         entities.append(word)

        # self.entity_result : list[Entity] = []
        # for entity in entities :
        #      self.entity_result.append(Entity(entity))

        # return self.entity_result

        ent = self.pipe.predict_entities(text, labels=self.labels, threshold=0.5)
        self.entities: list[Entity] = []
        for e in ent:
            self.entities.append(Entity(e["text"]))

        return self.entities


class qa_model:
    def __init__(self):
        model = "deepset/deberta-v3-large-squad2"
        self.pipe = pipeline(task="question-answering", model=model, device=0)

    def clean_text(self, text: str) -> str:
        text = re.sub(r"http\S+|www\.\S+", "HTTPURL", text)
        text = re.sub(r"@\w+", "@USER", text)
        return text

    def get_description(self, entities: list[Entity], text: str):

        for i in range(len(entities)):
            question = f"what did {entities[i].name} do?"
            answer = self.pipe(question=question, context=text)
            entities[i].set_sentence(self.clean_text(answer["answer"]))


class sentiment_model:
    def __init__(self):
        model = "torbob69/bert-base-uncased-twitter-sentiment"
        self.pipe = pipeline(task="text-classification", model=model, device=0)

    def clean_text(self, text: str) -> str:
        text = re.sub(r"http\S+|www\.\S+", "HTTPURL", text)
        text = re.sub(r"@\w+", "@USER", text)
        return text

    def get_entity_sentiment(self, entities: list[Entity]):
        for i in range(len(entities)):
            entities[i].sentiment = self.pipe(entities[i].sentence)

    def get_text_sentiment(self, text: str):
        clean_text = self.clean_text(text)
        return self.pipe(clean_text)


# text = "Crazy moves by @CathieDWood dumping 50k shares of $COIN to double down on $PLTR right before tomorrow's 2PM FOMC meeting... 🤯 JPow is definitely gonna hike rates by 25bps. Meanwhile, the SEC keeps dragging their feet on the new #Ethereum ETF. I'm just YOLOing my remaining liquidity into $DOGE until Q3 earnings drop. 🚀 NFA. t.co/xYz123"

ner = ner_model()
qa = qa_model()
sentiment = sentiment_model()

# entities : list[Entity] = ner.get_entity(text)

# for entity in entities :
#     print(entity.name)


# qa.get_description(entities, text)

# for entity in entities :
#     print(entity.name, entity.get_sentence())
