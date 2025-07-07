from pydantic import BaseModel

class BlogRequest(BaseModel):
    youtube_url: str

class BlogResponse(BaseModel):
    title: str
    content: str
    highlights: list[str]
    tips: list[str]
