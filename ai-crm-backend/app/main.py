from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers.interactions import router as interactions_router
from .routers.agent import router as agent_router

app = FastAPI(title="AI CRM Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(interactions_router, prefix="/interactions", tags=["interactions"])
app.include_router(agent_router)   # <-- add this

@app.get("/")
def home():
    return {"status": "Backend running"}
