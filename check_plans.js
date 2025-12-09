const mongoose = require('mongoose');
const Plan = require('./src/models/Plan');

const uri = 'mongodb://localhost:27017/captcha-platform';

const checkPlans = async () => {
    try {
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to DB');

        const plans = await Plan.find({});
        console.log('All Plans in DB:');
        plans.forEach(p => {
            console.log(`- Name: ${p.name}, Price: ${p.price}, Active: ${p.isActive}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkPlans();
