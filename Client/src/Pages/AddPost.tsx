/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import { AxiosProgressEvent } from "axios";
import Navbar from "../Components/AuthenticatedNavbar";
import { useNavigate } from "react-router-dom";

import ErrorMessage from "../Components/Profile/UserProfile/ErrorMessage";
import SuccessMessage from "../Components/Profile/UserProfile/SuccessMessage";
import api from "../axiosConfig";

const CreatePost: React.FC = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    useEffect;
    try {
      const authToken = localStorage.getItem("authToken");

      if (!authToken) {
        throw new Error("Authentication token not found");
      }

      const formData = new FormData();
      formData.append("title", title);
      formData.append("textContent", content);
      formData.append("category", category);
      if (imageFile) {
        formData.append("image", imageFile);
      }
      if (videoFile) {
        formData.append("video", videoFile);
      }

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total ?? 1)
          );
          setUploadProgress(progress);
        },
      };

      const response = await api.post(`/post/addPost`, formData, config);
      console.log(response);
      setMessage("Post added successfully");

      setTitle("");
      setContent("");
      setCategory("");
      setImageFile(null);
      setVideoFile(null);

      setLoading(false);
      window.scrollTo(0, 0);
    } catch (error: unknown) {
      setLoading(false);
      setError("Failed to add post. Please try again.");
      window.scrollTo(0, 0);
    }
  };

  const handleSuccessMessageClose = () => {
    setMessage(null);
  };

  const handleErrorMessageClose = () => {
    setError(null);
    setLoading(false);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div>
      <Navbar />
      <div className="container mx-auto py-8 bg-gradient-to-r from-blue-50 to-blue-100">
        <form
          onSubmit={handleSubmit}
          className="max-w-lg mx-auto bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4"
        >
          <button
            onClick={handleGoBack}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-l mb-4"
          >
            Go Back
          </button>

          {error && (
            <ErrorMessage message={error} onClose={handleErrorMessageClose} />
          )}
          {message && (
            <SuccessMessage
              message={message}
              onClose={handleSuccessMessageClose}
            />
          )}

          <h2 className="text-3xl font-bold mb-4 text-center">
            Create a New Post
          </h2>

          <div className="mb-4">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter title..."
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={5}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Write your content here..."
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">Select a category</option>
              <option value="AI">AI</option>
              <option value="Software Development">Software Development</option>
              <option value="Cloud Computing">Cloud Computing</option>
              <option value="Data Science">Data Science</option>
              <option value="Blockchain">Blockchain</option>
              <option value="Internet of Things (IoT)">
                Internet of Things (IoT)
              </option>
              <option value="DevOps">DevOps</option>
              <option value="Quantum Computing">Quantum Computing</option>
              <option value="Cybersecurity">Cybersecurity</option>
            </select>
          </div>
          <div className="mb-4">
            <label
              htmlFor="image"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Image
            </label>
            <input
              type="file"
              id="image"
              onChange={(e) =>
                setImageFile(e.target.files ? e.target.files[0] : null)
              }
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            {imageFile && (
              <p className="text-gray-500 mt-2">Uploading: {uploadProgress}%</p>
            )}
          </div>
          <div className="mb-4">
            <label
              htmlFor="video"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Video
            </label>
            <input
              type="file"
              id="video"
              onChange={(e) =>
                setVideoFile(e.target.files ? e.target.files[0] : null)
              }
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            {videoFile && (
              <p className="text-gray-500 mt-2">Uploading: {uploadProgress}%</p>
            )}
          </div>
          <div className="flex items-center justify-center mt-6">
            <button
              type="submit"
              disabled={loading}
              style={{ minWidth: "120px" }}
              className={`w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white py-2 px-6 rounded-full shadow-md transition duration-300 disabled:opacity-50 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Submitting..." : "Submit Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
