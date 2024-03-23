import { getOrAdd, Injectable } from "@cmmn/core";

@Injectable()
export class ResourceTokenStore {
    constructor() {
    }

    private tokens = new Map<string, Promise<string>>();

    private async FetchToken(uri: string, parentURI: string) {
        const parentToken = parentURI && await this.tokens.get(parentURI);
        const request = await fetch('/api/context?uri=' + uri, {
            headers: {
                'authorization': JSON.stringify({user: 'andrey'}),
                "resource-token": parentToken
            }
        });
        if (!request.ok)
            return null;
        const token = request.headers.get('resource-token');
        return token;
    }

    public GetToken(uri: string, parentURI: string): Promise<string> {
        const res = getOrAdd(this.tokens, uri, () => this.FetchToken(uri, parentURI));
        res['hi'] = 'hi';
        return res;
    }
}