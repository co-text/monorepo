import {Container} from "@cmmn/core";
import { Locator, Model } from "@cmmn/domain/worker";
import {DomainModel} from "@domain/model";
import {DomainLocator} from "@domain/model/domain-locator.service";

export const DomainContainer = () => Container.withProviders(
    DomainModel,
    DomainLocator,
    {provide: Locator, useFactory: c => c.get(DomainLocator)},
    {provide: Model, useFactory: c => c.get(DomainModel)}
)
