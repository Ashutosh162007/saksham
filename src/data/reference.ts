import type { Institution, Officer } from '../types'

export const INSTITUTIONS: Institution[] = [
  { id: 'INS-01', code: 'VID-PUN', name: 'Vidyarthi Institute of Technology', city: 'Pune', region: 'Western' },
  { id: 'INS-02', code: 'NAR-BHO', name: 'Narmada College of Engineering', city: 'Bhopal', region: 'Central' },
  { id: 'INS-03', code: 'CST-KOC', name: 'Coastal Institute of Management', city: 'Kochi', region: 'Southern' },
  { id: 'INS-04', code: 'HIM-DDN', name: 'Himalaya Technical University', city: 'Dehradun', region: 'Northern' },
  { id: 'INS-05', code: 'GOD-NSK', name: 'Godavari School of Architecture', city: 'Nashik', region: 'Western' },
  { id: 'INS-06', code: 'SUN-KOL', name: 'Sundarban Institute of Pharmacy', city: 'Kolkata', region: 'Eastern' },
  { id: 'INS-07', code: 'DEC-HYD', name: 'Deccan College of Engineering', city: 'Hyderabad', region: 'South-Western' },
  { id: 'INS-08', code: 'MAL-KOZ', name: 'Malabar Polytechnic', city: 'Kozhikode', region: 'Southern' },
  { id: 'INS-09', code: 'CHB-KOT', name: 'Chambal Institute of Technology', city: 'Kota', region: 'North-Western' },
  { id: 'INS-10', code: 'KAV-MYS', name: 'Kaveri Institute of Science', city: 'Mysuru', region: 'South-Western' },
  { id: 'INS-11', code: 'SAB-AHM', name: 'Sabarmati School of Design', city: 'Ahmedabad', region: 'Western' },
  { id: 'INS-12', code: 'BRH-GHY', name: 'Brahmaputra Engineering College', city: 'Guwahati', region: 'Eastern' },
  { id: 'INS-13', code: 'TAP-SUR', name: 'Tapti Institute of Management', city: 'Surat', region: 'Western' },
  { id: 'INS-14', code: 'NIL-CBE', name: 'Nilgiri College of Engineering', city: 'Coimbatore', region: 'Southern' },
  { id: 'INS-15', code: 'YAM-PNP', name: 'Yamuna Institute of Technology', city: 'Panipat', region: 'Northern' },
  { id: 'INS-16', code: 'KRI-VJA', name: 'Krishna Valley Polytechnic', city: 'Vijayawada', region: 'South-Western' },
  { id: 'INS-17', code: 'CHL-BBI', name: 'Chilika Institute of Marine Technology', city: 'Bhubaneswar', region: 'Eastern' },
  { id: 'INS-18', code: 'ARA-JAI', name: 'Aravalli College of Engineering', city: 'Jaipur', region: 'North-Western' },
  { id: 'INS-19', code: 'HOG-HWH', name: 'Hooghly Institute of Applied Sciences', city: 'Howrah', region: 'Eastern' },
  { id: 'INS-20', code: 'TUN-BLR', name: 'Tungabhadra Technical Campus', city: 'Ballari', region: 'South-Western' },
]

export const OFFICERS: Officer[] = [
  { id: 'OFF-01', name: 'Meera Krishnan', role: 'Regional Officer', region: 'Western' },
  { id: 'OFF-02', name: 'Arvind Rao', role: 'Scrutiny Officer', region: 'Western' },
  { id: 'OFF-03', name: 'Farida Sheikh', role: 'EVC Coordinator', region: 'Western' },
  { id: 'OFF-04', name: 'Naveen Pillai', role: 'Compliance Officer', region: 'Southern' },
  { id: 'OFF-05', name: 'Kavita Menon', role: 'Deputy Director', region: 'Northern' },
  { id: 'OFF-06', name: 'Suresh Iyer', role: 'Deputy Director', region: 'South-Western' },
  { id: 'OFF-07', name: 'Ananya Bose', role: 'SAC Secretariat', region: 'Eastern' },
  { id: 'OFF-08', name: 'Rohan Deshpande', role: 'Scrutiny Officer', region: 'Central' },
  { id: 'OFF-09', name: 'Leela Narayanan', role: 'EVC Coordinator', region: 'Southern' },
  { id: 'OFF-10', name: 'Imran Qureshi', role: 'Compliance Officer', region: 'North-Western' },
]
