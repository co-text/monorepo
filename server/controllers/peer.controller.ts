import { Injectable } from "@cmmn/core";
import { controller, Get } from "@cmmn/server";
import { FastifyReply, FastifyRequest } from "fastify";
import { node } from "../p2p/index";

@Injectable()
@controller('/api/peer')
export class PeerController {

    constructor() {
    }

    @Get()
    async getPeerId(request: FastifyRequest, reply: FastifyReply) {
        return node.peerId.toString();
    }
}