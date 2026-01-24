import * as fs from "fs";
import * as path from "path";

export class APIClient {
  private baseURL: string;
  private request: any;
  private testDataDir: string;
  private responsesFile: string;

  constructor(baseURL: string, request: any) {
    this.baseURL = baseURL;
    this.request = request;
    this.testDataDir = path.join(__dirname, "../test-data");
    this.responsesFile = path.join(this.testDataDir, "api-responses.json");
  }

  // Initialize Test Data Folder
  initializeTestDataFolder(): void {
    if (!fs.existsSync(this.testDataDir)) {
      fs.mkdirSync(this.testDataDir, { recursive: true });
    }

    const initialData = {
      responses: [],
    };
    fs.writeFileSync(this.responsesFile, JSON.stringify(initialData, null, 2));
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
      const data = JSON.parse(
        await fs.promises.readFile(this.responsesFile, "utf-8"),
      );

      data.responses.push({
        timestamp: new Date().toISOString(),
        method,
        endpoint,
        requestData,
        responseData,
        status,
      });

      await fs.promises.writeFile(
        this.responsesFile,
        JSON.stringify(data, null, 2),
        "utf-8",
      );
    } catch (error) {
      console.error("Error saving response:", error);
      throw error;
    }
  }

  // POST METHOD
  async postMethod(postData: Record<string, any>): Promise<any> {
    const response = await this.request.post(`${this.baseURL}/posts`, {
      data: postData,
    });

    if (response.status() !== 201) {
      throw new Error(`POST failed with status ${response.status()}`);
    }

    const responseBody = await response.json();
    const statusCode = response.status();

    await this.saveResponse(
      "POST",
      "/posts",
      postData,
      responseBody,
      statusCode,
    );

    return { statusCode, data: responseBody };
  }

  // GET METHOD
  async getMethod(postId: number): Promise<any> {
    const response = await this.request.get(`${this.baseURL}/posts/${postId}`);

    const responseBody = await response.json();
    const statusCode = response.status();

    await this.saveResponse(
      "GET",
      `/posts/${postId}`,
      null,
      responseBody,
      statusCode,
    );

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

    const responseBody = await response.json();
    const statusCode = response.status();

    await this.saveResponse(
      "PATCH",
      `/posts/${postId}`,
      patchData,
      responseBody,
      statusCode,
    );

    return { statusCode, data: responseBody };
  }

  // DELETE METHOD
  async deleteMethod(postId: number): Promise<any> {
    const response = await this.request.delete(
      `${this.baseURL}/posts/${postId}`,
    );

    const responseBody = await response.json();
    const statusCode = response.status();

    await this.saveResponse(
      "DELETE",
      `/posts/${postId}`,
      null,
      responseBody,
      statusCode,
    );

    return { statusCode, data: responseBody };
  }

  // VERIFY RESPONSE
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

  verifyPatchResponse(
    statusCode: number,
    responseData: any,
    patchData: any,
  ): { isValid: boolean; details: any } {
    return this.verifyResponse(statusCode, responseData, patchData);
  }

  verifyPostResponse(
    statusCode: number,
    responseData: any,
    postData: any,
  ): { isValid: boolean; details: any } {
    return this.verifyResponse(statusCode, responseData, postData);
  }
}
