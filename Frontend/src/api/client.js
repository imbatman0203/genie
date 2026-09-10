// ============================================================
// GENIE — API client
// All backend calls go through here.
// Backend runs on http://localhost:3000
// ============================================================

const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * Core fetch wrapper.
 * - Always sends cookies (credentials: "include")
 * - Parses JSON automatically
 * - Throws a rich error object on non-2xx
 */
async function request(path, { method = "GET", body, headers } = {}) {
  const opts = {
    method,
    credentials: "include",
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
  };

  if (body) opts.body = JSON.stringify(body);

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, opts);
  } catch (networkErr) {
    throw {
      status: 0,
      message: "Can't reach the server. Is the backend running?",
      cause: networkErr,
    };
  }

  let data = null;
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      data = await res.json();
    } catch {
      data = null;
    }
  } else {
    try {
      data = { message: await res.text() };
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    throw {
      status: res.status,
      message: data?.message || `Request failed (${res.status})`,
      data,
    };
  }

  return data;
}

// ---------- Auth ----------
export const auth = {
  signup: (payload) => request("/user/signup", { method: "POST", body: payload }),
  login:  (payload) => request("/user/login",  { method: "POST", body: payload }),
  logout: ()        => request("/user/logout", { method: "POST" }),
  me:     ()        => request("/user/profile"),
  delete: ()        => request("/user/delete", { method: "DELETE" }),
};

// ---------- Models ----------
export const models = {
  list: () => request("/models"),
};

// ---------- Chats ----------
export const chats = {
  recent:  ()      => request("/chat/getRecentChat"),
  one:     (id)    => request(`/chat/${id}`),
  create:  (body)  => request("/chat/createChat", { method: "POST", body }),
  remove:  (id)    => request(`/chat/${id}`, { method: "DELETE" }),
};

// ---------- Messages ----------
export const messages = {
  list: (chatId) => request(`/msg/${chatId}`),
  send: (chatId, body) =>
    request(chatId ? `/msg/${chatId}` : "/msg/", { method: "POST", body }),
};