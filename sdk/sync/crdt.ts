import { Model, NodeBuilder } from 'json-joy/es2020/json-crdt'
import { s } from 'json-joy/es2020/json-crdt-patch'
import { utc } from '@cmmn/core'


const msgSchema = s.obj({
    ContextURI: s.con(""),
    SubContextURI: s.con(""),
    Content: s.con(""),
    Description: s.con(""),
    AuthorURI: s.con(""),
    CreatedAt: s.con(""),
    UpdatedAt: s.con(""),
    Action: s.con(""),
    id: s.con(""),
});
export const schema = s.obj({
    message: s.obj<{
        [key: string]: typeof msgSchema
    }, Record<string, NodeBuilder>>({}),
    context: s.obj({
        CreatedAt: s.con(utc().toISOString()),
        id: s.con(''),
        URI: s.con(''),
        UpdatedAt: s.con(utc().toISOString()),
        Permutation: s.con(undefined)
    })
})
export const crdt = (data?: Uint8Array) => (data
    ? Model.fromBinary(data)
    : Model.withLogicalClock())
    .setSchema(schema);