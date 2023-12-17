import {Server} from "@cmmn/server";
import fastify from "fastify";
import websocketPlugin from "@fastify/websocket";
import cookiePlugin from "@fastify/cookie";
import {InhauthContainer} from "./inhauth/index";
import {ServerContainer} from "./container";
import * as controllers from "./controllers/index";
import cors from "@fastify/cors";
import "./p2p/index";


async function run() {
    const server = await Server
        // @ts-ignore
        .withFastify(getFastify)
        .with(InhauthContainer)
        .withControllers(...Object.values(controllers))
        .with(ServerContainer)
        .start(+(process.env.PORT || 4004));
    // const server = new http.Server();
}

function getFastify(opts){
    const instance = fastify({
        ...opts,
        logger: false
    });
    instance.register(cors,{
        origin: true,
        allowedHeaders: 'resource-token, Authorization',
        exposedHeaders: 'resource-token',
    });
    instance.register(websocketPlugin as any);
    instance.register(cookiePlugin);
    return instance;
}

run();


// server.on('upgrade', app.onUpgrade())