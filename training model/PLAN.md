# Experiment Plan: Multi-Transformer Twitter Sentiment Analysis

## Goal
Train and compare 4 transformer models on binary Twitter sentiment classification
using a uniform, fair pipeline. Report per-class metrics via `classification_report`.

---

## Models

| # | Short Name | HuggingFace ID | Params |
|---|-----------|----------------|--------|
| 1 | bert-base | `bert-base-uncased` | 110M |
| 2 | distilbert | `distilbert-base-uncased` | 66M |
| 3 | bertweet | `vinai/bertweet-base` | 135M |
| 4 | roberta-large | `cardiffnlp/twitter-roberta-large-2022-154m` | ~355M |

---

## Dataset

- **Source:** `datasets/twitter 3m rows/twitter_dataset.csv`
- **Full size:** ~3.1M rows
- **Labels:** Binary — `0` (negative), `1` (positive). Class `2` is dropped.
- **Sampled:** 300,000 rows

---

## Preprocessing (already in main.ipynb)

```python
def preprocessing(text):
    text = html.unescape(text)
    text = re.sub(r"^RT\s+", "", text)
    text = re.sub(r"http\S+|www\.\S+", "HTTPURL", text)
    text = re.sub(r"@\w+", "@USER", text)
    text = emoji.demojize(text, delimiters=(" ", " "))
    text = re.sub(r'\s+', ' ', text).strip()
    return text
```

---

## Data Split

3-way stratified split:

```python
df_compressed, _ = train_test_split(df, train_size=300_000, stratify=df["sentiment"], random_state=21)
df_train, df_temp = train_test_split(df_compressed, test_size=0.2, stratify=df_compressed["sentiment"], random_state=21)
df_val,   df_test = train_test_split(df_temp,        test_size=0.5, stratify=df_temp["sentiment"],        random_state=21)
# → train: 240k | val: 30k | test: 30k
```

---

## Uniform Settings

```python
MAX_EPOCHS  = 2
BATCH_SIZE  = 32
MAX_LENGTH  = 128
NUM_LABELS  = 2
```

---

## Training Config (per model)

```python
TrainingArguments(
    output_dir        = f"./models_new/<short-name>",
    num_train_epochs  = MAX_EPOCHS,
    per_device_train_batch_size = BATCH_SIZE,
    per_device_eval_batch_size  = BATCH_SIZE,
    learning_rate     = 2e-5,
    weight_decay      = 0.01,
    warmup_ratio      = 0.1,
    fp16              = True,
    eval_strategy     = "epoch",
    save_strategy     = "no",       # no checkpoints
    logging_strategy  = "epoch",
)
```

---

## Notebook Structure (main.ipynb)

### Shared Setup (run once)
```
[cell] imports
[cell] load & preprocess dataframe
[cell] 3-way stratified split
[cell] define compute_metrics (accuracy + f1_macro)
```

### Per Model (4 × the same pattern)

```
─── Model: <name> ───────────────────────────────
[cell] load tokenizer → tokenize train / val / test
[cell] load model → TrainingArguments → Trainer → trainer.train()
[cell] trainer.predict(tok_test) → classification_report
[cell] model.save_pretrained / tokenizer.save_pretrained → models_new/<short-name>/
```

---

## Evaluation (test set only)

```python
from sklearn.metrics import classification_report

preds_output = trainer.predict(tok_test)
y_pred = np.argmax(preds_output.predictions, axis=-1)
y_true = preds_output.label_ids

print(classification_report(y_true, y_pred, target_names=["negative", "positive"]))
```

---

## Save Structure

```
models_new/
├── bert-base-uncased/
├── distilbert-base-uncased/
├── bertweet-base/
└── twitter-roberta-large-2022-154m/
```

---

## Results Table (fill after training)

| Model | Acc | P (neg) | R (neg) | F1 (neg) | P (pos) | R (pos) | F1 (pos) | F1 macro | F1 weighted |
|-------|-----|---------|---------|----------|---------|---------|----------|----------|-------------|
| bert-base-uncased | — | — | — | — | — | — | — | — | — |
| distilbert-base-uncased | — | — | — | — | — | — | — | — | — |
| vinai/bertweet-base | — | — | — | — | — | — | — | — | — |
| twitter-roberta-large | — | — | — | — | — | — | — | — | — |

> P = Precision, R = Recall. All values from test set.

---

## Checklist

- [ ] Add `stratify` to all 3 splits
- [ ] Confirm `num_labels=2` for all models
- [ ] bert-base-uncased — train
- [ ] distilbert-base-uncased — train
- [ ] vinai/bertweet-base — train
- [ ] twitter-roberta-large-2022-154m — train (monitor VRAM, may need batch 16 if OOM)
- [ ] Fill results table
