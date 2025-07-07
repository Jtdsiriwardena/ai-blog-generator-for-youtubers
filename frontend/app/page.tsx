'use client';

import { useState } from 'react';
import axios from 'axios';
import Image from 'next/image';
import TiptapEditor from './components/TiptapEditor';

//Types
type Video = {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    publishedAt: string;
    thumbnails: {
      medium: {
        url: string;
      };
    };
  };
};

type Blog = {
  title: string;
  content: string;
  highlights: string[];
  tips: string[];
};

type ChannelInfo = {
  title: string;
  avatarUrl?: string;
  bannerUrl?: string;
  subscriberCount: string;
  videoCount: string;
  description: string;
};

export default function YouTubeGallery() {
  const [channelInput, setChannelInput] = useState('');
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [editableBlog, setEditableBlog] = useState<Blog | null>(null);
  const [generating, setGenerating] = useState(false);

  const [channelInfo, setChannelInfo] = useState<ChannelInfo | null>(null);

  const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

  const getChannelIdFromQuery = async (query: string): Promise<string | null> => {
    const url = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&q=${encodeURIComponent(
      query
    )}&type=channel&part=snippet`;
    try {
      const res = await axios.get(url);
      return res.data.items[0]?.snippet?.channelId || null;
    } catch (err) {
      console.error('Error fetching channel ID:', err);
      return null;
    }
  };

  const getChannelDetails = async (channelId: string): Promise<void> => {
    try {
      const url = `https://www.googleapis.com/youtube/v3/channels?key=${YOUTUBE_API_KEY}&id=${channelId}&part=snippet,statistics,brandingSettings`;
      const res = await axios.get(url);
      const channel = res.data.items[0];
      if (!channel) {
        setChannelInfo(null);
        return;
      }
      setChannelInfo({
        title: channel.snippet.title,
        avatarUrl: channel.snippet.thumbnails?.medium?.url, 
        bannerUrl: channel.brandingSettings?.image?.bannerExternalUrl,
        subscriberCount: channel.statistics.subscriberCount,
        videoCount: channel.statistics.videoCount,
        description: channel.statistics.description,
      });
    } catch (err) {
      console.error('Error fetching channel details:', err);
      setChannelInfo(null);
    }
  };

  const getRecentVideos = async (channelId: string): Promise<void> => {
    setLoading(true);
    const url = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${channelId}&part=snippet&order=date&maxResults=20`;
    try {
      const res = await axios.get(url);
      setVideos(res.data.items);
    } catch (err) {
      console.error('Error fetching videos:', err);
    }
    setLoading(false);
  };

  const fetchVideos = async () => {
    if (!channelInput.trim()) return;
    setVideos([]);
    setSelectedVideos([]);
    setEditableBlog(null);
    setChannelInfo(null);
    const channelId = await getChannelIdFromQuery(channelInput);
    if (!channelId) return;
    await Promise.all([getRecentVideos(channelId), getChannelDetails(channelId)]);
  };

  const toggleVideoSelection = (videoId: string) => {
    setSelectedVideos((prev) =>
      prev.includes(videoId) ? prev.filter((id) => id !== videoId) : [...prev, videoId]
    );
  };

  const generateCombinedBlog = async () => {
  if (selectedVideos.length === 0) return;
  setGenerating(true);

  const url = `https://www.youtube.com/watch?v=${selectedVideos[0]}`; // only first video URL

  try {
    const res = await axios.post<Blog>('http://127.0.0.1:8000/generate-blog', {
      youtube_url: url,
    });
    setEditableBlog(res.data);
  } catch (err) {
    console.error('Blog generation failed', err);
  }
  setGenerating(false);
};


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatNumber = (num: string) => {
    return parseInt(num).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              YouTube Blog Generator
            </h1>
            <p className="text-slate-600 text-lg">
              Transform your videos into engaging blog content with AI
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-slate-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Enter YouTube channel name or URL..."
                value={channelInput}
                onChange={(e) => setChannelInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && fetchVideos()}
                className="w-full pl-12 pr-4 py-4 text-lg border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all duration-200"
              />
            </div>
            <button
              onClick={fetchVideos}
              disabled={loading || !channelInput.trim()}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Loading...
                </>
              ) : (
                <>
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Fetch Videos
                </>
              )}
            </button>
          </div>
        </div>

        {/* Channel Info */}
        {channelInfo && (
          <div className="mb-8 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 opacity-50"></div>
            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm"></div>

            {/* Main Content */}
            <div className="relative bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              {/* Banner Background */}
              {channelInfo.bannerUrl && (
                <div className="absolute inset-0 opacity-20">
                  <Image
                    src={channelInfo.bannerUrl}
                    alt={`${channelInfo.title} banner`}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Content */}
              <div className="relative p-8">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  {/* Channel Avatar/Banner */}
                  <div className="flex-shrink-0">
                    {channelInfo.avatarUrl ? (
                      <div className="relative group">
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-white shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                          <Image
                            src={channelInfo.avatarUrl}
                            alt={`${channelInfo.title} avatar`}
                            width={96}
                            height={96}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        {/* Verified Badge */}
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    ) : (
                      <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                        <svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Channel Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
                          {channelInfo.title}
                        </h2>
                        <div className="flex flex-wrap items-center gap-4 text-slate-600">
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium">
                              {formatNumber(channelInfo.subscriberCount)}
                            </span>
                            <span className="text-sm">subscribers</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                            </svg>
                            <span className="font-medium">
                              {formatNumber(channelInfo.videoCount)}
                            </span>
                            <span className="text-sm">videos</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                          </svg>
                          <span className="hidden sm:inline">Visit Channel</span>
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-white/80 hover:bg-white text-slate-700 font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-slate-200">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                          </svg>
                          <span className="hidden sm:inline">Share</span>
                        </button>
                      </div>
                    </div>

                    {/* Channel Description Preview */}
                    {channelInfo.description && (
                      <div className="mt-4 p-4 bg-white/50 rounded-lg border border-slate-200">
                        <p className="text-slate-700 text-sm line-clamp-2">
                          {channelInfo.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Channel Stats */}
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-white/50 rounded-lg">
                      <div className="text-lg font-bold text-slate-800">
                        {formatNumber(channelInfo.subscriberCount)}
                      </div>
                      <div className="text-xs text-slate-500 uppercase tracking-wide">
                        Subscribers
                      </div>
                    </div>
                    <div className="text-center p-3 bg-white/50 rounded-lg">
                      <div className="text-lg font-bold text-slate-800">
                        {formatNumber(channelInfo.videoCount)}
                      </div>
                      <div className="text-xs text-slate-500 uppercase tracking-wide">
                        Videos
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Videos Grid */}
        {videos.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Select Videos</h2>
              <div className="text-sm text-slate-500">
                {selectedVideos.length} of {videos.length} selected
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {videos.map((video) => (
                <div
                  key={video.id.videoId}
                  className={`group relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer border-2 ${selectedVideos.includes(video.id.videoId)
                      ? 'border-blue-500 ring-4 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                    }`}
                  onClick={() => toggleVideoSelection(video.id.videoId)}
                >
                  {/* Selection Indicator */}
                  <div className="absolute top-3 right-3 z-10">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${selectedVideos.includes(video.id.videoId)
                          ? 'bg-blue-500 border-blue-500'
                          : 'bg-white border-slate-300 group-hover:border-blue-400'
                        }`}
                    >
                      {selectedVideos.includes(video.id.videoId) && (
                        <svg
                          className="w-4 h-4 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </div>

                  {/* Thumbnail */}
                  <div className="relative overflow-hidden">
                    <Image
                      src={video.snippet.thumbnails.medium.url}
                      alt={video.snippet.title}
                      width={320}
                      height={180}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-800 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                      {video.snippet.title}
                    </h3>
                    <p className="text-sm text-slate-500 flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {formatDate(video.snippet.publishedAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generate Button */}
        {selectedVideos.length > 0 && (
          <div className="text-center mb-8">
            <button
              onClick={generateCombinedBlog}
              disabled={generating}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-3 mx-auto disabled:cursor-not-allowed"
            >
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Generating Blog...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  Generate Blog from {selectedVideos.length} Video
                  {selectedVideos.length > 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>
        )}

        {/* Blog Editor */}
        {editableBlog && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-8 py-6 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Edit Your Blog</h2>
              <p className="text-slate-600">Customize your generated blog content before publishing</p>
            </div>

            <div className="p-8 space-y-8">
              {/* Title Section */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide">
                  Blog Title
                </label>
                <input
                  className="w-full text-2xl font-bold border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all duration-200"
                  value={editableBlog.title}
                  onChange={(e) => setEditableBlog({ ...editableBlog, title: e.target.value })}
                  placeholder="Enter your blog title..."
                />
              </div>

              {/* Content Editor */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide">
                  Blog Content
                </label>
                <div className="border-2 border-slate-200 rounded-xl overflow-hidden focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/20 transition-all duration-200">
                  <TiptapEditor
                    content={editableBlog.content}
                    onChange={(val) => setEditableBlog({ ...editableBlog, content: val })}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-200">
                <button className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  Publish Blog
                </button>
                <button className="flex-1 px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
