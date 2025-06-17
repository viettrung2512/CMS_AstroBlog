import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { X, Camera, Save, ArrowLeft, Eye, EyeOff, User, Mail, Lock } from 'lucide-react'

const AccountDetailPage = () => {
  const navigate = useNavigate()
  const token = localStorage.getItem("token")
  const username = localStorage.getItem("username")
  const profilePicture = localStorage.getItem("profilePicture")

  const [user, setUser] = useState({
    avatar: profilePicture || "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1600",
    name: username || "",
    email: "",
    password: "",
  })

  const [editedUser, setEditedUser] = useState({ ...user })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // Fetch user data when the component mounts
  useEffect(() => {
    if (!token) {
      toast.error("You need to log in to view account information.")
      navigate("/login")
      return
    }

    const fetchUserData = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/users/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          const userData = {
            avatar: data.profilePicture || user.avatar,
            name: data.name || username || "",
            email: data.email || "",
            password: "", // Do not expose password for security reasons
          }
          setUser(userData)
          setEditedUser(userData)
        } else {
          const errorData = await response.json()
          toast.error(`Error: ${errorData.message}`)
        }
      } catch (error) {
        console.error("Error loading user information:", error)
        toast.error("Failed to load user information. Please try again.")
      }
    }

    fetchUserData()
  }, [token, navigate, username, user.avatar])

  const handleInputChange = (e) => {
    const { name, value, files } = e.target
    if (name === "avatar" && files.length > 0) {
      const file = files[0]
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB")
        return
      }
      
      setUploadingAvatar(true)
      const reader = new FileReader()
      reader.onload = () => {
        setEditedUser({ ...editedUser, avatar: reader.result }) // Base64 image
        setUploadingAvatar(false)
      }
      reader.readAsDataURL(file)
    } else {
      setEditedUser({ ...editedUser, [name]: value })
    }
  }

  const handleSaveChanges = async () => {
    // Validate inputs
    if (!editedUser.name.trim()) {
      toast.error("Name cannot be empty")
      return
    }
    
    if (!editedUser.email.trim()) {
      toast.error("Email cannot be empty")
      return
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(editedUser.email)) {
      toast.error("Please enter a valid email address")
      return
    }

    setLoading(true)
    
    const updatedUserInfo = {
      name: editedUser.name,
      email: editedUser.email,
      profilePicture: editedUser.avatar,
    }

    // Only send the new password if the user has changed it
    if (editedUser.password) {
      updatedUserInfo.password = editedUser.password
    }
    
    try {
      const response = await fetch("http://localhost:8080/api/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedUserInfo),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        console.log("Updated user info:", updatedUser)

        setUser({ ...updatedUser })

        // Update localStorage with the new values
        localStorage.setItem("username", updatedUser.name)
        localStorage.setItem("profilePicture", updatedUser.profilePicture)
        localStorage.setItem("email", updatedUser.email)

        // Show success message
        toast.success("Account updated successfully!")
        
        // Navigate after a short delay to allow the toast to be seen
        setTimeout(() => {
          navigate("/")
        }, 1500)
      } else {
        const errorData = await response.json()
        console.error("Error response:", errorData)
        toast.error(`Error: ${errorData.message}`)
      }
    } catch (error) {
      console.error("Error updating user info:", error)
      toast.error("Failed to update account. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleGoHome = () => {
    navigate("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
          <div className="flex justify-between items-center">
            <button
              onClick={handleGoHome}
              className="text-white hover:text-blue-200 transition-colors p-1 rounded-full"
              aria-label="Go back"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-bold">Account Settings</h1>
            <button
              onClick={handleGoHome}
              className="text-white hover:text-blue-200 transition-colors p-1 rounded-full"
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        {/* Profile Picture */}
        <div className="relative -mt-12 flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-gray-200">
              <img
                src={editedUser.avatar || "/placeholder.svg"}
                alt="User Avatar"
                className="w-full h-full object-cover"
              />
              {uploadingAvatar && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                </div>
              )}
            </div>
            <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-md">
              <Camera className="h-4 w-4" />
              <input
                id="avatar-upload"
                type="file"
                name="avatar"
                accept="image/*"
                onChange={handleInputChange}
                className="hidden"
              />
            </label>
          </div>
        </div>
        
        {/* User Info */}
        <div className="text-center px-6 pt-2 pb-4">
          <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
          <p className="text-gray-600">{user.email}</p>
        </div>
        
        {/* Form */}
        <div className="px-6 pb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Edit Profile</h3>
          
          <div className="space-y-4">
            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={editedUser.name}
                  onChange={handleInputChange}
                  className="pl-10 w-full px-4 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Your full name"
                />
              </div>
            </div>
            
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={editedUser.email}
                  onChange={handleInputChange}
                  className="pl-10 w-full px-4 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>
            
            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                New Password <span className="text-gray-500 text-xs">(leave empty to keep current)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={editedUser.password}
                  onChange={handleInputChange}
                  className="pl-10 w-full px-4 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Password should be at least 8 characters long
              </p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={handleGoHome}
              className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveChanges}
              disabled={loading}
              className={`px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountDetailPage
