const jwt = require('jsonwebtoken')
const Author = require('./models/author')
const Book = require('./models/book')
const User = require('./models/user')
const { GraphQLError } = require('graphql')
const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()

const resolvers = {
    Query: {
      bookCount : async () => {
        return await Book.find({}).countDocuments()
      },
      authorCount: async () => {
        return await Author.find({}).countDocuments()
      },
      allBooks: async (root, args) => {
          const { author, genre } = args
          const authorExists = await Author.findOne({ name: author })
          if (author && !genre) {
              return await Book.find({ author: authorExists }).populate('author')
          }
          if (!author && genre) {
              return await Book.find({ genres: { $in: [genre] } }).populate('author')
          }
          if (author && genre) {
              return await Book.find({ author: authorExists, genres: { $in: [genre] } }).populate('author')
          }
          return await Book.find({}).populate('author')
  
      },
      allAuthors: async() => {
        return await Author.find({})    
      },
      booksByGenre: async(root, args) => {
        const { genre } = args
        if (genre === 'all') {
          return await Book.find({}).populate('author')
        }
        return await Book.find({ genres: { $in: [genre] } }).populate('author')
      },
      me: (root, args, context) => {
        console.log(context)
        return context.currentUser
      },
    },
    Author: {
      bookCount: async (root) => {
        return await Book.find({ author : root}).countDocuments()
      }
    },
    Mutation: {
      addBook: async (root, args, context) => {
        console.log(context)
        console.log('args', args)
        const author = await Author.findOne({ name: args.author })
        const book = new Book({ ...args, author: author})
        const currentUser = context.currentUser
  
        if (!currentUser) {
          throw new GraphQLError('Not authenticated', {
            extensions: {
              code: 'UNAUTHENTICATED',
            }
          })
        }
  
        if (!author) {
          throw new GraphQLError('Author not found', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.author,
            }
          })
        }
        if (!args.title || !args.published || !args.genres) {
          throw new GraphQLError('Missing required fields', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args,
            }
          })
        }
  
        if (await Book.findOne({ title: args.title })) {
          throw new GraphQLError('Book already exists', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.title,
            }
          })
        }
  
        if ( args.title.lenght < 5) {
          throw new GraphQLError('Title must be at least 5 characters long', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.title,
            }
          })
        }
        try {
          await book.save()
        } catch (error) {
          throw new GraphQLError('Saving book failed', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.name,
              error
            }
          })
        }
        pubsub.publish('BOOK_ADDED', { bookAdded: book })
        return book
      },
      editAuthor: async (root, args, context) => {
        const { name, setBornTo } = args
        const author = await Author.findOne({ name: name })
        const currentUser = context.currentUser
  
        if (!currentUser) {
          throw new GraphQLError('Not authenticated', {
            extensions: {
              code: 'UNAUTHENTICATED',
            }
          })
        }
        if (!author) {
          throw new GraphQLError('Author not found', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.name,
            }
          })
        }
        author.born = setBornTo
        try {
          await author.save()
        } catch (error) {
          throw new GraphQLError('Saving author failed', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.name,
              error
            }
          })
        }
        return author
      },
      createUser: async (root, args) => {
        const user = new User({ username: args.username, favoriteGenre: args.favoriteGenre })
        try {
          await user.save()
        } catch (error) {
          throw new GraphQLError('Saving user failed', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.username,
              error
            }
          })
        }
        return user
      },
      login: async (root, args) => {
        const user = await User.findOne({ username: args.username })
        if (!user || args.password !== 'secret') {
          throw new GraphQLError('Invalid credentials', {
            extensions: {
              code: 'UNAUTHENTICATED',
              invalidArgs: args.username,
            }
          })
        }
        const userForToken = {
          username: user.username,
          id: user._id,
        }
        return { value: jwt.sign(userForToken, 'secret') }
      }
    },
    Subscription: {
        bookAdded: {
          subscribe: () => pubsub.asyncIterator('BOOK_ADDED')
        },
      },
  }

module.exports = resolvers