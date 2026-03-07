import Nat "mo:core/Nat";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

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

  let demiUsers = Map.empty<Nat, DemiUser>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  
  // Username to Principal mapping for login
  let userCredentials = Map.empty<Text, (Principal, Text)>(); // username -> (principal, password)
  let sessionTokens = Map.empty<Text, Principal>(); // token -> principal

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
    sessionTokens.remove(token);
  };

  public query func validateToken(token : Text) : async ?Principal {
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

    var studentCount = 0;
    var teacherCount = 0;

    for ((_, profile) in userProfiles.entries()) {
      switch (profile.schoolRole) {
        case (#Student) { studentCount += 1 };
        case (#Teacher) { teacherCount += 1 };
        case (#Admin) { /* don't count admins */ };
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

  // Seed demo users (called during initialization)
  public shared ({ caller }) func seedDemoUsers() : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can seed demo users");
    };

    // Note: In a real implementation, you would create actual principals
    // For demo purposes, we're using placeholder principals
    // These would need to be replaced with actual principal IDs
    
    // This is a simplified version - actual implementation would require
    // proper principal management and password hashing
  };
};
