from fastapi import APIRouter
from pydantic import BaseModel

from rag.loader import load_documents
from rag.vectorstore import split_text
from rag.qa import retrieve, generate_answer

# ✅ ROUTER INSTEAD OF APP
router = APIRouter()

# ✅ Load once
text = load_documents()
index, chunks = split_text(text)

class ChatRequest(BaseModel):
    message: str

@router.post("/chat")
def chat(request: ChatRequest):
    query = request.message
    context = retrieve(query, index, chunks)
    answer = generate_answer(query, context)
    return {"response": answer}
