const fs = require('fs');

class FileHelper {
    constructor(config) {
        this.config = config

        this.DEBUG = config.DEBUG || 0; // if 1, first 100 results are printed on console
        this.PRETIFY_JSON = config.PRETIFY_JSON || true;
        this.OUTPUT_FOLDER_PATH = config.OUTPUT_FOLDER_PATH || 'data/';
        this.DEFAULT_OUTPUT_FILE = config.DEFAULT_OUTPUT_FILE || 'result.json';
    }

    log_json_to_file(data, file_path, pretify_json = true) {
        const indentation = pretify_json ? 2 : 0;
        fs.writeFile(file_path, JSON.stringify(data, null, indentation), (err) => {
            if (err) {
                console.error(err);
                return;
            };
            console.log(`File saved at '${file_path}' with [${data.length-1}] items`);
        });
    }

    save_to_file(result, file_name) {
        const file_path = this.OUTPUT_FOLDER_PATH + (file_name || this.DEFAULT_OUTPUT_FILE)
        this.log_json_to_file(result, file_path);
    }

    save_to_file_async(result, file_name) {
        if (result && result instanceof Promise) {
            result.then(data => {
                this.save_to_file(data, file_name)
            }).catch(console.log);
        } else {
            this.save_to_file(result, file_name)
        }
    }

}

module.exports = {
    FileHelper: FileHelper
}