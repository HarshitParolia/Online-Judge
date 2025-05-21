const { exec, execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const psTree = require('ps-tree');

const executeCode = async (filepath, dirCodes, inputFile, name, lang, tc) => {
    const fileID = '_' + name
    const dirCodepath = path.join(dirCodes, fileID)
    const outFilepath = path.join(dirCodes, fileID + '.out')
    const exeFilepath = path.join(dirCodes, fileID + '.exe')
    const divide = {
        "cpp": 3,
        "py": 5,
        "c": 3,
        "java": 2,
        "php": 2.5,
        "rb": 2.5
    }
    const inputwithnextline = inputFile.split('\n').join(' ').split(' ').join('\n')
    const MAX_TIMEOUT = process.env.MAX_TIMEOUT / divide[lang]
    const commands = {
        // "cpp": `g++ ${filepath} -o ${dirCodepath} && cd ${dirCodes} && .\\${fileID}`,
        "cpp": `g++ ${filepath} -o ${dirCodepath} && ${dirCodepath}`,
        "py": `python ${filepath}`,
        "c": `gcc ${filepath} -o ${dirCodepath} && ${dirCodepath}`,
        "java": `java ${filepath}`,
        "cs": `csc ${filepath} && cd ${dirCodes} && .\${fileID}.out`,
        "php": `php ${filepath}`,
        "rb": `ruby ${filepath}`,
        "rs": `rustc ${filepath}  && cd ${dirCodes} && .\${fileID}`
    }
    try {
        let childProcess;
        const compileCode = new Promise((resolve, reject) => {
            childProcess = exec(
                commands[lang],
                (error, stdout, stderr) => {
                    if (error) {
                        return reject({ error, stderr });
                    }
                    else if (stderr) {
                        return reject(stderr);
                    }
                    else {
                        resolve(stdout);
                    }
                })
            childProcess.stdin.write(inputwithnextline);
            childProcess.stdin.end();

        });
        async function killAllChildProcesses(pid) {
            return new Promise((resolve, reject) => {
                psTree(pid, (err, children) => {
                    if (err) {
                        console.error("Error finding child processes:", err);
                        return reject(err);
                    }
                    [pid, ...children.map((p) => p.PID)].forEach((tpid) => {
                        try {
                            process.kill(tpid);
                        } catch (e) {
                            // console.error(`Error killing process ${tpid}:`, e);
                        }
                    });
                    resolve('All killed successfully');
                });
            })
        };
        const timeout = new Promise((_, reject) => {
            setTimeout(async () => {
                if (childProcess) {
                    await killAllChildProcesses(childProcess.pid);
                }
                return reject({ stderr: `Time Limit Exceeded on Test case ${tc + 1}` });
            }, MAX_TIMEOUT);
        });

        return Promise.race([timeout, compileCode]).then((val) => {
            return val
        }).catch((err) => {
            setTimeout(() => {
                try {
                    if (fs.existsSync(exeFilepath)) {
                        fs.unlinkSync(exeFilepath);
                    }
                    if (fs.existsSync(outFilepath)) {
                        fs.unlinkSync(outFilepath)
                    }
                }
                catch (err) {
                    console.log("unable to delete exe/out file")
                }
            }, 1000);
            // Safely delete the files

            if (err?.error?.code == 'ERR_CHILD_PROCESS_STDIO_MAXBUFFER') {
                throw new Error(`Memory Limit Exceeded on Test case ${tc + 1}`)
            }
            throw new Error(err.stderr)
        })
    } catch (err) {
        console.log("Error in executing code")
    }

}

module.exports = { executeCode };
