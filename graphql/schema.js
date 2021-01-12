const { buildSchema } = require("graphql");

module.exports = buildSchema(`
    type Post {
        _id: ID!
        title: String!
        imageUrl: String!
        content: String!
        creator: User!
        updatedAt: String!
        createdAt: String!
    }

    type User {
        _id: ID!
        name: String!
        password: String
        email: String!
        status: String!
        posts: [Post!]!
    }

    input UserInputData {
        name: String!
        password: String!
        email: String!
    }

    type RootMutation {
        createUser(userInput: UserInputData): User!
    }

    type RootQuery {
        hello: String
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }

`);
