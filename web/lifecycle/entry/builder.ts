import { Container } from "@cmmn/core";
import { useWorkerDomain } from "@cmmn/domain/proxy";
import { uiContainer } from "@ui";
import { storeContainer } from "@stores/container";
import { Api } from "@infr/api";
import { Builder } from '@cmmn/app';

export const builder = new Builder()
  .withRoutes({
      routes: [{
        path: '/',
        name: 'root',
      }, {
        path: ':id',
        name: 'main',
      }],
      // @ts-ignore
      options: {
      }
  })
  .with(storeContainer)
  .with(getDomain())
  .with(Container.withProviders(Api))
  .withUI(uiContainer)

function getDomain() {
    const useWorker = true;
    if (useWorker) {
        globalThis.SharedWorker = class {} as any;
        return useWorkerDomain(new Worker(PRODUCTION ? "/worker.min.js" : "/worker.js"));
    } else {
        const container = new Container();
        // container.provide(useStreamDomain());
        // container.provide([
        //     {provide: Locator, useFactory: c => c.get(DomainLocator)},
        // ])
        // container.provide(DomainContainer());
        return container;
    }

}