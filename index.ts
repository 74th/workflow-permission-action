import * as core from '@actions/core';
import * as github from '@actions/github';

core.setCommandEcho(true)
const users = core.getInput("users").split(",");
const actor = github.context.actor;
core.warning("@@1" + core.getInput("users"))
const available = users.find(user => user === actor);
core.warning("@@2" + available)
if (available == undefined) {
    core.setFailed(`${actor} is not permitted this workflow`)
}
