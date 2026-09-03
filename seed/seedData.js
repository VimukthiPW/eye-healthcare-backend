const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Report = require('../models/Report');
const Appointment = require('../models/Appointment');
const ChatMessage = require('../models/ChatMessage');

const seedData = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eyecare_db';
    console.log('Connecting to MongoDB for database seeding...');
    await mongoose.connect(connStr);
    console.log('Connected to MongoDB.');

    // Clear existing collections
    await User.deleteMany({});
    await Report.deleteMany({});
    await Appointment.deleteMany({});
    await ChatMessage.deleteMany({});
    console.log('Cleared existing data.');

    // Password hashing for default accounts
    const salt = await bcrypt.genSalt(10);
    const doctorPassword = await bcrypt.hash('doctor123', salt);
    const patientPassword = await bcrypt.hash('patient123', salt);

    // Create Doctors
    const doctors = await User.create([
      {
        name: 'Dr. Sarah Jenkins',
        email: 'sarah.jenkins@eyecare.com',
        password: doctorPassword,
        role: 'Doctor',
        specialization: 'Corneal Specialist & Cataract Surgeon',
        hospital: 'City Vision Hospital, NY',
        experienceYears: 12,
        rating: 4.9,
        reviewCount: 142,
        consultationFee: '$90',
        avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80',
        about: 'Dr. Sarah Jenkins is a double board-certified corneal & anterior segment specialist with 12+ years of experience in laser cataract surgery.',
        availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        availableTimeSlots: ['09:00 AM', '11:00 AM', '02:30 PM', '04:00 PM'],
      },
      {
        name: 'Dr. Michael Chen',
        email: 'michael.chen@eyecare.com',
        password: doctorPassword,
        role: 'Doctor',
        specialization: 'Glaucoma & Retinal Specialist',
        hospital: 'St. Jude Eye Institute',
        experienceYears: 15,
        rating: 4.8,
        reviewCount: 98,
        consultationFee: '$110',
        avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
        about: 'Dr. Michael Chen specializes in complex glaucoma management, OCT imaging, and diabetic retinopathy laser therapies.',
        availableDays: ['Mon', 'Wed', 'Fri'],
        availableTimeSlots: ['10:00 AM', '01:00 PM', '03:30 PM'],
      },
      {
        name: 'Dr. Emily Vance',
        email: 'emily.vance@eyecare.com',
        password: doctorPassword,
        role: 'Doctor',
        specialization: 'Pediatric Ophthalmologist',
        hospital: 'Metro Children Eye Clinic',
        experienceYears: 9,
        rating: 4.95,
        reviewCount: 215,
        consultationFee: '$85',
        avatar: 'https://images.unsplash.com/photo-1594824813566-7895f87b8f97?auto=format&fit=crop&w=400&q=80',
        about: 'Specialized in pediatric vision therapy, strabismus treatment, and comprehensive eye exams for children.',
        availableDays: ['Tue', 'Thu', 'Sat'],
        availableTimeSlots: ['09:30 AM', '11:30 AM', '02:00 PM'],
      },
    ]);

    // Create Patient
    const patient = await User.create({
      name: 'John Doe',
      email: 'john.doe@gmail.com',
      password: patientPassword,
      role: 'Patient',
      age: 45,
      gender: 'Male',
      phone: '+1 (555) 234-5678',
      address: '123 Health Ave, San Francisco, CA',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    });

    console.log(`Created ${doctors.length} doctors and 1 patient user.`);

    // Create Reports for Patient
    const reports = await Report.create([
      {
        patient: patient._id,
        title: 'Cataract Eye Scan Analysis',
        scanImageUrl: 'https://images.unsplash.com/photo-1544465544-1b71aee9dfa3?auto=format&fit=crop&w=400&q=80',
        predictedCondition: 'Cataract',
        severity: 'Moderate',
        confidenceScore: 96.4,
        findings: [
          'Mild nuclear opacification detected in right eye lens',
          'Slight decrease in light transmission ratio',
        ],
        recommendations: [
          'Consult Dr. Sarah Jenkins for a dilated slit-lamp examination',
          'Wear anti-glare glasses when driving at night',
        ],
        sentToDoctor: doctors[0]._id,
        status: 'Sent to Doctor',
      },
      {
        patient: patient._id,
        title: 'Routine Eye Scan Checkup',
        scanImageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=400&q=80',
        predictedCondition: 'Normal',
        severity: 'Normal',
        confidenceScore: 98.9,
        findings: [
          'Optic disc and retinal macula appear healthy and clear',
          'Intraocular vascular structure is normal',
        ],
        recommendations: [
          'Maintain annual routine eye checkups',
          'Use artificial tears if working on computers for prolonged hours',
        ],
        status: 'Generated',
      },
    ]);

    console.log(`Created ${reports.length} sample reports.`);

    // Create Appointments
    const appointments = await Appointment.create([
      {
        patient: patient._id,
        doctor: doctors[0]._id,
        date: '2026-08-25',
        timeSlot: '10:30 AM',
        status: 'Confirmed',
        appointmentType: 'In-Person',
        symptoms: 'Mild blurriness in right eye when reading',
        notes: 'Patient sent scan report for initial review.',
      },
      {
        patient: patient._id,
        doctor: doctors[1]._id,
        date: '2026-09-02',
        timeSlot: '02:00 PM',
        status: 'Pending',
        appointmentType: 'Online Consultation',
        symptoms: 'Glaucoma screening & pressure check consultation',
      },
    ]);

    console.log(`Created ${appointments.length} sample appointments.`);

    console.log('\n========================================');
    console.log(' DATABASE SEEDED SUCCESSFULLY!');
    console.log(' Test Credentials:');
    console.log(' Patient Email: john.doe@gmail.com | Password: patient123');
    console.log(' Doctor Email:  sarah.jenkins@eyecare.com | Password: doctor123');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

seedData();
