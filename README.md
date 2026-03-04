<div align="center">
    <img src="Assets/Logo.png" alt="Subplayo logo" />
    <br />
    <a href="https://github.com/Tholdrim/Subplayo/releases/latest"><img src="https://img.shields.io/github/v/release/Tholdrim/Subplayo?style=flat-square&label=Release" alt="Latest release" /></a>
    <a href="https://github.com/Tholdrim/Subplayo/stargazers"><img src="https://img.shields.io/github/stars/Tholdrim/Subplayo?style=flat-square&label=Stars" alt="GitHub stars count" /></a>
    <a href="LICENSE.txt"><img src="https://img.shields.io/github/license/Tholdrim/Subplayo?style=flat-square&label=License" alt="MIT license" /></a>
</div>

# Subplayo

**Automatically build and maintain YouTube playlists from your favorite channels – fully under your control.**

- Tired of missing important uploads?
- Frustrated with YouTube’s chaotic subscription feed?

Subplayo monitors selected channels and automatically adds new videos to playlists you define. No external servers, no third-party services – everything runs inside your own Google account via Apps Script.

## 🚀 Getting started

Follow the steps below to configure Subplayo inside your Google account.

### 1. Create a Google Apps Script project

1. Open [Google Apps Script](https://script.google.com/) and create a new project.
2. In the Apps Script editor, create files matching those in the [Source](/Source) directory of this repository.
3. Copy the contents of each file into its corresponding file in Apps Script.

### 2. Enable the YouTube Data API v3

1. Click the **+** icon next to the **Services** section.
2. In the dialog that appears, select **YouTube Data API v3**.
3. Click **Add**.

### 3. Retrieve your playlist and channel IDs

To configure Subplayo, you need the IDs of the playlists you want to update and the IDs of the channels you want to monitor. You can retrieve both directly from the Apps Script editor.

#### List your playlists

1. Open the `Main.gs` file.
2. Select the `listMyPlaylists` function from the function dropdown.
3. Click **Run**.
4. Authorize the script if prompted.
5. In the **Execution log**, locate the playlists you want to use and note their IDs.

#### List your subscriptions

1. Select the `listMySubscriptions` function.
2. Click **Run**.
3. In the **Execution log**, locate the channels you want to monitor and note their IDs.

### 4. Configure your playlists and channels

1. Open `Settings.gs`.
2. Replace placeholder values (`PLAYLIST_1_ID`, `CHANNEL_1_1_ID`, etc.) with your actual IDs.

Your configuration should look similar to this:

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

### 5. Run the script manually

1. Select the `addNewVideosToPlaylists` function.
2. Click **Run**.

If everything is configured correctly:

- The latest video from each configured channel will be added to the corresponding playlist.
- Running the function again will not duplicate videos.
- Only newly published videos will be added in future runs.

## ⚙️ Advanced setup

Once the basics are in place, you can refine your setup further with additional options.

#### Set up a time-driven trigger

> [!TIP]
> Running the script on an hourly schedule is recommended. This schedule should not exceed the daily YouTube Data API quota, while still keeping your playlists updated quickly.

- Go to **Triggers** (alarm clock icon on the left).
- Click **Add Trigger** in the bottom-right corner.
- Select the function: `addNewVideosToPlaylists`.
- Choose the trigger type: **Time-driven → Hour timer**.
- Select frequency: e.g., **Every hour**.
- Click **Save**.

## ⚖️ License

This is open-source software licensed under the MIT License. See the [LICENSE.txt](LICENSE.txt) file for more details.
