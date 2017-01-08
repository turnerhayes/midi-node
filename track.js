

'use strict';

var Message = require('./message');

var constants = {
	START_OF_TRACK: 0x4d54726b
};

/**
 * @constructor
 *
 * @description A track in a sequence containing MIDI events.
 *
 * @param {Object} params - options for creating the Track
 * @param {Number} params.size - the length of the track, in bytes
 */
function Track(params) {
	this.size = params.size;
	this.events = [];
	this.complete = false;
}

/**
 * addEvent
 *
 * @description Adds a message with delta to the track. Will complete the track if
 * the message is a end of track message.
 *
 * @memberof Track
 *
 * @param {Number} delta - delta in ticks
 * @param {Message} message - message object

 * @throws Error if the track is already completed.
 */
Track.prototype.addEvent = function (delta, message) {
	if (this.complete) {
		throw new Error('Tried to add a event to a completed track.');
	}
	this.events.push({
		delta: delta,
		message: message
	});

	if (message.isEndOfTrack()) {
		this.complete = true;
	}
};

/**
 * length
 *
 * @description This is the length in bytes of the track according to the header.
 * Documentation shows that this is not very reliable. The actual track can be
 * longer or shorter.
 *
 * @memberof Track
 *
 * @returns {number}
 */
Track.prototype.length = function () {
	return this.size + 8;
};

/**
 * fromBuffer
 *
 * @description Parses a empty track from a buffer. The buffer must contain the header.
 *
 * @memberof Track
 * @static
 *
 * @param {Buffer} buffer - the buffer to parse
 * @returns {Track}
 */
Track.fromBuffer = function (buffer) {
	var offset = 0;

	if (buffer.readUInt32BE(offset) !== constants.START_OF_TRACK) {
		throw new Error("Track did not start with 'MTrk'.");
	}

	offset += 4;
	var size = buffer.readUInt32BE(offset);

	return new Track({size: size});
};

module.exports = Track;