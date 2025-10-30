/**
 * Cloudflare Worker for Slack Moderation Command
 * Handles /report-behavior slash command and posts to private mod channel
 */

export default {
  async fetch(request, env) {
    // Only accept POST requests
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      // Parse the form data from Slack
      const formData = await request.formData();
      const userId = formData.get('user_id');
      const userName = formData.get('user_name');
      const text = formData.get('text');
      const channelId = formData.get('channel_id');
      const channelName = formData.get('channel_name');
      const timestamp = new Date().toISOString();

      // Validate that we have the required text
      if (!text || text.trim() === '') {
        return new Response(
          JSON.stringify({
            response_type: 'ephemeral',
            text: '⚠️ Please provide details about what you\'re reporting.\nUsage: `/report-behavior [description of concerning behavior]`'
          }),
          {
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      // Format the message for moderators
      const modMessage = {
        channel: env.MOD_CHANNEL_ID,
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: '🚨 New Moderation Report',
              emoji: true
            }
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*Reported by:*\n<@${userId}>`
              },
              {
                type: 'mrkdwn',
                text: `*Channel:*\n<#${channelId}>`
              },
              {
                type: 'mrkdwn',
                text: `*Timestamp:*\n${timestamp}`
              }
            ]
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Report Details:*\n${text}`
            }
          },
          {
            type: 'divider'
          }
        ]
      };

      // Post to the moderation channel
      const slackResponse = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.SLACK_BOT_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(modMessage)
      });

      const slackResult = await slackResponse.json();

      if (!slackResult.ok) {
        console.error('Slack API error:', slackResult);
        return new Response(
          JSON.stringify({
            response_type: 'ephemeral',
            text: '❌ Failed to send report. Please try again or contact an admin.'
          }),
          {
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      // Confirm to the user (ephemeral - only they see this)
      return new Response(
        JSON.stringify({
          response_type: 'ephemeral',
          text: '✅ Your report has been sent to the moderation team. Thank you for helping keep our community safe.'
        }),
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );

    } catch (error) {
      console.error('Error processing request:', error);
      return new Response(
        JSON.stringify({
          response_type: 'ephemeral',
          text: '❌ An error occurred while processing your report. Please try again.'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }
};
