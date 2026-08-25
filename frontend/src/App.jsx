import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import BookForm from './components/BookForm'
import BookTable from './components/BookTable'
import StatCard from './components/StatCard'

import { libraryApi } from './lib/api'


function App() {
  const [books, setBooks] =
    useState([])

  const [stats, setStats] =
    useState({
      books: 0,
      editions: 0,
      authors: 0,
    })

  const [search, setSearch] =
    useState('')

  const [sortBy, setSortBy] =
    useState('title')

  const [loading, setLoading] =
    useState(true)

  const [pageError, setPageError] =
    useState('')


  const loadBooks = useCallback(
    async () => {
      setLoading(true)
      setPageError('')

      try {
        const data =
          await libraryApi.listBooks({
            search,
            sortBy,
          })

        setBooks(data)

      } catch (error) {
        setPageError(
          error.message
        )

      } finally {
        setLoading(false)
      }
    },
    [
      search,
      sortBy,
    ],
  )


  const loadStats = useCallback(
    async () => {
      try {
        const data =
          await libraryApi.getStats()

        setStats(data)

      } catch (error) {
        setPageError(
          error.message
        )
      }
    },
    [],
  )


  const refreshAll = useCallback(
    async () => {
      await Promise.all([
        loadBooks(),
        loadStats(),
      ])
    },
    [
      loadBooks,
      loadStats,
    ],
  )


  useEffect(() => {
    loadBooks()
  }, [loadBooks])


  useEffect(() => {
    loadStats()
  }, [loadStats])


  async function createEdition(payload) {
    await libraryApi.createEdition(
      payload
    )

    await refreshAll()
  }


  async function deleteEdition(
    editionId,
  ) {
    try {
      await libraryApi.deleteEdition(
        editionId
      )

      await refreshAll()

    } catch (error) {
      setPageError(
        error.message
      )
    }
  }


  async function deleteBook(bookId) {
    try {
      await libraryApi.deleteBook(
        bookId
      )

      await refreshAll()

    } catch (error) {
      setPageError(
        error.message
      )
    }
  }


  return (
    <div
      className="
        min-h-screen
        bg-slate-50
        text-slate-950
      "
    >
      <header
        className="
          border-b
          border-slate-200
          bg-white/90
          backdrop-blur
        "
      >
        <div
          className="
            mx-auto
            flex
            max-w-7xl
            items-center
            justify-between
            px-6 py-5
          "
        >
          <div>
            <p
              className="
                text-xs
                font-semibold
                uppercase
                tracking-[0.22em]
                text-indigo-600
              "
            >
              Modern Library Database
            </p>

            <h1
              className="
                mt-1
                text-2xl
                font-bold
                tracking-tight
              "
            >
              Library Atlas
            </h1>
          </div>


          <div
            className="
              hidden
              rounded-full
              border border-slate-200
              bg-slate-50
              px-4 py-2
              text-sm
              text-slate-500
              sm:block
            "
          >
            React · FastAPI · PostgreSQL
          </div>
        </div>
      </header>


      <main
        className="
          mx-auto
          max-w-7xl
          px-6
          py-10
        "
      >
        <section
          className="
            grid
            gap-4
            md:grid-cols-3
          "
        >
          <StatCard
            label="Books"
            value={stats.books}
            description="Unique title and author pairs"
          />

          <StatCard
            label="Editions"
            value={stats.editions}
            description="Editions currently stored"
          />

          <StatCard
            label="Authors"
            value={stats.authors}
            description="Unique authors in the library"
          />
        </section>


        <div className="mt-8">
          <BookForm
            onCreate={createEdition}
          />
        </div>


        <section
          className="
            mt-8
          "
        >
          <div
            className="
              mb-4
              flex
              flex-col
              gap-3
              md:flex-row
              md:items-center
              md:justify-between
            "
          >
            <div>
              <h2
                className="
                  text-xl
                  font-semibold
                "
              >
                Library collection
              </h2>

              <p
                className="
                  mt-1
                  text-sm
                  text-slate-500
                "
              >
                Search, sort, and manage your books.
              </p>
            </div>


            <div
              className="
                flex
                flex-col
                gap-3
                sm:flex-row
              "
            >
              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search title or author..."
                className="
                  min-w-72
                  rounded-xl
                  border border-slate-200
                  bg-white
                  px-4 py-3
                  text-sm
                  outline-none
                  transition
                  focus:border-indigo-400
                  focus:ring-4
                  focus:ring-indigo-100
                "
              />


              <select
                value={sortBy}
                onChange={(event) =>
                  setSortBy(
                    event.target.value
                  )
                }
                className="
                  rounded-xl
                  border border-slate-200
                  bg-white
                  px-4 py-3
                  text-sm
                  outline-none
                  focus:border-indigo-400
                  focus:ring-4
                  focus:ring-indigo-100
                "
              >
                <option value="title">
                  Sort by title
                </option>

                <option value="author">
                  Sort by author
                </option>
              </select>
            </div>
          </div>


          {pageError && (
            <div
              className="
                mb-4
                rounded-xl
                bg-rose-50
                px-4 py-3
                text-sm
                text-rose-700
              "
            >
              {pageError}
            </div>
          )}


          <BookTable
            books={books}
            loading={loading}
            onDeleteEdition={
              deleteEdition
            }
            onDeleteBook={
              deleteBook
            }
          />
        </section>
      </main>
    </div>
  )
}


export default App