# fas-app-scraper
Module pulls data from Apple and Google Play stores, and save results to file.

# Install dependencies
```
cd fas-app-scraper/ && npm install
```

# Run
"fas-app-scraper" pulls app data from both google and apple stores. Stores result inside data/ folder by default

```
node index.js
```

# Config params
Config file is located inside ./fas-app-scraper/config.json

| Config Item         |                        Description                        | Default Value |
| ------------------- | :-------------------------------------------------------: | ------------: |
| DEBUG               | If 1, first 100 items of the result are printed on screen |             0 |
| PRETIFY_JSON        |           if true, JSON is indented by 2 spaces           |          true |
| OUTPUT_FOLDER_PATH  |           Default relative folder name to save            |       "data/" |
| DEFAULT_OUTPUT_FILE |              Default Json file name to save               | "result.json" |
| THROTTLE            |     Upper bound to the requests attempted per second      |             8 |