'use strict';

// Config
const { master } = require('../../config');

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
		isMaster: user &&
		(user.id === Number(master) ||
			user.username &&
			user.username.toLowerCase() ===
			String(master).replace('@', '').toLowerCase()),
		user,
	};

	return next();
};

module.exports = updateUserDataHandler;
