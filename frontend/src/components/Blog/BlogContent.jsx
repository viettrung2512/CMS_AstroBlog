"use client"

import { useNavigate, useParams } from "react-router-dom"
import { useState, useEffect } from "react"
import CommentButton from "../Button/CommentButton"
import RelatedBlogs from "./RelatedBlogs"
import DOMPurify from "dompurify"
import BlogAudio from "../Button/BlogAudio"
import ReportButton from "../Button/ReportButton"
import {
  ArrowLeft,
  Calendar,
  Clock,
  Share2,
  Bookmark,
  MessageCircle,
  Heart,
  Tag,
  User,
  ExternalLink,
} from "lucide-react"

const BlogContent = () => {
  const { id } = useParams() // Get blog id from URL
  const [blog, setBlog] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const navigate = useNavigate()

  // Fetch blog data when component mounts
  useEffect(() => {
    const fetchBlogData = async () => {
      const token = localStorage.getItem("token")
      setLoading(true)
      try {
        const response = await fetch(`http://localhost:8080/api/posts/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          navigate("/*")
          throw new Error("Failed to fetch blog data")
        }
        const blogData = await response.json()
        setBlog(blogData)
        setLikeCount(blogData.likeCount || 0)

        // Check if post is bookmarked (this would need a real API endpoint)
        // For now, we'll just use localStorage as an example
        const bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]")
        setIsBookmarked(bookmarks.includes(id))
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchBlogData()
  }, [id, navigate])

  const handleBookmark = () => {
    // In a real app, this would call an API to save the bookmark
    // For now, we'll just use localStorage as an example
    const bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]")
    if (isBookmarked) {
      const updatedBookmarks = bookmarks.filter((bookmarkId) => bookmarkId !== id)
      localStorage.setItem("bookmarks", JSON.stringify(updatedBookmarks))
    } else {
      bookmarks.push(id)
      localStorage.setItem("bookmarks", JSON.stringify(bookmarks))
    }
    setIsBookmarked(!isBookmarked)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: blog?.title,
        text: `Check out this blog: ${blog?.title}`,
        url: window.location.href,
      })
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href)
      alert("Link copied to clipboard!")
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const estimateReadingTime = (content) => {
    if (!content) return "5 min read"
    const text = content.replace(/<[^>]*>/g, "") // Remove HTML tags
    const wordCount = text.split(/\s+/).length
    const readingTime = Math.ceil(wordCount / 200) // Assuming 200 words per minute
    return `${readingTime} min read`
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
        <div className="w-16 h-16 relative">
          <div className="w-16 h-16 rounded-full absolute border-4 border-gray-200"></div>
          <div className="w-16 h-16 rounded-full animate-spin absolute border-4 border-blue-600 border-t-transparent"></div>
        </div>
        <p className="mt-4 text-gray-600 text-lg font-medium">Loading article...</p>
      </div>
    )
  }

  // Sanitize content
  const sanitizedContent = DOMPurify.sanitize(blog.content)

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Back button */}
      <div className="max-w-5xl mx-auto pt-8 px-4 sm:px-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-blue-600 transition-colors mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          <span>Back to blogs</span>
        </button>
      </div>

      {/* Blog header */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          {/* Cover image */}
          <div className="relative h-96 w-full bg-gray-100">
            <img
              src={blog.imageCloudUrl || "/placeholder.svg"}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

            {/* Category tag */}
            <div className="absolute top-4 left-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-600 text-white">
                {blog.category}
              </span>
            </div>

            {/* Action buttons */}
            <div className="absolute top-4 right-4 flex space-x-2">
              <button
                onClick={handleBookmark}
                className={`p-2 rounded-full ${
                  isBookmarked ? "bg-yellow-500 text-white" : "bg-white/80 text-gray-700"
                } hover:bg-yellow-500 hover:text-white transition-colors backdrop-blur-sm`}
                aria-label={isBookmarked ? "Remove bookmark" : "Bookmark this article"}
              >
                <Bookmark className="h-5 w-5" />
              </button>
              <button
                onClick={handleShare}
                className="p-2 rounded-full bg-white/80 text-gray-700 hover:bg-blue-600 hover:text-white transition-colors backdrop-blur-sm"
                aria-label="Share this article"
              >
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Blog title and meta */}
          <div className="px-6 py-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{blog.title}</h1>

            <div className="flex flex-wrap items-center text-gray-600 text-sm mb-6">
              <span className="flex items-center mr-6">
                <Calendar className="h-4 w-4 mr-1" />
                {formatDate(blog.createdAt)}
              </span>
              <span className="flex items-center mr-6">
                <Clock className="h-4 w-4 mr-1" />
                {estimateReadingTime(blog.content)}
              </span>
              <span className="flex items-center">
                <Heart className="h-4 w-4 mr-1 text-pink-500" />
                {likeCount} likes
              </span>
            </div>

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                <Tag className="h-4 w-4 text-gray-500" />
                {blog.tags.map((tag, index) => (
                  <span key={index} className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Author info - mobile */}
            <div className="md:hidden flex items-center p-4 bg-gray-50 rounded-xl mb-6">
              <a href={`/profile/${blog.author._id}`} className="flex-shrink-0">
                <img
                  src={blog.author.profilePicture || "/placeholder.svg"}
                  alt={blog.author.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-blue-200"
                />
              </a>
              <div className="ml-3">
                <a
                  href={`/profile/${blog.author._id}`}
                  className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                >
                  {blog.author.name}
                </a>
                <p className="text-sm text-gray-500">{blog.author.email}</p>
              </div>
            </div>

            {/* Content */}
            <div className="max-w-none">
              <div
                className="text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                style={{
                  // Inline styles for the blog content
                  "--tw-prose-headings": "#111827",
                  "--tw-prose-links": "#2563eb",
                }}
              />
            </div>

            {/* Action bar */}
            <div className="mt-10 pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex space-x-4">
                  <BlogAudio blogText={blog.content} />
                  <ReportButton reportText={blog.content} id={blog._id} type={"Post"} message={"Report Post"} />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleShare}
                    className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </button>
                  <button
                    onClick={handleBookmark}
                    className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                      isBookmarked
                        ? "bg-yellow-500 text-white hover:bg-yellow-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Bookmark className="h-4 w-4 mr-2" />
                    {isBookmarked ? "Saved" : "Save"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two column layout for author card and related blogs */}
      <div className="max-w-5xl mx-auto mt-8 px-4 sm:px-6">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Author card - desktop */}
          <div className="hidden md:block">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="h-24 bg-gradient-to-r from-blue-500 to-blue-600"></div>
              <div className="px-6 pb-6 text-center">
                <div className="-mt-12 mb-4">
                  <a href={`/profile/${blog.author._id}`}>
                    <img
                      src={blog.author.profilePicture || "/placeholder.svg"}
                      alt={blog.author.name}
                      className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-white"
                    />
                  </a>
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  <a href={`/profile/${blog.author._id}`} className="hover:text-blue-600 transition-colors">
                    {blog.author.name}
                  </a>
                </h3>
                <p className="text-gray-500 text-sm mt-1">{blog.author.email}</p>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <a
                    href={`/profile/${blog.author._id}`}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <User className="h-4 w-4 mr-2" />
                    View Profile
                  </a>
                </div>
              </div>
            </div>

            {/* More from this author */}
            <div className="mt-6 bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">More from this author</h3>
              <a
                href={`/profile/${blog.author._id}`}
                className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                View all posts
              </a>
            </div>
          </div>

          {/* Related blogs and comments */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <MessageCircle className="h-5 w-5 mr-2 text-blue-600" />
                Join the conversation
              </h2>
              <CommentButton blogId={id} />
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Related Articles</h2>
              <RelatedBlogs tag={blog.tags[0]} postId={blog._id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BlogContent
