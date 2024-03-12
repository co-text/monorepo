import { builder } from "./builder";
import { Application } from '@cmmn/app'

const app = builder.build(Application);

window.addEventListener('beforeunload', () => {
  app.destroy();
})