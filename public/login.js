const initialScreen = document.getElementById('initialScreen');
const registerScreen = document.getElementById('registerScreen');
const signUpBtn = document.getElementById('signUpButton');
const registerBackBtn = document.getElementById('registerBackButton');
const registerBtn = document.getElementById('registerButton');
const loginBtn = document.getElementById('loginButton');

signUpBtn.addEventListener('click', showHideRegisterScreen);
registerBackBtn.addEventListener('click', showHideRegisterScreen);

function showHideRegisterScreen() {
    initialScreen.classList.toggle('hidden');
    registerScreen.classList.toggle('hidden');
}

let validationEngine = (id, regex, message) => {
    let element = document.querySelector(id);
  if (!regex.test(element.value)) {
    if (!element.classList.contains("error")) {
      let errorMsg = document.createElement("p");
      errorMsg.classList.add("error-msg");
      errorMsg.textContent = message;
      element.after(errorMsg);
      element.classList.add("error");
    }
    
    return false;
  } else {
    if (element.classList.contains("error")) {
      element.nextSibling.remove();
      element.classList.replace("error", "success");
    }

    return true;
  }
}

registerBtn.addEventListener('click', (e) => {
  e.preventDefault();
  registerBtn.disabled = true;
  
  // username
  let usernameValidation = validationEngine("#registerUsernameInput", /^[a-zA-Z0-9]+$/, "Username can only contain letters and numbers.");

  // password
  let passwordValidation = validationEngine("#registerPasswordInput", /^(?=.*[A-Z])(?=.*[a-z])[A-Za-z\d!@#$%^&*_+=,.<>?;:'"-]{8,}$/, "Password must be at least 8 characters long and contain at least one uppercase and one lowercase letter.");
    
  // first name
  let firstnameValidation = validationEngine("#firstNameInput", /^[a-zA-Z]+$/, "First Name can only contain letters.");
  
  // last name
  let lastnameValidation = validationEngine("#lastNameInput", /^[a-zA-Z]+$/, "Last Name can only contain letters.");

  if (usernameValidation && passwordValidation && firstnameValidation && lastnameValidation) {
    document.getElementById('register-form').submit();
  } else {
    registerBtn.disabled = false;
  }
});