function BookTable({
  books,
  loading,
  onDeleteEdition,
  onDeleteBook,
}) {
  if (loading) {
    return (
      <div
        className="
          rounded-3xl
          border border-slate-200
          bg-white
          p-10
          text-center
          text-slate-500
        "
      >
        Loading library...
      </div>
    )
  }


  if (books.length === 0) {
    return (
      <div
        className="
          rounded-3xl
          border border-dashed
          border-slate-300
          bg-white
          p-12
          text-center
        "
      >
        <p
          className="
            text-lg
            font-semibold
            text-slate-800
          "
        >
          No books found
        </p>

        <p
          className="
            mt-2
            text-sm
            text-slate-500
          "
        >
          Add a new book or try another search.
        </p>
      </div>
    )
  }


  function confirmDeleteBook(book) {
    const ok = window.confirm(
      `Delete "${book.title}" and all of its editions?`
    )

    if (ok) {
      onDeleteBook(book.id)
    }
  }


  return (
    <div
      className="
        overflow-hidden
        rounded-3xl
        border border-slate-200
        bg-white
        shadow-sm
      "
    >
      <div
        className="
          overflow-x-auto
        "
      >
        <table
          className="
            min-w-full
            text-left
          "
        >
          <thead
            className="
              border-b
              border-slate-200
              bg-slate-50
            "
          >
            <tr>
              <th
                className="
                  px-6 py-4
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wider
                  text-slate-500
                "
              >
                Book
              </th>

              <th
                className="
                  px-6 py-4
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wider
                  text-slate-500
                "
              >
                Author
              </th>

              <th
                className="
                  px-6 py-4
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wider
                  text-slate-500
                "
              >
                Editions
              </th>

              <th
                className="
                  px-6 py-4
                  text-right
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wider
                  text-slate-500
                "
              >
                Action
              </th>
            </tr>
          </thead>


          <tbody>
            {books.map((book) => (
              <tr
                key={book.id}
                className="
                  border-b
                  border-slate-100
                  last:border-none
                  hover:bg-slate-50/70
                "
              >
                <td
                  className="
                    px-6 py-5
                  "
                >
                  <p
                    className="
                      font-semibold
                      text-slate-950
                    "
                  >
                    {book.title}
                  </p>
                </td>


                <td
                  className="
                    px-6 py-5
                    text-sm
                    text-slate-600
                  "
                >
                  {book.author}
                </td>


                <td
                  className="
                    px-6 py-5
                  "
                >
                  <div
                    className="
                      flex
                      flex-wrap
                      gap-2
                    "
                  >
                    {book.editions.map(
                      (edition) => (
                        <div
                          key={edition.id}
                          className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-full
                            bg-indigo-50
                            px-3 py-1.5
                            text-sm
                            font-medium
                            text-indigo-700
                          "
                        >
                          <span>
                            {edition.edition}
                          </span>

                          <button
                            type="button"
                            title="Delete edition"
                            onClick={() =>
                              onDeleteEdition(
                                edition.id
                              )
                            }
                            className="
                              rounded-full
                              px-1
                              text-indigo-400
                              transition
                              hover:bg-indigo-100
                              hover:text-rose-600
                            "
                          >
                            ×
                          </button>
                        </div>
                      ),
                    )}
                  </div>
                </td>


                <td
                  className="
                    px-6 py-5
                    text-right
                  "
                >
                  <button
                    type="button"
                    onClick={() =>
                      confirmDeleteBook(book)
                    }
                    className="
                      rounded-lg
                      px-3 py-2
                      text-sm
                      font-medium
                      text-slate-500
                      transition
                      hover:bg-rose-50
                      hover:text-rose-600
                    "
                  >
                    Delete book
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}


export default BookTable