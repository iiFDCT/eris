"use strict";

const Base = require("./Base");
const Message = require("./Message");
const Member = require("./Member");
const Constants = require("../Constants");

/**
* Represents an interaction
* @prop {String} applicationId The ID of the interaction's application
* @prop {String?} channelId The interaction token
* @prop {Object?} data The data attached to the interaction
* @prop {Number?} data.componentType The type of Message Component (Message Component only)
* @prop {String?} data.id The ID of the interaction data button ID (Message Component), or Command ID (Slash Command)
* @prop {String?} data.name The command name (Slash Command only)
* @prop {Array<Object>?} data.options The run Slash Command options (Slash Command only)
* @prop {String?} data.options.name The name of the Slash Command option (Slash Command only)
* @prop {String?} data.options.value The value of the run Slash Command (Slash Command only)
* @prop {String?} guildId The ID of the guild in which the interaction was created
* @prop {String} id The interaction ID
* @prop {Member?} member The member who triggered the interaction
* @prop {Message?} message The message the interaction came from (Message Component only)
* @prop {String} token The interaction token (Interaction tokens are valid for 15 minutes and can be used to send followup messages, but you must send an initial response within 3 seconds of receiving the event. If the 3 second deadline is exceeded, the token will be invalidated.)
* @prop {Number} type 1 is a Ping, 2 is a Slash Command, 3 is a Message Component
* @prop {Number} version The interaction version
*/
class Interaction extends Base {
    constructor(data, client) {
        super(data.id);
        this._client = client;
        this.applicationId = data.application_id;

        if(data.channel_id !== undefined) {
            this.channelId = data.channel_id;
        }
        if(data.data !== undefined) {
            this.data = data.data;
        }
        if(data.guild_id !== undefined) {
            this.guildId = data.guild_id;
        }
        if(data.member !== undefined) {
            this.member = new Member(data.member);
        }
        if(data.message !== undefined) {
            this.message = new Message(data.message, this._client);
        }
        if(data.token !== undefined) {
            this.token = data.token;
        }

        this.type = data.type;
        this.version = data.version;
    }

    /**
    * Acknowledges the interaction without replying (Message Component only)
    * @returns {Promise}
    */
    acknowledge() {
        return this._client.createInteractionResponse.call(this._client, this.id, this.token, {
            type: Constants.InteractionResponseType.DEFERRED_UPDATE_MESSAGE
        });
    }

    /**
    * Respond to the interaction
    * @arg {Object} options Webhook execution options
    * @arg {Object} [options.allowedMentions] A list of mentions to allow (overrides default)
    * @arg {Boolean} [options.allowedMentions.everyone] Whether or not to allow @everyone/@here.
    * @arg {Boolean | Array<String>} [options.allowedMentions.roles] Whether or not to allow all role mentions, or an array of specific role mentions to allow.
    * @arg {Boolean | Array<String>} [options.allowedMentions.users] Whether or not to allow all user mentions, or an array of specific user mentions to allow.
    * @arg {Boolean} [options.auth=false] Whether or not to authenticate with the bot token.
    * @arg {String} [options.avatarURL] A URL for a custom avatar, defaults to webhook default avatar if not specified
    * @arg {String} [options.content=""] A content string
    * @arg {Array<Object>} [options.embeds] An array of Discord embeds
    * @arg {Object | Array<Object>} [options.file] A file object (or an Array of them)
    * @arg {Buffer} options.file.file A buffer containing file data
    * @arg {String} options.file.name What to name the file
    * @arg {Boolean} [options.tts=false] Whether the message should be a TTS message or not
    * @arg {String} [options.username] A custom username, defaults to webhook default username if not specified
    * @arg {Boolean} [options.wait=false] Whether to wait for the server to confirm the message create or not
    * @returns {Promise<Message?>}
    */
    createFollowup(options) {
        return this._client.executeWebhook.call(this._client, this.applicationId, this.token, options);
    }

    /**
    * Respond to the interaction !use createFollowup if you have already responded with a different method
    * @arg {Object} options The options object
    * @arg {Object} [options.allowedMentions] A list of mentions to allow (overrides default)
    * @arg {Boolean} [options.allowedMentions.everyone] Whether or not to allow @everyone/@here.
    * @arg {Boolean | Array<String>} [options.allowedMentions.roles] Whether or not to allow all role mentions, or an array of specific role mentions to allow.
    * @arg {Boolean | Array<String>} [options.allowedMentions.users] Whether or not to allow all user mentions, or an array of specific user mentions to allow.
    * @arg {String} [options.content] A content string
    * @arg {Array<Object>} [options.embeds] An array of Discord embeds. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#embed-object) for object structure
    * @arg {Boolean} [options.flags] 64 for Ephemeral (Applies to Slash Commands and Message Components)
    * @arg {Boolean} [options.tts] Set the message TTS flag
    * @returns {Promise}
    */
    createMessage(options) {
        if(options !== undefined) {
            if(typeof options !== "object" || options === null) {
                options = {};
            }

            options.type = Constants.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE;
        }
        return this._client.createInteractionResponse.call(this._client, this.id, this.token, options);
    }

    /**
    * Defer response to the interaction
    * @arg {Boolean} [flags] 64 for Ephemeral
    * @returns {Promise}
    */
    defer(flags) {
        return this._client.createInteractionResponse.call(this._client, this.id, this.token, {
            type: Constants.InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
            flags: flags || 0
        });
    }

    /**
    * Defer message update (Message Component only)
    * @returns {Promise}
    */
    deferUpdate() {
        return this._client.createInteractionResponse.call(this._client, this.id, this.token, {
            type: Constants.InteractionResponseType.DEFERRED_UPDATE_MESSAGE
        });
    }

    /**
    * Delete a message
    * @arg {String} messageId The ID of the message to delete
    * @returns {Promise}
    */
    delete(messageId) {
        return this._client.deleteWebhookMessage.call(this._client, this.applicationId, this.token, messageId);
    }

    /**
    * Edit a message
    * @arg {String} messageId The ID of the message to edit, or "@original" for the original response, "@original" will will error with ephemeral messages
    * @arg {Object} options Webhook message edit options
    * @arg {Object} [options.allowedMentions] A list of mentions to allow (overrides default)
    * @arg {Boolean} [options.allowedMentions.everyone] Whether or not to allow @everyone/@here.
    * @arg {Boolean | Array<String>} [options.allowedMentions.roles] Whether or not to allow all role mentions, or an array of specific role mentions to allow.
    * @arg {Boolean | Array<String>} [options.allowedMentions.users] Whether or not to allow all user mentions, or an array of specific user mentions to allow.
    * @arg {Boolean} [options.allowedMentions.repliedUser] Whether or not to mention the author of the message being replied to.
    * @arg {String} [options.content=""] A content string
    * @arg {Array<Object>} [options.embeds] An array of Discord embeds
    * @arg {Object | Array<Object>} [options.file] A file object (or an Array of them)
    * @arg {Buffer} options.file.file A buffer containing file data
    * @arg {String} options.file.name What to name the file
    * @returns {Promise<Message>}
    */
    edit(messageId, options) {
        return this._client.editWebhookMessage.call(this._client, this.applicationId, this.token, messageId, options);
    }

    /**
    * Edit the interaction message !use edit if you have already responded with a different method (Message Component only)
    * @arg {Object} options The options object
    * @arg {Object} [options.allowedMentions] A list of mentions to allow (overrides default)
    * @arg {Boolean} [options.allowedMentions.everyone] Whether or not to allow @everyone/@here.
    * @arg {Boolean | Array<String>} [options.allowedMentions.roles] Whether or not to allow all role mentions, or an array of specific role mentions to allow.
    * @arg {Boolean | Array<String>} [options.allowedMentions.users] Whether or not to allow all user mentions, or an array of specific user mentions to allow.
    * @arg {String} [options.content] A content string
    * @arg {Array<Object>} [options.embeds] An array of Discord embeds. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#embed-object) for object structure
    * @arg {Boolean} [options.flags] 64 for Ephemeral (Applies to Slash Commands and Message Components)
    * @arg {Boolean} [options.tts] Set the message TTS flag
    * @returns {Promise}
    */
    editParent(options) {
        if(options !== undefined) {
            if(typeof options !== "object" || options === null) {
                options = {};
            }

            options.type = Constants.InteractionResponseType.UPDATE_MESSAGE;
        }
        return this._client.createInteractionResponse.call(this._client, this.id, this.token, options);
    }
}

module.exports = Interaction;
