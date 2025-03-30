'use strict';

/**
 * user-routine service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::user-routine.user-routine');
