import { useState } from 'react'


function BookForm({ onCreate }) {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [edition, setEdition] = useState('1')

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState('')


  async function handleSubmit(event) {
    event.preventDefault()

    setError('')

    const editionNumber =
      Number(edition)

    if (
      !title.trim() ||
      !author.trim() ||
      !Number.isInteger(editionNumber) ||
      editionNumber < 1
    ) {
      setError(
        'Please enter a valid title, author, and edition.'
      )

      return
    }

    try {
      setLoading(true)

      await onCreate({
        title: title.trim(),
        author: author.trim(),
        edition: editionNumber,
      })

      setTitle('')
      setAuthor('')
      setEdition('1')

    } catch (err) {
      setError(
        err.message
      )

    } finally {
      setLoading(false)
    }
  }


  return (
    <section
      className="
        rounded-3xl
        border border-slate-200
        bg-white
        p-6
        shadow-sm
      "
    >
      <div>
        <p
          className="
            text-xs
            font-semibold
            uppercase
            tracking-[0.18em]
            text-indigo-600
          "
        >
          Collection
        </p>

        <h2
          className="
            mt-1
            text-xl
            font-semibold
            text-slate-950
          "
        >
          Add a book edition
        </h2>

        <p
          className="
            mt-1
            text-sm
            text-slate-500
          "
        >
          Add another edition to an existing book,
          or create a new book automatically.
        </p>
      </div>


      <form
        onSubmit={handleSubmit}
        className="
          mt-6
          grid
          gap-4
          lg:grid-cols-[2fr_1.5fr_0.7fr_auto]
          lg:items-end
        "
      >
        <label
          className="
            flex
            flex-col
            gap-2
            text-sm
            font-medium
            text-slate-700
          "
        >
          Title

          <input
            value={title}
            onChange={(event) =>
              setTitle(event.target.value)
            }
            placeholder="e.g. Clean Code"
            className="
              rounded-xl
              border border-slate-200
              bg-slate-50
              px-4 py-3
              outline-none
              transition
              focus:border-indigo-400
              focus:bg-white
              focus:ring-4
              focus:ring-indigo-100
            "
          />
        </label>


        <label
          className="
            flex
            flex-col
            gap-2
            text-sm
            font-medium
            text-slate-700
          "
        >
          Author

          <input
            value={author}
            onChange={(event) =>
              setAuthor(event.target.value)
            }
            placeholder="e.g. Robert C. Martin"
            className="
              rounded-xl
              border border-slate-200
              bg-slate-50
              px-4 py-3
              outline-none
              transition
              focus:border-indigo-400
              focus:bg-white
              focus:ring-4
              focus:ring-indigo-100
            "
          />
        </label>


        <label
          className="
            flex
            flex-col
            gap-2
            text-sm
            font-medium
            text-slate-700
          "
        >
          Edition

          <input
            type="number"
            min="1"
            value={edition}
            onChange={(event) =>
              setEdition(event.target.value)
            }
            className="
              rounded-xl
              border border-slate-200
              bg-slate-50
              px-4 py-3
              outline-none
              transition
              focus:border-indigo-400
              focus:bg-white
              focus:ring-4
              focus:ring-indigo-100
            "
          />
        </label>


        <button
          type="submit"
          disabled={loading}
          className="
            rounded-xl
            bg-slate-950
            px-6 py-3
            font-semibold
            text-white
            transition
            hover:bg-indigo-600
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {loading
            ? 'Adding...'
            : 'Add edition'}
        </button>
      </form>


      {error && (
        <p
          className="
            mt-4
            rounded-xl
            bg-rose-50
            px-4 py-3
            text-sm
            text-rose-700
          "
        >
          {error}
        </p>
      )}
    </section>
  )
}


export default BookForm