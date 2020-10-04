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


async function isUserPermittedByTeam(actor: string): Promise<boolean> {
    const input = core.getInput("teams");
    if (!input) {
        return false;
    }
    const teams = input.split(",");
    const octokit = new Octokit();
    for (const team of teams) {
        try {
            for await (const res of octokit.paginate.iterator(
                octokit.teams.listMembersInOrg,
                {
                    org: github.context.repo.owner,
                    team_slug: team,
                }
            )) {
                if (res.data.findIndex((user) => { return user.login == actor; }) > -1) {
                    return true;
                }
            }
        } catch (e) {
            core.error(`error occurred when fetch team ${github.context.repo.owner}/${team}`);
            core.error(e);
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
            return
        }
        core.setFailed(`${actor} is not permitted this workflow`)
        return;
    } catch (e) {
        core.error(e);
        core.setFailed("uncaught error occurred");
    }
}

main();
