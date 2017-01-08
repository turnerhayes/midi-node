/**
 * Contains constants used throughout the system.
 *
 * @module Constants
 */

module.exports = {
	/**
	 * The status byte for the Channel Aftertouch message.
	 *
	 * @type Number
	 * @constant
	 */
	CHANNEL_AFTERTOUCH: 0xD0,
	
	/**
	 * The status byte for the Control Change message.
	 *
	 * @type Number
	 * @constant
	 */
	CONTROL_CHANGE: 0xB0,
	
	/**
	 * The byte representing the "End of track" meta event.
	 *
	 * @type Number
	 * @constant
	 */
	END_OF_TRACK: 0x2F,
	
	/**
	 * The length in bytes of a file header chunk.
	 *
	 * @type Number
	 * @constant
	 */
	FILE_HEADER_LENGTH: 14,
	
	/**
	 * The byte representing a meta event type.
	 *
	 * @type Number
	 * @constant
	 */
	META_EVENT: 0xFF,
	
	/**
	 * The status byte representing the "Note Off" channel event.
	 *
	 * @type Number
	 * @constant
	 */
	NOTE_OFF: 0x80,
	
	/**
	 * The status byte representing the "Note On" channel event.
	 *
	 * @type Number
	 * @constant
	 */
	NOTE_ON: 0x90,
	
	/**
	 * The status byte representing the "Pitch Bend" channel event.
	 *
	 * @type Number
	 * @constant
	 */
	PITCH_BEND_CHANGE: 0xE0,
	
	/**
	 * The status byte representing the "Polyphonic Aftertouch" channel event.
	 *
	 * @type Number
	 * @constant
	 */
	POLYPHONIC_AFTERTOUCH: 0xA0,
	
	/**
	 * The status byte representing the "Program Change" channel event.
	 *
	 * @type Number
	 * @constant
	 */
	PROGRAM_CHANGE: 0xC0,
	
	/**
	 * The length in bytes of a track header chunk.
	 *
	 * @type Number
	 * @constant
	 */
	TRACK_HEADER_LENGTH: 8,
	
	/**
	 * The bytes corresponding to the 'MThd' string denoting a header chunk.
	 *
	 * @type Number
	 * @constant
	 */
	START_OF_FILE: 0x4d546864, // MThd
	
	/**
	 * The bytes corresponding to the 'MTrk' string denoting a track chunk.
	 *
	 * @type Number
	 * @constant
	 */
	START_OF_TRACK: 0x4d54726b, // MTrk

	/**
	 * Single track file type.
	 *
	 * @type Number
	 * @constant
	 */
	TYPE_0: 0x0, // single track
	
	/**
	 * Multi track file type.
	 *
	 * @type Number
	 * @constant
	 */
	TYPE_1: 0x1 // multi track
};