import {DomainContainer} from "@cotext/sdk";
import {SharedWorkerEntry, WorkerEntry} from "@cmmn/domain/worker";
// @ts-ignore fix for those who needs window
globalThis.window ??= globalThis;
DomainContainer().get(WorkerEntry);
