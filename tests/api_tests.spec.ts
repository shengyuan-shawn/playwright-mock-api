import { test, expect } from "@playwright/test";
import { APIClient } from "../api/apiClient";

test.describe.serial("API Tests", () => {
  const API_BASE_URL = "https://jsonplaceholder.typicode.com";
  const userId = 1;

  let apiClient: APIClient;

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

  test("Step 1: Create a new post via POST request", async ({ request }) => {
    // Initialize APIClient with request fixture from THIS test
    apiClient = new APIClient(API_BASE_URL, request);
    apiClient.initializeTestDataFolder();

    const response = await apiClient.postMethod(postBody);
    const validateData = apiClient.verifyResponse(
      response.statusCode,
      response.data,
      postBody,
    );

    expect(response.statusCode).toBe(201);
    expect(response.data).toHaveProperty("id");
    expect(validateData.isValid).toBe(true);

    // Replace With The isValid Logic
    // expect(response.data.userId).toBe(postBody.userId);
    // expect(response.data.id).toBe(postBody.id);
    // expect(response.data.title).toBe(postBody.title);
    // expect(response.data.body).toBe(postBody.body);
  });

  test("Step 2: Read the created post via GET request", async ({ request }) => {
    apiClient = new APIClient(API_BASE_URL, request);

    const response = await apiClient.getMethod(postBody.userId);
    const isEmpty = apiClient.isResponseEmpty(response.data);

    expect(response.statusCode).toBe(404);
    expect(isEmpty).toBe(true);
  });

  test("Step 3: Update post via PATCH request", async ({ request }) => {
    apiClient = new APIClient(API_BASE_URL, request);

    const response = await apiClient.patchMethod(userId, patchBody);

    expect(response.statusCode).toBe(200);
    expect(response.data).toHaveProperty("id");

    expect(response.data.userId).toBe(patchBody.userId);
    expect(response.data.id).toBe(userId);
    expect(response.data.title).toBe(patchBody.title);
    expect(response.data.body).toBe(patchBody.body);
  });

  test("Step 4: Verify updated data by GET request", async ({ request }) => {
    apiClient = new APIClient(API_BASE_URL, request);

    const response = await apiClient.getMethod(userId);
    const validateData = apiClient.verifyResponse(
      response.statusCode,
      response.data,
      patchBody,
    );

    expect(response.statusCode).toBe(200);
    expect(validateData.isValid).toBe(false);
  });

  test("Step 5: Delete post via DELETE request", async ({ request }) => {
    apiClient = new APIClient(API_BASE_URL, request);

    const response = await apiClient.deleteMethod(userId);

    expect(response.statusCode).toBe(200);
  });

  test("Step 6: Verify deletion by attempting GET request", async ({
    request,
  }) => {
    apiClient = new APIClient(API_BASE_URL, request);

    const response = await apiClient.getMethod(userId);
    const isEmpty = apiClient.isResponseEmpty(response.data);
    const validateData = apiClient.verifyResponse(
      response.statusCode,
      response.data,
      defaultData,
    );

    expect(response.statusCode).toBe(200);
    expect(isEmpty).toBe(false);
    expect(validateData.isValid).toBe(true);
  });
});
