const mongoose = require('mongoose')
const Schema = mongoose.Schema
const trailSchema = require('./trail')

const parkSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		location: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},
		trails: [trailSchema],
		owner: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true
		},
	},
	{
		timestamps: true,
	}
)

module.exports = mongoose.model('Park', parkSchema)
