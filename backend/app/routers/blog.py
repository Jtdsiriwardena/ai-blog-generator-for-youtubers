
# Real Youtube Data

from fastapi import APIRouter, HTTPException
from app.models.schemas import BlogRequest, BlogResponse
from app.utils.helpers import extract_video_id
from app.services.youtube import get_transcript
from app.services.gpt import generate_blog_post

router = APIRouter()

@router.post("/generate-blog", response_model=BlogResponse)
async def generate_blog(data: BlogRequest):
    print("Incoming request:", data)
    video_id = extract_video_id(data.youtube_url)
    if not video_id:
        raise HTTPException(status_code=400, detail="Invalid YouTube URL")

    try:
        transcript = await get_transcript(video_id)
        print("Transcript length:", len(transcript))
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

    if not transcript.strip():
        raise HTTPException(status_code=404, detail="Transcript not available or empty for this video")

    try:
        blog = generate_blog_post(transcript)
        print("Blog generated successfully.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OpenAI error: {str(e)}")

    return BlogResponse(**blog)



# #Dummy Data

# from fastapi import APIRouter
# from pydantic import BaseModel
# from typing import List

# router = APIRouter()

# class BlogRequest(BaseModel):
#     youtube_urls: List[str]

# class BlogResponse(BaseModel):
#     title: str
#     content: str

# @router.post("/generate-blog", response_model=BlogResponse)
# async def generate_blog(data: BlogRequest):
    
#     # Temporary dummy response for testing
#     return BlogResponse(
#     title="Discovering Nusa Penida: Bali’s Untouched Island Paradise",
#     content = (
#   "Nusa Penida, a breathtaking island just a short ferry ride from Bali, captivates visitors with its dramatic cliffs, crystal-clear turquoise waters, and stunning natural landscapes. " +
#   "Our journey began at bustling Sanur Port, where the rapid development of cafes, restaurants, and shops highlighted how much the area has transformed over the years. " +
#   "The trip here wasn’t without its challenges, including flooded roads and muddy trails that tested our resolve, but the island’s raw beauty and tranquil atmosphere made every moment worthwhile. " +
#   "We stayed at a charming boutique hotel that offered a perfect blend of comfort and romance, and set out on motorbikes to explore the island’s most iconic spots. " +
#   "From the pristine white sands of Atuh Beach to the iconic viewpoint at Diamond Beach, every location offered spectacular views and unique experiences. " +
#   "Along the way, we discovered hidden rock pools, enjoyed refreshing drinks from local shops, and witnessed the friendly hospitality of the island’s warm-hearted residents." +
#   "Although the rainy season brought unexpected rain and temporarily limited some activities, our days were still filled with memorable adventures and moments of peace. " +
#   "We savored traditional Indonesian dishes like mie goreng and nasi goreng at cozy warungs, chatted with locals eager to share their culture, and embraced the laid-back island lifestyle. " +
#   "The steep hikes up hills rewarded us with breathtaking vistas that made every step worthwhile, while evenings spent lounging by the pool allowed us to recharge and reflect on our journey. " +
#   "Nusa Penida, with its blend of untouched natural beauty and evolving local charm, is a perfect destination for travelers seeking both excitement and serenity. " +
#   "Whether exploring its rugged terrain or simply soaking in its peaceful ambiance, this island promises unforgettable memories far from the well-trodden paths of Bali."
# )

# )

