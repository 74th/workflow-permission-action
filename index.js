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
const action_1 = require("@octokit/action");
function isUserPermittedByUserName(actor) {
    const input = core.getInput("users");
    if (!input) {
        return false;
    }
    const users = input.split(",");
    return users.findIndex(user => user === actor) > -1;
}
const MAX_PAGE = 100;
const PER_PAGE = 100;
async function isUserPermittedByTeam(actor) {
    const input = core.getInput("teams");
    if (!input) {
        return false;
    }
    const teams = input.split(",");
    const octokit = new action_1.Octokit();
    for (const team in teams) {
        for (let page = 0; page < MAX_PAGE; page++) {
            const res = await octokit.teams.listMembersInOrg({
                org: github.context.repo.owner,
                team_slug: team,
                per_page: PER_PAGE,
                page: page,
            });
            if (res.data.length == 0) {
                break;
            }
            if (res.data.findIndex((user) => { return user.login == actor; }) > -1) {
                return true;
            }
        }
    }
    return false;
}
async function main() {
    try {
        const actor = github.context.actor;
        if (isUserPermittedByUserName(actor)) {
            return;
        }
        if (isUserPermittedByTeam(actor)) {
            return;
        }
        core.setFailed(`${actor} is not permitted this workflow`);
        return;
    }
    catch (e) {
        core.error(e);
        core.setFailed("uncaught error occurred");
    }
}
main();
