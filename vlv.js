/**
 * Contains methods for reading and writing variable length values.
 *
 * @module VariableLengthValue
 */

'use strict';

/**
 * fromBuffer
 *
 * @description Reads a variable length value from the buffer.
 *
 * @param {Buffer} buffer - the buffer to read from
 *
 * @returns {Number} the value read from the buffer
 */
exports.fromBuffer = function (buffer) {
	var offset = 0;
	var value = 0;
	var byte;

	do {
		if (offset >= buffer.length) {
			throw new Error('Buffer not long enough for vlv.');
		}
		byte = buffer.readUInt8(offset);
		value |= byte & 0x7F;

		if (byte & 0x80) {
			value = value << 7;
			offset++;
		}
	} while (byte & 0x80);

	return value;
};

/**
 * toBuffer
 *
 * @description Writes a variable length value into a new buffer.
 *
 * @param {Number} value - the value to write to the buffer
 *
 * @returns {Buffer} a Buffer containing the value as a variable length value
 */
exports.toBuffer = function (value) {
	if (!value) {
		return Buffer.from([0]);
	}

	var result = [];

	while (value !== 0) {
		result.push(value & 0x7f | 0x80);
		value = value >>> 7;
	}

	result[0] = result[0] & 0x7F;
	result = result.reverse();

	return Buffer.from(result);
};