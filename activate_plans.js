const mongoose = require('mongoose');
const Plan = require('./src/models/Plan');

const uri = 'mongodb://localhost:27017/captcha-platform';

const activatePlans = async () => {
    try {
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to DB');

        const result = await Plan.updateMany({}, { isActive: true });
        console.log('Plans updated:', result);

        const plans = await Plan.find({});
        console.log('Current Plans:', plans);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

activatePlans();
