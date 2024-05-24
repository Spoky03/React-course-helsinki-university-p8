import { LOGIN } from '../queries'
import { useQuery, useMutation } from '@apollo/client'
import { useState, useEffect } from 'react'
export const LoginForm = ({setPage, setToken, show}) => {
    // if (show) {
  //   return null
  // }
  const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

  const [ login, result ] = useMutation(LOGIN, {
    onError: (error) => {
      console.log('error:', error)
    }
  })
  useEffect(() => {
    if ( result.data ) {
      const token = result.data.login.value
      setToken(token)
      localStorage.setItem('user-token', token)
    }
  }, [result.data])
  if (result.loading) {
    return <div>loading...</div>
  }
  const submit = async (event) => {
    event.preventDefault()

    login({ variables: { username, password } })
  }
  return (
    <div>
      <form onSubmit={submit}>
        <div>
          username <input
            value={username}
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div>
          password <input
            type='password'
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <button type='submit'>login</button>
      </form>
    </div>
  )
}