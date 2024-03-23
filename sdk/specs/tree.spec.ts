import { expect, suite, test } from "@cmmn/tools/test";
import { DomainContainer, DomainLocator, Message } from "../index";
import { utc } from "@cmmn/core";

@suite
export class TreeSpec {
    private container = DomainContainer();
    private locator = this.container.get<DomainLocator>(DomainLocator);

    @test
    public async createRoot() {
        const root = this.locator.GetOrCreateContext('root', undefined);
        expect(root.State.URI).toBe('root');
        await root.CreateMessage({
            Content: '1',
            CreatedAt: utc(),
            UpdatedAt: utc()
        } as Message);
        expect(root.State.Messages).toHaveLength(1);
        await root.CreateMessage({
            Content: '2',
            CreatedAt: utc(),
            UpdatedAt: utc()
        } as Message, 0);
        expect(root.State.Messages).toHaveLength(2);
        const messages = Array.from(root.Messages.values());
        expect(messages.map(x => x.State.Content)).toEqual(['2', '1']);
        await messages[1].CreateSubContext('root', undefined);
        expect(messages[1].SubContext).toEqual(root);
        await root.ReorderMessage(messages[1], 0);
        expect(Array.from(root.Messages.values()).map(x => x.State.Content)).toEqual(['1', '2']);
    }
}