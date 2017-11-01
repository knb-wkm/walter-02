import * as actionTypes from "../actionTypes";

export const loadingStart = () => ({
  type: actionTypes.LOADING_START
});

export const loadingEnd = () => ({
  type: actionTypes.LOADING_END
});

export const triggerSnackbar = (message) => ({
  type: actionTypes.TRIGGER_SNACK, message
});

export const closeSnackbar = () => ({
  type: actionTypes.CLOSE_SNACK
});

export const initSnackbar = (message) => ({
  type: actionTypes.INIT_SNACK, message
});

export const openException = (name, message) => ({
  type: actionTypes.OPEN_EXCEPTION, name, message
});

export const closeException = () => ({
  type: actionTypes.CLOSE_EXCEPTION
});

export const initException = (name, message) => ({
  type: actionTypes.INIT_EXCEPTION, name, message
});
