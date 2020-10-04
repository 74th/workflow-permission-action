import * as core from '@actions/core';
import * as github from '@actions/github';
import { Octokit } from "@octokit/action";

async function isUserPermittedByUserName(actor: string): boolean {
    const users = core.getInput("users").split(",");
    const available = users.find(user => user === actor);
    return available !== undefined;
}

async function isUserPermittedByTeam(actor: string): boolean {
    const groupNames = core.getInput("groups").split(",");
    const octokit = new Octokit();
    await octokit.orgs.get({ org: github.context.repo.owner })
    for (const groupName in groupNames) {

        if (groupName.length == 0) continue;
    }
}

async function main() {
    const actor = github.context.actor;
    const permittedByUser = isUserPermittedByUserName(actor);
    if (permittedByUser) {
        return;
    }
    core.setFailed(`${actor} is not permitted this workflow`)
    return;
}
main();
