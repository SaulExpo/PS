'use strict';

/**
 * user-routine router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::user-routine.user-routine');
