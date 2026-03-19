class Entity:
    name: str
    sentiment: str
    sentence: str

    def __init__(self, n):
        self.name = n

    def set_sentence(self, text: str):
        self.sentence = text

    def get_sentence(self):
        return self.sentence

    def show_self(self):
        print(f"Entity : {self.name}")
        print(f"Sentiment : {self.sentiment}")
        print(f"Text support : {self.sentence}")

    def return_result(self):
        return {
            "name": {self.name},
            "sentiment": {self.sentiment},
            "sentence": {self.sentence},
        }
