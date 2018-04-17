import React, { Component } from "react";
import { Button, Form, FormGroup, Label, Input } from "reactstrap";
import { graphql, compose } from "react-apollo";
import { withRouter } from "next/router";

import Layout from "../components/layouts/Main";

import redirect from "../lib/redirect";

import withData from "../lib/withData";
import SIGN_IN from "../src/graphql/mutations/signIn";
import UPDATE_JWT from "../src/graphql/mutations/client/updateJwt";

class Login extends Component {
  state = {
    email: "",
    password: ""
  };

  doSignIn = async e => {
    e.preventDefault();
    const {
      signIn,
      updateJwt,
      router: { query }
    } = this.props;
    const { email, password } = this.state;

    const {
      data: {
        signIn: { jwt }
      }
    } = await signIn({
      variables: {
        email,
        password
      }
    });

    const result = await updateJwt({
      variables: {
        token: jwt
      }
    });

    if (query.from) {
      redirect({}, query.from);
    } else {
      redirect({}, "/");
    }
  };
  render() {
    const { email, password } = this.state;

    return (
      <Layout>
        <div className="alert alert-danger">
          <h1>Login</h1>
          <Form inline onSubmit={this.doSignIn}>
            <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
              <Label for="exampleEmail" className="mr-sm-2">
                Email
              </Label>
              <Input
                type="email"
                name="email"
                id="exampleEmail"
                placeholder="something@idk.cool"
                value={email}
                onChange={({ target: { value } }) =>
                  this.setState({ email: value })
                }
              />
            </FormGroup>
            <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
              <Label for="examplePassword" className="mr-sm-2">
                Password
              </Label>
              <Input
                type="password"
                name="password"
                id="examplePassword"
                placeholder="don't tell!"
                value={password}
                onChange={({ target: { value } }) =>
                  this.setState({ password: value })
                }
              />
            </FormGroup>
            <Button>Submit</Button>
          </Form>
        </div>
      </Layout>
    );
  }
}

export default withRouter(
  withData(
    compose(
      graphql(SIGN_IN, {
        name: "signIn"
      }),
      graphql(UPDATE_JWT, {
        name: "updateJwt"
      })
    )(Login)
  )
);
