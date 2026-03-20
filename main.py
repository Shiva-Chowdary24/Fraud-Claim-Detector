from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import auth, admin, customer, predict

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(customer.router)
app.include_router(predict.router)

@app.get("/health")
def health():
    return {"status": "ok"}
    
