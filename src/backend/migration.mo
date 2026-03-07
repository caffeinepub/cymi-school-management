import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Text "mo:core/Text";

module {
  type UserRole = {
    #admin;
    #user;
    #guest;
  };

  type SchoolRole = {
    #Admin;
    #Teacher;
    #Student;
  };

  type UserProfile = {
    username : Text;
    firstName : Text;
    lastName : Text;
    schoolRole : SchoolRole;
  };

  type DemiUser = {
    id : Nat;
    firstName : Text;
    lastName : Text;
    role : UserRole;
  };

  type OldActor = {
    demiUsers : Map.Map<Nat, DemiUser>;
    userProfiles : Map.Map<Principal, UserProfile>;
    userCredentials : Map.Map<Text, (Principal, Text)>;
    sessionTokens : Map.Map<Text, Principal>;
  };

  type Student = {
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

  type NewActor = {
    demiUsers : Map.Map<Nat, DemiUser>;
    userProfiles : Map.Map<Principal, UserProfile>;
    userCredentials : Map.Map<Text, (Principal, Text)>;
    sessionTokens : Map.Map<Text, Principal>;
    students : Map.Map<Nat, Student>;
    isStudentSeeded : Bool;
  };

  public func run(old : OldActor) : NewActor {
    {
      demiUsers = old.demiUsers;
      userProfiles = old.userProfiles;
      userCredentials = old.userCredentials;
      sessionTokens = old.sessionTokens;
      students = Map.empty<Nat, Student>();
      isStudentSeeded = false;
    };
  };
};
