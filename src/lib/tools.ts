import yaml from "js-yaml";
import fs from "fs";
import path from "path";
import { Tool } from "@langchain/core/tools";
import { z } from "zod";

interface DataSource {
  id: string;
  name: string;
  url: string;
  terms_of_use: string;
}

const dataSources = yaml.load(
  fs.readFileSync(path.join(process.cwd(), "datasources.yml"), "utf8"),
) as DataSource[];

function isAllowedSource(sourceId: string): boolean {
  return dataSources.some((source) => source.id === sourceId);
}

class WebFetchTool extends Tool {
  name = "web.fetch";
  description = "Fetches content from a URL.";

  zodSchema = z.object({
    sourceId: z.string().describe("The ID of the data source to fetch from."),
    url: z.string().describe("The URL to fetch content from."),
  });

  async _call(arg: z.infer<typeof this.zodSchema>): Promise<string> {
    if (!isAllowedSource(arg.sourceId)) {
      return `Error: Source '${arg.sourceId}' is not on the allow-list.`;
    }

    try {
      const response = await fetch(arg.url);
      if (!response.ok) {
        return `Error: Failed to fetch content from ${arg.url}. Status: ${response.status}`;
      }
      return await response.text();
    } catch (error) {
      return `Error: An error occurred while fetching content from ${arg.url}.`;
    }
  }
}

export const webFetch = new WebFetchTool();