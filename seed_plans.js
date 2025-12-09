const mongoose = require('mongoose');
const Plan = require('./src/models/Plan');

const uri = 'mongodb://localhost:27017/captcha-platform';

const seedPlans = async () => {
    try {
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to DB');

        // Check if plans exist
        const count = await Plan.countDocuments({ name: { $ne: 'Demo' } });
        if (count === 0) {
            console.log('No paid plans found. Seeding...');
            const plans = [
                {
                    name: 'Silver Plan',
                    price: 100,
                    captchaLimit: 50,
                    validityDays: 30,
                    earningsPerCaptcha: 1,
                    description: 'Great for beginners',
                    isActive: true
                },
                {
                    name: 'Gold Plan',
                    price: 500,
                    captchaLimit: 200,
                    validityDays: 30,
                    earningsPerCaptcha: 2,
                    description: 'Maximize your earnings',
                    isActive: true
                }
            ];
            await Plan.insertMany(plans);
            console.log('Plans seeded.');
        } else {
            console.log('Paid plans already exist.');
            // Ensure they are active
            await Plan.updateMany({ name: { $ne: 'Demo' } }, { isActive: true });
            console.log('Ensured all paid plans are active.');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedPlans();
