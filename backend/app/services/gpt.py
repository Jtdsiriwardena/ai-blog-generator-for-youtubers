import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise Exception("OPENAI_API_KEY is not set in your .env file")

client = OpenAI(api_key=api_key)

def generate_blog_post(transcript: str) -> dict:
    prompt = f"""
You are a professional travel blogger. Write a blog post based on the following YouTube video transcript:

Transcript:
\"\"\"
{transcript}
\"\"\"

Your response should include:
1. A catchy title
2. A well-written travel blog article (500–700 words)
3. 3–5 trip highlights (as a list)
4. 3–5 travel tips (as a list)

Format:
Title: ...
Content: ...
Highlights:
- ...
- ...
Tips:
- ...
- ...
"""

    print("Calling OpenAI with prompt of length:", len(prompt))

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )
        content = response.choices[0].message.content
        print("Received response from OpenAI")
    except Exception as e:
        raise Exception(f"OpenAI API error: {e}")

    def extract_section(label):
        start = content.find(f"{label}:")
        if start == -1:
            return ""
        end = content.find("\n\n", start)
        extracted = content[start + len(label) + 1:end].strip() if end != -1 else content[start + len(label) + 1:].strip()
        return extracted.replace("- ", "").split("\n") if label in ["Highlights", "Tips"] else extracted

    return {
        "title": extract_section("Title"),
        "content": extract_section("Content"),
        "highlights": extract_section("Highlights"),
        "tips": extract_section("Tips"),
    }
