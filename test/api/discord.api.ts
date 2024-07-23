import axios from "axios";

const discordWebhookUrl = process.env.DISCORD_HOOK_URL as string;
const zephyrApiEndpoint = "https://api.zephyrscale.smartbear.com/v2/testexecutions";

// TODO: Update users data
const jiraUsers: { [key: string]: string } = {
  Naufal: "712020:a27db7c2-ed39-4878-b103-b9d5f2ad3a7a",
};

const userName = Object.keys(jiraUsers).find((key) => jiraUsers[key] === process.env.ZEPHYR_ACCOUNT);

const formatSpecs = (specs: string[]): string => {
  return specs
    .map((spec) => `"./${spec.split(", ")[0].replace(/file:\/\/.*\/test\/specs/, "test/specs")}"`)
    .join(",\n");
};

const splitIntoChunks = (text: string, maxLength: number): string[] => {
  const chunks: string[] = [];
  let currentChunk = "";

  text.split(",\n").forEach((spec) => {
    if ((currentChunk + spec).length > maxLength) {
      chunks.push(currentChunk.trim());
      currentChunk = "";
    }
    currentChunk += spec + ",\n";
  });

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
};

interface Config {
  totalExecutionTime: number;
  capabilities: { browserName: string };
  specsPassed: string[];
  specsFailed: string[];
}

const regressionDiscordHooks = async (config: Config): Promise<void> => {
  try {
    // Fetch test execution data from Zephyr API
    const response = await axios.get(
      `${zephyrApiEndpoint}?testCycle=${process.env.ZEPHYR_TEST_CYCLE_KEY}&onlyLastExecutions=true&maxResults=99999`,
      {
        headers: {
          Authorization: process.env.ZEPHYR_TOKEN as string,
          "Content-Type": "application/json",
        },
      }
    );

    const testExecutions = response.data.values.filter(
      (execution: any) => execution.assignedToId === process.env.ZEPHYR_ACCOUNT
    );

    // TODO: adjust homecare zephyr
    const passedStatusId = 6946699;
    const failedStatusId = 6946700;
    const notExecutedStatusId = 6946697;
    const blockedId = 6946701;
    const inProgressId = 6946698;

    const totalTests = testExecutions.length;

    const passedTests = testExecutions.filter((execution: any) => {
      return execution.testExecutionStatus.id === passedStatusId;
    }).length;

    const failedTests = testExecutions.filter((execution: any) => {
      return execution.testExecutionStatus.id === failedStatusId;
    }).length;

    const notExecutedTests = testExecutions.filter((execution: any) => {
      return execution.testExecutionStatus.id === notExecutedStatusId;
    }).length;

    const blockedTests = testExecutions.filter((execution: any) => {
      return execution.testExecutionStatus.id === blockedId;
    }).length;

    const inProgressTests = testExecutions.filter((execution: any) => {
      return execution.testExecutionStatus.id === inProgressId;
    }).length;

    const executionTime = config.totalExecutionTime;

    const passPercentage = (passedTests / totalTests) * 100;
    let statusMessage = `${passPercentage.toFixed(2)}% tests passed.`;
    let color = 65280; // Green

    if (passPercentage < 50) {
      color = 16711680; // Red
    } else if (passPercentage < 90) {
      color = 16776960; // Yellow
    } else if (passPercentage < 100) {
      color = 65280; // Green
    } else {
      statusMessage = "All tests passed successfully!";
    }

    const message = "Regression completed @here";

    const fields = [
      {
        name: "Total Assigned",
        value: totalTests.toString(),
        inline: true,
      },
      {
        name: "Passed",
        value: passedTests.toString(),
        inline: true,
      },
      {
        name: "Failed",
        value: failedTests.toString(),
        inline: true,
      },
      {
        name: "In Progress",
        value: inProgressTests.toString(),
        inline: true,
      },
      {
        name: "Blocked",
        value: blockedTests.toString(),
        inline: true,
      },
      {
        name: "Not Executed",
        value: notExecutedTests.toString(),
        inline: true,
      },
      {
        name: "Execution Time",
        value: `${Math.floor(executionTime / 3600000)}h ${Math.floor((executionTime % 3600000) / 60000)}m ${(
          (executionTime % 60000) /
          1000
        ).toFixed(2)}s`,
        inline: true,
      },
      {
        name: "Browser",
        value: `${config.capabilities.browserName}`,
        inline: true,
      },
      {
        name: "Executor",
        value: userName,
        inline: true,
      },
      {
        name: "Status",
        value: statusMessage,
      },
    ];

    if (config.specsPassed.length > 0) {
      const specsPassedChunks = splitIntoChunks(formatSpecs(config.specsPassed), 1024);

      fields.push({
        name: "Specs Passed",
        value: specsPassedChunks.shift()!,
        inline: false,
      });

      specsPassedChunks.forEach((chunk) => {
        fields.push({
          name: "\u200B",
          value: chunk,
          inline: false,
        });
      });
    }

    if (config.specsFailed.length > 0) {
      const specsFailedChunks = splitIntoChunks(formatSpecs(config.specsFailed), 1024);

      fields.push({
        name: "Specs Failed",
        value: specsFailedChunks.shift()!,
        inline: false,
      });

      specsFailedChunks.forEach((chunk) => {
        fields.push({
          name: "\u200B",
          value: chunk,
          inline: false,
        });
      });
    }

    const embeds = [
      {
        title: "Regression Test Results Running by Automation",
        description: `Result for cycle: **${process.env.ZEPHYR_TEST_CYCLE_KEY}**.`,
        color: color,
        fields: fields,
        footer: {
          text: `Report generated at ${new Date().toLocaleString()}`,
          icon_url: "https://i.imgur.com/fKL31aD.jpg",
        },
      },
    ];

    const data = {
      username: `Regression ${process.env.ZEPHYR_TEST_CYCLE_KEY}`,
      content: message,
      embeds: embeds,
    };

    const discordResponse = await axios.post(discordWebhookUrl, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Message sent to Discord:", message);
    return discordResponse.data;
  } catch (error) {
    console.error("Failed to send message to Discord:", error);
    throw error;
  }
};

export { regressionDiscordHooks };
