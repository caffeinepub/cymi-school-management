// ─── Student Type ─────────────────────────────────────────────────────────────

export interface Student {
  id: number;
  admissionNo: string;
  firstName: string;
  lastName: string;
  grade: number;
  section: string;
  gender: string;
  dob: string;
  phone: string;
  email: string;
  parentName: string;
  parentPhone: string;
  address: string;
  feeStatus: string;
  attendancePct: number;
  joinDate: string;
}

// ─── Name Data ────────────────────────────────────────────────────────────────

const FIRST_NAMES_MALE = [
  "Aarav",
  "Arjun",
  "Amit",
  "Ankur",
  "Aditya",
  "Bharat",
  "Deepak",
  "Dev",
  "Dinesh",
  "Girish",
  "Harsh",
  "Hemant",
  "Ishaan",
  "Jayesh",
  "Karan",
  "Kunal",
  "Lakshman",
  "Mahesh",
  "Manish",
  "Nikhil",
  "Nilesh",
  "Om",
  "Piyush",
  "Prasad",
  "Rahul",
  "Raj",
  "Rajesh",
  "Rakesh",
  "Ram",
  "Ramesh",
  "Ravi",
  "Ritesh",
  "Rohit",
  "Sachin",
  "Sagar",
  "Sahil",
  "Sandeep",
  "Sanjay",
  "Shivam",
  "Suresh",
  "Tarun",
  "Tushar",
  "Uday",
  "Vijay",
  "Vikas",
  "Vinay",
  "Vishal",
  "Vivek",
  "Yash",
  "Yogesh",
];

const FIRST_NAMES_FEMALE = [
  "Aisha",
  "Ananya",
  "Anjali",
  "Ankita",
  "Anushka",
  "Bhavna",
  "Deepa",
  "Divya",
  "Geeta",
  "Hina",
  "Isha",
  "Jyoti",
  "Kajal",
  "Kavita",
  "Khushi",
  "Komal",
  "Laxmi",
  "Madhuri",
  "Manisha",
  "Meena",
  "Meera",
  "Minal",
  "Nisha",
  "Pallavi",
  "Pooja",
  "Pratibha",
  "Priya",
  "Priyanka",
  "Radha",
  "Rashmi",
  "Rekha",
  "Riya",
  "Rupali",
  "Sadhana",
  "Sangeeta",
  "Shalini",
  "Shilpa",
  "Shruti",
  "Sneha",
  "Sonal",
  "Sunita",
  "Swati",
  "Tanvi",
  "Usha",
  "Vandana",
  "Varsha",
  "Vidya",
  "Yashoda",
  "Zara",
  "Nidhi",
];

const LAST_NAMES = [
  "Sharma",
  "Verma",
  "Patel",
  "Singh",
  "Kumar",
  "Gupta",
  "Joshi",
  "Mehta",
  "Shah",
  "Yadav",
  "Mishra",
  "Tiwari",
  "Pandey",
  "Jain",
  "Agrawal",
  "Nair",
  "Reddy",
  "Rao",
  "Iyer",
  "Pillai",
  "Naidu",
  "Chaudhary",
  "Sinha",
  "Bose",
  "Das",
  "Ghosh",
  "Banerjee",
  "Mukherjee",
  "Chatterjee",
  "Chakraborty",
  "Malhotra",
  "Kapoor",
  "Khanna",
  "Arora",
  "Bhatia",
  "Mehra",
  "Chopra",
  "Sood",
  "Bajaj",
  "Bhatt",
];

const CITIES = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Surat",
  "Lucknow",
  "Nagpur",
  "Visakhapatnam",
  "Indore",
  "Thane",
  "Bhopal",
  "Patna",
  "Vadodara",
  "Ludhiana",
  "Agra",
];

const STREETS = [
  "MG Road",
  "Station Road",
  "Gandhi Nagar",
  "Patel Colony",
  "Nehru Street",
  "Civil Lines",
  "Shivaji Nagar",
  "Rajaji Road",
  "Tilak Marg",
  "Sadar Bazar",
];

// ─── Seed Data Generator ──────────────────────────────────────────────────────

export function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

export function generateStudents(): Student[] {
  const rng = seededRandom(42);
  const pick = <T>(arr: T[]) => arr[Math.floor(rng() * arr.length)];
  const between = (min: number, max: number) =>
    Math.floor(rng() * (max - min + 1)) + min;

  const students: Student[] = [];

  for (let i = 1; i <= 520; i++) {
    const isMale = rng() < 0.52;
    const firstName = isMale
      ? pick(FIRST_NAMES_MALE)
      : pick(FIRST_NAMES_FEMALE);
    const lastName = pick(LAST_NAMES);
    const grade = between(1, 12);
    const section = ["A", "B", "C", "D"][Math.floor(rng() * 4)];
    const genderVal = isMale ? "Male" : "Female";
    const year = between(2020, 2025);
    const month = between(1, 12);
    const day = between(1, 28);
    const joinDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dobYear = new Date().getFullYear() - 5 - grade - between(0, 2);
    const dobMonth = between(1, 12);
    const dobDay = between(1, 28);
    const dob = `${dobYear}-${String(dobMonth).padStart(2, "0")}-${String(dobDay).padStart(2, "0")}`;
    const admYear = year;
    const admissionNo = `ADM${admYear}${String(i).padStart(3, "0")}`;

    const feeRoll = rng();
    const feeStatus =
      feeRoll < 0.7 ? "Paid" : feeRoll < 0.9 ? "Pending" : "Overdue";

    const attendancePct = between(65, 100);
    const phone = `9${String(between(100000000, 999999999))}`;
    const parentPhone = `8${String(between(100000000, 999999999))}`;
    const parentFirstName = pick(FIRST_NAMES_MALE);
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@cymi.edu.in`;
    const city = pick(CITIES);
    const street = pick(STREETS);
    const houseNo = between(1, 500);
    const address = `${houseNo}, ${street}, ${city}`;

    students.push({
      id: i,
      admissionNo,
      firstName,
      lastName,
      grade,
      section,
      gender: genderVal,
      dob,
      phone,
      email,
      parentName: `${parentFirstName} ${lastName}`,
      parentPhone,
      address,
      feeStatus,
      attendancePct,
      joinDate,
    });
  }

  return students;
}

export const SEED_DATA: Student[] = generateStudents();
