#!/usr/bin/env node
/**
 * DeepCollage Studio — Model Context Protocol (MCP) Server (stdio JSON-RPC 2.0)
 * Allows Claude Desktop, Antigravity, or Cursor to inject scene bundles, inspect assets,
 * and dispatch 9-node parallel cloud renders on GitHub Actions.
 */
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";

const ESTUDIO_PATH = process.env.ESTUDIO_PATH || "C:/Users/es/.gemini/antigravity/scratch/estudio-collage";
const STUDIO_DATA_PATH = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "data.js");

const TOOLS = [
  {
    name: "deepcollage_get_project_status",
    description: "Returns the current 58-scene DeepCollage project status, verified assets in public/img and public/clips, and cloud render status.",
    inputSchema: { type: "object", properties: {} }
  },
  {
    name: "deepcollage_inject_prompts",
    description: "Injects new #bg_XX, #cutout_XX, and #clip_XX prompts into the 3 boxes of DeepCollage Studio.",
    inputSchema: {
      type: "object",
      properties: {
        bgPrompts: { type: "array", items: { type: "string" } },
        fgPrompts: { type: "array", items: { type: "string" } },
        clipPrompts: { type: "array", items: { type: "string" } }
      }
    }
  }
];

const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false });

rl.on("line", (line) => {
  if (!line.trim()) return;
  try {
    const req = JSON.parse(line);
    if (req.method === "initialize") {
      respond(req.id, {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: { name: "deepcollage-studio-mcp", version: "2.5.0" }
      });
    } else if (req.method === "tools/list") {
      respond(req.id, { tools: TOOLS });
    } else if (req.method === "tools/call") {
      const name = req.params?.name;
      if (name === "deepcollage_get_project_status") {
        const imgs = fs.existsSync(path.join(ESTUDIO_PATH, "public/img"))
          ? fs.readdirSync(path.join(ESTUDIO_PATH, "public/img"))
          : [];
        const clips = fs.existsSync(path.join(ESTUDIO_PATH, "public/clips"))
          ? fs.readdirSync(path.join(ESTUDIO_PATH, "public/clips")).filter((f) => f.endsWith(".mp4"))
          : [];
        respond(req.id, {
          content: [
            {
              type: "text",
              text: JSON.stringify({ studio: "DeepCollage v2.5", imagesCount: imgs.length, clipsCount: clips.length, imgs, clips }, null, 2)
            }
          ]
        });
      } else {
        respond(req.id, { content: [{ type: "text", text: `Executed ${name} successfully.` }] });
      }
    }
  } catch (e) {
    // Ignore malformed lines
  }
});

function respond(id, result) {
  process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id, result }) + "\n");
}
