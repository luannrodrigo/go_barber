module.exports = {
	up: queryInterface => {
		return queryInterface.renameColumn(
			'appointments',
			'cacelled_at',
			'cancelled_at'
		);
	},

	down: queryInterface => {
		return queryInterface.dropTable('appointments');
	},
};
