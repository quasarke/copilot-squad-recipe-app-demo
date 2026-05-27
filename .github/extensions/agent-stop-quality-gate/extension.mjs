// Extension: agent-stop-quality-gate
// Runs repo quality tools when the agent becomes idle and asks it to continue if any fail.

import { execFile } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { joinSession } from "@github/copilot-sdk/extension";

const extensionDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(extensionDir, "..", "..", "..");
const webRoot = path.join(repoRoot, "src", "RecipeHub.Web");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

let qualityGateRunning = false;
let lastBlockSignature = "";
let skipNextIdle = false;

const session = await joinSession({
    tools: [],
});

session.on("session.idle", async () => {
    if (skipNextIdle) {
        skipNextIdle = false;
        return;
    }

    if (qualityGateRunning) {
        return;
    }

    qualityGateRunning = true;
    try {
        const results = await runQualityGate();
        const failures = results.filter((result) => result.status !== "pass");

        if (failures.length === 0) {
            lastBlockSignature = "";
            await session.log("agentStop quality gate: allow", { ephemeral: true });
            return;
        }

        const prompt = buildBlockPrompt(results);
        const signature = prompt.slice(0, 8000);
        await session.log("agentStop quality gate: block", {
            level: "warning",
            ephemeral: true,
        });

        // Avoid an infinite loop if the agent stopped without changing the reported failures.
        if (signature !== lastBlockSignature) {
            lastBlockSignature = signature;
            skipNextIdle = true;
            setTimeout(() => {
                session.send({ prompt }).catch(() => undefined);
            }, 0);
        }
    } finally {
        qualityGateRunning = false;
    }
});

async function runQualityGate() {
    return [
        await runTool("dotnet format", "dotnet", ["format", "--verify-no-changes"], repoRoot),
        await runTool(
            "eslint",
            npmCommand,
            ["exec", "eslint", "--", ".", "--max-warnings=0"],
            webRoot,
        ),
        await runTool(
            "prettier",
            npmCommand,
            ["exec", "prettier", "--", "--check", "."],
            webRoot,
        ),
    ];
}

function runTool(name, command, args, cwd) {
    return new Promise((resolve) => {
        execFile(
            command,
            args,
            {
                cwd,
                timeout: 120000,
                maxBuffer: 1024 * 1024,
            },
            (error, stdout, stderr) => {
                const output = [stdout, stderr].filter(Boolean).join("\n").trim();
                const hasWarnings = /\bwarn(?:ing)?s?\b|\[warn\]/i.test(output);
                const status = error || hasWarnings ? "fail" : "pass";

                resolve({
                    name,
                    status,
                    exitCode: typeof error?.code === "number" ? error.code : 0,
                    output: output || "(no output)",
                });
            },
        );
    });
}

function buildBlockPrompt(results) {
    const body = results
        .map((result) => {
            return [
                `## ${result.status === "pass" ? "PASS" : "FAIL"}: ${result.name}`,
                `Exit code: ${result.exitCode}`,
                "```text",
                truncate(result.output, 6000),
                "```",
            ].join("\n");
        })
        .join("\n\n");

    return [
        "AGENTSTOP_QUALITY_GATE=block",
        "",
        "The agent stop quality gate ran `dotnet format --verify-no-changes`, ESLint, and Prettier.",
        "At least one tool returned errors or warnings. Treat this as blocked work: fix the reported issues, then stop again so the quality gate can rerun.",
        "",
        body,
    ].join("\n");
}

function truncate(value, maxLength) {
    if (value.length <= maxLength) {
        return value;
    }

    return `${value.slice(0, maxLength)}\n... output truncated ...`;
}
