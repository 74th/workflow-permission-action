import * as core from '@actions/core';
import * as github from '@actions/github';
import { Octokit } from "@octokit/action";

function isUserPermittedByUserName(actor: string): boolean {
    const input = core.getInput("users");
    if (!input) {
        return false;
    }

    const users = input.split(",");
    return users.findIndex(user => user === actor) > -1;
}

const MAX_PAGE = 100;
const PER_PAGE = 100;

async function isUserPermittedByTeam(actor: string): Promise<boolean> {
    const input = core.getInput("teams");
    if (!input) {
        return false;
    }
    const teams = input.split(",");
    const octokit = new Octokit();
    for (const team in teams) {
        for (let page = 0; page < MAX_PAGE; page++) {
            const res = await octokit.teams.listMembersInOrg({
                org: github.context.repo.owner,
                team_slug: team,
                per_page: PER_PAGE,
                page: page,
            })
            if (res.data.findIndex((user) => { return user.login == actor; }) > -1) {
                return true;
            }
        }
    }
    return false;
}

async function main() {
    const actor = github.context.actor;
    if (isUserPermittedByUserName(actor)) {
        return;
    }
    if (isUserPermittedByTeam(actor)) {
        return
    }
    core.setFailed(`${actor} is not permitted this workflow`)
    return;
}

main();
