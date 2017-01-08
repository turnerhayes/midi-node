'use strict';

var Message = require('./message');
var Track = require('./track');
var vlv = require('./vlv');

var constants = {
	START_OF_FILE: 0x4d546864 // MThd
};

var fileTypes = {
	TYPE_0: 0x0, // single track
	TYPE_1: 0x1 // multi track
};

/**
 * @constructor
 *
 * @description Represents a collection of MIDI messages in one or more tracks.
 *
 * @param {Object} header - the sequence header
 * @param {Number} header.noTracks - the number of tracks in this sequence
 */
function Sequence(header) {
	this.tracks = [];
	this.header = header;
}

/**
 * addTrack
 *
 * @description Adds a track to the sequence.
 *
 * @memberof Sequence
 *
 * @param {Track} track - the track to add
 */
Sequence.prototype.addTrack = function (track) {
	if (this.tracks.length >= this.header.noTracks) {
		console.warn('Tracks exceed specified number of tracks in header field.');
	}
	this.tracks.push(track);
};

/**
 * getTracks
 *
 * @description Returns the number of tracks in the sequence.
 *
 * @memberof Sequence
 *
 * @returns {Number} the number of tracks
 */
Sequence.prototype.getTracks = function () {
	return this.tracks;
};

/**
 * getFileType
 *
 * @description Returns the MIDI file type.
 *
 * @memberof Sequence
 *
 * @returns {Number} the file type
 */
Sequence.prototype.getFileType = function () {
	return this.header.fileType;
};

/**
 * getTicks
 *
 * @description Returns the number of ticks per quarter note in the sequence.
 *
 * @memberof Sequence
 *
 * @returns {Number} the number of ticks per quarter note
 */
Sequence.prototype.getTicks = function () {
	return this.header.ticks;
};

/**
 * fromBuffer
 *
 * @description Parses a sequence from a Buffer
 *
 * @memberof Sequence
 *
 * @param {Buffer} buffer - the buffer to parse
 *
 * @returns {Sequence}
 */
Sequence.fromBuffer = function (buffer) {
	var offset = 0;

	if (buffer.readUInt32BE(offset, false) !== constants.START_OF_FILE) {
		throw new Error("Expected start of file marker 'MThd'.");
	}
	offset += 4;

	if (buffer.readUInt32BE(offset) !== 0x6) {
		throw new Error('Invalid header size (expected 6 bytes).');
	}
	offset += 4;

	var fileType = buffer.readUInt16BE(offset);
	offset += 2;

	var noTracks = buffer.readUInt16BE(offset);
	offset += 2;

	if (fileType === fileTypes.TYPE_0 && noTracks !== 1) {
		throw new Error('Number of tracks mismatch file type (expected 1 track).');
	}

	var ticks = buffer.readUInt16BE(offset);
	offset += 2;

	var sequence = new Sequence({
		fileType: fileType,
		ticks: ticks,
		noTracks: noTracks
	});

	for (var i = 0; i < noTracks; i++) {
		var track = Track.fromBuffer(buffer.slice(offset));
		sequence.addTrack(track);
		offset += 8;

		var runningStatus = null;

		while (buffer.length > 0) {
			var delta = vlv.fromBuffer(buffer.slice(offset));
			// TODO fix this stuff
			if (delta > 0x3FFF) {
				offset += 3;
			} else if (delta > 0x7F) {
				offset += 2;
			} else {
				offset += 1;
			}

			var message = Message.fromBuffer(buffer.slice(offset), runningStatus);
			if (!message) {
				throw new Error("Unexpected end of buffer.");
			}
			track.addEvent(delta, message);
			offset += message.length;
			runningStatus = message.statusByte;

			if (message.isEndOfTrack()) {
				break;
			}
		}
	}

	return sequence;
};

Sequence.fromFile = function (filename, cb) {
	require('fs').readFile(filename, function (error, data) {
		if (error) {
			cb(error, null);
			return;
		}
		cb(null, Sequence.fromBuffer(data));
	});
};

module.exports = Sequence;
