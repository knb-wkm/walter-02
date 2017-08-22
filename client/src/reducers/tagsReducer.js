const initialState = [];

const tagsReducer = (state = initialState, action) => {
  switch ( action.type ) {
  case "INIT_TAGS":
    return action.tags;
  default:
    return state;
  }
};

export default tagsReducer;