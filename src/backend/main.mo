import Nat "mo:core/Nat";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Migration "migration";

(with migration = Migration.run)
actor {
  type UserRole = AccessControl.UserRole;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Custom role type for school system
  public type SchoolRole = {
    #Admin;
    #Teacher;
    #Student;
  };

  public type UserProfile = {
    username : Text;
    firstName : Text;
    lastName : Text;
    schoolRole : SchoolRole;
  };

  public type DemiUser = {
    id : Nat;
    firstName : Text;
    lastName : Text;
    role : UserRole;
  };

  public type Student = {
    id : Nat;
    admissionNo : Text;
    firstName : Text;
    lastName : Text;
    grade : Nat;
    section : Text;
    gender : Text;
    dob : Text;
    phone : Text;
    parentName : Text;
    parentPhone : Text;
    email : Text;
    address : Text;
    feeStatus : Text;
    attendancePct : Nat;
    joinDate : Text;
  };

  module DemiUser {
    public func create(id : Nat, firstName : Text, lastName : Text, role : UserRole) : DemiUser {
      {
        id;
        firstName;
        lastName;
        role;
      };
    };
  };

  let students = Map.empty<Nat, Student>();
  let demiUsers = Map.empty<Nat, DemiUser>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Username to Principal mapping for login
  let userCredentials = Map.empty<Text, (Principal, Text)>(); // username -> (principal, password)
  let sessionTokens = Map.empty<Text, Principal>(); // token -> principal

  var isStudentSeeded = false;

  // User profile management (required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Authentication functions
  public shared ({ caller }) func login(username : Text, password : Text) : async ?Text {
    // Login is accessible to guests (anonymous users)
    switch (userCredentials.get(username)) {
      case (null) { null };
      case (?(principal, storedPassword)) {
        if (password == storedPassword) {
          // Generate simple token (in production, use proper token generation)
          let token = username # "-" # principal.toText();
          sessionTokens.add(token, principal);
          ?token;
        } else {
          null;
        };
      };
    };
  };

  public shared ({ caller }) func logout(token : Text) : async () {
    // Verify the caller owns the token being logged out
    switch (sessionTokens.get(token)) {
      case (null) {
        // Token doesn't exist, silently succeed
      };
      case (?principal) {
        if (caller != principal) {
          Runtime.trap("Unauthorized: Can only logout your own session");
        };
        sessionTokens.remove(token);
      };
    };
  };

  public query func validateToken(token : Text) : async ?Principal {
    // Public query for token validation
    sessionTokens.get(token);
  };

  // Dashboard data - requires authentication
  public query ({ caller }) func getDashboardStats() : async {
    totalStudents : Nat;
    totalTeachers : Nat;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view dashboard");
    };

    // Use students map size for student count
    let studentCount = students.size();

    var teacherCount = 0;
    for ((_, profile) in userProfiles.entries()) {
      switch (profile.schoolRole) {
        case (#Teacher) { teacherCount += 1 };
        case (#Admin) { /* don't count admins */ };
        case (#Student) { /* already counted */ };
      };
    };

    {
      totalStudents = studentCount;
      totalTeachers = teacherCount;
    };
  };

  // DemiUser management functions
  public shared ({ caller }) func addDemiUser(id : Nat, firstName : Text, lastName : Text, role : UserRole) : async DemiUser {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can add users");
    };
    let demiUser = DemiUser.create(id, firstName, lastName, role);
    demiUsers.add(id, demiUser);
    demiUser;
  };

  public query ({ caller }) func getDemiUserById(id : Nat) : async ?DemiUser {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view user data");
    };
    demiUsers.get(id);
  };

  public query ({ caller }) func totalDemiUsers() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view statistics");
    };
    demiUsers.size();
  };

  public shared ({ caller }) func updateDemiUser(id : Nat, firstName : Text, lastName : Text, role : UserRole) : async DemiUser {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update users");
    };

    switch (demiUsers.get(id)) {
      case (null) {
        Runtime.trap("Demi user does not exist");
      };
      case (?_) {
        let updatedDemiUser = DemiUser.create(id, firstName, lastName, role);
        demiUsers.add(id, updatedDemiUser);
        updatedDemiUser;
      };
    };
  };

  public shared ({ caller }) func removeDemiUser(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can remove users");
    };

    switch (demiUsers.get(id)) {
      case (null) {
        Runtime.trap("Demi user does not exist");
      };
      case (?_) {
        demiUsers.remove(id);
      };
    };
  };

  // Student Management System
  public shared ({ caller }) func addStudent(student : Student) : async Student {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can add students");
    };
    students.add(student.id, student);
    student;
  };

  public query ({ caller }) func getStudentById(id : Nat) : async ?Student {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view student data");
    };
    students.get(id);
  };

  public query ({ caller }) func getAllStudents() : async [Student] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view student data");
    };
    let iter = students.values();
    let studentsArray = iter.toArray();
    studentsArray;
  };

  public shared ({ caller }) func updateStudent(student : Student) : async Student {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update students");
    };

    switch (students.get(student.id)) {
      case (null) {
        Runtime.trap("Student does not exist");
      };
      case (?_) {
        students.add(student.id, student);
        student;
      };
    };
  };

  public shared ({ caller }) func deleteStudent(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete students");
    };

    switch (students.get(id)) {
      case (null) {
        Runtime.trap("Student does not exist");
      };
      case (?_) {
        students.remove(id);
      };
    };
  };

  public query ({ caller }) func getStudentCount() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view student statistics");
    };
    students.size();
  };

  // Seed students function
  public shared ({ caller }) func seedStudents(studentSeed : [Student]) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can seed students");
    };

    if (isStudentSeeded) {
      Runtime.trap("Students already seeded");
    };

    for (seedStudent in studentSeed.values()) {
      students.add(seedStudent.id, seedStudent);
    };

    isStudentSeeded := true;
  };

  // Seed demo users (called during initialization)
  public shared ({ caller }) func seedDemoUsers() : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can seed demo users");
    };

    // This is a simplified version - actual implementation would require
    // proper principal management and password hashing
  };
};
