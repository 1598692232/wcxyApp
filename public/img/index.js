const [...img] = [
	require('./list.js'),
	require('./project_list.js'),
	require('./info.js'),
	require('./call_back.js'),
	require('./signin.js')
]

module.exports = Object.assign({}, ...img)