'use strict';

/**
 * user-app service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::user-app.user-app');
