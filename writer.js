'use strict';

var constants = require('./constants');
var vlv = require('./vlv');

function isInteger(value) {
	return typeof value === "number" &&
		isFinite(value) &&
		Math.floor(value) === value;
}

function validateChannel(channel) {
	if (!isInteger(channel) || channel > 15 || channel < 0) {
		throw new Error('Invalid channel (0-15).');
	}
}

/**
 * @constructor
 *
 * @description A MIDI writer object that writes MIDI events to the stream.
 *
 * @param {Stream} stream - a writable stream
 */
function Writer(stream) {
	this.stream = stream;
	this.lastEvent = null;
}

/**
 * startFile
 *
 * @description Writes file header information to the stream.
 *
 * @memberof module:Writer
 *
 * @param {Number} fileType - the MIDI file type to use
 * @param {Number} noTracks - the number of tracks the file will contain
 * @param {Number} ticks - the number of ticks per quarter note
 * @param {Function} [cb] - a callback executed when the file header data has been written
 *
 * @returns the return value of the stream's {@linkcode write} method
 */
Writer.prototype.startFile = function (fileType, noTracks, ticks, cb) {
	if (noTracks < 1) {
		throw new Error('Must at least have one track.');
	}

	if (ticks < 0) {
		throw new Error('Must at least specify one tick.');
	}

	var buffer = Buffer.alloc(constants.FILE_HEADER_LENGTH);
	buffer.writeInt32BE(constants.START_OF_FILE, 0);
	buffer.writeInt32BE(0x6, 4);
	buffer.writeInt16BE(fileType, 8);
	buffer.writeInt16BE(noTracks, 10);
	buffer.writeInt16BE(ticks, 12);

	return this.stream.write(buffer, cb);
};

/**
 * startTrack
 *
 * @description Writes track header data to the stream.
 *
 * @memberof module:Writer
 *
 * @param {Number} size - the size of the track
 * @param {Function} [cb] - a callback executed when track data has been written
 *
 * @returns the return value of the stream's {@linkcode write} method
 */
Writer.prototype.startTrack = function (size, cb) {
	var buffer = Buffer.alloc(constants.TRACK_HEADER_LENGTH);
	buffer.writeInt32BE(constants.START_OF_TRACK, 0);
	if (!size) {
		size = 0;
	}
	buffer.writeInt32BE(size, 4);

	return this.stream.write(buffer, cb);
};

/**
 * event
 *
 * @description Writes an event to the stream.
 *
 * @memberof module:Writer
 *
 * @param {Number} delta - the delta value for the event
 * @param {Number} statusByte - the event status byte (0x80 <= statusByte <= 0xFF)
 * @param {Array<Number>} dataBytes - an array of data for the event
 * @param {Function} [cb] - a callback executed when the event has been written
 *
 * @returns the return value of the stream's {@linkcode write} method
 */
Writer.prototype.event = function (delta, statusByte, dataBytes, cb) {
	if (!isInteger(delta) || delta < 0) {
		throw new Error('Invalid delta.');
	}

	if (statusByte < 0x80 || statusByte > 0xFF) {
		throw new Error('Invalid status byte.');
	}

	var eventBuffer;

	if (this.lastEvent === statusByte) {
		eventBuffer = Buffer.concat([
			vlv.toBuffer(delta),
			Buffer.from(dataBytes)
		]);
	} else {
		eventBuffer = Buffer.concat([
			vlv.toBuffer(delta),
			Buffer.from([statusByte]),
			Buffer.from(dataBytes)
		]);
		this.lastEvent = statusByte;
	}

	return this.stream.write(eventBuffer, cb);
};

/**
 * programChange
 *
 * @description Writes a "program change" event to the stream.
 *
 * @memberof module:Writer
 *
 * @param {Number} delta - the delta value for the event
 * @param {Number} channel - the channel for the event
 * @param {Number} programNumber - the program number
 * @param {Function} [cb] - a callback executed when the event has been written
 *
 * @returns the return value of the stream's {@linkcode write} method
 */
Writer.prototype.programChange = function (delta, channel, programNumber, cb) {
	validateChannel(channel);

	return this.event(delta, constants.PROGRAM_CHANGE | channel, [programNumber & 0xFF00, programNumber & 0xFF], cb);
};

/**
 * noteOff
 *
 * @description Writes a "note off" event to the stream.
 *
 * @memberof module:Writer
 *
 * @param {Number} delta - the delta value for the event
 * @param {Number} channel - the channel for the event
 * @param {Number} note - the note number
 * @param {Number} velocity - the velocity of the note
 * @param {Function} [cb] - a callback executed when the event has been written
 *
 * @returns the return value of the stream's {@linkcode write} method
 */
Writer.prototype.noteOff = function (delta, channel, note, velocity, cb) {
	validateChannel(channel);

	return this.event(delta, constants.NOTE_OFF | channel, [note, velocity], cb);
};

/**
 * noteOn
 *
 * @description Writes a "note on" event to the stream.
 *
 * @memberof module:Writer
 *
 * @param {Number} delta - the delta value for the event
 * @param {Number} channel - the channel for the event
 * @param {Number} note - the note number
 * @param {Number} velocity - the velocity of the note
 * @param {Function} [cb] - a callback executed when the event has been written
 *
 * @returns the return value of the stream's {@linkcode write} method
 */
Writer.prototype.noteOn = function (delta, channel, note, velocity, cb) {
	validateChannel(channel);

	return this.event(delta, constants.NOTE_ON | channel, [note, velocity], cb);
};

/**
 * endOfTrack
 *
 * @description Writes an "end of track" meta event to the stream.
 *
 * @memberof module:Writer
 *
 * @param {Number} delta - the delta value for the event
 * @param {Function} [cb] - a callback executed when the event has been written
 *
 * @returns the return value of the stream's {@linkcode write} method
 */
Writer.prototype.endOfTrack = function (delta, cb) {
	return this.event(delta, constants.META_EVENT, [constants.END_OF_TRACK, 0x00], cb);
};

module.exports = Writer;
