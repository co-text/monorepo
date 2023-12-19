import { WorkerEntry } from "@cmmn/domain/worker";
import {DomainContainer} from "@cotext/sdk";
// @ts-ignore fix for those who needs window
globalThis.window ??= globalThis;
DomainContainer().get(WorkerEntry);