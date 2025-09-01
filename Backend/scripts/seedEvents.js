require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('../models/Events');

const events = [
  {
    title: "Community Clean-up Drive",
    description: "Join us for a community clean-up drive in the local park. We'll be collecting and sorting waste, and learning about proper waste management practices.",
    date: new Date('2024-05-15T09:00:00'),
    location: "Central Park, Colombo",
    maxParticipants: 50,
    status: "upcoming"
  },
  {
    title: "Recycling Workshop",
    description: "Learn how to properly recycle different types of materials and make eco-friendly crafts from recycled items.",
    date: new Date('2024-05-20T14:00:00'),
    location: "Green Hub, Kandy",
    maxParticipants: 30,
    status: "upcoming"
  },
  {
    title: "Environmental Awareness Program",
    description: "Educational program about environmental conservation and sustainable living practices.",
    date: new Date('2024-06-01T10:00:00'),
    location: "Community Center, Galle",
    maxParticipants: 100,
    status: "upcoming"
  }
];

const seedEvents = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing events
    await Event.deleteMany({});
    console.log('Cleared existing events');

    // Insert new events
    await Event.insertMany(events);
    console.log('Successfully seeded events');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding events:', error);
    process.exit(1);
  }
};

seedEvents(); 