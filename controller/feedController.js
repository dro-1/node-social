exports.getFeeds = (req, res, next) => {
  res.json({
    status: "Success",
    posts: [
      {
        _id: "1",
        title: "A new Post",
        content: "This is the start of something amazing",
        imageUrl: "images/girl.jpg",
        creator: {
          name: "dro",
        },
        createdAt: new Date(),
      },
    ],
  });
};

exports.postFeed = (req, res, next) => {
  const { content, title } = req.body;
  res.status(201).json({
    message: "Post uploaded successfully",
    post: {
      _id: "2",
      title,
      content,
      imageUrl: "images/girl.jpg",
      creator: {
        name: "dro",
      },
      createdAt: new Date(),
    },
  });
};
