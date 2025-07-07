from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import TranscriptsDisabled, NoTranscriptFound, VideoUnavailable

async def get_transcript(video_id: str) -> str:
    try:
        transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
        return " ".join([entry["text"] for entry in transcript_list])
    except (TranscriptsDisabled, NoTranscriptFound):
        raise Exception("Captions are disabled or not available for this video.")
    except VideoUnavailable:
        raise Exception("Video is unavailable or private.")
    except Exception as e:
        raise Exception(f"Failed to get transcript: {e}")
