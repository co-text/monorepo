import { Storage } from "./storage";
import type { ContextJSON } from "@domain";
import { utc } from "@cmmn/core";

export class Context {
    public readonly id: string;
    public URI: string;

    public Messages: ReadonlyArray<string> = [];
    // public Parents: ReadonlyArray<string> = [];
    // public Access?: Array<AccessRule> = [];
    // public Sorting?: Sorting;
    public Storage: Omit<Storage, keyof { Root, Contexts, Messages }>;
    // public Parents: Array<string> = [];
    public IsRoot: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;

    public equals?(m: Context): boolean;


    static FromJSON(c: ContextJSON): Context {
        return Object.assign(new Context(), {
            URI: c.URI,
            id: c.id,
            Storage: null,
            // Parents: [],
            IsRoot: c.IsRoot,
            UpdatedAt: utc(c.UpdatedAt),
            CreatedAt: utc(c.CreatedAt),
            Messages: [],
        });
    }

    static ToJSON(c: Context): ContextJSON {
        return {
            // StorageURI: c.Storage.URI,
            URI: c.URI,
            id: c.id,
            UpdatedAt: c.UpdatedAt.toJSON(),
            CreatedAt: c.CreatedAt?.toJSON(),
            IsRoot: c.IsRoot,
        };
    }

    static equals(x: Context, y: Context): boolean {
        if (x == null && y == null)
            return true;
        if (!x && y || !y && x)
            return false;
        if (y.URI && y.URI !== x.URI)
            return false;
        if (x.id && x.id !== y.id)
            return false;
        return +y.UpdatedAt == +x.UpdatedAt;
    }

}
