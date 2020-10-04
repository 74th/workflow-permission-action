import * as core from '@actions/core';
import * as github from '@actions/github';

const users = core.getInput("users").split(",");
const actor = github.context.actor;
const available = users.find(user => user === actor);
if (available == undefined) {
    core.setFailed(`${actor} is not permitted this workflow`)
}
