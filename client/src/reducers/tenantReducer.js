const initialState = {
  name: null,
  dirId: null
};

const tenantReducer = (state = initialState, action) => {
  switch ( action.type ) {
  case "PUT_TENANT":
    return {...state, name: action.name, dirId: action.dirId};
  default:
    return state;
  }
};

export default tenantReducer;