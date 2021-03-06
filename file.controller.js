const fs = require('fs');
const distDir = __dirname + "/device_checks/";

const getTimeString = ms => {
    return new Date(ms).toTimeString();
};

const getClient = req => {
    return {
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        port: req.connection.remotePort
    };
};

const getListFiles = (req, res) => {
    const client = getClient(req);
    console.log(`[${getTimeString(Date.now())}] request from ${client.ip}: ${client.port}`);

    fs.readdir(distDir, (err, files) => {
        if (err) {
            console.log(`[${getTimeString(Date.now())}] error:`);
            console.log(err);
            res.status(500).send({
                message: "Unable to scan files."
            });
        }

        let fileInfos = [];
        files.forEach(file => {
            fileInfos.push({
                name: file,
                // url: distDir + file
            });
        });

        res.status(200).send(fileInfos);
    });
};

const download = (req, res) => {
    const client = getClient(req);
    console.log(`[${getTimeString(Date.now())}] request from ${client.ip}: ${client.port}`);

    const fileName = req.params.name;
    console.log(`[${getTimeString(Date.now())}] download from: ${distDir + fileName}`);

    res.download(distDir + fileName, fileName, (err) => {
        if (err) {
            console.log(`[${getTimeString(Date.now())}] status code: ${err.statusCode}`);
            if (err.statusCode === 404) {
                res.status(404).send({
                    message: "File not found."
                });
            }
            if (err.statusCode === 500) {
                res.status(500).send({
                    message: "Could not download the file."
                });
            }
        } else {
            console.log(`[${getTimeString(Date.now())}] Successfully download file!`);
        }
    });
};

module.exports = {
    getListFiles,
    download
};
