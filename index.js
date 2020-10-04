"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const fs_1 = require("fs");
// import { Octokit } from "@octokit/action";
function isUserPermittedByUserName(actor) {
    const input = core.getInput("users");
    if (!input) {
        return false;
    }
    const users = input.split(",");
    return users.findIndex(user => user === actor) > -1;
}
// listMembersInOrg is not accessible by integration
// async function isUserPermittedByTeam(actor: string): Promise<boolean> {
//     const input = core.getInput("teams");
//     if (!input) {
//         return false;
//     }
//     const teams = input.split(",");
//     const octokit = new Octokit();
//     for (const team of teams) {
//         try {
//             for await (const res of octokit.paginate.iterator(
//                 octokit.teams.listMembersInOrg,
//                 {
//                     org: github.context.repo.owner,
//                     team_slug: team,
//                 }
//             )) {
//                 if (res.data.findIndex((user) => { return user.login == actor; }) > -1) {
//                     return true;
//                 }
//             }
//         } catch (e) {
//             core.error(`error occurred when fetch team ${github.context.repo.owner}/${team}`);
//             core.error(e);
//             return false;
//         }
//     }
//     return false;
// }
async function isUserPermittedByListfile(actor) {
    const input = core.getInput("listfile");
    if (!input) {
        return false;
    }
    try {
        const file = await fs_1.promises.readFile(input);
        const members = file.toString().trim().split("\n");
        if (members.findIndex((member) => { return member == actor; }) > -1) {
            return true;
        }
    }
    catch (e) {
        core.error(`error occurred when load listfile`);
        core.error(e);
    }
    return false;
}
async function main() {
    const actor = github.context.actor;
    if (isUserPermittedByUserName(actor)) {
        core.info("permitted by users");
        return;
    }
    // const result = await isUserPermittedByTeam(actor);
    // if (result) {
    //     core.info("permitted by teams");
    //     return
    // }
    const permitted = await isUserPermittedByListfile(actor);
    if (permitted) {
        core.info("permitted by listfile");
        return;
    }
    core.setFailed(`${actor} is not permitted this workflow`);
}
main();
