import { run } from "@cotext/sdk";
// @ts-ignore fix for those who needs window
globalThis.window ??= globalThis;
run();
