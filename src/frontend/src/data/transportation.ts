// ─── Transportation Types ──────────────────────────────────────────────────────

export interface Stop {
  name: string;
  time: string;
  order: number;
}

export interface Route {
  id: number;
  routeNumber: string;
  routeName: string;
  startPoint: string;
  endPoint: string;
  stops: Stop[];
  distanceKm: number;
  totalStudents: number;
  status: "Active" | "Inactive";
}

export interface Vehicle {
  id: number;
  busNumber: string;
  model: string;
  capacity: number;
  fuelType: "Diesel" | "CNG" | "Electric";
  regNumber: string;
  driverId: number | null;
  status: "Active" | "Maintenance" | "Inactive";
  lastService: string;
}

export interface Driver {
  id: number;
  name: string;
  licenseNumber: string;
  phone: string;
  email: string;
  experience: number;
  assignedVehicleId: number | null;
  joiningDate: string;
  status: "Active" | "Inactive";
}

export interface StudentAssignment {
  id: number;
  studentId: number;
  studentName: string;
  grade: number;
  section: string;
  routeId: number;
  routeName: string;
  vehicleId: number;
  busNumber: string;
  pickupPoint: string;
  pickupTime: string;
  dropTime: string;
}

// ─── Routes Data ──────────────────────────────────────────────────────────────

export const ROUTES: Route[] = [
  {
    id: 1,
    routeNumber: "ROUTE-01",
    routeName: "North City Express",
    startPoint: "CYMI School",
    endPoint: "Rajajinagar",
    stops: [
      { name: "CYMI School", time: "07:00", order: 1 },
      { name: "Vidhana Soudha", time: "07:12", order: 2 },
      { name: "Sadashivanagar", time: "07:22", order: 3 },
      { name: "Rajajinagar Circle", time: "07:35", order: 4 },
      { name: "Rajajinagar", time: "07:48", order: 5 },
    ],
    distanceKm: 14.5,
    totalStudents: 38,
    status: "Active",
  },
  {
    id: 2,
    routeNumber: "ROUTE-02",
    routeName: "South Corridor",
    startPoint: "CYMI School",
    endPoint: "JP Nagar",
    stops: [
      { name: "CYMI School", time: "07:00", order: 1 },
      { name: "Lalbagh Gate", time: "07:10", order: 2 },
      { name: "Jayanagar 4th Block", time: "07:22", order: 3 },
      { name: "JP Nagar 1st Phase", time: "07:35", order: 4 },
      { name: "JP Nagar 7th Phase", time: "07:50", order: 5 },
    ],
    distanceKm: 16.8,
    totalStudents: 42,
    status: "Active",
  },
  {
    id: 3,
    routeNumber: "ROUTE-03",
    routeName: "East Gate Line",
    startPoint: "CYMI School",
    endPoint: "Whitefield",
    stops: [
      { name: "CYMI School", time: "07:00", order: 1 },
      { name: "Indiranagar 100ft Rd", time: "07:15", order: 2 },
      { name: "Domlur", time: "07:28", order: 3 },
      { name: "Marathahalli Bridge", time: "07:42", order: 4 },
      { name: "Whitefield Main Road", time: "08:00", order: 5 },
    ],
    distanceKm: 22.3,
    totalStudents: 35,
    status: "Active",
  },
  {
    id: 4,
    routeNumber: "ROUTE-04",
    routeName: "West Valley Route",
    startPoint: "CYMI School",
    endPoint: "Tumkur Road",
    stops: [
      { name: "CYMI School", time: "07:00", order: 1 },
      { name: "Yeshwantpur Circle", time: "07:14", order: 2 },
      { name: "Peenya Industrial", time: "07:26", order: 3 },
      { name: "Jalahalli Cross", time: "07:38", order: 4 },
      { name: "Tumkur Road", time: "07:52", order: 5 },
    ],
    distanceKm: 18.7,
    totalStudents: 29,
    status: "Active",
  },
  {
    id: 5,
    routeNumber: "ROUTE-05",
    routeName: "Central Hub",
    startPoint: "CYMI School",
    endPoint: "Basavanagudi",
    stops: [
      { name: "CYMI School", time: "07:00", order: 1 },
      { name: "KR Market", time: "07:08", order: 2 },
      { name: "Gandhi Bazaar", time: "07:18", order: 3 },
      { name: "Basavanagudi Circle", time: "07:28", order: 4 },
    ],
    distanceKm: 9.2,
    totalStudents: 48,
    status: "Active",
  },
  {
    id: 6,
    routeNumber: "ROUTE-06",
    routeName: "Electronic City Shuttle",
    startPoint: "CYMI School",
    endPoint: "Electronic City",
    stops: [
      { name: "CYMI School", time: "07:00", order: 1 },
      { name: "Silk Board Junction", time: "07:18", order: 2 },
      { name: "Electronic City Phase 1", time: "07:38", order: 3 },
      { name: "Electronic City Phase 2", time: "07:52", order: 4 },
    ],
    distanceKm: 28.4,
    totalStudents: 31,
    status: "Active",
  },
  {
    id: 7,
    routeNumber: "ROUTE-07",
    routeName: "Hebbal Connector",
    startPoint: "CYMI School",
    endPoint: "Hebbal",
    stops: [
      { name: "CYMI School", time: "07:00", order: 1 },
      { name: "Mekhri Circle", time: "07:10", order: 2 },
      { name: "Hebbal Flyover", time: "07:22", order: 3 },
      { name: "Hebbal Main", time: "07:30", order: 4 },
    ],
    distanceKm: 11.6,
    totalStudents: 26,
    status: "Active",
  },
  {
    id: 8,
    routeNumber: "ROUTE-08",
    routeName: "Koramangala Loop",
    startPoint: "CYMI School",
    endPoint: "Koramangala",
    stops: [
      { name: "CYMI School", time: "07:00", order: 1 },
      { name: "Richmond Circle", time: "07:10", order: 2 },
      { name: "Koramangala 4th Block", time: "07:22", order: 3 },
      { name: "Koramangala 8th Block", time: "07:32", order: 4 },
    ],
    distanceKm: 10.8,
    totalStudents: 33,
    status: "Active",
  },
  {
    id: 9,
    routeNumber: "ROUTE-09",
    routeName: "Bannerghatta Express",
    startPoint: "CYMI School",
    endPoint: "Bannerghatta Road",
    stops: [
      { name: "CYMI School", time: "07:00", order: 1 },
      { name: "BTM Layout", time: "07:15", order: 2 },
      { name: "Hulimavu", time: "07:28", order: 3 },
      { name: "Bannerghatta Road End", time: "07:42", order: 4 },
    ],
    distanceKm: 17.2,
    totalStudents: 22,
    status: "Inactive",
  },
  {
    id: 10,
    routeNumber: "ROUTE-10",
    routeName: "Airport Link",
    startPoint: "CYMI School",
    endPoint: "Devanahalli",
    stops: [
      { name: "CYMI School", time: "06:45", order: 1 },
      { name: "Bellary Road", time: "07:05", order: 2 },
      { name: "Yelahanka", time: "07:25", order: 3 },
      { name: "Devanahalli Town", time: "07:48", order: 4 },
      { name: "Airport Zone", time: "08:05", order: 5 },
    ],
    distanceKm: 35.0,
    totalStudents: 18,
    status: "Active",
  },
];

// ─── Drivers Data ─────────────────────────────────────────────────────────────

export const DRIVERS: Driver[] = [
  {
    id: 1,
    name: "Ramesh Kumar",
    licenseNumber: "KA01-20180045",
    phone: "9845012345",
    email: "ramesh.kumar@cymi.edu",
    experience: 12,
    assignedVehicleId: 1,
    joiningDate: "2018-06-15",
    status: "Active",
  },
  {
    id: 2,
    name: "Suresh Babu",
    licenseNumber: "KA02-20160078",
    phone: "9845023456",
    email: "suresh.babu@cymi.edu",
    experience: 15,
    assignedVehicleId: 2,
    joiningDate: "2016-03-20",
    status: "Active",
  },
  {
    id: 3,
    name: "Mahesh Patil",
    licenseNumber: "KA03-20200023",
    phone: "9845034567",
    email: "mahesh.patil@cymi.edu",
    experience: 8,
    assignedVehicleId: 3,
    joiningDate: "2020-08-01",
    status: "Active",
  },
  {
    id: 4,
    name: "Ganesh Raju",
    licenseNumber: "KA04-20150056",
    phone: "9845045678",
    email: "ganesh.raju@cymi.edu",
    experience: 18,
    assignedVehicleId: 4,
    joiningDate: "2015-11-10",
    status: "Active",
  },
  {
    id: 5,
    name: "Venkatesh Reddy",
    licenseNumber: "KA05-20190034",
    phone: "9845056789",
    email: "venkatesh.reddy@cymi.edu",
    experience: 10,
    assignedVehicleId: 5,
    joiningDate: "2019-01-25",
    status: "Active",
  },
  {
    id: 6,
    name: "Prakash Hegde",
    licenseNumber: "KA06-20170089",
    phone: "9845067890",
    email: "prakash.hegde@cymi.edu",
    experience: 14,
    assignedVehicleId: 6,
    joiningDate: "2017-07-14",
    status: "Active",
  },
  {
    id: 7,
    name: "Narayan Das",
    licenseNumber: "KA07-20210012",
    phone: "9845078901",
    email: "narayan.das@cymi.edu",
    experience: 6,
    assignedVehicleId: 7,
    joiningDate: "2021-02-28",
    status: "Active",
  },
  {
    id: 8,
    name: "Krishna Murthy",
    licenseNumber: "KA08-20140067",
    phone: "9845089012",
    email: "krishna.murthy@cymi.edu",
    experience: 20,
    assignedVehicleId: 8,
    joiningDate: "2014-09-05",
    status: "Active",
  },
  {
    id: 9,
    name: "Srinivas Rao",
    licenseNumber: "KA09-20220009",
    phone: "9845090123",
    email: "srinivas.rao@cymi.edu",
    experience: 5,
    assignedVehicleId: 9,
    joiningDate: "2022-04-18",
    status: "Active",
  },
  {
    id: 10,
    name: "Basavaraj K",
    licenseNumber: "KA10-20160043",
    phone: "9845001234",
    email: "basavaraj.k@cymi.edu",
    experience: 16,
    assignedVehicleId: 10,
    joiningDate: "2016-12-01",
    status: "Active",
  },
  {
    id: 11,
    name: "Manjunath Gowda",
    licenseNumber: "KA11-20180091",
    phone: "9845012378",
    email: "manjunath.gowda@cymi.edu",
    experience: 11,
    assignedVehicleId: null,
    joiningDate: "2018-05-22",
    status: "Active",
  },
  {
    id: 12,
    name: "Shivakumar B",
    licenseNumber: "KA12-20130055",
    phone: "9845023491",
    email: "shivakumar.b@cymi.edu",
    experience: 22,
    assignedVehicleId: 11,
    joiningDate: "2013-10-30",
    status: "Active",
  },
];

// ─── Vehicles Data ────────────────────────────────────────────────────────────

export const VEHICLES: Vehicle[] = [
  {
    id: 1,
    busNumber: "BUS-001",
    model: "Tata Starbus 54",
    capacity: 54,
    fuelType: "Diesel",
    regNumber: "KA01-F-3421",
    driverId: 1,
    status: "Active",
    lastService: "2025-11-15",
  },
  {
    id: 2,
    busNumber: "BUS-002",
    model: "Ashok Leyland Viking",
    capacity: 48,
    fuelType: "Diesel",
    regNumber: "KA01-F-3422",
    driverId: 2,
    status: "Active",
    lastService: "2025-10-20",
  },
  {
    id: 3,
    busNumber: "BUS-003",
    model: "Tata Starbus 40",
    capacity: 40,
    fuelType: "CNG",
    regNumber: "KA02-G-1234",
    driverId: 3,
    status: "Active",
    lastService: "2025-12-01",
  },
  {
    id: 4,
    busNumber: "BUS-004",
    model: "Eicher Skyline",
    capacity: 52,
    fuelType: "Diesel",
    regNumber: "KA02-G-1235",
    driverId: 4,
    status: "Active",
    lastService: "2025-09-28",
  },
  {
    id: 5,
    busNumber: "BUS-005",
    model: "Ashok Leyland Falcon",
    capacity: 45,
    fuelType: "CNG",
    regNumber: "KA03-H-5678",
    driverId: 5,
    status: "Active",
    lastService: "2025-11-05",
  },
  {
    id: 6,
    busNumber: "BUS-006",
    model: "Tata Marcopolo",
    capacity: 50,
    fuelType: "Diesel",
    regNumber: "KA03-H-5679",
    driverId: 6,
    status: "Active",
    lastService: "2025-10-10",
  },
  {
    id: 7,
    busNumber: "BUS-007",
    model: "Force Traveller 26",
    capacity: 26,
    fuelType: "Diesel",
    regNumber: "KA04-J-2345",
    driverId: 7,
    status: "Active",
    lastService: "2025-12-10",
  },
  {
    id: 8,
    busNumber: "BUS-008",
    model: "Tata Starbus 54",
    capacity: 54,
    fuelType: "Diesel",
    regNumber: "KA04-J-2346",
    driverId: 8,
    status: "Active",
    lastService: "2025-08-15",
  },
  {
    id: 9,
    busNumber: "BUS-009",
    model: "Eicher Skyline 30",
    capacity: 30,
    fuelType: "CNG",
    regNumber: "KA05-K-6789",
    driverId: 9,
    status: "Maintenance",
    lastService: "2025-07-22",
  },
  {
    id: 10,
    busNumber: "BUS-010",
    model: "Ashok Leyland Viking",
    capacity: 48,
    fuelType: "Diesel",
    regNumber: "KA05-K-6790",
    driverId: 10,
    status: "Active",
    lastService: "2025-11-30",
  },
  {
    id: 11,
    busNumber: "BUS-011",
    model: "Tata Marcopolo Electric",
    capacity: 40,
    fuelType: "Electric",
    regNumber: "KA06-L-3456",
    driverId: 12,
    status: "Active",
    lastService: "2026-01-10",
  },
  {
    id: 12,
    busNumber: "BUS-012",
    model: "Force Traveller 20",
    capacity: 20,
    fuelType: "Diesel",
    regNumber: "KA06-L-3457",
    driverId: null,
    status: "Inactive",
    lastService: "2025-03-12",
  },
  {
    id: 13,
    busNumber: "BUS-013",
    model: "Eicher Skyline 52",
    capacity: 52,
    fuelType: "Diesel",
    regNumber: "KA07-M-7890",
    driverId: null,
    status: "Maintenance",
    lastService: "2025-06-18",
  },
  {
    id: 14,
    busNumber: "BUS-014",
    model: "Tata Starbus 40",
    capacity: 40,
    fuelType: "CNG",
    regNumber: "KA07-M-7891",
    driverId: null,
    status: "Inactive",
    lastService: "2025-04-05",
  },
  {
    id: 15,
    busNumber: "BUS-015",
    model: "Ashok Leyland Falcon 48",
    capacity: 48,
    fuelType: "Diesel",
    regNumber: "KA08-N-9012",
    driverId: null,
    status: "Active",
    lastService: "2026-02-01",
  },
];

// ─── Student Assignments ──────────────────────────────────────────────────────

const STUDENT_NAMES = [
  "Aarav Sharma",
  "Ananya Gupta",
  "Arjun Patel",
  "Anjali Singh",
  "Aditya Kumar",
  "Bhavna Desai",
  "Deepak Verma",
  "Divya Nair",
  "Harsh Joshi",
  "Isha Rao",
  "Karan Mehta",
  "Kavita Iyer",
  "Kunal Shah",
  "Laxmi Pillai",
  "Mahesh Patil",
  "Manisha Tiwari",
  "Nikhil Choudhary",
  "Nisha Banerjee",
  "Om Mishra",
  "Priya Kapoor",
  "Rahul Srivastava",
  "Riya Malhotra",
  "Rohit Agarwal",
  "Sachin Bose",
  "Sagar Ghosh",
  "Sahil Saxena",
  "Simran Kaur",
  "Sneha Jain",
  "Suresh Naidu",
  "Tarun Bhatia",
  "Uday Chandra",
  "Vijay Nambiar",
  "Vikas Murthy",
  "Vinay Hegde",
  "Vishal Reddy",
  "Vivek Krishnan",
  "Yash Gokhale",
  "Yogesh Deshpande",
  "Aisha Khatri",
  "Ankita Kulkarni",
  "Anushka Dubey",
  "Geeta Raghavan",
  "Hina Fatima",
  "Jyoti Pandey",
  "Kajal Thakur",
  "Khushi Aggarwal",
  "Komal Yadav",
  "Madhuri Shinde",
  "Meena Shetty",
  "Meera Varma",
  "Minal Sawant",
  "Pooja Bhatt",
  "Priti Doshi",
  "Radha Subramaniam",
  "Rekha Mukherjee",
  "Roshni Fernandes",
  "Sangeeta Anand",
  "Shruti Bhattacharya",
  "Smita Shirke",
  "Sonal Chouhan",
  "Swati Lotlikar",
  "Tanvi Naik",
  "Tejal Sawant",
  "Uma Pillai",
  "Vandana Tripathi",
  "Vidya Kulkarni",
  "Vineeta Mittal",
  "Deepika Rao",
  "Harsha Gopal",
  "Ishaan Bajaj",
  "Jayesh Solanki",
  "Keerthi Reddy",
  "Lakshman Narayanan",
  "Manav Bhardwaj",
  "Naveen Kumar",
  "Nilesh Marathe",
  "Piyush Salvi",
  "Prasad Wankhede",
  "Raj Tiwari",
  "Rajesh Chavan",
  "Rakesh Soni",
  "Ram Prasad",
  "Ramesh Sathe",
  "Ravi Shankar",
  "Ritesh Kadam",
  "Sandeep Mane",
  "Sanjay Pawar",
  "Shivam Bhandari",
  "Tushar Apte",
  "Vinayak Joshi",
  "Akash Deshpande",
  "Amol Kulkarni",
  "Chetan Bhalerao",
  "Dhananjay Wagh",
  "Ganesh More",
  "Girish Talekar",
  "Hemant Jadhav",
  "Jitendra Dhende",
];

function getGrade(idx: number): number {
  return (idx % 12) + 1;
}

function getSection(idx: number): string {
  return ["A", "B", "C", "D"][idx % 4];
}

function getRouteId(idx: number): number {
  return (idx % 10) + 1;
}

export const STUDENT_ASSIGNMENTS: StudentAssignment[] = STUDENT_NAMES.map(
  (name, idx) => {
    const routeId = getRouteId(idx);
    const route = ROUTES[routeId - 1];
    const vehicleId = routeId <= 10 ? routeId : 1;
    const vehicle = VEHICLES[vehicleId - 1];
    const stopIdx = idx % route.stops.length;
    const stop = route.stops[stopIdx];

    // Calculate drop time ~1hr after pickup
    const [h, m] = stop.time.split(":").map(Number);
    const dropH = h + 1;
    const dropTime = `${String(dropH).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

    return {
      id: idx + 1,
      studentId: idx + 1,
      studentName: name,
      grade: getGrade(idx),
      section: getSection(idx),
      routeId,
      routeName: route.routeName,
      vehicleId,
      busNumber: vehicle.busNumber,
      pickupPoint: stop.name,
      pickupTime: stop.time,
      dropTime,
    };
  },
);
