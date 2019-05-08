import React, { Component } from "react";
import PropTypes from "prop-types";

import Select, { components }  from 'react-select';
import Chip from 'material-ui/Chip';

const KEY_CODE_ENTER = 13

class MultipleAutoComplete extends Component {
  componentDidUpdate(prevProps, nextProps) {
    if(prevProps.items.length !== this.props.items.length || prevProps.items[0].value !== this.props.items[0].value ){
      this.props.execSearch();
    }
  }
  render() {
    console.log(this.props.items);
    const { item, dataSource, execSearch, appendSearchValue } = this.props;
    return (
      <Select
        isMulti
        options={dataSource}
        components={{
          MultiValue
        }}
        onKeyDown={e => (e.keyCode === KEY_CODE_ENTER) && execSearch()}
        onChange={selectedValues => {
          const value = selectedValues.map(v => v.value).join(" ");
          value !== "" && appendSearchValue(item, value);
        }}
        styles={{
          container: base => ({
            ...base,
            alignSelf: 'flex-end',
            paddingBottom: 8,
          }),
          control: base => ({
            ...base,
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            borderRadius: 'unset',
            boxShadow: 'none',
          }),
          valueContainer: base => ({
            ...base,
            width: 256,
          }),
        }}
     />
    );
  }
}




const MultiValue = ({ children, removeProps, data }) => {
  return (
    <Chip onRequestDelete={removeProps.onClick} labelStyle={{ paddingLeft:5 }}>
      {data.avatar}
      {children}
    </Chip>
  )
}


MultipleAutoComplete.propTypes = {
  item: PropTypes.object,
  dataSource: PropTypes.array,
  execSearch: PropTypes.func,
  appendSearchValue: PropTypes.func,
};

export default MultipleAutoComplete;
