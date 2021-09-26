import React from "react";

import Input from "../../shared/components/FormElements/Input";
import Button from "../../shared/components/FormElements/Button";
import {
  VALIDATOR_REQUIRE,
  VALIDATOR_MINLENGTH,
  VALIDATOR_EMAIL,
  VALIDATOR_MIN,
} from "../../shared/utils/validators";
import { useForm } from "../../shared/hooks/form-hook";
import "../../places/pages/PlaceForm.css";

const Auth = () => {
  const [formState, inputHandler] = useForm(
    {
      firstName: {
        value: "",
        isValid: false,
      },
      lastName: {
        value: "",
        isValid: false,
      },      
      email: {
        value: "",
        isValid: false,
      },
      password: {
        value: "",
        isValid: false,
      }      
    },
    false
  );

  const placeSubmitHandler = (event) => {
    event.preventDefault();
    console.log(formState.inputs); // send this to the backend!
  };

  return (
    <form className="place-form" onSubmit={placeSubmitHandler}>
      <Input
        id="firstName"
        element="input"
        type="text"
        label="first name"
        validators={[VALIDATOR_REQUIRE()]}
        errorText="Please enter a valid email."
        onInput={inputHandler}
      />
      <Input
        id="password"
        element="input"
        type="text"
        label="Password"
        validators={[VALIDATOR_MIN(8)]}
        errorText="Please enter a valid password."
        onInput={inputHandler}
      />
      <Input
        id="email"
        element="input"
        type="text"
        label="Email"
        validators={[VALIDATOR_REQUIRE(), VALIDATOR_EMAIL()]}
        errorText="Please enter a valid email."
        onInput={inputHandler}
      />
      <Input
        id="password"
        element="input"
        type="text"
        label="Password"
        validators={[VALIDATOR_MIN(8)]}
        errorText="Please enter a valid password."
        onInput={inputHandler}
      />      
      <Button type="submit" disabled={!formState.isValid}>
        LOGIN
      </Button>
      <Button to="/signup">
        NOT REGISTER? SIGN UP
      </Button>
    </form>
  );
};

export default Auth;
