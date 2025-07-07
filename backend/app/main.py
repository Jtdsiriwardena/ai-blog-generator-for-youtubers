import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.routers import blog

load_dotenv() 

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(blog.router)


@app.get("/")
async def root():
    openai_key = os.getenv("OPENAI_API_KEY")
    youtube_key = os.getenv("YOUTUBE_API_KEY")
    return {
        "message": "AI Blog Generator backend is running!",
        "openai_key_exists": openai_key is not None,
        "youtube_key_exists": youtube_key is not None
    }
