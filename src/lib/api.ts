/**
 * API Client Module
 *
 * This module provides a centralized API client for making HTTP requests to the backend.
 * It handles authentication, request formatting, error handling, and response parsing.
 */

// Use native global fetch instead of expo/fetch to avoid iOS URLSession issues
// The global fetch is available in React Native 0.76+ and works better with iOS

// Import the authentication client to access user session cookies
import { authClient } from "./authClient";

/**
 * Backend URL Configuration
 *
 * The backend URL is dynamically set by the Vibecode environment at runtime.
 * Format: https://[UNIQUE_ID].share.sandbox.dev/
 * This allows the app to connect to different backend instances without code changes.
 */
const BACKEND_URL = process.env.EXPO_PUBLIC_VIBECODE_BACKEND_URL;
if (!BACKEND_URL) {
  throw new Error("Backend URL setup has failed. Please contact support@vibecodeapp.com for help.");
}

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

type FetchOptions = {
  method: HttpMethod;
  body?: object; // Request body, will be JSON stringified before sending
};

/**
 * Core Fetch Function
 *
 * A generic, type-safe wrapper around the fetch API that handles all HTTP requests.
 *
 * @template T - The expected response type (for type safety)
 * @param path - The API endpoint path (e.g., "/api/posts")
 * @param options - Configuration object containing HTTP method and optional body
 * @returns Promise resolving to the typed response data
 *
 * Features:
 * - Automatic authentication: Attaches session cookies from authClient
 * - JSON handling: Automatically stringifies request bodies and parses responses
 * - Error handling: Throws descriptive errors with status codes and messages
 * - Type safety: Returns strongly-typed responses using TypeScript generics
 *
 * @throws Error if the response is not ok (status code outside 200-299 range)
 */
const fetchFn = async <T>(path: string, options: FetchOptions): Promise<T> => {
  const { method, body } = options;
  // Step 1: Authentication - Retrieve session cookies from the auth client
  // These cookies are used to identify the user and maintain their session
  const cookies = authClient.getCookie();

  // Step 2: Make the HTTP request
  try {
    // Construct the full URL by combining the base backend URL with the endpoint path
    const url = `${BACKEND_URL}${path}`;
    console.log(`[api.ts] ${method} ${url}`);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Only add Cookie header if we have cookies
    if (cookies) {
      headers["Cookie"] = cookies;
    }

    const response = await fetch(url, {
      method,
      headers,
      // Stringify the body if present (for POST, PUT, PATCH requests)
      body: body ? JSON.stringify(body) : undefined,
      // Use "omit" to prevent browser from automatically sending credentials
      // We manually handle cookies via the Cookie header for more control
      credentials: "omit",
    });

    console.log(`[api.ts] Response status: ${response.status} ${response.statusText}`);

    // Step 3: Error handling - Check if the response was successful
    if (!response.ok) {
      // Get the response text first to check if it's JSON or HTML
      const responseText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        // If parsing fails, the response is likely HTML
        console.log(`[api.ts]: Received non-JSON response (likely HTML error page)`);
        errorData = { message: "Server returned an error", details: responseText.substring(0, 200) };
      }
      // Throw a descriptive error with status code, status text, and server error data
      throw new Error(
        `[api.ts]: ${response.status} ${response.statusText} ${JSON.stringify(errorData)}`,
      );
    }

    // Step 4: Parse and return the successful response as JSON
    // First get the response text to check if it's valid JSON
    const responseText = await response.text();
    try {
      return JSON.parse(responseText) as T;
    } catch (error) {
      console.log(`[api.ts]: Response is not valid JSON. First 200 chars:`, responseText.substring(0, 200));
      throw new Error(`[api.ts]: Server returned invalid JSON response`);
    }
  } catch (error: any) {
    // Log the error for debugging purposes with more details
    console.error(`[api.ts] Request failed:`, {
      method,
      path,
      error: error.message,
      name: error.name,
    });
    // Re-throw the error so the calling code can handle it appropriately
    throw error;
  }
};

/**
 * API Client Object
 *
 * Provides convenient methods for making HTTP requests with different methods.
 * Each method is a thin wrapper around fetchFn with the appropriate HTTP verb.
 *
 * Usage Examples:
 *
 * // GET request - Fetch data
 * const posts = await api.get<Post[]>('/api/posts');
 *
 * // POST request - Create new data
 * const newPost = await api.post<Post>('/api/posts', {
 *   title: 'My Post',
 *   content: 'Hello World'
 * });
 *
 * // PUT request - Replace existing data
 * const updatedPost = await api.put<Post>('/api/posts/123', {
 *   title: 'Updated Title',
 *   content: 'Updated Content'
 * });
 *
 * // PATCH request - Partially update existing data
 * const patchedPost = await api.patch<Post>('/api/posts/123', {
 *   title: 'New Title Only'
 * });
 *
 * // DELETE request - Remove data
 * await api.delete('/api/posts/123');
 */
const api = {
  /**
   * GET - Retrieve data from the server
   * @template T - Expected response type
   * @param path - API endpoint path
   */
  get: <T>(path: string) => fetchFn<T>(path, { method: "GET" }),

  /**
   * POST - Create new data on the server
   * @template T - Expected response type
   * @param path - API endpoint path
   * @param body - Optional request body containing data to create
   */
  post: <T>(path: string, body?: object) => fetchFn<T>(path, { method: "POST", body }),

  /**
   * PUT - Replace existing data on the server
   * @template T - Expected response type
   * @param path - API endpoint path
   * @param body - Optional request body containing data to replace
   */
  put: <T>(path: string, body?: object) => fetchFn<T>(path, { method: "PUT", body }),

  /**
   * PATCH - Partially update existing data on the server
   * @template T - Expected response type
   * @param path - API endpoint path
   * @param body - Optional request body containing partial data to update
   */
  patch: <T>(path: string, body?: object) => fetchFn<T>(path, { method: "PATCH", body }),

  /**
   * DELETE - Remove data from the server
   * @template T - Expected response type
   * @param path - API endpoint path
   */
  delete: <T>(path: string) => fetchFn<T>(path, { method: "DELETE" }),
};

// Export the API client and backend URL to be used in other modules
export { api, BACKEND_URL };
