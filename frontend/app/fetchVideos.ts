import axios from "axios";

// Utility: extract channel handle from URL or just return name
function extractChannelQuery(input: string): string {
  if (input.includes("youtube.com")) {
    const match = input.match(/@([^\/\s]+)/);
    return match ? match[1] : "";
  }
  return input.trim();
}

// Step 1: Convert query to channelId
export async function getChannelIdFromQuery(query: string): Promise<string | null> {
  const searchQuery = extractChannelQuery(query);
  const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

  try {
    const res = await axios.get("https://www.googleapis.com/youtube/v3/search", {
      params: {
        part: "snippet",
        type: "channel",
        q: searchQuery,
        maxResults: 1,
        key: apiKey,
      },
    });

    if (res.data.items.length > 0) {
      return res.data.items[0].snippet.channelId;
    }

    return null;
  } catch (err) {
    console.error("Error fetching channelId:", err);
    return null;
  }
}

// Step 2: Get recent videos
export async function getRecentVideos(channelId: string) {
  const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

  const res = await axios.get("https://www.googleapis.com/youtube/v3/search", {
    params: {
      part: "snippet",
      order: "date",
      channelId,
      maxResults: 5,
      key: apiKey,
    },
  });

  return res.data.items;
}
