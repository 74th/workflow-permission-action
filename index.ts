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
            return false;
        }
    }
    return false;
}

async function main() {
    const actor = github.context.actor;
    if (isUserPermittedByUserName(actor)) {
        core.info("permitted by users");
        return;
    }
    core.info("not permitted by users");
    const result = await isUserPermittedByTeam(actor);
    if (result) {
        core.info("permitted by teams");
        return
    }
    core.info("not permitted by teams");
    core.setFailed(`${actor} is not permitted this workflow`)
}

main();
