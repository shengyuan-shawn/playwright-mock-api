export const API_TEST_DATA = {
  CREATE_POST: {
    userId: 101,
    title: "My New Post",
    body: "This is the content of my new post created via API",
  },

  PATCH_POST: {
    userId: 111,
    title: "Update Existing Post",
    body: "Lorem ipsum content for updating the body of the API",
  },

  DEFAULT_POST: {
    userId: 1,
    id: 1,
    title:
      "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
    body: "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto",
  },
} as const;

export const API_TEST_POSTS = {
  DEFAULT_POST_ID: 1,
} as const;
