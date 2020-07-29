//jshint esversion:6
var myInput = document.getElementById("psw");
var letter = document.getElementById("letter");
var capital = document.getElementById("capital");
var number = document.getElementById("number");
var length = document.getElementById("length");
var userNameInput = document.getElementById("userNameInput");
var smalluser = document.getElementById("smalluser");
var checklist = false;
var validity = [];

// When the user clicks on the password field, show the message box
myInput.onfocus = function() {
  if(checklist === false){
  document.getElementById("message").style.display = "block";
  document.getElementById("regsubmit").classList.remove("befregsub");
  document.getElementById("regsubmit").classList.add("aftregsub");
}
else {
  document.getElementById("message").style.display = "none";
  document.getElementById("regsubmit").classList.remove("aftregsub");
  document.getElementById("regsubmit").classList.add("befregsub");
}};
// When the user clicks outside of the password field, hide the message box
myInput.onblur = function() {
  document.getElementById("message").style.display = "none";
  document.getElementById("regsubmit").classList.remove("aftregsub");
  document.getElementById("regsubmit").classList.add("befregsub");

};

// When the user starts to type something inside the password field
myInput.onkeyup = function() {

  // Validate lowercase letters
  var lowerCaseLetters = /[a-z]/g;
  if(myInput.value.match(lowerCaseLetters)) {
    letter.classList.remove("invalid");
    letter.classList.add("valid");
  } else {
    letter.classList.remove("valid");
    letter.classList.add("invalid");
  }

  // Validate capital letters
  var upperCaseLetters = /[A-Z]/g;
  if(myInput.value.match(upperCaseLetters)) {
    capital.classList.remove("invalid");
    capital.classList.add("valid");
  } else {
    capital.classList.remove("valid");
    capital.classList.add("invalid");
  }

  // Validate numbers
  var numbers = /[0-9]/g;
  if(myInput.value.match(numbers)) {
    number.classList.remove("invalid");
    number.classList.add("valid");
  } else {
    number.classList.remove("valid");
    number.classList.add("invalid");
  }

  // Validate length
  if(myInput.value.length >= 8) {
    length.classList.remove("invalid");
    length.classList.add("valid");
  } else {
    length.classList.remove("valid");
    length.classList.add("invalid");
  }

  validity = [letter.classList,length.classList,capital.classList,number.classList];
  if((validity[0][0] === "valid") && (validity[1][0] === "valid") && (validity[2][0] === "valid") && (validity[3][0] === "valid")){
    checklist = true;
    document.getElementById("message").style.display = "none";
    document.getElementById("regsubmit").classList.remove("aftregsub");
    document.getElementById("regsubmit").classList.add("befregsub");
  }
  else{
    checklist = false;
    document.getElementById("message").style.display = "block";
    document.getElementById("regsubmit").classList.remove("befregsub");
    document.getElementById("regsubmit").classList.add("aftregsub");
  }
};
