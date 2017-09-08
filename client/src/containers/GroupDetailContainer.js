import React, { Component } from "react";

// store
import { connect } from "react-redux";

// material
import FlatButton from 'material-ui/FlatButton';
import AutoComplete from "material-ui/AutoComplete";
import MenuItem from "material-ui/MenuItem";
import SocialPerson from "material-ui/svg-icons/social/person";
import Chip from 'material-ui/Chip';

import { 
  Card, 
  CardTitle, 
  CardText, 
  CardActions
} from 'material-ui/Card';

// components
import NavigationContainer from "./NavigationContainer";
import GroupDetailBasic from "../components/Group/GroupDetailBasic";
import TitleWithGoBack from "../components/Common/TitleWithGoBack";

// actions
import {
  requestFetchGroup,
  requestFetchUsers,
  addGroupOfUser,
  deleteGroupOfUser,
  changeGroupName,
  changeGroupDescription,
  saveGroupName,
  saveGroupDescription,
  deleteGroup
} from "../actions";

class GroupDetailContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {
        text: ""
      }
    };
  }

  componentWillMount() {
    this.props.requestFetchGroup(this.props.match.params.id);
    this.props.requestFetchUsers(this.props.tenant.tenant_id);
  }

  renderBelongsToUsers = () => {
    return this.props.group.belongs_to.map( (user, idx) => {
      return (
        <Chip 
          key={idx}
          style={{ marginRight: 10 }}
          onRequestDelete={() => {
            this.props.deleteGroupOfUser(user._id, this.props.group._id);
          }} >
          {user.name}
        </Chip>
      );
    });
  };

  render() {
    const users = this.props.users.filter( user => {
      return !this.props.group.belongs_to
        .map( _user => _user._id )
        .includes( user._id );
    }).map( user => {
      const _id = user._id;
      const text = user.name;
      const value = (
        <MenuItem 
          primaryText={user.name}
          leftIcon={<SocialPerson />} />
      );

      return { _id, text, value };
    });

    const title = `${this.props.group.name}グループの詳細`;

    return (
      <div>
        <NavigationContainer />

        <Card>
          <CardTitle title={<TitleWithGoBack title={title} />} />
          <CardText>

            <div style={{ display: "flex" }}>
              <Card style={{ width: "35%", marginRight: 20 }}>
                <CardTitle subtitle="基本情報" />
                <CardText>
                  <GroupDetailBasic {...this.props} />
                </CardText>
              </Card>

              <Card style={{ width: "35%"}} >
                <CardTitle subtitle="所属ユーザ" />
                <CardText>
                  <div style={{ display: "flex" }}>
                    {this.renderBelongsToUsers()}
                  </div>

                  <AutoComplete
                    floatingLabelText="ユーザ名"
                    searchText={this.state.user.text}
                    onTouchTap={() => this.setState({ user: { text: "" }})}
                    onNewRequest={(user) => {
                      this.props.addGroupOfUser(user._id, this.props.group._id);
                      this.setState({ user: { text: "" }});
                    }}
                    openOnFocus={true}
                    filter={ (text, key) => key.indexOf(text) !== -1 }
                    dataSource={users}
                    />
                </CardText>
              </Card>
            </div>

          </CardText>
          <CardActions>
            <FlatButton label="閉じる" primary={true} href="/groups" />
            <FlatButton
              label="削除"
              secondary={true}
              onTouchTap={() => this.props.deleteGroup(this.props.group._id)} />
          </CardActions>
        </Card>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    group: state.group.data,
    changedGroup: state.group.changed,
    validationErrors: state.group.errors,
    tenant: state.tenant,
    users: state.users
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  requestFetchGroup: (group_id) => dispatch(requestFetchGroup(group_id)),
  requestFetchUsers: (tenant_id) => dispatch(requestFetchUsers(tenant_id)),
  addGroupOfUser: (user_id, group_id) => dispatch(addGroupOfUser(user_id, group_id)),
  deleteGroupOfUser: (user_id, group_id) => dispatch(deleteGroupOfUser(user_id, group_id)),
  changeGroupName: (name) => dispatch(changeGroupName(name)),
  changeGroupDescription: (description) => dispatch(changeGroupDescription(description)),
  saveGroupName: (group) => dispatch(saveGroupName(group)),
  saveGroupDescription: (group) => dispatch(saveGroupDescription(group)),
  deleteGroup: (group_id) => dispatch(deleteGroup(group_id, ownProps.history))
});

GroupDetailContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(GroupDetailContainer);

export default GroupDetailContainer;
