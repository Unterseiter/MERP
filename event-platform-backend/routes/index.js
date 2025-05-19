const authRoutes = require('./auth');
const eventRoutes = require('./events');
const userRoutes = require('./user');
const requestRoutes = require('./requestEvent');
const chatRoutes = require('./chat');
const subscriberRouter = require('./subscriber');
const { requestLogger, errorLogger } = require('../middleware/loggerMiddleware');

class RouterController {
    constructor(app) {
        this.app = app;
        this.init();
    }
    init() {
        this.app.use(requestLogger);
        this.app.use('/api/auth', authRoutes);
        this.app.use('/api/events', eventRoutes);
        this.app.use('/api/user', userRoutes);
        this.app.use('/api/requests', requestRoutes);
        this.app.use('/api/chat', chatRoutes);
        this.app.use('/api/subscriber', subscriberRouter);

        this.descructor();
    }
    descructor(){
        this.app.use(errorLogger);
    }
}

module.exports = RouterController;