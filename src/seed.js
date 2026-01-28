const mongoose = require('mongoose');
const connectDB = require('./config/database');
const User = require('./models/User');
const Bug = require('./models/Bug');
const Activity = require('./models/Activity');

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Bug.deleteMany({});
    await Activity.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@bugtracker.com',
      password: 'admin123',
      role: 'admin',
      status: 'Online'
    });
    console.log('Created admin user:', admin.email);

    // Create sample users
    const user1 = await User.create({
      name: 'John Developer',
      email: 'john@bugtracker.com',
      password: 'password123',
      role: 'user',
      status: 'Online'
    });

    const user2 = await User.create({
      name: 'Jane QA',
      email: 'jane@bugtracker.com',
      password: 'password123',
      role: 'user',
      status: 'Online'
    });
    console.log('Created sample users');

    // Create sample bugs
    const bug1 = await Bug.create({
      title: 'Login button not working on mobile',
      description: 'The login button becomes unresponsive on iOS devices when using Safari browser.',
      severity: 'high',
      priority: 'high',
      status: 'open',
      reporterId: user1._id
    });

    const bug2 = await Bug.create({
      title: 'Dashboard loading slowly',
      description: 'The main dashboard takes over 5 seconds to load when there are more than 100 bugs.',
      severity: 'medium',
      priority: 'medium',
      status: 'in-progress',
      reporterId: user2._id
    });

    const bug3 = await Bug.create({
      title: 'Typo in error message',
      description: 'There is a spelling error in the "Password incorrect" message.',
      severity: 'low',
      priority: 'low',
      status: 'resolved',
      reporterId: user1._id
    });
    console.log('Created sample bugs');

    // Create sample activities
    await Activity.create([
      {
        type: 'bug_created',
        userId: user1._id,
        bugId: bug1._id,
        message: `${user1.name} reported a new bug: "${bug1.title}"`
      },
      {
        type: 'bug_created',
        userId: user2._id,
        bugId: bug2._id,
        message: `${user2.name} reported a new bug: "${bug2.title}"`
      },
      {
        type: 'status_changed',
        userId: admin._id,
        bugId: bug2._id,
        metadata: { from: 'open', to: 'in-progress' },
        message: `${admin.name} changed status of "${bug2.title}" from Open to In Progress`
      },
      {
        type: 'bug_created',
        userId: user1._id,
        bugId: bug3._id,
        message: `${user1.name} reported a new bug: "${bug3.title}"`
      },
      {
        type: 'status_changed',
        userId: admin._id,
        bugId: bug3._id,
        metadata: { from: 'open', to: 'resolved' },
        message: `${admin.name} resolved "${bug3.title}"`
      }
    ]);
    console.log('Created sample activities');

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📧 Login credentials:');
    console.log('   Admin: admin@bugtracker.com / admin123');
    console.log('   User:  john@bugtracker.com / password123');
    console.log('   User:  jane@bugtracker.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
