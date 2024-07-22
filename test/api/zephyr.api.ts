import axios from "axios";

const zephyrApiEndpoint = "https://api.zephyrscale.smartbear.com/v2/testexecutions";
const apiToken = process.env.ZEPHYR_TOKEN;

export const updateZephyrTestExecution = async (
  testCaseKey: string,
  statusName: string,
  comment: string,
  duration: number
) => {
  const data = {
    projectKey: process.env.ZEPHYR_PROJECT_KEY,
    testCaseKey: testCaseKey,
    testCycleKey: process.env.ZEPHYR_TEST_CYCLE_KEY,
    statusName: statusName,
    environmentName: process.env.ZEPHYR_ENV,
    assignedToId: process.env.ZEPHYR_ACCOUNT,
    executedById: process.env.ZEPHYR_ACCOUNT,
    comment: comment,
    executionTime: duration,
  };

  try {
    const response = await axios.post(zephyrApiEndpoint, data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
    });
    console.log(`================================\nTest Case ${testCaseKey} updated with status ${statusName}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to update Test Case ${testCaseKey}:`, error);
    throw error;
  }
};
