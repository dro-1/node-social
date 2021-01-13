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

    type PostData {
        posts: [Post!]!
        totalPosts: Int!
    }

    input UserInputData {
        name: String!
        password: String!
        email: String!
    }

    input PostInputData {
        title: String!
        content: String!
        imageUrl: String!
    }

    input EditPostInputData {
        title: String
        content: String
        imageUrl: String
    }

    type AuthData {
        token: String!
        userId: String!
    }

    type RootMutation {
        createUser(userInput: UserInputData): User!
        createPost(postInput: PostInputData): Post!
        updatePost(postId: String!, postInput: EditPostInputData): Post! 
        deletePost(postId: String!): String
        updateStatus(status: String!): String!
    }

    type RootQuery {
        login(email: String! , password: String!): AuthData!
        getPosts(page: Int): PostData!
        getPost(postId: String!): Post
        getStatus: String!
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }

`);
