import { useState } from "react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import {LoginForm} from "./components/LoginForm";
import { useQuery, useApolloClient, useMutation, useSubscription } from '@apollo/client'
import { Recommendations } from "./components/Recommendatons";
import { ME,BOOK_ADDED,ALL_BOOKS, BOOKS_BY_GENRE } from "./queries";




const App = () => {
  const [page, setPage] = useState("authors");
  const [token, setToken] = useState(null)
  const client = useApolloClient()
  const user = useQuery(ME)
  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }
  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      const addedBook = data.data.bookAdded
      console.log(`New book added: ${addedBook.title}`)
      client.cache.updateQuery({ query: BOOKS_BY_GENRE, variables: { genre: 'all' } }, ({ booksByGenre }) => {
        return {
          booksByGenre: booksByGenre.concat(addedBook)
        }
      })
    }
  })

  return (
    <div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        <button onClick={() => setPage("add")}>add book</button>
        <button onClick={logout}>logout</button>
      </div>
      <br />
      <LoginForm setToken={setToken} />
      <br />
      <Authors/>
      <br />
      <Books/>
      <br />
      { !user || !user.data || !user.data.me || user.loading ? <div>loading...</div> :
        <Recommendations genre={user.data.me.favoriteGenre}/>
        }
      <br />
      <NewBook />
    </div>
  );
};

export default App;
