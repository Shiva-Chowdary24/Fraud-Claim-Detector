import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
 
# Load embedding model
embed_model = SentenceTransformer("all-MiniLM-L6-v2")
 
def split_text(text, chunk_size=300):
    sentences = text.split("\n")
    chunks = []
    current = ""

    for sentence in sentences:
        if len(current) + len(sentence) < chunk_size:
            current += sentence + "\n"
        else:
            chunks.append(current.strip())
            current = sentence + "\n"

    if current:
        chunks.append(current.strip())

    embeddings = embed_model.encode(chunks)
    faiss.normalize_L2(embeddings)

    index = faiss.IndexFlatIP(embeddings.shape[1])
    index.add(np.array(embeddings))

    return index, chunks
