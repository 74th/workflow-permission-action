import * as core from '@actions/core';
import * as github from '@actions/github';
import { promises as fs } from 'fs';
// import { Octokit } from "@octokit/action";

function isUserPermittedByUserName(actor: string): boolean {
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

async function isUserPermittedByListfile(actor: string) {
    const input = core.getInput("listfile");
    if (!input) {
        return false;
    }

    try {
        const file = await fs.readFile(input);
        const members = file.toString().trim().split("\n");
        if (members.findIndex((member) => { return member == actor; }) > -1) {
            return true;
        }
    } catch (e) {
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

    core.setFailed(`${actor} is not permitted this workflow`)
}

main();
