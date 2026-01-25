import * as fs from "fs";
import * as path from "path";
import { APIRequestContext } from "@playwright/test";

export class APIClient {
  private baseURL: string;
  private request: APIRequestContext;
  private testDataDir: string;
  private testName: string = "unknown";
  // private responsesFile: string; // Single File

  constructor(baseURL: string, request: APIRequestContext, testName?: string) {
    if (!baseURL) {
      throw new Error("Base URL is required!");
    }

    this.baseURL = baseURL;
    this.request = request;
    this.testDataDir = path.join(__dirname, "../test-data");
    if (testName) {
      this.testName = testName;
    }
    // this.responsesFile = path.join(this.testDataDir, "api-responses.json"); // Single File

    // Initialize api with request fixture from THIS test
    this.initializeTestDataFolder();
  }

  setTestName(testName: string): void {
    this.testName = testName;
  }

  // Initialize Test Data Folder
  initializeTestDataFolder(): void {
    try {
      if (!fs.existsSync(this.testDataDir)) {
        fs.mkdirSync(this.testDataDir, { recursive: true });
      }

      // Store Data Into Single File
      // if (!fs.existsSync(this.responsesFile)) {
      //   const initialData = { responses: [] };
      //   fs.writeFileSync(
      //     this.responsesFile,
      //     JSON.stringify(initialData, null, 2),
      //   );
      // }
    } catch (error) {
      console.error("Failed to initialize test data folder:", error);
      throw error;
    }
  }

  // Save Response To JSON File
  private async saveResponse(
    method: string,
    endpoint: string,
    requestData: Record<string, any> | null,
    responseData: Record<string, any>,
    status: number,
  ): Promise<void> {
    try {
      const testFolder = path.join(this.testDataDir, this.testName);
      if (!fs.existsSync(testFolder)) {
        fs.mkdirSync(testFolder, { recursive: true });
      }

      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .slice(0, -5);
      const filename = `${method}-${timestamp}.json`;
      const filePath = path.join(testFolder, filename);

      const responseLog = {
        timestamp: new Date().toISOString(),
        testName: this.testName,
        method,
        endpoint,
        requestData,
        responseData,
        status,
      };

      await fs.promises.writeFile(
        filePath,
        JSON.stringify(responseLog, null, 2),
        "utf-8",
      );
    } catch (error) {
      console.error("Error saving response: ", error);
    }
  }
  // private async saveResponse(
  //   method: string,
  //   endpoint: string,
  //   requestData: Record<string, any> | null,
  //   responseData: Record<string, any>,
  //   status: number,
  // ): Promise<void> {
  //   try {
  //     const data = JSON.parse(
  //       await fs.promises.readFile(this.responsesFile, "utf-8"),
  //     );

  //     data.responses.push({
  //       timestamp: new Date().toISOString(),
  //       method,
  //       endpoint,
  //       requestData,
  //       responseData,
  //       status,
  //     });

  //     await fs.promises.writeFile(
  //       this.responsesFile,
  //       JSON.stringify(data, null, 2),
  //       "utf-8",
  //     );
  //   } catch (error) {
  //     console.error("Error saving response:", error);
  //     throw error;
  //   }
  // }

  // POST METHOD
  async postMethod(postData: Record<string, any>): Promise<any> {
    const response = await this.request.post(`${this.baseURL}/posts`, {
      data: postData,
    });

    let responseBody;

    try {
      responseBody = await response.json();
    } catch (err) {
      console.warn(
        `[APIClient] Failed to parse JSON response from POST /posts`,
        err,
      );
      responseBody = null;
    }

    const statusCode = response.status();

    await this.saveResponse(
      "POST",
      "/posts",
      postData,
      responseBody,
      statusCode,
    ).catch((err) => console.warn("Logging failed:", err));

    return { statusCode, data: responseBody };
  }

  // GET METHOD
  async getMethod(postId: number): Promise<any> {
    const response = await this.request.get(`${this.baseURL}/posts/${postId}`);

    let responseBody;

    try {
      responseBody = await response.json();
    } catch (err) {
      console.warn(
        `[APIClient] Failed to parse JSON response from GET /posts/${postId}`,
        err,
      );
      responseBody = null;
    }

    const statusCode = response.status();

    await this.saveResponse(
      "GET",
      `/posts/${postId}`,
      null,
      responseBody,
      statusCode,
    ).catch((err) => console.warn("Logging failed:", err));

    return { statusCode, data: responseBody };
  }

  // PATCH METHOD
  async patchMethod(postId: number, patchData: any): Promise<any> {
    const response = await this.request.patch(
      `${this.baseURL}/posts/${postId}`,
      {
        data: patchData,
      },
    );

    let responseBody;

    try {
      responseBody = await response.json();
    } catch (err) {
      console.warn(
        `[APIClient] Failed to parse JSON response from PATCH /posts/${postId}`,
        err,
      );
      responseBody = null;
    }

    const statusCode = response.status();

    await this.saveResponse(
      "PATCH",
      `/posts/${postId}`,
      patchData,
      responseBody,
      statusCode,
    ).catch((err) => console.warn("Logging failed:", err));

    return { statusCode, data: responseBody };
  }

  // DELETE METHOD
  async deleteMethod(postId: number): Promise<any> {
    const response = await this.request.delete(
      `${this.baseURL}/posts/${postId}`,
    );

    let responseBody;

    try {
      responseBody = await response.json();
    } catch (err) {
      console.warn(
        `[APIClient] Failed to parse JSON response from DELETE /posts/${postId}`,
        err,
      );
      responseBody = null;
    }

    const statusCode = response.status();

    await this.saveResponse(
      "DELETE",
      `/posts/${postId}`,
      null,
      responseBody,
      statusCode,
    ).catch((err) => console.warn("Logging failed:", err));

    return { statusCode, data: responseBody };
  }

  // VERIFY RESPONSE
  // THIS PART CAN BE IGNORE AS THE VALIDATION CAN BE DONE ON PLAYWRIGHT SCRIPT
  verifyResponse(
    statusCode: number,
    responseData: any,
    expectedData?: any,
  ): { isValid: boolean; details: any } {
    // ===== CHECK 1: Handle 404 Not Found =====
    if (statusCode === 404) {
      const isEmpty = this.isResponseEmpty(responseData);
      return {
        isValid: isEmpty,
        details: {
          status: "404 Not Found",
          isEmpty: isEmpty,
          message: isEmpty
            ? "Response is empty as expected"
            : "Response should be empty for 404",
        },
      };
    }

    // ===== CHECK 2: Validate data exists =====
    if (!responseData || !expectedData) {
      return {
        isValid: false,
        details: { error: "responseData or expectedData is null/undefined!" },
      };
    }

    // ===== CHECK 3: Compare data fields =====
    // Only compare fields that exist in expectedData
    const fieldsToCompare = Object.keys(expectedData);
    const matches: any = {};

    fieldsToCompare.forEach((field) => {
      matches[field] = responseData[field] === expectedData[field];
    });

    const isValid = Object.values(matches).every((m) => m);

    // ===== BUILD DETAILS OBJECT =====
    const details: any = {
      status: statusCode,
      fieldsChecked: fieldsToCompare,
    };

    fieldsToCompare.forEach((field) => {
      details[field] = {
        expected: expectedData[field],
        actual: responseData[field],
        match: matches[field],
      };
    });

    return {
      isValid,
      details,
    };
  }

  // VERFIY EMPTY RESPONSE
  isResponseEmpty(responseData: any): boolean {
    if (!responseData) return true;
    if (Array.isArray(responseData)) return responseData.length === 0;
    if (typeof responseData === "object")
      return Object.keys(responseData).length === 0;

    return false;
  }
}
