require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const seedAdmin = async () => {
    console.log("🚀 Starting admin seed script...");
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            console.error("❌ MONGO_URI is missing in .env file");
            process.exit(1);
        }

        console.log("🔌 Connecting to MongoDB...");
        await mongoose.connect(uri);
        console.log('✅ Connected to MongoDB');

        const email = 'test@example.com';
        const password = 'Test@123';

        console.log(`🔍 Checking if user ${email} exists...`);
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            console.log('⚠️ User already exists with this email.');
            // Update to admin just in case
            if (existingUser.role !== 'admin') {
                console.log('🔄 Updating role to admin...');
                existingUser.role = 'admin';
                await existingUser.save();
                console.log('✅ Role updated to admin');
            }
            process.exit(0);
        }

        console.log('✨ Creating new admin user...');
        const admin = new User({
            name: 'Admin User',
            email: email,
            password: password,
            role: 'admin',
            isVerified: true,
            isBlocked: false
        });

        await admin.save();
        console.log('✅ Admin user created successfully');
        console.log(`📧 Email: ${email}`);
        console.log(`🔑 Password: ${password}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding admin:', error);
        console.log(error);
        process.exit(1);
    }
};

seedAdmin();
