const mongoose = require('mongoose')
// extract the Schema constructor into a variable (like the docs do)
const Schema = mongoose.Schema

const trailSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
		}
	},
	{
		timestamps: true
	}
)

module.exports = trailSchema
