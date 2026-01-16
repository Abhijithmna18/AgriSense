from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import router
import uvicorn
import os

app = FastAPI(title="AgriSense Farm Service")

# CORS Setup - Allow all for dev, restrict in prod
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Update this to match frontend URL in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api/v1")

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
