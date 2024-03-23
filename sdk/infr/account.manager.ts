import { Cell } from "@cmmn/cell";
import { Injectable, ResolvablePromise } from "@cmmn/core";

@Injectable()
export class AccountManager {
    public init = new ResolvablePromise<void>();

    constructor() {
    }

    public $accounts = new Cell<IAccountInfo[]>([]);

    private providers = new Map<string, IAccountProvider>();

    public async Register(provider: IAccountProvider) {
        this.providers.set(provider.type, provider);
        provider.Check().then(res => res && this.addAccount(res)).catch()
            .then(x => this.init.resolve());
    }


    private async addAccount(info: IAccountInfo) {
        this.$accounts.set([
            ...this.$accounts.get(),
            info
        ]);
    }

    async Login(provider: string) {
        if (!this.providers.has(provider))
            throw new Error(`Unknown provider ${provider}`);
        const acc = await this.providers.get(provider)?.Login();
        if (acc) {
            this.addAccount(acc);
        }
    }

    async Logout(acc: IAccountInfo) {
        this.providers.get(acc.type).Logout(acc);
        this.$accounts.set(this.$accounts.get().filter(x => x.id !== acc.id))
    }

}

export interface IAccountProvider {
    type: string;

    Check(): Promise<IAccountInfo>;

    Login(): Promise<IAccountInfo>;

    Logout(acc: IAccountInfo): void;
}

export interface IAccountInfo {
    id: string;
    type: string;
    title: string;
    session: any;
    defaultStorage: string;
}
