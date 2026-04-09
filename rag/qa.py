import numpy as np
import faiss
from sentence_transformers import SentenceTransformer
 
embed_model = SentenceTransformer("all-MiniLM-L6-v2")
 
# ================= RETRIEVE =================
def retrieve(query, index, chunks, k=3):
    q_embedding = embed_model.encode([query])
    faiss.normalize_L2(q_embedding)

    distances, indices = index.search(q_embedding, k)

    results = [chunks[i] for i in indices[0]]
    return "\n".join(results)

 
 
# ================= GENERATE ANSWER =================
def generate_answer(query, context):
    q = query.lower()
 
    # ❌ If no useful context → reject
    if len(context.strip()) < 30:
        return """
I couldn't find relevant information for your query.
 
👉 Please ask insurance-related questions or contact support.
"""
 
    # ✅ Clean output
    cleaned = context.replace("-", "\n- ")
    return cleaned[:400]
