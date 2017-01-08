'use strict';

var constants = require('./constants');

var commands = {
	0x80: {
		name: 'NOTE_OFF',
		length: 2
	},
	0x90: {
		name: 'NOTE_ON',
		length: 2
	},
	0xA0: {
		name: 'POLYPHONIC_AFTERTOUCH',
		length: 2
	},
	0xB0: {
		name: 'CONTROL_CHANGE',
		length: 2
	},
	0xC0: {
		name: 'PROGRAM_CHANGE',
		length: 1
	},
	0xD0: {
		name: 'CHANNEL_AFTERTOUCH',
		length: 1
	},
	0xE0: {
		name: 'PITCH_BEND_CHANGE',
		length: 2
	},
	0xFF: {
		name: 'META_MESSAGE',
		length: null // variable
	}
};

/**
 * @constructor
 *
 * @description A MIDI message object.
 *
 * @params {Number} status - the status byte for this message
 * @params {Array<Number>} data - the data in the message as an array of bytes
 * @params {Number} length - the length of the message, in bytes
 */
function Message(status, data, length) {
	this.statusByte = status;
	this.data = data;
	this.length = length;
}

/**
 * getStatus
 *
 * @description Returns the status byte for this event. If this event is a channel event,
 * the channel is set to 0.
 *
 * @memberof Message
 *
 * @returns {Number} the status byte
 */
Message.prototype.getStatus = function () {
	return this.statusByte === constants.META_EVENT ? this.statusByte : this.statusByte & 0xF0;
};

/**
 * getCommand
 *
 * @description Returns the name of the command corresponding with this message's status.
 *
 * @memberof Message
 *
 * @returns {String} the name of the command
 */
Message.prototype.getCommand = function () {
	return commands[this.getStatus()].name;
};

/**
 * getChannel
 *
 * @description Returns the channel number, zero-based.
 *
 * @memberof Message
 *
 * @returns {Number|null} the channel number, or {@linkcode null} if this is not a channel message
 */
Message.prototype.getChannel = function () {
	if (!this.isChannelMessage()) {
		return null;
	}
	return this.statusByte & 0x0F;
};

/**
 * getData
 *
 * @description Returns the data in this message.
 *
 * @memberof Message
 *
 * @returns {Array<Number>} the data, as an array of bytes
 */
Message.prototype.getData = function () {
	return this.data;
};

/**
 * isChannelMessage
 *
 * @description Determines whether this message is a channel message.
 *
 * @memberof Message
 *
 * @returns {Boolean} {@linkcode true} if this is a channel message, {@linkcode false} otherwise
 */
Message.prototype.isChannelMessage = function () {
	return this.statusByte < 0xF0;
};

/**
 * isSystemMessage
 *
 * @description Determines whether this message is a system message.
 *
 * @memberof Message
 *
 * @returns {Boolean} {@linkcode true} if this is a system message, {@linkcode false} otherwise
 */
Message.prototype.isSystemMessage = function () {
	return this.statusByte >= 0xF0;
};

/**
 * isEndOfTrack
 *
 * @description Determines whether this message is an end of track message.
 *
 * @memberof Message
 *
 * @returns {Boolean} {@linkcode true} if this is an end of track message, {@linkcode false} otherwise
 */
Message.prototype.isEndOfTrack = function () {
	return this.statusByte === constants.META_EVENT && this.data[0] === constants.END_OF_TRACK;
};

/**
 * toString
 *
 * @description Returns a string representation of this message.
 *
 * @memberof Message
 *
 * @returns {String} a string representation of this message
 */
Message.prototype.toString = function () {
	if (this.statusByte === constants.META_EVENT) {
		return 'Meta Event: 0x' + this.data[0].toString(16);
	}

	if (commands[this.getStatus()]) {
		var channel = this.getChannel();
		return 'Channel ' + channel + ': ' + commands[this.getStatus()].name + ' ' + this.data;
	}

	return this.statusByte.toString(16);
};

/**
 * Parses a MIDI Message out of a buffer and returns it. Returns null
 * if there are too few bytes for the type of message.
 *
 * @static
 *
 * @param {Buffer} buffer - the buffer to parse
 * @param {Number} [runningStatus] - the running status byte
 *
 * @returns {Message}
 */
Message.fromBuffer = function (buffer, runningStatus) {
	if (buffer.length === 0) {
		return null;
	}

	var status = buffer.readUInt8(0);
	var length = 0;
	var dataOffset = 0;

	if (!(status & 0x80)) {
		if (runningStatus) {
			status = runningStatus;
		} else {
			throw new Error('Message does not start with status byte and no running status known.');
		}
	} else {
		length += 1;
		dataOffset += 1;
	}

	if (status === constants.META_EVENT) {
		if (buffer.length < 3) {
			return null;
		}
		length += buffer.readUInt8(2) + 2;
	} else {
		if (commands[status & 0xF0]) {
			length += commands[status & 0xF0].length;
		}
	}

	if (buffer.length < length) {
		return null;
	}

	var data = [];
	for (; dataOffset < length; dataOffset++) {
		data.push(buffer[dataOffset]);
	}

	return new Message(status, data, length);
};

module.exports = Message;