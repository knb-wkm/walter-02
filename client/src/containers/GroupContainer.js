import React, { Component } from "react";

// store
import { connect } from "react-redux";

// router
import { Link } from "react-router-dom";

// material
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardText, 
  CardMedia, 
  CardActions
} from 'material-ui/Card';

import {
  Table,
  TableBody,
  TableFooter,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';

import Chip from 'material-ui/Chip';
import IconButton from 'material-ui/IconButton';
import ImageEdit from "material-ui/svg-icons/image/edit";

// components
import NavigationContainer from "./NavigationContainer";

// actions
import {
  requestFetchGroups
} from "../actions";

const GroupTableHeader = ({ headers }) => {
  return (
    <TableRow>
      {headers.map( (header, idx) => (
        <TableHeaderColumn key={idx}>{header.name}</TableHeaderColumn>
      ))}
    </TableRow>
  );
};

const GroupTableBody = ({ group, key }) => {

  const renderUser = (user, key) => {
    return (
      <Chip key={key} style={{ marginRight: 10 }}>
        {user.name}
      </Chip>
    );
  };

  return (
    <TableRow>
      <TableRowColumn>{group.name}</TableRowColumn>
      <TableRowColumn>{group.description}</TableRowColumn>
      <TableRowColumn>
        <div style={{ display: "flex" }}>
          {group.belongs_to.map( (user, idx) => renderUser(user, idx) )}
        </div>
      </TableRowColumn>
      <TableRowColumn>
        <IconButton containerElement={<Link to={`/groups/${group._id}`} />}>
          <ImageEdit />
        </IconButton>
      </TableRowColumn>
    </TableRow>
  );
};

class GroupContainer extends Component {
  componentWillMount() {
    this.props.requestFetchGroups(this.props.tenant.tenant_id);
  }

  render() {
    const headers = [
      { name: "表示名" },
      { name: "備考" },
      { name: "ユーザ" },
      { name: "編集" },
    ];

    return (
      <div>
        <NavigationContainer />
        <Card>
          <CardTitle title="グループ管理" />
          <CardText>

            <div>
              <Table>
                <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                  <GroupTableHeader headers={headers} />
                </TableHeader>
                <TableBody displayRowCheckbox={false}>
                  {this.props.groups.map( (group, idx) => {
                    return <GroupTableBody group={group} key={idx} />;
                  })}
                </TableBody>
              </Table>
            </div>

          </CardText>
        </Card>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    groups: state.groups.data,
    tenant: state.tenant
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  requestFetchGroups: (tenant_id) => dispatch(requestFetchGroups(tenant_id))
});

GroupContainer = connect(mapStateToProps, mapDispatchToProps)(GroupContainer);

export default GroupContainer;
