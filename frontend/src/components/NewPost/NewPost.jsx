"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import PropTypes from "prop-types"
import ReactQuill from "react-quill"
import "react-quill/dist/quill.snow.css"
import { toast } from "react-toastify"
import { X, Upload, ImageIcon, Tag, Loader2 } from "lucide-react"

const NewPost = ({ token }) => {
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [tags, setTags] = useState("")
  const [content, setContent] = useState("")
  const [imageCloudUrl, setImageCloudUrl] = useState("")
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [isDragging, setIsDragging] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const navigate = useNavigate()

  // Popular categories for suggestions
  const popularCategories = [
    "Technology",
    "Travel",
    "Food",
    "Lifestyle",
    "Health",
    "Education",
    "Business",
    "Entertainment",
  ]

  // Calculate word count when content changes
  useEffect(() => {
    if (content) {
      // Strip HTML tags and count words
      const text = content.replace(/<[^>]*>/g, "")
      const words = text.split(/\s+/).filter((word) => word.length > 0)
      setWordCount(words.length)
    } else {
      setWordCount(0)
    }
  }, [content])

  const validateForm = () => {
    const newErrors = {}

    if (!title.trim()) newErrors.title = "Title is required"
    if (!category.trim()) newErrors.category = "Category is required"
    if (!content.trim() || content === "<p><br></p>") newErrors.content = "Content is required"
    if (!imageCloudUrl) newErrors.image = "Featured image is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleImageChange = async (e) => {
    const imageFile = e.target.files[0]
    await processImageUpload(imageFile)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const imageFile = e.dataTransfer.files[0]
      await processImageUpload(imageFile)
    }
  }

  const processImageUpload = async (imageFile) => {
    if (!imageFile) {
      toast.error("Please select an image file")
      return
    }

    // Check if file is an image
    if (!imageFile.type.match("image.*")) {
      toast.error("Please select an image file")
      return
    }

    // Check file size (max 5MB)
    if (imageFile.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB")
      return
    }

    setLoading(true)
    setImagePreview(URL.createObjectURL(imageFile))
    setErrors({ ...errors, image: null })

    const formData = new FormData()
    formData.append("image", imageFile)

    try {
      const response = await fetch("http://localhost:8080/cloudinary/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        toast.error(`Error: ${errorData.message}`)
        setLoading(false)
        return
      }

      const imageUrl = await response.text()
      setImageCloudUrl(imageUrl)
      toast.success("Image uploaded successfully!")
    } catch (error) {
      console.error("Error uploading image:", error)
      toast.error("Failed to upload image. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const removeImage = () => {
    setImagePreview(null)
    setImageCloudUrl("")
  }

  const handlePost = async () => {
    if (!token) {
      toast.error("You need to log in to create a post.")
      navigate("/login")
      return
    }

    if (!validateForm()) {
      toast.error("Please fill in all required fields")
      return
    }

    setLoading(true)

    const newPost = {
      title,
      category,
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag),
      content,
      imageCloudUrl,
    }

    try {
      const response = await fetch("http://localhost:8080/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newPost),
      })

      if (response.ok) {
        toast.success("Post created successfully!")
        navigate(`/`)
      } else {
        const errorData = await response.json()
        toast.error(`Error: ${errorData.message}`)
      }
    } catch (error) {
      console.error("Error creating post:", error)
      toast.error("An error occurred while creating the post. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (title || category || tags || content || imagePreview) {
      if (window.confirm("Are you sure you want to discard your draft?")) {
        navigate("/")
      }
    } else {
      navigate("/")
    }
  }

  // Custom toolbar options for ReactQuill
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ align: [] }],
      ["link", "image"],
      ["clean"],
    ],
  }

  return (
    <div className="w-full max-w-5xl mx-auto my-10 p-6 bg-white rounded-xl shadow-lg">
      <div className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-800">Create New Post</h1>
        <p className="text-gray-600 mt-2">Share your thoughts and ideas with the community</p>
      </div>

      <div className="space-y-6">
        {/* Title Input */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            className={`w-full px-4 py-3 bg-gray-50 border ${
              errors.title ? "border-red-500" : "border-gray-300"
            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900`}
            placeholder="Enter a compelling title for your post"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              if (e.target.value.trim()) setErrors({ ...errors, title: null })
            }}
          />
          {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
        </div>

        {/* Category Input with Suggestions */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category <span className="text-red-500">*</span>
          </label>
          <input
            id="category"
            type="text"
            className={`w-full px-4 py-3 bg-gray-50 border ${
              errors.category ? "border-red-500" : "border-gray-300"
            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900`}
            placeholder="e.g., Technology, Travel, Food"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value)
              if (e.target.value.trim()) setErrors({ ...errors, category: null })
            }}
            list="category-suggestions"
          />
          <datalist id="category-suggestions">
            {popularCategories.map((cat) => (
              <option key={cat} value={cat} />
            ))}
          </datalist>
          {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}

          <div className="mt-2 flex flex-wrap gap-2">
            {popularCategories.slice(0, 5).map((cat) => (
              <button
                key={cat}
                type="button"
                className="inline-flex items-center px-3 py-1 bg-gray-100 text-sm text-gray-800 rounded-full hover:bg-gray-200 transition-colors"
                onClick={() => {
                  setCategory(cat)
                  setErrors({ ...errors, category: null })
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Tags Input */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            <Tag className="w-4 h-4 mr-1" /> Tags <span className="text-gray-500 text-xs ml-1">(comma separated)</span>
          </label>
          <input
            id="tags"
            type="text"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900"
            placeholder="e.g., webdev, programming, design"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
          <p className="mt-1 text-xs text-gray-500">Add relevant tags to help readers discover your post</p>
        </div>

        {/* Content Editor */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Content <span className="text-red-500">*</span>
          </label>
          <div className={`border ${errors.content ? "border-red-500" : "border-gray-300"} rounded-lg overflow-hidden`}>
            <ReactQuill
              id="content"
              value={content}
              onChange={(value) => {
                setContent(value)
                if (value.trim() && value !== "<p><br></p>") setErrors({ ...errors, content: null })
              }}
              modules={modules}
              placeholder="Write your post content here..."
              className="bg-white text-gray-900 h-64"
            />
          </div>
          {errors.content && <p className="mt-1 text-sm text-red-500">{errors.content}</p>}
          <div className="mt-2 text-sm text-gray-500 flex justify-between">
            <span>Word count: {wordCount}</span>
            <span>Recommended: 300-1000 words for better engagement</span>
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Featured Image <span className="text-red-500">*</span>
          </label>

          {imagePreview ? (
            <div className="relative mt-2 rounded-lg overflow-hidden border border-gray-300">
              <img src={imagePreview || "/placeholder.svg"} alt="Preview" className="w-full h-64 object-cover" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-gray-800 bg-opacity-70 text-white p-1.5 rounded-full hover:bg-opacity-100 transition-all"
                title="Remove image"
              >
                <X className="w-5 h-5" />
              </button>
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
            </div>
          ) : (
            <div
              className={`border-2 border-dashed ${
                errors.image ? "border-red-400 bg-red-50" : "border-gray-300 bg-gray-50"
              } ${isDragging ? "border-blue-500 bg-blue-50" : ""} rounded-lg p-8 text-center cursor-pointer transition-all`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById("fileInput").click()}
            >
              <input type="file" id="fileInput" className="hidden" onChange={handleImageChange} accept="image/*" />
              <div className="flex flex-col items-center justify-center space-y-2">
                {loading ? (
                  <>
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                    <p className="text-sm text-gray-500">Uploading image...</p>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                    <div className="text-gray-700 font-medium">Drag and drop an image here, or click to select</div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                  </>
                )}
              </div>
            </div>
          )}
          {errors.image && <p className="mt-1 text-sm text-red-500">{errors.image}</p>}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-all"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all flex items-center"
            onClick={handlePost}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 mr-2" />
                Publish Post
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

NewPost.propTypes = {
  token: PropTypes.string,
}

export default NewPost
