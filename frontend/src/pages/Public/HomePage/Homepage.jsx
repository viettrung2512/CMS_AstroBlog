"use client"

import { useEffect, useState } from "react"
import NavBar from "../../../components/Header/NavBar"
import SideBar from "../../../components/Sidebar/SideBar"
import BlogList from "../../../components/Blog/BlogList"
import TopAuthors from "../../../components/Author/TopAuthors"
import { Link } from "react-router-dom"

const Homepage = () => {
  const [blogs, setBlogs] = useState([])
  const [mostLikedBlogs, setMostLikedBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showMessage, setShowMessage] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize, setPageSize] = useState(6)

  const fetchBlogs = async (page = 0, size = 6) => {
    const token = localStorage.getItem("token")
    setLoading(true)

    try {
      console.log(`Fetching blogs for page: ${page}, size: ${size}`)
      const response = await fetch(`http://localhost:8080/api/posts?size=${size}&page=${page}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Fetched data:", data)
        setBlogs(data.content)
        setCurrentPage(data.number) // Make sure we use the page number returned from the API
        setTotalPages(data.totalPages)
        console.log(`Current page set to: ${data.number}, Total pages: ${data.totalPages}`)
      } else {
        const errorData = await response.json()
        console.error("Lỗi khi lấy danh sách blog:", errorData.message)
      }
    } catch (error) {
      console.error("Lỗi kết nối API:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMostLikedBlogs = async () => {
    const token = localStorage.getItem("token")
    try {
      const mostLikedResponse = await fetch("http://localhost:8080/api/posts/most-liked", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (mostLikedResponse.ok) {
        const mostLikedData = await mostLikedResponse.json()
        setMostLikedBlogs(mostLikedData.content)
      } else {
        const errorData = await mostLikedResponse.json()
        console.error("Lỗi khi lấy bài blog được thích nhiều nhất:", errorData.message)
      }
    } catch (error) {
      console.error("Lỗi kết nối API:", error)
    }
  }

  const handlePageChange = (newPage) => {
    console.log(`Attempting to change to page: ${newPage}`)
    if (newPage >= 0 && newPage < totalPages) {
      console.log(`Changing to page: ${newPage}`)
      setCurrentPage(newPage)
      fetchBlogs(newPage, pageSize)
    } else {
      console.log(`Invalid page number: ${newPage}, totalPages: ${totalPages}`)
    }
  }

  useEffect(() => {
    fetchBlogs(currentPage, pageSize)
  }, [currentPage, pageSize])

  useEffect(() => {
    const loginSuccess = localStorage.getItem("loginSuccess")
    if (loginSuccess === "true") {
      setShowMessage(true)
      localStorage.removeItem("loginSuccess")

      // Auto-hide the message after 3 seconds
      const timer = setTimeout(() => {
        setShowMessage(false)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    fetchMostLikedBlogs()
  }, [])

  const filteredBlogs = blogs.filter((blog) => blog.title.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="bg-gray-50 min-h-screen text-gray-900">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
        <NavBar
          setSearchTerm={setSearchTerm}
          resetPage={() => {
            setCurrentPage(0)
            fetchBlogs(0, pageSize)
          }}
        />
      </header>

      {/* Sidebar and Content */}
      <div className="flex pt-16">
        {/* Sidebar */}
        <aside className="fixed top-16 left-0 h-[calc(100vh-4rem)] bg-gray-900 w-60 z-40 shadow-lg">
          <SideBar />
        </aside>

        {/* Main Content */}
        <div className="ml-60 flex-grow p-6">
          {/* Success Message */}
          {showMessage && (
            <div className="fixed top-20 right-6 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-lg z-50 animate-fade-in-out">
              <div className="flex items-center">
                <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <p className="font-medium">Login successfully!</p>
              </div>
            </div>
          )}

          {/* Hero Banner Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-800 rounded-2xl shadow-xl mb-10 overflow-hidden">
            <div className="max-w-7xl mx-auto px-8 py-16">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white leading-tight">
                Diverse Perspectives of the Young Generation in Vietnam
              </h1>
              <p className="text-2xl md:text-3xl font-semibold text-blue-100 mb-8">
                Write - Share - Connect - Reflect
                <br />
                All at <span className="text-yellow-300">CWTS</span>
              </p>
              <div className="mt-8">
                <Link
                  to="/create-blog"
                  className="px-8 py-3 bg-white text-blue-700 font-bold rounded-full hover:bg-blue-50 transition duration-300 shadow-lg inline-flex items-center"
                >
                  Start Writing
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 ml-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center my-16">
              <div className="relative">
                <div className="w-12 h-12 rounded-full absolute border-4 border-gray-200"></div>
                <div className="w-12 h-12 rounded-full animate-spin absolute border-4 border-blue-600 border-t-transparent"></div>
              </div>
              <p className="ml-4 text-gray-600 text-lg font-medium">Loading blogs...</p>
            </div>
          ) : (
            <>
              {/* Popular Blogs Section */}
              <section className="mb-12">
                <div className="flex items-center mb-6">
                  <h2 className="text-3xl font-bold text-gray-900">POPULAR BLOGS</h2>
                  <div className="ml-4 h-1 bg-blue-600 flex-grow rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {mostLikedBlogs.slice(0, 4).map((blog) => (
                    <Link
                      to={`/blog/${blog._id}`}
                      key={blog.id}
                      className="flex bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl hover:scale-[1.02] transition transform duration-300"
                    >
                      {/* Image */}
                      <div className="flex-shrink-0 w-1/3">
                        <img
                          src={blog.imageCloudUrl || "/placeholder.svg"}
                          alt={blog.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-5 flex flex-col justify-between">
                        <div>
                          <span className="inline-block px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 rounded-full mb-3">
                            {blog.category}
                          </span>
                          <h3 className="text-xl font-bold text-gray-900 line-clamp-2 mb-2">{blog.title}</h3>
                        </div>

                        <div className="flex items-center mt-4">
                          <img
                            className="w-8 h-8 rounded-full object-cover border-2 border-blue-500"
                            src={blog.author.profilePicture || "/placeholder.svg"}
                            alt={blog.author.name}
                          />
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{blog.author.name}</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>

              {/* Banner Ad Section */}
              <div className="my-12 flex justify-center">
                <div className="relative w-full max-w-5xl overflow-hidden rounded-xl shadow-lg">
                  <img
                    src="/public/freepik-export-20241219071211VKAR.jpeg"
                    alt="Technology banner"
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-transparent flex items-center">
                    <div className="p-8 max-w-md">
                      <h3 className="text-3xl font-bold text-white mb-4">Discover the Future of Technology</h3>
                      <p className="text-blue-100 mb-6">Explore the latest trends and innovations in the tech world</p>
                      <button className="px-6 py-2 bg-white text-blue-700 font-bold rounded-lg hover:bg-blue-50 transition duration-300">
                        Learn More
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Authors Section */}
              <section className="mb-12">
                <div className="flex items-center mb-6">
                  <h2 className="text-3xl font-bold text-gray-900">TOP AUTHORS</h2>
                  <div className="ml-4 h-1 bg-blue-600 flex-grow rounded-full"></div>
                </div>
                <TopAuthors />
              </section>

              {/* All Blogs Section */}
              <section className="mb-12">
                <div className="flex items-center mb-6">
                  <h2 className="text-3xl font-bold text-gray-900">ALL BLOGS</h2>
                  <div className="ml-4 h-1 bg-blue-600 flex-grow rounded-full"></div>
                </div>
                <BlogList blogs={filteredBlogs} setBlogs={setBlogs} layout="grid" />
              </section>

              {/* Page Size Selector */}
              <div className="flex justify-center mb-4 items-center">
                <span className="text-sm text-gray-600 mr-2">Items per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    const newSize = Number(e.target.value)
                    setPageSize(newSize)
                    setCurrentPage(0) // Reset to first page when changing page size
                    fetchBlogs(0, newSize)
                  }}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value={6}>6</option>
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                </select>
              </div>

              {/* Pagination */}
              <div className="flex justify-center mt-10 mb-6">
                <nav className="inline-flex rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className={`relative inline-flex items-center px-4 py-2 rounded-l-md border ${
                      currentPage === 0
                        ? "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  {/* Show page numbers with ellipsis for many pages */}
                  {Array.from({ length: totalPages }, (_, i) => {
                    // Always show first page, last page, current page, and pages around current
                    const showPageNumber =
                      i === 0 || // First page
                      i === totalPages - 1 || // Last page
                      (i >= currentPage - 1 && i <= currentPage + 1) // Current page and adjacent pages

                    // Show ellipsis instead of too many page numbers
                    if (!showPageNumber) {
                      if (i === 1 && currentPage > 2) {
                        return (
                          <span
                            key={`ellipsis-start`}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-gray-700"
                          >
                            ...
                          </span>
                        )
                      }
                      if (i === totalPages - 2 && currentPage < totalPages - 3) {
                        return (
                          <span
                            key={`ellipsis-end`}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-gray-700"
                          >
                            ...
                          </span>
                        )
                      }
                      return null
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => handlePageChange(i)}
                        className={`relative inline-flex items-center px-4 py-2 border ${
                          i === currentPage
                            ? "z-10 bg-blue-600 border-blue-600 text-white"
                            : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                        aria-current={i === currentPage ? "page" : undefined}
                      >
                        {i + 1}
                      </button>
                    )
                  }).filter(Boolean)}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages - 1}
                    className={`relative inline-flex items-center px-4 py-2 rounded-r-md border ${
                      currentPage >= totalPages - 1
                        ? "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </nav>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Homepage
