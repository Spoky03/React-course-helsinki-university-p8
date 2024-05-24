import { useQuery } from '@apollo/client'
import { ALL_BOOKS, ME, BOOKS_BY_GENRE } from '../queries'
import { useState, useEffect } from 'react'

export const Recommendations = ({genre}) => {
    // if (!props.show) {
    //   return null
    // }
    const result = useQuery(BOOKS_BY_GENRE, {
        variables: { genre },
      })
    if (result.loading) {
      return <div>loading...</div>
    }
  
    const books = result.data.booksByGenre

    return (
        <div>
          <h2>Recommendations</h2>
    
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
        </div>
      )
    }