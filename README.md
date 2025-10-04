# Subplayo

[![GitHub Release](https://img.shields.io/github/v/release/Tholdrim/YouTube-Subscriptions?style=flat-square)](https://github.com/Tholdrim/YouTube-Subscriptions/releases/latest)
[![GitHub License](https://img.shields.io/github/license/Tholdrim/YouTube-Subscriptions?style=flat-square)](LICENSE.txt)

This script monitors selected YouTube channels and automatically adds new videos to your playlists.
It is built with Google Apps Script and the YouTube Data API v3.

## Features

- Detects and adds the latest videos from your favorite channels to playlists.
- Avoids duplicates by keeping track of the last added videos.
- Supports optional automation with time-driven triggers.
- Runs entirely within Google, no external servers involved — your privacy is protected.
- Lists all your playlists and subscriptions to simplify the initial setup.
- Provides clear, detailed logs for every execution.
- Free and open source. :sunglasses:

## Setup

### Getting started

Let’s start with the basics — setting everything up so the script can do its job.

#### 1. Create a Google Apps Script project

- Open [Google Apps Script](https://script.google.com/) and create a new project.
- For each file in the [Source](Source) directory, create a matching file in the Apps Script editor (using the **+** button in the left panel) and copy its contents.

#### 2. Enable the YouTube Data API v3

- In the **Services** menu (on the left panel), add **YouTube Data API v3**.

#### 3. List all your playlists and subscriptions

> [!IMPORTANT]
> Make sure the `Main.gs` file is selected in the left panel when running these functions. Otherwise, they might not appear in the function dropdown menu.

- In the Apps Script editor, select the `listMyPlaylists` function and click **Run**.
- Authorize the script if it’s your first time running it.
- In the **Execution log** panel, you will see a list of all your playlists along with their IDs. Write them down.
- Repeat the steps with the `listMySubscriptions` function.

#### 4. Configure settings

- Open the `Settings.gs` file on the left and replace the placeholders (`PLAYLIST_1_ID`, `CHANNEL_1_1_ID`, etc.) with the identifiers noted in the previous step.
- At the end, the file should look similar to this:

  ```javascript
  const settings = {
    playlists: {
      "PLrEoTTPGndRYOD03tciWWVZ5hhpDsKVYW": [ // IT
        "UCpIn7ox7j7bH_OFj7tYouOQ",           // John Savill's Technical Training
      ],
      "PLrEoTTPGndRblAh27ns3MOHZldAilErI6": [ // Science
        "UCsXVk37bltHxD1rDPwtNM8Q",           // Kurzgesagt – In a Nutshell
        "UCHnyfMqiRRG1u-2MsSQLbXA",           // Veritasium
      ],
    }
  };
  ```

#### 5. Run manually for the first time

- In the Apps Script editor, select the `addNewVideosToPlaylists` function and click **Run**.
- If everything is set up correctly, you should see in the **Execution log** that all specified channels were detected as new and the last video from each was added to the corresponding playlist.
- If you run it again, no additional videos should be added (unless new ones have been published since).

### Fine-tuning

Once the basics are in place, you can take it a step further by adding automation.

#### Set up a time-driven trigger

> [!TIP]
> Running the script on an hourly schedule is recommended. This schedule should not exceed the daily YouTube Data API quota, while still keeping your playlists updated quickly.

- Go to **Triggers** (alarm clock icon on the left).
- Click **Add Trigger** in the bottom-right corner.
- Select the function: `addNewVideosToPlaylists`.
- Choose the trigger type: **Time-driven → Hour timer**.
- Select frequency: e.g., **Every hour**.
- Click **Save**.

#### Using Brand Accounts

YouTube Brand Accounts cannot be directly authenticated in Google Apps Script. To work around this limitation, you can share playlists between them and your main Google account:

- In your Brand Account, create the playlist you want to use.
- Open the playlist settings and share it with edit permissions to your main Google account.
- Copy the playlist ID and configure it in `Settings.gs` just like any other playlist.
- When the script runs, videos will be added via your main account, but into a playlist that belongs to the Brand Account.

## License

This is open-source software licensed under the MIT License. See the [LICENSE.txt](LICENSE.txt) file for more details.
