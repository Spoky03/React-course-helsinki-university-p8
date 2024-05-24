import { useQuery, useSubscription } from '@apollo/client'
import { ALL_BOOKS, BOOKS_BY_GENRE, BOOK_ADDED } from '../queries'
import { useState, useEffect } from 'react'

const Books = (props) => {
  // if (!props.show) {
  //   return null
  // }
  const [genre, setGenre] = useState('all')
  const allBooks = useQuery(ALL_BOOKS)
  const result = useQuery(BOOKS_BY_GENRE, {
    variables: { genre },
  })


  if (result.loading || allBooks.loading) {
    return <div>loading...</div>
  }

  const books = result.data.booksByGenre

  const allGenres = allBooks.data.allBooks.reduce((acc, book) => {
    book.genres.forEach((genre) => {
      if (!acc.includes(genre)) {
        acc.push(genre)
      }
    })
    return acc
  }, [])

  return (
    <div>
      <h2>Books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
          <button onClick={() => setGenre('all')}>all genres</button>
      {allGenres.map((genre) => (
            <button key={genre} onClick={() => setGenre(genre)}>{genre}</button>
          ))}
        

    </div>
  )
}

export default Books
