'use strict';

const { isMaster } = require('../../utils/config');

// DB
const { updateUser } = require('../../stores/user');

const updateUserDataHandler = async (ctx, next) => {
	if (ctx.message.forward_from) {
		updateUser(ctx.message.forward_from);
	}

	const user = await updateUser(ctx.from);

	Object.defineProperty(ctx, 'from', { value: { ...user, ...ctx.from } });

	ctx.state = {
		isAdmin: user && user.status === 'admin',
		isMaster: isMaster(ctx.from),
		user,
	};

	return next();
};

module.exports = updateUserDataHandler;
