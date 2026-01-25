import { test as base, expect } from "@playwright/test";
import { APIClient } from "../api/apiClient";

export type APIFixtures = {
  api: APIClient;
};

const API_BASE_URL = "https://jsonplaceholder.typicode.com";

export const apiTest = base.extend<APIFixtures>({
  api: async ({ request }, use, testInfo) => {

    const sanitizedTestName = testInfo.title
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    const client = new APIClient(API_BASE_URL, request, sanitizedTestName);

    await use(client);
  },
});

export { expect };