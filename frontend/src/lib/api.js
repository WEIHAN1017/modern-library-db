const API_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:8000'


async function request(path, options = {}) {
  const response = await fetch(
    `${API_URL}${path}`,
    {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },

      ...options,
    },
  )

  if (!response.ok) {
    let message = 'Something went wrong.'

    try {
      const data = await response.json()

      if (typeof data.detail === 'string') {
        message = data.detail
      }
    } catch {
      // Response 沒有 JSON 時使用預設錯誤訊息
    }

    throw new Error(message)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}


export const libraryApi = {
  async listBooks({
    search = '',
    sortBy = 'title',
  } = {}) {
    const params = new URLSearchParams()

    if (search.trim()) {
      params.set(
        'search',
        search.trim(),
      )
    }

    params.set(
      'sort_by',
      sortBy,
    )

    return request(
      `/api/books?${params.toString()}`
    )
  },


  async getStats() {
    return request('/api/stats')
  },


  async createEdition(payload) {
    return request(
      '/api/books',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    )
  },


  async deleteEdition(editionId) {
    return request(
      `/api/editions/${editionId}`,
      {
        method: 'DELETE',
      },
    )
  },


  async deleteBook(bookId) {
    return request(
      `/api/books/${bookId}`,
      {
        method: 'DELETE',
      },
    )
  },
}