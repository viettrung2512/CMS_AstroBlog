// src/components/SignupForm.jsx
import { useEffect } from 'react';

export default function SignupForm() {
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      window.location.href = '/';
    }
  }, []);

  function navigate(path) {
    window.location.href = path;
  }

  function showToast(type, message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.position = 'fixed';
    toast.style.top = '20px';
    toast.style.right = '20px';
    toast.style.padding = '10px 20px';
    toast.style.backgroundColor = type === 'success' ? '#48bb78' : '#f56565';
    toast.style.color = 'white';
    toast.style.borderRadius = '5px';
    toast.style.zIndex = '9999';
    document.body.appendChild(toast);
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 3000);
  }

  async function handleSignup(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const values = Object.fromEntries(formData.entries());

    try {
      const res = await fetch('http://localhost:8080/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error('Signup failed');
      await res.json();
      showToast('success', 'Signup successful! Please log in.');
      navigate('/login');
    } catch (err) {
      showToast('error', err.message);
    }
  }

  return (
    <form onSubmit={handleSignup}>
      <div className="mb-6">
        <input
          type="text"
          name="name"
          placeholder="Name"
          required
          className="form-control block w-full px-4 py-2 text-xl font-normal text-gray-700 bg-white border border-gray-300 rounded focus:border-blue-600 focus:outline-none"
        />
      </div>
      <div className="mb-6">
        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          className="form-control block w-full px-4 py-2 text-xl font-normal text-gray-700 bg-white border border-gray-300 rounded focus:border-blue-600 focus:outline-none"
        />
      </div>
      <div className="mb-6">
        <input
          type="text"
          name="username"
          placeholder="Username"
          required
          className="form-control block w-full px-4 py-2 text-xl font-normal text-gray-700 bg-white border border-gray-300 rounded focus:border-blue-600 focus:outline-none"
        />
      </div>
      <div className="mb-6">
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          className="form-control block w-full px-4 py-2 text-xl font-normal text-gray-700 bg-white border border-gray-300 rounded focus:border-blue-600 focus:outline-none"
        />
      </div>
      <div className="text-center lg:text-left">
        <button
          type="submit"
          className="inline-block px-7 py-3 bg-blue-600 text-white font-medium text-sm leading-snug uppercase rounded hover:bg-white hover:text-blue-600 border border-blue-600 transition duration-150 ease-in-out"
        >
          Signup
        </button>
        <p className="text-sm font-semibold mt-2 pt-1 mb-0">
          Already have an account?{' '}
          <a href="/login" className="text-red-600 hover:text-red-700 transition duration-200 ease-in-out">
            Login
          </a>
        </p>
      </div>
    </form>
  );
}
