import { apiTest, expect } from "../fixtures/api.fixtures";

apiTest.describe.serial("API Tests", () => {
  let createdPostId: number;

  const postBody = {
    userId: 101,
    title: "My New Post",
    body: "This is the content of my new post created via API",
  };

  const patchBody = {
    userId: 111,
    title: "Update Existing Post",
    body: "Lorem ipsum content for updating the body of the API",
  };

  const defaultData = {
    userId: 1,
    id: 1,
    title:
      "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
    body: "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto",
  };

  apiTest("Step 1: Create a new post via POST request", async ({ api }) => {
    const response = await api.postMethod(postBody);
    expect(response.statusCode).toBe(201);
    expect(response.data).toHaveProperty("id");

    createdPostId = response.data.id;

    const validateData = api.verifyResponse(
      response.statusCode,
      response.data,
      postBody,
    );
    expect(validateData.isValid).toBe(true);

    // Replace With The isValid Logic
    // expect(response.data.userId).toBe(postBody.userId);
    // expect(response.data.id).toBe(postBody.id);
    // expect(response.data.title).toBe(postBody.title);
    // expect(response.data.body).toBe(postBody.body);
  });

  apiTest("Step 2: Read the created post via GET request", async ({ api }) => {
    const response = await api.getMethod(createdPostId);
    const isEmpty = api.isResponseEmpty(response.data);

    expect(response.statusCode).toBe(404);
    expect(isEmpty).toBe(true);
  });

  apiTest("Step 3: Update post via PATCH request", async ({ api }) => {
    const response = await api.patchMethod(1, patchBody);

    expect(response.statusCode).toBe(200);
    expect(response.data).toHaveProperty("id");

    expect(response.data.userId).toBe(patchBody.userId);
    expect(response.data.id).toBe(1);
    expect(response.data.title).toBe(patchBody.title);
    expect(response.data.body).toBe(patchBody.body);
  });

  apiTest("Step 4: Verify updated data by GET request", async ({ api }) => {
    const response = await api.getMethod(1);
    const validateData = api.verifyResponse(
      response.statusCode,
      response.data,
      patchBody,
    );

    expect(response.statusCode).toBe(200);
    expect(validateData.isValid).toBe(false);
  });

  apiTest("Step 5: Delete post via DELETE request", async ({ api }) => {
    const response = await api.deleteMethod(1);

    expect(response.statusCode).toBe(200);
  });

  apiTest(
    "Step 6: Verify deletion by attempting GET request",
    async ({ api }) => {
      const response = await api.getMethod(1);

      if (response.statusCode === 200) {
        const isEmpty = api.isResponseEmpty(response.data);
        expect(isEmpty).toBe(false);
        const validateData = api.verifyResponse(
          response.statusCode,
          response.data,
          defaultData,
        );
        expect(validateData.isValid).toBe(true);
      } else {
        expect(response.statusCode).toBe(404);
      }
    },
  );
});
