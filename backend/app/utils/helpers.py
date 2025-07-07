import re

def extract_video_id(url: str) -> str | None:
    # Support YouTube watch, share, and embed links
    pattern = (
        r"(?:youtube\.com\/(?:.*v=|embed\/)|youtu\.be\/)"
        r"([a-zA-Z0-9_-]{11})"
    )
    match = re.search(pattern, url)
    return match.group(1) if match else None
