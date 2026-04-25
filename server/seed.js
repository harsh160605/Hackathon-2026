/**
 * Seed script — populates database with demo data
 * Run: node seed.js
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const NGO = require('./models/NGO');
const Task = require('./models/Task');
const Notification = require('./models/Notification');

const SKILLS = ['medical', 'teaching', 'logistics', 'cooking', 'counseling', 'driving', 'construction', 'tech', 'translation', 'first-aid'];
const CITIES = [
  { city: 'Pune', lat: 18.5204, lng: 73.8567 },
  { city: 'Mumbai', lat: 19.0760, lng: 72.8777 },
  { city: 'Delhi', lat: 28.7041, lng: 77.1025 },
  { city: 'Bangalore', lat: 12.9716, lng: 77.5946 },
  { city: 'Chennai', lat: 13.0827, lng: 80.2707 },
  { city: 'Nagpur', lat: 21.1458, lng: 79.0882 }
];

function randomFrom(arr, count = 1) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return count === 1 ? shuffled[0] : shuffled.slice(0, count);
}

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      NGO.deleteMany({}),
      Task.deleteMany({}),
      Notification.deleteMany({})
    ]);
    console.log('🗑️  Cleared existing data');

    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@volunteer.com',
      password: hashedPassword,
      role: 'admin',
      location: CITIES[0]
    });
    console.log('👤 Admin created');

    // Create NGO users
    const ngoUsers = [];
    const ngoData = [
      { name: 'Health First Foundation', category: 'healthcare', description: 'Providing healthcare access to rural communities' },
      { name: 'EduReach India', category: 'education', description: 'Bridging the education gap in underserved areas' },
      { name: 'Disaster Ready', category: 'disaster-relief', description: 'Emergency response and disaster preparedness' }
    ];

    for (let i = 0; i < ngoData.length; i++) {
      const user = await User.create({
        name: `${ngoData[i].name} Admin`,
        email: `ngo${i + 1}@volunteer.com`,
        password: hashedPassword,
        role: 'ngo',
        location: CITIES[i]
      });
      ngoUsers.push(user);
    }
    console.log(`🏢 ${ngoUsers.length} NGO users created`);

    // Create NGOs
    const ngos = [];
    for (let i = 0; i < ngoData.length; i++) {
      const ngo = await NGO.create({
        name: ngoData[i].name,
        description: ngoData[i].description,
        category: ngoData[i].category,
        location: CITIES[i],
        adminUser: ngoUsers[i]._id,
        members: []
      });
      await User.findByIdAndUpdate(ngoUsers[i]._id, { ngoId: ngo._id });
      ngos.push(ngo);
    }
    console.log(`🏢 ${ngos.length} NGOs created`);

    // Create volunteers
    const volunteers = [];
    const volunteerNames = [
      'Aarav Sharma', 'Priya Patel', 'Rohan Gupta', 'Sneha Iyer', 'Vikram Singh',
      'Ananya Desai', 'Karan Mehta', 'Divya Reddy', 'Arjun Nair', 'Pooja Joshi',
      'Rahul Verma', 'Meera Kapoor', 'Aditya Rao', 'Kavita Mishra', 'Saurabh Tiwari'
    ];

    for (let i = 0; i < volunteerNames.length; i++) {
      const loc = randomFrom(CITIES);
      const skills = randomFrom(SKILLS, Math.floor(Math.random() * 3) + 2);
      const availability = randomFrom(['full-time', 'part-time', 'weekends']);
      const ngo = randomFrom(ngos);

      const volunteer = await User.create({
        name: volunteerNames[i],
        email: `volunteer${i + 1}@volunteer.com`,
        password: hashedPassword,
        role: 'volunteer',
        skills,
        location: loc,
        availability,
        rating: Math.round((3 + Math.random() * 2) * 10) / 10,
        totalRatings: Math.floor(Math.random() * 20) + 1,
        ngoId: ngo._id
      });

      // Add to NGO members
      await NGO.findByIdAndUpdate(ngo._id, { $push: { members: volunteer._id } });
      volunteers.push(volunteer);
    }
    console.log(`🧑‍🤝‍🧑 ${volunteers.length} volunteers created`);

    // Create tasks
    const taskTemplates = [
      { title: 'Medical Camp Setup', skills: ['medical', 'logistics'], urgency: 'high' },
      { title: 'Food Distribution Drive', skills: ['cooking', 'logistics', 'driving'], urgency: 'critical' },
      { title: 'Teaching Workshop', skills: ['teaching'], urgency: 'medium' },
      { title: 'Flood Relief Coordination', skills: ['logistics', 'driving', 'first-aid'], urgency: 'critical' },
      { title: 'Community Health Checkup', skills: ['medical', 'counseling'], urgency: 'medium' },
      { title: 'School Infrastructure Repair', skills: ['construction', 'logistics'], urgency: 'low' },
      { title: 'Translation Services for Migrants', skills: ['translation'], urgency: 'high' },
      { title: 'Tech Training for Youth', skills: ['tech', 'teaching'], urgency: 'medium' },
      { title: 'Emergency First Aid Camp', skills: ['first-aid', 'medical'], urgency: 'critical' },
      { title: 'Community Counseling Session', skills: ['counseling'], urgency: 'low' },
      { title: 'Disaster Preparedness Workshop', skills: ['first-aid', 'teaching', 'logistics'], urgency: 'high' },
      { title: 'Blood Donation Drive', skills: ['medical', 'logistics'], urgency: 'high' }
    ];

    const tasks = [];
    for (let i = 0; i < taskTemplates.length; i++) {
      const t = taskTemplates[i];
      const ngo = ngos[i % ngos.length];
      const loc = randomFrom(CITIES);
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + Math.floor(Math.random() * 14) + 1);

      const task = await Task.create({
        title: t.title,
        description: `This is a ${t.urgency} priority task requiring ${t.skills.join(', ')} skills. Help us make a difference in the ${loc.city} community.`,
        requiredSkills: t.skills,
        location: loc,
        urgency: t.urgency,
        status: i < 3 ? 'assigned' : 'open',
        ngoId: ngo._id,
        createdBy: ngo.adminUser,
        assignedVolunteer: i < 3 ? volunteers[i]._id : null,
        deadline
      });
      tasks.push(task);
    }
    console.log(`📋 ${tasks.length} tasks created`);

    // Print login credentials
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔑 LOGIN CREDENTIALS (all passwords: password123)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin:      admin@volunteer.com');
    console.log('NGO 1:      ngo1@volunteer.com');
    console.log('NGO 2:      ngo2@volunteer.com');
    console.log('NGO 3:      ngo3@volunteer.com');
    console.log('Volunteer:  volunteer1@volunteer.com (through volunteer15@...)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('✅ Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seed();
