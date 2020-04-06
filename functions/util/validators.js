const isEmail = email => {
  const regEx = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]+$/;
  return regEx.test(String(email).toLowerCase());
};

const empty = string => {
  if (String(string).trim() === "") return true;
  else return false;
};

exports.validateSignupData = (newUser) => {
  let errors = {};

  if (empty(newUser.email)) errors.email = "Must not be empty";
  else if (!isEmail(newUser.email)) errors.email = "must be a valid email ";
  if (empty(newUser.passwd)) errors.passwd = "Must not be empty";
  if (newUser.passwd !== newUser.confPasswd) errors.confpasswd = "Passwd do not match";
  if (empty(newUser.handle)) errors.handle = "Must not be empty";
  if (empty(newUser.branch)) errors.branch = "Must not be empty";
  if (empty(newUser.phoneNo)) errors.phoneNo = "Must not be empty";
  if (empty(newUser.sem)) errors.sem = "Must not be empty";

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false
  };
};

exports.validateLoginData = (loginDetails)=>{
    let errors = {};
    if (empty(loginDetails.username)) errors.email = "Must not be empty";
    else if (!isEmail(loginDetails.username)) errors.email = "must be a valid email";
    if (empty(loginDetails.passwd)) errors.passwd = "Must not be empty";    
    return{
        errors,
        valid:(Object.keys(errors).length === 0)?true:false
    }
}