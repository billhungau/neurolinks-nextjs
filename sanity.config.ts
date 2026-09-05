import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { presentationTool } from "sanity/presentation";
import { structureTool } from "sanity/structure";
import { apiVersion, dataset, projectId } from "./src/sanity/env";
import { resolve } from "./src/sanity/presentation";
import { schemaTypes } from "./src/sanity/schemaTypes";
import { structure } from "./src/sanity/structure";
import { StudioBannerLayout } from "./src/sanity/studio-layout";

const studioProjectId = projectId || "unconfigured";

export default defineConfig({
  name: "neurolinks-insights",
  title: "NeuroLinks Insights",
  projectId: studioProjectId,
  dataset,
  basePath: "/studio",
  plugins: [
    structureTool({ structure }),
    presentationTool({
      resolve,
      previewUrl: {
        previewMode: {
          enable: "/api/draft-mode/enable",
        },
      },
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
  schema: {
    types: schemaTypes,
  },
  studio: {
    components: {
      layout: StudioBannerLayout,
    },
  },
  document: {
    comments: {
      enabled: false,
    },
  },
});
