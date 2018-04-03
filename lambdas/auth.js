'use strict';

// This is a very bad authentication implementation, but this is a fucking hackathon.

const AWS = require("aws-sdk");
const userPassRegExp = /^([^:]*):(.*)$/;

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const Credentials = function(email, pass) {
  this.email = email;
  this.pass = pass;
}

exports.handler = (event, context, callback, config) => {
  const token = event.authorizationToken;
  const user = userFromBasicAuthString(token);
  console.log(user);
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: {
      email: {
        "S": user.email
      },
      password: {
        "S": user.password
      }
    }
  };

  docClient.getItem(params, (err, data) => {
    console.log(err);
    if (err) { context.fail("Unauthorized"); }
    // The user
    console.log(data);
    const user = data;
    if (!user) { context.fail("Unauthorized"); }

    context.succeed(user);
  });
};

const userFromBasicAuthString = (header) => {
  if (!header) return null;
  const user = userPassRegExp.exec(decodeBase64(header));

  if (!user) {
    console.log("No user password provided");
    return null;
  }

  return new Credentials(user[1], user[2]);
}

const decodeBase64 = (str) => {
  return new Buffer(str, 'base64').toString();
}