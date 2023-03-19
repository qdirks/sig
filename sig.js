#!/usr/bin/node
const fs = require("fs");
const url = require('url');
const terminal = require("./terminal");
const chokidar = require("chokidar");
const directory = "./"; // the directory to watch, the directory from which this tool was called
const baseClient = "client"; // the name (without extension) of file in the same directory as this script
const baseSignal = "signal"; // the name (without extension) of file in the same directory as this script
const SIGNAL_SRC = "SIGNAL_SRC"; // text to be replaced in the client script
const QUERY = "QUERY"; // text to be replaced in the client script
const ATTR = "ATTR"; // text to be replaced in the signal file
const NUMBER = "NUM"; // text to be replaced in the signal file
const so = process.stdout;
const filename = __filename.slice(0, -3).split("/").slice(-1)[0];
const ATTR_replacementText = filename.toUpperCase() + "_EVCNT"; // this is what ATTR will become in the signal file

/** @param {string[] | string} ignored */
function sig(ignored=[]) {
    // determine what the client name and signal name files will be
    let num = 0; while (fs.existsSync(baseClient + num + ".js")) num++;
    const clientName = filename + "." + baseClient + num + ".js";
    num = 0; while (fs.existsSync(baseSignal + num + ".js")) num++;
    const signalName = filename + "." + baseSignal + num + ".js";

    // create the chokidar watcher
    const watcher = chokidar.watch(directory, {ignored: [clientName, signalName, ".git", "node_modules"].concat(ignored)});
    let eventCount = 0;
    const changes = {add: 0, addDir: 0, all: 0, change: 0, error: 0, raw: 0, ready: 0, unlink: 0, unlinkDir: 0};
    watcher.on("all", strEvent=>{
        changes[strEvent]++;
        eventCount++;
        so.cursorTo(0);
        so.clearLine(0);

        let writeStr = `${c1}   events: `;
        Object.entries(changes).forEach(kv=>{
            writeStr += `${c2 + kv[0]}=${terminal.FgYellow + kv[1] + c2}, `;
        });
        writeStr = writeStr.slice(0, -2) + terminal.Reset + " ";
        so.write(writeStr);
        fs.writeFile(signalName, writeSignal(eventCount), ()=>{});
    });

    // create the client/signal scripts in the watched directory
    const clientCode = fs.readFileSync(__dirname + "/" + baseClient + ".js").toString();
    const signalCode = fs.readFileSync(__dirname + "/" + baseSignal + ".js").toString();
    const writeClient = clientCode
        .replace(SIGNAL_SRC, `"${signalName}"`)
        .replace(QUERY, `"${ATTR_replacementText}"`)
    ;
    function writeSignal(version=0) {
        return signalCode
            .replace(ATTR, ATTR_replacementText)
            .replace(NUMBER, version);
    }
    fs.writeFileSync(clientName, writeClient);
    fs.writeFileSync(signalName, writeSignal());

    // register the graceful exit handler
    process.on("SIGINT", gracefulExit);
    process.on("SIGTERM", gracefulExit);
    function gracefulExit() {
        so.write(" graceful exit\n");
        let u1, u2;
        fs.unlink(signalName, ()=>{
            u1 = true;
            if (u2) process.exit();
        });
        fs.unlink(clientName, ()=>{
            u2 = true;
            if (u1) process.exit();
        });
    }

    // tell the user to put the script in the html
    console.log(` ${terminal.FgGreen}Put this script tag in your html:`);
    console.log(`    ${terminal.FgCyan}<script src="${clientName}"></script>${terminal.Reset}`);

    // log the file url of the syncing directory
    const furl = new url.pathToFileURL(directory);
    const c1 = terminal.FgBlue;
    const c2 = terminal.Reset + terminal.FgRed;
    console.log(`${c1} watching: ${terminal.Reset + furl.href} ${terminal.Reset}`);
}
module.exports = sig;
if (require.main === module) sig(process.argv.slice(2));