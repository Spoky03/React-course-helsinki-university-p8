import { useState } from 'react'
import { useMutation} from '@apollo/client'
import { ADD_BOOK, ALL_BOOKS, BOOKS_BY_GENRE} from '../queries'


const NewBook = () => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [published, setPublished] = useState('')
  const [genre, setGenre] = useState('')
  const [genres, setGenres] = useState([])

  const [createBook] = useMutation(ADD_BOOK, {
    refetchQueries: [{ query: BOOKS_BY_GENRE, variables: { genre: 'all' } }, { query: ALL_BOOKS }],
    onError: (error) => {
      const messages = error.graphQLErrors.map(e => e.message).join('\n')
      console.log('error:', messages)
      console.log('error:', error)
    },
    // update: (cache, response) => {
    //   cache.updateQuery({ query: ALL_BOOKS }, ({ allBooks }) => {
    //     return {
    //       allBooks: allBooks.concat(response.data.addBook),
    //     }
    //   })
    // },
  })

  const submit = async (event) => {
    event.preventDefault()
    createBook({ variables: { title, author, published: parseInt(published), genres } })
    setTitle('')
    setPublished('')
    setAuthor('')
    setGenres([])
    setGenre('')
  }

  const addGenre = () => {
    setGenres(genres.concat(genre))
    setGenre('')
  }

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          published
          <input
            type="number"
            value={published}
            onChange={({ target }) => setPublished(target.value)}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type="button">
            add genre
          </button>
        </div>
        <div>genres: {genres.join(' ')}</div>
        <button type="submit">create book</button>
      </form>
    </div>
  )
}

export default NewBook