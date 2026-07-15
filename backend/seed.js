import 'dotenv/config'
import { connectDB } from './lib/mongoose.js'
import User from './models/User.js'
import SiteSetting from './models/SiteSetting.js'

const seed = async () => {
  await connectDB()

  const adminExists = await User.findOne({ role: 'admin' })
  if (!adminExists) {
    await User.create({
      email: 'admin@haifarmer.com',
      password: 'Admin@123',
      fullName: 'HAiFarmer Admin',
      role: 'admin',
    })
    console.log('Admin user created: admin@haifarmer.com / Admin@123')
  } else {
    console.log('Admin user already exists')
  }

  const settingsExists = await SiteSetting.findOne()
  if (!settingsExists) {
    await SiteSetting.create({})
    console.log('Default settings created')
  } else {
    console.log('Settings already exist')
  }

  console.log('Seed complete')
  process.exit(0)
}

seed().catch(err => { console.error(err); process.exit(1) })
