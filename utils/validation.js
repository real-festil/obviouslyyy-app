export const required = (value) => (value ? undefined : `Required field`);

export const minLength = (min) => (value) =>
  value.length >= min ? undefined : `Should be longer than ${min} symbols`;

export const composeValidators =
  (...validators) =>
  (value) =>
    validators.reduce(
      (error, validator) => error || validator(value),
      undefined,
    );
