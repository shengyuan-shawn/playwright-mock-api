import { apiTest, expect } from "../fixtures/api.fixtures";
import { API_TEST_DATA, API_TEST_POSTS } from "../test-data/api.test-data";

apiTest.describe.serial("API Tests", () => {
  let createdPostId: number;

  const postBody = API_TEST_DATA.CREATE_POST;
  const patchBody = API_TEST_DATA.PATCH_POST;
  const defaultBody = API_TEST_DATA.DEFAULT_POST;

  apiTest("Step 1: Create a new post via POST request", async ({ api }) => {
    const response = await api.postMethod(postBody);

    expect(response.ok).toBeTruthy();
    expect(response.statusCode).toBe(201);

    expect(response.data).toHaveProperty("id");
    expect(typeof response.data.id).toBe("number");
    expect(response.data.userId).toBe(postBody.userId);
    expect(typeof response.data.userId).toBe("number");
    expect(response.data.title).toBe(postBody.title);
    expect(response.data.body).toBe(postBody.body);

    // const validateData = api.verifyResponse(
    //   response.statusCode,
    //   response.data,
    //   postBody,
    // );
    // expect(validateData.isValid).toBe(true);

    createdPostId = response.data.id;
  });

  apiTest("Step 2: Read the created post via GET request", async ({ api }) => {
    const response = await api.getMethod(createdPostId);
    expect(response.statusCode).toBe(404);

    const isEmpty = api.isResponseEmpty(response.data);
    expect(isEmpty).toBe(true);
  });

  apiTest("Step 3: Update post via PATCH request", async ({ api }) => {
    const response = await api.patchMethod(
      API_TEST_POSTS.DEFAULT_POST_ID,
      patchBody,
    );

    expect(response.ok).toBeTruthy();
    expect(response.statusCode).toBe(200);

    expect(response.data).toHaveProperty("id");
    expect(response.data.userId).toBe(patchBody.userId);
    expect(response.data.id).toBe(API_TEST_POSTS.DEFAULT_POST_ID);
    expect(response.data.title).toBe(patchBody.title);
    expect(response.data.body).toBe(patchBody.body);
  });

  apiTest("Step 4: Verify updated data by GET request", async ({ api }) => {
    const response = await api.getMethod(API_TEST_POSTS.DEFAULT_POST_ID);

    expect(response.ok).toBeTruthy();
    expect(response.statusCode).toBe(200);

    expect(response.data).toHaveProperty("id");
    expect(typeof response.data.id).toBe("number");
    expect(response.data.userId).toBe(API_TEST_POSTS.DEFAULT_POST_ID);
    expect(typeof response.data.userId).toBe("number");
    expect(response.data.title).not.toBe(patchBody.title);
    expect(response.data.body).not.toBe(patchBody.body);

    // const validateData = api.verifyResponse(
    //   response.statusCode,
    //   response.data,
    //   patchBody,
    // );
    // expect(validateData.isValid).toBe(false);
  });

  apiTest("Step 5: Delete post via DELETE request", async ({ api }) => {
    const response = await api.deleteMethod(API_TEST_POSTS.DEFAULT_POST_ID);

    expect(response.ok).toBeTruthy();
    expect(response.statusCode).toBe(200);

    expect(response.data).toEqual({});
  });

  apiTest(
    "Step 6: Verify deletion by attempting GET request",
    async ({ api }) => {
      const response = await api.getMethod(API_TEST_POSTS.DEFAULT_POST_ID);

      if (response.statusCode === 200) {
        const isEmpty = api.isResponseEmpty(response.data);
        expect(isEmpty).toBe(false);
        const validateData = api.verifyResponse(
          response.statusCode,
          response.data,
          defaultBody,
        );
        expect(validateData.isValid).toBe(true);
      } else {
        expect(response.statusCode).toBe(404);
      }
    },
  );
});
