# Slack Moderation Command - Cloudflare Worker Setup

This Cloudflare Worker handles a `/report-behavior` slash command that allows users to file moderation reports to a private channel.

## Prerequisites

- Cloudflare account (free tier works fine)
- Slack workspace with admin access
- Node.js installed (for Wrangler CLI)

## Deployment Steps

### 1. Install Wrangler CLI

```bash
npm install -g wrangler
```

### 2. Login to Cloudflare

```bash
wrangler login
```

### 2. Configure Environment Variables

You need to set two secrets in Cloudflare:

```bash
# Set your Slack Bot Token (from Step 2 of Slack setup)
wrangler secret put SLACK_BOT_TOKEN
# Enter your token: xoxb-your-token-here

# Set your moderation channel ID (from Step 3)
wrangler secret put MOD_CHANNEL_ID
# Enter your channel ID: C1234567890
```

### 3. Deploy the Worker


```bash
wrangler deploy
```

After deployment, you'll get a URL like:
`https://slack-mod-reporter.your-subdomain.workers.dev`

**Copy this URL** - you'll need it for the next step!

## Configure Slack Slash Command

1. Go back to your Slack app settings: https://api.slack.com/apps
2. Select your app
3. Go to **"Slash Commands"** in the sidebar
4. Click **"Create New Command"**
5. Fill in the details:
   - **Command:** `/report-behavior`
   - **Request URL:** Your Cloudflare Worker URL (from step 6)
   - **Short Description:** `Report concerning behavior to moderators`
   - **Usage Hint:** `[description of what you're reporting]`
6. Click **"Save"**

## Test It Out

1. Go to any channel in your Slack workspace
2. Type: `/report-behavior Testing the moderation system`
3. You should:
   - See an ephemeral confirmation message (only you can see it)
   - See a formatted report appear in your `#mod-reports` channel

## Usage

Users can report issues by typing:

```
/report-behavior User @john.doe is posting spam in #general
```

The report will include:
- Who filed the report
- What channel they were in when they filed it
- Timestamp
- The report details

## Troubleshooting

### "dispatch_failed" error
- Check that your bot is invited to the moderation channel
- Verify the channel ID is correct

### No response from command
- Check the Worker logs: `wrangler tail`
- Verify your bot token is correct
- Make sure the Request URL in Slack matches your Worker URL exactly

### "not_in_channel" error
- Use `/invite @YourBotName` in the moderation channel

## Cost

With Cloudflare's free tier:
- 100,000 requests per day
- More than enough for a moderation command

Slack API calls are free.

## Security Notes

- Never commit your bot token or channel ID to version control
- Use Wrangler secrets for sensitive values
- Regularly rotate your bot token if needed
- Limit who has access to the moderation channel

## Support

If you encounter issues, check:
1. Cloudflare Worker logs: `wrangler tail`
2. Slack API documentation: https://api.slack.com
3. Your bot's OAuth scopes are correct
